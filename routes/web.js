const homeController = require('../app/http/controllers/homeController')
const authController = require('../app/http/controllers/authController')
const cartController = require('../app/http/controllers/customers/cartController')
const orderController = require('../app/http/controllers/customers/orderController')
const adminOrderController = require('../app/http/controllers/admin/orderController')
const reviewController = require('../app/http/controllers/customers/reviewController')
const adminProductController = require('../app/http/controllers/admin/productController')
const adminUserController = require('../app/http/controllers/admin/userController')
const statusController = require('../app/http/controllers/admin/statusController')
const categoriesController = require('../app/http/controllers/allCategories/categoriesController')
const productController = require('../app/http/controllers/productController')
const paymentController = require('../app/http/controllers/paymentController')
const vendorController = require('../app/http/controllers/vendor/vendorController')
const admincategoryController = require('../app/http/controllers/admin/categoryController')
const officeController = require('../app/http/controllers/adminoffice/officeController')
// const preDiscountController = require('../app/http/controllers/admin/preDiscountController')

// Middlewares 
const guest = require('../app/http/middlewares/guest')
const auth = require('../app/http/middlewares/auth')
const vendor = require('../app/http/middlewares/vendor')
const admin = require('../app/http/middlewares/admin')
const viewVendor = require('../app/http/middlewares/viewVendors')
const viewCustomer = require('../app/http/middlewares/viewCustomer')
const viewVerifiedUser = require("../app/http/middlewares/viewVerifiedUsers")
const addNewCategories = require("../app/http/middlewares/addNewCategory")
const addProduct = require("../app/http/middlewares/addProducts")
const adminListedProduct = require("../app/http/middlewares/adminListedProducts")
const createUser = require("../app/http/middlewares/createUsers.js")
const deleteProducts = require("../app/http/middlewares/deleteProduct")
const editProduct = require("../app/http/middlewares/editProducts")
const newOrder = require("../app/http/middlewares/newOrders")
const verifyUserDocument = require("../app/http/middlewares/verifyUserDocuments")
const verifyUserListedProduct = require("../app/http/middlewares/verifyUserListedProducts")

