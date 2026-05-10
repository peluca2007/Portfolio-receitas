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
}

module.exports = CategoriaController;