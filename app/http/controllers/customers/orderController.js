const Order = require('../../../models/order')
const GetPreDiscount = require('../../../models/getPreDiscount');
const Coupon = require('../../../models/coupon')
const OrderId = require('../../../models/orderID')
const User = require('../../../models/user');
const moment = require('moment')
const fs = require('fs')
const pdf = require('pdf-creator-node')
const path = require('path')
const options = require('../../../../helpers/options');
const nodemailer = require('nodemailer')
function orderController() {
    return {

        async viewdoc(req, res) {
            const { id } = req.params;
            console.log(id);
            const userinfo = await User.findOne({ $and: [{ _id: id }, { isuploded: "Yes" }] });
            console.log(userinfo);
            let fileArray = [];
            if (userinfo && userinfo.documentNumber > 0) {
                for (var i = 0; i < userinfo.documentNumber; i++) {
                    var filename = userinfo._id + JSON.stringify(i + 1) + ".pdf";
                    var filePath = 'http://eqipped.com/businessDocuments/' + filename
                    // var filePath = 'http://localhost:3300/businessDocuments/' + filename
                    fileArray.push(filePath);
                }
                return res.render('auth/documentwatch', { paths: fileArray, userinfo: userinfo })
            } else {
                return res.redirect('back');
            }
        },


        async index(req, res) {

            const orders = await OrderId.find({ user: req.user._id }).sort('-createdAt').populate({ path: 'orders', populate: [{ path: 'items.product', model: 'Variation' }, { path: 'items.vendor', model: 'User' }], model: 'Order' }).exec()
            res.header('Cache-Control', 'no-store')
            res.render('customers/orders', { orders: orders, moment: moment });
        },


        async indexia(req, res) {

            const orders = await OrderId.find({ user: req.user._id }).sort('-createdAt').populate({ path: 'orders', populate: [{ path: 'items.product', model: 'Variation' }, { path: 'items.vendor', model: 'User' }], model: 'Order' }).exec()

            const order = orders[0]

            res.header('Cache-Control', 'no-store')
            res.render('customers/individualOrder', { order, moment });
        },





        async storeCompletePayment(req, res) {

            const orderid = new OrderId({
                user: req.user._id,
                orderID: req.session.groupId
            })


            orderid.save().then((user) => {
            }).catch(err => {
                req.flash('error', 'Something went wrong');
            })

            const coupon = req.session.coupon || null
            const discountedtotal = req.session.discountedtotal || 0;
            const remainingAmount = req.session.remainingAmount || 0;
            const total = req.session.advance || req.session.sub_total

            const user = await User.findOne({ _id: req.user._id }).populate({ path: 'cart.product', model: 'Variation' });
            const cart = user.cart;
            const oiddArray = req.session.oiddArray;

            if (user) {
                for (var i = 0; i < cart.length; i++) {
                    const order = new Order({
                        customerId: req.user._id,
                        customerName: req.user.fname,
                        email: req.user.email,
                        orderId: oiddArray[i],
                        groupId: req.session.groupId,
                        txnDate: Date.now,
                        txnAmount: total,
                        items: cart[i],
                        phone: req.session.phone,
                        address: req.session.address,
                        pincode: req.session.pincode,
                        discountedtotal: discountedtotal,
                        remainingAmount: remainingAmount,
                        coupon: coupon,
                        bankName: 'hh',
                        bankTxnId: 'hh',
                        gateWayName: 'hh',
                        paymentMode: 'hh',
                        respcode: 'hh',
                        txnStatus: 'hh',
                        respmsg: 'hh',
                        txnID: 'hh',
                    })


                    order.save(() => {
                        console.log("saved");
                    })

                    OrderId.updateOne({
                        orderID: req.session.groupId
                    }, {
                        $push: {
                            orders: order._id
                        }
                    }, () => {
                        console.log("Order Added to Order Id SuccessFully")
                    })
                }
                req.session.coupon = "";
                req.session.discountedtotal = "";
                req.session.remainingAmount = "";
                return res.redirect('/customer/orders')
            } else {
                req.flash('error', 'Your payment has been declined by your bank. Please try again or use a different method to complete the payment.');
                return res.redirect('/customer/checkout')
            }
        },

        async cancelOrder(req, res) {

            const getOidToEmail = await Order.findOne({ _id: req.body.oid })

            const transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: 'gearloose.lab@gmail.com',
                    pass: 'zhbqmsmltkrrkgtv'
                },
                port: 465,
                host: "smtp.gmail.com"
            });

            const mailOptions = {
                from: 'gearloose.lab@gmail.com',
                to: req.user.email,
                subject: 'Order Cancelled SuccessFully',
                text: `Product of Order Group id ${getOidToEmail.groupId} is Cancelled SuccessFully`

            };

            transporter.sendMail(mailOptions, function (err, info) {
                if (err) {
                    console.log(err)
                    return;
                } else {
                    console.log("info >>", info)
                    return;
                }
            })


            Order.updateOne({
                _id: req.body.oid
            }, {
                $set: {
                    status: "cancelled"
                }
            }, (err) => {
                console.log(err);
            });
            res.send({ "msg": "Success" });
        },

        async show(req, res) {
            const html = fs.readFileSync(path.join(__dirname, '../../../../resources/views/invoice.html'), 'utf-8');
            const filename = req.params.id + '.pdf';
            const order = await Order.findById(req.params.id).populate({ path: 'items.product', model: 'Variation' })

            let array = [];
            d = order.items
            const prod = {
                name: d.product.pname + " - " + d.product.variationname,
                description: d.product.description,
                quantity: d.quantity,
                price: (await d.product.dprice),
                total: (await d.product.dprice) * d.quantity,
                imgurl: d.product.image
            }

            array.push(prod);
            array.forEach(i => {
            })
            let subtotal = 0;
            array.forEach(i => {
                subtotal += i.total
            });
            const tax = (subtotal * 20) / 100;
            const grandtotal = subtotal + tax;
            const obj = {
                CustomerName: order.customerName,
                address: order.address,
                phone: order.phone,
                email: order.email,
                institutionName: req.user.institutionName,
                pincode: order.pincode,
                status: order.status,
                orderId: order.orderId,
                createdAt: moment(order.createdAt).format('DD:MM:YYYY'),
                prodlist: array,
                subtotal,
                tax,
                gtotal: grandtotal
            }



            const document = {
                html: html,
                data: {
                    products: obj,
                },
                path: './docs/' + filename
            }
            pdf.create(document, options)
                .then(res => {
                    console.log(res);
                }).catch(error => {
                    console.log(error);
                });

            const filepath = 'http://eqipped.com/docs/' + filename
            // const filepath = 'http://localhost:3300/docs/' + filename



            // Authorize user
            if (req.user._id.toString() === order.customerId.toString()) {
                return res.render('customers/singleOrder', { order, path: filepath })
            }
            return res.redirect('/')
        },

        async checkout(req, res) {
            var delivery = 500;
            var gst = 0;

            const products = await User.findOne({ _id: req.user._id }).populate({ path: 'cart.product', model: 'Variation' });
            let total = 0;
            for (let items of products.cart) {
                total += (await items.product.dprice) * items.quantity;
                var item_tp = (await items.product.dprice) * items.quantity;
                gst += (item_tp * items.product.GST) / 100
            }

            var item_total = Math.ceil(total);
            if (item_total >= 10000) {
                delivery = 0;
            }

            var sub_total = delivery + gst + item_total
            res.locals.session.total = item_total
            res.locals.session.gst = gst
            res.locals.session.delivery = delivery
            res.locals.session.sub_total = sub_total

            res.render('customers/checkout', { sTotal: sub_total, delivery: delivery, taxes: gst, user: products, item_total: item_total, discountedAmount: false, hideCoupon: false })
        },

        async applycoupon(req, res) {
            var delivery = req.session.delivery
            var charg = req.session.charges;
            var sub_total = req.session.sub_total;
            var disc_amount = sub_total;
            var gst = req.session.gst;
            var item_total = req.session.total;
            var discountedAmount;
            var totalDisc = 0.00;
            var itemsDiscounted = 0;

            const couponByPop = await GetPreDiscount.findOne({ $and: [{ disCode: req.body.coupon }, { phone: req.user.phone }, { email: req.user.email }] });

            let coupon = await Coupon.findOne({ $and: [{ couponName: req.body.coupon }, { usedBy: { $ne: req.user._id } }] })

            const products = await User.findOne({ _id: req.user._id }).populate({ path: 'cart.product', model: 'Variation' });


            if (couponByPop) {
                if (couponByPop.couponType == "onSpecific") {
                    if (couponByPop.ThreeOrder < 1) {
                        couponByPop.ThreeOrder += 1
                        await couponByPop.save();

                        const user = await User.findOne({ _id: req.user._id }).populate({ path: 'cart.product', model: 'Variation' });
                        for (const item of user.cart) {
                            itemsDiscounted += 1;
                            discountedAmount = ((await item.product.dprice) * (item.quantity)) * (couponByPop.discount) / 100
                            disc_amount -= discountedAmount;
                            totalDisc += discountedAmount;
                            disc_amount = parseFloat(disc_amount).toFixed(2);
                        }
                        if (itemsDiscounted > 0) {
                            res.locals.session.discountedtotal = disc_amount;
                            res.locals.session.coupon = couponByPop._id;
                            res.render('customers/checkout', { sTotal: disc_amount, p_fee: charg, taxes: gst, user: products, item_total: item_total, discountedAmount: totalDisc, coupon: couponByPop, hideCoupon: true });
                        } else {
                            req.flash('error', `Sorry, Something went wrong contact admin.`)
                            res.render('customers/checkout', { sTotal: disc_amount, p_fee: charg, taxes: gst, user: products, item_total: item_total, discountedAmount: totalDisc, coupon: couponByPop, hideCoupon: false });
                        }

                    } else {
                        req.flash('error', 'Sorry, Discount coupon is Expired.');
                        res.render('customers/checkout', { sTotal: disc_amount, p_fee: charg, taxes: gst, user: products, item_total: item_total, discountedAmount: false, hideCoupon: false });
                    }
                } else
                    if (couponByPop.ThreeOrder < 3) {
                        couponByPop.ThreeOrder += 1
                        await couponByPop.save();

                        const user = await User.findOne({ _id: req.user._id }).populate({ path: 'cart.product', model: 'Variation' });
                        for (const item of user.cart) {
                            itemsDiscounted += 1;
                            discountedAmount = ((await item.product.dprice) * (item.quantity)) * 5 / 100
                            disc_amount -= discountedAmount;
                            totalDisc += discountedAmount;
                            disc_amount = parseFloat(disc_amount).toFixed(2);
                        }
                        if (itemsDiscounted > 0) {
                            res.locals.session.discountedtotal = disc_amount;
                            res.locals.session.coupon = couponByPop._id;
                            res.render('customers/checkout', { sTotal: disc_amount, p_fee: charg, taxes: gst, user: products, item_total: item_total, discountedAmount: totalDisc, coupon: couponByPop, hideCoupon: true });
                        } else {
                            req.flash('error', `Sorry, Something went wrong contact admin.`)
                            res.render('customers/checkout', { sTotal: disc_amount, p_fee: charg, taxes: gst, user: products, item_total: item_total, discountedAmount: totalDisc, coupon: couponByPop, hideCoupon: false });
                        }

                    } else {
                        req.flash('error', 'Sorry, Discount coupon is Expired.');
                        res.render('customers/checkout', { sTotal: disc_amount, p_fee: charg, taxes: gst, user: products, item_total: item_total, discountedAmount: false, hideCoupon: false });
                    }
            }

            if (coupon) {
                if (coupon.couponType == "onBrand") {
                    coupon = await Coupon.findOne({ $and: [{ couponName: req.body.coupon }, { usedBy: { $ne: req.user._id } }] }).populate('brand')
                    const user = await User.findOne({ _id: req.user._id }).populate({ path: 'cart.product', model: 'Variation' });
                    for (const item of user.cart) {

                        if (JSON.stringify(item.product.brand) == JSON.stringify(coupon.brand._id)) {
                            itemsDiscounted += 1;
                            discountedAmount = ((await item.product.dprice) * (item.quantity)) * (coupon.discount) / 100
                            disc_amount -= discountedAmount;
                            totalDisc += discountedAmount;
                            disc_amount = parseFloat(disc_amount).toFixed(2);
                        }
                    }
                    if (itemsDiscounted > 0) {
                        res.locals.session.discountedtotal = disc_amount;
                        res.locals.session.coupon = coupon._id;
                        res.render('customers/checkout', { sTotal: disc_amount, p_fee: charg, taxes: gst, user: products, item_total: item_total, discountedAmount: totalDisc, coupon: coupon, hideCoupon: true });
                    } else {
                        req.flash('error', `Sorry, Discount coupon is Applicable on ${coupon.brand.name} products only.`)
                        res.render('customers/checkout', { sTotal: disc_amount, p_fee: charg, taxes: gst, user: products, item_total: item_total, discountedAmount: totalDisc, coupon: coupon, hideCoupon: false });
                    }

                }

                if (coupon.couponType == "onCategory") {
                    let coupon = await Coupon.findOne({ $and: [{ couponName: req.body.coupon }, { usedBy: { $ne: req.user._id } }] }).populate('category')
                    const user = await User.findOne({ _id: req.user._id }).populate({ path: 'cart.product', model: 'Variation' });
                    for (const item of user.cart) {

                        if (JSON.stringify(item.product.category) == JSON.stringify(coupon.category._id)) {
                            itemsDiscounted += 1;
                            discountedAmount = ((await item.product.dprice) * (item.quantity)) * (coupon.discount) / 100
                            disc_amount -= discountedAmount;
                            totalDisc += discountedAmount;
                            disc_amount = parseFloat(disc_amount).toFixed(2);
                        }
                    }

                    if (itemsDiscounted > 0) {
                        res.locals.session.discountedtotal = disc_amount;
                        res.locals.session.coupon = coupon._id;
                        res.render('customers/checkout', { sTotal: disc_amount, p_fee: charg, taxes: gst, user: products, item_total: item_total, discountedAmount: totalDisc, coupon: coupon, hideCoupon: true });
                    } else {
                        req.flash('error', `Sorry, Discount is Applicable on ${coupon.category.pcategory} products only.`)
                        res.render('customers/checkout', { sTotal: disc_amount, p_fee: charg, taxes: gst, user: products, item_total: item_total, discountedAmount: totalDisc, coupon: coupon, hideCoupon: false });
                    }

                }

                if (coupon.couponType == "onSubcategory") {
                    let coupon = await Coupon.findOne({ $and: [{ couponName: req.body.coupon }, { usedBy: { $ne: req.user._id } }] }).populate('subCategory')
                    const user = await User.findOne({ _id: req.user._id }).populate({ path: 'cart.product', model: 'Variation' });
                    for (const item of user.cart) {

                        if (JSON.stringify(item.product.subCategory) == JSON.stringify(coupon.subCategory._id)) {
                            itemsDiscounted += 1;
                            discountedAmount = ((await item.product.dprice) * (item.quantity)) * (coupon.discount) / 100
                            disc_amount -= discountedAmount;
                            totalDisc += discountedAmount;
                            disc_amount = parseFloat(disc_amount).toFixed(2);
                        }
                    }
                    if (itemsDiscounted > 0) {
                        res.locals.session.discountedtotal = disc_amount;
                        res.locals.session.coupon = coupon._id;
                        res.render('customers/checkout', { sTotal: disc_amount, p_fee: charg, taxes: gst, user: products, item_total: item_total, discountedAmount: totalDisc, coupon: coupon, hideCoupon: true });
                    } else {
                        req.flash('error', `Sorry, Discount is Applicable on ${coupon.subCategory.productSubcategory} products only.`)
                        res.render('customers/checkout', { sTotal: disc_amount, p_fee: charg, taxes: gst, user: products, item_total: item_total, discountedAmount: totalDisc, coupon: coupon, hideCoupon: false });
                    }

                }

                if (coupon.couponType == "onGeneral") {
                    const user = await User.findOne({ _id: req.user._id }).populate({ path: 'cart.product', model: 'Variation' });
                    for (const item of user.cart) {
                        itemsDiscounted += 1;
                        discountedAmount = ((await item.product.dprice) * (item.quantity)) * (coupon.discount) / 100
                        disc_amount -= discountedAmount;
                        totalDisc += discountedAmount;
                        disc_amount = parseFloat(disc_amount).toFixed(2);
                    }
                    if (itemsDiscounted > 0) {
                        res.locals.session.discountedtotal = disc_amount;
                        res.locals.session.coupon = coupon._id;
                        res.render('customers/checkout', { sTotal: disc_amount, p_fee: charg, taxes: gst, user: products, item_total: item_total, discountedAmount: totalDisc, coupon: coupon, hideCoupon: true });
                    } else {
                        req.flash('error', `Sorry, Coupon is expired or something went wrong.`)
                        res.render('customers/checkout', { sTotal: disc_amount, p_fee: charg, taxes: gst, user: products, item_total: item_total, discountedAmount: totalDisc, coupon: coupon, hideCoupon: false });
                    }
                }

                if (coupon.couponType == "onAmount" && disc_amount >= coupon.specificAmount) {
                    const user = await User.findOne({ _id: req.user._id }).populate({ path: 'cart.product', model: 'Variation' });
                    for (const item of user.cart) {
                        itemsDiscounted += 1;
                        discountedAmount = ((await item.product.dprice) * (item.quantity)) * (coupon.discount) / 100
                        disc_amount -= discountedAmount;
                        totalDisc += discountedAmount;
                        disc_amount = parseFloat(disc_amount).toFixed(2);
                    }
                    if (itemsDiscounted > 0) {
                        res.locals.session.discountedtotal = disc_amount;
                        res.locals.session.coupon = coupon._id;
                        res.render('customers/checkout', { sTotal: disc_amount, p_fee: charg, taxes: gst, user: products, item_total: item_total, discountedAmount: totalDisc, coupon: coupon, hideCoupon: true });
                    } else {
                        req.flash('error', `Sorry, Coupon is expired or something went wrong.`)
                        res.render('customers/checkout', { sTotal: disc_amount, p_fee: charg, taxes: gst, user: products, item_total: item_total, discountedAmount: totalDisc, coupon: coupon, hideCoupon: false });
                    }
                }

            }

        }
    }
}

module.exports = orderController
