const mongo = require("mongoose");
const { Schema } = mongo;

const Map = new Schema({
  title: String,
  price: Number,
  image: String,
  description: String,
  location: String,
});

module.exports = mongo.model("Camps", Map);
