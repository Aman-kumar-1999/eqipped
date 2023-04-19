const GetPreDiscount = require('../../models/getPreDiscount');
const User = require('../../models/user')
const MarqueContent = require("../../models/marqueContentModel");
const Brand = require('../../models/brand')
const Category = require('../../models/categories')
const subCategory = require('../../models/subcategory');
const Sub = require('../../models/subcategory');
const Variation = require('../../models/variation');
const nodemailer = require('nodemailer')


function homeController() {
    return {
        // index(req, res) {
        //     res.render('home')
        // },

        async getPreDiscount(req, res) {
            const { phone, email, name } = req.body

            if (!phone || !email || !name) {
                return res.json({ msg: "Enter Name, Phone & Email backend" })
            }

            const checkUser = await GetPreDiscount.findOne({ $or: [{ 'phone': phone }, { 'email': email }] })

            if (checkUser) {
                return res.json({ msg: "Credentials already used to get coupon code" })   // agar num ya email use ho chuka hai toh use coupon code mil chuka hai dobara nahi milega
            }

            const disCode = `e${email.slice(0, 3)}p${phone.slice(7, 10)}`


            // if (!phone || !email) {
            //     return res.json({ msg: "Enter phone or email carefully" })
            //   }
            //   else {
            //     await axios
            //       .get(`https://www.txtguru.in/imobile/api.php?username=gearloose.lab&password=71703091&source=GRLABS&dmobile=91${phone}&dlttempid=1507165000853446536&message=${disCode} is your coupon code. GRLABS`)
            //       .then(async (res) => {
            //         console.log(`statusCode: ${res.status}`)
            //       })
            //       .catch(error => {
            //         return res.send({ msg: "phone otp textguru Failure" })
            //       })}


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
                to: email,
                subject: 'Discount Coupon Code',
                text: `Your 5% flat discount coupon code is ${disCode}`

            };

            transporter.sendMail(mailOptions, async function (err, info) {
                if (err) {
                    return res.json({ msg: "Something went wrong. Please try again later" })
                } else {

                    const discountDone = await GetPreDiscount.create({
                        name,
                        phone,
                        email,
                        disCode
                    });
        
                    if (!discountDone) {
                        return res.json({ msg: "Something went wrong. Please try again later" })
                    }
        
                    return res.json({ msg: "Success" })

                }
            })

        },

        landingPage(req, res) {
            res.render('home')
        },

        CustomerSupport(req, res) {
            res.render('footerDocu/customerSupport')
        },


        pripolicy(req, res) {
            res.render('footerDocu/policies')
        },
        careers(req, res) {
            res.render('footerDocu/career')
        },
        blogs(req, res) {
            res.render('blogs/bloghome')
        },
        compose(req, res) {
            res.render('blogs/compose')
        },

        sitemap(req, res) {
            res.render('site/sitemap')
        },
        sitemapxml(req, res) {
            res.sendFile('sitemapxml.xml', { root: './resources/views/site' })
        },
        termcondition(req, res) {
            res.render('footerDocu/T & C')
        },
        discount_granted(req, res) {
            res.redirect('/');
        },
        qr_code(req,res){
            res.redirect('/');
        },
        async grandIndex(req, res) {
            const MarqueData = await MarqueContent.find();
            const nashta = await Category.find();
            const brand = await Brand.find();
            const glassware = await Variation.find({ category: "624e86f68964e0a947f59e04", 'isverified': 'Yes' }).populate('brand').limit(10).exec(); // Glassware Id
            const plastu = await Variation.find({ category: "624e86f68964e0a947f59e02", 'isverified': 'Yes' }).populate('brand').limit(10).exec(); // Plasticware Id
            const chemicals = await Variation.find({ category: "624e86f68964e0a947f59e03", 'isverified': 'Yes' }).populate('brand').limit(10).exec(); // Chemicals Id
            const latest = await Variation.find().limit(10).populate('brand').sort('-createdAt');
            const subcats = await Sub.find({ 'isverified': 'Yes' }).limit(12);
            return res.render('grandHome', { brand: brand, nashta: nashta, subcats: subcats, plastu: plastu, products: glassware, latest: latest, chemicals: chemicals, MarqueData });
        },


        fetch(req, res, next) {
            var regex = new RegExp(req.query["term"], 'i');
            var productFilter = Variation.find({ $or: [{ "name": { "$in": [regex] } }] }).sort({ "updated_at": -1 }).sort({ "created_at": -1 }).populate('product').limit(10);
            var categoryFilter = Category.find({ $or: [{ "pCategory": { "$in": [regex] } }] }).sort({ "updated_at": -1 }).sort({ "created_at": -1 }).limit(10);
            var subcatFilter = subCategory.find({ $or: [{ "name": { "$in": [regex] } }] }).sort({ "updated_at": -1 }).sort({ "created_at": -1 }).limit(10);
            productFilter.exec(function (err, data) {
                var result = [];
                if (data) {
                    if (data && data.length && data.length > 0) {
                        data.forEach(product => {

                            var label = product.product.name + " - " + product.name
                            result.push(label)
                        });

                    }
                    var uniqueString = [...new Set(result)]
                    res.jsonp(uniqueString);
                } else {
                    res.jsonp(result)
                }

            });
        }
    }
}

module.exports = homeController