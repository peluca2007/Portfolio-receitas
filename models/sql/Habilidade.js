const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');

const Habilidade = sequelize.define('Habilidade', {
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
    tableName: 'habilidades',
    timestamps: false
});

module.exports = Habilidade;