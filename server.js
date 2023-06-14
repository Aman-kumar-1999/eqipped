require('dotenv').config()
const express = require('express')
const path = require('path')
const app = express()
const ejs = require('ejs')
const expressLayout = require('express-ejs-layouts');
const moment = require('moment');
const mongoose = require('mongoose')
const session = require('express-session')
const flash = require('express-flash')
const MongoDbStore = require('connect-mongo')(session)
const passport = require('passport')
const Emitter = require('events')
var bodyParser = require('body-parser')
const multer = require('multer')
const axios = require("axios")
const compression = require('compression');

const OrderId = require('./app/models/orderID')


app.use(compression({
    level: 6,
    threshold: 0,

}));

// Database connection
// const url = process.env.MongoDB_URI
const url = "mongodb+srv://admin:gsk3E1ZwjWwgqAoC@cluster0.9xkoq.mongodb.net/Euipped_dB"

mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true });
const connection = mongoose.connection;
connection.once('open', () => {
    let weeks = moment().weeks() - moment().startOf('month').weeks() + 1;
    weeks = (weeks + 52) % 52;
    console.log('Database connected...');
});


// Session store
let mongoStore = new MongoDbStore({
    mongooseConnection: connection,
    collection: 'sessions'
})

//s3 client

// Event emitter
const eventEmitter = new Emitter()
app.set('eventEmitter', eventEmitter)

// Session config
app.use(session({
    secret: process.env.COOKIE_SECRET || 'heyea',
    resave: false,
    store: mongoStore,
    saveUninitialized: false,
    cookie: { maxAge: 1000 * 60 * 60 * 48 } // 24 hour
}))

// Passport config
const passportInit = require('./app/config/passport')
passportInit(passport)
app.use(passport.initialize())
app.use(passport.session())

app.use(flash())

// Assets
app.use(express.static('public'))
app.use(express.urlencoded({ extended: false }))
app.use(express.json())

// Global middleware
app.use((req, res, next) => {
    res.locals.session = req.session
    res.locals.user = req.user
    // res.locals.order = req.order
    next()
})




// Render html page 
app.get('/pls', (req, res) => {
    res.sendFile(__dirname + '/index.html')
})


// set Template engine
app.use(expressLayout)
app.set('views', path.join(__dirname, '/resources/views'))
app.set('view engine', 'ejs')


app.use('/docs', express.static('docs'))
app.use('/documents', express.static('./public/businessDocuments/'))


//Paytm API Body Parser
const Menu = require('./app/models/order');
// const express = require("express")
const http = require('http'),
    fs = require('fs'),
    ccav = require('./ccavutil.js'),
    qs = require('querystring'),
    ccavReqHandler = require('./ccavRequestHandler.js'),
    ccavResHandler = require('./ccavResponseHandler.js');
const checksum_lib = require("./routes/Paytm/checksum")
const config = require("./routes/Paytm/config")
const user = require('./app/models/user')
app.use(express.urlencoded({ extended: true }));

const parseUrl = express.urlencoded({ extended: true });
const parseJson = express.json();
const request = require('request')
const { response } = require('express')

var variableorderid = '235';


// -----------------------  PAYTM Payment Gateway START ---------------------------//


