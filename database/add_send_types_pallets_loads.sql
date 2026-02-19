-- Send Types, Pallets & Loads Tracking Migration
-- Run this script on the FabTracker database on Voltron server
-- Adds: SubOutLoads table, SubOutPallets table, SendType/PalletID/LoadID on SubOutItems
-- Updates: vwSubOutsList, vwSubOutItemsDetail views
-- Creates: vwSubOutLoadsDetail, vwSubOutPalletsDetail views

-- =============================================
-- SubOutLoads Table
-- =============================================
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'FabTracker.SubOutLoads') AND type in (N'U'))
BEGIN
    CREATE TABLE FabTracker.SubOutLoads (
        LoadID INT IDENTITY(1,1) PRIMARY KEY,
        SubOutID INT NOT NULL FOREIGN KEY REFERENCES FabTracker.SubOuts(SubOutID) ON DELETE CASCADE,

        -- Identification
        LoadNumber NVARCHAR(50) NOT NULL,       -- e.g., OUT-001, IN-001
        Direction NVARCHAR(10) NOT NULL,         -- 'Outbound' or 'Inbound'

        -- Schedule
        ScheduledDate DATE,
        ActualDate DATE,

        -- Truck info
        TruckCompany NVARCHAR(100),
        TrailerNumber NVARCHAR(50),
        DriverName NVARCHAR(100),
        BOLNumber NVARCHAR(50),                  -- Bill of Lading

        -- Metrics
        Weight DECIMAL(12,2),
        PieceCount INT,

        -- Status
        Status NVARCHAR(50) DEFAULT 'Planned',   -- Planned, Loading, Loaded, InTransit, Delivered
        Notes NVARCHAR(MAX),
        CreatedAt DATETIME DEFAULT GETDATE(),
        UpdatedAt DATETIME,

        CONSTRAINT UQ_SubOutLoads_Number UNIQUE (SubOutID, LoadNumber)
    );
    PRINT 'Created table FabTracker.SubOutLoads';
END
GO

-- =============================================
-- SubOutPallets Table
-- =============================================
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'FabTracker.SubOutPallets') AND type in (N'U'))
BEGIN
    CREATE TABLE FabTracker.SubOutPallets (
        PalletID INT IDENTITY(1,1) PRIMARY KEY,
        SubOutID INT NOT NULL FOREIGN KEY REFERENCES FabTracker.SubOuts(SubOutID) ON DELETE CASCADE,

        -- Identification
        PalletNumber NVARCHAR(50) NOT NULL,      -- e.g., P-001, P-002

        -- Dimensions
        Weight DECIMAL(12,2),
        Length DECIMAL(8,2),                      -- inches
        Width DECIMAL(8,2),                       -- inches
        Height DECIMAL(8,2),                      -- inches

        -- Status tracking
        Status NVARCHAR(50) DEFAULT 'Open',       -- Open, Closed, Loaded, Shipped, Received
        LoadID INT NULL,                           -- FK added below after SubOutLoads exists

        -- Metadata
        PhotoURL NVARCHAR(500),
        Notes NVARCHAR(MAX),
        CreatedAt DATETIME DEFAULT GETDATE(),
        UpdatedAt DATETIME,

        CONSTRAINT UQ_SubOutPallets_Number UNIQUE (SubOutID, PalletNumber)
    );
    PRINT 'Created table FabTracker.SubOutPallets';
END
GO

-- =============================================
-- Add FK: SubOutPallets.LoadID -> SubOutLoads
-- =============================================
IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_SubOutPallets_LoadID')
BEGIN
    ALTER TABLE FabTracker.SubOutPallets
        ADD CONSTRAINT FK_SubOutPallets_LoadID
        FOREIGN KEY (LoadID) REFERENCES FabTracker.SubOutLoads(LoadID);
    PRINT 'Added FK_SubOutPallets_LoadID';
END
GO

-- =============================================
-- Alter SubOutItems: Add SendType, PalletID, LoadID
-- =============================================
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('FabTracker.SubOutItems') AND name = 'SendType')
BEGIN
    ALTER TABLE FabTracker.SubOutItems ADD SendType NVARCHAR(50) DEFAULT 'Raw';
    PRINT 'Added column SubOutItems.SendType';
END
GO

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('FabTracker.SubOutItems') AND name = 'PalletID')
BEGIN
    ALTER TABLE FabTracker.SubOutItems ADD PalletID INT NULL;
    PRINT 'Added column SubOutItems.PalletID';
