const express = require('express');
const { identifier } = require('../middlewares/identification');
const favoritesController = require('../controllers/favoritesController');
const router = express.Router();
 
router.patch('/setFavorite', identifier, favoritesController.setFavorite);

module.exports = router;
