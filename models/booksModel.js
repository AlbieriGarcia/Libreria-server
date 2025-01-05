const mongoose = require("mongoose");

const bookSchema = mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "El título es requerido"],
      trim: true,
      minLength: [3, "El título debe tener al menos 3 caracteres"],
    },
    descripcion: {
        type: String,
        trim: true,
        maxLength: [1500, "La descripcion no debe de tener mas de 1500 caracteres"],
      },
    author: {
      type: String,
      required: [true, "El autor es requerido"],
      trim: true,
    },
    year: {
      type: Number,
      required: [true, "El año de publicación es requerido"],
    },
    genre: {
      type: [String],
      required: [true, "El género es requerido"],
      validate: {
        validator: (genres) => genres.length > 0,
        message: "Debe haber al menos un género",
      },
    },
    coverImage: {
      type: String,
      trim: true,
    },
    rating: {
      type: Number,
      min: [0, "La calificación no puede ser menor a 0"],
      max: [5, "La calificación no puede ser mayor a 5"],
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: [true, "El ID del usuario es requerido"],
      ref: "User",
    }
  },
  {
    timestamps: true, 
  }
);

module.exports = mongoose.model("Book", bookSchema);
