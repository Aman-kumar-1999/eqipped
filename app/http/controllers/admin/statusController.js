const Order = require('../../../models/order')
const User = require('../../../models/user')
const Product = require('../../../models/variation')

function statusController() {
    return {
        update(req, res) {
            
            Order.updateOne({_id: req.body.orderId}, { status: req.body.status }, (err, data)=> {
                if(err) {
                    return res.redirect('back')
                }
                // Emit event 
                const eventEmitter = req.app.get('eventEmitter')
                eventEmitter.emit('orderUpdated', { id: req.body.orderId, status: req.body.status })
                return res.redirect('back')
            })
        },

        userupdate(req, res) {
            User.updateOne({_id: req.body.userId}, { isverified: req.body.isverified }, (err, data)=> {
                if(err) {
                    return res.redirect('/admin/users')
                }
                // Emit event 
                const eventEmitter = req.app.get('eventEmitter')
                eventEmitter.emit('userUpdated', { id: req.body.userId, isverified: req.body.isverified })
                return res.redirect('/admin/users')
            })
        },

        productupdate(req, res) {
            Product.updateOne({_id: req.body.userId}, { isverified: req.body.isverified }, (err, data)=> {
                if(err) {
                    return res.redirect('/admin/verifyProducts')
                }
                // Emit event 
                const eventEmitter = req.app.get('eventEmitter')
                eventEmitter.emit('userUpdated', { id: req.body.userId, isverified: req.body.isverified })
                return res.redirect('/admin/verifyProducts')
            })
        }
    }
}

module.exports = statusController