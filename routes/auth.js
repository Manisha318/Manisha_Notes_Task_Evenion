const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/users');


// register user
router.post('/register', async (req, res) => {
    const { username, email, password } = req.body;

    try {
        if (!username || !email || !password) {
            return res.status(400).json({ msg: "Please enter all fields" });
        }

        const user = await User.findOne({ email });

        if (user) {
            return res.status(400).json({ msg: "User already exists" });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPwd = await bcrypt.hash(password, salt);

        const newUser = new User({
            username,
            email,
            password: hashedPwd,
        });

        const savedUser = await newUser.save();
        res.json(savedUser);

    } catch (error) {
        res.status(500).json(error);
    }
});


// login user
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        if (!email || !password) {
            return res.status(400).json({ msg: "Please enter all fields" });
        }

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(400).json({ msg: "User does not exist" });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(400).json({ msg: "Invalid credentials" });
        }

        const token = jwt.sign({ id: user._id }, "$2a$10$NHMKdovhCs9NXSrJUHU3xODKf28vN00qF2Mf/AaBLcj5N8U0B3tu", { expiresIn: 43200 });

        res.status(200).json({ token, user: { id: user._id, username: user.username, email: user.email, isAdmin: user.isAdmin } });

    } catch (error) {
        res.status(500).json(error);
    }
});

module.exports = router;
