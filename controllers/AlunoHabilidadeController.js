const { Usuario, Habilidade, AlunoHabilidade } = require('../models/sql');

class AlunoHabilidadeController {
    // 1. READ / GET - Carrega o formulário e lista as habilidades atuais do aluno logado
    static async create(req, res) {
        try {
            const usuarioId = req.session.usuarioId;

            if (!usuarioId) {
                return res.redirect('/auth/login');
            }

            // Busca todas as habilidades cadastradas no sistema para o <select>
            const habilidadesData = await Habilidade.findAll({ order: [['nome', 'ASC']] });
            const habilidades = habilidadesData.map(h => h.get({ plain: true }));

            // Busca o aluno logado e faz o include das habilidades que ele JÁ possui (N:N)
            const aluno = await Usuario.findByPk(usuarioId, {
                include: [{ 
                    model: Habilidade, 
                    as: 'habilidades', // Utiliza o alias mapeado no seu index.js
                    through: { attributes: ['nivel'] } 
                }]
            });

            // Mapeia as habilidades já cadastradas para exibir as notas na tela
            const minhasHabilidades = aluno && aluno.habilidades ? aluno.habilidades.map(h => ({
                nome: h.nome,
                nivel: h.AlunoHabilidade.nivel
            })) : [];

            const { erro, sucesso } = req.query;

            return res.render('aluno/habilidade-form', {
                titulo: "Ajustar Nível de Domínio | Dark.onion",
                habilidades,
                minhasHabilidades,
                erro,
                sucesso
            });

        } catch (error) {
            console.error(error);
            return res.status(500).send("Erro ao carregar o painel de habilidades.");
        }
    }

    // 2. CREATE / UPDATE / POST - Grava ou atualiza o nível (0 a 10) na tabela N:N
    static async vincular(req, res) {
        const { habilidade_id, nivel } = req.body;
        const usuarioId = req.session.usuarioId; // Puxa o ID de forma segura pela sessão

        // Validação rigorosa (Dica 4: Não tratar valores nulos ou vazios)
        if (!habilidade_id || nivel === '' || nivel === undefined) {
            return res.redirect('/aluno-habilidades/editar?erro=CamposObrigatorios');
        }

        const nivelNum = parseInt(nivel, 10);

        // Validação da escala obrigatória de 0 a 10 (Requisito 1.4)
        if (isNaN(nivelNum) || nivelNum < 0 || nivelNum > 10) {
            return res.redirect('/aluno-habilidades/editar?erro=NivelInvalido');
        }

        try {
            // Busca o aluno logado
            const aluno = await Usuario.findOne({ where: { id: usuarioId, isAdmin: false } });
            if (!aluno) {
                return res.redirect('/auth/login');
            }

            // Busca a habilidade selecionada
            const habilidade = await Habilidade.findByPk(habilidade_id);
            if (!habilidade) {
                return res.redirect('/aluno-habilidades/editar?erro=HabilidadeNaoEncontrada');
            }

            // Mágica do N:N com atributo extra (mantendo sua lógica original)
            // Os métodos gerados pelo Sequelize respeitam o alias 'habilidades'
            if (aluno.addHabilidade) {
                await aluno.addHabilidade(habilidade, { through: { nivel: nivelNum } });
            } else {
                // Alternativa direta via Model intermediário caso o mixin falhe
                const [vinculo, created] = await AlunoHabilidade.findOrCreate({
                    where: { usuario_id: usuarioId, habilidade_id: habilidade_id },
                    defaults: { nivel: nivelNum }
                });
                if (!created) {
                    vinculo.nivel = nivelNum;
                    await vinculo.save();
                }
            }

            // Sucesso: redireciona de volta para a View atualizada
            return res.redirect('/aluno-habilidades/editar?sucesso=NivelAtualizado');

        } catch (error) {
            console.error(error);
            return res.redirect('/aluno-habilidades/editar?erro=ErroInterno');
        }
    }
}

module.exports = AlunoHabilidadeController;