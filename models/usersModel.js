const mongoose = require("mongoose");

const userSchema = mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, "El Nombre de usuario es requerido"],
      trim: true,
      minLength: [3, "El Nombre debe de tener almenos 3 caracteres"],
    },
    email: {
      type: String,
      required: [true, "El Correo es requerido"],
      trim: true,
      unique: [true, "Este correo ya esta registrado"],
      minLength: [5, "El Correo debe de tener almenos 5 caracteres"],
      lowercase: true,
    },
    password: {
      type: String,
      required: [true, "La contraseña es requerida"],
      trim: true,
      select: false,
    },
    verificationCodeValidation: {
      type: Number,
      select: false,
    },
    forgotPasswordCode: {
      type: String,
      select: false,
    },
    forgotPasswordCodeValidation: {
      type: Number,
      select: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("User", userSchema);
