const mongoose = require("mongoose");

const reviewSchema = mongoose.Schema(
  {
    bookId: {
      type: mongoose.Schema.Types.ObjectId,
      required: [true, "El ID del libro es requerido"],
      ref: "Book",
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: [true, "El ID del usuario es requerido"],
      ref: "User",
    },
    rating: {
      type: Number,
      required: [true, "La calificación es requerida"],
      min: [0, "La calificación no puede ser menor a 0"],
      max: [5, "La calificación no puede ser mayor a 5"],
    },
    comment: {
      type: String,
      trim: true,
      maxLength: [3000, "El comentario no debe de tener mas de 3000 caracteres"],
    },
    wasEdited: {
      type: Boolean
    }
  },
  {
    timestamps: true, 
  }
);

module.exports = mongoose.model("Review", reviewSchema);
