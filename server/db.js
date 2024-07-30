const { client } = require("../srv/shared/shared");
const { uuid, bcrypt } = require("uuid");
const { jwt } = require("jsonwebtoken");

const createTables = async () => {
  const SQL = `
    DROP TABLE IF EXISTS favorites;
    DROP TABLE IF EXISTS users;
    DROP TABLE IF EXISTS products;
    CREATE TABLE users(
      id UUID PRIMARY KEY,
      username VARCHAR(20) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL
    );
    CREATE TABLE products(
      id UUID PRIMARY KEY,
      name VARCHAR(20)
    );
    CREATE TABLE favorites(
      id UUID PRIMARY KEY,
      user_id UUID REFERENCES users(id) NOT NULL,
      product_id UUID REFERENCES products(id) NOT NULL,
      CONSTRAINT unique_user_id_and_product_id UNIQUE (user_id, product_id)
    );
  `;
  await client.query(SQL);
  const [moe, lucy, ethyl, curly, foo, bar, bazz, quq, fip] = await Promise.all(
    [
      createUser({ username: "moe", password: "m_pw" }),
      createUser({ username: "lucy", password: "l_pw" }),
      createUser({ username: "ethyl", password: "e_pw" }),
      createUser({ username: "curly", password: "c_pw" }),
      createProduct({ name: "foo" }),
      createProduct({ name: "bar" }),
      createProduct({ name: "bazz" }),
      createProduct({ name: "quq" }),
      createProduct({ name: "fip" }),
    ]
  );

  console.log(await fetchUsers());
  console.log(await fetchProducts());

  console.log(await fetchFavorites(moe.id));
  const favorite = await createFavorite({
    user_id: moe.id,
    product_id: foo.id,
  });
};

app.use("/api", userRoutes);

const createUser = async ({ username, password }) => {
  const SQL = `
    INSERT INTO users(id, username, password) VALUES($1, $2, $3) RETURNING *
  `;
  const response = await client.query(SQL, [
    uuid.v4(),
    username,
    await bcrypt.hash(password, 5),
  ]);
  return response.rows[0];
};

const createProduct = async ({ name }) => {
  const SQL = `
    INSERT INTO products(id, name) VALUES($1, $2) RETURNING *
  `;
  const response = await client.query(SQL, [uuid.v4(), name]);
  return response.rows[0];
};

// const authenticate = async ({ username, password }) => {
//   const SQL = `
//     SELECT id, username FROM users WHERE username=$1;
//   `;
//   const response = await client.query(SQL, [username]);
//   if (!response.rows.length) {
//     const error = Error("not authorized");
//     error.status = 401;
//     throw error;
//   }
//   const match = await bcrypt.compare(password, response.rows[0].password);
//   if (!match) {
//     const error = Error("not authorized");
//     error.status = 401;
//     throw error;
//   }
//   const token = jwt.sign({ id: response.rows[0].id }, process.env.JWT_SECRET, {
//     expiresIn: "1h",
//   });
//   return { token };
// };

module.exports = {
  client,
  createTables,
  createUser,
  createProduct,
};
