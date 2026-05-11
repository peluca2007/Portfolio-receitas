const Comment = require('../models/nosql/Comment'); // Importa o model do Mongoose (MongoDB)
const { Receita } = require('../models/sql');       // Importa o model do Sequelize (SQLite)

class CommentController {
    // 1. CREATE - Adiciona um comentário a uma receita
    static async adicionar(req, res) {
        const { receita_id, autor, texto } = req.body;

        // Validação básica (Dica 4)
        if (!receita_id || !autor || !texto || texto.trim() === '') {
            return res.status(400).json({ erro: 'Informe o ID da receita, o autor e o texto do comentário!' });
        }

        try {
            // Integração Híbrida: Verifica no SQLite se a receita existe antes de salvar no MongoDB
            const receitaExiste = await Receita.findByPk(receita_id);
            if (!receitaExiste) {
                return res.status(404).json({ erro: 'Não é possível comentar: Receita não encontrada no SQLite.' });
            }

            // Cria e salva o comentário no MongoDB
            const novoComentario = new Comment({
                receita_id,
                autor,
                texto,
                data: new Date()
            });

            await novoComentario.save();

            return res.status(201).json({
                sucesso: true,
                mensagem: 'Comentário adicionado com sucesso no MongoDB!',
                comentario: novoComentario
            });

        } catch (error) {
            console.error(error);
            return res.status(500).json({ erro: 'Erro interno ao salvar o comentário.' });
        }
    }

    // 2. READ - Lista todos os comentários de uma receita específica
    static async listarPorReceita(req, res) {
        const { receita_id } = req.params;

        try {
            // Busca direto no MongoDB todos os documentos com esse ID
            const comentarios = await Comment.find({ receita_id }).sort({ data: -1 }); // -1 traz os mais recentes primeiro

            return res.status(200).json(comentarios);
        } catch (error) {
            console.error(error);
            return res.status(500).json({ erro: 'Erro ao buscar comentários no MongoDB.' });
        }
    }
}

module.exports = CommentController;