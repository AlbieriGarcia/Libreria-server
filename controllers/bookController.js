const Book = require("../models/booksModel");
const mongoose = require("mongoose");
const { insertBookSchema } = require("../middlewares/validator");
const CsvParser = require("json2csv").Parser;

exports.getBooks = async (req, res) => {
  const { page, bookQt } = req.query;
  const { title, genre, year, author } = req.body;
  const { userId } = req.user;

  const booksPerPage = Number(bookQt) ?? 8;

  try {
    let pageNum = 0;
    if (page <= 1 || page == undefined) {
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

    const totalBooks = await Book.countDocuments();

    const books = await Book.aggregate([
      { $match: filter },
      { $sort: { createdAt: -1 } },
      { $skip: pageNum * booksPerPage },
      { $limit: booksPerPage },
      {
        $lookup: {
          from: "favorites",
          let: { bookId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$bookId", "$$bookId"] },
                    {
                      $eq: [
                        "$userId",
                        mongoose.Types.ObjectId.createFromHexString(userId),
                      ],
                    },
                  ],
                },
              },
            },
            { $project: { _id: 1, isFavorite: 1, bookId: 1 } },
          ],
          as: "favorite",
        },
      },
      {
        $unwind: {
          path: "$favorite",
          preserveNullAndEmptyArrays: true, // Permite que el valor sea null si no existe favorito
        },
      },
    ]);

    const result = await Book.populate(books, {
      path: "userId",
      select: ["email", "username"],
    });

    const pageData = {
      currentPage: pageNum + 1,
      totalPages: Math.ceil(totalBooks / booksPerPage),
      totalBooks: totalBooks,
    };

    res.status(200).json({
      success: true,
      message: "books",
      pageInfo: pageData,
      data: result,
    });
  } catch (error) {
    console.log(error);
  }
};

exports.getMyBooks = async (req, res) => {
  const { page, bookQt } = req.query;
  const { title, genre, year, author } = req.body;
  const { userId } = req.user;

  const booksPerPage = Number(bookQt) ?? 8;

  try {
    let pageNum = 0;
    if (page <= 1 || page == undefined) {
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

    const totalBooks = await Book.countDocuments();

    const result = await Book.find({ userId, ...filter })
      .sort({ createdAt: -1 })
      .skip(pageNum * booksPerPage)
      .limit(booksPerPage)
      .populate({
        path: "userId",
        select: ["email", "username"],
      });

    const pageData = {
      currentPage: pageNum + 1,
      totalPages: Math.ceil(totalBooks / booksPerPage),
      totalBooks: totalBooks,
    };

    res.status(200).json({
      success: true,
      message: "books",
      pageInfo: pageData,
      data: result,
    });
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
    const result = await Book.distinct("genre");

    res.status(200).json({ success: true, message: "Genres", data: result });
  } catch (error) {
    console.log(error);
  }
};

exports.getAuthors = async (req, res) => {
  try {
    const result = await Book.distinct("author");

    res.status(200).json({ success: true, message: "Authors", data: result });
  } catch (error) {
    console.log(error);
  }
};

exports.getYears = async (req, res) => {
  try {
    const result = await Book.distinct("year");

    res.status(200).json({ success: true, message: "Years", data: result });
  } catch (error) {
    console.log(error);
  }
};

exports.insertBook = async (req, res) => {
  const { title, descripcion, author, year, genre, coverImage } = req.body;

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
      rating: 0,
      coverImage,
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

exports.updateBook = async (req, res) => {
  const { _id } = req.query;

  const { title, descripcion, author, year, genre, coverImage } = req.body;

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

exports.getExportCsvBook = async (req, res) => {
  const { page, bookQt } = req.query;
  const { title, genre, year, author, getAll } = req.body;
  const { userId } = req.user;

  const booksPerPage = Number(bookQt) ?? 8;

  try {
    let pageNum = 0;
    if (page <= 1 || page == undefined) {
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

    let books;

    if (!getAll) {
      books = await Book.aggregate([
        { $match: filter },
        { $sort: { createdAt: -1 } },
        { $skip: pageNum * booksPerPage },
        { $limit: booksPerPage },
        {
          $lookup: {
            from: "favorites",
            let: { bookId: "$_id" },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      { $eq: ["$bookId", "$$bookId"] },
                      {
                        $eq: [
                          "$userId",
                          mongoose.Types.ObjectId.createFromHexString(userId),
                        ],
                      },
                    ],
                  },
                },
              },
              { $project: { _id: 1, isFavorite: 1, bookId: 1 } },
            ],
            as: "favorite",
          },
        },
        {
          $unwind: {
            path: "$favorite",
            preserveNullAndEmptyArrays: true, // Permite que el valor sea null si no existe favorito
          },
        },
      ]);
    } else {
      books = await Book.aggregate([
        {
          $lookup: {
            from: "favorites",
            let: { bookId: "$_id" },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      { $eq: ["$bookId", "$$bookId"] },
                      {
                        $eq: [
                          "$userId",
                          mongoose.Types.ObjectId.createFromHexString(userId),
                        ],
                      },
                    ],
                  },
                },
              },
              { $project: { _id: 1, isFavorite: 1, bookId: 1 } },
            ],
            as: "favorite",
          },
        },
        {
          $unwind: {
            path: "$favorite",
            preserveNullAndEmptyArrays: true, // Permite que el valor sea null si no existe favorito
          },
        },
      ]);
    }

    const result = await Book.populate(books, {
      path: "userId",
      select: ["email", "username"],
    });

    let booksData = [];

    result.forEach((book) => {
      const {
        _id,
        title,
        descripcion,
        author,
        year,
        genre,
        coverImage,
        rating,
        createdAt,
        updatedAt,
      } = book;
      const { username, email } = book.userId;

      let isFavorite = false;

      if (book.favorite) {
        isFavorite = book.favorite.isFavorite;
      }

      booksData.push({
        "Book ID": _id,
        Title: title,
        Descripcion: descripcion,
        Author: author,
        Year: year,
        Genre: genre[0],
        "Image Url": coverImage,
        Rating: rating,
        "Created Date": createdAt,
        "Upadated Date": updatedAt,
        Username: username,
        Email: email,
        "Is Favorite": isFavorite,
      });
    });

    const csvFields = [
      "Book ID",
      "Title",
      "Descripcion",
      "Author",
      "Year",
      "Genre",
      "Image Url",
      "Rating",
      "Created Date",
      "Upadated Date",
      "Username",
      "Email",
      "Is Favorite",
    ];

    const csvParser = new CsvParser({ csvFields });
    const csvData = csvParser.parse(booksData);

    const csvDataWithBom = "\uFEFF" + csvData;

    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", "attatchment: filename=booksData.csv");

    res.status(200).end(csvDataWithBom);
  } catch (error) {
    console.log(error);
  }
};
