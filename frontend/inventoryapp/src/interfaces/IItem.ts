export default interface Item {
  id: number;
  it_Name: string;
  category_Id: number | null;
  brand_Id: number | null;
  threshold: number;
  currentQuantity: number;
  flag: boolean;
  unitOfMeasureId: number | null;
  isActive: boolean;
  notes: string;
  category?: string;
  brand?: string;
   unitOfMeasureName?: string;
 unitOfMeasureAllowsDecimal?: boolean
}