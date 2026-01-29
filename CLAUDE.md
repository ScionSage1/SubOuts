# SubOuts - MFC Sub Fabrication Tracker

## Project Overview

SubOuts is an internal web application for MetalsFab Corporation (MFC) to track fabrication work sent to outside sub-fabricators.

## Tech Stack

- **Frontend**: React 18.2, Vite 5.0, TailwindCSS 3.4, React Router 6.21, TanStack Query 5.17, Axios 1.6, Lucide React 0.303, clsx 2.1
- **Backend**: Node.js 18+, Express 4.18, mssql 10.0, CORS 2.8, dotenv 16.3
- **Database**: SQL Server on "Voltron"

## Project Structure

```
D:\Claude\SubOuts\
├── client/                          # React frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/              # Reusable UI components
│   │   │   │   ├── Badge.jsx
│   │   │   │   ├── Button.jsx
│   │   │   │   ├── Card.jsx
│   │   │   │   ├── DatePicker.jsx
│   │   │   │   ├── Input.jsx
│   │   │   │   ├── LoadingSpinner.jsx
│   │   │   │   ├── Modal.jsx
│   │   │   │   ├── Select.jsx
│   │   │   │   └── StatusBadge.jsx
│   │   │   ├── subouts/             # SubOut-specific components
│   │   │   │   ├── ItemPicker.jsx
│   │   │   │   ├── ItemsTable.jsx
│   │   │   │   ├── JobGroup.jsx
│   │   │   │   ├── SubOutCard.jsx
│   │   │   │   ├── SubOutDetail.jsx
│   │   │   │   ├── SubOutForm.jsx
│   │   │   │   └── VendorSelect.jsx
│   │   │   └── layout/              # Layout components
│   │   │       ├── Header.jsx
│   │   │       ├── Sidebar.jsx
│   │   │       └── Footer.jsx
│   │   ├── context/
│   │   │   └── AppContext.jsx       # Global state (sidebar, view mode)
│   │   ├── hooks/                   # Custom React Query hooks
│   │   │   ├── useSubOuts.js
│   │   │   ├── useSubOutItems.js
│   │   │   ├── useVendors.js
│   │   │   ├── useJobs.js
│   │   │   ├── useCutlists.js
│   │   │   └── useDashboard.js
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx
│   │   │   ├── SubOutsListPage.jsx
│   │   │   ├── SubOutDetailPage.jsx
│   │   │   ├── NewSubOutPage.jsx
│   │   │   ├── EditSubOutPage.jsx
│   │   │   ├── VendorsPage.jsx
│   │   │   ├── JobView.jsx
│   │   │   └── Settings.jsx
│   │   ├── services/
│   │   │   └── api.js               # Axios instance & API wrappers
│   │   ├── utils/
│   │   │   ├── formatters.js        # Date, weight, number formatters
│   │   │   └── statusColors.js      # Status color definitions
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── package.json
├── server/                          # Express backend
│   ├── config/
│   │   └── database.js              # SQL Server connection pool
│   ├── controllers/
│   │   ├── subOutController.js
│   │   ├── subOutItemController.js
│   │   ├── vendorController.js
│   │   ├── jobController.js
│   │   ├── cutlistController.js
│   │   └── dashboardController.js
│   ├── routes/
│   │   ├── subouts.js
│   │   ├── items.js
│   │   ├── vendors.js
│   │   ├── jobs.js
│   │   ├── cutlists.js
│   │   └── dashboard.js
│   ├── middleware/
│   │   └── errorHandler.js          # Async wrapper & error handling
│   ├── server.js
│   └── package.json
├── database/
│   ├── schema.sql                   # Tables, indexes, views
│   └── seed.sql                     # Default vendors
├── CHANGELOG.md                     # Project changelog (see below)
└── CLAUDE.md
```

## Development Commands

```bash
# Install dependencies
cd client && npm install
cd server && npm install

# Frontend development (port 4000, proxies API calls to 4001)
cd client && npm run dev

# Backend development (port 4001, or PORT env var)
cd server && npm run dev

# Build for production
cd client && npm run build
```

## Environment Setup

