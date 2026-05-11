const bcrypt = require('bcryptjs');
const { Usuario } = require('../models/sql');

class AlunoController {
    // 1. CREATE - Admin cadastra um novo aluno
    static async create(req, res) {
        const { nome, email, senha } = req.body;

        // Validação (Dica 4: Não tratar valores vazios)
        if (!nome || !email || !senha) {
            return res.status(400).json({ erro: 'Preencha nome, e-mail e senha do aluno!' });
        }

        try {
            // Criptografa a senha do aluno antes de salvar no banco
            const senhaHash = await bcrypt.hash(senha, 10);

            const novoAluno = await Usuario.create({
                nome,
                email,
                senha: senhaHash,
                isAdmin: false //  Garante que ele é um Aluno normal, não Admin
            });

            // Removemos a senha do retorno por segurança
            const alunoRetorno = { id: novoAluno.id, nome: novoAluno.nome, email: novoAluno.email };

            return res.status(201).json({ 
                sucesso: true, 
                mensagem: 'Aluno cadastrado com sucesso!',
                aluno: alunoRetorno 
            });
        } catch (error) {
            if (error.name === 'SequelizeUniqueConstraintError') {
                return res.status(400).json({ erro: 'Já existe um usuário com este e-mail!' });
            }
            console.error(error);
            return res.status(500).json({ erro: 'Erro interno ao cadastrar aluno.' });
        }
    }

    // 2. READ - Lista apenas os alunos (ignora os Admins)
    static async list(req, res) {
        try {
            const alunos = await Usuario.findAll({
                where: { isAdmin: false },
                attributes: ['id', 'nome', 'email'] // Não puxa o hash da senha
            });
            return res.status(200).json(alunos);
        } catch (error) {
            console.error(error);
            return res.status(500).json({ erro: 'Erro ao listar alunos.' });
        }
    }

    // 3. UPDATE - Edita dados básicos do aluno (nome e email)
    static async update(req, res) {
        const { id } = req.params;
        const { nome, email } = req.body;

        if (!nome || !email) {
            return res.status(400).json({ erro: 'Nome e e-mail são obrigatórios!' });
        }

        try {
            const aluno = await Usuario.findOne({ where: { id, isAdmin: false } });
            if (!aluno) {
                return res.status(404).json({ erro: 'Aluno não encontrado.' });
            }

            aluno.nome = nome;
            aluno.email = email;
            await aluno.save();

            return res.status(200).json({ 
                mensagem: 'Dados do aluno atualizados!', 
                aluno: { id: aluno.id, nome: aluno.nome, email: aluno.email } 
            });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ erro: 'Erro ao atualizar aluno.' });
        }
    }

    // 4. DELETE - Exclui a conta de um aluno
    static async delete(req, res) {
        const { id } = req.params;

        try {
            const deletados = await Usuario.destroy({ where: { id, isAdmin: false } });
            if (deletados === 0) {
                return res.status(404).json({ erro: 'Aluno não encontrado.' });
            }
            return res.status(200).json({ mensagem: 'Aluno removido do sistema com sucesso!' });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ erro: 'Erro ao excluir aluno.' });
        }
    }
}

module.exports = AlunoController;