END
GO

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('FabTracker.SubOutItems') AND name = 'LoadID')
BEGIN
    ALTER TABLE FabTracker.SubOutItems ADD LoadID INT NULL;
    PRINT 'Added column SubOutItems.LoadID';
END
GO

-- Add FK: SubOutItems.PalletID -> SubOutPallets
IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_SubOutItems_PalletID')
BEGIN
    ALTER TABLE FabTracker.SubOutItems
        ADD CONSTRAINT FK_SubOutItems_PalletID
        FOREIGN KEY (PalletID) REFERENCES FabTracker.SubOutPallets(PalletID);
    PRINT 'Added FK_SubOutItems_PalletID';
END
GO

-- Add FK: SubOutItems.LoadID -> SubOutLoads
IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_SubOutItems_LoadID')
BEGIN
    ALTER TABLE FabTracker.SubOutItems
        ADD CONSTRAINT FK_SubOutItems_LoadID
        FOREIGN KEY (LoadID) REFERENCES FabTracker.SubOutLoads(LoadID);
    PRINT 'Added FK_SubOutItems_LoadID';
END
GO

-- =============================================
-- Indexes for new tables
-- =============================================
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_SubOutLoads_SubOutID' AND object_id = OBJECT_ID('FabTracker.SubOutLoads'))
BEGIN
    CREATE INDEX IX_SubOutLoads_SubOutID ON FabTracker.SubOutLoads(SubOutID);
    PRINT 'Created index IX_SubOutLoads_SubOutID';
END
GO

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_SubOutLoads_Direction' AND object_id = OBJECT_ID('FabTracker.SubOutLoads'))
BEGIN
    CREATE INDEX IX_SubOutLoads_Direction ON FabTracker.SubOutLoads(Direction);
    PRINT 'Created index IX_SubOutLoads_Direction';
END
GO

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_SubOutLoads_Status' AND object_id = OBJECT_ID('FabTracker.SubOutLoads'))
BEGIN
    CREATE INDEX IX_SubOutLoads_Status ON FabTracker.SubOutLoads(Status);
    PRINT 'Created index IX_SubOutLoads_Status';
END
GO

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_SubOutPallets_SubOutID' AND object_id = OBJECT_ID('FabTracker.SubOutPallets'))
BEGIN
    CREATE INDEX IX_SubOutPallets_SubOutID ON FabTracker.SubOutPallets(SubOutID);
    PRINT 'Created index IX_SubOutPallets_SubOutID';
END
GO

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_SubOutPallets_LoadID' AND object_id = OBJECT_ID('FabTracker.SubOutPallets'))
BEGIN
    CREATE INDEX IX_SubOutPallets_LoadID ON FabTracker.SubOutPallets(LoadID);
    PRINT 'Created index IX_SubOutPallets_LoadID';
END
GO

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_SubOutItems_PalletID' AND object_id = OBJECT_ID('FabTracker.SubOutItems'))
BEGIN
    CREATE INDEX IX_SubOutItems_PalletID ON FabTracker.SubOutItems(PalletID);
    PRINT 'Created index IX_SubOutItems_PalletID';
END
GO

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_SubOutItems_LoadID' AND object_id = OBJECT_ID('FabTracker.SubOutItems'))
BEGIN
    CREATE INDEX IX_SubOutItems_LoadID ON FabTracker.SubOutItems(LoadID);
    PRINT 'Created index IX_SubOutItems_LoadID';
END
GO

-- =============================================
-- Set default SendType for existing items
-- =============================================
UPDATE FabTracker.SubOutItems SET SendType = 'Raw' WHERE SendType IS NULL;
PRINT 'Set SendType = Raw for existing items';
GO

-- =============================================
-- Migrate existing load counters to SubOutLoads records
-- =============================================
DECLARE @SubOutID INT, @shipped INT, @toShip INT, @i INT, @scheduledDate DATE;

-- Outbound loads
DECLARE outbound_cursor CURSOR FOR
    SELECT SubOutID, LoadsShippedFromMFC, LoadsToShipFromMFC, DateToLeaveMFC
    FROM FabTracker.SubOuts
    WHERE LoadsToShipFromMFC > 0 OR LoadsShippedFromMFC > 0;

OPEN outbound_cursor;
FETCH NEXT FROM outbound_cursor INTO @SubOutID, @shipped, @toShip, @scheduledDate;

