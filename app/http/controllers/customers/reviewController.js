const Variation = require('../../../models/variation');
const User = require('../../../models/user');
function reviewController() {
    return {
        async review(req, res) {
            const rated = {
                variantRatedID: req.body.productID,
            }
            
            await User.updateOne({ _id: req.user._id },{ $push: { reviewed: rated } }).exec();
            
           const variation = await Variation.findOne({ _id: req.body.productID }).exec();
            
            const Rating = {
                rateuser_id: req.user._id,
                rating: req.body.rating,
                comment: req.body.comment
            }
            if(!variation.totalrating){
                variation.totalrating = 0;
            }
            totalStars = Number(variation.totalrating) + Number(req.body.rating);
            avgStars = (totalStars / (variation.reviews.length + 1))
        
             await Variation.updateOne({ _id: req.body.productID },{$set:{ totalrating : totalStars, avgrating : avgStars.toFixed(1) }, $push: { reviews: Rating} }).exec();
            return res.redirect('back');
        }
    }
}
module.exports = reviewController;