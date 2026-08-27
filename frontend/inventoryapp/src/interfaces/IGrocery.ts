export default interface Grocery {
  id: number;
  userId?: number;
  gr_Name: string;
  status: string;
  createdAt: string;
}

export interface CreateGroceryListDto {
  name: string | null;
}

export interface AddGroceryListItemDto {
  itemId: number;
  quantityNeeded: number;
  estimatedPrice: number | null;
}

export interface UpdateGroceryListItemDto {
  quantityNeeded: number | null;
  estimatedPrice: number | null;
}