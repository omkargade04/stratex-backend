import { isAuthenticated } from "../middleware/user.middleware";
import express, { Router } from 'express';
const userRouter: Router = express.Router();
const multer = require('multer');
const path = require('path');

const { signup, signin, postBooks, getMyBooks, editBook, deleteBook, getAllBooks, getABook  } = require('../controllers/user.controller')

// const upload = multer({ dest: 'uploads/' });

const storage = multer.diskStorage({
    destination: (req: any, file: any, cb: any) => {
        cb(null, './uploads')
    },
    filename: (req: any, file: any, cb: any) => {
        cb(null, file.originalname)
    }
})

const uploads = multer({storage: storage});

userRouter.post('/signup', signup);
userRouter.post('/signin', signin);
userRouter.get('/books', getAllBooks);
userRouter.get('/books/:id', getABook);
userRouter.post('/seller/books/upload', isAuthenticated, uploads.single('file'), postBooks);
userRouter.get('/seller/books', isAuthenticated, getMyBooks);
userRouter.put('/seller/books/:id', isAuthenticated, editBook);
userRouter.delete('/seller/books/:id', isAuthenticated, deleteBook);

module.exports = userRouter;


