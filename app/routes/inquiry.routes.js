const { authJwt } = require("../middleware");
const controller = require("../controllers/inquiry.controller");

module.exports = function(app) {
  // Crear nueva inquiry (público)
  app.post("/api/inquiries", controller.create);

  // Obtener todas las inquiries (admin)
  app.get("/api/inquiries", [authJwt.verifyToken], controller.findAll);

  // Obtener inquiry por ID (admin)
  app.get("/api/inquiries/:id", [authJwt.verifyToken], controller.findOne);

  // Actualizar status de inquiry (admin)
  app.put("/api/inquiries/:id", [authJwt.verifyToken], controller.update);

  // Eliminar inquiry (admin)
  app.delete(
    "/api/inquiries/:id",
    [authJwt.verifyToken],
    controller.delete
  );

  // Obtener estadísticas (admin)
  app.get("/api/inquiries/stats/all", [authJwt.verifyToken], controller.getStats);
};
