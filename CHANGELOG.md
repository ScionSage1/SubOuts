# Changelog

All notable changes to the SubOuts project will be documented in this file.

Format: [Date] - Summary of changes

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
