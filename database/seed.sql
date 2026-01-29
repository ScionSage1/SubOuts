-- SubOuts Seed Data
-- Run this after schema.sql to populate initial data

-- =============================================
-- Insert Default Vendors
-- =============================================
IF NOT EXISTS (SELECT 1 FROM FabTracker.SubOutVendors WHERE VendorName = 'Mohawk')
BEGIN
    INSERT INTO FabTracker.SubOutVendors (VendorName, IsActive) VALUES ('Mohawk', 1);
END

IF NOT EXISTS (SELECT 1 FROM FabTracker.SubOutVendors WHERE VendorName = 'IMF')
BEGIN
    INSERT INTO FabTracker.SubOutVendors (VendorName, IsActive) VALUES ('IMF', 1);
END

IF NOT EXISTS (SELECT 1 FROM FabTracker.SubOutVendors WHERE VendorName = 'Finnoe')
BEGIN
    INSERT INTO FabTracker.SubOutVendors (VendorName, IsActive) VALUES ('Finnoe', 1);
END

IF NOT EXISTS (SELECT 1 FROM FabTracker.SubOutVendors WHERE VendorName = 'ST Fab')
BEGIN
    INSERT INTO FabTracker.SubOutVendors (VendorName, IsActive) VALUES ('ST Fab', 1);
END

IF NOT EXISTS (SELECT 1 FROM FabTracker.SubOutVendors WHERE VendorName = 'Max Manufacturing')
BEGIN
    INSERT INTO FabTracker.SubOutVendors (VendorName, IsActive) VALUES ('Max Manufacturing', 1);
END

IF NOT EXISTS (SELECT 1 FROM FabTracker.SubOutVendors WHERE VendorName = 'Greybeard')
BEGIN
    INSERT INTO FabTracker.SubOutVendors (VendorName, IsActive) VALUES ('Greybeard', 1);
END

IF NOT EXISTS (SELECT 1 FROM FabTracker.SubOutVendors WHERE VendorName = 'Mountain Metals')
BEGIN
    INSERT INTO FabTracker.SubOutVendors (VendorName, IsActive) VALUES ('Mountain Metals', 1);
END

PRINT 'Seed data inserted successfully!';

-- Verify vendors were inserted
SELECT * FROM FabTracker.SubOutVendors ORDER BY VendorName;
