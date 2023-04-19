const mongoose = require('mongoose')
const Schema = mongoose.Schema

const gpdSchema = new Schema({
    victimId: { type: Schema.Types.ObjectId, ref: 'User'},
    discount: { type: Number, default: 5, required: true},
    name: { type: String, unique: "false" },
    phone: { type: String, unique: "true" },
    email: { type: String, unique: "true" },
    disCode: { type: String, unique: "true" },
    couponType: { type: String, default: 'byPopUp'},
    usedBy: [{ type: Schema.Types.ObjectId, ref: 'User'}],
    ThreeOrder: { type: Number, default: 0 },
})

module.exports = mongoose.model('GetPreDiscount', gpdSchema);