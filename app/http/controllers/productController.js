const Category = require('../../models/categories');
const User = require('../../models/user');
const subCategory = require('../../models/subcategory') //pani
const Brand = require('../../models/brand');
const Variation = require('../../models/variation');


function productController() {
    return {

        // async majaagya(req, res) {

        //     Variation.updateMany({ pname: "Abhishek" }, { price: 2 }, function (err, docs) {
        //         if (err) {
        //             console.log(err)
        //         }
        //         else {
        //             console.log("Updated Docs : ", docs);
        //         }
        //     });

        //     Variation.updateMany({ 'isverified': 'Yes' }, {
        //         $set: {
        //             prodStatus: "Initial"
        //         }
        //     }, function (err, docs) {
        //         if (err) {
        //             console.log(err)
        //         }
        //         else {
        //             console.log("Updated Docs : ", docs);
        //         }
        //     });

        //     Variation.deleteMany({ category: '' }, function (err) {
        //         if (err) console.log(err);
        //         console.log("Successful deletion");
        //     });
        //     return res.redirect('/')
        // },

        async brandpage(req, res) {
        const brandId = req.params.brandId;
        const brand = await Brand.findById(brandId)

        const products = await Variation.find({ brand: brandId }).populate("brand")

        return res.render(`brandPages/brand`, { brand: brand, lancer: products })
    },

        async productfetch(req, res) {

        const allCategory = await Category.find({});
        const squeries = req.query.search.split();
        console.log(req.query.search);
        console.log("Search query >>", squeries);
        if (req.query.search != '') {
            const rproducts = [];
            const rvariations = [];
            const rcategories = [];
            const rbrands = [];

            for (var i = 0; i <= squeries.length; i++) {
                const item = squeries[i];
                const brand = await Brand.findOne({ "name": { "$regex": `${item}`, "$options": "i" } })
                if (brand) {
                    const bid = brand._id;
                    const brands = await Variation.find({ "brand": bid }).populate('brand');
                    if (brands.length > 0) {
                        brands.forEach((brand) => {
                            rbrands.push(brand);
                        })
                    }
                }
                const variations = await Variation.find({ $or: [{ "variationname": { "$regex": `${item}`, "$options": "i" } }, { "pname": { "$regex": `${item}`, "$options": "i" } }] }).populate('brand');
                if (variations.length > 0) {
                    variations.forEach((product) => {
                        rvariations.push(product);
                    })
                }
                const categories = await Category.find({ "pCategory": { "$regex": `${item}`, "$options": "i" } });
                if (categories.length > 0) {
                    categories.forEach((product) => {
                        rcategories.push(product);
                    })
                }
            }

            return res.render('menus/search', { products: rvariations, categories: rcategories, brands: rbrands, allCategory });
        } else {
            return res.redirect('/')
        }

    },

        async gPNFS(req, res) {
        let payload = req.body.payload.trim()
        let search = await Variation.find({ pname: { $regex: new RegExp('^' + payload + '.*', 'i') } }).exec();

        // Limit search result to 10
        search = search.slice(0, 10);
        res.send({ payload: search });
    },

        async catProduct(req, res) {
        let product_Category = req.params.categoryId;
        let arrOfSubCatId = req.query.dataji;
        const lala = 0;
        console.log('req.query.data :>> ', arrOfSubCatId);

        res.locals.session.current_Category = product_Category;
     
        const subcategory = await subCategory.find({ productCategoryId: req.params.categoryId  });
        const allCategory = await Category.find({});
        const allBrand = await Brand.find({});
        const filters = req.query.data || [];
        const catFilter = [];
        const brandFilter = [];
        const ratingFilter = [];
        const rangeFilter = [];

        const category = await Category.findOne({ _id: req.params.categoryId }).exec();
        var perPage = 3000;
        var page = req.params.page || 1;
        var sortBy = req.query.sort || 'packPrice-asc';
        let sortVar = 'packPrice';
        var sortType = 'asc';
        var sarr = '';
        var sarrr = [];
        var maxPrice = 0;
        var minPrice = 0;
        if (req.query.sort) {
            sarr = sortBy;
            sarrr = sarr.split('-');
            sortVar = sarrr[0];
            sortType = sarrr[1];
            res.locals.session.sort = req.query.sort;
        } else {
            if (req.session.sort) {
                sarr = req.session.sort;
                sarrr = sarr.split('-');
                sortVar = sarrr[0];
                sortType = sarrr[1];
                res.locals.session.sort = sarr;
            }
        }

        if (!arrOfSubCatId) {

            var checked = ''
            var notChecked = ''

            const productsShow = await Variation.find({ category: product_Category  }).sort({ [sortVar]: [sortType] }).populate('brand').exec();
            Variation.find({ category: product_Category, price: { $lte: maxPrice || 1000000000, $gte: minPrice || 0 } }).sort({ [sortVar]: [sortType] }).populate('brand').populate('category').skip((perPage * page) - perPage).limit(perPage).exec(function (err, products) {

                Variation.count().exec(function (err, count) {
                    if (err) return next(err)
                    res.render('menus/product', {
                        products,
                        subcategory, checked, notChecked,
                        category,
                        allCategory,
                        allBrand,
                        current: page,
                        pages: Math.ceil(productsShow.length / perPage),
                        status: 201,
                        title: `${category.pcategory} | Eqipped`
                    })
                })
            });

        } else {

            saregama = arrOfSubCatId.split(',');

            const checked = await subCategory.find({ _id: { $in: saregama } });
            const notChecked = await subCategory.find({ _id: { $nin: saregama } });

            const productsShow = await Variation.find({ category: product_Category }).sort({ [sortVar]: [sortType] }).populate('brand').exec();
            Variation.find({ category: product_Category, 'subCategory': { $in: saregama }, price: { $lte: maxPrice || 1000000000, $gte: minPrice || 0 } }).sort({ [sortVar]: [sortType] }).populate('brand').populate('category').skip((perPage * page) - perPage).limit(perPage).exec(function (err, products) {

                Variation.count().exec(function (err, count) {
                    if (err) return next(err)
                    res.render('menus/product', {
                        products,
                        subcategory, checked, notChecked,
                        category,
                        allCategory,
                        allBrand,
                        current: page,
                        pages: Math.ceil(productsShow.length / perPage),
                        status: 201,
                        title: `${category.pcategory} | Eqipped`
                    })
                })
            });
        }
    },


        // Eqipped Original
        // async catProduct(req, res) {
        //     let product_Category = req.params.categoryId;
        //     let ArrayofFilterElements = req.query.data;
        //     // res.json({ msg: "Success" })

        //     res.locals.session.current_Category = product_Category;
        //     const subcategory = await subCategory.find({ productCategoryId: req.params.categoryId });
        //     const allCategory = await Category.find({});
        //     const allBrand = await Brand.find({});
        //     const filters = req.query.data || [];
        //     const catFilter = [];
        //     const brandFilter = [];
        //     const ratingFilter = [];
        //     const rangeFilter = [];

        //     const category = await Category.findOne({ _id: req.params.categoryId }).exec();
        //     var perPage = 40;
        //     var page = req.params.page || 1;
        //     var sortBy = req.query.sort || 'packPrice-asc';
        //     let sortVar = 'packPrice';
        //     var sortType = 'asc';
        //     var sarr = '';
        //     var sarrr = [];
        //     var maxPrice = 0;
        //     var minPrice = 0;
        //     if (req.query.sort) {
        //         sarr = sortBy;
        //         sarrr = sarr.split('-');
        //         sortVar = sarrr[0];
        //         sortType = sarrr[1];
        //         res.locals.session.sort = req.query.sort;
        //     } else {
        //         if (req.session.sort) {
        //             sarr = req.session.sort;
        //             sarrr = sarr.split('-');
        //             sortVar = sarrr[0];
        //             sortType = sarrr[1];
        //             res.locals.session.sort = sarr;
        //         }
        //     }
        //     const productsShow = await Variation.find({ category: product_Category }).sort({ [sortVar]: [sortType] }).populate('brand').exec();
        //     Variation.find({ category: product_Category, price: { $lte: maxPrice || 1000000000, $gte: minPrice || 0 } }).sort({ [sortVar]: [sortType] }).populate('brand').populate('category').skip((perPage * page) - perPage).limit(perPage).exec(function (err, products) {
        //         Variation.count().exec(function (err, count) {
        //             if (err) return next(err)
        //             res.render('menus/product', {
        //                 products,
        //                 subcategory,
        //                 category,
        //                 allCategory,
        //                 allBrand,
        //                 current: page,
        //                 pages: Math.ceil(productsShow.length / perPage),
        //                 status: 201,
        //                 title: `${category.pcategory} | Eqipped`
        //             })
        //         })
        //     });
        // },


        async saveForLater(req, res) {
        let productIdForSaveLater = req.body.vid

        User.updateOne({
            _id: req.user._id,
            saveForLater: { $ne: productIdForSaveLater }
        }, { $push: { saveForLater: productIdForSaveLater } }, (err, result) => {
            if (err) {
                console.log(err);
            }
        });

        res.send({ "status": "success" });
    },

        // show save for later buy products function
        async showSaveForLater(req, res) {
        const user = await User.findById(req.user._id).populate({ path: 'saveForLater', model: 'Variation' })
        return res.render('customers/laterSavedProduct', { user })

    },



        async brandProduct(req, res) {
        let subCategory = req.params.subCategory;
        const chai = await Menu.find({ 'brand': `${subCategory}` })
        const pani = await Brand.find({ 'subCategory': `${subCategory}` })
        return res.render('menus/product', { chai: chai, pani: pani })
    },


        async productfetchBysubCN(req, res) {
        let subCN = req.params.subCategory
        const chai = await Menu.find({ subCategory: subCN })
        const pani = await subCategory.find({ 'parentCategory': `${req.session.current_Category}` })
        return res.render('menus/product', { chai: chai, pani: pani })
    },

        async productDetails(req, res) {
        let productId = req.params.id;
        var perPage = 20;
        var page = req.params.page || 1;
        const variant = await Variation.findOne({ '_id': req.params.id }).populate('brand').lean({ virtuals: true }).exec();
        const ratingArray = [0, 0, 0, 0, 0];
        if (variant.reviews) {
            variant.reviews.forEach((review) => {
                if (review.rating == 5) {
                    ratingArray[0] += ratingArray[0] + 1;
                }
                if (review.rating == 4) {
                    ratingArray[1] += ratingArray[1] + 1;
                }
                if (review.rating == 3) {
                    ratingArray[2] += ratingArray[2] + 1;
                }
                if (review.rating == 2) {
                    ratingArray[3] += ratingArray[3] + 1;
                }
                if (review.rating == 1) {
                    ratingArray[4] += ratingArray[4] + 1;
                }
            });
        }

        const variants = await Variation.find({ 'gcode': variant.gcode }).sort('variationname').populate('brand').collation({ locale: "en_US", numericOrdering: true });
        const alsoSoldBy = await Variation.find({ _id: { $ne: variant._id }, vendor: { $ne: variant.vendor }, $and: [{ vcode: variant.vcode }, { name: variant.name }, { brand: variant.brand }] }).populate('vendor').populate('brand').limit(2);
        const products = await Variation.find({ category: variant.category });
        Variation.find({ category: variant.category, _id: { $ne: variant._id } }).populate('brand').skip((perPage * page) - perPage).limit(perPage).exec(function (err, suggested) {
            Variation.count().exec((err, count) => {
                res.render('menus/productdetails', {
                    variants: variants,
                    product: variant,
                    suggested: suggested,
                    alsoSoldBy: alsoSoldBy,
                    current: page,
                    ratingArray: ratingArray,
                    pagesList: Math.ceil(products.length / perPage),
                    title: `${variant.pname} | Eqipped`
                })
            })
        });
    },
}
}



module.exports = productController