const express = require('express');
const bookController = require('../controllers/bookController');
const { identifier } = require('../middlewares/identification');
const router = express.Router();
 
router.get('/getBooks', bookController.getBooks);
router.get('/getBookById', bookController.getBookById);
router.post('/insertBook', identifier, bookController.insertBook);
router.patch('/setFavorite', identifier, bookController.setFavorite);
router.put('/updateBook', identifier, bookController.updateBook);
router.delete('/deleteBook', identifier, bookController.deleteBook); 


module.exports = router;
