const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');

const Categoria = sequelize.define('Categoria', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    nome: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: { notEmpty: true }
    }
}, {
    tableName: 'categorias',
    timestamps: false // Categorias são fixas, não precisam de timestamps
});

module.exports = Categoria;