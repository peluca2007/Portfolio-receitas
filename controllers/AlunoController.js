const { Usuario, Receita } = require('../models/sql');

class AlunoController {
    // Painel pessoal do Aluno comum (GET /aluno/dashboard)
    static async dashboard(req, res) {
        try {
            const aluno = await Usuario.findByPk(req.session.usuarioId, {
                include: [{ model: Receita, as: 'receitas' }]
            });

            const alunoData = aluno.get({ plain: true });

            res.render('aluno/dashboard', {
                aluno: alunoData,
                receitas: alunoData.receitas || [],
                titulo: "Meus Protocolos | Dark.onion"
            });
        } catch (error) {
            res.redirect('/auth/login');
        }
    }

    static async dashboard(req, res) {
        try {
            const usuarioId = req.session.usuarioId;

            // Busca o aluno e faz o Include das receitas onde ele é responsável
            const alunoData = await Usuario.findByPk(usuarioId, {
                include: [{
                    model: Receita,
                    as: 'receitas', // Use o alias configurado nos seus relacionamentos N:N
                    through: { attributes: [] }
                }]
            });

            if (!alunoData) return res.redirect('/auth/login');

            const aluno = alunoData.get({ plain: true });

            res.render('aluno/dashboard', {
                aluno,
                receitas: aluno.receitas || [], // Passa o array limpo para o Handlebars
                titulo: "Central do Aluno | Dark.onion"
            });
        } catch (error) {
            console.error(error);
            res.redirect('/auth/login');
        }
    }
}

module.exports = AlunoController;
