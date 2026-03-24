const db = require("../models");
const Inquiry = db.inquiry;
const Artwork = db.artwork;

// Crear nueva inquiry
exports.create = async (req, res) => {
  try {
    // Validación básica
    if (!req.body.name || !req.body.email || !req.body.message) {
      return res.status(400).send({
        message: "Nombre, email y mensaje son requeridos"
      });
    }

    // Validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(req.body.email)) {
      return res.status(400).send({
        message: "Email inválido"
      });
    }

    const inquiry = await Inquiry.create({
      artwork_id: req.body.artwork_id || null,
      artwork_title: req.body.artwork_title || null,
      name: req.body.name,
      email: req.body.email,
      phone: req.body.phone || null,
      message: req.body.message,
      status: "nuevo"
    });

    res.status(201).send({
      message: "Inquiry creado exitosamente",
      data: inquiry
    });
  } catch (error) {
    res.status(500).send({
      message: error.message || "Error creando inquiry"
    });
  }
};

// Obtener todas las inquiries
exports.findAll = async (req, res) => {
  try {
    const inquiries = await Inquiry.findAll({
      include: [
        {
          model: Artwork,
          as: "artwork",
          attributes: ["id", "title", "main_image"]
        }
      ],
      order: [["created_at", "DESC"]]
    });

    res.status(200).send({
      data: inquiries
    });
  } catch (error) {
    res.status(500).send({
      message: error.message || "Error obteniendo inquiries"
    });
  }
};

// Obtener inquiry por ID
exports.findOne = async (req, res) => {
  try {
    const inquiry = await Inquiry.findByPk(req.params.id, {
      include: [
        {
          model: Artwork,
          as: "artwork",
          attributes: ["id", "title", "main_image"]
        }
      ]
    });

    if (!inquiry) {
      return res.status(404).send({
        message: "Inquiry no encontrado"
      });
    }

    res.status(200).send({
      data: inquiry
    });
  } catch (error) {
    res.status(500).send({
      message: error.message || "Error obteniendo inquiry"
    });
  }
};

// Actualizar status de inquiry
exports.update = async (req, res) => {
  try {
    const inquiry = await Inquiry.findByPk(req.params.id);

    if (!inquiry) {
      return res.status(404).send({
        message: "Inquiry no encontrado"
      });
    }

    // Solo permitir cambios en status
    if (req.body.status) {
      const validStatuses = ["nuevo", "contactado", "rechazado"];
      if (!validStatuses.includes(req.body.status)) {
        return res.status(400).send({
          message: "Status inválido. Valores permitidos: nuevo, contactado, rechazado"
        });
      }
      inquiry.status = req.body.status;
    }

    await inquiry.save();

    res.status(200).send({
      message: "Inquiry actualizado exitosamente",
      data: inquiry
    });
  } catch (error) {
    res.status(500).send({
      message: error.message || "Error actualizando inquiry"
    });
  }
};

// Eliminar inquiry
exports.delete = async (req, res) => {
  try {
    const inquiry = await Inquiry.findByPk(req.params.id);

    if (!inquiry) {
      return res.status(404).send({
        message: "Inquiry no encontrado"
      });
    }

    await inquiry.destroy();

    res.status(200).send({
      message: "Inquiry eliminado exitosamente"
    });
  } catch (error) {
    res.status(500).send({
      message: error.message || "Error eliminando inquiry"
    });
  }
};

// Obtener estadísticas de inquiries
exports.getStats = async (req, res) => {
  try {
    const total = await Inquiry.count();
    const nuevo = await Inquiry.count({ where: { status: "nuevo" } });
    const contactado = await Inquiry.count({ where: { status: "contactado" } });
    const rechazado = await Inquiry.count({ where: { status: "rechazado" } });

    res.status(200).send({
      data: {
        total,
        nuevo,
        contactado,
        rechazado
      }
    });
  } catch (error) {
    res.status(500).send({
      message: error.message || "Error obteniendo estadísticas"
    });
  }
};
