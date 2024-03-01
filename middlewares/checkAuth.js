const jwt = require('jsonwebtoken');

const checkAuth = async (req, res, next) => {

    if (req.headers.authorization) {

        let token = req.headers.authorization

        jwt.verify(token, "$2a$10$NHMKdovhCs9NXSrJUHU3xODKf28vN00qF2Mf/AaBLcj5N8U0B3tu", (err, user) => {
            if (err) {
                return res.status(401).json({ msg: "Session timeout! Please Login again" })
            }
            else {
                req.user = user;
                req.token = token;
                next();
            }
        })
    }
    else {
        return res.status(400).json({ msg: "unauthorized access" })
    }
}

module.exports = checkAuth