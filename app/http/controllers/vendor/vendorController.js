const Category = require('../../../models/categories')
const Variation = require('../../../models/variation');
const Brand = require('../../../models/brand');
const Order = require('../../../models/order');

const moment = require('moment')
const { session } = require('passport')

function vendorController() {
    return {


        async vendordashboard(req, res){

            const notInteractWithYet = await Order.find({ vendorId: req.user._id, vendorStatus: 'pending', status: 'order_placed' }).sort('-createdAt').limit(3).exec();
            const approvedButNotReady = await Order.find({ vendorId: req.user._id, vendorStatus: 'approved', status: 'order_placed' }).sort('-createdAt').limit(3).exec();
            //order Status jo hai vo confirmed ho jaega vendor ke Notification received pe click karte hi - Abhishek sir
            const approvedAndReadyToo = await Order.find({ vendorId: req.user._id, vendorStatus: 'approved', status: 'prepared' }).sort('-createdAt').limit(3).exec();

            res.render('vendor/vendorDashboard', { notInteractWithYet, approvedButNotReady, approvedAndReadyToo })
        },


        async notInteractWithYet(req, res){
            const notInteractWithYet = await Order.find({ vendorId: req.user._id, vendorStatus: 'pending', status: 'order_placed' }).sort('-createdAt').exec();
            res.render('vendor/orderNotApprovedYet', { notInteractWithYet })
        },   

        async approvedButNotReady(req, res){
            const approvedButNotReady = await Order.find({ vendorId: req.user._id, vendorStatus: 'approved', status: 'order_placed' }).sort('-createdAt').exec();
            res.render('vendor/orderApprovedButUnshipped', { approvedButNotReady })
        }, 

        async approvedAndReadyToo(req, res){
            const approvedAndReadyToo = await Order.find({ vendorId: req.user._id, vendorStatus: 'approved', status: 'prepared' }).sort('-createdAt').exec();
            res.render('vendor/orderReadyToDelivery', { approvedAndReadyToo })
        },        



        async index(req, res) {
            const product = await Variation.find({ vendor: req.user._id }, null, { sort: { 'createdAt': -1 } }).populate('brand').populate('category')
            res.header('Cache-Control', 'no-store')
            res.render('vendor/listedProduct', { listedProd: product, moment: moment })
        },


        async addproduct(req, res) {
            const categories = await Category.find({}).exec();
            const brands = await Brand.find({}).exec();
            return res.render('vendor/addproduct', { categories: categories, brands: brands});
        },

        async editProduct(req, res) {
            const { id } = req.params
            const categories = await Category.find({}).exec();
            const brands = await Brand.find({}).exec();
            const data = await Variation.findOne({'_id': `${ id }`}).populate({ path: 'category' }).populate({ path: "brand"}).populate({ path: "product"})
            return res.render('vendor/editproducts', { data: data, categories: categories, brands: brands })
        },

    async updateOrderStatus(req, res){
        const { oid, action} = req.body;
        console.log(oid, action);

        const order = await Order.findOne({ _id: oid});

        if(JSON.stringify(order.items.vendor) == JSON.stringify(req.user._id)){
            if(action == 'approve'){
                Order.updateOne({
                    _id: oid
                }, {
                    $set: {
                        vendorStatus: 'approved'
                    }
                }, () => {
                    console.log("Approved Successfully");
                });
            }

            if(action == 'decline'){
                Order.updateOne({
                    _id: oid
                }, {
                    $set: {
                        vendorStatus: 'declined',
                        status: 'cancelled'
                    }
                }, () => {
                    console.log("Declined Successfully");
                });
            }
            res.send({ "status": "success"});
        }else{
            console.log("Not Okay")
        }

    }

    }
}


module.exports = vendorController