app.post('/paynow', [parseUrl, parseJson], async (req, res) => {
    if (req.user.cart.length > 0) {
        const { phone, address, pincode } = req.body
        res.locals.session.phone = phone
        res.locals.session.address = address
        res.locals.session.pincode = pincode

        user.findOne({ _id: req.user._id, address: address }, function (err, result) {
            if (err) { console.log(err); }
            if (!result) {
                if (req.user.address.length < 2) {
                    user.updateOne({ _id: req.user._id }, { $push: { address: address } }, (err, result) => {
                        if (err) {
                            console.log(err);
                        }
                    }
                    );
                } else {
                    user.updateOne({ $pop: { address: -1 } }, (err, result) => {
                        if (err) {
                            console.log(err);
                        }
                    }
                    
                    );
                    user.updateOne({ _id: req.user._id }, { $push: { address: address } }, (err, result) => {
                        if (err) {
                            console.log(err);
                        }
                    }
                    );

                }
            }
        });


        var txnAmount;

        if (req.session.discountedtotal) {
            txnAmount = req.session.discountedtotal
        } else {
            txnAmount = req.session.sub_total;
        }



        var mnth = ""
        switch (new Date().getMonth() + 1) {
            case 1:
                mnth = "01";
                break;
            case 2:
                mnth = "02";
                break;
            case 3:
                mnth = "03";
                break;
            case 4:
                mnth = "04";
                break;
            case 5:
                mnth = "05";
                break;
            case 6:
                mnth = "06";
                break;
            case 7:
                mnth = "07";
                break;
            case 8:
                mnth = "08";
                break;
            case 9:
                mnth = "09";
                break;
            case 10:
                mnth = "10";
                break;
            case 11:
                mnth = "11";
                break;
            case 12:
                mnth = "12";
            default:
                mnth = "00"
        }
        var oidd = ""
        let weeks = moment().weeks() - moment().startOf('month').weeks() + 1;

        var oidd = new Date().getYear() + mnth + weeks + variableorderid;
        variableorderid++;
        let query = { orderID: oidd }
        let resss = await OrderId.findOne(query);
        if (resss) {
            req.flash('error', 'Some Error Ocurred! Please Try Again');
            return res.redirect('back');
        }

        const https = require('https');
        const PaytmChecksum = require('./routes/Paytm/checksum');

        var paytmParams = {};

        paytmParams.body = {
            "requestType": "Payment",
            // "mid": process.env.MID,
            "mid": config.PaytmConfig.mid,
            // "websiteName": process.env.WEBSITE,
            "websiteName": config.PaytmConfig.website,
            "orderId": oidd,
            "callbackUrl": "https://www.eqipped.com/callbackCompletePayment",
            "txnAmount": {
                "value": txnAmount,
                "currency": "INR",
            },
            "userInfo": {
                "custId": req.user._id,
            },
        };

        // PaytmChecksum.generateSignature(JSON.stringify(paytmParams.body), process.env.KEY).then(function (checksum) {
        PaytmChecksum.generateSignature(JSON.stringify(paytmParams.body), config.PaytmConfig.key).then(function (checksum) {

            paytmParams.head = {
                "signature": checksum
            };

            var post_data = JSON.stringify(paytmParams);

            var options = {

                /* for Test Staging */
                hostname: 'securegw-stage.paytm.in',

                /* for Production */
                // hostname: 'securegw.paytm.in',

                port: 443,
                path: `/theia/api/v1/initiateTransaction?mid=${config.PaytmConfig.mid}&orderId=${oidd}`,
                // for production 
                // path: `/theia/api/v1/initiateTransaction?mid=${process.env.MID}&orderId=${oidd}`,
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Content-Length': post_data.length
                }
            };

            var response = "";
            var post_req = https.request(options, function (post_res) {
                post_res.on('data', function (chunk) {
                    response += chunk;
                });

                var token = post_res.on('end', function () {
                    response = JSON.parse(response);
                    // console.log(response)
                    res.render('payment', { txnToken: response.body.txnToken, amount: req.session.total, orderID: oidd })
                });
            });
            post_req.write(post_data);
            post_req.end();
        });
    }
})

