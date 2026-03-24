const db = require("../models");

const Technique = db.technique;

exports.findAll = async (_req, res) => {
  try {
    const techniques = await Technique.findAll({
      attributes: ["id", "name"],
      order: [["name", "ASC"]]
    });

    res.status(200).send(techniques);
  } catch (error) {
    res.status(500).send({ message: error.message || "Error retrieving techniques." });
  }
};
