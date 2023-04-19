const mongoose = require('mongoose')
const Schema = mongoose.Schema

const brandsSchema = new Schema({
    name: { type: String},
    description: { type: String},
    commision: { type: Number, default: 20},
    image: {type: String, required: true},
    simage: {type: String, required: true},
    discount: { type: Number, default: 0}
})

module.exports = mongoose.model('Brand', brandsSchema);