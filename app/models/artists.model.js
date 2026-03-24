module.exports = (sequelize, Sequelize) => {
  const Artist = sequelize.define(
    "artists",
    {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      name: {
        type: Sequelize.STRING(255)
      },
      bio_fr: {
        type: Sequelize.TEXT
      },
      photo_url: {
        type: Sequelize.STRING(255)
      },
      location: {
        type: Sequelize.STRING(100)
      }
    },
    {
      timestamps: false
    }
  );

  return Artist;
};
