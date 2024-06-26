const express = require("express");
const app = express();
require("dotenv").config();
const cors = require("cors");

app.use(cors());

app.get("/", (res, req) => {
  req.send("<h3>Hello </h3>");
});

app.listen(8080);
