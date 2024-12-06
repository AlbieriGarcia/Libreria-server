const express = require('express');
const reviewController = require('../controllers/reviewController');
const { identifier } = require('../middlewares/identification');
const router = express.Router();
 
router.get('/getReviews', reviewController.getReviews);
router.post('/insertReview', identifier, reviewController.insertReview);
router.put('/updateReview', identifier, reviewController.updateReview);
router.delete('/deleteReview', identifier, reviewController.deleteReview); 


module.exports = router;
