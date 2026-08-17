use HouseholdInventoryDb;

ALTER TABLE TransactionLines DROP CONSTRAINT UQ_TransactionLines_TransactionItem;

  CREATE TABLE InventoryBatches (
        Id INT IDENTITY PRIMARY KEY,
        ItemId INT NOT NULL FOREIGN KEY REFERENCES Items(Id),
        TransactionLineId INT NOT NULL FOREIGN KEY REFERENCES TransactionLines(Id),
        PurchasedQuantity DECIMAL(10,2) NOT NULL,
        RemainingQuantity DECIMAL(10,2) NOT NULL,
        UnitPrice DECIMAL(10,2) NULL,
        PurchaseDate DATETIME NOT NULL,
        ExpirationDate DATETIME NULL
    );

    ALTER TABLE TransactionLines ADD BatchId INT NULL FOREIGN KEY REFERENCES InventoryBatches(Id);

      ALTER TABLE TransactionLines ADD CONSTRAINT UQ_TransactionLines_TransactionItemBatch 
    UNIQUE (TransactionId, ItemId, BatchId);

    ALTER TABLE TransactionLines DROP CONSTRAINT UQ_TransactionLines_TransactionItemBatch;
GO

CREATE UNIQUE INDEX UQ_TransactionLines_ItemBatch_WhenSpecified
ON TransactionLines(TransactionId, ItemId, BatchId)
WHERE BatchId IS NOT NULL;

SELECT * FROM sys.indexes WHERE name = 'UQ_TransactionLines_ItemBatch_WhenSpecified';

SELECT * FROM InventoryBatches

ALTER TABLE GroceryListItems ADD EstimatedPrice DECIMAL(10,2) NULL;