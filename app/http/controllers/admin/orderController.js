const { json } = require("body-parser");
const moment = require("moment");
const orderId = require("../../../models/orderID");
const User = require("../../../models/user");
const allOrders = require("../../../models/order");
const Variation = require("../../../models/variation");


function orderController() {
    return {
        async index(req, res) {
            const orders = await orderId.find().sort('-createdAt').populate({ path: 'orders', populate: [{ path: 'items.product', model: 'Variation' }, { path: 'items.vendor', model: 'User'}], model: 'Order'}).exec()  
            if (req.xhr) {
                return res.json(orders) 
            } else {
                return res.render('admin/orders')
            }
        },

        async adminpanel(req, res) {
            const orders = await allOrders.find();
            const listedPro = await Variation.find({ isverified: { $ne: 'Yes' }})
            const userDoc = await User.find({ $and: [{ isverified: { $ne: 'Yes' }}, { isuploded: "Yes"}]})
            // console.log(userDoc)
            const listedProLength = listedPro.length;
            const orderLength = orders.length;
            const userDocLength = userDoc.length;
            return res.render('admin/adminPanel', { layout: 'admin/adminPanel', orderLength, listedProLength, userDocLength });
        },

        async goToVendorNotify(req, res) {
            const orders = await orderId.find().sort('-createdAt').populate({ path: 'orders', populate: [{ path: 'items.product', populate: { path: 'vendor', model: 'User' }, model: 'Variation' }], model: 'Order'}).exec()
            const orderIds = [];
            const itemss = [];
            const gid = [];
            orders.forEach((item) => {
                var obj = {};
                obj.id = item.orderID;
                obj.orders = [];
                item.orders.forEach((order) => {
                    if (JSON.stringify(req.user._id) == JSON.stringify(order.items.product.vendor._id)) {
                    var element = {}
                    element.orderId = order.orderId;
                    element.status = order.status;
                    element.name = order.items.product.pname + ' ' + order.items.product.variationname;
                    element.quantity = order.items.quantity;
                    element.id = order._id;
                    element.vendorStatus = order.vendorStatus;
                    obj.orders.push(element);
                    itemss.push(element);
                    orderIds.push(order);
                }
                })
                gid.push(obj);
            })
            return res.render('vendor/vendornotify', {moment: moment, gid: gid })
        },

    }
}

module.exports = orderController  