module.exports = (sequelize, Sequelize) => {
  const Inquiry = sequelize.define(
    "inquiries",
    {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      artwork_id: {
        type: Sequelize.INTEGER,
        references: {
          model: "artworks",
          key: "id"
        },
        allowNull: true
      },
      artwork_title: {
        type: Sequelize.STRING(255)
      },
      name: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      email: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      phone: {
        type: Sequelize.STRING(20),
        allowNull: true
      },
      message: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      status: {
        type: Sequelize.ENUM("nuevo", "contactado", "rechazado"),
        defaultValue: "nuevo"
      },
      created_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP")
      },
      updated_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
        onUpdate: Sequelize.literal("CURRENT_TIMESTAMP")
      }
    },
    {
      timestamps: false
    }
  );

  return Inquiry;
};
