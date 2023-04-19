require('dotenv').config()
const nodemailer = require('nodemailer')
var http = require('http'),
	fs = require('fs'),
	ccav = require('./ccavutil.js'),
	qs = require('querystring');

const Order = require('./app/models/order');
const Coupon = require('./app/models/coupon');
const GetPreDiscount = require('./app/models/getPreDiscount');
const OrderId = require('./app/models/orderID');
const Brand = require('./app/models/brand');
const User = require('./app/models/user');

exports.postRes = async function (req, res) {
	var ccavEncResponse = '',
		ccavResponse = '',
		// workingKey = '13DB58FE19D7C6CDF6A3187326352027',	//Put in the 32-Bit key shared by CCAvenues localhost.
		workingKey = process.env.WORKINGKEY,	//Put in the 32-Bit key shared by CCAvenues eqipped.com.
		// workingKey = '0745DFF637295D9271DD0C2CFC3ECC13',	//Put in the 32-Bit key shared by CCAvenues eqipped.com.
		ccavPOST = '';


	// console.log(".on function worked response handler")
	// console.log(req.body)

	ccavEncResponse += qs.stringify(req.body);
	ccavPOST = qs.parse(ccavEncResponse);
	var encryption = ccavPOST.encResp;
	ccavResponse = ccav.decrypt(encryption, workingKey);
	const data = ccavResponse.split('&')
	var obj = {};
	data.forEach((daa) => {
		const x = daa.split('=');
		const key = x[0];
		obj[key] = x[1];
	});

	// console.log(obj);

	//  if(obj.order_status == "Success" && obj.status_message == "Y"){  // For test
	if (obj.order_status == "Success" && obj.status_message == "Transaction Successful-NA-0") {	// For production
		const userId = obj.merchant_param1;

		const orderid = new OrderId({
			user: userId,
			orderID: obj.order_id
		})


		orderid.save().then((user) => {
		}).catch(err => {
			req.flash('error', 'Something went wrong');
		})

		const user = await User.findOne({ _id: userId }).populate({ path: 'cart.product', model: 'Variation' });
		const cart = user.cart;

		const oiddArr = obj.merchant_param4;
		const oiddArray = oiddArr.split('-');
		const payDetails = obj.merchant_param2.split('-');
		const discountDetails = obj.merchant_param3.split('-');
		var couponn = '';
		if (discountDetails[1] == 'null') {
			couponn = null;
		} else {
			couponn = discountDetails[1];
		}
		if (user) {
			for (var i = 0; i < cart.length; i++) {
				const order = new Order({
					customerId: obj.merchant_param1,
					customerName: obj.billing_name,
					email: obj.billing_email,
					orderId: oiddArray[i],
					groupId: obj.order_id,
					txnDate: obj.trans_date,
					txnAmount: obj.amount,
					items: cart[i],
					vendorId: cart[i].vendor,
					phone: obj.billing_tel,
					address: obj.billing_address,
					pincode: obj.billing_zip,
					discountedtotal: discountDetails[0],
					advance: payDetails[0],
					remainingAmount: payDetails[1],
					coupon: couponn,
					bankName: 'hh',
					bankTxnId: 'hh',
					gateWayName: 'hh',
					paymentMode: obj.payment_mode,
					respcode: 'hh',
					txnStatus: 'hh',
					respmsg: obj.status_message,
					txnID: 'hh',
					total: payDetails[2]
				});


				console.log(order);

				order.save(() => {
					const transporter = nodemailer.createTransport({
						service: 'gmail',
						auth: {
							user: 'gearloose.lab@gmail.com',
							pass: 'zhbqmsmltkrrkgtv'
							// pass: 'Asdfqwer1234'
						},
						port: 465,
						host: "smtp.gmail.com"
					});
 
					const mailOptions = {
						from: 'gearloose.lab@gmail.com',
						to: obj.billing_email,
						subject: 'Your Order SuccessFully Placed',
						text: `Your Eqipped.com order ${obj.order_id} Placed Successfully`

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
				})

				// console.log(order);

				OrderId.updateOne({
					orderID: obj.order_id
				}, {
					$push: {
						orders: order._id,
					}
				}, () => {
					console.log("Order Added to Order Id SuccessFully");
				})
			}
			User.updateOne({
				_id: user._id
			}, {
				$set: {
					cart: []
				}
			}, (err) => {
				if (err) console.log("Can't Delete User cart Items");
			});
			if (discountDetails[1] != null) {
				Coupon.updateOne({
					_id: discountDetails[1]
				}, {
					$push: {
						usedBy: user._id
					}
				}, () => {
					console.log("User Get Discount by Custom Coupon");
				})
			}
			if (discountDetails[1] != null) {
				GetPreDiscount.updateOne({
					_id: discountDetails[1]
				}, {
					$push: {
						usedBy: user._id
					}
				}, () => {
					console.log("User Get Discount by Custom Coupon");
				})
			}
			res.redirect('/customer/individualOrder')
		} else {
			req.flash('error', 'Your payment has been declined by your bank. Please try again or use a different method to complete the payment.');
			res.redirect('/cart');
		}
	} else {
		res.redirect('/cart');

	}

};
