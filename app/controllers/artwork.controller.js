const db = require("../models");

const Artwork = db.artwork;
const Artist = db.artist;
const Technique = db.technique;
const includeArtist = {
  model: Artist,
  as: "artist",
  attributes: ["id", "name", "bio_fr", "photo_url", "location"]
};
const includeTechnique = {
  model: Technique,
  as: "technique_details",
  attributes: ["id", "name"]
};

const toArtworkResponse = (artwork) => {
  const raw = artwork.toJSON();
  return {
    id: raw.id,
    title: raw.title,
    description_fr: raw.description_fr,
    technique_id: raw.technique_id || raw.technique_details?.id || null,
    technique: raw.technique_details?.name || raw.technique || "",
    technique_details: raw.technique_details || null,
    dimensions: raw.dimensions,
    price: raw.price,
    main_image: raw.main_image,
    images: raw.images || [],
    primary_image_index: raw.primary_image_index || 0,
    status: raw.status,
    created_at: raw.created_at,
    artist_id: raw.artist_id,
    artist: raw.artist ? raw.artist.name : "",
    artist_details: raw.artist || null
  };
};

const parsePrice = (priceInput) => {
  if (typeof priceInput === "number") {
    return priceInput;
  }

  if (typeof priceInput !== "string") {
    return NaN;
  }

  const normalized = priceInput.replace(/[^0-9.,-]/g, "").replace(",", ".");
  return Number(normalized);
};

const resolveArtistId = async (artistId, artistName) => {
  if (artistId) {
    const artist = await Artist.findByPk(artistId);
    if (!artist) {
      return null;
    }

    return artist.id;
  }

  if (!artistName) {
    return null;
  }

  const [artist] = await Artist.findOrCreate({
    where: { name: artistName },
    defaults: { name: artistName }
  });

  return artist.id;
};

const resolveTechnique = async (techniqueId, techniqueName) => {
  if (techniqueId) {
    const technique = await Technique.findByPk(techniqueId);
    if (!technique) {
      return null;
    }

    return technique;
  }

  if (!techniqueName || !techniqueName.trim()) {
    return null;
  }

  const [technique] = await Technique.findOrCreate({
    where: { name: techniqueName.trim() },
    defaults: { name: techniqueName.trim() }
  });

  return technique;
};

const buildImagePath = (req) => {
  if (req.file?.filename) {
    return `/uploads/${req.file.filename}`;
  }

  if (typeof req.body.main_image === "string" && req.body.main_image.trim()) {
    return req.body.main_image.trim();
  }

  if (typeof req.body.image === "string" && req.body.image.trim()) {
    return req.body.image.trim();
  }

  return "";
};

exports.findAll = async (req, res) => {
  try {
    const where = {};
    const include = [{ ...includeArtist }, { ...includeTechnique }];

    if (req.query.status) {
      where.status = req.query.status;
    }

    if (req.query.technique) {
      include[1].where = { name: req.query.technique };
    }

    if (req.query.artiste) {
      include[0].where = { name: req.query.artiste };
    }

    const artworks = await Artwork.findAll({
      where,
      include
    });

    const sortedArtworks = [...artworks].sort(
      (first, second) => new Date(second.created_at) - new Date(first.created_at)
    );

    res.status(200).send(sortedArtworks.map(toArtworkResponse));
  } catch (error) {
    res.status(500).send({ message: error.message || "Error retrieving artworks." });
  }
};

exports.findOne = async (req, res) => {
  try {
    const artwork = await Artwork.findByPk(req.params.id, { include: [includeArtist, includeTechnique] });

    if (!artwork) {
      return res.status(404).send({ message: "Artwork not found." });
    }

    res.status(200).send(toArtworkResponse(artwork));
  } catch (error) {
    res.status(500).send({ message: error.message || "Error retrieving artwork." });
  }
};

