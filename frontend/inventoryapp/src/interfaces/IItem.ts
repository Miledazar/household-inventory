export default interface Item {
  id: number;
  it_Name: string;
  category_Id: number | null;
  brand_Id: number | null;
  threshold: number;
  currentQuantity: number;
  flag: boolean;
  unitOfMeasure: string;
  isActive: boolean;
  notes: string;
  category?: string;
  brand?: string;
}