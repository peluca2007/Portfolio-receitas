const mongoose = require('mongoose');

mongoose.set('bufferCommands', false);
mongoose.set('bufferTimeoutMS', 2000);

const connectMongo = async () => {
    try {
        // Liga ao banco local na base de dados 'portfolio_receitas'
        await mongoose.connect('mongodb://127.0.0.1:27017/portfolio_receitas', {
            serverSelectionTimeoutMS: 5000,
            connectTimeoutMS: 5000
        });
        console.log(' MongoDB (Mongoose) ligado com sucesso!');
        return true;
    } catch (error) {
        console.error(' Erro ao ligar ao MongoDB:', error);
        return false;
    }
};

module.exports = connectMongo;