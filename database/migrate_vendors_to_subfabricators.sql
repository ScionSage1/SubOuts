-- Migration: Add Sub Fabricator fields to SubOutVendors table
-- Based on the Sub Fabricator List_.xlsx spreadsheet structure
-- Run this script on the FabTracker database on Voltron server

USE MFC_NTLIVE;
GO

-- =============================================
-- Add new columns to SubOutVendors
-- =============================================

-- City (separate from Address)
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('FabTracker.SubOutVendors') AND name = 'City')
BEGIN
    ALTER TABLE FabTracker.SubOutVendors ADD City NVARCHAR(100);
    PRINT 'Added column City';
END
GO

-- State
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('FabTracker.SubOutVendors') AND name = 'State')
BEGIN
    ALTER TABLE FabTracker.SubOutVendors ADD State NVARCHAR(20);
    PRINT 'Added column State';
END
GO

-- Size (Small, Medium, Large, Large - many shops, Mega, Mega - many shops)
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('FabTracker.SubOutVendors') AND name = 'Size')
BEGIN
    ALTER TABLE FabTracker.SubOutVendors ADD Size NVARCHAR(50);
    PRINT 'Added column Size';
END
GO

-- AISC Board Member (Y/N)
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('FabTracker.SubOutVendors') AND name = 'AISCBoard')
BEGIN
    ALTER TABLE FabTracker.SubOutVendors ADD AISCBoard BIT DEFAULT 0;
    PRINT 'Added column AISCBoard';
END
GO

-- MFC Outreach Rep (Doug, Todd, Blake)
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('FabTracker.SubOutVendors') AND name = 'MFCOutreach')
BEGIN
    ALTER TABLE FabTracker.SubOutVendors ADD MFCOutreach NVARCHAR(50);
    PRINT 'Added column MFCOutreach';
END
GO

-- Last Contact Date
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('FabTracker.SubOutVendors') AND name = 'LastContactDate')
BEGIN
    ALTER TABLE FabTracker.SubOutVendors ADD LastContactDate DATE;
    PRINT 'Added column LastContactDate';
END
GO

-- =============================================
-- Create index for common queries
-- =============================================
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_SubOutVendors_State' AND object_id = OBJECT_ID('FabTracker.SubOutVendors'))
BEGIN
    CREATE INDEX IX_SubOutVendors_State ON FabTracker.SubOutVendors(State);
    PRINT 'Created index IX_SubOutVendors_State';
END
GO

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_SubOutVendors_Size' AND object_id = OBJECT_ID('FabTracker.SubOutVendors'))
BEGIN
    CREATE INDEX IX_SubOutVendors_Size ON FabTracker.SubOutVendors(Size);
    PRINT 'Created index IX_SubOutVendors_Size';
END
GO

PRINT 'Migration complete - SubOutVendors table updated for Sub Fabricator tracking';
GO
