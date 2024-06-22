const path = require('path');
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const swaggerjsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const yaml = require('js-yaml');
const fs = require('fs');
const mongoose = require('mongoose');
const multer = require('multer');
const env = require('dotenv').config();
const postsRoutes = require('./routes/posts');
const authRoutes = require('./routes/auth');

const MONGODB_URL = `mongodb+srv://techpit001:${env.parsed.MONGO_PWD}@test01.vj0khtd.mongodb.net/?retryWrites=true&w=majority&appName=test01`;

const storage = multer.diskStorage({
    destination: './public/images',
    filename: function (req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    },
});

const fileFilter = (req, file, cb) => {
    // Allowed ext
    const filetypes = /jpeg|jpg|png|gif/;
    // Check ext
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    // Check mime
    const mimetype = filetypes.test(file.mimetype);

    if (mimetype && extname) {
        return cb(null, true);
    } else {
        cb('Error: Images Only!');
    }
};

const upload = multer({ storage: storage, fileFilter: fileFilter });
const app = express();

app.use(
    cors({
        origin: 'http://localhost:3000',
        optionsSuccessStatus: 200,
    })
);
app.use(upload.single('image'));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

const swaggerDocument = yaml.load(fs.readFileSync(path.join(__dirname, 'swagger.yaml'), 'utf8'));
const swaggerSpec = swaggerjsdoc({
    swaggerDefinition: swaggerDocument,
    apis: [], // No need to specify paths to JSDoc comments
});
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use('/public/images', express.static(path.join(__dirname, 'public/images')));
app.use('/posts', postsRoutes);
app.use('/auth', authRoutes);

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