app.post('/payod', [parseUrl, parseJson], async (req, res) => {
    if (req.user.cart.length > 0) {
        const { phone, address, pincode } = req.body
        res.locals.session.phone = phone
        res.locals.session.address = address
        res.locals.session.pincode = pincode

        user.findOne({ _id: req.user._id, address: address }, function (err, result) {
            if (err) { console.log(err); }
            if (!result) {
                if (req.user.address.length < 2) {
                    user.updateOne({ _id: req.user._id }, { $push: { address: address } }, (err, result) => {
                        if (err) {
                            console.log(err);
                        }
                    }
                    );
                } else {
                    user.updateOne({ $pop: { address: -1 } }, (err, result) => {
                        if (err) {
                            console.log(err);
                        }
                    }

                    );
                    user.updateOne({ _id: req.user._id }, { $push: { address: address } }, (err, result) => {
                        if (err) {
                            console.log(err);
                        }
                    }
                    );

                }
            }
        });

        var mnth = ""
        switch (new Date().getMonth() + 1) {
            case 1:
                mnth = "01";
                break;
            case 2:
                mnth = "02";
                break;
            case 3:
                mnth = "03";
                break;
            case 4:
                mnth = "04";
                break;
            case 5:
                mnth = "05";
                break;
            case 6:
                mnth = "06";
                break;
            case 7:
                mnth = "07";
                break;
            case 8:
                mnth = "08";
                break;
            case 9:
                mnth = "09";
                break;
            case 10:
                mnth = "10";
                break;
            case 11:
                mnth = "11";
                break;
            case 12:
                mnth = "12";
            default:
                mnth = "00"
        }
        var oidd = ""
        let weeks = moment().weeks() - moment().startOf('month').weeks() + 1;
        let oiddArray = [];
        var random = Math.floor(Math.random() * (100000 - 1 + 1)) + 1;
        console.log(random);
        var groupId = new Date().getYear() + random + mnth + weeks;
        console.log(groupId)
        let query = { orderID: groupId }
        let resss = await OrderId.findOne(query);
        if (resss) {
            req.flash('error', 'Some Error Ocurred! Please Try Again');
            return res.redirect('back');
        }
        for (var i = 0; i < req.user.cart.length; i++) {

            var oidd = groupId + i;
            console.log(oidd);
            oiddArray.push(oidd);
        }

        res.locals.session.oiddArray = oiddArray;
        res.locals.session.groupId = groupId;

        const https = require('https');
        const PaytmChecksum = require('./routes/Paytm/checksum');
        const coupon = req.session.coupon || null
        const discountedtotal = req.session.discountedtotal || 0;

        // if(discountedtotal && coupon){
        //     if (req.session.sub_total <= 1000) {
        //         var advancepayment = 100;
        //         var remainingAmount = req.session.discountedtotal - 100;
        //     } else if (req.session.sub_total > 1000 || req.session.sub_total < 5000) {
        //         var advancepayment = 500;
        //         var remainingAmount = req.session.discountedtotal - 500;
        //     } else {
        //         var advancepayment = 1000;
        //         var remainingAmount = req.session.discountedtotal - 1000;
        //     }
        // }else{
        //     if (req.session.sub_total <= 1000) {
        //         var advancepayment = 100;
        //         var remainingAmount = req.session.sub_total - 100;
        //     } else if (req.session.sub_total > 1000 || req.session.sub_total < 5000) {
        //         var advancepayment = 500;
        //         var remainingAmount = req.session.sub_total - 500;
        //     } else {
        //         var advancepayment = 1000;
        //         var remainingAmount = req.session.sub_total - 1000;
        //     }
        // }


        if (req.session.sub_total <= 1000) {
            var advancepayment = 100;
            res.locals.session.remainingAmount = req.session.sub_total - 100;
        } else if (req.session.sub_total > 1000 || req.session.sub_total < 5000) {
            var advancepayment = 500;
            res.locals.session.remainingAmount = req.session.sub_total - 500;
        } else {
            var advancepayment = 1000;
            res.locals.session.remainingAmount = req.session.sub_total - 1000;
        }

        res.locals.session.advance = advancepayment;

        console.log('req.session.sub_total :>> ', req.session.sub_total)
        console.log('advancepayment :>> ', advancepayment)
        console.log('remainingAmount :>> ', req.session.remainingAmount);

        res.redirect('/callbackCompletePayment')
    }
})
// -----------------------  PAYTM Payment Gateway END ---------------------------//


/*

  {\__/}
 (• - •)     (  BELLO!! )
 / ^ ^ \o

*/


// -----------------------  CCAV Payment Gateway START ---------------------------//


