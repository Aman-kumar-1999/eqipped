const User = require("../../../models/user");
const Variation = require("../../../models/variation");
const Coupon = require("../../../models/coupon");
const GetPreDiscount = require('../../../models/getPreDiscount');
const Brand = require('../../../models/brand');
const Category = require('../../../models/categories')
const subCategory = require('../../../models/subcategory');
const nodemailer = require('nodemailer')

function productController() {
    return {
        async verifyProducts(req, res) {

            Variation.find({ isverified: { $ne: 'Yes' } }, null, { sort: { 'createdAt': -1 } }).exec((err, products) => {
                if (req.xhr) {
                    return res.json(products)
                } else {
                    return res.render('admin/verifyProducts')
                }
            })
        },

        async fetchfordeleteproduct(req, res) {
            const products = await Variation.find().populate('brand');
            return res.render('admin/fetchproducts', { products: products })
        },

        async deleteproduct(req, res) {
            let product_id = req.params._id;
            await Variation.deleteOne({ _id: product_id })
            const products = await Variation.find().populate('brand');
            res.redirect('/admin/deleteproduct');
        },



        async createCoupon(req, res) {
            const brands = await Brand.find();
            const allUsers = await User.find();
            const categorys = await Category.find();
            const subCategorys = await subCategory.find();
            return res.render('admin/createCoupon', { brands, categorys, subCategorys, allUsers });
        },

        async postcreateCoupon(req, res) {
            const { coupon, brand, percentage, category, subcategory, coupontype, victimId, disUptoThisAmount } = req.body
            const couponn = await Coupon.findOne({ couponName: coupon });
            if (couponn) {
                req.flash('error', 'coupon already exists');
                res.redirect('/createCoupon');
            } else if (coupontype != "onSpecific") {
                const create_coupon = new Coupon({
                    couponName: coupon,
                    couponType: coupontype,
                    specificAmount: disUptoThisAmount,
                    brand: brand,
                    category: category,
                    subCategory: subcategory,
                    discount: percentage
                })
                create_coupon.save().then((create_coupon) => {
                    req.flash('error', 'Wow, coupon is created successfully')
                    return res.redirect('/createCoupon')
                }).catch(err => {
                    console.log(err)
                    req.flash('error', 'Something went wrong')
                    return res.redirect('/createCoupon')
                })
            } else {
                console.log(req.body)
                const checkRegUser = await User.findById(victimId)
                const checkUser = await GetPreDiscount.findOne({ $or: [{ 'phone': checkRegUser.phone }, { 'email': checkRegUser.email }] })

                if (checkUser) {
                    req.flash('error', 'Coupon already exist to this user')
                    return res.redirect('/createCoupon')   // agar num ya email use ho chuka hai toh use coupon code mil chuka hai dobara nahi milega
                }

                if (checkRegUser) {
                    let aphone = JSON.stringify(checkRegUser.phone);
                    let semail = checkRegUser.email;
                    const disCode = `e${semail.slice(0, 3)}p${aphone.slice(7, 10)}`

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
                        to: semail,
                        subject: 'Discount Coupon Code',
                        text: `Your ${percentage}% discount coupon code is ${disCode}`

                    };

                    transporter.sendMail(mailOptions, async function (err, info) {
                        if (err) {
                            req.flash('error', 'Something went wrong. Please try again later')
                            return res.redirect('/createCoupon')
                        } else {

                            const discountDone = await GetPreDiscount.create({
                                victimId,
                                disCode,
                                email: checkRegUser.email,
                                phone: checkRegUser.phone,
                                discount: percentage,
                                couponType: coupontype,
                            });

                            if (discountDone) {
                                req.flash('error', 'Wow coupon is created successfully')
                                return res.redirect('/createCoupon')
                            }

                        }
                    })
                } else {
                    req.flash('error', 'User not registered')
                    return res.redirect('/createCoupon')
                }

            }
        }
    }
}

module.exports = productController