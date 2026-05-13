const express = require('express');
const { engine } = require('express-handlebars');
const session = require('express-session');
const path = require('path');
const bcrypt = require('bcryptjs');

// Importar conexões de banco de dados
const sequelize = require('./config/database');
const connectMongo = require('./config/mongo');

// Importar os Models para sincronização e mapeamento relacional
const { Usuario, Categoria, Habilidade, Receita } = require('./models/sql'); 
const Comment = require('./models/nosql/Comment');

const app = express();

// Configuração do Handlebars (Views)
app.engine('handlebars', engine());
app.set('view engine', 'handlebars');
app.set('views', './views');

// Middlewares básicos
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Configuração de Sessão
app.use(session({
    secret: 'chave-secreta-do-pedro',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false } 
}));

// MIDDLEWARE GLOBAL DE SESSÃO E SILENCIADOR DE FAVICON
app.use((req, res, next) => {
    if (req.originalUrl && req.originalUrl.includes('favicon.ico')) {
        return res.status(204).end();
    }

    const usuarioId = req.session.usuarioId || null;
    const isAdmin = !!req.session.isAdmin;

    res.locals.usuarioLogadoId = usuarioId;
    res.locals.isAdmin = isAdmin;

    if (usuarioId) {
        res.locals.usuarioLogado = {
            id: usuarioId,
            isAdmin,
            nome: req.session.nome
        };
    } else {
        res.locals.usuarioLogado = null;
    }
    next();
});

// Importar Controllers e Rotas
const PublicController = require('./controllers/PublicController'); 
const authRoutes = require('./routes/authRoutes');
const categoriaRoutes = require('./routes/categoriaRoutes'); 
const habilidadeRoutes = require('./routes/habilidadeRoutes'); 
const alunoRoutes = require('./routes/alunoRoutes'); 
const receitaRoutes = require('./routes/receitaRoutes');
const adminRoutes = require('./routes/adminRoutes'); 
const alunoHabilidadeRoutes = require('./routes/alunoHabilidadeRoutes'); 
const commentRoutes = require('./routes/commentRoutes'); 

// Rotas Públicas
app.get('/', PublicController.home); 
app.get('/relatorio', PublicController.relatorio);
app.get('/categoria/:id', PublicController.porCategoria);

// Rotas Protegidas (MVC)
app.use('/auth', authRoutes);
app.use('/categorias', categoriaRoutes); 
app.use('/habilidades', habilidadeRoutes); 
app.use('/aluno', alunoRoutes);
app.use('/admin', adminRoutes);
app.use('/receitas', receitaRoutes); 
app.use('/aluno-habilidades', alunoHabilidadeRoutes); 
app.use('/comentarios', commentRoutes);

// ============================================================================
// BASE DE DADOS REAL - DARK.ONION SLOP (MANTENDO SUAS URLS ORIGINAIS)
// ============================================================================
const categoriasBase = [
    { nome: 'Fermentados' }, { nome: 'Exóticos' }, { nome: 'Sobremesas' },
    { nome: 'Conservas' }, { nome: 'Fortes' }, { nome: 'Banquete' }
];

const habilidadesBase = [
    { nome: 'Corte de Precisão' }, { nome: 'Química Culinária' },
    { nome: 'Resistência Olfativa' }, { nome: 'Confeitaria Avançada' },
    { nome: 'Controle de Fogo' }, { nome: 'Harmonização' }
];

const alunosBase = [
    { nome: 'Carlos Silva', email: 'carlos@aluno.com' },
    { nome: 'Beatriz Costa', email: 'beatriz@aluno.com' },
    { nome: 'Lucas Mendes', email: 'lucas@aluno.com' },
    { nome: 'Mariana Ribeiro', email: 'mariana@aluno.com' },
    { nome: 'Rafael Almeida', email: 'rafael@aluno.com' },
    { nome: 'Juliana Mendes', email: 'juliana@aluno.com' }
];

const receitasBase = [
    {
        nome: 'Chou Tofu (Tofu Fedido)',
        descricao: 'Prato chinês famoso pelo odor forte e casca crocante.',
        modo_preparo: '1. Fermentar o tofu em salmoura de leite e vegetais por meses.\n2. Fritar em óleo quente até inflar.\n3. Servir com molho de alho.',
        imagem: 'https://s03.video.glbimg.com/x720/11801778.jpg',
        link_externo: 'https://pt.wikipedia.org/wiki/Chou_tofu'
    },
    {
        nome: 'Hákarl (Tubarão Islandês)',
        descricao: 'Tubarão curado da Islândia com forte cheiro de amônia.',
        modo_preparo: '1. Enterrar a carne de tubarão no cascalho por 12 semanas.\n2. Pendurar para secar por 4 meses.\n3. Cortar em cubos pequenos.',
        imagem: 'https://p2.trrsf.com/image/fget/cf/1200/1200/middle/images.terra.com/2023/08/21/istock-1219531407-qxywb3riazq9.jpg',
        link_externo: 'https://pt.wikipedia.org/wiki/H%C3%A1karl'
    },
    {
        nome: 'Surströmming (Arenque Sueco)',
        descricao: 'Peixe fermentado do mar Báltico, conhecido pelo odor avassalador.',
        modo_preparo: '1. Limpar os arenques e salgar levemente.\n2. Fermentar em barris por 2 meses.\n3. Enlatar e servir com pão chato e batatas.',
        imagem: 'https://thumbs.dreamstime.com/b/arenques-%C3%A1cidos-suecos-de-surstromming-83947804.jpg',
        link_externo: 'https://pt.wikipedia.org/wiki/Surstr%C3%B6mming'
    },
    {
        nome: 'Ovo Centenário (Pidan)',
        descricao: 'Ovo preservado em argila e cinzas, com gema cremosa escura.',
        modo_preparo: '1. Envolver ovos de pata em pasta de cal, sal e cinzas.\n2. Enterrar por semanas até a química transformar a textura.\n3. Descascar e servir.',
        imagem: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT2qNJ36QMph9topqGvSdFA5AgYdvMqWDcKaIsb68eQu59kVaST6Jmbi6gidbsuoxFpv3vg1j47TH_MGFjdXE0dUIVAXose47q6hEX2fB9V5Q&s=10',
        link_externo: 'https://pt.wikipedia.org/wiki/Ovo_centen%C3%A1rio'
    },
    {
        nome: 'Casu Marzu (Queijo com Larvas)',
        descricao: 'Queijo pecorino da Sardenha que contém larvas vivas de moscas.',
        modo_preparo: '1. Deixar o queijo ao ar livre para as moscas colocarem ovos.\n2. Aguardar as larvas quebrarem as gorduras.\n3. Consumir com pão sardo.',
        imagem: 'https://upload.wikimedia.org/wikipedia/commons/3/36/Casu_Marzu_cheese.jpg',
        link_externo: 'https://pt.wikipedia.org/wiki/Casu_marzu'
    },
    {
        nome: 'Banquete de Insetos Fritos',
        descricao: 'Mistura de grilos e larvas crocantes temperadas com especiarias.',
        modo_preparo: '1. Limpar os insetos comestíveis.\n2. Fritar em fogo alto com óleo de gergelim e sal.\n3. Adicionar pimenta malagueta e limão.',
        imagem: 'https://thumbs.dreamstime.com/b/comida-tailandesa-no-mercado-insetos-fritos-gafanhotos-de-galinha-um-lanche-incomum-uma-emo%C3%A7%C3%A3o-266269110.jpg',
        link_externo: 'https://pt.wikipedia.org/wiki/Entomofagia'
    }
];

