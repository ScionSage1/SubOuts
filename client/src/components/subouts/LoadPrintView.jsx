// Generates and opens a print-friendly Bill of Lading / Load Manifest in a new window
export function openPrintView({ subOut, load, loadItems, loadPallets, allPalletItems }) {
  const totalWeight = [...loadItems, ...allPalletItems].reduce(
    (sum, i) => sum + ((i.TeklaWeight != null ? i.TeklaWeight : i.Weight) || 0) * (i.Quantity || 1), 0
  )
  const totalPieces = [...loadItems, ...allPalletItems].reduce(
    (sum, i) => sum + (i.Quantity || 1), 0
  )
  const today = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
  const dirLabel = load.Direction === 'Outbound' ? 'MFC → Sub-Fabricator' : 'Sub-Fabricator → MFC'

  const formatWt = (w) => {
    if (!w && w !== 0) return '-'
    return `${Math.round(parseFloat(w)).toLocaleString()} lbs`
  }

  const html = `<!DOCTYPE html>
<html>
<head>
<title>${load.LoadNumber} - ${subOut.Lot} - Bill of Lading</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: Arial, sans-serif; font-size: 12px; color: #333; padding: 24px; }
  h1 { font-size: 18px; margin-bottom: 4px; }
  h2 { font-size: 14px; margin: 16px 0 8px; border-bottom: 2px solid #333; padding-bottom: 4px; }
  .subtitle { font-size: 13px; color: #666; margin-bottom: 16px; }
  .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px 32px; margin-bottom: 16px; }
  .grid3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px 32px; margin-bottom: 16px; }
  .field { display: flex; gap: 8px; }
  .field-label { font-weight: bold; white-space: nowrap; min-width: 100px; }
  .field-value { color: #333; }
  table { width: 100%; border-collapse: collapse; margin-bottom: 16px; }
  th, td { border: 1px solid #ccc; padding: 4px 8px; text-align: left; }
  th { background: #f5f5f5; font-weight: bold; font-size: 11px; text-transform: uppercase; }
  td { font-size: 11px; }
  .right { text-align: right; }
  .bold { font-weight: bold; }
  .totals-row td { border-top: 2px solid #333; font-weight: bold; background: #f9f9f9; }
  .signatures { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 32px; margin-top: 40px; padding-top: 8px; }
  .sig-line { border-top: 1px solid #333; padding-top: 4px; font-size: 11px; color: #666; }
  .footer { margin-top: 24px; text-align: center; font-size: 10px; color: #999; }
  @media print {
    body { padding: 0; }
    @page { margin: 0.5in; }
  }
</style>
</head>
<body>
  <h1>METALSFAB CORPORATION</h1>
  <div class="subtitle">Bill of Lading / Load Manifest</div>

  <h2>SubOut Information</h2>
  <div class="grid">
    <div class="field"><span class="field-label">Job:</span><span class="field-value">${subOut.JobDescription || subOut.JobCode || '-'}</span></div>
    <div class="field"><span class="field-label">Lot:</span><span class="field-value">${subOut.Lot || '-'}</span></div>
    <div class="field"><span class="field-label">Description:</span><span class="field-value">${subOut.Description || '-'}</span></div>
    <div class="field"><span class="field-label">Vendor:</span><span class="field-value">${subOut.SubFabricator || '-'}</span></div>
  </div>

  <h2>Load Details</h2>
  <div class="grid">
    <div class="field"><span class="field-label">Load Number:</span><span class="field-value">${load.LoadNumber}</span></div>
    <div class="field"><span class="field-label">Direction:</span><span class="field-value">${dirLabel}</span></div>
    <div class="field"><span class="field-label">Status:</span><span class="field-value">${load.Status || '-'}</span></div>
    <div class="field"><span class="field-label">Scheduled:</span><span class="field-value">${load.ScheduledDate ? new Date(load.ScheduledDate).toLocaleDateString('en-US') : '-'}</span></div>
    <div class="field"><span class="field-label">Actual:</span><span class="field-value">${load.ActualDate ? new Date(load.ActualDate).toLocaleDateString('en-US') : '-'}</span></div>
  </div>

  ${(load.TruckCompany || load.TrailerNumber || load.DriverName || load.BOLNumber) ? `
  <h2>Truck Information</h2>
  <div class="grid">
    <div class="field"><span class="field-label">Truck Company:</span><span class="field-value">${load.TruckCompany || '-'}</span></div>
    <div class="field"><span class="field-label">Trailer #:</span><span class="field-value">${load.TrailerNumber || '-'}</span></div>
    <div class="field"><span class="field-label">Driver:</span><span class="field-value">${load.DriverName || '-'}</span></div>
    <div class="field"><span class="field-label">BOL #:</span><span class="field-value">${load.BOLNumber || '-'}</span></div>
  </div>
  ` : ''}

  ${loadItems.length > 0 ? `
  <h2>Items (Direct)</h2>
  <table>
    <thead>
      <tr>
        <th>#</th>
        <th>Shape</th>
        <th>Main Mark</th>
        <th>Piece Mark</th>
        <th>Grade</th>
        <th>Length</th>
        <th>RM#</th>
        <th class="right">Qty</th>
        <th class="right">Weight</th>
      </tr>
    </thead>
    <tbody>
      ${loadItems.map((item, i) => `
      <tr>
        <td>${i + 1}</td>
        <td>${item.Shape || '-'}${item.Dimension ? ' ' + item.Dimension : ''}</td>
        <td>${item.MainMark || '-'}</td>
        <td>${item.PieceMark || '-'}</td>
        <td>${item.Grade || '-'}</td>
        <td>${item.Length || '-'}</td>
        <td>${item.RMNumber || '-'}</td>
        <td class="right">${item.Quantity || 1}</td>
        <td class="right">${formatWt((item.TeklaWeight != null ? item.TeklaWeight : item.Weight) * (item.Quantity || 1))}</td>
      </tr>
      `).join('')}
    </tbody>
  </table>
  ` : ''}

  ${loadPallets.length > 0 ? `
  <h2>Pallets</h2>
  <table>
    <thead>
      <tr>
        <th>Pallet #</th>
        <th>Items</th>
        <th>Dimensions</th>
        <th class="right">Weight</th>
      </tr>
    </thead>
    <tbody>
      ${loadPallets.map(p => {
        const pItems = allPalletItems.filter(i => i.PalletID === p.PalletID)
        const pWeight = pItems.reduce((s, i) => s + ((i.TeklaWeight != null ? i.TeklaWeight : i.Weight) || 0) * (i.Quantity || 1), 0)
        const dims = (p.Length || p.Width || p.Height) ? `${p.Length || 0}" x ${p.Width || 0}" x ${p.Height || 0}"` : '-'
        return `
      <tr>
        <td class="bold">${p.PalletNumber}</td>
        <td>${pItems.length} items (${pItems.reduce((s, i) => s + (i.Quantity || 1), 0)} pcs)</td>
        <td>${dims}</td>
        <td class="right">${formatWt(pWeight)}</td>
      </tr>
        `
      }).join('')}
    </tbody>
  </table>
  ` : ''}

  <h2>Totals</h2>
  <div class="grid3">
    <div class="field"><span class="field-label">Total Weight:</span><span class="field-value bold">${formatWt(totalWeight)}</span></div>
    <div class="field"><span class="field-label">Total Pieces:</span><span class="field-value bold">${totalPieces}</span></div>
    <div class="field"><span class="field-label">Pallets:</span><span class="field-value bold">${loadPallets.length}</span></div>
  </div>

  <div class="signatures">
    <div>
      <div class="sig-line">Loaded By / Date</div>
    </div>
    <div>
      <div class="sig-line">Driver Signature / Date</div>
    </div>
    <div>
      <div class="sig-line">Received By / Date</div>
    </div>
  </div>

  <div class="footer">
    Printed: ${today} &mdash; MetalsFab Corporation &mdash; ${load.LoadNumber}
  </div>

  <script>window.onload = function() { window.print(); }</script>
</body>
</html>`

  const win = window.open('', '_blank')
  if (win) {
    win.document.write(html)
    win.document.close()
  }
}
