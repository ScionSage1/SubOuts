# Changelog

All notable changes to the SubOuts project will be documented in this file.

Format: [Date] - Summary of changes

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
