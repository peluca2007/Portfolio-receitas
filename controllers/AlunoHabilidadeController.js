const { Usuario, Habilidade } = require('../models/sql');

class AlunoHabilidadeController {
    // 1. CREATE / UPDATE - Vincula uma habilidade a um aluno com nota de 0 a 10
    static async vincular(req, res) {
        const { aluno_id, habilidade_id, nivel } = req.body;

        // Validação rigorosa de preenchimento (Dica 4)
        if (!aluno_id || !habilidade_id || nivel === undefined) {
            return res.status(400).json({ erro: 'Informe o ID do aluno, o ID da habilidade e o nível!' });
        }

        // Validação da escala obrigatória de 0 a 10 (Requisito 1.4)
        const nivelNum = parseInt(nivel);
        if (isNaN(nivelNum) || nivelNum < 0 || nivelNum > 10) {
            return res.status(400).json({ erro: 'O nível de domínio deve ser um número inteiro entre 0 e 10!' });
        }

        try {
            // Busca o aluno (garantindo que não é o Admin)
            const aluno = await Usuario.findOne({ where: { id: aluno_id, isAdmin: false } });
            if (!aluno) {
                return res.status(404).json({ erro: 'Aluno não encontrado.' });
            }

            // Busca a habilidade
            const habilidade = await Habilidade.findByPk(habilidade_id);
            if (!habilidade) {
                return res.status(404).json({ erro: 'Habilidade não encontrada.' });
            }

            // Mágica do N:N com atributo extra -> Salva o vínculo passando o 'nivel'
            if (aluno.addHabilidade) {
                await aluno.addHabilidade(habilidade, { through: { nivel: nivelNum } });
            } else if (aluno.addHabilidades) {
                await aluno.addHabilidades(habilidade, { through: { nivel: nivelNum } });
            }

            return res.status(201).json({
                sucesso: true,
                mensagem: `Habilidade vinculada com sucesso ao aluno ${aluno.nome}!`,
                vinculo: {
                    aluno: aluno.nome,
                    habilidade: habilidade.nome,
                    nivel: nivelNum
                }
            });

        } catch (error) {
            console.error(error);
            return res.status(500).json({ erro: 'Erro interno ao vincular a habilidade.' });
        }
    }

    // 2. READ - Lista todas as habilidades e níveis de um aluno específico
    static async listarPorAluno(req, res) {
        const { aluno_id } = req.params;

        try {
            const aluno = await Usuario.findOne({
                where: { id: aluno_id, isAdmin: false },
                include: [{
                    model: Habilidade,
                    through: { attributes: ['nivel'] } // Puxa especificamente o nível gravado no N:N
                }]
            });

            if (!aluno) {
                return res.status(404).json({ erro: 'Aluno não encontrado.' });
            }

            return res.status(200).json({
                aluno: aluno.nome,
                habilidades: aluno.Habilidades || aluno.habilidades || []
            });

        } catch (error) {
            console.error(error);
            return res.status(500).json({ erro: 'Erro ao listar habilidades do aluno.' });
        }
    }
}

module.exports = AlunoHabilidadeController;