
const mongoose = require('mongoose');
const Schema = mongoose.Schema

const subCategoriesSchema = new Schema({
    productSubcategory: { type: String, required: true },
    subcategoryImage: { type: String, required: true },
    productCategory: { type: String, required: true },
    productCategoryId: { type: Schema.Types.ObjectId, ref: 'Category' },
    created: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Subcategory', subCategoriesSchema);

