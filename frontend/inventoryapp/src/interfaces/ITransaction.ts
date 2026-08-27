export type TransactionType = "Purchase" | "Consumption" | "Adjustment" | "Wasted";

export default interface Transaction{
  id: number;
  userId?: number;
  type: TransactionType;
  date: string;   
  notes: string | null;
  storeId: number | null;
  groceryListId: number | null
}

export interface CreateTransactionLineDto {
  itemId: number;
  quantity: number;
  unitPrice: number | null;
  expirationDate: string | null;
  batchId: number | null;
}

export interface CreateTransactionDto {
  type: TransactionType;
  date: string;
  notes: string | null;
  storeId: number | null;
  groceryListId: number | null;
  lines: CreateTransactionLineDto[];
}

