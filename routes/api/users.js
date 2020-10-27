const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const gravatar = require('gravatar');
const bcrypt = require('bcryptjs');
const User = require ('../../models/User');
const jwt = require('jsonwebtoken');
const config = require('config');

// @route   POST api/users
// @desc    Test route
// @access  Public
router.post('/', [
    check('name', 'Name is required').not().isEmpty(),
    check('email', 'Pleae include a valid email').isEmail(),
    check('password', 'Please enter a password with 6 or more character').isLength({min:6})
], 
async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({errors: errors.array() });
    }
    const { name, email, password } = req.body;

    try {
        let user = await User.findOne({ email })
        // See if user exits
        if(user) {
            return res.status(400).json({drrors: [ {  msg: 'User alreay exist' }] })
        }
        
        // Get users gravatar
        const avatar = gravatar.url(email, {
            s: '200', //s size
            r: 'pg', // r reading 
            d: 'mm', // d default
        });

        // Encrypt password
        user = new User ({
            name, email, avatar, password
        });
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);

        await user.save();
    
        // get the payload and return jsonwebtoken
        const payload = {
            user: {
                id: user.id
            }
        };
        jwt.sign(
            payload,
            config.get('jwtSecret'),
            {expiresIn: 360000 },
            (err, token) => {
                if (err) throw err;
                res.json({ token });
            }
        );

    } catch (error) {
        console.error(err.message);
        res.status(500).send('Server.error')
    }
});

module.exports = router;