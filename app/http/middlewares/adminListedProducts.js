
function admin (req, res, next) {
    if(req.isAuthenticated() && req.user.permission.adminListedProducts) {
       return next()
    }
    return res.redirect('/home')
}

module.exports = admin