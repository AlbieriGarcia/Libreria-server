const Favorites = require("../models/favoritesModel");
const Book = require("../models/booksModel");
const { setFavoriteSchema } = require("../middlewares/validator");

exports.setFavorite = async (req, res) => {
  const { bookId, favoriteId } = req.query;

  const { isFavorite } = req.body;

  const { userId } = req.user;

  try {
    const { error, value } = setFavoriteSchema.validate({ isFavorite });

    if (error) {
      return res
        .status(401)
        .json({ success: false, message: error.details[0].message });
    }

    const existingBook = await Book.findOne({ _id: bookId });

    if (!existingBook) {
      return res
        .status(404)
        .json({ success: false, message: "El libro no existe" });
    }

    const favorite = await Favorites.findOne({ bookId, userId });

    if (favorite != null) {
      if (favorite.userId.toString() !== userId) {
        return res.status(403).json({
          success: false,
          message: "No tienes permiso",
        });
      }

      favorite.isFavorite = isFavorite;

      const result = await Favorites.updateOne(
        { _id: favoriteId },
        { isFavorite },
      );

      res.status(200).json({
        success: true,
        message: "Estado de Favorito actualizado",
        data: result,
      });
    } else {
      const result = await Favorites.create({ bookId, isFavorite, userId });

      res.status(200).json({
        success: true,
        message: "Se Agrego a favoritos",
        data: result,
      });
    }
  } catch (error) {
    console.log(error);
  }
};
