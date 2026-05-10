const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
    receitaId: {
        type: Number, // Guarda o ID da receita que vem lá do SQLite
        required: true
    },
    autor: {
        type: String,
        required: true,
        default: 'Anônimo'
    },
    texto: {
        type: String,
        required: true
    },
    dataCriacao: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Comment', commentSchema);