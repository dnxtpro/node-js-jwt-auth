const config = require("../config/db.config.js");

const Sequelize = require("sequelize");
const sequelize = new Sequelize(
  config.DB,
  config.USER,
  config.PASSWORD,
  {
    host: config.HOST,
    dialect: config.dialect,
    pool: {
      max: config.pool.max,
      min: config.pool.min,
      acquire: config.pool.acquire,
      idle: config.pool.idle
    }
  }
);

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

db.user = require("../models/user.model.js")(sequelize, Sequelize);
db.role = require("../models/role.model.js")(sequelize, Sequelize);
db.artist = require("../models/artists.model.js")(sequelize, Sequelize);
db.technique = require("../models/techniques.model.js")(sequelize, Sequelize);
db.artwork = require("../models/artworks.model.js")(sequelize, Sequelize);
db.order = require("../models/orders.model.js")(sequelize, Sequelize);
db.inquiry = require("../models/inquiries.model.js")(sequelize, Sequelize);

db.role.belongsToMany(db.user, {
  through: "user_roles"
});
db.user.belongsToMany(db.role, {
  through: "user_roles"
});

db.artist.hasMany(db.artwork, {
  foreignKey: "artist_id",
  as: "artworks"
});
db.artwork.belongsTo(db.artist, {
  foreignKey: "artist_id",
  as: "artist"
});

db.technique.hasMany(db.artwork, {
  foreignKey: "technique_id",
  as: "artworks"
});
db.artwork.belongsTo(db.technique, {
  foreignKey: "technique_id",
  as: "technique_details"
});

db.artwork.hasMany(db.order, {
  foreignKey: "artwork_id",
  as: "orders"
});
db.order.belongsTo(db.artwork, {
  foreignKey: "artwork_id",
  as: "artwork"
});

db.artwork.hasMany(db.inquiry, {
  foreignKey: "artwork_id",
  as: "inquiries"
});
db.inquiry.belongsTo(db.artwork, {
  foreignKey: "artwork_id",
  as: "artwork"
});

db.ROLES = ["user", "admin", "moderator"];

module.exports = db;
