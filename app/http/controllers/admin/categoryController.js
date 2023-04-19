const MarqueContent = require("../../../models/marqueContentModel");


function categoryController() {
    return {

        index(req, res) {
            return res.render('admin/categories')
        },

        marque(req, res) {
            return res.render('admin/marquepage');
        },

        marqueContent(req, res) {
            const { marque1, marque2, marque3 } = req.body
            const create_marque = new MarqueContent({
                content1: marque1,
                content2: marque2,
                content3: marque3,
            })
            create_marque.save().then(() => {
                req.flash('error', 'Content Added Successfully')
                return res.redirect('/marque')
            }).catch(err => {
                console.log(err)
                req.flash('error', 'Something went wrong, Please try again later')
                return res.redirect('/marque')
            })
        }
        
    }
}

module.exports = categoryController