# Changelog

All notable changes to the SubOuts project will be documented in this file.

Format: [Date] - Summary of changes

---

## 2026-02-19 (Part 4)

### Changed
- **Status Flow Reordered** — New order: Pending → In-Process → Ready → Sent → Shipped → Received → QCd → Complete → OnSite
  - In-Process moved before Ready (was after Sent)
  - New **OnSite** status added after Complete for steel delivered to the job site
  - Both Complete and OnSite treated as archived (hidden from active views by default)
  - Updated: statusColors.js, SubOutDetail.jsx, SubOutCard.jsx, Dashboard SQL queries, archive filters
  - Updated: HowToGuide status stepper, CLAUDE.md status flow documentation

---

## 2026-02-19 (Part 3)

### Enhanced
- **Comprehensive Activity Logging** — All load and pallet operations now logged to activity timeline
  - Load operations: edit, delete, assign items, remove items, assign pallets, remove pallets
  - Pallet operations: edit, delete, status change, assign items, remove items, assign/unassign from load
  - SubOut edit operations also now tracked
  - Activity timeline UI updated with icons and colors for all 20 event types (Edit3, Trash2, LinkIcon icons)
  - `server/controllers/loadController.js`, `server/controllers/palletController.js`, `server/controllers/subOutController.js`
  - `client/src/pages/SubOutDetailPage.jsx`

---

## 2026-02-19 (Part 2)

### Added
- **Dashboard Panels** — Action Items, Vendor Summary, Recent Activity, and Follow-Up Reminders
  - Four collapsible panels between stats bar and filter bar on Dashboard
  - Action Items: color-coded dots (red=Overdue Send, orange=Overdue Receive, pink=Missing Steel) with links to SubOuts
  - Follow-Ups: pending follow-ups with vendor name, type badge, due date, and quick complete button
  - Vendor Summary: table showing active/pending/in-progress/complete counts and weight per vendor
  - Recent Activity: last 10 updated SubOuts with status badges and relative timestamps
  - `client/src/pages/Dashboard.jsx`

- **Inline Status Changes** — Clickable status stepper bar on SubOut detail page
  - Horizontal bar of 8 status pills (Pending through Complete)
  - Past statuses show checkmark, current has ring highlight, future are gray
  - Click any status to change directly without editing
  - `client/src/components/subouts/SubOutDetail.jsx`, `client/src/pages/SubOutDetailPage.jsx`

- **Print-Friendly Bill of Lading** — Print button on each load card
  - Opens a new browser window with clean, print-optimized load manifest
  - Shows SubOut info, load details, truck info, items table, pallets table, totals, signature lines
  - Auto-prints via window.print() on load
  - `client/src/components/subouts/LoadPrintView.jsx` (new), `client/src/components/subouts/LoadsSection.jsx`

- **Vendor Workload Overview** — Workload summary section on Vendors page
  - Collapsible panel showing active vendors with SubOut counts and weight
  - Per-vendor stacked progress bars (green=complete, yellow=active, blue=pending)
  - Overdue count badge (red) for vendors with overdue SubOuts
  - Backend SQL enhanced to include OverdueCount per vendor
  - `client/src/pages/VendorsPage.jsx`, `server/controllers/dashboardController.js`

- **SubOut Activity Timeline / Audit Log** — Activity history on SubOut detail page
  - New `SubOutActivityLog` database table with cascading delete
  - Backend helper `logActivity()` for non-blocking event recording
  - Instrumented controllers: status changes, items added/removed, loads created, load status changes, pallets created
  - Timeline UI with colored event icons, descriptions, user attribution, and relative timestamps
  - User identification sent via X-User request header from localStorage
  - `database/add_activity_log.sql`, `server/helpers/activityLog.js`, `server/controllers/activityController.js`, `server/routes/activity.js`
  - `client/src/hooks/useActivity.js`, `client/src/pages/SubOutDetailPage.jsx`, `client/src/services/api.js`

---

## 2026-02-19

### Added
- **Heat map gradient on SubOut cards** - Cards show urgency-based background gradient
  - Color ranges from subtle yellow (low urgency) to red (critical) based on days until Leave MFC date × percent unloaded
  - Complete status or 100% loaded shows subtle green tint
  - No gradient for cards with no leave date or no items
  - `client/src/components/subouts/SubOutCard.jsx`

- **Per-status load badges on cards** - Load progress bars now show status breakdown
  - Blue badge: "X loading", Indigo badge: "X loaded", Yellow badge: "X in transit"
  - Shown below each direction's progress bar when loads exist and aren't all delivered
  - Database view updated with OutboundLoadingCount, OutboundLoadedCount, OutboundInTransitCount (and inbound equivalents)
  - `client/src/components/subouts/SubOutCard.jsx`, `database/add_percent_loaded.sql`, `database/add_send_types_pallets_loads.sql`

