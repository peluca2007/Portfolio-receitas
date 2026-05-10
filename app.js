const express = require('express');
const { engine } = require('express-handlebars');
const session = require('express-session');
const path = require('path');
const bcrypt = require('bcryptjs');

// Importar conexões
const sequelize = require('./config/database');
const connectMongo = require('./config/mongo');

// Importar os Models (garante a sincronização e puxa o Usuario para criar o admin)
const { Usuario } = require('./models/sql'); 

const app = express();

// Configuração do Handlebars (Views)
app.engine('handlebars', engine());
app.set('view engine', 'handlebars');
app.set('views', './views');

// Middlewares básicos
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Configuração de Sessão (necessário para o Login mais tarde)
app.use(session({
    secret: 'chave-secreta-do-pedro',
    resave: false,
    saveUninitialized: false
}));

// Importa e usa as rotas de autenticação
const authRoutes = require('./routes/authRoutes');
app.use('/auth', authRoutes);


// Função para iniciar o sistema
const startApp = async () => {
    try {
        // 1. Ligar ao MongoDB
        await connectMongo();

        // 2. Sincronizar SQLite (Cria as tabelas se não existirem)
        await sequelize.sync({ force: false });
        console.log('🗄️  SQLite (Sequelize) sincronizado e tabelas prontas!');

        // ---  CRIAÇÃO DO ADMIN PADRÃO ---
        const adminExiste = await Usuario.findOne({ where: { email: 'admin@utfpr.edu.br' } });
        
        if (!adminExiste) {
            const senhaHash = await bcrypt.hash('admin123', 10); // Criptografa a senha
            await Usuario.create({
                nome: 'Administrador do Sistema',
                email: 'admin@utfpr.edu.br',
                senha: senhaHash,
                isAdmin: true // Garante permissão total de administrador
            });
            console.log(' Usuário Admin padrão criado com sucesso! (admin@utfpr.edu.br / admin123)');
        }
        // ----------------------------------------

        // 3. Iniciar o servidor
        const PORT = 3000;
        app.listen(PORT, () => {
            console.log(` Servidor a bombar em http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error(' Falha ao iniciar a aplicação:', error);
    }
};

startApp();