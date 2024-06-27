const mongoose = require("mongoose");

require("dotenv").config();

mongoose.set("strictQuery", false);

const url = process.env.MONGODB_URL;

console.log("connecting to", url);
mongoose
  .connect(url)
  .then((result) => {
    console.log("connected to MongoDB");
  })
  .catch((error) => {
    console.log("error connecting to MongoDB:", error.message);
  });

const phoneSchema = new mongoose.Schema({
  name: {
    type: String,
    minLength: 2,
    required: true,
  },
  number: {
    type: String,

    validate: {
      validator: function val(p) {
        try {
          let [x, y] = p.split("-");
          if (x.toString().length > 3 || x.toString().length === 0) {
            return false;
          }
          if (y.toString().length < 2) {
            return false;
          }
        } catch (err) {
          return false;
        }
        return true;
      },

      message: (props) => `${props.value} is not a valid phone number!`,
    },
    required: true,
  },
  important: Boolean,
});

phoneSchema.set("toJSON", {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
  },
});

module.exports = mongoose.model("Phone", phoneSchema);
