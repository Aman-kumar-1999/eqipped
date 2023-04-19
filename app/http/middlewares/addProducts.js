
function admin (req, res, next) {
    if(req.isAuthenticated() && req.user.permission.addProducts) {
       return next()
    }
    return res.redirect('/home')
}

module.exports = admin