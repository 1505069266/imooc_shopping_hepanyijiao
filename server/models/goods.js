let mongoose = require('mongoose')
let Schema = mongoose.Schema;

let produtSchema = new Schema({
  "productId": String,
  "productName": String,
  "salePrice": Number,
  "productImage": String,
  "productNum": Number,
  "checked": String
})

module.exports = mongoose.model('Good',produtSchema,'goods')