Create `server/.env`:
```
DB_SERVER=Voltron
DB_DATABASE=MFC_NTLIVE
DB_USER=sa
DB_PASSWORD=your_password
DB_PORT=1433
DB_ENCRYPT=false
DB_TRUST_CERTIFICATE=false
DB_PERSIST_SECURITY_INFO=true
PORT=4001
NODE_ENV=development
CORS_ORIGIN=http://localhost:4000
```

## Database

### Tables
- **SubOutVendors** - Vendor information (soft delete via IsActive)
- **SubOuts** - Main sub fabrication records
- **SubOutItems** - Individual items within a sub out

### Views
- **vwSubOutsList** - Sub outs with vendor and job info joined

### Indexes
- IX_SubOuts_JobCode
- IX_SubOuts_VendorID
- IX_SubOuts_Status
- IX_SubOutItems_SubOutID
- IX_SubOutItems_Source

### Setup
Run these scripts on the FabTracker database:
1. `database/schema.sql` - Creates tables, indexes, and views
2. `database/seed.sql` - Inserts default vendors

## API Endpoints

### Health (`/api`)
- `GET /health` - API health status

### SubOuts (`/api/subouts`)
- `GET /` - Get all (filters: jobCode, vendorId, status)
- `GET /grouped` - Get grouped by job
- `GET /:id` - Get single with items
- `POST /` - Create
- `PUT /:id` - Update
- `DELETE /:id` - Delete
- `PATCH /:id/status` - Update status
- `PATCH /:id/loads-out` - Increment loads from MFC
- `PATCH /:id/loads-in` - Increment loads from Sub

### Items (`/api/subouts/:subOutId/items`)
- `GET /` - Get items
- `POST /` - Add item
- `POST /bulk` - Bulk add items
- `PUT /:itemId` - Update item
- `DELETE /:itemId` - Remove item

### Vendors (`/api/vendors`)
- `GET /` - Get all (filter: includeInactive)
- `GET /:id` - Get single
- `POST /` - Create
- `PUT /:id` - Update
- `DELETE /:id` - Soft delete

### Jobs (`/api/jobs`)
- `GET /` - Get active jobs
- `GET /:jobCode` - Get single job
- `GET /:jobCode/subouts` - Get job's sub outs

### Cutlists (`/api/cutlists`)
- `GET /packages/:jobCode` - Get available packages
- `GET /longshapes/:jobCode` - Get long shapes (query: package)
- `GET /parts/:jobCode` - Get parts (query: package)
- `GET /pulllist/:jobCode` - Get pull list (query: package)
- `GET /available/:jobCode` - Get available items (query: package)

### Dashboard (`/api/dashboard`)
- `GET /stats` - Overall statistics
- `GET /action-items` - Items needing attention (overdue, missing steel)
- `GET /by-vendor` - Summary grouped by vendor
- `GET /recent` - Recent activity (query: limit)

## Status Flow

```
Pending → Ready → Sent → InProcess → Shipped → Received → QCd → Complete
```

## Color Coding

- **Red border**: Overdue send
- **Orange border**: Overdue receive
- **Pink border/row**: Missing steel
- **Blue border**: Ready to ship
- **Yellow border/row**: In progress (partial)
- **Green border/row**: Complete
- **Gray**: Default/pending

## Key Features

### Data Management
- React Query with 5-minute stale time
- Automatic cache invalidation on mutations
- Axios response interceptor for error handling

### Item Tracking
- Source tracking (SourceTable, SourceID) for LongShapes, Parts, PullList
- Material tracking: HeatNumber, CertNumber, Barcode
- Lot number generation: SUB#001, SUB#002, etc.

### Database
- Connection pooling (max 10, timeout 30s)
- Retry logic for connection failures
- Foreign key cascading delete for SubOutItems
- Unique constraint on (JobCode, Lot) pairs

### Formatting Utilities
- Date: short (m/d/yy) and long (Month Day, Year)
- Weight: Tons (T) if >= 2000 lbs, otherwise lbs
- Loads progress: "shipped of total" format

---

## How-To Guide

### Navigation

The application has a collapsible sidebar on the left with four main sections:

- **Dashboard** - Home view showing all active sub outs grouped by job
- **All SubOuts** - Flat table listing every sub out record
- **Vendors** - Manage sub-fabricator vendor contacts
- **Settings** - View app version, database info, and a status/color legend

