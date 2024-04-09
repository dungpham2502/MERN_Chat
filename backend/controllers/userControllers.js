const User = require('../models/userModel');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Joi = require('joi');


//Create JWT Token
const generateToken = (id) => {
    const jwtSecret = process.env.JWT_SECRET;
    const token = jwt.sign({ id }, jwtSecret, { expiresIn: '1d' });
    return token;
}

// Joi Validation Schema
const userSchema = Joi.object({
    name: Joi.string().max(30).required(),
    email: Joi.string().email({ minDomainSegments: 3, tlds: { allow: ['com', 'net', 'edu'] } }).required(),
    password: Joi.string().required()
});

// Validation Function
const validateUser = async(userData) => {
    const { error } = userSchema.validate(userData);
    if (error) {
        throw new Error(error.details[0].message);
    }
}

const signupUser = async(req, res) => {
    try {
        const { name, email, password } = req.body;
        await validateUser({ name, email, password });
        if (!name || !email || !password) {
            throw new Error("Please enter all required fields")
        }
        const existedUser = await User.findOne({ email });
        if (existedUser) {
            res.status(400);
            throw Error("User already exists!")
        }
        const salt = await bcrypt.genSalt(10);
        const hashedPass = await bcrypt.hash(password, salt);
        const user = await User.create({ name, email, password: hashedPass });
        const token = generateToken(user._id);
        res.status(201).json({ name: user.name, email: user.email, token });
    } catch (err) {
        console.log(err);
        res.status(400).json({ error: err.message });
    }
}

const loginUser = async(req, res) => {
    try {
        const { email, password } = req.body;

        const existedUser = await User.findOne({ email });
        if (!existedUser) {
            return res.status(400).json({ error: "Incorrect Email or Password!" });
        }
        console.log(password);
        const isMatch = await bcrypt.compare(password, existedUser.password);
        if (!isMatch) {
            return res.status(400).json({ error: "Incorrect Email or Password!" });
        }
        const token = generateToken(existedUser._id);
        res.status(200).json({ name: existedUser.name, email: existedUser.email, token, id: existedUser._id });
    } catch (err) {
        console.log(err);
        res.status(400).json({ error: err.message });
    }
}


module.exports = {
    signupUser,
    loginUser
}