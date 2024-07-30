const {
  registerUser,
  getAllUser,
  authenticate,
} = require("../queries/userQueries");
const { client } = require("../shared/shared");
const uuid = require("uuid");
const register = async (req, res, next) => {
  const token = await registerUser(req.body);
  res.send(token);
};

const displayAll = async (req, res, next) => {
  const users = await getAllUser();
  res.send(users);
};

// app.post("/api/auth/login", async (req, res, next) => {
//   try {
//     res.send(await authenticate(req.body));
//   } catch (ex) {
//     next(ex);
//   }
// });

// app.get("/api/users", async (req, res, next) => {
//   try {
//     res.send(await fetchUsers());
//   } catch (ex) {
//     next(ex);
//   }
// });

// app.get("/api/auth/me", isLoggedIn, async (req, res, next) => {
//   try {
//     res.send(await findUserWithToken(req.headers.authorization));
//   } catch (ex) {
//     next(ex);
//   }
// });

// app.get("/api/users/:id/favorites", isLoggedIn, async (req, res, next) => {
//   try {
//     res.send(await fetchFavorites(req.params.id));
//   } catch (ex) {
//     next(ex);
//   }
// });

// app.get("/api/products", async (req, res, next) => {
//   try {
//     res.send(await fetchProducts());
//   } catch (ex) {
//     next(ex);
//   }
// });

// app.post("/api/users/:id/favorites", isLoggedIn, async (req, res, next) => {
//   try {
//     if (req.params.id !== req.user.id) {
//       const error = Error("not authorized");
//       error.status = 401;
//       throw error;
//     }
//     res.status(201).send(
//       await createFavorite({
//         user_id: req.params.id,
//         product_id: req.body.product_id,
//       })
//     );
//   } catch (ex) {
//     next(ex);
//   }
// });

// app.delete(
//   "/api/users/:user_id/favorites/:id",
//   isLoggedIn,
//   async (req, res, next) => {
//     try {
//       if (req.params.user_id !== req.user.id) {
//         const error = Error("not authorized");
//         error.status = 401;
//         throw error;
//       }
//       await destroyFavorite({ user_id: req.params.user_id, id: req.params.id });
//       res.sendStatus(204);
//     } catch (ex) {
//       next(ex);
//     }
//   }
// );

const login = async (req, res, next) => {
  const users = await authenticate(req.body);
  res.send(users);
};

const fetchUsers = async (req, res, next) => {
  const usersFetch = await getAllUser(req.body);
  res.send(usersFetch);
};

const fetchProducts = async (req, res, next) => {
  const productsList = await getProducts();
  res.send(productsList);
};
const getProducts = async () => {
  const SQL = `
    SELECT * FROM products;
  `;
  const response = await client.query(SQL);
  return response.rows;
};

const fetchFavorites = async (req, res, next) => {
  const userId = req.user.id;
  const favorites = await fFavorites(userId);
  res.send(favorites);
};
const fFavorites = async (user_id) => {
  const SQL = `
    SELECT * FROM favorites where user_id = $1
  `;
  const response = await client.query(SQL, [user_id]);
  return response.rows;
};

const createFavorite = async (req, res, next) => {
  const userId = req.user.id;
  const productId = req.body.product_id;

  console.log("Product ID received:", productId);

  const favorite = await cFavorite({ user_id: userId, product_id: productId });
  res.send(favorite);
};
const cFavorite = async ({ user_id, product_id }) => {
  const SQL = `
    INSERT INTO favorites(id, user_id, product_id) VALUES($1, $2, $3) RETURNING *
  `;
  console.log(product_id);
  const response = await client.query(SQL, [uuid.v4(), user_id, product_id]);
  return response.rows[0];
};

const destroyFavorite = async (req, res, next) => {
  const deleteFavorites = await dFavorite();
  res.send(deleteFavorites);
};
const dFavorite = async (user_id, id) => {
  const SQL = `
    DELETE FROM favorites WHERE user_id=$1 AND id=$2
  `;
  await client.query(SQL, [user_id, id]);
};

module.exports = {
  register,
  displayAll,
  login,
  fetchUsers,
  fetchFavorites,
  fetchProducts,
  createFavorite,
  destroyFavorite,
};
