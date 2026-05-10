const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');

const AlunoHabilidade = sequelize.define('AlunoHabilidade', {
    nivel: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            min: 0,
            max: 10 // O banco recusa qualquer nota fora desse padrão!
        }
    }
}, {
    tableName: 'aluno_habilidade',
    timestamps: false
});

module.exports = AlunoHabilidade;