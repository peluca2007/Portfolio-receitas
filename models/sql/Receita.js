const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');

const Receita = sequelize.define('Receita', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    nome: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: { notEmpty: true }
    },
    descricao: {
        type: DataTypes.TEXT,
        allowNull: false,
        validate: { notEmpty: true }
    },
    link_externo: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: { notEmpty: true }
    }
}, {
    tableName: 'receitas',
    timestamps: true
});

module.exports = Receita;