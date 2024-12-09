const Book = require("../models/booksModel");
const {
  insertBookSchema,
  setFavoriteSchema,
} = require("../middlewares/validator");

exports.getBooks = async (req, res) => {
  const { page } = req.query;
  const { title, genre, year, author } = req.body;

  const booksPerPage = 6;

  try {
    let pageNum = 0;
    if (page <= 1) {
      pageNum = 0;
    } else {
      pageNum = page - 1;
    }

    const filter = {};

    if (title) {
      filter.title = { $regex: title, $options: "i" };
    }

    if (genre) {
      filter.genre = { $regex: genre, $options: "i" };
    }

    if (year) {
      filter.year = year;
    }

    if (author) {
      filter.author = { $regex: author, $options: "i" };
    }

    const result = await Book.find(filter)
      .sort({ createdAt: -1 })
      .skip(pageNum * booksPerPage)
      .limit(booksPerPage)
      .populate({
        path: "userId",
        select: ["email", "username"],
      });

    res.status(200).json({ success: true, message: "books", data: result });
  } catch (error) {
    console.log(error);
  }
};

exports.getBookById = async (req, res) => {
  const { _id } = req.query;

  try {
    const result = await Book.findOne({ _id }).populate({
      path: "userId",
      select: ["email", "username"],     
    });

    const isBookExists = await Book.findOne({ _id });

    if (!isBookExists) {
      return res
        .status(404)
        .json({ success: false, message: "El libro no existe" });
    }

    res
      .status(200)
      .json({ success: true, message: "book by id", data: result });
  } catch (error) {
    console.log(error);
  }
};

exports.getGenres = async (req, res) => {

  try {
    const result = await Book.distinct("genre")

    res
      .status(200)
      .json({ success: true, message: "Genres", data: result });
  } catch (error) {
    console.log(error);
  }
};

exports.getAuthors = async (req, res) => {

  try {
    const result = await Book.distinct("author")

    res
      .status(200)
      .json({ success: true, message: "Authors", data: result });
  } catch (error) {
    console.log(error);
  }
};

exports.getYears = async (req, res) => {

  try {
    const result = await Book.distinct("year")

    res
      .status(200)
      .json({ success: true, message: "Years", data: result });
  } catch (error) {
    console.log(error);
  }
};

exports.insertBook = async (req, res) => {
  const {
    title,
    descripcion,
    author,
    year,
    genre,
    coverImage,
    rating,
    isFavorite,
  } = req.body;

  const { userId } = req.user;

  try {
    const { error, value } = insertBookSchema.validate({
      userId,
      title,
      descripcion,
      author,
      year,
      genre,
      coverImage,
      rating,
      isFavorite,
    });

    if (error) {
      return res
        .status(401)
        .json({ success: false, message: error.details[0].message });
    }

    const result = await Book.create({
      userId,
      title,
      descripcion,
      author,
      year,
      genre,
      coverImage,
      rating,
      isFavorite,
    });

    res.status(201).json({
      success: true,
      message: "El libro se agrego exitosamente",
      data: result,
    });
  } catch (error) {
    console.log(error);
  }
};

exports.setFavorite = async (req, res) => {
  const { _id } = req.query;

  const { isFavorite } = req.body;

  const { userId } = req.user;

  try {
    const { error, value } = setFavoriteSchema.validate({isFavorite});

    if (error) {
      return res
        .status(401)
        .json({ success: false, message: error.details[0].message });
    }

    const existingBook = await Book.findOne({ _id });

    if (!existingBook) {
      return res
        .status(404)
        .json({ success: false, message: "El libro no existe" });
    }

    if (existingBook.userId.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: "No tienes permiso",
      });
    }

    existingBook.isFavorite = isFavorite;

    const result = await existingBook.updateOne({isFavorite});

    res.status(200).json({
      success: true,
      message: "Estado de Favorito actualizado",
      data: result,
    });
  } catch (error) {
    console.log(error);
  }
};

exports.updateBook = async (req, res) => {
  const { _id } = req.query;

  const {
    title,
    descripcion,
    author,
    year,
    genre,
    coverImage,
    rating,
    isFavorite,
  } = req.body;

  const { userId } = req.user;

  try {
    const { error, value } = insertBookSchema.validate({
      userId,
      title,
      descripcion,
      author,
      year,
      genre,
      coverImage,
      rating,
      isFavorite,
    });

    if (error) {
      return res
        .status(401)
        .json({ success: false, message: error.details[0].message });
    }

    const existingBook = await Book.findOne({ _id });

    if (!existingBook) {
      return res
        .status(404)
        .json({ success: false, message: "El libro no existe" });
    }

    if (existingBook.userId.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: "No tienes permiso para actualizar este libro",
      });
    }

    existingBook.title = title;
    existingBook.descripcion = descripcion;
    existingBook.author = author;
    existingBook.year = year;
    existingBook.genre = genre;
    existingBook.coverImage = coverImage;
    existingBook.rating = rating;
    existingBook.isFavorite = isFavorite;

    const result = await existingBook.save();

    res.status(200).json({
      success: true,
      message: "Libro Actualizado",
      data: result,
    });
  } catch (error) {
    console.log(error);
  }
};

exports.deleteBook = async (req, res) => {
  const { _id } = req.query;

  const { userId } = req.user;

  try {
    const existingBook = await Book.findOne({ _id });

    if (!existingBook) {
      return res
        .status(404)
        .json({ success: false, message: "El libro no existe" });
    }

    if (existingBook.userId.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: "No tienes permiso para borrar este libro",
      });
    }

    await existingBook.deleteOne({ _id });

    res.status(200).json({
      success: true,
      message: "Libro Eliminado",
    });
  } catch (error) {
    console.log(error);
  }
};
