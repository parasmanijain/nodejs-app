const Sequelize = require('sequelize');

const sequelize = require('../../08-added-the-add-to-cart-functionality/util/database');

const Order = sequelize.define('order', {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true
  }
});

module.exports = Order;
