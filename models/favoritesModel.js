const mongoose = require("mongoose");

const favoriteSchema = mongoose.Schema(
  {
    bookId: {
      type: mongoose.Schema.Types.ObjectId,
      required: [true, "El ID del libro es requerido"],
      ref: "Book",
    },
    isFavorite: {
      type: Boolean,
      required: [true, "El campo 'isFavorite' es requerido"],
      default: false,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: [true, "El ID del usuario es requerido"],
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Favorites", favoriteSchema);
