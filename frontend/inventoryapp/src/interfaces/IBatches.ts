export interface Batche {
 id :string
 itemId : string
 transactionLineId : string
 purchasedQuantity : number
 remainingQuantity : number
  unitPrice : number
  purchaseDate : string
 expirationDate? : string
}