require('dotenv').config()
const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require("bcrypt");
const conDB = require('./config/db');
const jwt = require("jsonwebtoken");
const nodemailer = require('nodemailer');
const userModel = require('./models/userModel');
const tokenModel = require('./models/tokenModel');


const app = express();
const port = process.env.PORT || 5000;

// Parse incoming requests with JSON payloads
app.use(bodyParser.json());

// Coonect to the database
conDB();


// router handlers 
app.get('/home', (req, res) => {
    res.status(200).json('You are welcome');
})

// Define a route that registers users to the databse
app.post('/register', async (req, res) => {
    const { fullname, email, password } = req.body

    const user = await userModel.findOne({ email });
    if (user) {
        return res.status(400).json({
            message: "User already registered",
        });
    }

    // hash the password 
    const hashedpassword = await bcrypt.hash(password, 10);

    const newUser = new userModel({
        fullname,
        email,
        password: hashedpassword
    })

    try {
        const userCreated = await newUser.save();
        if (!userCreated) {
            // console.log("user cannot be created");
            return res.status(500).json({
                message: "User cannot registered",
            });
        } else {
            const transporter = nodemailer.createTransport({
                service: "gmail",
                host: "smtp.gmail.com",
                port: 587,
                secure: false,
                auth: {
                    user: "vikas.cool786@gmail.com",
                    pass: "lgjnjkqjfbdqdqty",
                },
            });

            //create jwt token
            const token = jwt.sign({
                data: process.env.SECRET_CODE
            }, 'ourSecretKey', { expiresIn: '1h' });


            let tokenObj = await new tokenModel({
                userId: userCreated._id,
                token: token,
            }).save();

            const mailConfigurations = {

                // It should be a string of sender/server email
                from: 'viksa.cool786@gmail.com',

                to: `${userCreated.email}`,

                // Subject of Email
                subject: 'Email Verification',

                // This would be the text of email body
                text: `Hi! There, You have recently visited 
                       our website and entered your email.
                       Please follow the given link to verify your email
                       http://localhost:5000/verify/${userCreated.id}/${tokenObj.token} 
                       Thanks`

            };

            if (tokenObj) {
                transporter.sendMail(mailConfigurations, function (error, info) {
                    if (error) throw Error(error);
                    console.log('Email Sent Successfully');
                    console.log(info);
                });

                // console.log("user has been created to the database");
                return res.status(200).json({
                    message: "User registered & Email Sent Successfully",
                });
            }
        }
    } catch (err) {
        console.log(err.message);
        return res.status(200).json({
            message: err.message,
        });
    }


});

app.get('/verify/:id/:token', async (req, res) => {
    const { id, token } = req.params;

    try {
        const user = await userModel.findOne({ _id: id });
        // console.log(user._id.valueOf());
        if (!user) return res.status(400).json({
            message: "Invalid link",
        });

        const tokenObj = await tokenModel.findOne({
            userId: user._id.valueOf(),
            token: token,
        });
        // console.log(tokenObj);
        if (!token) return res.status(400).json({
            message: "Invalid link",
        });

        await userModel.updateOne({ _id: user._id,}, { verified: true });
        await tokenModel.findByIdAndRemove(tokenObj._id.valueOf());
        return res.status(200).json({
            message: "email verified sucessfull",
        });
    } catch (error) {
        return res.status(400).json({
            message: "An error occured",
        });
    }

});

// login route
app.post('/login', async (req, res) => {
    const { email, password } = req.body;
    // Find user by email
    const user = await userModel.findOne({ email: email, verified: true});
    console.log(user);

    if (!user) {
        // If the user doesn't exist, return an error
        return res.status(401).json({
            message: "Invalid email or password"
        });
    }

    // Check if password is correct
    const isPasswordCorrect = await bcrypt.compare(password, user.password);

    if (!isPasswordCorrect) {
        // If the password is incorrect, return an error
        return res.status(401).json({
            message: "Invalid email or password"
        });
    }

    // If the email and password are correct, create a JWT token
    // Secrete Key saved in .env file
    const mysecretkey = process.env.SECRET_CODE;

    // Payload to generate JWT
    const payload = {
        fullName: user.fullname,
        email: user.email,
        password: user.password,
    };
    // Create a jsonwebtoken
    const token = jwt.sign(payload, mysecretkey, { expiresIn: '1d' });

    // Send the token back to the client
    return res.status(200).json({
        message: "User is logged in",
        fullname: user.fullname,
        email: user.email,
        token: token
    });
});

app.get('/protected', async (req, res) => {
    // const token = req.headers.authorization.split(' ')[1]; // Get token from Authorization header
    const mysecretkey = process.env.SECRET_CODE;
    try {
        // Verify token and decode payload
        const decoded = jwt.verify(req.headers.authorization.split(' ')[1], mysecretkey);

        // Get user email from payload
        const userEmail = decoded.email;

        // Find user by email in the database
        const user = await userModel.findOne({ email: userEmail });

        if (user) {
            res.json({ message: `Welcome ${user.fullname}! This is a protected route.` });
        } else {
            res.status(401).json({ error: 'Invalid token' });
        }
    } catch (error) {
        res.status(401).json({ error: 'Invalid token' });
    }
});






// Start the server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}/`);
});