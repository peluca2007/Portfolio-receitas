const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');

const ReceitaAluno = sequelize.define('ReceitaAluno', {
    criador: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    }
}, {
    tableName: 'receita_aluno',
    timestamps: false
});

module.exports = ReceitaAluno;