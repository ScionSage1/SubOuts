# SubOuts - MFC Sub Fabrication Tracker

## Project Overview

SubOuts is an internal web application for MetalsFab Corporation (MFC) to track fabrication work sent to outside sub-fabricators. When MFC is at capacity or needs specialty work, they send material (raw stock, cut-to-length, beams, parts) to sub-fabricators who complete the fabrication and return finished pieces.

**Key Users:**
- Project Managers (PMs) - decide what gets subbed, assign Lot numbers
- Purchasing - enters cutlist data into FabTracker
- Shop Floor - tracks shipments in/out
- Management - monitors sub work status across jobs

## Tech Stack

### Frontend
- **React 18** with Vite for fast development and HMR
- **TailwindCSS** for styling with custom color palette
- **React Router v6** for client-side routing
- **TanStack Query (React Query)** for server state management and caching
- **Axios** for HTTP requests
- **Lucide React** for icons
- **clsx** for conditional class names

### Backend
- **Node.js** with Express.js
- **mssql** package for SQL Server connection
- **CORS** enabled for development
- **JSON body parsing**

### Database
- **SQL Server** on server named "Voltron"
- **Schema**: `FabTracker` (adding tables to existing database)

## Project Structure

```
D:\Automation\SubOuts\subouts\
├── client/                     # React frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/         # Reusable UI components
│   │   │   │   ├── Badge.jsx
│   │   │   │   ├── Button.jsx
│   │   │   │   ├── Card.jsx
│   │   │   │   ├── Modal.jsx
│   │   │   │   ├── Select.jsx
│   │   │   │   ├── Input.jsx
│   │   │   │   ├── DatePicker.jsx
│   │   │   │   ├── LoadingSpinner.jsx
│   │   │   │   └── StatusBadge.jsx
│   │   │   ├── subouts/        # SubOut-specific components
│   │   │   │   ├── SubOutCard.jsx
│   │   │   │   ├── JobGroup.jsx
│   │   │   │   ├── SubOutForm.jsx
│   │   │   │   ├── SubOutDetail.jsx
│   │   │   │   ├── ItemsTable.jsx
│   │   │   │   ├── ItemPicker.jsx
│   │   │   │   └── VendorSelect.jsx
│   │   │   └── layout/         # Layout components
│   │   │       ├── Header.jsx
│   │   │       ├── Sidebar.jsx
│   │   │       └── Footer.jsx
│   │   ├── context/
│   │   │   └── AppContext.jsx  # Global app state (sidebar, dark mode)
│   │   ├── hooks/              # Custom React Query hooks
│   │   │   ├── useSubOuts.js
│   │   │   ├── useSubOutItems.js
│   │   │   ├── useVendors.js
│   │   │   ├── useJobs.js
│   │   │   ├── useCutlists.js
│   │   │   └── useDashboard.js
│   │   ├── pages/              # Route pages
│   │   │   ├── Dashboard.jsx
│   │   │   ├── SubOutsListPage.jsx
│   │   │   ├── SubOutDetailPage.jsx
│   │   │   ├── NewSubOutPage.jsx
│   │   │   ├── EditSubOutPage.jsx
│   │   │   ├── VendorsPage.jsx
│   │   │   ├── JobView.jsx
│   │   │   └── Settings.jsx
│   │   ├── services/
│   │   │   └── api.js          # Axios API client and service functions
│   │   ├── utils/
│   │   │   ├── statusColors.js # Status to color mapping
│   │   │   └── formatters.js   # Date, weight formatters
│   │   ├── App.jsx             # Main app with routes
│   │   ├── main.jsx            # Entry point
│   │   └── index.css           # Tailwind imports
│   ├── index.html
│   ├── vite.config.js          # Vite config with proxy to backend
│   ├── tailwind.config.js
│   └── package.json
├── server/                     # Express backend
│   ├── config/
│   │   └── database.js         # SQL Server connection config
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
│   │   └── errorHandler.js
│   ├── server.js               # Express server entry
│   └── package.json
├── database/
│   ├── schema.sql              # Database schema DDL
│   └── seed.sql                # Initial seed data (vendors)
└── CLAUDE.md                   # This file
```

