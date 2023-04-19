const mongoose = require('mongoose')
const Schema = mongoose.Schema

const orderIDSchema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: 'User' },
    orderID: {type: String},
    orders: [
        {
            type: Schema.Types.ObjectId, ref: 'Order'
        }
    ]
   
}, {timestamps: true })


module.exports = mongoose.model('Orderid', orderIDSchema);