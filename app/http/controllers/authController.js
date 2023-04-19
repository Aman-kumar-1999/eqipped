const User = require('../../models/user')
const Otp = require('../../models/otpModel')
const bcrypt = require('bcrypt')
const passport = require('passport')
const _ = require('lodash')
const jwt = require('jsonwebtoken')
const nodemailer = require('nodemailer')
const jwt_Secret = process.env.JWT_SECRET
const axios = require("axios")
var passwordValidator = require('password-validator');


function authController() {
  const _getRedirectUrl = (req, res) => {

    if (req.user.role == 'vendor') {
      return req.user.role === 'vendor' ? '/addproduct' : '/home'
    } else {
      return req.user.role === 'customer' ? '/home' : 'admin' ? '/adminpanel' : 'vendor' ? '/addproduct' : '/home'
    }
  }

  return {
    
    login(req, res) {
      res.render('auth/login', { title: "Login page | Eqipped" })
    },

    investorPresentation(req, res) {
      res.render('blogs/eqippedPresents')
    },

    uploadDocument(req, res) {
      res.render('auth/documentupload', { title: "Verificartion | Eqipped" })
    },


    // Edit profile
    async editUserProfile(req, res) {
      const data = await User.findOne({ '_id': `${req.params.id}` })
      return res.render('auth/editUserProfile', { data: data })
    },


    async postEditUserProfile(req, res) {
      const { id, institutionName, designation, avatar } = req.body

      console.log(avatar)
      if (avatar) {
        User.findByIdAndUpdate({ _id: req.user._id }, { avatar }, (err, data) => {
          if (!err) {
            return res.json({ msg: "Success" })
          } else {
            return res.json({ msg: "Something went wrong. Please try again later" })
          }
        })
      }

      // if (phone != req.user.phone){
      //     console.log('phone :>> ', phone);

      //     var OTP = Math.floor(10000 + Math.random() * 49999);

      // axios
      // .get(`https://www.txtguru.in/imobile/api.php?username=gearloose.lab&password=71703091&source=GRLABS&dmobile=91${phone}&dlttempid=1507165000853446536&message=${OTP} is your eqipped.com verification code. It is valid for only 3 minutes. Do not share it with anyone. GRLABS`)
      // .then(async (res) => {
      //     console.log(`statusCode: ${res.status}`)
      // })
      // .catch(error => {
      //     return res.send({ msg: "Major Failure" })
      // })

      // const otp = new Otp({ phone: phone, otp: OTP, email: email, eotp: EOTP, attempts: 1 })
      // const salt = await bcrypt.genSalt(10)
      // otp.otp = await bcrypt.hash(otp.otp, salt)
      // otp.eotp = await bcrypt.hash(otp.eotp, salt)
      // otp.save().then((user) => {
      //     return res.json({ msg: "Success" })
      // }).catch(err => {
      //     return res.json({ msg: "Something went wrong. Please try again later" })
      // });

      // }


      // if (email != req.user.email) {
      //     console.log('Entered email :>> ', email);

      //     var EOTP = Math.floor(10000 + Math.random() * 90000);

      //     const mailOptions = {
      //         from: 'gearloose.lab@protonmail.com',
      //         to: req.user.email,
      //         subject: 'Verification code by eqipped',
      //         text: "Your 5 digit verification code is " + EOTP
      //     };

      //     const transporter = nodemailer.createTransport({
      //         service: 'protonmail',
      //         auth: {
      //             user: 'gearloose.lab@protonmail.com',
      //             pass: 'Jai@1105atharv'
      //         },
      //         port: 465,
      //         host: "smtp.proton.me"
      //     });

      //     transporter.sendMail(mailOptions, function (err, info) {
      //         if (err) {
      //             console.log(err)
      //             return
      //         } else {
      //             const otp = new Otp({ email: email, eotp: EOTP }) 

      //             otp.save().then((user) => {

      //                 return res.json({ msg: "Jee baat"})
      //             }).catch(err => {
      //                 return res.json({ msg: "Something went wrong. Please try again later"})
      //             });

      //             return
      //         }
      //     })
      // }
      if (id || institutionName || designation) {
        User.findByIdAndUpdate({ _id: id }, { institutionName, designation }, (err, data) => {
          if (!err) {
            req.flash('error', 'Profile Successfully Updated')
            return res.render('auth/editUserProfile', { data: data })
          } else {
            req.flash('error', 'Something went wrong please try again later')
            return res.render('auth/editUserProfile', { data: data })
          }
        })
      }

    },


    postLogin(req, res, next) {
      const { email, password } = req.body
      // Validate request 
      if (!email || !password) {
        req.flash('error', 'All fields are required')
        return res.redirect('/login')
      }

      passport.authenticate('local', (err, user, info) => {
        if (err) {
          req.flash('error', info.message)
          return next(err)
        }
        if (!user) {
          req.flash('error', info.message)
          return res.redirect('/login')
        }
        req.logIn(user, (err) => {
          if (err) {
            req.flash('error', info.message)
            return next(err)
          }
          return res.redirect(_getRedirectUrl(req))
        })
      })(req, res, next)
    },


    // --------------- Forgot/reset pass start --------------------
    forgotpassword(req, res) {
      res.render('auth/forgotpassword')
    },

    postforgotpassword(req, res, next) {

      const { email } = req.body
      if (!email) {
        req.flash('error', 'All fields are required')
        return res.redirect('/forgotpassword')
      }

      User.findOne({ email: req.body.email }, function (err, doc) {
        if (doc) {
          const secret = jwt_Secret + doc.password
          const payload = { email: doc.email, id: doc.id }
          const token = jwt.sign(payload, secret, { expiresIn: '30min' })
          const link = `http://eqipped.com/resetpassword/${doc.id}/${token}`

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
            to: doc.email,
            subject: 'Forgot password Link',
            text: link
          };

          transporter.sendMail(mailOptions, function (err, info) {
            if (err) {

              req.flash('error', 'Password reset link Not sent')
              return res.redirect('/forgotpassword')
            } else {

              req.flash('error', 'Password reset link has been sent')
              return res.redirect('/forgotpassword')
            }
          })
        } else {
          req.flash('error', 'User not Registered')
          return res.redirect('/forgotpassword')
        }

      })
    },

    resetpassword(req, res,) {
      User.findOne({ _id: req.params.id }, function (err, doc) {
        if (doc) {
          const secret = jwt_Secret + doc.password
          try {
            const payload = jwt.verify(req.params.token, secret)

            res.render('auth/resetpassword', { email: doc.email })
          } catch (error) {
            res.render('auth/resetpassword')
          }
        } else {
          req.flash('error', "User not Found")
          return res.redirect('/resetpassword')

        }
      })
    },

    async postresetpassword(req, res) {
      const { id, token } = req.params;
      const { password, password2 } = req.body
      if (password != password2) {


        req.flash('error', "Password Mismatch")
        return res.redirect(`/resetpassword/${id}/${token}`)
      }
      var schema = new passwordValidator();
      schema
        .is().min(8)
        .is().max(16)
        .has().uppercase()
        .has().lowercase()
        .has().symbols(1)
        .has().digits(1)
        .has().not().spaces()


      var final_password = schema.validate(password)
      if (final_password != true) {
        req.flash('error', "Password Should contain atleast 1-Upper-Case Letter, 1-Lower-Case Letter, 1-Number, & 1-Sepcial Charcter")
        return res.redirect(`/resetpassword/${id}/${token}`)
      }

      const hashedPassword = await bcrypt.hash(password, 10)
      User.findOne({ _id: req.params.id }, function (err, doc) {
        if (!err) {
          User.findOneAndUpdate({ _id: id }, { password: hashedPassword }, (err, data) => {
            if (err) {
              req.flash('error', "Reset password error")
              return res.redirect(`/resetpassword/${id}/${token}`)
            } else {
              req.flash('error', "Your password has been changed")
              return res.redirect('/login')
            }
          })
        }

      });
    },

    async forSendingOtp(req, res) {
      const user = await User.findOne({ $or: [{ 'phone': req.body.phone }, { 'email': req.body.email }] })

      if (user) {
        return res.json({ msg: "User already registered. Login yourself or Register with new credentials" })
      }
      else {
        const checkAttempt = await Otp.findOne({
          phone: req.body.phone,
          email: req.body.email,
          attempts: 1
        })

        var OTP = Math.floor(10000 + Math.random() * 49999);
        var EOTP = Math.floor(10000 + Math.random() * 90000);
        const phone = req.body.phone;
        const email = req.body.email;

        // console.log(phone);
        console.log("otp for phone", OTP);

        if (!phone || !email) {
          return res.json({ msg: "Enter phone or email carefully" })
        }
        else {
          await axios
            .get(`https://www.txtguru.in/imobile/api.php?username=gearloose.lab&password=71703091&source=GRLABS&dmobile=91${phone}&dlttempid=1507165000853446536&message=${OTP} is your eqipped.com verification code. It is valid for only 3 minutes. Do not share it with anyone. GRLABS`)
            .then(async (res) => {
              console.log(`statusCode: ${res.status}`)
            })
            .catch(error => {
              return res.send({ msg: "phone otp textguru Failure" })
            })

          // console.log(email);
          console.log("otp for email", EOTP);


          if (!checkAttempt) {
            const otp = new Otp({ phone: phone, otp: OTP, email: email, eotp: EOTP, attempts: 1 })
            const salt = await bcrypt.genSalt(10)
            otp.otp = await bcrypt.hash(otp.otp, salt)
            otp.eotp = await bcrypt.hash(otp.eotp, salt)
            otp.save().then((user) => {
              return res.json({ msg: "Success" })
            }).catch(err => {
              console.log('err :>> ', err);
              return res.json({ msg: "Something went wrong. Please try again later" })
            });
          } else {

            const salt = await bcrypt.genSalt(10)
            checkAttempt.otp = await bcrypt.hash(JSON.stringify(OTP), salt)
            checkAttempt.eotp = await bcrypt.hash(JSON.stringify(EOTP), salt)

            await checkAttempt.save().then((user) => {
              return res.json({ msg: "Success" })
            }).catch(err => {
              console.log('err :>> ', err);
              return res.json({ msg: "Something went wrong. Please try again later" })
            });
          }

        }  // else end
      }  // else end
    },


    async sendEmailVerificationLink(req, res) {
      const user = await Otp.findById(req.user._id);
      try {
        jwt.sign(
          {
            user: _.pick(user, "id")
          }, jwt_Secret, { expiresIn: '30d' }, (err, emailToken) => {

            if (!err) {
              const link = `http://eqipped.com/emailconfirmation/${emailToken}`
              // const link = `http://localhost:3300/emailconfirmation/${emailToken}`

              const mailOptions = {
                from: 'gearloose.lab@gmail.com',
                to: req.user.email,
                subject: 'Email Confirmation',
                html: `Please click this url to confirm your mail: <a href="${link}">${link}</a>`

              };

              const transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                  user: 'gearloose.lab@gmail.com',
                  pass: 'zhbqmsmltkrrkgtv'
                },
                port: 465,
                host: "smtp.gmail.com"
              });

              transporter.sendMail(mailOptions, function (err, info) {
                if (err) {
                  console.log(err)
                  return;
                } else {
                  // console.log("info >>", info)
                  return;
                }
              })
            } else {
              console.log('errIn 459 :>> ', err);
            }

          })

      } catch (e) { console.log(e) }

      return res.redirect('back')
    },


    async postRegister(req, res) {
      const { fname, lname, phone, email, password, registerAs, institutionName, designation, role, pincode, city, state, country, password2 } = req.body

      // Validate request 
      if (!fname || !lname || !phone || !email || !password || !institutionName || !password2 || !pincode || !city || !state || !country || !designation || !registerAs) {
        req.flash('error', 'All fields are required.')
        req.flash('fname', fname)
        req.flash('lname', lname)
        req.flash('phone', phone)
        req.flash('email', email)
        req.flash('institutionName', institutionName)
        req.flash('designation', designation)
        return res.redirect('back')
      }

      // Check if email exists 
      User.exists({ email: email }, (err, result) => {
        if (result) {
          req.flash('error', 'Email already taken')
          req.flash('fname', fname)
          req.flash('lname', lname)
          req.flash('phone', phone)
          req.flash('email', email)
          req.flash('institutionName', institutionName)
          req.flash('designation', designation)
          return res.redirect('/register')
        }
      })

      var schema = new passwordValidator();
      schema
        .is().min(8)
        .is().max(16)
        .has().uppercase()
        .has().lowercase()
        .has().symbols(1)
        .has().digits(1)
        .has().not().spaces()


      var final_password = schema.validate(password)
      if (final_password != true) {
        req.flash('password', "Password must contain atleast 1 Upper-Case, 1 Lower-Case Letter, 1 Number & 1 Sepcial Charcter")
        return res.redirect('/register')
      }


      if (password != password2) {
        req.flash('fname', fname)
        req.flash('lname', lname)
        req.flash('phone', phone)
        req.flash('email', email)
        req.flash('institutionName', institutionName)
        req.flash('designation', designation)
        req.flash('password', "Password Mismatch")
        return res.redirect('/register')
      }



      // Hash password 
      const hashedPassword = await bcrypt.hash(password, 10)
      // Create a user 
      const user = new User({
        fname,
        lname,
        phone,
        email,
        password: hashedPassword,
        institutionName,
        designation,
        registerAs,
        // address,
        state,
        city,
        country,
        role,
        pincode
      })

      const otpHolder = await Otp.find({
        phone: phone,
        email: email
      });
      if (otpHolder.length === 0) {
        req.flash('error', 'You entered wrong credentials or your OTP has been Expired')
        return res.redirect('/register')
      }

      // -------------------------

      try {
        jwt.sign(
          {
            user: _.pick(user, "id")
          }, jwt_Secret, { expiresIn: '30d' }, (err, emailToken) => {

            if (!err) {
              const link = `http://eqipped.com/emailconfirmation/${emailToken}`
              // const link = `http://localhost:3300/emailconfirmation/${emailToken}`

              const mailOptions = {
                from: 'gearloose.lab@gmail.com',
                to: email,
                subject: 'Email Confirmation',
                html: `Please click this url to confirm your mail: <a href="${link}">${link}</a>`

              };

              const transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                  user: 'gearloose.lab@gmail.com',
                  pass: 'zhbqmsmltkrrkgtv'
                },
                port: 465,
                host: "smtp.gmail.com"
              });

              transporter.sendMail(mailOptions, function (err, info) {
                if (err) {
                  console.log(err)
                  return;
                } else {
                  // console.log("info >>", info)
                  return;
                }
              })
            } else {
              console.log('errIn 459 :>> ', err);
            }

          })

      } catch (e) { console.log(e) }

      // -------------------------

      const rightOtpFind = otpHolder[otpHolder.length - 1];

      const validUserPhone = await bcrypt.compare(req.body.otp, rightOtpFind.otp)

      // const validUserEmail = await bcrypt.compare(req.body.eotp, rightOtpFind.eotp)
      // if (rightOtpFind.phone === req.body.phone && rightOtpFind.email === req.body.email && validUserEmail && validUserPhone) {

      if (rightOtpFind.phone === req.body.phone && rightOtpFind.email === req.body.email && validUserPhone) {
        const OTPDelete = await Otp.deleteMany({
          phone: rightOtpFind.phone,
          email: rightOtpFind.email,
        })

        user.save().then((user) => {
          req.flash('OnRegisterDone', 'User Successfully Registered')
          const eventEmitter = req.app.get('eventEmitter')
          eventEmitter.emit('userCreated', user)
          return res.redirect('/login')
        }).catch(err => {
          console.log(err);
          req.flash('error', 'Something went wrong')
          return res.redirect('/register')
        })
      } else if (rightOtpFind.phone !== req.body.phone || rightOtpFind.email !== req.body.email) {
        req.flash('error', 'You entered wrong phone or mail')
        req.flash('fname', fname)
        req.flash('lname', lname)
        req.flash('phone', phone)
        req.flash('email', email)
        req.flash('institutionName', institutionName)
        req.flash('designation', designation)
        return res.redirect('/register')
        // } else if (validUserEmail || validUserPhone) {
      } else if (validUserPhone) {
        req.flash('error', 'You entered wrong OTP')
        req.flash('fname', fname)
        req.flash('lname', lname)
        req.flash('phone', phone)
        req.flash('email', email)
        req.flash('institutionName', institutionName)
        req.flash('designation', designation)
        return res.redirect('/register')
      }
    },


    async verifyemail(req, res) {
      try {
        const { user: { id } } = jwt.verify(req.params.emailtoken, jwt_Secret)
        User.updateOne({ _id: id }, { isemailverified: "Yes" }, (err, data) => {
          if (err) {
            console.log(err)
          }
          res.redirect('/home')
        })
      } catch (error) {
        console.log(error)
        res.redirect('/register')
      }
    },


    async fetchpincode(req, res) {
      var p_pincode = req.body.pincode
      let obj = {}
      await axios
        .get(`https://api.postalpincode.in/pincode/${p_pincode}`)
        .then(resp => {
          if (resp.data[0].Status == 'Error') {
            return res.send(obj)
          }
          var k = resp.data[0]
          obj = {
            city: k.PostOffice[0].District,
            state: k.PostOffice[0].State,
            country: k.PostOffice[0].Country
          }
          return res.send(obj)
        })
        .catch(error => {
          console.error(error)
        })
    },

    register(req, res) {
      res.render('auth/register', { title: "Registration page | Eqipped" })
    },


    logout(req, res, next) {
      req.logout(function (err) {
        if (err) { return next(err); }
        res.redirect('/');
      })
    }

  }
}

module.exports = authController
