const Menu = require('../../models/order');
const express = require("express")

const checksum_lib = require("../../../routes/Paytm/checksum")
const config = require("../../../routes/Paytm/config")

function paymentController() {
    return {
        payment(req, res) {
            res.render('payment')
        }
    }
}

module.exports = paymentController