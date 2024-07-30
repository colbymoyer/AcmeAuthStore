const express = require("express");
const { app, client } = require("../srv/shared/shared");
const userRoutes = require("../srv/routes/userRoutes");

const PORT = process.env.PORT || 3000;

app.use(express.json());

app.listen(PORT, () => {
  console.log(`Server is running on PORT ${PORT}`);
  client.connect();
});

app.use("/api", userRoutes);
