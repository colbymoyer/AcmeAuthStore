const { bcrypt, client, uuid, jwt } = require("../shared/shared");
const JWT = process.env.JWT || "123456";

const registerUser = async ({ username, password }) => {
  const hashPassword = await bcrypt.hash(password, 10);
  const SQL = `
    INSERT INTO users(id, username, password) VALUES($1, $2, $3) RETURNING *;
  `;
  const response = await client.query(SQL, [uuid.v4(), username, hashPassword]);

  const token = await jwt.sign({ id: response.rows[0].id }, JWT, {
    expiresIn: "1h",
  });
  return token;
};

const getAllUser = async () => {
  const SQL = `
        SELECT * FROM users;
  `;
  const response = await client.query(SQL);
  return response.rows;
};

const findUserWithToken = async (header) => {
  console.log(header);
  const token = header?.split(" ")[1];
  let id = "";
  try {
    const payload = await jwt.verify(token, JWT);
    id = payload.id;
  } catch (ex) {
    const error = Error("Not Authorized");
    error.status = 404;
    throw error;
  }

  const SQL = `
    SELECT id, username FROM users where id = $1;
  `;

  const response = await client.query(SQL, [id]);

  return response.rows[0];
};

const authenticate = async ({ username, password }) => {
  const SQL = `
    SELECT id, username, password FROM users WHERE username=$1;
  `;
  const response = await client.query(SQL, [username]);
  if (!response.rows.length) {
    const error = Error("not authorized");
    error.status = 401;
    throw error;
  }
  const match = await bcrypt.compare(password, response.rows[0].password);
  if (!match) {
    const error = Error("not authorized");
    error.status = 401;
    throw error;
  }
  const token = jwt.sign({ id: response.rows[0].id }, JWT, {
    expiresIn: "1h",
  });
  return { token };
};

module.exports = {
  registerUser,
  getAllUser,
  findUserWithToken,
  authenticate,
};
