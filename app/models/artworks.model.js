module.exports = (sequelize, Sequelize) => {
  const Artwork = sequelize.define(
    "artworks",
    {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      artist_id: {
        type: Sequelize.INTEGER,
        references: {
          model: "artists",
          key: "id"
        }
      },
      title: {
        type: Sequelize.STRING(255)
      },
      description_fr: {
        type: Sequelize.TEXT
      },
      technique_id: {
        type: Sequelize.INTEGER,
        references: {
          model: "techniques",
          key: "id"
        },
        allowNull: true
      },
      technique: {
        type: Sequelize.STRING(100)
      },
      dimensions: {
        type: Sequelize.STRING(50)
      },
      price: {
        type: Sequelize.DECIMAL(10, 2)
      },
      main_image: {
        type: Sequelize.STRING(255)
      },
      images: {
        type: Sequelize.JSON,
        defaultValue: [],
        comment: "Array de objetos: [{url: string, isPrimary: boolean}]"
      },
      primary_image_index: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
        comment: "Índice de la imagen principal en el array images"
      },
      status: {
        type: Sequelize.ENUM("disponible", "reservado", "vendido"),
        defaultValue: "disponible"
      },
      created_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP")
      }
    },
    {
      timestamps: false
    }
  );

  return Artwork;
};
