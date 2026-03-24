module.exports = (sequelize, Sequelize) => {
  const Order = sequelize.define(
    "orders",
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
        }
      },
      customer_name: {
        type: Sequelize.STRING(255)
      },
      customer_email: {
        type: Sequelize.STRING(255)
      },
      amount_paid: {
        type: Sequelize.DECIMAL(10, 2)
      },
      payment_status: {
        type: Sequelize.ENUM("pending", "completed", "failed")
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

  return Order;
};
