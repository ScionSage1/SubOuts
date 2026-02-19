-- Activity Log table for SubOut audit trail
-- Run this after schema.sql

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'SubOutActivityLog' AND schema_id = SCHEMA_ID('FabTracker'))
BEGIN
  CREATE TABLE FabTracker.SubOutActivityLog (
    LogID INT IDENTITY(1,1) PRIMARY KEY,
    SubOutID INT NOT NULL FOREIGN KEY REFERENCES FabTracker.SubOuts(SubOutID) ON DELETE CASCADE,
    EventType NVARCHAR(50) NOT NULL,  -- StatusChange, ItemsAdded, ItemRemoved, LoadCreated, LoadStatusChange, PalletCreated
    Description NVARCHAR(500) NOT NULL,
    EventData NVARCHAR(MAX),  -- JSON with before/after values
    CreatedBy NVARCHAR(100),
    CreatedAt DATETIME DEFAULT GETDATE()
  );

  CREATE INDEX IX_ActivityLog_SubOutID ON FabTracker.SubOutActivityLog(SubOutID, CreatedAt DESC);

  PRINT 'Created SubOutActivityLog table';
END
ELSE
BEGIN
  PRINT 'SubOutActivityLog table already exists';
END
