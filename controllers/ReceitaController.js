const { Receita, Categoria, Usuario } = require('../models/sql');

class ReceitaController {
    // 1. CREATE - Cadastra a receita e vincula Categorias e Alunos (N:N)
    static async create(req, res) {
        const { nome, descricao, link_externo, categorias, alunos } = req.body;

        // Validação (Dica 4: Não tratar valores vazios)
        if (!nome || !descricao || !link_externo) {
            return res.status(400).json({ erro: 'Nome, descrição e link externo são obrigatórios!' });
        }

        // Exige pelo menos uma categoria e um aluno responsável
        if (!categorias || !Array.isArray(categorias) || categorias.length === 0) {
            return res.status(400).json({ erro: 'A receita precisa estar vinculada a pelo menos uma categoria!' });
        }

        if (!alunos || !Array.isArray(alunos) || alunos.length === 0) {
            return res.status(400).json({ erro: 'A receita precisa ter pelo menos um aluno responsável!' });
        }

        try {
            // 1. Cria a receita na tabela principal
            const novaReceita = await Receita.create({
                nome,
                descricao,
                link_externo
            });

            // 2. Busca as instâncias reais no banco para garantir que existem
            const catEncontradas = await Categoria.findAll({ where: { id: categorias } });
            const alunosEncontrados = await Usuario.findAll({ where: { id: alunos, isAdmin: false } });

            if (catEncontradas.length === 0 || alunosEncontrados.length === 0) {
                return res.status(404).json({ erro: 'Alguma categoria ou aluno enviado não existe no banco!' });
            }

            // 3. Mágica do N:N -> Preenche as tabelas associativas
            // O Sequelize injeta esses métodos baseados nos seus models
            await novaReceita.addCategorias(catEncontradas);

            // Dependendo de como nomeamos a associação no index.js, o método pode ser addUsuarios ou addAlunos
            if (novaReceita.addUsuarios) {
                await novaReceita.addUsuarios(alunosEncontrados);
            } else if (novaReceita.addAlunos) {
                await novaReceita.addAlunos(alunosEncontrados);
            }

            return res.status(201).json({
                sucesso: true,
                mensagem: 'Receita criada e vinculada com sucesso!',
                receita: novaReceita
            });

        } catch (error) {
            console.error(error);
            return res.status(500).json({ erro: 'Erro interno ao cadastrar a receita.' });
        }
    }

    // 2. READ - Lista todas as receitas puxando junto os dados das categorias e autores
    static async list(req, res) {
        try {
            const receitas = await Receita.findAll({
                include: [
                    { 
                        model: Categoria, 
                        through: { attributes: [] } // Ignora os campos da tabela intermediária no JSON visual
                    },
                    { 
                        model: Usuario, 
                        attributes: ['id', 'nome', 'email'], // Traz os autores sem a senha
                        through: { attributes: [] } 
                    }
                ]
            });
            return res.status(200).json(receitas);
        } catch (error) {
            console.error(error);
            return res.status(500).json({ erro: 'Erro ao listar as receitas.' });
        }
    }

    // 3. UPDATE - Edita os dados e atualiza os vínculos N:N
    static async update(req, res) {
        const { id } = req.params;
        const { nome, descricao, link_externo, categorias, alunos } = req.body;

        if (!nome || !descricao || !link_externo) {
            return res.status(400).json({ erro: 'Nome, descrição e link externo são obrigatórios!' });
        }

        try {
            const receita = await Receita.findByPk(id);
            if (!receita) {
                return res.status(404).json({ erro: 'Receita não encontrada.' });
            }

            // Atualiza os textos
            receita.nome = nome;
            receita.descricao = descricao;
            receita.link_externo = link_externo;
            await receita.save();

            // Se mandou novas listas, substitui os relacionamentos antigos (método set)
            if (categorias && Array.isArray(categorias)) {
                const cats = await Categoria.findAll({ where: { id: categorias } });
                await receita.setCategorias(cats);
            }

            if (alunos && Array.isArray(alunos)) {
                const alns = await Usuario.findAll({ where: { id: alunos, isAdmin: false } });
                if (receita.setUsuarios) await receita.setUsuarios(alns);
                else if (receita.setAlunos) await receita.setAlunos(alns);
            }

            return res.status(200).json({ mensagem: 'Receita atualizada com sucesso!', receita });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ erro: 'Erro ao atualizar a receita.' });
        }
    }

    // 4. DELETE - Exclui a receita (o banco limpa o N:N sozinho em cascata)
    static async delete(req, res) {
        const { id } = req.params;

        try {
            const deletados = await Receita.destroy({ where: { id } });
            if (deletados === 0) {
                return res.status(404).json({ erro: 'Receita não encontrada.' });
            }
            return res.status(200).json({ mensagem: 'Receita excluída com sucesso!' });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ erro: 'Erro ao excluir a receita.' });
        }
    }
}

module.exports = ReceitaController;