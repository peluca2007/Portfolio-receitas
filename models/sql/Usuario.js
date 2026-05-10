const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');

const Usuario = sequelize.define('Usuario', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    nome: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: { notEmpty: true } // Impede string vazia ""
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: { isEmail: true, notEmpty: true }
    },
    senha: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: { notEmpty: true }
    },
    isAdmin: {
        type: DataTypes.BOOLEAN,
        defaultValue: false // Por padrão, todo mundo que loga é aluno
    }
}, {
    tableName: 'usuarios',
    timestamps: true // Cria campos de data de criação e atualização
});

module.exports = Usuario;