## Database Schema

### Existing Tables (READ ONLY - join for data)

#### FabTracker.SSData
- `JobCode` (INT) - Primary job identifier
- `eJobDescription` (VARCHAR) - Job name/description
- `eProjectManager` (VARCHAR) - PM assigned to job

#### FabTracker.LongShapeCutlist
- `ID` (INT, PK) - Cutlist header ID
- `JobCode` (INT) - Links to SSData
- `Package` (VARCHAR) - Package/sequence identifier
- `Completed` (BIT) - Is cutlist complete

#### FabTracker.LongShapes
- `ID` (INT, PK) - Individual shape record
- `LongShapeCutlistID` (INT, FK) - Links to cutlist header
- `MainMark`, `PieceMark` - Assembly/piece identifiers
- `Shape`, `myDimension`, `Grade`, `myLength`, `RawLength`
- `Quantity`, `LeftQuantity`, `Weight`
- `Barcode`, `HeatNumber`, `CertNumber`
- `Status`, `PullStatus`

#### FabTracker.PullList
- `ID` (INT, PK) - Raw material pull record
- `LongShapeCutlistID` (INT, FK) - Links to cutlist
- `Shape`, `myDimension`, `Grade`, `RawLength`
- `Quantity`, `Weight`
- `Barcode`, `HeatNumber`, `PONumber`

#### FabTracker.PartsCutlist
- `ID` (INT, PK) - Parts cutlist header
- `JobCode` (INT)
- `Package` (VARCHAR)

#### FabTracker.Parts
- `ID` (INT, PK) - Individual part record
- `PartsCutlistID` (INT, FK)
- `MainMark`, `PieceMark`
- `Shape`, `myDimension`, `Grade`, `myLength`
- `Quantity`, `LeftQuantity`, `Weight`
- `HeatNumber`, `CertNumber`

### New Tables (SubOuts specific)

#### FabTracker.SubOutVendors
```sql
CREATE TABLE FabTracker.SubOutVendors (
    VendorID INT IDENTITY(1,1) PRIMARY KEY,
    VendorName NVARCHAR(100) NOT NULL,
    ContactName NVARCHAR(100),
    Phone NVARCHAR(50),
    Email NVARCHAR(100),
    Address NVARCHAR(500),
    IsActive BIT DEFAULT 1,
    Notes NVARCHAR(MAX),
    CreatedAt DATETIME DEFAULT GETDATE()
);
```

#### FabTracker.SubOuts
```sql
CREATE TABLE FabTracker.SubOuts (
    SubOutID INT IDENTITY(1,1) PRIMARY KEY,
    
    -- Job Info (JobDescription from SSData via join)
    JobCode INT NOT NULL,
    Lot NVARCHAR(50) NOT NULL,           -- SUB#001, SUB#005, etc.
    Description NVARCHAR(100),            -- Columns, Beams, Framing, etc.
    
    -- Vendor
    VendorID INT FOREIGN KEY REFERENCES FabTracker.SubOutVendors(VendorID),
    
    -- Outbound from MFC
    DateToLeaveMFC DATE,
    LoadsToShipFromMFC INT DEFAULT 1,
    LoadsShippedFromMFC INT DEFAULT 0,
    
    -- Inbound from Sub
    DateToShipFromSub DATE,
    LoadsToShipFromSub INT DEFAULT 1,
    LoadsShippedFromSub INT DEFAULT 0,
    
    -- Details
    Zone NVARCHAR(50),
    Weight DECIMAL(12,2),
    MajorPieces INT,
    MissingSteel NVARCHAR(MAX),
    
    -- Status
    Status NVARCHAR(50) DEFAULT 'Pending',
    
    -- Costs
    PONumber NVARCHAR(50),
    EstimatedCost DECIMAL(12,2),
    ActualCost DECIMAL(12,2),
    
    Notes NVARCHAR(MAX),
    CreatedAt DATETIME DEFAULT GETDATE(),
    UpdatedAt DATETIME,
    
    CONSTRAINT UQ_SubOuts_JobLot UNIQUE (JobCode, Lot)
);
```

