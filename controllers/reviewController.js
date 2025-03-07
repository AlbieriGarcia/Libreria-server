const Review = require("../models/reviewModel");
const Book = require("../models/booksModel");
const { insertReviewSchema } = require("../middlewares/validator");
const { calculateRating } = require("../utils/calculateRating");

exports.getReviews = async (req, res) => {
  const { bookId } = req.query;
  const { userId } = req.user;

  try {
    const isBookExists = await Book.findOne({ _id: bookId });

    if (!isBookExists) {
      return res
        .status(404)
        .json({ success: false, message: "El libro no existe" });
    }

    const reviews = await Review.find({ bookId }).populate({
      path: "userId",
      select: "username email",
    });

    const result = reviews.map((review) => {
      // Verificar si el userId de la reseña es igual al userId logueado
      const manipulate = review.userId._id.toString() === userId.toString();

      // Esto crea un nuevo objeto con la reseña original y agrega el nuevo campo
      return {
        ...review.toObject(), 
        manipulate, 
      };
    });

    res.status(200).json({ success: true, message: "reviews", data: result });
  } catch (error) {
    console.log(error);
  }
};

exports.insertReview = async (req, res) => {
  const { bookId, rating, comment, wasEdited } = req.body;

  const { userId } = req.user;

  try {
    const alreadyMadeAReview = await Review.exists({ userId, bookId });

    if (alreadyMadeAReview) {
      return res
        .status(409)
        .json({
          success: false,
          message: "No puedes volver a hacer una reseña de este libro",
        });
    }

    const { error, value } = insertReviewSchema.validate({
      userId,
      bookId,
      rating,
      comment,
      wasEdited,
    });

    if (error) {
      return res
        .status(401)
        .json({ success: false, message: error.details[0].message });
    }

    const result = await Review.create({
      userId,
      bookId,
      rating,
      comment,
      wasEdited,
    });

    calculateRating(result.bookId)

    res.status(201).json({
      success: true,
      message: "La Reseña se agrego exitosamente",
      data: result,
    });
  } catch (error) {
    console.log(error);
  }
};

exports.updateReview = async (req, res) => {
  const { _id } = req.query;
  const { bookId, rating, comment, wasEdited } = req.body;
  const { userId } = req.user;

  try {
    const { error, value } = insertReviewSchema.validate({
      userId,
      bookId,
      rating,
      comment,
      wasEdited,
    });

    if (error) {
      return res
        .status(401)
        .json({ success: false, message: error.details[0].message });
    }

    const existingReview = await Review.findOne({ _id });

    if (!existingReview) {
      return res
        .status(404)
        .json({ success: false, message: "La Reseña no existe" });
    }

    existingReview.rating = rating;
    existingReview.comment = comment;
    existingReview.wasEdited = true;

    const result = await existingReview.save();

    calculateRating(result.bookId)

    res.status(201).json({
      success: true,
      message: "La Reseña se actualizo exitosamente",
      data: result,
    });
  } catch (error) {
    console.log(error);
  }
};

exports.deleteReview = async (req, res) => {
  const { _id } = req.query;

  const { userId } = req.user;

  try {
    const existingReview = await Review.findOne({ _id });

    if (!existingReview) {
      return res
        .status(404)
        .json({ success: false, message: "La Reseña no existe" });
    }

    if (existingReview.userId.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: "No tienes permiso para borrar esta reseña",
      });
    }

    await existingReview.deleteOne({ _id });

    res.status(200).json({
      success: true,
      message: "Reseña Eliminada",
    });
  } catch (error) {
    console.log(error);
  }
};
