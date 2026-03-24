module.exports = (sequelize, Sequelize) => {
  const Technique = sequelize.define(
    "techniques",
    {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      name: {
        type: Sequelize.STRING(120),
        unique: true,
        allowNull: false
      }
    },
    {
      timestamps: false
    }
  );

  return Technique;
};
