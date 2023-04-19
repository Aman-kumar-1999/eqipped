function vendor (req, res, next) {
    if(req.isAuthenticated() && req.user.role!= 'customer') {  // Admin kahi kahi vendor routes use kr rha hai islye isliye vendor ko vendor or admin dono ka access de rha hu kuki double layer security hai admin vese bhi vendor me na ghus paega if vendor ki info me admin ghusta bhi hai to koi dikka nahi admin is the father of vendors. Ane vale time me or reliable bana dunga ise. - Abhishek kashyap
       return next()
    }
    return res.redirect('/home')
}

module.exports = vendor