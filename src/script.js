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
const errorHandler = (error, request, response, next) => {
  console.error(error.message);

  if (error.name === "CastError") {
    return response.status(400).send({ error: "malformatted id" });
  }

  next(error);
};

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: "unknown endpoint" });
};

app.get("/api/notes", (req, res) => {
  Note.find().then((e) => res.json(e));
});

// Note.deleteMany({ content: { $eq: "" } }).then((re) =>
//   console.log("detlet", re),
// );
app.post("/api/notes", (req, res) => {
  const data = req.body;

  if (!data.content) {
    console.log("error");

    return res.status(400).json({ error: "content missing" });
  }

  const note = new Note({
    important: data.important || false,
    content: data.content,
  });

  note.save().then((sav) => res.json(sav));
});

app.get("/api/notes/:id", (req, res, next) => {
  Note.findById(req.params.id)
    .then((item) => (item ? res.json(item) : res.status(404).end()))
    .catch((err) => next(err));
});

app.delete("/api/notes/:id", (req, res, next) => {
  Note.findByIdAndDelete(req.params.id)
    .then((back) => res.status(200).end())
    .catch((er) => next(er));
});

app.put("/api/notes/:id", (req, res, next) => {
  const body = req.body;

  if (!body.content) {
    return res.status(400).json({ error: "missing content" });
  }

  const note = {
    content: body.content,
    important: body.important,
  };

  Note.findByIdAndUpdate(req.params.id, note, { new: true })
    .then((up) => res.json(up))
    .catch((err) => next(err));
});

app.use(unknownEndpoint);
app.use(errorHandler);
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
