require("dotenv").config();

console.log(process.env.MONGODB_URL);
const express = require("express");

const app = express();

app.use(express.static("dist"));

const Note = require("./mongo");
console.log("note", Note);

const requestLogger = (request, response, next) => {
  console.log("Method:", request.method);
  console.log("Path:  ", request.path);
  console.log("Body:  ", request.body);
  console.log("---");
  next();
};

const cors = require("cors");

app.use(cors());

app.use(express.json());
app.use(requestLogger);

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: "unknown endpoint" });
};

app.get("/api/notes", (req, res) => {
  Note.find().then((e) => res.json(e));
});

app.post("/api/notes", (req, res) => {
  const data = req.body;
  console.log(data);

  if (!data.content) {
    console.log("error");

    res.status(400).json({ error: "content missing" });
  }

  const note = new Note({
    important: data.important || false,
    content: data.content,
  });

  note.save().then((sav) => res.json(sav));
});

app.use(unknownEndpoint);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
