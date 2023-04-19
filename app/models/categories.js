const mongoose = require('mongoose')
const Schema = mongoose.Schema

const categoriesSchema = new Schema({
    pcategory: {type: String, required: true},
    // commision: { type: Number, default: 20},
    pimage: {type: String, required: true},
    created: { type: Date, default: Date.now},
    defaultimage: {type: String},
})

module.exports = mongoose.model('Category', categoriesSchema);