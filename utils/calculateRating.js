const Review = require("../models/reviewModel");
const Book = require("../models/booksModel");

exports.calculateRating = async (bookId) => {
  const result = await Review.aggregate([
    {
      $match: { bookId: bookId },
    },
    {
      $group: {
        _id: "$bookId",
        starAvg: { $avg: "$rating" },
      },
    },
  ]);

  await Book.findByIdAndUpdate(
    bookId.toString(),
    { rating: result[0].starAvg },
    { new: true }
  );
};
