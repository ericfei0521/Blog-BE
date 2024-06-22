const express = require('express');
const authController = require('../controllers/user');
const User = require('../models/user');
const { body } = require('express-validator');

const router = express.Router();

router.post(
    '/signup',
    [
        body('email')
            .isEmail()
            .withMessage('EMAIL_REQUIRED')
            .custom((value, req) => {
                return User.findOne({ email: value }).then((user) => {
                    if (user) {
                        return Promise.reject('EMAIL_EXIST');
                    }
                });
            })
            .normalizeEmail(),
        body('name').notEmpty().withMessage("'NAME_REQUIRED'"),
        body('password')
            .trim()
            .isLength({ min: 8 })
            .withMessage('PASSWORD_MUST_AT_LEAST_EIGHT_CHARACTERS')
            .matches(/[A-Z]/)
            .withMessage('PASSWORD_MUST_AT_LEAST_ONE_UPPERCASE')
            .matches(/\d/)
            .withMessage('PASSWORD_MUST_AT_LEAST_ONE_NUMBER'),
    ],
    authController.signup
);

module.exports = router;