#### FabTracker.SubOutItems
```sql
CREATE TABLE FabTracker.SubOutItems (
    SubOutItemID INT IDENTITY(1,1) PRIMARY KEY,
    SubOutID INT NOT NULL FOREIGN KEY REFERENCES FabTracker.SubOuts(SubOutID) ON DELETE CASCADE,
    
    -- Source reference
    SourceTable NVARCHAR(50) NOT NULL,   -- 'LongShapes', 'Parts', 'PullList'
    SourceID INT NOT NULL,
    
    -- Denormalized for display
    MainMark NVARCHAR(50),
    PieceMark NVARCHAR(50),
    Shape NVARCHAR(50),
    Dimension NVARCHAR(50),
    Grade NVARCHAR(50),
    Length NVARCHAR(50),
    
    -- Quantities
    Quantity INT,
    QuantitySent INT DEFAULT 0,
    QuantityReceived INT DEFAULT 0,
    
    Weight DECIMAL(18,2),
    
    -- Status
    Status NVARCHAR(50) DEFAULT 'Pending',
    
    -- Material tracking
    HeatNumber NVARCHAR(50),
    CertNumber NVARCHAR(255),
    Barcode NVARCHAR(50),
    
    Notes NVARCHAR(MAX),
    
    CONSTRAINT UQ_SubOutItems_Source UNIQUE (SubOutID, SourceTable, SourceID)
);
```

### Views

#### FabTracker.vwSubOutsList
```sql
CREATE VIEW FabTracker.vwSubOutsList AS
SELECT 
    s.SubOutID,
    s.JobCode,
    ss.eJobDescription AS JobDescription,
    ss.eProjectManager AS ProjectManager,
    s.Lot,
    s.Description,
    v.VendorID,
    v.VendorName AS SubFabricator,
    s.DateToLeaveMFC,
    s.LoadsToShipFromMFC,
    s.LoadsShippedFromMFC,
    CONCAT(s.LoadsShippedFromMFC, ' of ', s.LoadsToShipFromMFC) AS LoadsFromMFC,
    s.DateToShipFromSub,
    s.LoadsToShipFromSub,
    s.LoadsShippedFromSub,
    CONCAT(s.LoadsShippedFromSub, ' of ', s.LoadsToShipFromSub) AS LoadsFromSub,
    s.Zone,
    s.Weight,
    s.MajorPieces,
    s.MissingSteel,
    s.PONumber,
    s.Notes,
    s.Status,
    s.CreatedAt,
    s.UpdatedAt
FROM FabTracker.SubOuts s
LEFT JOIN FabTracker.SubOutVendors v ON s.VendorID = v.VendorID
LEFT JOIN FabTracker.SSData ss ON s.JobCode = ss.JobCode;
```

## API Endpoints

### SubOuts (`/api/subouts`)
- `GET /` - Get all sub outs (supports filters: jobCode, vendorId, status)
- `GET /grouped` - Get sub outs grouped by job (for dashboard cards)
- `GET /:id` - Get single sub out with items
- `POST /` - Create sub out
- `PUT /:id` - Update sub out
- `DELETE /:id` - Delete sub out (cascades to items)
- `PATCH /:id/status` - Update status only
- `PATCH /:id/loads-out` - Increment LoadsShippedFromMFC
- `PATCH /:id/loads-in` - Increment LoadsShippedFromSub

### SubOut Items (`/api/subouts/:subOutId/items`)
- `GET /` - Get all items for a sub out
- `POST /` - Add item(s) to sub out
- `PUT /:itemId` - Update item
- `DELETE /:itemId` - Remove item from sub out
- `POST /bulk` - Add multiple items at once

### Vendors (`/api/vendors`)
- `GET /` - Get all active vendors
- `GET /:id` - Get single vendor
- `POST /` - Create vendor
- `PUT /:id` - Update vendor
- `DELETE /:id` - Soft delete (set IsActive = 0)

