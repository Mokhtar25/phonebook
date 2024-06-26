require("dotenv").config();

const express = require("express");

const app = express();

app.use(express.static("dist"));

const Note = require("./mongo");

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
  console.error(error);
  if (error.name === "CastError") {
    return response.status(400).send({ error: "malformatted id" });
  } else if (error.name === "ValidationError") {
    return response.status(400).json({ error: error.message });
  } else if (error.name === "Conflict") {
    return response.status(409).json({ error: error.message });
  }
  next(error);
};

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: "unknown endpoint" });
};

// to get them as json
// Note.find({ content: { $eq: "typescript" } }).then((e) =>
//   console.log(e[0].toJSON()),
// );
//
app.get("/api/notes", (req, res) => {
  Note.find().then((e) => res.json(e));
});

// Note.deleteMany({ content: { $eq: "" } }).then((re) =>
//   console.log("detlet", re),
// );
app.post("/api/notes", async (req, res, next) => {
  const data = req.body;

  if (!data.content) {
    console.log("error");

    return res.status(400).json({ error: "content missing" });
  }

  const z = await Note.find({ content: data.content });

  if (z.length !== 0) {
    const err = new Error("The note is already in the database");
    err.name = "Conflict";
    err.status = 409;
    return next(err);
  }

  const note = new Note({
    important: data.important || false,
    content: data.content,
  });

  note
    .save()
    .then((sav) => res.json(sav))
    .catch((err) => next(err));
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
  const { content, important } = req.body;

  Note.findByIdAndUpdate(
    req.params.id,
    { content, important },
    { new: true, runValidators: true, context: "query" },
  )
    .then((up) => res.json(up))
    .catch((err) => next(err));
});

app.use(unknownEndpoint);
app.use(errorHandler);
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