exports.create = async (req, res) => {
  try {
    const artistId = await resolveArtistId(req.body.artist_id, req.body.artist);
    const technique = await resolveTechnique(req.body.technique_id, req.body.technique);
    const price = parsePrice(req.body.price);
    const mainImage = buildImagePath(req);

    if (!artistId || !technique || !req.body.title || Number.isNaN(price) || !mainImage) {
      return res.status(400).send({
        message: "Fields artist/technique/title/price/main_image are required and must be valid."
      });
    }

    // Procesar múltiples imágenes si se proporcionan
    let images = [];
    let primaryImageIndex = 0;
    
    if (req.body.images && typeof req.body.images === 'string') {
      try {
        const parsedImages = JSON.parse(req.body.images);
        images = Array.isArray(parsedImages) ? parsedImages : [];
        primaryImageIndex = parseInt(req.body.primary_image_index || 0, 10);
      } catch (e) {
        images = [];
      }
    }
    
    // Si no hay imágenes en array, usar main_image como principal
    if (images.length === 0) {
      images = [{ url: mainImage, isPrimary: true }];
      primaryImageIndex = 0;
    }

    const artwork = await Artwork.create({
      artist_id: artistId,
      title: req.body.title,
      description_fr: req.body.description_fr || "",
      technique_id: technique.id,
      technique: technique.name,
      dimensions: req.body.dimensions || "",
      price,
      main_image: mainImage,
      images,
      primary_image_index: primaryImageIndex,
      status: req.body.status || "disponible"
    });

    const created = await Artwork.findByPk(artwork.id, { include: [includeArtist, includeTechnique] });
    res.status(201).send(toArtworkResponse(created));
  } catch (error) {
    res.status(500).send({ message: error.message || "Error creating artwork." });
  }
};

exports.update = async (req, res) => {
  try {
    const artwork = await Artwork.findByPk(req.params.id);

    if (!artwork) {
      return res.status(404).send({ message: "Artwork not found." });
    }

    const artistId = await resolveArtistId(req.body.artist_id, req.body.artist);
    const parsedPrice = req.body.price !== undefined ? parsePrice(req.body.price) : artwork.price;
    const technique = await resolveTechnique(req.body.technique_id, req.body.technique);

    if (req.body.price !== undefined && Number.isNaN(parsedPrice)) {
      return res.status(400).send({ message: "Invalid price value." });
    }

    const mainImage = buildImagePath(req);
    
    // Procesar múltiples imágenes si se proporcionan
    let images = artwork.images || [];
    let primaryImageIndex = artwork.primary_image_index || 0;
    
    if (req.body.images && typeof req.body.images === 'string') {
      try {
        const parsedImages = JSON.parse(req.body.images);
        images = Array.isArray(parsedImages) ? parsedImages : images;
        primaryImageIndex = parseInt(req.body.primary_image_index || primaryImageIndex, 10);
      } catch (e) {
        // Mantener imágenes existentes si hay error de parseo
      }
    }

    await artwork.update({
      artist_id: artistId || artwork.artist_id,
      title: req.body.title !== undefined ? req.body.title : artwork.title,
      description_fr: req.body.description_fr !== undefined ? req.body.description_fr : artwork.description_fr,
      technique_id: technique ? technique.id : artwork.technique_id,
      technique: technique ? technique.name : artwork.technique,
      dimensions: req.body.dimensions !== undefined ? req.body.dimensions : artwork.dimensions,
      price: parsedPrice,
      main_image: mainImage || artwork.main_image,
      images,
      primary_image_index: primaryImageIndex,
      status: req.body.status !== undefined ? req.body.status : artwork.status
    });

    const updated = await Artwork.findByPk(artwork.id, { include: [includeArtist, includeTechnique] });
    res.status(200).send(toArtworkResponse(updated));
  } catch (error) {
    res.status(500).send({ message: error.message || "Error updating artwork." });
  }
};

exports.remove = async (req, res) => {
  try {
    const artwork = await Artwork.findByPk(req.params.id);

    if (!artwork) {
      return res.status(404).send({ message: "Artwork not found." });
    }

    await artwork.destroy();
    res.status(200).send({ message: "Artwork deleted successfully." });
  } catch (error) {
    res.status(500).send({ message: error.message || "Error deleting artwork." });
  }
};
