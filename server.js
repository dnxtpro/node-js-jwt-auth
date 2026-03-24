const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();

var corsOptions = {
  origin: "http://localhost:5173"
};

app.use(cors(corsOptions));

// parse requests of content-type - application/json
app.use(express.json());

// parse requests of content-type - application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// database
const db = require("./app/models");
const Role = db.role;
const Technique = db.technique;
const Artwork = db.artwork;

db.sequelize.sync({ alter: true }).then(async () => {
  await initial();
  await backfillTechniques();
});
// force: true will drop the table if it already exists
// db.sequelize.sync({force: true}).then(() => {
//   console.log('Drop and Resync Database with { force: true }');
//   initial();
// });

// simple route
app.get("/", (req, res) => {
  res.json({ message: "Welcome to bezkoder application." });
});

// routes
require('./app/routes/auth.routes')(app);
require('./app/routes/user.routes')(app);
require('./app/routes/artwork.routes')(app);
require('./app/routes/artist.routes')(app);
require('./app/routes/technique.routes')(app);
require('./app/routes/inquiry.routes')(app);

// set port, listen for requests
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});

async function initial() {
  const defaults = [
    { id: 1, name: "user" },
    { id: 2, name: "moderator" },
    { id: 3, name: "admin" }
  ];

  for (const role of defaults) {
    const existing = await Role.findByPk(role.id);
    if (!existing) {
      await Role.create(role);
    }
  }
}

async function backfillTechniques() {
  const artworks = await Artwork.findAll();

  for (const artwork of artworks) {
    if (artwork.technique_id || !artwork.technique) {
      continue;
    }

    const [technique] = await Technique.findOrCreate({
      where: { name: artwork.technique.trim() },
      defaults: { name: artwork.technique.trim() }
    });

    await artwork.update({ technique_id: technique.id });
  }
}