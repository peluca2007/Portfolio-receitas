const mongoose = require('mongoose');

const connectMongo = async () => {
    try {
        // Liga ao banco local na base de dados 'portfolio_receitas'
        await mongoose.connect('mongodb://127.0.0.1:27017/portfolio_receitas');
        console.log(' MongoDB (Mongoose) ligado com sucesso!');
    } catch (error) {
        console.error(' Erro ao ligar ao MongoDB:', error);
        process.exit(1); // Fecha a app se o banco não ligar
    }
};

module.exports = connectMongo;