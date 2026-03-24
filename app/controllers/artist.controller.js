const db = require("../models");

const Artist = db.artist;

exports.findAll = async (_req, res) => {
  try {
    const artists = await Artist.findAll({
      attributes: ["id", "name", "bio_fr", "photo_url", "location"],
      order: [["name", "ASC"]]
    });

    res.status(200).send(artists);
  } catch (error) {
    res.status(500).send({ message: error.message || "Error retrieving artists." });
  }
};