- **Percent loaded on SubOut cards** - Cards show "X% loaded" with truck icon in stats footer
  - Green text when 100% loaded, blue when partially loaded, gray when 0%
  - Calculation uses barcode-linked items (LongShape loaded if its PullList barcode-match is on a load)
  - `client/src/components/subouts/SubOutCard.jsx`, `database/add_percent_loaded.sql`

- **"Loaded" load status** - New status between Loading and InTransit in load status flow
  - Indigo color scheme (bg-indigo-100, text-indigo-800)
  - `client/src/utils/statusColors.js`, `client/src/utils/formatters.js`, `client/src/pages/HowToGuide.jsx`

- **How-To Guide as separate menu item** - Moved from Settings tab to its own sidebar entry with BookOpen icon
  - `client/src/pages/HowToGuide.jsx` (new file), `client/src/pages/Settings.jsx`, `client/src/App.jsx`, `client/src/components/layout/Sidebar.jsx`

- **Mutual exclusion in load assigner** - PullList/Raw and LongShapes items with shared barcodes block each other
  - If Raw items are selected, matching LongShapes become unavailable (and vice versa)
  - Ensures loads contain either raw material OR cut-to-length, never both for the same barcode
  - `client/src/components/subouts/LoadItemAssigner.jsx`

### Changed
- **SubOut card "Due Back" → "Due to Site"** - Label updated on card date section
- **SubOut card weight display** - Now shows rounded integer with comma separators (e.g., "48,000 lbs") instead of tons format
- **SubOut card percent label** - Shows "X% loaded" instead of just "X%"

### Fixed
- **Dashboard not refreshing after load changes** - Added `['subouts', 'grouped']` query invalidation to useAssignItemsToLoad, useRemoveItemFromLoad, useAssignPalletsToLoad, useRemovePalletFromLoad, useUpdateLoad
  - `client/src/hooks/useLoads.js`

- **Percent loaded miscounting barcode-linked items** - SQL view now counts LongShapes as loaded when their barcode-linked PullList item is on a load
  - `database/add_percent_loaded.sql`, `database/add_send_types_pallets_loads.sql`

- **Load assigner PullList tab count** - Excluded items already on the current load from the available count
  - `client/src/components/subouts/LoadItemAssigner.jsx`

---

## 2026-02-18

### Added
- **Raw Material from Tekla Inventory** - Add raw material (plates, angles, etc.) from Tekla inventory
  - "Add Raw Material" button on SubOut detail page opens matcher modal
  - Shape and Grade dropdowns populated from distinct Tekla inventory values
  - Matching inventory displayed with dimension, stock length, weight, in-stock count
  - Quantity picker to select how many sticks to add
  - Items added with SourceTable='TeklaInventory', SendType='Raw'
  - New API: `GET /api/tekla/inventory/filters` returns distinct shapes/grades
  - New API: `GET /api/tekla/inventory/match` returns inventory matching shape+grade pairs
  - `server/controllers/teklaController.js`, `server/routes/tekla.js`
  - `client/src/components/subouts/RawMaterialMatcher.jsx` (new), `client/src/hooks/useTekla.js` (new)
  - `client/src/services/api.js`, `client/src/pages/SubOutDetailPage.jsx`

- **TeklaInventory items in PullList/Raw tab** - Items from Tekla inventory now appear on the PullList/Raw tab
  - ItemsTable filters include TeklaInventory source alongside PullList
  - LoadItemAssigner PullList/Raw tab includes TeklaInventory items for load assignment
  - `client/src/components/subouts/ItemsTable.jsx`, `client/src/components/subouts/LoadItemAssigner.jsx`

- **SubOutCard redesign** - Richer card design with more info and visual polish
  - Top colored accent bar replacing left border (same color logic)
  - Hover shadow lift effect
  - Both dates shown: Leave MFC + Due Back with overdue highlighting
  - Mini progress bars for outbound/inbound loads (active loads shown at 50% fill)
  - Icons, zone badge, PO number displayed
  - `client/src/components/subouts/SubOutCard.jsx`, `client/src/utils/statusColors.js`

- **Strikethrough for assigned items** - Items on a pallet or load show with strikethrough in ItemsTable
  - Applied across all tabs (LongShapes, Parts, PullList, Combined)
  - `client/src/components/subouts/ItemsTable.jsx`

