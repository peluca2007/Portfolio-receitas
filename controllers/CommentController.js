const Comment = require('../models/nosql/Comment'); 
const { Receita } = require('../models/sql');       

class CommentController {
    // 1. CREATE - Injeta o comentário aplicando regras de Cobaia Logada vs Externa
    static async adicionar(req, res) {
        const { receita_id, autor, texto } = req.body;
        const receitaId = Number(receita_id);
        const usuarioId = req.session.usuarioId ? Number(req.session.usuarioId) : null; // Normaliza para Number
        const autorFinal = usuarioId ? (req.session.nome || autor) : autor;

        const autorLimpo = (autorFinal || '').trim();
        const textoLimpo = (texto || '').trim();

        if (!receitaId || Number.isNaN(receitaId) || !autorLimpo || !textoLimpo) {
            return res.redirect(`/receitas/detalhes/${receita_id}?erro=Preencha todos os campos do relato`);
        }

        try {
            // Valida a existência do prato no banco SQL
            const receitaExiste = await Receita.findByPk(receitaId);
            if (!receitaExiste) {
                return res.status(404).send("Receita não encontrada no SQLite.");
            }

            // 🚨 REGRA ESTREITA: Alunos logados só podem comentar uma vez por receita
            if (usuarioId) {
                const relatoAnterior = await Comment.findOne({
                    receita_id: receitaId,
                    usuario_id: usuarioId
                });

                if (relatoAnterior) {
                    return res.redirect(`/receitas/detalhes/${receita_id}?erro=Operadores cadastrados só podem emitir um laudo por experimento.`);
                }
            }

            // Injeta no NoSQL
            const novoComentario = new Comment({
                receita_id: receitaId,
                autor: autorLimpo,
                texto: textoLimpo,
                usuario_id: usuarioId, // Fica null para usuários externos (permitindo múltiplos posts)
                is_admin: usuarioId ? !!req.session.isAdmin : false,
                data: new Date()
            });

            await novoComentario.save();

            // Devolve o usuário para a página da receita atualizada
            return res.redirect(`/receitas/detalhes/${receitaId}?sucesso=Relato arquivado no MongoDB`);

        } catch (error) {
            console.error(error);
            return res.redirect(`/receitas/detalhes/${receitaId}?erro=Falha interna ao contatar o cluster MongoDB`);
        }
    }

    // 2. READ (Mantido para chamadas de API se necessário)
    static async listarPorReceita(req, res) {
        const { receita_id } = req.params;
        try {
            const comentarios = await Comment.find({ receita_id }).sort({ data: -1 });
            return res.status(200).json(comentarios);
        } catch (error) {
            return res.status(500).json({ erro: 'Erro ao buscar comentários.' });
        }
    }
}

module.exports = CommentController;