### Jobs (`/api/jobs`)
- `GET /` - Get active jobs from SSData (JobCode, eJobDescription)
- `GET /:jobCode` - Get single job details
- `GET /:jobCode/subouts` - Get all sub outs for a job

### Cutlists (`/api/cutlists`)
- `GET /longshapes/:jobCode` - Get LongShapes for a job (available to add)
- `GET /parts/:jobCode` - Get Parts for a job
- `GET /pulllist/:jobCode` - Get PullList items for a job
- `GET /available/:jobCode` - Get all available items not yet assigned to a sub out

### Dashboard (`/api/dashboard`)
- `GET /stats` - Overall statistics
- `GET /action-items` - Items needing attention (overdue, missing steel)
- `GET /by-vendor` - Summary by vendor
- `GET /recent` - Recent activity

## UI Design

### Color Coding System

#### Status Colors
```javascript
const statusColors = {
  'Pending':    { bg: 'bg-gray-100',    text: 'text-gray-800',    border: 'border-gray-300' },
  'Ready':      { bg: 'bg-blue-100',    text: 'text-blue-800',    border: 'border-blue-300' },
  'Sent':       { bg: 'bg-yellow-100',  text: 'text-yellow-800',  border: 'border-yellow-300' },
  'InProcess':  { bg: 'bg-orange-100',  text: 'text-orange-800',  border: 'border-orange-300' },
  'Shipped':    { bg: 'bg-purple-100',  text: 'text-purple-800',  border: 'border-purple-300' },
  'Received':   { bg: 'bg-teal-100',    text: 'text-teal-800',    border: 'border-teal-300' },
  'QCd':        { bg: 'bg-green-100',   text: 'text-green-800',   border: 'border-green-300' },
  'Complete':   { bg: 'bg-green-200',   text: 'text-green-900',   border: 'border-green-400' },
};
```

#### Action Item Colors (Card Left Border)
```javascript
const actionColors = {
  overdueSend:     'border-l-4 border-l-red-500',      // Past DateToLeaveMFC, not fully shipped
  overdueReceive:  'border-l-4 border-l-orange-500',   // Past DateToShipFromSub, not received
  missingSteel:    'border-l-4 border-l-pink-500',     // Has MissingSteel value
  readyToShip:     'border-l-4 border-l-blue-500',     // Ready status, upcoming date
  inProgress:      'border-l-4 border-l-yellow-500',   // Sent but not complete
  complete:        'border-l-4 border-l-green-500',    // All done
  default:         'border-l-4 border-l-gray-300',
};
```

#### Row Highlighting (matching spreadsheet)
- **Pink/Red Row**: Missing Steel has value
- **Green Row**: Complete (all loads shipped from sub and received)
- **Yellow Row**: Partial (some loads shipped, not complete)
- **White Row**: Pending/Ready

