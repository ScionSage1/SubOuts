# Changelog

All notable changes to the SubOuts project will be documented in this file.

Format: [Date] - Summary of changes

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