The sidebar can be expanded (showing labels) or collapsed (icons only) using the toggle in the header.

---

### Dashboard Overview

The Dashboard is the primary working screen. It displays:

1. **Stats Bar** (top) - Five summary cards showing:
   - Total Active sub outs
   - Pending Shipment count
   - In Progress count
   - Action Required count (overdue or missing steel)
   - Complete This Month count

2. **Filter Bar** - Filter the dashboard by:
   - **Job** - Select a specific job from the dropdown
   - **Vendor** - Filter by sub-fabricator
   - **Status** - Filter by current status (Pending, Ready, Sent, etc.)
   - **Action Items Only** - Checkbox to show only items that are overdue or have missing steel

3. **View Toggle** - Switch between:
   - **Card View** (grid icon) - Sub outs displayed as cards grouped by job
   - **Table View** (list icon) - Sub outs displayed in a tabular format

4. **Job Groups** - Sub outs are organized under their parent job. Each job group shows its sub outs as either cards or table rows.

#### Reading Card Colors

Cards have a colored left border indicating their current condition:
- **Red** - Overdue: past the "Date to Leave MFC" and loads have not all shipped out
- **Orange** - Overdue receive: past the "Date to Ship from Sub" and loads have not all come back
- **Pink** - Missing steel: the sub out has missing steel noted
- **Blue** - Ready to ship from MFC
- **Yellow** - In progress (status is Sent, InProcess, or Shipped)
- **Green** - Complete
- **Gray** - Default/pending

Table row background colors follow a similar scheme:
- **Pink background** - Missing steel
- **Green background** - Complete or all return loads received
- **Yellow background** - Partially shipped (some loads sent or received)

---

### Creating a New SubOut

1. Click the **"+ New SubOut"** button (available from the SubOuts list page header or the sidebar navigation to the list page, then click the button).
2. Fill in the form sections:

   **Job & Basic Info:**
   - **Job** (required) - Select from the dropdown of active jobs. This is locked after creation.
   - **Lot Number** (required) - Enter a unique lot identifier (e.g., `SUB#001`). This is locked after creation.
   - **Description** - Brief description of what is being sub-fabricated (e.g., "Columns", "Beams", "Misc Steel").

   **Vendor & Status:**
   - **Vendor** - Select the sub-fabricator from the vendor list.
   - **Status** - Defaults to "Pending". Set to the appropriate status.
   - **Zone** - Optional zone identifier for the job (e.g., "2", "3").

   **Outbound from MFC:**
   - **Date to Leave MFC** - Target date for steel to ship from MFC to the sub.
   - **Loads to Ship** - Total number of truckloads going out (defaults to 1).
   - **Loads Shipped** - Number already shipped (typically 0 when creating).

   **Inbound from Sub:**
   - **Date to Ship from Sub** - Target date for fabricated steel to return from the sub.
   - **Loads to Ship** - Total number of return loads expected (defaults to 1).
   - **Loads Shipped** - Number already returned (typically 0 when creating).

   **Details:**
   - **Weight (lbs)** - Total weight in pounds.
   - **Major Pieces** - Count of major structural pieces.
   - **PO Number** - Purchase order reference.
   - **Estimated Cost / Actual Cost** - Dollar amounts for tracking.

   **Missing Steel** - Note any steel that is missing and needed for the sub out.

   **Notes** - Any additional notes.

3. Click **"Create SubOut"** to save. You will be redirected to the new sub out's detail page.

---

### Viewing SubOut Details

Click on any sub out card or table row to open its detail page. The detail page shows:

1. **Header** - Job name, lot number, description, and project manager. Action buttons for **Edit** and **Delete** are in the top-right corner.

2. **Details Card** - Shows vendor, zone, weight, major pieces, PO number, status, and costs.

3. **Shipment Tracking Card** - Two-column layout showing:
   - **FROM MFC** - Loads shipped vs. loads to ship, with the leave date. A green checkmark appears when all loads are shipped. Click **"+1 Load Out"** to increment the shipped count.
   - **FROM SUB** - Loads returned vs. loads expected, with the due date. A green checkmark appears when all loads are returned. Click **"+1 Load In"** to increment the received count.

