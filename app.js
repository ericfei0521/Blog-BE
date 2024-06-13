const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const postsRoutes = require('./routes/posts');
const mongoose = require('mongoose');
const env = require('dotenv').config();
const MONGODB_URL = `mongodb+srv://techpit001:${env.parsed.MONGO_PWD}@test01.vj0khtd.mongodb.net/?retryWrites=true&w=majority&appName=test01`;

const app = express();

app.use(bodyParser.json());
app.use('/images', express.static(path.join(__dirname, 'images')));

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET , POST');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type , Authorization');
    next();
});

app.use('/posts', postsRoutes);

app.use((error, req, res, next) => {
    console.log(error);
    const status = error.statusCode || 500;
    const message = error.message;
    res.status(status).json({ message: message });
});

mongoose
    .connect(MONGODB_URL)
    .then(() => app.listen(8080))
    .catch((err) => console.log(err));
