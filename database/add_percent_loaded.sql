-- Add TotalItemCount and LoadedItemCount to vwSubOutsList for percent-loaded display
-- LoadedItemCount includes items directly on a load OR barcode-linked to a loaded item
-- Run on MFC_NTLIVE database

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
    -- Computed load counts from SubOutLoads
    (SELECT COUNT(*) FROM FabTracker.SubOutLoads WHERE SubOutID = s.SubOutID AND Direction = 'Outbound') AS OutboundLoadCount,
    (SELECT COUNT(*) FROM FabTracker.SubOutLoads WHERE SubOutID = s.SubOutID AND Direction = 'Outbound' AND Status = 'Delivered') AS OutboundDeliveredCount,
    (SELECT COUNT(*) FROM FabTracker.SubOutLoads WHERE SubOutID = s.SubOutID AND Direction = 'Inbound') AS InboundLoadCount,
    (SELECT COUNT(*) FROM FabTracker.SubOutLoads WHERE SubOutID = s.SubOutID AND Direction = 'Inbound' AND Status = 'Delivered') AS InboundDeliveredCount,
    -- Item counts for percent-loaded calculation
    -- An item counts as "loaded" if it has a LoadID OR its barcode is linked to another item on a load
    (SELECT COUNT(*) FROM FabTracker.SubOutItems WHERE SubOutID = s.SubOutID) AS TotalItemCount,
    (SELECT COUNT(*) FROM FabTracker.SubOutItems i WHERE i.SubOutID = s.SubOutID AND (
        i.LoadID IS NOT NULL
        OR (i.Barcode IS NOT NULL AND EXISTS (
            SELECT 1 FROM FabTracker.SubOutItems i2
            WHERE i2.SubOutID = s.SubOutID AND i2.Barcode = i.Barcode AND i2.LoadID IS NOT NULL AND i2.SubOutItemID <> i.SubOutItemID
        ))
    )) AS LoadedItemCount,
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

PRINT 'Updated vwSubOutsList with barcode-aware LoadedItemCount';
GO
