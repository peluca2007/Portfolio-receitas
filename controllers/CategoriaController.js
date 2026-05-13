const { Categoria } = require('../models/sql');

class CategoriaController {
    // 1. CREATE - Cadastra uma nova categoria
    static async create(req, res) {
        const { nome } = req.body;

        // Validação (Dica 4: Não tratar valores vazios)
        if (!nome || nome.trim() === '') {
            return res.status(400).json({ erro: 'O nome da categoria é obrigatório!' });
        }

        try {
            const novaCategoria = await Categoria.create({ nome });
            return res.status(201).json({ 
                sucesso: true, 
                mensagem: 'Categoria criada com sucesso!',
                categoria: novaCategoria 
            });
        } catch (error) {
            // Se o nome já existir, o Sequelize dispara um erro de validação (unique)
            if (error.name === 'SequelizeUniqueConstraintError') {
                return res.status(400).json({ erro: 'Esta categoria já existe!' });
            }
            console.error(error);
            return res.status(500).json({ erro: 'Erro interno ao criar categoria.' });
        }
    }

    // 2. READ - Lista todas as categorias
    static async list(req, res) {
        try {
            const categorias = await Categoria.findAll();
            return res.status(200).json(categorias);
        } catch (error) {
            console.error(error);
            return res.status(500).json({ erro: 'Erro ao listar categorias.' });
        }
    }

    // 3. UPDATE - Edita o nome de uma categoria
    static async update(req, res) {
        const { id } = req.params;
        const { nome } = req.body;

        if (!nome || nome.trim() === '') {
            return res.status(400).json({ erro: 'O novo nome é obrigatório!' });
        }

        try {
            const categoria = await Categoria.findByPk(id);
            if (!categoria) {
                return res.status(404).json({ erro: 'Categoria não encontrada.' });
            }

            categoria.nome = nome;
            await categoria.save();

            return res.status(200).json({ mensagem: 'Categoria atualizada!', categoria });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ erro: 'Erro ao atualizar categoria.' });
        }
    }

    // 4. DELETE - Exclui uma categoria
    static async delete(req, res) {
        const { id } = req.params;

        try {
            const deletados = await Categoria.destroy({ where: { id } });
            if (deletados === 0) {
                return res.status(404).json({ erro: 'Categoria não encontrada.' });
            }
            return res.status(200).json({ mensagem: 'Categoria removida com sucesso!' });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ erro: 'Erro ao excluir categoria.' });
        }
    }

    // 5. DASHBOARD - Exibe o dashboard de categorias
    static async dashboard(req, res) {
        const { erro, sucesso } = req.query;
        const categoriasData = await Categoria.findAll({ order: [['nome', 'ASC']] });
        const categorias = categoriasData.map(c => c.get({ plain: true }));
        return res.render('admin/ges-categoria', { categorias, erro, sucesso, titulo: 'Gestao de Categorias' });
    }

    // 6. CREATE VIEW - Exibe a tela de criação de categorias
    static async createView(req, res) {
        const { nome } = req.body;
        if (!nome || nome.trim() === '') {
            return res.redirect('/categorias?erro=Nome obrigatorio');
        }
        try {
            await Categoria.create({ nome: nome.trim() });
            return res.redirect('/categorias?sucesso=Categoria criada');
        } catch (error) {
            return res.redirect('/categorias?erro=Categoria ja existe');
        }
    }

    // 7. UPDATE VIEW - Exibe a tela de edição de categorias
    static async updateView(req, res) {
        const { id } = req.params;
        const { nome } = req.body;
        if (!nome || nome.trim() === '') {
            return res.redirect('/categorias?erro=Nome obrigatorio');
        }
        await Categoria.update({ nome: nome.trim() }, { where: { id } });
        return res.redirect('/categorias?sucesso=Categoria atualizada');
    }

    // 8. DELETE VIEW - Exibe a tela de exclusão de categorias
    static async deleteView(req, res) {
        const { id } = req.params;
        await Categoria.destroy({ where: { id } });
        return res.redirect('/categorias?sucesso=Categoria removida');
    }
}

module.exports = CategoriaController;