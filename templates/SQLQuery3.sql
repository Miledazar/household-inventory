USE [HouseholdInventoryDb]
GO


ALTER TABLE Users ADD CONSTRAINT UQ_Users_Name UNIQUE (Us_Name);

ALTER TABLE Items ADD BrandId INT NULL FOREIGN KEY REFERENCES Brands(Id);
EXEC sp_rename 'Items.Category_Id', 'CategoryId', 'COLUMN';
EXEC sp_rename 'Transactions.CreatedAt', 'Date', 'COLUMN';

ALTER TABLE Items ADD UnitOfMeasure NVARCHAR(20) NOT NULL DEFAULT 'Piece';