-- SubOuts Database Schema
-- Run this script on the FabTracker database on Voltron server

-- =============================================
-- SubOutVendors Table
-- =============================================
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'FabTracker.SubOutVendors') AND type in (N'U'))
BEGIN
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
    PRINT 'Created table FabTracker.SubOutVendors';
END
GO

-- =============================================
-- SubOuts Table
-- =============================================
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'FabTracker.SubOuts') AND type in (N'U'))
BEGIN
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
        Status NVARCHAR(50) DEFAULT 'Submitted',

        -- Costs
        PONumber NVARCHAR(50),
        EstimatedCost DECIMAL(12,2),
        ActualCost DECIMAL(12,2),

        Notes NVARCHAR(MAX),
        CreatedAt DATETIME DEFAULT GETDATE(),
        UpdatedAt DATETIME,

        CONSTRAINT UQ_SubOuts_JobLot UNIQUE (JobCode, Lot)
    );
    PRINT 'Created table FabTracker.SubOuts';
END
GO

-- =============================================
-- SubOutItems Table
-- =============================================
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'FabTracker.SubOutItems') AND type in (N'U'))
BEGIN
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
        Status NVARCHAR(50) DEFAULT 'Submitted',

        -- Material tracking
        HeatNumber NVARCHAR(50),
        CertNumber NVARCHAR(255),
        Barcode NVARCHAR(50),

        Notes NVARCHAR(MAX),

        CONSTRAINT UQ_SubOutItems_Source UNIQUE (SubOutID, SourceTable, SourceID)
    );
    PRINT 'Created table FabTracker.SubOutItems';
END
GO

-- =============================================
-- Create Index for performance
-- =============================================
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_SubOuts_JobCode' AND object_id = OBJECT_ID('FabTracker.SubOuts'))
BEGIN
    CREATE INDEX IX_SubOuts_JobCode ON FabTracker.SubOuts(JobCode);
    PRINT 'Created index IX_SubOuts_JobCode';
END
GO

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_SubOuts_VendorID' AND object_id = OBJECT_ID('FabTracker.SubOuts'))
BEGIN
    CREATE INDEX IX_SubOuts_VendorID ON FabTracker.SubOuts(VendorID);
    PRINT 'Created index IX_SubOuts_VendorID';
END
GO

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_SubOuts_Status' AND object_id = OBJECT_ID('FabTracker.SubOuts'))
BEGIN
    CREATE INDEX IX_SubOuts_Status ON FabTracker.SubOuts(Status);
    PRINT 'Created index IX_SubOuts_Status';
END
GO

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_SubOutItems_SubOutID' AND object_id = OBJECT_ID('FabTracker.SubOutItems'))
BEGIN
    CREATE INDEX IX_SubOutItems_SubOutID ON FabTracker.SubOutItems(SubOutID);
    PRINT 'Created index IX_SubOutItems_SubOutID';
END
GO

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_SubOutItems_Source' AND object_id = OBJECT_ID('FabTracker.SubOutItems'))
BEGIN
    CREATE INDEX IX_SubOutItems_Source ON FabTracker.SubOutItems(SourceTable, SourceID);
    PRINT 'Created index IX_SubOutItems_Source';
END
GO

-- =============================================
-- vwSubOutsList View
-- =============================================
IF EXISTS (SELECT * FROM sys.views WHERE object_id = OBJECT_ID(N'FabTracker.vwSubOutsList'))
BEGIN
    DROP VIEW FabTracker.vwSubOutsList;
END
GO

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
    s.EstimatedCost,
    s.ActualCost,
    s.Notes,
    s.Status,
    s.CreatedAt,
    s.UpdatedAt
FROM FabTracker.SubOuts s
LEFT JOIN FabTracker.SubOutVendors v ON s.VendorID = v.VendorID
LEFT JOIN ScheduleShare.SSData ss ON s.JobCode = ss.JobCode;
GO

PRINT 'Created view FabTracker.vwSubOutsList';
GO

-- =============================================
-- vwSubOutItemsDetail View
-- =============================================
IF EXISTS (SELECT * FROM sys.views WHERE object_id = OBJECT_ID(N'FabTracker.vwSubOutItemsDetail'))
BEGIN
    DROP VIEW FabTracker.vwSubOutItemsDetail;
END
GO

CREATE VIEW FabTracker.vwSubOutItemsDetail AS
SELECT
    i.SubOutItemID,
    i.SubOutID,
    s.JobCode,
    s.Lot,
    i.SourceTable,
    i.SourceID,
    i.MainMark,
    i.PieceMark,
    i.Shape,
    i.Dimension,
    i.Grade,
    i.Length,
    i.Quantity,
    i.QuantitySent,
    i.QuantityReceived,
    i.Weight,
    i.Status,
    i.HeatNumber,
    i.CertNumber,
    i.Barcode,
    i.Notes
FROM FabTracker.SubOutItems i
JOIN FabTracker.SubOuts s ON i.SubOutID = s.SubOutID;
GO

PRINT 'Created view FabTracker.vwSubOutItemsDetail';
GO

PRINT 'Schema creation complete!';
