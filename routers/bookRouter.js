const express = require("express");
const bookController = require("../controllers/bookController");
const { identifier } = require("../middlewares/identification");
const router = express.Router();

router.post("/getBooks", identifier, bookController.getBooks);
router.post("/getMyBooks", identifier, bookController.getMyBooks);
router.get("/getBookById", identifier, bookController.getBookById);
router.get("/getGenres", bookController.getGenres);
router.get("/getAuthors", bookController.getAuthors);
router.get("/getYears", bookController.getYears);
router.post("/insertBook", identifier, bookController.insertBook);
router.put("/updateBook", identifier, bookController.updateBook);
router.delete("/deleteBook", identifier, bookController.deleteBook);

module.exports = router;
