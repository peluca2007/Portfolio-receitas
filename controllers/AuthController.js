const bcrypt = require('bcryptjs');
const { Usuario } = require('../models/sql');

class AuthController {
    // Processa o formulário/requisição de login
    static async login(req, res) {
        const { email, senha } = req.body;

        // Validação básica (Dica 4: Não tratar valores vazios)
        if (!email || !senha) {
            return res.status(400).json({ erro: 'Por favor, preencha e-mail e senha!' });
        }

        try {
            // Busca o usuário no banco
            const usuario = await Usuario.findOne({ where: { email } });

            if (!usuario) {
                return res.status(401).json({ erro: 'E-mail ou senha incorretos!' });
            }

            // Compara a senha digitada com o hash salvo no banco
            const senhaValida = await bcrypt.compare(senha, usuario.senha);

            if (!senhaValida) {
                return res.status(401).json({ erro: 'E-mail ou senha incorretos!' });
            }

            // Salva os dados na sessão do Express
            req.session.usuarioId = usuario.id;
            req.session.isAdmin = usuario.isAdmin;

            return res.status(200).json({ 
                sucesso: true, 
                mensagem: `Bem-vindo, ${usuario.nome}!`,
                isAdmin: usuario.isAdmin
            });

        } catch (error) {
            console.error(error);
            return res.status(500).json({ erro: 'Erro interno no servidor.' });
        }
    }

    // Faz o logout (encerra a sessão)
    static logout(req, res) {
        req.session.destroy();
        return res.json({ mensagem: 'Você saiu do sistema.' });
    }
}

module.exports = AuthController;