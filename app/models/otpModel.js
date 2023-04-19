const mongoose = require('mongoose')
const Schema = mongoose.Schema

const otpSchema = new Schema({
    phone: {type: String },
    otp: {type: String },
    email: {type: String },
    eotp: {type: String },
    attempts: {type: Number},
    createdAt: {type: Date, expires: '5m', default: Date.now, index: true}

}, {timestamps: true })


module.exports = mongoose.model('Otp', otpSchema);