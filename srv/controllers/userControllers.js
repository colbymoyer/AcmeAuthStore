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
