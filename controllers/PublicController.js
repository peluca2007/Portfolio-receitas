const { Receita, Categoria, Usuario } = require('../models/sql');
const Comment = require('../models/nosql/Comment');

class PublicController {
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
                        attributes: ['nome'],
                        through: { attributes: [] }
                    }
                ],
                order: [['createdAt', 'DESC']]
            });

            const receitas = receitasData.map(r => r.get({ plain: true }));

            for (let receita of receitas) {
                const comentarios = await Comment.find({ receita_id: receita.id }).sort({ data: -1 });
                receita.comentarios = comentarios.map(c => ({
                    autor: c.autor,
                    texto: c.texto,
                    data: c.data.toLocaleDateString('pt-BR')
                }));
            }

            const categoriasData = await Categoria.findAll();
            const categorias = categoriasData.map(c => c.get({ plain: true }));

            return res.render('home', { receitas, categorias, titulo: "🧅 Dark.onion Slop " });

        } catch (error) {
            console.error(error);
            return res.status(500).send('Erro ao carregar a página inicial.');
        }
    }
    static async relatório(req, res) {
        try {
            const totalAlunos = await Usuario.count({ where: { isAdmin: false } });
            const habilidadesData = await Habilidade.findAll({
                include: [{ model: Usuario, as: 'usuarios', attributes: ['id'] }]
            });

            const habilidades = habilidadesData.map(h => {
                const qtdAlunos = h.usuarios ? h.usuarios.length : 0;
                const proporcao = totalAlunos > 0 ? (qtdAlunos / totalAlunos) * 100 : 0;

                return {
                    nome: h.nome,
                    porcentagem: proporcao.toFixed(1), // Ex: 75.5%
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