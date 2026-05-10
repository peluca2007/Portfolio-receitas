const { Sequelize } = require('sequelize');

const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: './database.sqlite', // Cria o arquivo do banco na raiz do projeto
    logging: false 
});

module.exports = sequelize; 