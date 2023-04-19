const mongoose = require('mongoose')
const Schema = mongoose.Schema

const userSchema = new Schema({
    fname: {type: String, required: true},
    lname: {type: String, required: true},
    phone: {type: Number, required: true},
    email: {type: String, required: true},
    password: {type: String, required: true},
    registerAs: {type: String, required: true},
    institutionName: {type: String, required: true},
    designation: {type: String, required: true},
    pincode: {type: String, required: true},
    city: {type: String, required: true},
    state: {type: String, required: true},
    country: {type: String, required: true},
    role: {type: String, default: 'customer'},
    permission : {
        newOrders: {type: Boolean, default: false},
        addProducts: {type: Boolean, default: false},
        verifyUserListedProducts: {type: Boolean, default: false},
        verifyUserDocuments: {type: Boolean, default: false},
        addNewCategory: {type: Boolean, default: false},
        deleteProduct: {type: Boolean, default: false},
        adminListedProducts: {type: Boolean, default: false},
        editProducts: {type: Boolean, default: false},
        viewCustomers: {type: Boolean, default: false},
        viewVendors: {type: Boolean, default: false},
        createUsers: {type: Boolean, default: false},
        verifiedUsers: {type: Boolean, default: false},
        viewPreDiscount: {type: Boolean, default: false},
    },
    isuploded: {type: String, default: 'No'},
    isverified: {type: String, default: 'No'},
    isemailverified: {type: String, default: 'No'},
    documentNumber: { type: Number, default: 0},
    address:[{type: String, required: true}],
    avatar:{type: String, default: "/img/default_profile.webp"},
    document: { type: Schema.Types.ObjectId, ref: 'Document'},
    reviewed:[
        {
            variantRatedID: { type: Schema.Types.ObjectId, ref: 'Product'},
          
        }],
    cart: [
        {
            product: {type: Schema.Types.ObjectId, ref: 'Variation'},
            quantity: { type: Number, default: 1},
            total: { type: Number, required: true},
            vendor: { type: Schema.Types.ObjectId, ref: 'User'}
        }
    ],

    saveForLater: [ {type: Schema.Types.ObjectId, ref: 'Variation'} ]
    
}, {timestamps: true })


module.exports = mongoose.model('User', userSchema);

