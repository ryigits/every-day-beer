function userLogedIn(req, res, next) {
    if (!req.session.id) {
        return res.redirect("/login");
    }
    next();
}

function userLogedOut(req, res, next) {
    if (req.session.id) {
        return res.redirect("/petition");
    }
    next();
}

function userUnsigned(req, res, next) {
    if (req.session.signed) {
        return res.render("thanks", {
            logged: true,
            name: req.session.name,
        });
    }
    next();
}



module.exports = {
    userLogedIn,
    userLogedOut,
    userUnsigned,
};