### Dashboard Layout

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  HEADER: SubOuts Tracker                              [Search] [+ New Sub]  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  STATS BAR                                                                  │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐          │
│  │ Total    │ │ Pending  │ │ In       │ │ Action   │ │ Complete │          │
│  │ Active   │ │ Shipment │ │ Progress │ │ Required │ │ This Mo  │          │
│  │   24     │ │    8     │ │   12     │ │    4     │ │    6     │          │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘ └──────────┘          │
│                                                                             │
│  FILTER BAR: [All Jobs ▼] [All Vendors ▼] [All Status ▼] [Action Items ☐]  │
│                                                                             │
│  ═══════════════════════════════════════════════════════════════════════   │
│                                                                             │
│  JOB GROUP CARD: 6526 - PDX-071                                            │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │ ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐         │   │
│  │ │ ▌SUB#001        │ │ ▌SUB#004        │ │ ▌SUB#007        │         │   │
│  │ │ Guardrails      │ │ Framing         │ │ Framing         │         │   │
│  │ │ IMF             │ │ ST Fab          │ │ ST Fab          │         │   │
│  │ │                 │ │                 │ │                 │         │   │
│  │ │ Out: 1/1 ✓      │ │ Out: 4/4 ✓      │ │ Out: 2/2 ✓      │         │   │
│  │ │ In:  0/1        │ │ In:  0/4        │ │ In:  0/2        │         │   │
│  │ │                 │ │                 │ │                 │         │   │
│  │ │ Ship: 1/30/26   │ │ Ship: 12/10/25  │ │ Ship: 12/10/25  │         │   │
│  │ │ 34 pcs | 3.5T   │ │ 80 pcs | 190T   │ │ 60 pcs | 80T    │         │   │
│  │ │                 │ │                 │ │                 │         │   │
│  │ │ [SENT]          │ │ [SENT]          │ │ [SENT]          │         │   │
│  │ └─────────────────┘ └─────────────────┘ └─────────────────┘         │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  JOB GROUP CARD: 6509 - Vancouver Temple                                   │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │ ┌─────────────────┐                                                  │   │
│  │ │ ▌SUB#005        │                                                  │   │
│  │ │ Columns         │                                                  │   │
│  │ │ Mohawk          │                                                  │   │
│  │ │                 │                                                  │   │
│  │ │ Out: 2/2 ✓      │                                                  │   │
│  │ │ In:  0/2        │                                                  │   │
│  │ │                 │                                                  │   │
│  │ │ Ship: 1/19/26   │                                                  │   │
│  │ │ 18 pcs | 86T    │                                                  │   │
│  │ │                 │                                                  │   │
│  │ │ [SENT]          │  Note: MFC to Supply WF and HSS only            │   │
│  │ └─────────────────┘                                                  │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### SubOut Card Component (SubOutCard.jsx)

