const controller = require("../controllers/artist.controller");

module.exports = function(app) {
  app.get("/api/artists", controller.findAll);
};