WHILE @@FETCH_STATUS = 0
BEGIN
    SET @i = 1;
    -- Create Delivered loads for already-shipped
    WHILE @i <= @shipped
    BEGIN
        INSERT INTO FabTracker.SubOutLoads (SubOutID, LoadNumber, Direction, Status, ScheduledDate, ActualDate, Notes)
        VALUES (@SubOutID, CONCAT('OUT-', RIGHT('000' + CAST(@i AS VARCHAR), 3)), 'Outbound', 'Delivered', @scheduledDate, @scheduledDate, 'Migrated from legacy counter');
        SET @i = @i + 1;
    END;
    -- Create Planned loads for remaining
    WHILE @i <= @toShip
    BEGIN
        INSERT INTO FabTracker.SubOutLoads (SubOutID, LoadNumber, Direction, Status, ScheduledDate, Notes)
        VALUES (@SubOutID, CONCAT('OUT-', RIGHT('000' + CAST(@i AS VARCHAR), 3)), 'Outbound', 'Planned', @scheduledDate, 'Migrated from legacy counter');
        SET @i = @i + 1;
    END;

    FETCH NEXT FROM outbound_cursor INTO @SubOutID, @shipped, @toShip, @scheduledDate;
END;

CLOSE outbound_cursor;
DEALLOCATE outbound_cursor;
PRINT 'Migrated outbound load counters to SubOutLoads';
GO

-- Inbound loads
DECLARE @SubOutID2 INT, @shipped2 INT, @toShip2 INT, @i2 INT, @scheduledDate2 DATE;

DECLARE inbound_cursor CURSOR FOR
    SELECT SubOutID, LoadsShippedFromSub, LoadsToShipFromSub, DateToShipFromSub
    FROM FabTracker.SubOuts
    WHERE LoadsToShipFromSub > 0 OR LoadsShippedFromSub > 0;

OPEN inbound_cursor;
FETCH NEXT FROM inbound_cursor INTO @SubOutID2, @shipped2, @toShip2, @scheduledDate2;

WHILE @@FETCH_STATUS = 0
BEGIN
    SET @i2 = 1;
    -- Create Delivered loads for already-received
    WHILE @i2 <= @shipped2
    BEGIN
        INSERT INTO FabTracker.SubOutLoads (SubOutID, LoadNumber, Direction, Status, ScheduledDate, ActualDate, Notes)
        VALUES (@SubOutID2, CONCAT('IN-', RIGHT('000' + CAST(@i2 AS VARCHAR), 3)), 'Inbound', 'Delivered', @scheduledDate2, @scheduledDate2, 'Migrated from legacy counter');
        SET @i2 = @i2 + 1;
    END;
    -- Create Planned loads for remaining
    WHILE @i2 <= @toShip2
    BEGIN
        INSERT INTO FabTracker.SubOutLoads (SubOutID, LoadNumber, Direction, Status, ScheduledDate, Notes)
        VALUES (@SubOutID2, CONCAT('IN-', RIGHT('000' + CAST(@i2 AS VARCHAR), 3)), 'Inbound', 'Planned', @scheduledDate2, 'Migrated from legacy counter');
        SET @i2 = @i2 + 1;
    END;

    FETCH NEXT FROM inbound_cursor INTO @SubOutID2, @shipped2, @toShip2, @scheduledDate2;
END;

CLOSE inbound_cursor;
DEALLOCATE inbound_cursor;
PRINT 'Migrated inbound load counters to SubOutLoads';
GO

-- =============================================
-- Update vwSubOutsList View (add computed load counts)
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
    -- Legacy counter fields (kept for backward compat)
    s.LoadsToShipFromMFC,
    s.LoadsShippedFromMFC,
    CONCAT(s.LoadsShippedFromMFC, ' of ', s.LoadsToShipFromMFC) AS LoadsFromMFC,
    s.DateToShipFromSub,
    s.LoadsToShipFromSub,
    s.LoadsShippedFromSub,
    CONCAT(s.LoadsShippedFromSub, ' of ', s.LoadsToShipFromSub) AS LoadsFromSub,
    -- New computed load counts from SubOutLoads
    (SELECT COUNT(*) FROM FabTracker.SubOutLoads WHERE SubOutID = s.SubOutID AND Direction = 'Outbound') AS OutboundLoadCount,
    (SELECT COUNT(*) FROM FabTracker.SubOutLoads WHERE SubOutID = s.SubOutID AND Direction = 'Outbound' AND Status = 'Delivered') AS OutboundDeliveredCount,
    (SELECT COUNT(*) FROM FabTracker.SubOutLoads WHERE SubOutID = s.SubOutID AND Direction = 'Inbound') AS InboundLoadCount,
    (SELECT COUNT(*) FROM FabTracker.SubOutLoads WHERE SubOutID = s.SubOutID AND Direction = 'Inbound' AND Status = 'Delivered') AS InboundDeliveredCount,
    -- Item counts for percent-loaded calculation
    (SELECT COUNT(*) FROM FabTracker.SubOutItems WHERE SubOutID = s.SubOutID) AS TotalItemCount,
    (SELECT COUNT(*) FROM FabTracker.SubOutItems WHERE SubOutID = s.SubOutID AND LoadID IS NOT NULL) AS LoadedItemCount,
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

