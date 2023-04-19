const mongoose = require('mongoose')
const Schema = mongoose.Schema

const marqueContentSchema = new Schema({
    content1: { type: String, required: true },
    content2: { type: String },
    content3: { type: String }
})

module.exports = mongoose.model('MarqueContent', marqueContentSchema);