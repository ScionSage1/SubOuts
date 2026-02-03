const XLSX = require('xlsx');
const sql = require('mssql');
require('dotenv').config({ path: '../server/.env' });

const config = {
  server: process.env.DB_SERVER || 'Voltron',
  database: process.env.DB_DATABASE || 'MFC_NTLIVE',
  user: process.env.DB_USER || 'sa',
  password: process.env.DB_PASSWORD,
  port: parseInt(process.env.DB_PORT) || 1433,
  options: {
    encrypt: false,
    trustServerCertificate: true
  }
};

// Excel date serial to JS Date
function excelDateToJSDate(serial) {
  if (!serial || typeof serial !== 'number') return null;
  const utc_days = Math.floor(serial - 25569);
  const date = new Date(utc_days * 86400 * 1000);
  return date.toISOString().split('T')[0];
}

// Clean up size value
function normalizeSize(size) {
  if (!size) return null;
  const s = size.trim();
  // Normalize variations
  if (s.toLowerCase().includes('mega') && s.toLowerCase().includes('many')) return 'Mega - many shops';
  if (s.toLowerCase().includes('mega')) return 'Mega';
  if (s.toLowerCase().includes('large') && s.toLowerCase().includes('many')) return 'Large - many shops';
  if (s.toLowerCase().includes('large')) return 'Large';
  if (s.toLowerCase().includes('medium')) return 'Medium';
  if (s.toLowerCase().includes('small')) return 'Small';
  return null;
}

// Clean email - remove extra chars
function cleanEmail(email) {
  if (!email) return null;
  // Extract just the email if it has extra text
  const match = email.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
  return match ? match[0] : email.replace(/[<>;]/g, '').trim();
}

// Skip these "rows" that aren't real fabricators
const skipNames = [
  'called/emailed waiting to hear',
  'no work to sub out right now',
  'to call',
  ''
];

async function importFabricators() {
  const workbook = XLSX.readFile('../Sub Fabricator List_.xlsx');
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const data = XLSX.utils.sheet_to_json(sheet, { defval: '' });

  // Filter valid fabricators
  const fabricators = data.filter(row => {
    const name = (row['Fabricator'] || '').trim().toLowerCase();
    return name && !skipNames.includes(name);
  });

  console.log(`Found ${fabricators.length} fabricators to import`);

  let pool;
  try {
    pool = await sql.connect(config);
    console.log('Connected to database');

    // Clear existing data first
    await pool.request().query('DELETE FROM FabTracker.SubOutVendors');
    console.log('Cleared existing vendors');

    let inserted = 0;
    for (const fab of fabricators) {
      const name = (fab['Fabricator'] || '').trim();
      if (!name) continue;

      const city = (fab['City'] || '').trim() || null;
      const state = (fab['State'] || '').trim() || null;
      const size = normalizeSize(fab['Small, Medium, Large, Mega?']);
      const contact = (fab['Contact'] || '').trim() || null;
      const aiscBoard = (fab['AISC Board?'] || '').toUpperCase() === 'Y' ? 1 : 0;
      const mfcOutreach = (fab['MFC Outreach'] || '').trim() || null;
      const email = cleanEmail(fab['Email']);
      const phone = (fab['Phone'] || '').toString().trim() || null;
      const notes = (fab['Notes'] || '').trim() || null;

      // Handle date - could be serial number or string
      let lastContactDate = null;
      const dateVal = fab['Last Contact Date'];
      if (typeof dateVal === 'number') {
        lastContactDate = excelDateToJSDate(dateVal);
      } else if (typeof dateVal === 'string' && dateVal.match(/^\d{1,2}\/\d{1,2}\/\d{2,4}/)) {
        // Parse MM/DD/YY format
        const parts = dateVal.split('/');
        if (parts.length >= 3) {
          let year = parseInt(parts[2]);
          if (year < 100) year += 2000;
          lastContactDate = `${year}-${parts[0].padStart(2, '0')}-${parts[1].padStart(2, '0')}`;
        }
      }

      try {
        await pool.request()
          .input('vendorName', sql.NVarChar, name)
          .input('city', sql.NVarChar, city)
          .input('state', sql.NVarChar, state)
          .input('size', sql.NVarChar, size)
          .input('contactName', sql.NVarChar, contact)
          .input('aiscBoard', sql.Bit, aiscBoard)
          .input('mfcOutreach', sql.NVarChar, mfcOutreach)
          .input('email', sql.NVarChar, email)
          .input('phone', sql.NVarChar, phone)
          .input('lastContactDate', sql.Date, lastContactDate)
          .input('notes', sql.NVarChar, notes)
          .query(`
            INSERT INTO FabTracker.SubOutVendors
            (VendorName, City, State, Size, ContactName, AISCBoard, MFCOutreach, Email, Phone, LastContactDate, Notes, IsActive)
            VALUES
            (@vendorName, @city, @state, @size, @contactName, @aiscBoard, @mfcOutreach, @email, @phone, @lastContactDate, @notes, 1)
          `);
        inserted++;
        console.log(`  ✓ ${name}`);
      } catch (err) {
        console.error(`  ✗ ${name}: ${err.message}`);
      }
    }

    console.log(`\nImported ${inserted} fabricators successfully`);

  } catch (err) {
    console.error('Database error:', err);
  } finally {
    if (pool) await pool.close();
  }
}

importFabricators();
