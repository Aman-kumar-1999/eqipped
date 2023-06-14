const mongoose = require('mongoose');
const Brand = require('./brand');
const Schema = mongoose.Schema;

const variationSchema = new Schema({
    sellerRole: { type: String, default: 'admin' },
    vendor: { type: Schema.Types.ObjectId, ref: 'User' },
    pname: { type: String, },
    variationname: { type: String },

    price: { type: Number },

    packPrice: { type: Number, default: 0 },
    piecePerPack: { type: Number },//1.5
    GST: { type: Number },
    HSN: { type: Number },
    vcode: { type: String, },
    gcode: { type: String },

    image: [    
        {
            imgName: {
                type: String,
                required: true,
            },
        },
    ],

    d3Image: { type: String },
    brand: { type: Schema.Types.ObjectId, ref: 'Brand' },
    category: { type: Schema.Types.ObjectId, ref: 'Category' },
    containedLiquid: { type: String, required: false },
    description: { type: String },
    itemWeight: { type: String },   //2
    netQuantity: { type: String },
    variationLabel: { type: String },
    volume: { type: String, required: false },
    subCategory: { type: mongoose.Schema.Types.ObjectId, ref: "Subcategory" },
    isverified: { type: String, default: "No" },
    prodStatus: { type: String, default: "Initial" },
    // commision: { type: Number, default: 20},
    // stock: { type: Number }, 
    // vtype: { type: String, default: 'size'},
    // sub: { type: Schema.Types.ObjectId, ref: 'Sub'},
    totalrating: { type: Number, default: 0 },
    avgrating: { type: Number, default: 0 },
    reviews: [
        {
            rateuser_id: { type: Schema.Types.ObjectId, ref: 'User' },
            rating: { type: Number, min: 1, max: 5, default: 1 },
            comment: { type: String, default: '' }

        }
    ]
}, { timestamps: true })

variationSchema.virtual('dprice').get(async function () {
    const brand = await Brand.findOne({ _id: this.brand }).exec();
    return (this.packPrice) - (this.packPrice) * ((brand.discount) / 100)
});


module.exports = mongoose.model('Variation', variationSchema); 