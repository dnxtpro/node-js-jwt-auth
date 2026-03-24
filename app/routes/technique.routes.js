const controller = require("../controllers/technique.controller");

module.exports = function(app) {
  app.get("/api/techniques", controller.findAll);
};
