const Joi = require("joi");

exports.signupSchema = Joi.object({
  username: Joi.string().min(3).max(60).required(),
  email: Joi.string()
    .min(6)
    .max(60)
    .required()
    .email({
      tlds: { allow: ["com", "net"] },
    }),
  password: Joi.string()
    .required()
    .pattern(new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).{8,}$"))
    .message(
      "La contraseña debe contener al menos una letra minúscula, una letra mayúscula, un número  y tener una longitud mínima de 8 caracteres"
    ),
});


exports.insertBookSchema = Joi.object({
  userId: Joi.string()
  .required(),

  title: Joi.string()
    .min(1)
    .max(120)
    .message(
      "El titulo no cuenta con los caracteres correctos"
    )
    .required(),
    
  descripcion: Joi.string()
  .max(1000)
  .message(
    "La descripcion es muy larga"
  ),

  author: Joi.string()
    .min(1)
    .max(120)
    .message(
      "El nombre del autor no cuenta con los caracteres correctos"
    )
    .required(),

  year: Joi.number()
    .required(),

  genre: Joi.string()
    .min(1)
    .max(80)
    .required(),

  coverImage: Joi.string(),
    
  rating: Joi.number(),

  isFavorite: Joi.boolean(),
  
});

exports.setFavoriteSchema = Joi.object({
  
  isFavorite: Joi.boolean(),
  
});

// reviews

exports.insertReviewSchema = Joi.object({
  userId: Joi.string()
  .required(),

  bookId: Joi.string()
  .required(),

  rating: Joi.number()
    .required(),
    
  comment: Joi.string()
  .max(3000),

  wasEdited: Joi.boolean(),
  
});