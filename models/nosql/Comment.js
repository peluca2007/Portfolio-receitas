const mongoose = require('mongoose');

const CommentSchema = new mongoose.Schema({
    // Relaciona o comentário à receita do SQLite
    receita_id: {
        type: Number,
        required: true
    },
    autor: {
        type: String,
        required: true,
        trim: true,
        minlength: 1
    },
    texto: {
        type: String,
        required: true,
        trim: true,
        minlength: 1
    },
    // Se for um usuário externo anônimo, o valor permanecerá null
    usuario_id: {
        type: Number,
        default: null
    },
    is_admin: {
        type: Boolean,
        default: false
    },
    data: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Comment', CommentSchema);