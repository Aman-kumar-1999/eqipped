const { json } = require("express");
const User = require('../../../models/user');
const Variation = require('../../../models/variation');


function cartController() {
    return{

        async index(req, res) {
            const products = await User.findOne({_id: req.user._id}).populate({ path: 'cart.product', populate: { path: 'brand', model: 'Brand'}, model: 'Variation'});
            res.render('customers/cart', {products: products});
        },

        async update(req, res) {
            const product = await Variation.findOne({ _id: req.body.pid});
            User.updateOne({
                _id: req.user._id,
                'cart.product': { $ne: req.body.pid}
            }, {
                $push: {
                    cart: {
                        product: req.body.pid,
                        quantity: req.body.qty,
                        total: (await product.dprice) * product.piecePerPack * parseInt(req.body.qty),
                        vendor: req.body.vendor
                    }
                }
            }, (err) => {
                if(err) console.log(err);
            });

            const user = await User.findOne({
                _id: req.user._id
            });

            res.send({"status": "success", items: user.cart.length});
        },

        
        async qtyUpdate(req, res) {
            const product = await Variation.findOne({ _id: req.body.pid});
            var quantity;
            req.user.cart.forEach((item) => {
                if(JSON.stringify(item.product) == JSON.stringify(req.body.pid)){
                    console.log("Success");
                    quantity = item.quantity;
                }
            })
            
            if(req.body.type == 'plus'){
                User.updateOne({ 
                    _id: req.user._id,
                    cart: {$elemMatch:{product: req.body.pid, quantity: { $gte: 1}}}
                }, {
                   $inc: {
                    'cart.$.quantity': 1
                   },
                   $set: {
                    'cart.$.total': (await product.dprice) * product.piecePerPack * (quantity+1)
                   }
                }, () => {
                    res.send({ "status": "success"});
                })
            }

            if(req.body.type == 'minus'){
                User.updateOne({ 
                    _id: req.user._id,
                    cart: {$elemMatch:{product: req.body.pid, quantity: { $gte: 2}}}
                }, {
                   $inc: {
                    'cart.$.quantity': -1
                   },
                   $set: {
                    'cart.$.total': (await product.dprice) * product.piecePerPack * (quantity - 1)
                   }
                }, () => {
                    res.send({ "status": "success"});
                })
            }

            if(req.body.type == 'specific'){
                if(req.body.qty > 0){
                    User.updateOne({ 
                        _id: req.user._id,
                        cart: {$elemMatch:{product: req.body.pid}}
                    }, {
                       $set: {
                        'cart.$.quantity': req.body.qty,
                        'cart.$.total': (await product.dprice) * product.piecePerPack * parseInt(req.body.qty)
                       }
                    }, () => {
                        res.send({ "status": "success"});
                    })
                }
            }
        },

        removeUpdate(req, res) {
            User.updateOne({
                _id: req.user._id
            }, {
                $pull: {
                    cart: {
                        product: req.body.pid
                    }
                }
            }, (err) => {
                if(err) res.send({ "status": "error"});
                res.send({"status": "success"});
            })
        },

        async checkout(req, res) {
            User.updateOne({
                _id: req.user._id
            }, {
                $set: {
                    cart: []
                }
            }, (err) => {
                if(err)res.send({ "status": "error"});
                res.send({"status": "success"});
            });

        }
    }
}

module.exports = cartController