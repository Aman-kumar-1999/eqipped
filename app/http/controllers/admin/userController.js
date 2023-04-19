const user = require('../../../models/user')
const bcrypt = require('bcrypt')
const GetPreDiscount = require('../../../models/getPreDiscount');

function userController() {
    return {
        index(req, res) {
            user.find({ $and: [{ isverified: { $ne: 'Yes' }}, { isuploded: "Yes"}]}).sort('-createdAt').exec((err, users) => {
                if (req.xhr) {
                    return res.json(users)
                } else {
                    return res.render('admin/preDiscount')
                }
            })
        },
        async viewcustomer(req, res) {
            const userData = await user.find({ role: "customer" })
            console.log(userData)
            return res.render('admin/viewusers', { data: userData })
        },

        
        async viewVerifiedUser(req, res) {
            const verifiedUserData = await user.find({ isuploded: "Yes", isverified: "Yes"})
            console.log(verifiedUserData)
            return res.render('admin/viewVerifiedUsers', { data: verifiedUserData })
        },
        async viewPreDiscount(req, res) {
            const predis = await GetPreDiscount.find();
            console.log(predis);
            return res.render('admin/viewprediscount', { data: predis });
        },

        

        async viewvendors(req, res) {
            const userData = await user.find({ role: "vendor" })
            console.log(userData)
            return res.render('admin/viewusers', { data: userData })

        },
        createUser(req, res) {
            res.render('admin/createUser')
        },
        async postcreateUser(req, res) {
            const { fname, lname , email,phone, password, role } = req.body;
            let {newOrders = "false",addProducts= "false",verifyUserListedProducts= "false",verifyUserDocuments= "false",
            addNewCategory= "false",deleteProduct= "false",adminListedProducts= "false",editProducts= "false",viewCustomers= "false",
            viewVendors= "false",createUsers= "false",verifiedUsers= "false" }= req.body;

            if (!fname || !email || !password || !role) {
                req.flash('error', 'All fields are required')
                req.flash('email', email)
                console.log("All fields are required");
                return res.redirect('/admin/createUser')
            }

            user.exists({ email: email }, (err, result) => {
                if (result) {
                    req.flash('error', 'Email already taken')
                    req.flash('email', email)
                    console.log("Email already taken");
                    return res.redirect('/admin/createUser')
                }
            })

            const hashedPassword = await bcrypt.hash(password, 10);
            const create_user = new user({
                fname,
                lname,
                phone,
                email,
                password: hashedPassword,
                institutionName : "Admin",
                designation : "Employee",
                pincode: "282001",
                city:"Agra",
                state :"Uttar Pradesh",
                permission: {
                    newOrders,
                    addProducts,
                    verifyUserListedProducts,
                    verifyUserDocuments,
                    addNewCategory,
                    deleteProduct,
                    adminListedProducts,
                    editProducts,
                    viewCustomers,
                    viewVendors,
                    createUsers,
                    verifiedUsers
                },
                role,
                
               
            })
            console.log("created user : "+ create_user);
   
            create_user.save().then(() => {
                console.log("save reached");
                req.flash('OnRegisterDone', 'User Successfully Registered')
                return res.redirect('/adminpanel')
            }).catch(err => {
                console.log("reached error");
                req.flash('error', 'Something went wrong')
                return res.redirect('/admin/createUser')
            })


        },

    }
}

module.exports = userController