const express = require("express");
require("dotenv").config();
const App = express();
const path = require("path");
const method = require("method-override");
const { locations, descriptors, places } = require("./seeds");
const morgan = require("morgan");
const Joi = require("joi");

App.use(method("_method"));
App.set("views", path.join(__dirname + "/views"));
App.use(express.static(path.join(__dirname + "/public")));
App.set("view engine", "ejs");

App.use(express.urlencoded({ extended: true }));
App.use(morgan("dev"));
App.use((req, res, next) => {
  const CheckData = Joi.object({
    title: Joi.string().alphanum().min(3).max(35),
    price: Joi.number().min(1),
  });
  const Verification = CheckData.validate({
    title: req.body.title,
    price: req.body.price,
  });
  Verification.error ? res.send(Verification.error.details[0].message) : next();
});
const Mongo = require("mongoose");
const map = require("./models/map");

Mongo.connect("mongodb://127.0.0.1:27017/campapp");
Mongo.connection.on("error", () =>
  console.error("Database Connection Failed!")
);
Mongo.connection.on("open", () => console.log("Connected"));

App.get("/", (req, res) => res.redirect("/camps"));

App.get("/camps", (req, res) => {
  map.find({}, function (err, data) {
    if (err) {
      res.send("Error Connecting to Database!");
    } else {
      res.render("Home", { data });
    }
  });
});
App.get("/camps/new", (req, res) => {
  res.render("New_Camp");
});

App.get("/camps/:id/edit", async (req, res) => {
  const { id } = req.params;
  const data = await map.findById(id).catch((err) => {
    return false;
  });
  console.log(data);
  data
    ? res.render("EditCamp", { camp: data })
    : res.status(404).render("Error", { error: "Not Found" });
});

App.put("/camps/:id/edit", async (req, res) => {
  try {
    const { id } = req.params;

    const { title, location, price } = req.body.camp;
    const status = await map
      .findByIdAndUpdate(id, {
        $set: {
          title: title,
          location: location,
          price: price,
        },
      })
      .catch(() => {
        return false;
      });

    status ? res.send("Updated") : res.send("Error Found");
  } catch (e) {
    res.status(404).render("Error", { error: "403" });
  }
});

App.delete("/camps/:id/delete", async (req, res) => {
  const { id } = req.params;
  const Status = await map.findByIdAndDelete(id).catch((err) => {
    return false;
  });
  Status
    ? res.redirect("/camps")
    : res.status(404).render("Error", { error: "Error Removing" });
});

App.get("/camps/:id", async (req, res) => {
  const { id } = req.params;
  map.findById(id, (err, data) => {
    if (err) {
      res.status(404).render("Error", { error: "404" });
    } else {
      data
        ? res.render("SingleCamp", { camp: data })
        : res.status(404).render("Error", { error: "Camp Not Found" });
    }
  });
});

App.post("/camps/new", async (req, res) => {
  console.log(req.body);
  const { place, location, price } = req.body.camp;
  const status = await map.create({
    title: place,
    location: location,
    price: price,
  });
  status
    ? res.send("Successfully Added Camp")
    : res.status(404).render("Error", { error: "Failed" });
});

App.get("/seeder", async (req, res) => {
  await map.deleteMany({});
  for (let i = 0; i <= 50; i++) {
    const place = Math.floor(Math.random() * places.length);
    const description = Math.floor(Math.random() * descriptors.length);
    const random = Math.floor(Math.random() * 1000);
    seed = locations[random];

    map.create({
      location: `City is ${seed.city} and State is ${seed.state}`,
      title: `${places[place]} ${descriptors[description]}`,
      price: Math.floor(Math.random() * 1000),
      image: "https://source.unsplash.com/collection/483251",
      description:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis pharetra felis a erat aliquam dapibus. In eget urna velit. Nam sed sagittis odio. Suspendisse eleifend, erat eu varius fermentum, libero nibh euismod ex, nec lobortis dolor tellus in tellus. Mauris magna lorem, venenatis vitae bibendum eu, mollis et orci.",
    });
  }
  res.send("Done");
}); // This Route is for Seeding Fake Data
App.all("*", (req, res) => {
  res.status(404).render("Error", { error: "404" });
});
App.use((req, res, next) => {
  res.send("404! Not Found");
});

App.listen(process.env.PORT || 3000, () => {
  console.log(`Server Started at ${process.env.PORT || 3000} `);
});
