const Category = require('../../../models/categories')
const User = require('../../../models/user');
const Variation = require('../../../models/variation');
const Brand = require('../../../models/brand');
var bodyParser = require('body-parser')
const multer = require('multer')

function officeController() {
    return {

        DelImgEditProd(req, res) {
            Variation.updateOne({
                _id: req.params.vid
            },
            { $pull:{ image: { _id: req.params.idDelImg } } }, (err, result) => {     // 
                if (err) {
                    console.log(err);
                } else {
                    req.flash('error', 'Image Removed Successfully')
                    return res.redirect('back')
                }
            });
        },

        AddImgEditProd(req, res) {
            var maxiSize = 100000000
            const storage = multer.diskStorage({
                destination: function (req, file, cb) {
                    cb(null, './public/img/')
                },
                filename: function (req, file, cb) {
                    cb(null, file.originalname);
                }
            })

            const upload = multer({ storage: storage, limits: { fileSize: maxiSize } }).array('image', 7)

            upload(req, res, function (err) {
                if (err instanceof multer.MulterError) {
                    // A Multer error occurred when uploading.
                    req.flash('error', 'Image Size Too Large (Max-size: 1mb)')
                    return res.redirect('back')
                } else if (err) {
                    // An unknown error occurred when uploading.
                    req.flash('error', 'Something went wrong, Please try again')
                    return res.redirect('back')
                }


                console.log('req.files :>> ', req.files);
                const images = [];
                const stars = req.files;

                for (let i = 0; i < stars.length; i++) {
                    const resultant = stars[i];
                    images.push({
                        imgName: resultant.filename,
                    });
                }

                const { vid } = req.body

                console.log('vid :>> ', vid);

                Variation.updateOne({
                    _id: vid
                }, { $push: { image: images } }, (err, result) => {
                    if (err) {
                        console.log(err);
                    } else {

                        req.flash('error', 'Image Uploaded Successfully')
                        return res.redirect('back')
                    }
                });
            })
        },

        async index(req, res) {
            const variation = await Variation.find().populate({ path: 'category' }).populate({ path: "brand" })
            return res.render('adminoffice/fetchproducts', { variation: variation })
        },
        async productindex(req, res) {
            let variation_id = req.params._id;
            const categories = await Category.find({}).exec();
            const brands = await Brand.find({}).exec();
            const data = await Variation.findOne({ '_id': `${variation_id}` }).populate({ path: 'category' }).populate({ path: "brand" })
            return res.render('adminoffice/editproducts', { data: data, categories, brands })
        },

        async postproductedit(req, res) {
            const { vid, pname, category, brand, price, variationname, variationLabel, containedLiquid, volume, piecePerPack, netQuantity, HSN, GST, itemWeight, description, gcode, vcode, packPrice } = req.body
            console.log(req.body)

            Variation.findByIdAndUpdate({ _id: vid }, { pname, category, brand, price, variationname, variationLabel, GST, HSN, containedLiquid, volume, piecePerPack, netQuantity, description, itemWeight, gcode, vcode, packPrice }, (err, data) => {
                if (!err) {
                    req.flash('error', 'Update Successfully')
                    return res.redirect('back')
                } else {
                    console.log(err)
                    req.flash('error', 'Something went wrong')
                    return res.redirect('back')
                }
            })
        }
    }
}

module.exports = officeController