app.post('/ccavRequestHandler', async function (request, response) {
    var body = '',
        workingKey = process.env.WORKINGKEY,	//Put in the 32-Bit key shared by CCAvenues eqipped.com.
        accessCode = process.env.ACCESSCODE,			//Put in the Access Code shared by CCAvenues. eqipped.com

        // workingKey = '0745DFF637295D9271DD0C2CFC3ECC13',	//Put in the 32-Bit key shared by CCAvenues eqipped.com.
        // accessCode = 'AVHU13JG47CI18UHIC',			//Put in the Access Code shared by CCAvenues. eqipped.com

        // workingKey = '13DB58FE19D7C6CDF6A3187326352027',	//Put in the 32-Bit key shared by CCAvenues localhost.
        // accessCode = 'AVKS04JH38AH50SKHA',			//Put in the Access Code shared by CCAvenues. localhost
        encRequest = '',
        formbody = '';

    if (request.user.cart.length > 0) {
        const { phone, address, pincode } = request.body

        response.locals.session.phone = phone
        response.locals.session.address = address
        response.locals.session.pincode = pincode

        user.findOne({ _id: request.user._id, address: address }, function (err, result) {
            if (err) { console.log(err); }
            if (!result) {
                if (request.user.address.length < 2) {
                    user.updateOne({ _id: request.user._id }, { $push: { address: address } }, (err, result) => {
                        if (err) {
                            console.log(err);
                        }
                    }
                    );
                } else {
                    user.updateOne({ $pop: { address: -1 } }, (err, result) => {
                        if (err) {
                            console.log(err);
                        }
                    }

                    );
                    user.updateOne({ _id: request.user._id }, { $push: { address: address } }, (err, result) => {
                        if (err) {
                            console.log(err);
                        }
                    }
                    );

                }
            }
        });

        var mnth = ""
        switch (new Date().getMonth() + 1) {
            case 1:
                mnth = "01";
                break;
            case 2:
                mnth = "02";
                break;
            case 3:
                mnth = "03";
                break;
            case 4:
                mnth = "04";
                break;
            case 5:
                mnth = "05";
                break;
            case 6:
                mnth = "06";
                break;
            case 7:
                mnth = "07";
                break;
            case 8:
                mnth = "08";
                break;
            case 9:
                mnth = "09";
                break;
            case 10:
                mnth = "10";
                break;
            case 11:
                mnth = "11";
                break;
            case 12:
                mnth = "12";
            default:
                mnth = "00"
        }
        var oidd = ""
        let weeks = moment().weeks() - moment().startOf('month').weeks() + 1;
        let oiddArray = '';
        var random = Math.floor(Math.random() * (100000 - 1 + 1)) + 1;
        console.log(random);
        var groupId = new Date().getYear() + random + mnth + weeks;
        console.log(groupId)
        let query = { orderID: groupId }
        let resss = await OrderId.findOne(query);
        if (resss) {
            request.flash('error', 'Some Error Ocurred! Please Try Again');
            return response.redirect('back');
        }
        for (var i = 0; i < request.user.cart.length; i++) {

            var oidd = groupId + i;
            if (i != request.user.cart.length - 1) {
                oiddArray += oidd + '-';
            } else {
                oiddArray += oidd;
            }
        }

        response.locals.session.oiddArray = oiddArray;
        response.locals.session.groupId = groupId;

        const https = require('https');
        const PaytmChecksum = require('./routes/Paytm/checksum');
        const coupon = request.session.coupon || null
        const discountedtotal = request.session.discountedtotal || 0;
        var pay_amount = 0;
        if (request.body.paytype == 'paynow') {
            if (discountedtotal) {
                pay_amount = discountedtotal - (request.session.total * 0.02);
            } else {
                pay_amount = request.session.sub_total - (request.session.total * 0.02); //2% DISCOUNT ON PAYNOW
            }

            advancepayment = pay_amount;
            response.locals.session.remainingAmount = 0;
        } else {
            if (discountedtotal) {
                if (discountedtotal <= 1000) {
                    var advancepayment = 100;
                    response.locals.session.remainingAmount = discountedtotal - 100;
                } else if (discountedtotal > 1000 || discountedtotal < 5000) {
                    var advancepayment = 500;
                    response.locals.session.remainingAmount = discountedtotal - 500;
                } else {
                    var advancepayment = 1000;
                    response.locals.session.remainingAmount = discountedtotal - 1000;
                }
                pay_amount = discountedtotal;
            } else {
                if (request.session.sub_total <= 1000) {
                    var advancepayment = 100;
                    response.locals.session.remainingAmount = request.session.sub_total - 100;
                } else if (request.session.sub_total > 1000 || request.session.sub_total < 5000) {
                    var advancepayment = 500;
                    response.locals.session.remainingAmount = request.session.sub_total - 500;
                } else {
                    var advancepayment = 1000;
                    response.locals.session.remainingAmount = request.session.sub_total - 1000;
                }

                pay_amount = request.session.sub_total;
            }
        }

        const remainingAmount = Math.ceil(request.session.remainingAmount);

        var merchant_param2 = advancepayment + '-' + remainingAmount + '-' + pay_amount;
        var merchant_param3 = discountedtotal + '-' + coupon;

        // console.log('request.session.sub_total :>> ', request.session.sub_total)
        // console.log('advancepayment :>> ', advancepayment)
        // console.log('remainingAmount :>> ', request.session.remainingAmount);
        const userId = JSON.stringify(request.user._id);
        const ccavData = {
            merchant_id: '1228214',
            order_id: groupId,
            currency: 'INR',
            amount: advancepayment,
            redirect_url: 'https://www.eqipped.com/ccavResponseHandler',
            cancel_url: 'https://www.eqipped.com/ccavResponseHandler',
            // redirect_url: 'http://www.localhost:3300/ccavResponseHandler',
            // cancel_url: 'http://www.localhost:3300/ccavResponseHandler',
            language: 'EN',
            billing_name: request.user.fname + " " + request.user.lname,
            billing_email: request.body.billing_email,
            billing_tel: request.body.billing_tel,
            billing_address: request.body.billing_address,
            billing_city: request.body.billing_city,
            billing_state: request.body.billing_state,
            billing_zip: request.body.billing_zip,
            billing_country: request.body.billing_country,
            merchant_param1: userId,
            merchant_param2: merchant_param2,
            merchant_param3: merchant_param3,
            merchant_param4: oiddArray,
        }
        body += qs.stringify(ccavData);
        // console.log(ccavData)
        encRequest = ccav.encrypt(body, workingKey);
        formbody = '<form id="nonseamless" method="post" name="redirect" action="https://secure.ccavenue.com/transaction/transaction.do?command=initiateTransaction"/> <input type="hidden" id="encRequest" name="encRequest" value="' + encRequest + '"><input type="hidden" name="access_code" id="access_code" value="' + accessCode + '"><script language="javascript">document.redirect.submit();</script></form>';
        // formbody = '<form id="nonseamless" method="post" name="redirect" action="https://test.ccavenue.com/transaction/transaction.do?command=initiateTransaction"/> <input type="hidden" id="encRequest" name="encRequest" value="' + encRequest + '"><input type="hidden" name="access_code" id="access_code" value="' + accessCode + '"><script language="javascript">document.redirect.submit();</script></form>';
        request.session.coupon = null;
        request.session.discountedtotal = 0;
        request.session.remainingAmount = "";
        response.writeHeader(200, { "Content-Type": "text/html" });
        response.write(formbody);
        response.end();
    }
});