4. **Missing Steel Card** - Displays missing steel notes in pink if present, otherwise shows "No missing steel".

5. **Notes Card** - Displays any additional notes.

6. **Items Section** - Shows all items associated with this sub out in a table. Use the **"+ Add Items"** button to add items from the job's cutlist.

---

### Editing a SubOut

1. Open the sub out detail page.
2. Click the **Edit** button in the top-right corner.
3. Modify any fields. Note: Job and Lot Number cannot be changed after creation.
4. Click **"Update SubOut"** to save changes.

---

### Deleting a SubOut

1. Open the sub out detail page.
2. Click the **Delete** button in the top-right corner.
3. A confirmation modal will appear showing the lot number.
4. Click **Delete** to confirm. This permanently removes the sub out and all its associated items (cascading delete).

---

### Tracking Loads (Quick Increment)

From the sub out detail page:
- Click **"+1 Load Out"** under the "FROM MFC" section each time a truck leaves MFC headed to the sub-fabricator. The button is disabled once all loads have been shipped.
- Click **"+1 Load In"** under the "FROM SUB" section each time a truck arrives back from the sub-fabricator. The button is disabled once all loads have been received.

These are the primary day-to-day actions users will perform to track shipment progress.

---

### Adding Items from Cutlists

1. Open a sub out's detail page.
2. Click **"+ Add Items"** above the items table.
3. The **Item Picker** modal opens:
   - **Select a Package** from the dropdown (packages come from the job's cutlist data).
   - Choose a tab: **LongShapes**, **Parts**, or **PullList/Raw**.
   - Use the **search box** to filter by mark, piece mark, or shape.
   - Click rows to select individual items, or use **"Select all available"** to select everything not already assigned.
   - Items already assigned to another sub out are grayed out and show which lot they belong to.
   - The **selection summary** at the bottom shows total count, pieces, and weight of your selection.
4. Click **"Add Selected Items"** to add them to the sub out.

---

### Managing Vendors

Navigate to **Vendors** in the sidebar.

**Adding a vendor:**
1. Click **"+ Add Vendor"**.
2. Fill in: Vendor Name (required), Contact Name, Phone, Email, Address, Notes.
3. Click **Create**.

**Editing a vendor:**
1. Click the pencil icon on the vendor's card.
2. Update the fields.
3. Click **Update**.

**Deactivating a vendor:**
1. Click the trash icon on the vendor's card.
2. Confirm the deactivation. Vendors are soft-deleted (marked inactive), not permanently removed. Inactive vendors appear faded with an "Inactive" badge.

---

### Viewing a Job's SubOuts

Click on a job name/code anywhere in the app to navigate to the **Job View** page. This shows:
- The job code, description, and project manager
- All sub outs for that job displayed as cards in a responsive grid

---

### Using the All SubOuts List

Navigate to **All SubOuts** in the sidebar for a flat table view of every sub out record. This page includes:
- **Vendor** and **Status** filter dropdowns
- A results count
- A sortable table with columns: Job, Lot, Description, Vendor, Leave MFC date, Loads Out progress, Ship From Sub date, Loads In progress, Weight, Pieces, and Status
- Click any row to open the sub out's detail page

---

### Understanding the Status Flow

Sub outs progress through these statuses in order:

| Status | Meaning |
|--------|---------|
| **Pending** | Initial state, awaiting action |
| **Ready** | Steel is ready to ship from MFC |
| **Sent** | Steel has been shipped from MFC to the sub-fabricator |
| **InProcess** | Sub-fabricator is actively fabricating |
| **Shipped** | Fabricated steel shipped from sub back to MFC |
| **Received** | Steel received at MFC |
| **QCd** | Quality check completed |
| **Complete** | Fully complete, no further action needed |

Status is updated manually via the Edit page. The status is used for filtering and color coding throughout the app.

---

### Settings Page

The Settings page (gear icon in sidebar) displays:
- **Application Info** - Version number and environment mode
- **Database** - Server and database name
- **Status Legend** - Visual reference for all status badge colors
- **Card Border Colors** - Visual reference for all action-based card border colors

---

## Changelog

All changes to the project are tracked in [`CHANGELOG.md`](CHANGELOG.md). When making changes to the codebase, add an entry to the changelog with the date, what changed, and which files were affected.
