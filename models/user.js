const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema(
    {
        name: {
            type: String,
            require: true,
        },
        email: {
            type: String,
            require: true,
        },
        password: {
            type: String,
            require: true,
        },
        status: {
            type: String,
            default: 'new',
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);
