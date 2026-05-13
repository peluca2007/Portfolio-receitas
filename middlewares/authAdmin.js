module.exports = (req, res, next) => {
    // Se não estiver logado ou não for admin, chuta para o login
    if (!req.session.usuarioId || !req.session.isAdmin) {
        return res.redirect('/auth/login?erro=Acesso restrito a Administradores');
    }
    next();
};