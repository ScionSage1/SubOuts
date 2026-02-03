-- Migration: Add Communication Log table for Sub Fabricators
-- Run this script on the FabTracker database on Voltron server

USE MFC_NTLIVE;
GO

-- =============================================
-- SubFabricatorCommunicationLog Table
-- =============================================
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'FabTracker.SubFabricatorCommunicationLog') AND type in (N'U'))
BEGIN
    CREATE TABLE FabTracker.SubFabricatorCommunicationLog (
        LogID INT IDENTITY(1,1) PRIMARY KEY,
        VendorID INT NOT NULL FOREIGN KEY REFERENCES FabTracker.SubOutVendors(VendorID) ON DELETE CASCADE,

        -- Communication details
        ContactDate DATETIME NOT NULL DEFAULT GETDATE(),
        ContactType NVARCHAR(50) NOT NULL, -- 'Phone', 'Email', 'Meeting', 'Site Visit', 'Other'
        ContactPerson NVARCHAR(100),        -- Who they talked to at the fabricator
        MFCEmployee NVARCHAR(100),          -- Who from MFC made contact (Doug, Todd, Blake, etc.)

        -- Content
        Summary NVARCHAR(500) NOT NULL,     -- Brief summary of the communication
        Details NVARCHAR(MAX),              -- Full details/notes

        -- Follow-up
        FollowUpRequired BIT DEFAULT 0,
        FollowUpDate DATE,
        FollowUpType NVARCHAR(50),          -- 'Call', 'Email', 'Meeting', 'Quote', 'Other'
        FollowUpNotes NVARCHAR(500),
        FollowUpCompleted BIT DEFAULT 0,

        -- Metadata
        CreatedAt DATETIME DEFAULT GETDATE(),
        CreatedBy NVARCHAR(100),

        -- Source tracking (for AI-created entries)
        Source NVARCHAR(50) DEFAULT 'Manual' -- 'Manual', 'MFCCortex', 'Import'
    );
    PRINT 'Created table FabTracker.SubFabricatorCommunicationLog';
END
GO

-- =============================================
-- Create indexes for performance
-- =============================================
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_CommLog_VendorID' AND object_id = OBJECT_ID('FabTracker.SubFabricatorCommunicationLog'))
BEGIN
    CREATE INDEX IX_CommLog_VendorID ON FabTracker.SubFabricatorCommunicationLog(VendorID);
    PRINT 'Created index IX_CommLog_VendorID';
END
GO

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_CommLog_ContactDate' AND object_id = OBJECT_ID('FabTracker.SubFabricatorCommunicationLog'))
BEGIN
    CREATE INDEX IX_CommLog_ContactDate ON FabTracker.SubFabricatorCommunicationLog(ContactDate DESC);
    PRINT 'Created index IX_CommLog_ContactDate';
END
GO

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_CommLog_FollowUp' AND object_id = OBJECT_ID('FabTracker.SubFabricatorCommunicationLog'))
BEGIN
    CREATE INDEX IX_CommLog_FollowUp ON FabTracker.SubFabricatorCommunicationLog(FollowUpRequired, FollowUpCompleted, FollowUpDate)
    WHERE FollowUpRequired = 1 AND FollowUpCompleted = 0;
    PRINT 'Created index IX_CommLog_FollowUp';
END
GO

-- =============================================
-- View for communication log with vendor info
-- =============================================
IF EXISTS (SELECT * FROM sys.views WHERE object_id = OBJECT_ID(N'FabTracker.vwCommunicationLog'))
BEGIN
    DROP VIEW FabTracker.vwCommunicationLog;
END
GO

CREATE VIEW FabTracker.vwCommunicationLog AS
SELECT
    cl.LogID,
    cl.VendorID,
    v.VendorName AS FabricatorName,
    v.City,
    v.State,
    cl.ContactDate,
    cl.ContactType,
    cl.ContactPerson,
    cl.MFCEmployee,
    cl.Summary,
    cl.Details,
    cl.FollowUpRequired,
    cl.FollowUpDate,
    cl.FollowUpType,
    cl.FollowUpNotes,
    cl.FollowUpCompleted,
    cl.CreatedAt,
    cl.CreatedBy,
    cl.Source
FROM FabTracker.SubFabricatorCommunicationLog cl
JOIN FabTracker.SubOutVendors v ON cl.VendorID = v.VendorID;
GO

PRINT 'Created view FabTracker.vwCommunicationLog';
GO

PRINT 'Communication Log migration complete!';
GO
