const bcrypt = require('bcryptjs');
const { Usuario } = require('../models/sql');

class AuthController {
    // Exibe a tela de login (GET)
    static async showLogin(req, res) {
        res.render('auth/login', { 
            titulo: "DARK.ONION | AUTH", 
            layout: 'main' 
        });
    }

    // Processa o login (POST)
    static async login(req, res) {
        const { email, senha } = req.body;

        try {
            const usuario = await Usuario.findOne({ where: { email } });

            // Verifica se o usuário existe no banco
            if (!usuario) {
                return res.render('auth/login', { erro: true, titulo: "DARK.ONION | AUTH" });
            }

            // Compara a senha digitada com o hash salvo (Bcrypt)
            const senhaValida = await bcrypt.compare(senha, usuario.senha);

            if (!senhaValida) {
                return res.render('auth/login', { erro: true, titulo: "DARK.ONION | AUTH" });
            }

            // Registra as informações na sessão do Express
            req.session.usuarioId = usuario.id;
            req.session.isAdmin = usuario.isAdmin;
            req.session.nome = usuario.nome;

            // Redirecionamento lógico por cargo
            if (usuario.isAdmin) {
                // Administradores são enviados para a gestão de alunos
                return res.redirect('/admin'); 
            } else {
                // Alunos comuns são enviados para seu painel pessoal
                return res.redirect('/aluno/dashboard');
            }

        } catch (error) {
            console.error(error);
            res.render('auth/login', { erro: true, titulo: "DARK.ONION | AUTH" });
        }
    }

    // Encerra a sessão (Logout)
    static async logout(req, res) {
        req.session.destroy(() => {
            res.redirect('/');
        });
    }
}

module.exports = AuthController;