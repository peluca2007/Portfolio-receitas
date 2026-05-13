const { Usuario, Habilidade, AlunoHabilidade } = require('../models/sql');
const bcrypt = require('bcryptjs');

class AdminController {
    // READ: Lista todos os alunos para o Admin
    static async dashboard(req, res) {
        try {
            const usuariosData = await Usuario.findAll({ 
                where: { isAdmin: false },
                order: [['nome', 'ASC']] 
            });

            const alunos = usuariosData.map(a => a.get({ plain: true }));
            const { erro, sucesso } = req.query;

            return res.render('admin/dashboard', {
                titulo: "Painel de Controle | Dark.onion",
                alunos,
                erro,
                sucesso
            });
        } catch (error) {
            console.error(error);
            return res.status(500).send("Erro ao carregar a central de alunos.");
        }
    }

    // CREATE: Processa o cadastro de um novo aluno
    static async create(req, res) {
        const { nome, email, senha } = req.body;
        try {
            if (!nome || !email || !senha) {
                return res.redirect('/admin?erro=Preencha todos os campos');
            }
            const senhaHash = await bcrypt.hash(senha, 10);
            await Usuario.create({ nome, email, senha: senhaHash, isAdmin: false });
            return res.redirect('/admin?sucesso=Aluno injetado com sucesso');
        } catch (error) {
            console.error(error);
            return res.redirect('/admin?erro=E-mail já cadastrado ou falha no banco');
        }
    }

    // UPDATE: Salva as alterações de um aluno
    static async update(req, res) {
        const { id } = req.params;
        const { nome, email } = req.body;
        try {
            const nomeLimpo = (nome || '').trim();
            const emailLimpo = (email || '').trim();

            if (!nomeLimpo || !emailLimpo) {
                return res.redirect('/admin?erro=CamposObrigatorios');
            }

            await Usuario.update(
                { nome: nomeLimpo, email: emailLimpo },
                { where: { id }, validate: true }
            );
            return res.redirect('/admin?sucesso=Dados atualizados');
        } catch (error) {
            console.error(error);
            return res.redirect('/admin?erro=Falha ao atualizar aluno');
        }
    }

    // DELETE: Remove um aluno do sistema
    static async delete(req, res) {
        const { id } = req.params;
        try {
            await Usuario.destroy({ where: { id } });
            return res.redirect('/admin?sucesso=Registro apagado do SQLite');
        } catch (error) {
            console.error(error);
            return res.redirect('/admin?erro=Não é possível excluir: aluno possui vínculos ativos');
        }
    }

    // READ: Auditoria de habilidades com alunos e niveis
    static async auditoriaHabilidades(req, res) {
        try {
            const { erro, sucesso } = req.query;
            const habilidadesData = await Habilidade.findAll({
                include: [{
                    model: Usuario,
                    as: 'alunos',
                    attributes: ['id', 'nome', 'email'],
                    where: { isAdmin: false },
                    through: { attributes: ['nivel'] },
                    required: false
                }],
                order: [['nome', 'ASC']]
            });

            const habilidades = habilidadesData.map(h => {
                const habilidade = h.get({ plain: true });
                habilidade.alunos = (habilidade.alunos || []).map(a => ({
                    id: a.id,
                    nome: a.nome,
                    email: a.email,
                    nivel: a.AlunoHabilidade ? a.AlunoHabilidade.nivel : null
                }));
                return habilidade;
            });

            return res.render('admin/auditoria-habilidades', {
                titulo: 'Auditoria de Habilidades | Dark.onion',
                habilidades,
                erro,
                sucesso
            });
        } catch (error) {
            console.error(error);
            return res.status(500).send('Erro ao carregar auditoria de habilidades.');
        }
    }

    // UPDATE: Admin ajusta nivel de habilidade de um aluno
    static async atualizarAlunoHabilidade(req, res) {
        const { aluno_id, habilidade_id, novo_nivel } = req.body;

        const alunoId = Number(aluno_id);
        const habilidadeId = Number(habilidade_id);
        const nivel = Number(novo_nivel);

        if (!alunoId || !habilidadeId || Number.isNaN(nivel) || nivel < 0 || nivel > 10) {
            return res.redirect('/admin/auditoria-habilidades?erro=NivelInvalido');
        }

        try {
            const registro = await AlunoHabilidade.findOne({
                where: { usuario_id: alunoId, habilidade_id: habilidadeId }
            });

            if (registro) {
                await registro.update({ nivel });
            } else {
                await AlunoHabilidade.create({
                    usuario_id: alunoId,
                    habilidade_id: habilidadeId,
                    nivel
                });
            }

            return res.redirect('/admin/auditoria-habilidades?sucesso=NivelAtualizado');
        } catch (error) {
            console.error(error);
            return res.redirect('/admin/auditoria-habilidades?erro=ErroAoAtualizar');
        }
    }
}

module.exports = AdminController;
