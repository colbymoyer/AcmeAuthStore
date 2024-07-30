const express = require("express");
const app = express();
app.use(express.json());
const routes = require("express").Router();
const uuid = require("uuid");
const pg = require("pg");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const client = new pg.Client(
  process.env.DATABASE_URL || "postgres://localhost/acme_auth_store_db"
);

module.exports = {
  client,
  jwt,
  bcrypt,
  routes,
  app,
  uuid,
};
