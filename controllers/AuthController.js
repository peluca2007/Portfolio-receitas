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

            if (!usuario) {
                return res.render('auth/login', { erro: true, titulo: "DARK.ONION | AUTH" });
            }

            const senhaValida = await bcrypt.compare(senha, usuario.senha);

            if (!senhaValida) {
                return res.render('auth/login', { erro: true, titulo: "DARK.ONION | AUTH" });
            }

            // Salva na sessão (Requisito 1.1)
            req.session.usuarioId = usuario.id;
            req.session.isAdmin = usuario.isAdmin;

            // Redireciona conforme o nível de acesso
            if (usuario.isAdmin) {
                return res.redirect('/admin/dashboard');
            } else {
                return res.redirect('/aluno/dashboard');
            }

        } catch (error) {
            console.error(error);
            res.render('auth/login', { erro: true, titulo: "DARK.ONION | AUTH" });
        }
    }

    // Logout (Destrói a sessão)
    static async logout(req, res) {
        req.session.destroy();
        res.redirect('/');
    }
}


module.exports = AuthController;