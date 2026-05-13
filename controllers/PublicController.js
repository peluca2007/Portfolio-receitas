const { Receita, Categoria, Usuario, Habilidade } = require('../models/sql');
const Comment = require('../models/nosql/Comment');
const { Sequelize } = require('sequelize');

class PublicController {
    // Renderiza a home com todas as receitas (Requisito 1.7)
    static async home(req, res) {
        try {
            const receitasData = await Receita.findAll({
                include: [
                    {
                        model: Categoria,
                        as: 'categorias',
                        through: { attributes: [] }
                    },
                    {
                        model: Usuario,
                        as: 'responsaveis',
                        attributes: ['id', 'nome'],
                        through: { attributes: [] }
                    }
                ],
                order: [['createdAt', 'DESC']]
            });

            const usuarioLogadoId = req.session.usuarioId ? Number(req.session.usuarioId) : null;
            const isAdmin = !!req.session.isAdmin;
            const receitas = receitasData.map(r => {
                const receita = r.get({ plain: true });
                const ehResponsavel = Array.isArray(receita.responsaveis)
                    ? receita.responsaveis.some(resp => Number(resp.id) === usuarioLogadoId)
                    : false;
                receita.podeEditar = isAdmin || ehResponsavel;
                return receita;
            });

            const mongoOk = Comment.db && Comment.db.readyState === 1;

            for (let receita of receitas) {
                if (!mongoOk) {
                    receita.comentarios = [];
                    continue;
                }

                const comentarios = await Comment.find({ receita_id: receita.id }).sort({ data: -1 });
                receita.comentarios = comentarios.map(c => ({
                    autor: c.autor,
                    texto: c.texto,
                    data: c.data.toLocaleDateString('pt-BR'),
                    usuario_id: c.usuario_id,
                    is_admin: c.is_admin
                }));
            }

            const categoriasData = await Categoria.findAll({
                attributes: [
                    'id',
                    'nome',
                    [Sequelize.fn('COUNT', Sequelize.col('receitas.id')), 'total_receitas']
                ],
                include: [
                    { model: Receita, as: 'receitas', attributes: [], through: { attributes: [] }, required: false }
                ],
                group: ['Categoria.id'],
                order: [[Sequelize.literal('total_receitas'), 'DESC']]
            });

            const categorias = categoriasData.map(c => c.get({ plain: true }));

            return res.render('home', { receitas, categorias, titulo: "🧅 Dark.onion Slop " });

        } catch (error) {
            console.error(error);
            return res.status(500).send('Erro ao carregar a página inicial.');
        }
    }

    // Filtra receitas por categoria para o usuário externo (Requisito 1.8)
    static async porCategoria(req, res) {
        const { id } = req.params;
        try {
            // Busca a categoria e faz o include das receitas vinculadas a ela (N:N)
            const categoriaSelecionada = await Categoria.findByPk(id, {
                include: [
                    {
                        model: Receita,
                        as: 'receitas',
                        include: [
                            { model: Categoria, as: 'categorias', through: { attributes: [] } },
                            { model: Usuario, as: 'responsaveis', attributes: ['id', 'nome'], through: { attributes: [] } }
                        ]
                    }
                ]
            });

            if (!categoriaSelecionada) {
                return res.redirect('/');
            }

            // Transforma as receitas encontradas em JSON puro para a View
            const usuarioLogadoId = req.session.usuarioId ? Number(req.session.usuarioId) : null;
            const isAdmin = !!req.session.isAdmin;
            const receitas = categoriaSelecionada.receitas ? categoriaSelecionada.receitas.map(r => {
                const receita = r.get({ plain: true });
                const ehResponsavel = Array.isArray(receita.responsaveis)
                    ? receita.responsaveis.some(resp => Number(resp.id) === usuarioLogadoId)
                    : false;
                receita.podeEditar = isAdmin || ehResponsavel;
                return receita;
            }) : [];

            const mongoOk = Comment.db && Comment.db.readyState === 1;

            // Puxa os comentários do MongoDB para cada receita filtrada
            for (let receita of receitas) {
                if (!mongoOk) {
                    receita.comentarios = [];
                    continue;
                }

                const comentarios = await Comment.find({ receita_id: receita.id }).sort({ data: -1 });
                receita.comentarios = comentarios.map(c => ({
                    autor: c.autor,
                    texto: c.texto,
                    data: c.data.toLocaleDateString('pt-BR'),
                    usuario_id: c.usuario_id,
                    is_admin: c.is_admin
                }));
            }

            // Puxa a lista completa de categorias para manter o menu superior funcionando
            const categoriasData = await Categoria.findAll({
                attributes: [
                    'id',
                    'nome',
                    [Sequelize.fn('COUNT', Sequelize.col('receitas.id')), 'total_receitas']
                ],
                include: [
                    { model: Receita, as: 'receitas', attributes: [], through: { attributes: [] }, required: false }
                ],
                group: ['Categoria.id'],
                order: [[Sequelize.literal('total_receitas'), 'DESC']]
            });
            const categorias = categoriasData.map(c => c.get({ plain: true }));

            return res.render('home', { 
                receitas, 
                categorias, 
                titulo: `Filtro: ${categoriaSelecionada.nome} | Dark.onion` 
            });

        } catch (error) {
            console.error(error);
            return res.status(500).send('Erro ao processar o filtro de categoria.');
        }
    }
    
    // Relatório de proporção de domínio das habilidades (Requisito 1.9)
    static async relatorio(req, res) {
        try {
            const totalAlunos = await Usuario.count({ where: { isAdmin: false } });
            
            const habilidadesData = await Habilidade.findAll({
                include: [{ model: Usuario, as: 'alunos', attributes: ['id'] }]
            });

            const habilidades = habilidadesData.map(h => {
                const qtdAlunos = h.alunos ? h.alunos.length : 0;
                const proporcao = totalAlunos > 0 ? (qtdAlunos / totalAlunos) * 100 : 0;

                return {
                    nome: h.nome,
                    porcentagem: proporcao.toFixed(1),
                    qtd: qtdAlunos
                };
            });

            res.render('relatorio', {
                habilidades,
                totalAlunos,
                titulo: "Relatório de Habilidades | Dark.onion"
            });
        } catch (error) {
            console.error(error);
            res.status(500).send("Erro ao gerar relatório.");
        }
    }
}

module.exports = PublicController;