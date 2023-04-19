
function admin (req, res, next) {
    if(req.isAuthenticated() && req.user.permission. verifyUserListedProducts) {
       return next()
    }
    else{
        return res.redirect('/home')
    }
}

module.exports = admin