app.post('/ccavResponseHandler', function (req, res) {
    ccavResHandler.postRes(req, res);
});

// -----------------------  CCAV Payment Gateway END ---------------------------//




// Upload image from vendor or admin add product 
const admin = require('./app/http/middlewares/admin')
const Variation = require('./app/models/variation')
const User = require('./app/models/user')
const subcategory = require('./app/models/subcategory');
const Document = require('./app/models/document');


var maxiSize = 5 * 1000 * 1000  // Now allowing user uploads up to 10MB

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './public/img/')
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname);
    }
})


const upload = multer(
    {
        storage: storage,
        limits:
        {
            fileSize: maxiSize
        }
    }
).fields(
    [
        {
            name: 'image',
            maxCount: 7
        },
        {
            name: 'd3Image',
            maxCount: 1
        }
    ]
)


app.post('/addproduct', function (req, res) {

    upload(req, res, async function (err) {
        if (err instanceof multer.MulterError) {
            // A Multer error occurred when uploading.
            req.flash('error', 'Image Size Too Large (Max-size: 1mb)')
            return res.redirect('/addproduct')
        } else if (err) {
            // An unknown error occurred when uploading.
            req.flash('error', 'Something went wrong, Please try again')
            return res.redirect('/addproduct')
        }

        const images = [];
        const stars = req.files.image;

        for (let i = 0; i < stars.length; i++) {
            const resultant = stars[i];
            images.push({
                public_id: resultant.size,
                imgName: resultant.filename,
            });
        }

        let starbucks = ""

        if (req.files.d3Image) {
            starbucks = req.files.d3Image[0].filename
        }

        const { pname, category, brand, HSN, GST, containedLiquid, variationname, packPrice, vcode, description, itemWeight, piecePerPack, price, stock, commision, subCategory, variationLabel, gcode } = req.body


        if (!pname || !category || !brand || !HSN || !GST || !containedLiquid || !variationname || !vcode || !piecePerPack || !price || !variationLabel || !gcode) {
            req.flash('error', 'All fields are required')
            return res.redirect('/addproduct')
        }


        const variation = new Variation({
            vendor: req.user._id,
            sellerRole: req.user.role,
            pname,
            price,
            gcode,
            vcode,
            commision,
            image: images,
            brand,
            category,
            d3Image: starbucks,
            // subCategory,
            HSN,
            GST,
            containedLiquid,
            itemWeight,
            stock,
            description,
            piecePerPack,
            variationLabel,
            variationname,
            packPrice
        });

        // console.log('variation :>> ', variation);

        variation.save().then((result) => {
            req.flash('error', 'Product Added Successfully');
            return res.redirect('/addproduct')
        }).catch((err) => {
            console.log(err)
            req.flash('error', 'Something went wrong, Contact TechTeam')
            return res.redirect('/addproduct')
        });

    })
})




