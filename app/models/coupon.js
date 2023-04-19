const mongoose = require('mongoose')
const Schema = mongoose.Schema

const couponSchema = new Schema({
    couponName: { type: String, required: true },
    specificAmount: { type: Number, required: false },
    brand: { type: String, ref: 'Brand' },
    subCategory: { type: String, ref: 'Subcategory' },
    category: { type: String, ref: 'Category' },
    delivery: { type: Boolean, default: false },
    discount: { type: Number, required: true },
    couponType: { type: String, default: 'onGeneral' },
    usedBy: [{ type: Schema.Types.ObjectId, ref: 'User' }],
})

module.exports = mongoose.model('Coupon', couponSchema);