- **Double-load prevention** - Backend guard prevents assigning items already on another load
  - Returns 400 error listing conflicting items
  - `server/controllers/loadController.js`

- **Tekla inventory weight enrichment** - PullList items now display weights from Tekla inventory
  - Backend calls MFCCortex `tekla_get_inventory` tool to fetch 13,410+ inventory records
  - Matches items by shape/dimension/grade/length composite key, converts kg→lbs
  - 30-minute in-memory cache to avoid repeated API calls
  - TeklaWeight shown in blue text to distinguish from database weights
  - `server/config/tekla.js`, `server/controllers/subOutController.js`

- **Total weight in ItemsTable summary bar** - Each tab shows total weight (items × quantity)
  - `client/src/components/subouts/ItemsTable.jsx`

- **Source-type tabs in LoadItemAssigner** - Replaced flat "Items" tab with LongShapes, Parts, PullList/Raw, and Pallets tabs
  - Each tab shows source-appropriate columns (marks, shape, size, grade, length)
  - Selections persist across tabs with badge counts
  - `client/src/components/subouts/LoadItemAssigner.jsx`, `client/src/components/subouts/LoadsSection.jsx`

- **Load capacity tracking (48,000 lbs)** - Default truck capacity with live remaining display
  - Load card headers show remaining capacity color-coded (green/orange/red)
  - LoadItemAssigner shows capacity progress bar that updates as items are selected
  - `client/src/components/subouts/LoadsSection.jsx`, `client/src/components/subouts/LoadItemAssigner.jsx`

- **Weight and remove on load items** - Load card expanded view shows weight per item in lbs and X button to remove
  - PullList items show shape/size/grade/length instead of marks
  - Pallets on loads are expandable to show their items with weights and removable
  - `client/src/components/subouts/LoadsSection.jsx`, `client/src/pages/SubOutDetailPage.jsx`

- **Multi-select bulk Set Send Type** - LongShapes and Parts tabs now have checkbox selection with bulk "Set Send Type" action bar
  - `client/src/components/subouts/ItemsTable.jsx`

- **Pallet computed weight and parts summary** - Pallet cards show total weight computed from items (TeklaWeight × qty) and grouped parts summary (e.g. "40 W 14 x 30")
  - `client/src/components/subouts/PalletsSection.jsx`

- **Loading message** - SubOut detail page shows "Fetching inventory from Tekla..." during load
  - `client/src/components/common/LoadingSpinner.jsx`, `client/src/pages/SubOutDetailPage.jsx`

- **Weight column on ItemsTable & ItemPicker** - Weight now visible on all item grids
  - Sortable Weight column added to LongShapes, Parts, PullList, and Combined tabs
  - Weight column added to ItemPicker modal (LongShapes, Parts, PullList/Raw tabs)
  - Uses `formatWeight` formatter (lbs or tons)
  - Weight included in search filter
  - `client/src/components/subouts/ItemsTable.jsx`, `client/src/components/subouts/ItemPicker.jsx`

### Removed
- **Quick Ship buttons** - Removed "Quick" buttons from Loads section (redundant with full load tracking)
  - `client/src/components/subouts/LoadsSection.jsx`, `client/src/pages/SubOutDetailPage.jsx`

### Fixed
- **Checkbox click in assigners** - Fixed event bubbling causing double-toggle when clicking directly on checkboxes
  - `client/src/components/subouts/PalletItemAssigner.jsx`, `client/src/components/subouts/LoadItemAssigner.jsx`

---

## 2026-02-17

### Added
- **Sortable columns & search filter** - All ItemsTable grids are now sortable and filterable
  - Click any column header to sort ascending/descending (third click clears sort)
  - Sort indicators show on hover and turn blue when active
  - New "Search items..." text input filters across all text fields (Shape, MainMark, PieceMark, Grade, Barcode, etc.)
  - Clear button (✕) on search input, sort resets on tab change
  - Combined tab sorts parent rows, orphan rows, and children independently
  - Summary bar shows active sort column with a "clear" link
  - `client/src/components/subouts/ItemsTable.jsx` - Added sortConfig state, sortComparator, renderSortHeader, searchFilter

- **Multi-select bulk PullStatus update** - Select multiple PullList items and change their PullStatus at once
  - Checkbox column on PullList tab with select-all header
  - Bulk action bar with PullStatus dropdown when items are selected
  - Removed non-functional edit button from PullList tab rows
  - `server/controllers/cutlistController.js` - New bulkUpdatePullListStatus endpoint
  - `server/routes/cutlists.js` - PATCH /pulllist/bulk-status route
  - `client/src/hooks/useCutlists.js` - useBulkUpdatePullListStatus mutation hook