// Upload business document
var maxSize = 200000000;
var fileno = 1;

const storage2 = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './public/businessDocuments/')
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = req.user._id + JSON.stringify(fileno);
        fileno += 1;
        if (req.user) {
            User.updateOne({
                _id: req.user._id
            }, {
                $set: {
                    documentNumber: fileno - 1
                }
            }, () => {
                console.log("Updated")
            })
        }
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
})



const upload2 = multer({ storage: storage2, limits: { fileSize: maxSize } }).array('avatar')


app.post('/complete-your-profile', function (req, res) {


    upload2(req, res, function (err) {
        if (err instanceof multer.MulterError) {
            // A Multer error occurred when uploading.
            console.log(err)
            req.flash('error', 'File Too Large (Max-size: 2mb)')
            return res.redirect('/verification')
        } else if (err) {
            // An unknown error occurred when uploading.
            console.log(err)
            req.flash('error', 'Something went wrong, Please try again')
            return res.redirect('/verification')
        }


        const { registerAs, gst, cin, pan, udise, man } = req.body
        const document = new Document({ registerAs, gst, cin, pan, udise, man })

        document.save().then(result => {
            // Everything went fine.
            User.findOneAndUpdate({ _id: req.user.id }, { isuploded: "Yes" }, (err, data) => {
                if (err) {
                    console.log(err)
                } else {
                    console.log("Done")
                }
            })

            req.flash('error', 'Documents Added Successfully')
            return res.redirect('/verification')

        }).catch(err => {
            req.flash('error', 'Something went wrong')
            return res.redirect('/verification')
        });


    })
})




//   Add category from admin panel
const Category = require('./app/models/categories')

app.post('/addcategory', admin, function (req, res) {

    const { category, categoryImg } = req.body
    const create_category = new Category({
        pcategory: category,
        pimage: categoryImg
    })


    create_category.save().then((create_category) => {
        req.flash('error', 'Category Added Successfully')
        return res.redirect('/admin/addcategories')
    }).catch(err => {

        console.log(err)
        req.flash('error', 'Something went wrong')
        return res.redirect('/admin/addcategories')
    })

})


require('./routes/web')(app)
app.use((req, res) => {
    res.status(404).render('errors/404')
})
const PORT = process.env.PORT || 3400;

const server = app.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`)
})

// Socket

const io = require('socket.io')(server)
io.on('connection', (socket) => {
    // Join     
    socket.on('join', (orderId) => {
        socket.join(orderId)
    })
})


eventEmitter.on('orderUpdated', (data) => {
    io.to(`order_${data.id}`).emit('orderUpdated', data)
})


eventEmitter.on('orderPlaced', (data) => {
    io.to('adminRoom').emit('orderPlaced', data)
})

// Hatana nhi
// eventEmitter.on('notifyVendor', (data) => {
//     io.to('vendorRoom').emit('notifyVendor', data)
// })


eventEmitter.on('userCreated', (data) => {
    io.to('adminRoom').emit('userCreated', data)
})

