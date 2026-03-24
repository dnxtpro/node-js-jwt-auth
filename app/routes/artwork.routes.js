const { authJwt } = require("../middleware");
const controller = require("../controllers/artwork.controller");
const upload = require("../middleware/upload");

module.exports = function(app) {
  app.get("/api/artworks", controller.findAll);
  app.get("/api/artworks/:id", controller.findOne);

  app.post("/api/artworks", [authJwt.verifyToken, upload.single("image")], controller.create);
  app.put("/api/artworks/:id", [authJwt.verifyToken, upload.single("image")], controller.update);
  app.delete("/api/artworks/:id", [authJwt.verifyToken], controller.remove);
};
