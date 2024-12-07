const jwt = require("jsonwebtoken");
const { signupSchema, signinSchema } = require("../middlewares/validator");
const User = require("../models/usersModel");
const { doHash, doHashValidation } = require("../utils/hashing");

exports.signup = async (req, res) => {
  const { username, email, password } = req.body;
  try {
    const { error, value } = signupSchema.validate({
      username,
      email,
      password,
    });

    if (error) {
      return res
        .status(401)
        .json({ success: false, message: error.details[0].message });
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(401).json({
        success: false,
        message: "Ya hay un usuario con este correo!",
      });
    }

    const hashedPassword = await doHash(password, 12);

    const newUser = new User({
      username,
      email,
      password: hashedPassword,
    });

    const result = await newUser.save();
    result.password = undefined;

    res.status(201).json({
      success: true,
      message: "Tu Cuenta se a creado exitosamente!",
      result,
    });
  } catch (error) {
    console.log(error);
  }
};

exports.signin = async (req, res) => {
  const { email, password } = req.body;

  try {
    
    const existingUser = await User.findOne({ email }).select("+password");

    if (!existingUser) {
      return res.status(401).json({
        success: false,
        message: "El Usuario no existe",
      });
    }

    const result = await doHashValidation(password, existingUser.password);

    if (!result) {
      return res.status(401).json({
        success: false,
        message: "La contraseña es incorrecta",
      });
    }

    // Creacion del token
    const token = jwt.sign(
      {
        userId: existingUser._id,
        username: existingUser.username,
        email: existingUser.email,
        verified: existingUser.verified,
      },
      process.env.TOKEN_SECRET,
      {
        expiresIn: "8h",
      }
    );

    res
      .cookie("Authorization", "Bearer " + token, {
        expires: new Date(Date.now() + 8 * 3600000),
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
      })
      .json({
        success: true,
        token,
        message: "Te has logeado exitosamente",
      });
  } catch (error) {
    console.log(error);
  }
};

exports.signout = async (req, res) => {
  res
    .clearCookie("Authorization")
    .status(200)
    .json({ success: true, message: "Te has deslogeado exitosamente!" });
};

exports.verifyToken = async (req, res) => {
  let token  = req.headers.authorization;

  try {
    const userToken = token.split(" ")[1]; // toma el token despues del Bearer
    const jwtVerified = jwt.verify(userToken, process.env.TOKEN_SECRET);

    if (jwtVerified) {
      res.json({ success: true, message: "Autenticado" });
    } else {
      throw new Error("No estas autenticado");
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Ocurrio un error al verificar el token, el token pudo ser alterado.",
    });
  }
};
