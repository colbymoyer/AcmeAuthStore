const { routes } = require("../shared/shared");
const { findUserWithToken } = require("../queries/userQueries");
const {
  register,
  displayAll,
  login,
  fetchUsers,
  fetchProducts,
  fetchFavorites,
  createFavorite,
  destroyFavorite,
} = require("../controllers/userControllers");

const isLoggedIn = async (req, res, next) => {
  try {
    req.user = await findUserWithToken(req.headers.authorization);
    next();
  } catch (error) {
    next(error);
  }
};

routes.post("/register", register);
routes.get("/all_users", isLoggedIn, displayAll);
routes.post("/auth/login", login);
routes.get("/users", fetchUsers);
routes.get("/products", fetchProducts);
routes.get("/users/:id/favorites", isLoggedIn, fetchFavorites);
routes.get("/auth/me", isLoggedIn);
routes.post("/users/:id/favorites", isLoggedIn, createFavorite);
routes.delete("/users/:user_id/favorites/:id", isLoggedIn, destroyFavorite);

module.exports = routes;
module.exports.isLoggedIn = isLoggedIn;
