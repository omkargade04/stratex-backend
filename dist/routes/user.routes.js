"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const user_middleware_1 = require("../middleware/user.middleware");
const express_1 = __importDefault(require("express"));
const userRouter = express_1.default.Router();
const multer = require('multer');
const path = require('path');
const { signup, signin, postBooks, getMyBooks, editBook, deleteBook, getAllBooks, getABook } = require('../controllers/user.controller');
// const upload = multer({ dest: 'uploads/' });
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './uploads');
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname);
    }
});
const uploads = multer({ storage: storage });
userRouter.post('/signup', signup);
userRouter.post('/signin', signin);
userRouter.get('/books', getAllBooks);
userRouter.get('/books/:id', getABook);
userRouter.post('/seller/books/upload', user_middleware_1.isAuthenticated, uploads.single('file'), postBooks);
userRouter.get('/seller/books', user_middleware_1.isAuthenticated, getMyBooks);
userRouter.put('/seller/books/:id', user_middleware_1.isAuthenticated, editBook);
userRouter.delete('/seller/books/:id', user_middleware_1.isAuthenticated, deleteBook);
module.exports = userRouter;