Each card displays:
- **Left border**: Color-coded by action status
- **Header**: Lot number (SUB#xxx) + Description
- **Vendor**: Sub fabricator name
- **Shipment Progress**:
  - Out: X of Y (✓ if complete)
  - In: X of Y (✓ if complete)
- **Key Date**: DateToShipFromSub (when expecting return)
- **Summary**: Major pieces count | Total weight
- **Status Badge**: Current status
- **Notes preview**: Truncated notes if present
- **Missing Steel indicator**: Pink highlight if has value

### SubOut Detail Page

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  ← Back to Dashboard                                                        │
│                                                                             │
│  6526 - PDX-071 > SUB#004 - Framing                          [Edit] [Del]  │
│                                                                             │
│  ┌─────────────────────────────────┐  ┌─────────────────────────────────┐  │
│  │ DETAILS                         │  │ SHIPMENT TRACKING               │  │
│  │                                 │  │                                 │  │
│  │ Vendor:    ST Fab               │  │ FROM MFC        FROM SUB        │  │
│  │ Zone:      2, 3                 │  │ ┌─────────┐    ┌─────────┐      │  │
│  │ Weight:    190,969 lbs          │  │ │  4 / 4  │    │  0 / 4  │      │  │
│  │ Pieces:    80 major             │  │ │   ✓     │    │         │      │  │
│  │ PO#:       PO-2025-1234         │  │ └─────────┘    └─────────┘      │  │
│  │                                 │  │ Leave: 12/10   Due: 1/15        │  │
│  │ Status:    [SENT]               │  │                                 │  │
│  │                                 │  │ [+1 Load Out]  [+1 Load In]     │  │
│  └─────────────────────────────────┘  └─────────────────────────────────┘  │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │ MISSING STEEL                                                  [Edit]│   │
│  │ (none)                                                               │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │ NOTES                                                          [Edit]│   │
│  │ (none)                                                               │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ═══════════════════════════════════════════════════════════════════════   │
│                                                                             │
│  ITEMS (124 total)                    [+ Add Items] [Import from Cutlist]  │
│                                                                             │
│  TABS: [LongShapes (98)] [Parts (20)] [PullList/Raw (6)]                   │
│                                                                             │
│  ┌──────┬──────────┬────────┬───────┬───────┬─────┬───────┬────────┬─────┐ │
│  │ Mark │ PieceMark│ Shape  │ Size  │ Grade │ Len │  Qty  │ Status │  ▼  │ │
│  ├──────┼──────────┼────────┼───────┼───────┼─────┼───────┼────────┼─────┤ │
│  │ B1   │ B1-1     │ W12x26 │ 12x6  │ A992  │ 22' │ 4/4/0 │ Sent   │ ... │ │
│  │ B1   │ B1-2     │ W12x26 │ 12x6  │ A992  │ 18' │ 2/2/0 │ Sent   │ ... │ │
│  │ B2   │ B2-1     │ W14x30 │ 14x7  │ A992  │ 30' │ 6/6/0 │ Sent   │ ... │ │
│  │ ...  │ ...      │ ...    │ ...   │ ...   │ ... │ ...   │ ...    │ ... │ │
│  └──────┴──────────┴────────┴───────┴───────┴─────┴───────┴────────┴─────┘ │
│                                                                             │
│  Qty columns: Total / Sent / Received                                       │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Item Picker Modal

When adding items from cutlists:
```
┌─────────────────────────────────────────────────────────────────────────────┐
│  Add Items to SUB#004                                              [X]      │
│                                                                             │
│  Source: [LongShapes ▼]  Package: [All ▼]  [Search...]                     │
│                                                                             │
│  ☐ Select All (showing 45 available)                                        │
│                                                                             │
│  ┌──────┬──────────┬────────┬───────┬───────┬─────┬─────┬──────────────┐   │
│  │ ☐    │ Mark     │ Shape  │ Size  │ Grade │ Len │ Qty │ Already In   │   │
│  ├──────┼──────────┼────────┼───────┼───────┼─────┼─────┼──────────────┤   │
│  │ ☑    │ B1-1     │ W12x26 │ 12x6  │ A992  │ 22' │  4  │              │   │
│  │ ☑    │ B1-2     │ W12x26 │ 12x6  │ A992  │ 18' │  2  │              │   │
│  │ ☐    │ C1-1     │ W10x22 │ 10x6  │ A992  │ 15' │  8  │ SUB#001      │   │
│  │ ☐    │ C1-2     │ W10x22 │ 10x6  │ A992  │ 12' │  4  │ SUB#001      │   │
│  └──────┴──────────┴────────┴───────┴───────┴─────┴─────┴──────────────┘   │
│                                                                             │
│  Selected: 2 items (6 pieces, 2,450 lbs)                                    │
│                                                                             │
│                                            [Cancel]  [Add Selected Items]   │
└─────────────────────────────────────────────────────────────────────────────┘
```

### List View (Alternative to Cards)

Also support a table view matching the spreadsheet layout:
```
┌─────────────────────────────────────────────────────────────────────────────┐
│  VIEW: [Cards] [Table]                                                      │
│                                                                             │
│  ┌─────┬────────────┬─────────┬───────────┬──────────┬─────────┬─────────┐ │
│  │ Job │ Job Desc   │ Lot     │ Desc      │ Vendor   │ Leave   │ Loads   │ │
│  │     │            │         │           │          │ MFC     │ Out     │ │
│  ├─────┼────────────┼─────────┼───────────┼──────────┼─────────┼─────────┤ │
│  │6509 │ Van Temple │ SUB#005 │ Columns   │ Mohawk   │ 11/14   │ 2 of 2  │ │
│  │6526 │ PDX-071    │ SUB#001 │ Guardrails│ IMF      │ 12/8    │ 1 of 1  │ │
│  │6526 │ PDX-071    │ SUB#004 │ Framing   │ ST Fab   │ 12/10   │ 4 of 4  │ │
│  └─────┴────────────┴─────────┴───────────┴──────────┴─────────┴─────────┘ │
│                                                                             │
│  (continued columns: Ship From Sub, Loads In, Zone, Weight, Pcs, Missing)  │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Status Flow

```
Pending → Ready → Sent → InProcess → Shipped → Received → QCd → Complete
   │                                                              │
   └──────────────────────────────────────────────────────────────┘
                    (can jump based on loads tracking)
```

**Auto-status rules (optional):**
- `Ready`: DateToLeaveMFC is set and upcoming
- `Sent`: LoadsShippedFromMFC > 0
- `Complete`: LoadsShippedFromSub = LoadsToShipFromSub AND all received

## Development Commands

```bash
# Frontend development
cd client
npm install
npm run dev              # Runs on port 3004, proxies /api to :3005

# Backend development
cd server
npm install
npm run dev              # Runs on port 3005
```

## Production Deployment

### Server Info
- **VM:** 10.0.0.10
- **Path:** C:\ServerApp\SubOuts
- **URL:** http://10.0.0.10:3005
- **PM2 Service:** subouts-api
- **GitHub:** https://github.com/ScionSage1/subouts

### Ports
| Environment | Client | Server |
|-------------|--------|--------|
| Development | 3004   | 3005   |
| Production  | 3005 (served by Express) | 3005 |

### Production Environment Variables
Server `.env` on VM:
```
DB_SERVER=Voltron
DB_DATABASE=FabTracker
DB_USER=sa
DB_PASSWORD=<password>
DB_PORT=1433
DB_ENCRYPT=false
DB_TRUST_CERTIFICATE=false
PORT=3005
NODE_ENV=production
CORS_ORIGIN=http://10.0.0.10:3005
```

## Code Conventions

### Frontend
- React functional components with hooks
- TanStack Query for all API calls
- Custom hooks in `/hooks` for data fetching
- Services in `/services/api.js` for API client
- Tailwind utility classes for styling
- Lucide icons throughout

### Backend
- Express router pattern with separate route files
- Controller pattern for business logic
- Centralized error handling middleware
- SQL parameterized queries to prevent injection

### Naming Conventions
- React components: PascalCase
- Hooks: camelCase with `use` prefix
- API responses: `{ success: boolean, data: any, error?: string }`
- Database columns: PascalCase (e.g., SubOutID, JobCode)
- JavaScript variables: camelCase

### SQL Query Patterns

**Get grouped sub outs for dashboard:**
```sql
SELECT 
    JobCode,
    JobDescription,
    (
        SELECT 
            SubOutID, Lot, Description, SubFabricator, Status,
            DateToLeaveMFC, DateToShipFromSub,
            LoadsShippedFromMFC, LoadsToShipFromMFC,
            LoadsShippedFromSub, LoadsToShipFromSub,
            Weight, MajorPieces, MissingSteel, Notes
        FROM FabTracker.vwSubOutsList sub
        WHERE sub.JobCode = jobs.JobCode
        ORDER BY Lot
        FOR JSON PATH
    ) AS SubOuts
FROM (SELECT DISTINCT JobCode, JobDescription FROM FabTracker.vwSubOutsList) jobs
ORDER BY JobCode DESC;
```

**Get available items not yet subbed:**
```sql
SELECT ls.*, 'LongShapes' AS SourceTable
FROM FabTracker.LongShapes ls
JOIN FabTracker.LongShapeCutlist lsc ON ls.LongShapeCutlistID = lsc.ID
WHERE lsc.JobCode = @JobCode
AND ls.ID NOT IN (
    SELECT SourceID FROM FabTracker.SubOutItems 
    WHERE SourceTable = 'LongShapes'
)
ORDER BY ls.MainMark, ls.PieceMark;
```

## Seed Data

### Vendors
```sql
INSERT INTO FabTracker.SubOutVendors (VendorName) VALUES 
    ('Mohawk'),
    ('IMF'),
    ('Finnoe'),
    ('ST Fab'),
    ('Max Manufacturing'),
    ('Greybeard'),
    ('Mountain Metals');
```

## Common Issues & Solutions

### 1. Job Description Not Showing
Ensure SSData has a record for the JobCode. The view uses LEFT JOIN so SubOut will show but JobDescription will be NULL.

### 2. Duplicate Item Assignment
The unique constraint `UQ_SubOutItems_Source` prevents adding the same source item to multiple sub outs. UI should show "Already in SUB#xxx" in the picker.

### 3. Weight/Piece Count Sync
Consider adding triggers or recalculating totals when items are added/removed. Or calculate on-the-fly in the view.

### 4. Partial Quantities
The QuantitySent/QuantityReceived on SubOutItems allows partial shipments. UI should support incrementing these values.
