var express = require('express');
var router = express.Router();
const book = require('../models/book');

// function to wrap each route
function asyncHandler(cb) {
  return async(req, res, next) => {
    try {
      await cb(req, res, next);
    } catch(error) {
      res.status(500).send(error);
      next(error);
    }
  }
}

/* GET home page. */
router.get('/', asyncHandler(async (req, res) => {
  res.redirect('/books');
}));

// Shows the full list of books
router.get('/books', asyncHandler(async (req, res) => {
  const books = await book.findAll();
  if(books) {
    res.render('index', {books});
  } else {
    res.status(404).render('error');
  }
}));

// shows create new books form
router.get('/books/new', asyncHandler(async (req, res) => {
  res.render('new-book', {book: {}, title: 'New Book'});
}));

router.post('/books/new', asyncHandler(async (req, res) => {
  let book;
  try {
    const book = await Book.create(req.body);
    res.redirect('/');
  } catch(error) {
    if(error.name === 'SequelizeValidationError') {
      book = await Book.build(req.body);
      res.render('new-book', {book, errors: error.errors, title: 'New Book'});
    } else {
      throw error; // error caught in asyncHandler's catch block
    }
  }
}));

router.get('/books/:id', asyncHandler(async (req, res, next) => {
  const book = await Book.findByPk(req.params.id);
  if(book) {
    res.render('update-book', {book, title: book.title});
  } else {
    next();
  }
}));

// updates book info in the database
router.post('/books/:id', asyncHandler(async (req, res, next) => {
  let book;
  try {
    book = await Book.findByPk(req.params.id);
    if(book) {
      await book.update(req.body);
      res.redirect('/');
    } else {
      res.sendStatus(404);
    }
  } catch(error) {
    if(error.name === 'SequelizeValidationError') {
      book = await Book.build(req.body);
      res.render('update-book', {book, errors: error.erros, title: 'New Book'});
    } else {
      throw error;
    }
  }
}));

// deletes book *PERMANENT*
router.post('/books/:id/delete', asyncHandler(async (req, res) => {
  const book = await Book.findByPk(req.params.id);
  if(book) {
    await book.destroy();
    res.redirect('/');
  } else {
    res.sendStatus(404);
  }
}))
module.exports = router;
