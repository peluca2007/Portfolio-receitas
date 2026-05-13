const Usuario = require('./Usuario');
const Receita = require('./Receita');
const Categoria = require('./Categoria');
const Habilidade = require('./Habilidade');
const AlunoHabilidade = require('./AlunoHabilidade');
const ReceitaAluno = require('./ReceitaAluno');

// 1. Relacionamento N:N -> Receitas <-> Alunos (Responsáveis)
Usuario.belongsToMany(Receita, { through: ReceitaAluno, foreignKey: 'usuario_id', as: 'receitas' });
Receita.belongsToMany(Usuario, { through: ReceitaAluno, foreignKey: 'receita_id', as: 'responsaveis' });

// 2. Relacionamento N:N -> Receitas <-> Categorias
// Como não tem campo extra aqui, o Sequelize gerencia a tabela pivô sozinho
Receita.belongsToMany(Categoria, { through: 'receita_categoria', foreignKey: 'receita_id', as: 'categorias' });
Categoria.belongsToMany(Receita, { through: 'receita_categoria', foreignKey: 'categoria_id', as: 'receitas' });

// 3. Relacionamento N:N -> Alunos <-> Habilidades (com o nível de 0 a 10)
Usuario.belongsToMany(Habilidade, { through: AlunoHabilidade, foreignKey: 'usuario_id', as: 'habilidades' });
Habilidade.belongsToMany(Usuario, { through: AlunoHabilidade, foreignKey: 'habilidade_id', as: 'alunos' });

// Exporta tudo agrupado
module.exports = {
    Usuario,
    Receita,
    Categoria,
    Habilidade, 
    AlunoHabilidade,
    ReceitaAluno
};