function initRoutes(app) {


    app.get('/', guest, homeController().grandIndex)
    app.get('/home', homeController().grandIndex)
    app.get('/eqippedPresents', authController().investorPresentation)
    


    // app.get('/', guest, productController().majaagya)
    // app.get('/orderdetail', productController().majaagya)
    
    
    app.get('/landingPage', homeController().landingPage)
    app.get('/sitemap', homeController().sitemap)
    app.get('/sitemap.xml', homeController().sitemapxml)
    app.post('/getPreDiscount', guest, homeController().getPreDiscount)


    app.post('/sub-categories', guest, homeController().grandIndex)
    app.get('/login', guest, authController().login)
    app.post('/login', authController().postLogin)

    // verification
    app.post('/send-otp-on-phone', authController().forSendingOtp)
    app.get('/register', guest, authController().register)
    app.get('/sendEmailVerificationLink', auth, authController().sendEmailVerificationLink)
    app.post('/register', authController().postRegister)
    app.get('/emailconfirmation/:emailtoken', authController().verifyemail)
    app.get('/verification', auth, authController().uploadDocument)
    app.post('/logout', auth, authController().logout)
    app.get('/cart', auth, cartController().index)
    app.post('/update-cart', cartController().update)
    app.post('/qty-cart', cartController().qtyUpdate);
    app.post('/remove-cart', cartController().removeUpdate)
    app.post('/delete-cart', cartController().checkout)

    //PaytmGateway Route
    app.get('/payment', paymentController().payment)

    //vendor Route
    app.get('/vendordashboard', vendor, vendorController().vendordashboard)
    app.get('/vendor/notInteractWithYet', vendor, vendorController().notInteractWithYet)
    app.get('/vendor/approvedButNotReady', vendor, vendorController().approvedButNotReady)
    app.get('/vendor/approvedAndReadyToo', vendor, vendorController().approvedAndReadyToo)

    app.get('/vendor/listedProduct', vendor, vendorController().index)
    app.get('/addproduct', vendor, vendorController().addproduct)
    app.get('/editproduct/:id', vendor, vendorController().editProduct)

    app.post('/update-order-status', vendor, vendorController().updateOrderStatus);
    app.post('/vendor/order/status', vendor, statusController().update)

    // Notify
    app.get('/vendor/notify', vendor, adminOrderController().goToVendorNotify)

    // Customer routes

    //order placed by pay now
    app.get('/callbackCompletePayment', auth, orderController().storeCompletePayment)

    app.get('/customer/orders', auth, orderController().index)
    app.get('/customer/individualOrder', auth, orderController().indexia)

    app.get('/viewdoc/:id', auth, orderController().viewdoc);
    app.post('/cancel-order', auth, orderController().cancelOrder)

    //Download PDF in show function
    app.get('/customer/orders/:id', auth, orderController().show)
    app.get('/customer/checkout', auth, orderController().checkout)

    //blogs
    app.get('/blogs', guest, homeController().blogs)
    app.get('/admin/compose', admin, homeController().compose)


    // Admin routes
    app.get('/adminpanel', admin, adminOrderController().adminpanel)
    app.get('/admin/viewprediscount', admin, adminUserController().viewPreDiscount)
    app.get('/marque', admin, admincategoryController().marque)
    app.post('/marqueContent', admin, admincategoryController().marqueContent)
    app.get('/admin/orders', admin, adminOrderController().index)
    app.get('/admin/users', admin,verifyUserDocument, adminUserController().index)
    app.get('/admin/viewcustomer', admin,viewCustomer, adminUserController().viewcustomer)
    app.get('/admin/viewVerifiedUser', admin,viewVerifiedUser, adminUserController().viewVerifiedUser)
    app.get('/admin/viewvendors', admin,viewVendor, adminUserController().viewvendors)
    app.get('/admin/createUser', admin,createUser, adminUserController().createUser)
    app.post('/admin/createUser', admin,createUser, adminUserController().postcreateUser)
    app.get('/admin/addcategories', admin,addNewCategories, admincategoryController().index)
    app.get('/admin/deleteproduct', admin,deleteProducts, adminProductController().fetchfordeleteproduct)
    app.get('/admin/delete/products/:_id', admin,deleteProducts, adminProductController().deleteproduct)
    app.post('/admin/order/status', admin, statusController().update)
    app.post('/admin/user/status', admin, statusController().userupdate)
    app.get('/admin/verifyProducts', admin, verifyUserListedProduct,adminProductController().verifyProducts)
    app.post('/admin/product/status', admin, statusController().productupdate)


    // Admin Office
    app.get('/office/editproduct', admin,editProduct, officeController().index)
    app.get('/delImgEditProd/:idDelImg/:vid', admin, officeController().DelImgEditProd)
    app.post('/addImgEditProd', admin, officeController().AddImgEditProd)
    app.get('/office/edit/products/:_id', admin,editProduct, officeController().productindex)
    app.post('/office/edit/products', admin,editProduct, officeController().postproductedit)

    //Coupoun code 
    app.post('/applycoupon', orderController().applycoupon)
    app.get('/createCoupon', admin, adminProductController().createCoupon)
    app.post('/createCoupon', admin, adminProductController().postcreateCoupon)


    // Categories route
    app.get('/allcategory', auth, categoriesController().categories)
    app.get('/subcat/', auth, categoriesController().subcat)
    app.post('/create/subcat/', auth, categoriesController().createSubcat);
    app.post('/fetch/subcat/', auth, categoriesController().findSubcat);

    //Product Route
    app.get('/allcategory/products', productController().productfetch)
    app.post('/getProductNamesForSearch', productController().gPNFS)

    app.get('/brand/:brandId', productController().brandpage)
    app.get('/Category/:categoryName/:categoryId/:page', productController().catProduct)
    app.get('/productDetails/:pname/:id/:page', productController().productDetails)



    app.post('/saveForLater', productController().saveForLater)
    app.get('/favourite', productController().showSaveForLater)


    app.get('/brand/:subCategory', auth, productController().brandProduct)
    app.get('/products/:subCategory', auth, productController().productfetchBysubCN)

    //Ajax Auto-Fetch route 
    app.post('/pincodeAjax/', authController().fetchpincode)
    app.get('/autocomplete/', homeController().fetch)


    // Forgot/reset password
    app.get('/forgotpassword', authController().forgotpassword)
    app.post('/forgotpassword', authController().postforgotpassword)
    app.get('/resetpassword/:id/:token', authController().resetpassword)
    app.post('/resetpassword/:id/:token', authController().postresetpassword)

    // Edit profile 
    app.get('/editUserProfile/:id', auth, authController().editUserProfile)
    app.post('/editUserProfile', auth, authController().postEditUserProfile)

    // Footer documents 
    app.get('/privacy-policy', homeController().pripolicy)
    // app.get('/Customer-Support', homeController().CustomerSupport)
    app.get('/term-condition', homeController().termcondition)
    app.post('/review', reviewController().review)
    app.get('/careers', homeController().careers)
    app.get('/discount_granted', homeController().discount_granted)
    app.get('/FDUJys0Wyf4Jk4lZyN', homeController().qr_code)

}

module.exports = initRoutes