- **PullStatus & RMNumber columns** - Pull list items now show PullStatus and RMNumber from source FabTracker.PullList table
  - `server/controllers/configController.js` + `server/routes/config.js` - New config endpoint to fetch LongPullStatus lookup values from ConfigItems
  - `server/controllers/cutlistController.js` - Added PullStatus/RMNumber to pulllist queries + new PUT endpoint to update source PullList table
  - `server/controllers/subOutController.js` - Enriches PullList items with current PullStatus/RMNumber when loading SubOut detail
  - `client/src/hooks/useConfig.js` - New usePullStatuses hook (30min stale time)
  - `client/src/hooks/useCutlists.js` - Added useUpdatePullListSource mutation hook
  - `client/src/services/api.js` - Added configApi and cutlistsApi.updatePullListSource
  - `client/src/components/subouts/ItemsTable.jsx` - PullStatus inline dropdown + RMNumber click-to-edit on PullList tab and Combined tab parent rows
  - `client/src/pages/SubOutDetailPage.jsx` - Wired up new hooks and props
  - `server/server.js` - Mounted /api/config routes

---

## 2026-02-16

### Added
- **Send Types** - Items can now be classified as Raw, Cut to Length, or Parts on Pallets
  - `SendTypeBadge.jsx` - Color-coded badge component (gray/blue/purple)
  - `ItemsTable.jsx` - Added SendType column with inline dropdown editing, send type filter
  - `ItemPicker.jsx` - Send type selector with smart defaults per tab (PullList→Raw, LongShapes→Cut to Length, Parts→Parts on Pallets)

- **Pallet tracking** - Group parts onto pallets before shipping
  - `database/add_send_types_pallets_loads.sql` - New SubOutPallets table, SubOutItems altered with SendType/PalletID/LoadID columns
  - `server/controllers/palletController.js` + `server/routes/pallets.js` - Full CRUD, item assignment, load assignment, auto-numbering (P-001, P-002...)
  - `client/src/hooks/usePallets.js` - React Query hooks for all pallet operations
  - `client/src/components/subouts/PalletsSection.jsx` - Expandable pallet cards with items, status dropdown, load assignment
  - `client/src/components/subouts/PalletForm.jsx` - Modal for pallet create/edit (dimensions, weight, notes)
  - `client/src/components/subouts/PalletItemAssigner.jsx` - Modal to assign PartsOnPallets items to a pallet

- **Load tracking** - Full load entities replacing simple counters
  - `database/add_send_types_pallets_loads.sql` - New SubOutLoads table with truck/trailer/driver/BOL info
  - `server/controllers/loadController.js` + `server/routes/loads.js` - Full CRUD, status tracking, item/pallet assignment, auto-numbering (OUT-001, IN-001)
  - `client/src/hooks/useLoads.js` - React Query hooks for all load operations
  - `client/src/components/subouts/LoadsSection.jsx` - Two-column layout (Outbound/Inbound) with progress bars, expandable load cards, Quick Ship button
  - `client/src/components/subouts/LoadForm.jsx` - Modal for load create/edit (direction, dates, truck info)
  - `client/src/components/subouts/LoadItemAssigner.jsx` - Modal with Items/Pallets tabs to assign to a load

- **New database views** - `vwSubOutLoadsDetail`, `vwSubOutPalletsDetail`
- **API layer** - `palletsApi` and `loadsApi` in `client/src/services/api.js`
- **Utility additions** - `formatDimensions`, `formatSendType`, `formatLoadStatus` in formatters; pallet/load/sendType color maps in statusColors

### Changed
- **SubOutDetail.jsx** - Replaced old shipment tracking card with children-based composition (LoadsSection, PalletsSection, Items)
- **SubOutDetailPage.jsx** - Wired up all pallet and load hooks/mutations, passes `onUpdateSendType` to ItemsTable
- **SubOutForm.jsx** - Removed "Loads Shipped" fields (now tracked via load entities), simplified to planning dates and planned load counts
- **SubOutCard.jsx** - Uses new computed load counts (OutboundLoadCount/DeliveredCount) with legacy field fallback
- **SubOutsListPage.jsx** - Uses new computed load counts with legacy fallback
- **Dashboard.jsx** - Action items filter uses new computed load counts with legacy fallback
- **statusColors.js** - `getActionColor` and `getRowColor` use new computed load counts with legacy fallback
- **server/controllers/subOutController.js** - `getSubOutById` fetches pallets and loads; `incrementLoadsOut/In` create actual load records and sync legacy counters
- **server/controllers/subOutItemController.js** - `addItem`, `bulkAddItems`, `updateItem` support SendType field
- **server/server.js** - Registered pallet and load routes
- **useSubOuts.js** - Increment hooks invalidate loads queries
- **vwSubOutsList** - Updated with computed OutboundLoadCount, OutboundDeliveredCount, InboundLoadCount, InboundDeliveredCount columns

