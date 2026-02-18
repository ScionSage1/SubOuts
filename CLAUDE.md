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
│   │   │   │   ├── StatusBadge.jsx
│   │   │   │   └── UserSelectModal.jsx  # Login prompt on load
│   │   │   ├── cortex/               # MFCCortex AI Chat integration
│   │   │   │   ├── AiChat.jsx        # Floating chat panel
│   │   │   │   ├── ChatHeader.jsx
│   │   │   │   ├── ChatMessage.jsx
│   │   │   │   ├── ChatInput.jsx
│   │   │   │   ├── ChatToolCall.jsx
│   │   │   │   ├── useAiChat.js      # Chat hook with SSE streaming
│   │   │   │   └── cortex-config.js  # MFCCortex server config
│   │   │   ├── subouts/             # SubOut-specific components
│   │   │   │   ├── ItemPicker.jsx    # Cutlist item selector with send type defaults, weight column
│   │   │   │   ├── ItemsTable.jsx    # Items table with sortable columns, search filter, SendType, Weight, PullStatus, RMNumber
│   │   │   │   ├── JobGroup.jsx
│   │   │   │   ├── LoadForm.jsx      # Load create/edit modal
│   │   │   │   ├── LoadItemAssigner.jsx  # Assign items/pallets to a load
│   │   │   │   ├── LoadsSection.jsx  # Two-column outbound/inbound load tracking
│   │   │   │   ├── PalletForm.jsx    # Pallet create/edit modal
│   │   │   │   ├── PalletItemAssigner.jsx  # Assign parts to a pallet
│   │   │   │   ├── PalletsSection.jsx  # Expandable pallet cards with items
│   │   │   │   ├── RawMaterialMatcher.jsx  # Add raw material from Tekla inventory
│   │   │   │   ├── SendTypeBadge.jsx # Color-coded send type indicator
│   │   │   │   ├── SubOutCard.jsx
│   │   │   │   ├── SubOutDetail.jsx  # Detail view (children slot for sections)
│   │   │   │   ├── SubOutForm.jsx
│   │   │   │   └── VendorSelect.jsx
│   │   │   └── layout/              # Layout components
│   │   │       ├── Header.jsx
│   │   │       ├── Sidebar.jsx
│   │   │       └── Footer.jsx
│   │   ├── context/
│   │   │   └── AppContext.jsx       # Global state (sidebar, view mode, currentUser)
│   │   ├── hooks/                   # Custom React Query hooks
│   │   │   ├── useSubOuts.js
│   │   │   ├── useSubOutItems.js
│   │   │   ├── usePallets.js        # Pallet CRUD, item/load assignment hooks
│   │   │   ├── useLoads.js          # Load CRUD, status, item/pallet assignment hooks
│   │   │   ├── useVendors.js
│   │   │   ├── useJobs.js
│   │   │   ├── useCutlists.js       # Cutlist queries + PullList source update mutation
│   │   │   ├── useConfig.js         # Config lookup hooks (pull statuses)
│   │   │   ├── useTekla.js          # Tekla inventory hooks (filters, matching)
│   │   │   ├── useDashboard.js
│   │   │   └── useCommunications.js  # Communication log hooks
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
│   ├── controllers/
│   │   ├── subOutController.js
│   │   ├── subOutItemController.js
│   │   ├── palletController.js      # Pallet CRUD, item assignment, load assignment
│   │   ├── loadController.js        # Load CRUD, status, item/pallet assignment
│   │   ├── vendorController.js
│   │   ├── jobController.js
│   │   ├── cutlistController.js     # Cutlist queries + PullList source update
│   │   ├── configController.js      # Config lookup (pull statuses)
│   │   ├── teklaController.js      # Tekla inventory: filters, matching, raw debug
│   │   └── dashboardController.js
│   ├── config/
│   │   ├── database.js              # SQL Server connection pool
│   │   └── tekla.js                 # Tekla inventory via MFCCortex (30min cache)
│   ├── routes/
│   │   ├── subouts.js
│   │   ├── items.js
│   │   ├── pallets.js               # Pallet routes under /api/subouts/:subOutId/pallets
│   │   ├── loads.js                 # Load routes under /api/subouts/:subOutId/loads
│   │   ├── vendors.js
│   │   ├── jobs.js
│   │   ├── cutlists.js              # Includes PUT for PullList source update
│   │   ├── config.js                # Config lookup routes (/api/config)
│   │   ├── dashboard.js
│   │   ├── tekla.js                 # Tekla inventory routes (/api/tekla)
│   │   └── communications.js        # Communication log API
│   ├── middleware/
│   │   └── errorHandler.js          # Async wrapper & error handling
│   ├── server.js
│   └── package.json
├── database/
│   ├── schema.sql                   # Tables, indexes, views
│   ├── seed.sql                     # Default vendors
│   ├── add_communication_log.sql    # Communication log table
│   └── add_send_types_pallets_loads.sql  # Loads, Pallets, SendType migration
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
CORTEX_URL=http://10.0.0.10:7777
CORTEX_ADMIN_KEY=your_admin_key
```

## Database

### Tables
- **SubOutVendors** - Vendor/sub fabricator information (soft delete via IsActive)
  - Includes: City, State, Size, AISCBoard, MFCOutreach, LastContactDate
- **SubOuts** - Main sub fabrication records
  - Legacy load counter fields: LoadsToShipFromMFC, LoadsShippedFromMFC, LoadsToShipFromSub, LoadsShippedFromSub
- **SubOutItems** - Individual items within a sub out
  - SendType: 'Raw' | 'CutToLength' | 'PartsOnPallets' (default 'Raw')
  - PalletID (FK to SubOutPallets, nullable)
  - LoadID (FK to SubOutLoads, nullable)
- **SubOutLoads** - Individual load/shipment tracking
  - LoadID (PK), SubOutID (FK cascade), LoadNumber (auto: OUT-001, IN-001)
  - Direction: 'Outbound' | 'Inbound'
  - ScheduledDate, ActualDate, TruckCompany, TrailerNumber, DriverName, BOLNumber
  - Weight, PieceCount, Status: Planned → Loading → InTransit → Delivered
  - Unique: (SubOutID, LoadNumber)
- **SubOutPallets** - Pallet grouping for parts
  - PalletID (PK), SubOutID (FK cascade), PalletNumber (auto: P-001)
  - Weight, Length, Width, Height (dimensions in inches)
  - Status: Open → Closed → Loaded → Shipped → Received
  - LoadID (FK to SubOutLoads, nullable)
  - PhotoURL, Notes
  - Unique: (SubOutID, PalletNumber)
- **FabTracker.ConfigItems** - Configuration lookup table (shared, read from MFC_NTLIVE)
  - ConfigName = 'LongPullStatus' provides PullStatus integer-to-label mapping
  - ConfigValue (INT) = the status integer stored on PullList/LongShapes
  - ConfigDesc (NVARCHAR) = human-readable label (e.g., "Not Pulled", "On Sweeps", "Staged")
- **FabTracker.PullList** - Source pull list items (shared, read/write from MFC_NTLIVE)
  - PullStatus (INT) - Maps to ConfigItems where ConfigName = 'LongPullStatus'
  - RMNumber (NVARCHAR) - Requisition material number
  - These fields are fetched live and displayed on SubOut items; edits write back to this table
- **SubFabricatorCommunicationLog** - Communication history with vendors
  - Fields: ContactDate, ContactType, ContactPerson, MFCEmployee, Summary, Details
  - Follow-up tracking: FollowUpRequired, FollowUpDate, FollowUpType, FollowUpNotes, FollowUpCompleted
  - Source tracking: Manual or MFCCortex (AI)

### Views
- **vwSubOutsList** - Sub outs with vendor and job info joined, includes computed load counts (OutboundLoadCount, OutboundDeliveredCount, InboundLoadCount, InboundDeliveredCount)
- **vwSubOutItemsDetail** - Items with joined pallet number and load number
- **vwSubOutLoadsDetail** - Loads with SubOut info + item/pallet counts
- **vwSubOutPalletsDetail** - Pallets with SubOut info + item counts + load number
- **vwCommunicationLog** - Communication logs with vendor name joined

### Indexes
- IX_SubOuts_JobCode, IX_SubOuts_VendorID, IX_SubOuts_Status
- IX_SubOutItems_SubOutID, IX_SubOutItems_Source, IX_SubOutItems_PalletID, IX_SubOutItems_LoadID
- IX_SubOutLoads_SubOutID, IX_SubOutLoads_Direction, IX_SubOutLoads_Status
- IX_SubOutPallets_SubOutID, IX_SubOutPallets_LoadID

### Setup
Run these scripts on the FabTracker database:
1. `database/schema.sql` - Creates tables, indexes, and views
2. `database/seed.sql` - Inserts default vendors
3. `database/add_send_types_pallets_loads.sql` - Adds loads, pallets, send types (run after schema.sql)

## API Endpoints

### Health (`/api`)
- `GET /health` - API health status

### SubOuts (`/api/subouts`)
- `GET /` - Get all (filters: jobCode, vendorId, status)
- `GET /grouped` - Get grouped by job
- `GET /:id` - Get single with items, pallets, and loads
- `POST /` - Create
- `PUT /:id` - Update
- `DELETE /:id` - Delete (cascades to items, loads, pallets)
- `PATCH /:id/status` - Update status
- `PATCH /:id/loads-out` - Quick ship outbound (creates Delivered load record + syncs legacy counters)
- `PATCH /:id/loads-in` - Quick ship inbound (creates Delivered load record + syncs legacy counters)

### Items (`/api/subouts/:subOutId/items`)
- `GET /` - Get items
- `POST /` - Add item (supports sendType field)
- `POST /bulk` - Bulk add items (supports sendType per item)
- `PUT /:itemId` - Update item (supports sendType, palletId, loadId)
- `DELETE /:itemId` - Remove item

### Pallets (`/api/subouts/:subOutId/pallets`)
- `GET /` - List pallets for a sub out
- `GET /:palletId` - Get pallet with its items
- `POST /` - Create pallet (auto-numbers P-001, P-002...)
- `PUT /:palletId` - Update pallet details
- `DELETE /:palletId` - Delete pallet (unassigns items first)
- `PATCH /:palletId/status` - Update pallet status
- `POST /:palletId/items` - Assign items to pallet (body: { itemIds })
- `DELETE /:palletId/items/:itemId` - Remove item from pallet
- `PATCH /:palletId/assign-load` - Assign pallet to a load (body: { loadId })

### Loads (`/api/subouts/:subOutId/loads`)
- `GET /` - List loads (query: direction)
- `GET /:loadId` - Get load with items and pallets
- `POST /` - Create load (auto-numbers OUT-001/IN-001)
- `PUT /:loadId` - Update load details
- `DELETE /:loadId` - Delete load (unassigns items/pallets first)
- `PATCH /:loadId/status` - Update status (syncs legacy counters on Delivered)
- `POST /:loadId/items` - Assign items to load (body: { itemIds })
- `DELETE /:loadId/items/:itemId` - Remove item from load
- `POST /:loadId/pallets` - Assign pallets to load (body: { palletIds })
- `DELETE /:loadId/pallets/:palletId` - Remove pallet from load

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

### Config (`/api/config`)
- `GET /pull-statuses` - Get PullStatus lookup values from ConfigItems (LongPullStatus)

### Cutlists (`/api/cutlists`)
- `GET /packages/:jobCode` - Get available packages
- `GET /longshapes/:jobCode` - Get long shapes (query: package)
- `GET /parts/:jobCode` - Get parts (query: package)
- `GET /pulllist/:jobCode` - Get pull list with PullStatus & RMNumber (query: package)
- `GET /available/:jobCode` - Get available items with PullStatus & RMNumber for PullList (query: package)
- `PUT /pulllist/:pullListId` - Update PullStatus/RMNumber on source FabTracker.PullList (body: { pullStatus, rmNumber })

### Tekla (`/api/tekla`)
- `GET /inventory` - Debug endpoint: raw Tekla inventory items via MFCCortex (13,410+ items, 30min cache)
- `GET /inventory/filters` - Distinct shapes and grades for dropdown selection
- `GET /inventory/match` - Find inventory matching shape+grade pairs (query: shapes JSON array of `{shape, grade}`)

### Dashboard (`/api/dashboard`)
- `GET /stats` - Overall statistics
- `GET /action-items` - Items needing attention (overdue, missing steel)
- `GET /by-vendor` - Summary grouped by vendor
- `GET /recent` - Recent activity (query: limit)

### Communications (`/api/communications`)
- `GET /` - Get all (filter: vendorId, limit)
- `GET /follow-ups` - Get pending follow-ups
- `GET /:id` - Get single entry
- `POST /` - Create new entry
- `PUT /:id` - Update entry
- `PATCH /:id/complete-followup` - Mark follow-up complete
- `DELETE /:id` - Delete entry

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

### User Authentication
- Simple user selection on first load (no passwords)
- Users: Doug, Todd, Blake, Evan, Ken, Joe L., Joe S., Conrad
- Persisted to localStorage as `subouts-user`
- User passed to MFCCortex AI for context

### MFCCortex AI Integration
- Floating chat panel (bottom-right corner)
- Connects to MFCCortex server on port 7777
- App ID: `subouts`
- SSE streaming for real-time responses
- Tool support: `log_fabricator_communication` auto-logs vendor communications
- Auto-refresh: When AI logs a communication, queries are invalidated to show new entry

### Data Management
- React Query with 5-minute stale time
- Automatic cache invalidation on mutations
- Axios response interceptor for error handling

### Send Types
Items can be classified into three send types reflecting real-world scenarios:
- **Raw** (gray badge) - Sending raw inventory lengths as-is
- **Cut to Length** (blue badge) - Cutting main marks to length before sending
- **Parts on Pallets** (purple badge) - Burning/cutting parts, palletizing, then shipping
- Send type is set per item (a single SubOut can mix all three types)
- ItemPicker defaults send type by tab: PullList→Raw, LongShapes→CutToLength, Parts→PartsOnPallets
- ItemsTable has inline send type dropdown editing and a send type filter

### Sortable & Filterable Grids
- All ItemsTable column headers are clickable to sort (ascending → descending → clear)
- Sort indicators (▲/▼) appear on hover and highlight blue when active
- Search input filters across all text fields (Shape, MainMark, PieceMark, Grade, Barcode, RMNumber, PalletNumber, LoadNumber, Status, SendType, Length, Weight)
- Sort resets on tab change; search filter persists across tabs
- Combined tab sorts parent PullList rows, orphan LongShapes, and children independently
- Summary bar shows active sort column with quick "clear" link

### Pallet Tracking
- Group "Parts on Pallets" items into named pallets (P-001, P-002, etc.)
- Pallet details: weight, dimensions (L x W x H), photo URL, notes
- Status flow: Open → Closed → Loaded → Shipped → Received
- Assign pallets to outbound loads (cascades to items on the pallet)
- Expandable pallet cards show assigned items with remove option
- Pallet headers show computed total weight (from items × qty) and grouped parts summary (e.g. "40 W 14 x 30")
- Weight computed from TeklaWeight where available, falling back to database Weight

### Load Tracking
- Full load entities replacing old simple counters
- Two-column layout: Outbound (MFC → Sub) and Inbound (Sub → MFC)
- Auto-numbered: OUT-001, OUT-002... and IN-001, IN-002...
- Load details: scheduled/actual dates, truck company, trailer number, driver, BOL number, weight, piece count
- Status flow: Planned → Loading → InTransit → Delivered
- Assign items and pallets to loads via tabbed assigner (LongShapes, Parts, PullList/Raw, Pallets)
- Load card headers show total weight in lbs and remaining capacity (48,000 lb default)
- Expanded load cards show items with weights and remove (X) buttons
- Pallets on loads are expandable to show contained items; removable from load
- PullList items display as shape/size/grade/length (no marks)
- Progress bars show delivered/total loads per direction (active loads shown at 50% fill)
- Legacy counter fields synced automatically when loads change status

### Item Tracking
- Source tracking (SourceTable, SourceID) for LongShapes, Parts, PullList, TeklaInventory
- Material tracking: HeatNumber, CertNumber, Barcode
- Send type tracking: Raw, CutToLength, PartsOnPallets
- Pallet and Load assignment tracking
- Items on a pallet or load display with strikethrough in the items table
- Items cannot be assigned to multiple loads (backend guard)
- Lot number generation: SUB#001, SUB#002, etc.

### Raw Material from Tekla Inventory
- Add raw material (plates, angles, etc.) directly from Tekla inventory
- **"Add Raw Material"** button on SubOut detail page opens the Raw Material Matcher modal
- Shape dropdown populated from all distinct shapes in Tekla inventory
- Grade dropdown filters to grades available for the selected shape
- Matching inventory displayed as a table: dimension, stock length, weight, in-stock count
- Quantity picker (+/-) to select how many of each stick to add
- Items added with `SourceTable: 'TeklaInventory'`, `SendType: 'Raw'`
- TeklaInventory items appear on the **PullList/Raw** tab in ItemsTable and LoadItemAssigner
- `client/src/components/subouts/RawMaterialMatcher.jsx`, `client/src/hooks/useTekla.js`

### Pull Status & RM Number Tracking
- PullStatus and RMNumber are fetched live from `FabTracker.PullList` source table when a SubOut is opened
- PullStatus is an integer mapped to ConfigItems lookup (ConfigName = 'LongPullStatus')
- Available statuses: Not Pulled (0), On Sweeps (1), Staged (2), Locating (3), On Order (4), Processing (5), TFS/Done (6), Pulled Sub (7), Direct To Sub (8), ON HOLD (9), Loaded Sub (10)
- Inline dropdown on PullList/Raw tab and Combined tab parent rows
- RMNumber is editable inline (click to edit, blur/Enter saves, Escape cancels)
- Changes write back to the source `FabTracker.PullList` table, not to SubOutItems
- Config lookup cached for 30 minutes (rarely changes)

### Tekla Inventory Weight Enrichment
- PullList items are enriched with weights from Tekla inventory via MFCCortex
- Backend calls `tekla_get_inventory` tool on MFCCortex server (CORTEX_URL env var)
- Matches by composite key: shape|dimension|grade|lengthInInches
- Weights converted from kg to lbs; displayed in blue text to indicate Tekla source
- 30-minute in-memory cache (13,410+ inventory records)
- TeklaWeight property added to items; frontend falls back to database Weight if unavailable
- `server/config/tekla.js` - Inventory fetch, cache, weight map, enrichment logic

### Load Capacity Tracking
- Default truck capacity: 48,000 lbs
- Load card headers show remaining capacity color-coded (green >75%, orange <25%, red overweight)
- LoadItemAssigner shows live capacity progress bar that updates as items are selected
- All weight calculations multiply by item quantity

### Multi-Select Bulk Actions
- **PullList tab**: Checkbox selection with bulk "Set Pull Status" action bar
- **LongShapes/Parts tabs**: Checkbox selection with bulk "Set Send Type" action bar
- Select-all header checkbox, clear selection button
- Selections clear on tab change

### Database
- Connection pooling (max 10, timeout 30s)
- Retry logic for connection failures
- Foreign key cascading delete for SubOutItems, SubOutLoads, SubOutPallets
- Unique constraints: (JobCode, Lot), (SubOutID, LoadNumber), (SubOutID, PalletNumber)

### Formatting Utilities
- Date: short (m/d/yy) and long (Month Day, Year)
- Weight: Tons (T) if >= 2000 lbs, otherwise lbs
- Loads progress: "shipped of total" format
- Dimensions: L x W x H in inches
- Send type labels: Raw, Cut to Length, Parts on Pallets
- Load status labels: Planned, Loading, In Transit, Delivered

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

Cards have a colored top accent bar indicating their current condition:
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

   **Shipping:**
   - **Date to Leave MFC** - Target date for steel to ship from MFC to the sub.
   - **Date to Ship from Sub** - Target date for fabricated steel to return from the sub.
   - **Planned Outbound Loads** - Estimated number of truckloads going out (defaults to 1).
   - **Planned Inbound Loads** - Estimated number of return loads expected (defaults to 1).
   - Note: Detailed load tracking (truck info, status, items/pallets) is managed on the detail page after creation.

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

1. **Header** - Job name, lot number, description, and project manager. Action buttons for **Edit**, **Delete**, and **Reopen** (for Complete status) are in the top-right corner.

2. **Details Card** - Grid showing vendor, zone, weight, major pieces, PO number, status, costs, leave MFC date, and due from sub date.

3. **Loads Section** - Two-column layout tracking all shipments:
   - **Outbound (MFC → Sub)** - Loads going to the sub-fabricator with progress bar
   - **Inbound (Sub → MFC)** - Loads returning with progress bar
   - Each column has: **"+ Load"** button to create loads with full details
   - Load cards show: number, status badge, scheduled date, item/pallet counts
   - Expand loads to see truck info, assigned pallets, and direct items
   - Inline status dropdown to advance: Planned → Loading → InTransit → Delivered
   - Actions: assign items/pallets, edit, delete

4. **Pallets Section** - Group parts onto pallets for organized shipping:
   - **"+ New Pallet"** button to create (auto-numbered P-001, P-002...)
   - Pallet cards show: number, status, item count, weight, dimensions, load assignment
   - Expand to see assigned items with remove option
   - Inline status dropdown and load assignment dropdown
   - Actions: add items, edit, delete

5. **Items Section** - All items in a tabbed table (LongShapes, Parts, PullList, Combined):
   - **Sortable columns** - Click any column header to sort ascending/descending; click again to clear
   - **Search filter** - Text input searches across all fields (shape, marks, grade, barcode, etc.)
   - **SendType column** with inline dropdown to change type (Raw / Cut to Length / Parts on Pallets)
   - **Weight column** - Displays item weight (lbs or tons), sortable and searchable
   - **Pull Status column** (PullList tab + Combined parent rows) - Inline dropdown to update status on source FabTracker.PullList
   - **RM# column** (PullList tab + Combined parent rows) - Click-to-edit text field, writes back to source FabTracker.PullList
   - **Multi-select** (PullList tab) - Checkbox column with select-all; bulk action bar to set PullStatus on multiple items
   - **Pallet** and **Load** columns showing assignments
   - **Send type filter** dropdown above the tabs
   - Use **"+ Add Items"** to add from the job's cutlist
   - Use **"Add Raw Material"** to add raw inventory from Tekla (plates, angles, etc.)

6. **Missing Steel Card** - Displays missing steel notes in pink (only shown if present).

7. **Notes Card** - Displays any additional notes (only shown if present).

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
4. Click **Delete** to confirm. This permanently removes the sub out and all its associated items, pallets, and loads (cascading delete).

---

### Managing Loads

Loads are tracked on the sub out detail page in the **Loads Section**. Two columns show Outbound (MFC → Sub) and Inbound (Sub → MFC) loads.

**Creating a load:**
1. Click **"+ Load"** in the appropriate column (Outbound or Inbound).
2. Fill in the load form: direction, scheduled date, truck company, trailer number, driver name, BOL number, weight, piece count, notes.
3. Click **"Create Load"**. The load appears as a card in the column.
4. Assign items or pallets to the load using the **+** button on the load card.
5. Update the load status as it progresses: **Planned → Loading → InTransit → Delivered**.

**Assigning items/pallets to loads:**
- Click the **+** icon on a load card to open the assigner modal.
- **Items tab** - Shows unassigned items (not on pallets). Checkbox to select, then assign.
- **Pallets tab** - Shows unassigned pallets with item counts. Assigning a pallet also assigns all its items.

---

### Managing Pallets

Pallets appear on the detail page in the **Pallets Section**, between Loads and Items.

**Creating a pallet:**
1. Click **"+ New Pallet"** to open the pallet form.
2. Fill in: weight, dimensions (length, width, height in inches), photo URL, notes.
3. Click **"Create Pallet"**. The pallet is auto-numbered (P-001, P-002...).

**Adding items to a pallet:**
1. Click the **+** icon on a pallet card.
2. The assigner shows items with SendType = "PartsOnPallets" that aren't already on another pallet.
3. Select items and click **"Assign to Pallet"**.

**Assigning a pallet to a load:**
- Use the load dropdown on the pallet card to assign it to an outbound load. This also assigns all items on the pallet to that load.

**Pallet status flow:** Open → Closed → Loaded → Shipped → Received

---

### Send Types

Each item has a **Send Type** indicating how it will be handled:

| Send Type | Badge Color | Description |
|-----------|-------------|-------------|
| **Raw** | Gray | Raw inventory lengths sent as-is |
| **Cut to Length** | Blue | Main marks cut to length before sending |
| **Parts on Pallets** | Purple | Parts burned/cut, placed on pallets for shipping |

- When adding items via the Item Picker, send types default by tab: PullList→Raw, LongShapes→Cut to Length, Parts→Parts on Pallets. Override with the dropdown.
- On the Items table, change send type inline via the dropdown in the Type column.
- Filter items by send type using the dropdown above the tabs.
- Only items with SendType = "PartsOnPallets" can be assigned to pallets.

---

### Managing Pull Status & RM Numbers

Pull list items display their **Pull Status** and **RM Number** from the source `FabTracker.PullList` table. These columns appear on the **PullList/Raw tab** and on **parent rows in the Combined tab**.

**Viewing Pull Status:**
- The Pull Status column shows a dropdown with status options loaded from the ConfigItems lookup table.
- Statuses include: Not Pulled, On Sweeps, Staged, Locating, On Order, Processing, TFS/Done, Pulled Sub, Direct To Sub, ON HOLD, Loaded Sub.

**Changing Pull Status:**
1. Open a sub out's detail page and navigate to the **PullList/Raw** tab (or **Combined** tab).
2. Click the **Pull Status** dropdown on any pull list item.
3. Select a new status. The change is saved immediately back to the source `FabTracker.PullList` table.

**Editing RM Number:**
1. On the PullList/Raw or Combined tab, click the **RM#** value (or the "-" placeholder if empty).
2. An inline text input appears. Type the RM number.
3. Press **Enter** or click away (blur) to save. Press **Escape** to cancel without saving.
4. The change is saved immediately back to the source `FabTracker.PullList` table.

**Important:** Pull Status and RM Number are properties of the source pull list item, not the SubOut. Changes affect the source data and will be reflected anywhere the same pull list item appears.

---

### Adding Items from Cutlists

1. Open a sub out's detail page.
2. Click **"+ Add Items"** above the items table.
3. The **Item Picker** modal opens:
   - **Select a Package** from the dropdown (packages come from the job's cutlist data).
   - Choose a tab: **LongShapes**, **Parts**, or **PullList/Raw**. Each tab sets a default **send type** (LongShapes→Cut to Length, Parts→Parts on Pallets, PullList→Raw).
   - Use the **search box** to filter by mark, piece mark, or shape.
   - Click rows to select individual items, or use **"Select all available"** to select everything not already assigned.
   - Items already assigned to another sub out are grayed out and show which lot they belong to.
   - The **selection summary** at the bottom shows total count, pieces, weight, and the **send type selector** to override the default.
4. Click **"Add Selected Items"** to add them to the sub out with the chosen send type.

---

### Adding Raw Material from Tekla Inventory

Raw material (plates, angles, channels, etc.) can be added directly from Tekla inventory:

1. Open a sub out's detail page.
2. Click **"Add Raw Material"** (layers icon) above the items table, next to "Add Items".
3. The **Raw Material Matcher** modal opens:
   - **Select a Shape** from the dropdown (e.g., PL, L, C, W). Shapes are populated from all available Tekla inventory.
   - **Select a Grade** from the dropdown (e.g., A36, 50). Grades are filtered to those available for the selected shape.
   - A table appears showing matching inventory: dimension, stock length, weight per piece, and in-stock count.
   - Click a row or its checkbox to select it. A **quantity picker** (+/-) appears to choose how many sticks to add.
   - The **selection summary** shows total sticks selected and combined weight.
4. Click **"Add X Sticks as Raw Material"** to add them to the sub out.
5. Added items appear on the **PullList/Raw** tab with `SendType: Raw` and `SourceTable: TeklaInventory`.

**Note:** These items are also selectable in the Load Item Assigner under the PullList/Raw tab.

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