// ============================================================================
// LÓGICA ROBUSTA DE POVOAMENTO AUTOMÁTICO E COMENTÁRIOS (SEED ON BOOT)
// ============================================================================
const autoPovoarSistema = async () => {
    try {
        const receitasCount = await Receita.count();
        if (receitasCount > 0) {
            return; 
        }

        console.log('🧅 [ SEED ]: Base limpa detectada. Iniciando auto-povoamento do catálogo...');

        // 1. Categorias e Habilidades base
        const categoriasCadastradas = [];
        for (const cat of categoriasBase) {
            const [reg] = await Categoria.findOrCreate({ where: { nome: cat.nome } });
            categoriasCadastradas.push(reg);
        }

        const habilidadesCadastradas = [];
        for (const hab of habilidadesBase) {
            const [reg] = await Habilidade.findOrCreate({ where: { nome: hab.nome } });
            habilidadesCadastradas.push(reg);
        }

        // 2. Criar Admin e Alunos (Garantindo Habilidades vinculadas)
        const senhaAdmin = await bcrypt.hash('admin', 10);
        const senhaAluno = await bcrypt.hash('123', 10);

        const [admin] = await Usuario.findOrCreate({
            where: { email: 'admin@sistema.com' },
            defaults: { nome: 'Admin', email: 'admin@sistema.com', senha: senhaAdmin, isAdmin: true }
        });

        const alunosCadastrados = [];
        for (let i = 0; i < alunosBase.length; i += 1) {
            const alunoBase = alunosBase[i];
            const [aluno] = await Usuario.findOrCreate({
                where: { email: alunoBase.email },
                defaults: { nome: alunoBase.nome, email: alunoBase.email, senha: senhaAluno, isAdmin: false }
            });
            
            // Requisito 1.4: Cada aluno tem sua habilidade culinária com nível definido (10)
            const habilidade = habilidadesCadastradas[i % habilidadesCadastradas.length];
            await aluno.addHabilidade(habilidade, { through: { nivel: 10 } });

            alunosCadastrados.push(aluno);
        }

        // 3. Criar Receitas N:N e injetar Comentários no MongoDB
        for (let i = 0; i < receitasBase.length; i += 1) {
            const data = receitasBase[i];
            const [receita] = await Receita.findOrCreate({
                where: { nome: data.nome },
                defaults: {
                    descricao: data.descricao,
                    modo_preparo: data.modo_preparo,
                    imagem: data.imagem,
                    link_externo: data.link_externo
                }
            });

            const categoria = categoriasCadastradas[i % categoriasCadastradas.length];
            await receita.setCategorias([categoria.id]);

            const responsavelA = alunosCadastrados[i % alunosCadastrados.length];
            const responsavelB = alunosCadastrados[(i + 1) % alunosCadastrados.length];
            await receita.setResponsaveis([responsavelA.id, responsavelB.id]);

            
        }

        console.log('✅ [ SEED ]: Alunos com habilidades, Categorias, Receitas e Comentários injetados!');
    } catch (error) {
        console.error('❌ [ ERRO NO SEED ]: Falha ao auto-povoar o banco relacional:', error);
    }
};

// ============================================================================
// BOOTSTRAP DO SERVIDOR
// ============================================================================
const startApp = async () => {
    try {
        console.log('Conectando ao MongoDB...');
        const mongoConectado = await connectMongo();
        if (!mongoConectado) {
            console.warn('⚠️ MongoDB indisponível. A interface iniciará normalmente sem renderizar comentários.');
        }

        await sequelize.sync({ force: false });
        console.log('🧅 SQLite sincronizado com sucesso.');

        await autoPovoarSistema();

        const PORT = 3000;
        app.listen(PORT, () => {
            console.log(`\n🚀 Catálogo Operante em: http://localhost:${PORT}`);
        });

    } catch (error) {
        console.error('❌ Falha crítica ao inicializar a arquitetura do Node:', error);
    }
};

startApp();