PRINT 'Updated view FabTracker.vwSubOutsList';
GO

-- =============================================
-- Update vwSubOutItemsDetail View (add SendType, PalletID, LoadID)
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
    i.SendType,
    i.PalletID,
    p.PalletNumber,
    i.LoadID,
    l.LoadNumber,
    i.HeatNumber,
    i.CertNumber,
    i.Barcode,
    i.Notes
FROM FabTracker.SubOutItems i
JOIN FabTracker.SubOuts s ON i.SubOutID = s.SubOutID
LEFT JOIN FabTracker.SubOutPallets p ON i.PalletID = p.PalletID
LEFT JOIN FabTracker.SubOutLoads l ON i.LoadID = l.LoadID;
GO

PRINT 'Updated view FabTracker.vwSubOutItemsDetail';
GO

-- =============================================
-- vwSubOutLoadsDetail View
-- =============================================
IF EXISTS (SELECT * FROM sys.views WHERE object_id = OBJECT_ID(N'FabTracker.vwSubOutLoadsDetail'))
BEGIN
    DROP VIEW FabTracker.vwSubOutLoadsDetail;
END
GO

CREATE VIEW FabTracker.vwSubOutLoadsDetail AS
SELECT
    l.LoadID,
    l.SubOutID,
    s.JobCode,
    s.Lot,
    l.LoadNumber,
    l.Direction,
    l.ScheduledDate,
    l.ActualDate,
    l.TruckCompany,
    l.TrailerNumber,
    l.DriverName,
    l.BOLNumber,
    l.Weight,
    l.PieceCount,
    l.Status,
    l.Notes,
    l.CreatedAt,
    l.UpdatedAt,
    (SELECT COUNT(*) FROM FabTracker.SubOutItems WHERE LoadID = l.LoadID) AS ItemCount,
    (SELECT COUNT(*) FROM FabTracker.SubOutPallets WHERE LoadID = l.LoadID) AS PalletCount
FROM FabTracker.SubOutLoads l
JOIN FabTracker.SubOuts s ON l.SubOutID = s.SubOutID;
GO

PRINT 'Created view FabTracker.vwSubOutLoadsDetail';
GO

-- =============================================
-- vwSubOutPalletsDetail View
-- =============================================
IF EXISTS (SELECT * FROM sys.views WHERE object_id = OBJECT_ID(N'FabTracker.vwSubOutPalletsDetail'))
BEGIN
    DROP VIEW FabTracker.vwSubOutPalletsDetail;
END
GO

CREATE VIEW FabTracker.vwSubOutPalletsDetail AS
SELECT
    p.PalletID,
    p.SubOutID,
    s.JobCode,
    s.Lot,
    p.PalletNumber,
    p.Weight,
    p.Length,
    p.Width,
    p.Height,
    p.Status,
    p.LoadID,
    l.LoadNumber,
    p.PhotoURL,
    p.Notes,
    p.CreatedAt,
    p.UpdatedAt,
    (SELECT COUNT(*) FROM FabTracker.SubOutItems WHERE PalletID = p.PalletID) AS ItemCount,
    (SELECT SUM(Quantity) FROM FabTracker.SubOutItems WHERE PalletID = p.PalletID) AS TotalQuantity,
    (SELECT SUM(Weight) FROM FabTracker.SubOutItems WHERE PalletID = p.PalletID) AS TotalItemWeight
FROM FabTracker.SubOutPallets p
JOIN FabTracker.SubOuts s ON p.SubOutID = s.SubOutID
LEFT JOIN FabTracker.SubOutLoads l ON p.LoadID = l.LoadID;
GO

PRINT 'Created view FabTracker.vwSubOutPalletsDetail';
GO

PRINT 'Send Types, Pallets & Loads migration complete!';
