const { Habilidade } = require('../models/sql');

class HabilidadeController {
    // 1. CREATE - Cadastra uma nova habilidade (Ex: "Corte com Faca", "Confeitaria")
    static async create(req, res) {
        const { nome } = req.body;

        if (!nome || nome.trim() === '') {
            return res.status(400).json({ erro: 'O nome da habilidade é obrigatório!' });
        }

        try {
            const novaHabilidade = await Habilidade.create({ nome });
            return res.status(201).json({ 
                sucesso: true, 
                mensagem: 'Habilidade criada com sucesso!',
                habilidade: novaHabilidade 
            });
        } catch (error) {
            if (error.name === 'SequelizeUniqueConstraintError') {
                return res.status(400).json({ erro: 'Esta habilidade já existe!' });
            }
            console.error(error);
            return res.status(500).json({ erro: 'Erro interno ao criar habilidade.' });
        }
    }

    // 2. READ - Lista todas as habilidades
    static async list(req, res) {
        try {
            const habilidades = await Habilidade.findAll();
            return res.status(200).json(habilidades);
        } catch (error) {
            console.error(error);
            return res.status(500).json({ erro: 'Erro ao listar habilidades.' });
        }
    }

    // 3. UPDATE - Edita o nome de uma habilidade
    static async update(req, res) {
        const { id } = req.params;
        const { nome } = req.body;

        if (!nome || nome.trim() === '') {
            return res.status(400).json({ erro: 'O novo nome é obrigatório!' });
        }

        try {
            const habilidade = await Habilidade.findByPk(id);
            if (!habilidade) {
                return res.status(404).json({ erro: 'Habilidade não encontrada.' });
            }

            habilidade.nome = nome;
            await habilidade.save();

            return res.status(200).json({ mensagem: 'Habilidade atualizada!', habilidade });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ erro: 'Erro ao atualizar habilidade.' });
        }
    }

    // 4. DELETE - Exclui uma habilidade
    static async delete(req, res) {
        const { id } = req.params;

        try {
            const deletados = await Habilidade.destroy({ where: { id } });
            if (deletados === 0) {
                return res.status(404).json({ erro: 'Habilidade não encontrada.' });
            }
            return res.status(200).json({ mensagem: 'Habilidade removida com sucesso!' });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ erro: 'Erro ao excluir habilidade.' });
        }
    }

    // 5. DASHBOARD - Exibe o dashboard de habilidades
    static async dashboard(req, res) {
        const { erro, sucesso } = req.query;
        const habilidadesData = await Habilidade.findAll({ order: [['nome', 'ASC']] });
        const habilidades = habilidadesData.map(h => h.get({ plain: true }));
        return res.render('admin/ges-habilidade', { habilidades, erro, sucesso, titulo: 'Gestao de Habilidades' });
    }

    // 6. CREATE VIEW - Exibe a tela de criação de habilidades
    static async createView(req, res) {
        const { nome } = req.body;
        if (!nome || nome.trim() === '') {
            return res.redirect('/habilidades?erro=Nome obrigatorio');
        }
        try {
            await Habilidade.create({ nome: nome.trim() });
            return res.redirect('/habilidades?sucesso=Habilidade criada');
        } catch (error) {
            return res.redirect('/habilidades?erro=Habilidade ja existe');
        }
    }

    // 7. UPDATE VIEW - Exibe a tela de edição de habilidades
    static async updateView(req, res) {
        const { id } = req.params;
        const { nome } = req.body;
        if (!nome || nome.trim() === '') {
            return res.redirect('/habilidades?erro=Nome obrigatorio');
        }
        await Habilidade.update({ nome: nome.trim() }, { where: { id } });
        return res.redirect('/habilidades?sucesso=Habilidade atualizada');
    }

    // 8. DELETE VIEW - Exibe a tela de exclusão de habilidades
    static async deleteView(req, res) {
        const { id } = req.params;
        await Habilidade.destroy({ where: { id } });
        return res.redirect('/habilidades?sucesso=Habilidade removida');
    }
}

module.exports = HabilidadeController;