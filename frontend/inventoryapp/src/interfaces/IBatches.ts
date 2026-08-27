export interface Batche {
 id :number
 itemId : number
 transactionLineId : string
 purchasedQuantity : number
 remainingQuantity : number
  unitPrice : number
  purchaseDate : string
 expirationDate? : string
}