---

## 2026-02-03

### Added
- **User login prompt on load** - Modal asking "Who are you?" on first visit, saves selection to localStorage
  - `client/src/components/common/UserSelectModal.jsx` - New login modal component
  - `client/src/context/AppContext.jsx` - Added currentUser state, setCurrentUser, logout, users list
  - `client/src/App.jsx` - Added UserSelectModal, pass currentUser to AiChat
  - Users: Doug, Todd, Blake, Evan, Ken, Joe L., Joe S., Conrad

- **MFCCortex AI Chat integration** - Floating AI chat panel connected to MFCCortex server
  - `client/src/components/cortex/` - New directory with chat components:
    - `AiChat.jsx` - Main floating chat panel
    - `ChatHeader.jsx` - Chat header with title and close button
    - `ChatMessage.jsx` - Message bubble component
    - `ChatInput.jsx` - Text input for sending messages
    - `ChatToolCall.jsx` - Tool call result display
    - `useAiChat.js` - React hook for chat state and SSE streaming
    - `cortex-config.js` - Configuration (server URL, app ID)
  - `client/src/App.jsx` - Added AiChat component with onToolResult handler

- **Communication log for Sub Fabricators** - Track all communications with vendors
  - `database/add_communication_log.sql` - New table SubFabricatorCommunicationLog
  - `server/routes/communications.js` - Full CRUD API for communication logs
  - `client/src/hooks/useCommunications.js` - React Query hooks
  - `client/src/services/api.js` - Added communicationsApi methods
  - `client/src/pages/VendorsPage.jsx` - Added expandable communication log per vendor

- **Edit/Delete communication entries** - Can now edit or delete any communication log entry
  - `client/src/pages/VendorsPage.jsx` - Added edit/delete buttons, edit modal support
  - `server/routes/communications.js` - Fixed PUT route to use COALESCE for optional fields

### Changed
- **Vendors page renamed to Sub Fabricators** - Complete redesign based on Excel spreadsheet
  - `client/src/pages/VendorsPage.jsx` - New table layout with sorting, filtering, expandable rows
  - Added columns: City, State, Size, AISC Board, MFC Outreach Rep, Last Contact Date
  - Communication log displayed in expanded row section

- **MFC Outreach Rep options** - Updated to full list: Doug, Todd, Blake, Evan, Ken, Joe L., Joe S., Conrad

- **Vendor database schema** - Added new columns to SubOutVendors table:
  - City, State, Size, AISCBoard, MFCOutreach, LastContactDate

### Fixed
- **Auto-refresh after AI logs communication** - App.jsx onToolResult handler invalidates queries when AI logs entry

---

## 2026-01-29

### Changed
- **Settings page** (`client/src/pages/Settings.jsx`) - Rebuilt with tabbed layout
  - Added **Settings** / **How-To Guide** tab switcher
  - All original settings content preserved on the Settings tab
  - Added comprehensive **How-To Guide** tab with 8 collapsible, color-coded sections:
    1. Quick Start Overview (workflow pipeline, navigation cards)
    2. Using the Dashboard (stats bar, filtering, view modes)
    3. Understanding Colors & Indicators (card borders, table row backgrounds, priority rules)
    4. Creating a New SubOut (7-step walkthrough with field descriptions)
    5. Tracking Loads / Daily Workflow (outbound/inbound panels with step-by-step)
    6. Adding Items from Cutlists (6-step Item Picker walkthrough)
    7. Editing & Deleting SubOuts (side-by-side edit/delete instructions)
    8. Managing Vendors (add/edit/deactivate in 3-column layout)
    9. Status Flow & Lifecycle (visual pipeline with all 8 statuses)
  - Helper components added within Settings.jsx: `GuideSection`, `Step`, `Tip`, `KeyboardBadge`, `FieldLabel`

### Fixed
- **CLAUDE.md** - Corrected configuration values to match actual codebase:
  - Backend port: `3005` -> `4001` (matches `server/.env`)
  - Database name: `FabTracker` -> `MFC_NTLIVE` (matches `server/.env`)
  - Added `DB_PERSIST_SECURITY_INFO=true` to env template
  - Updated dev command comment: "proxies to 4001"

### Added
- **CLAUDE.md** - Added detailed How-To Guide section covering all user workflows
- **CHANGELOG.md** - Created this changelog file
