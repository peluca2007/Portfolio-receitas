const { Receita, Categoria, Usuario } = require('../models/sql');
const Comment = require('../models/nosql/Comment');

class ReceitaController {
    // 1. GET - Renderiza formulário de criação
    static async create(req, res) {
        if (!req.session.usuarioId) {
            return res.redirect('/auth/login?erro=LoginNecessario');
        }

        try {
            const categoriasData = await Categoria.findAll();
            const alunosData = await Usuario.findAll({ where: { isAdmin: false } });

            const categorias = categoriasData.map(c => c.get({ plain: true }));
            const usuarioLogadoId = req.session.usuarioId ? Number(req.session.usuarioId) : null;

            // Oculta o usuário logado da lista para evitar marcação redundante no select
            const alunos = alunosData
                .map(a => a.get({ plain: true }))
                .filter(aluno => (usuarioLogadoId ? Number(aluno.id) !== usuarioLogadoId : true));

            return res.render('aluno/receita-form', {
                titulo: 'Novo Experimento | Dark.onion',
                categorias,
                alunos,
                erro: req.query.erro
            });
        } catch (error) {
            console.error(error);
            return res.redirect('/?erro=ErroAoCarregarFormulario');
        }
    }

    // 2. POST - Persiste a receita garantindo validação de nulos
    static async store(req, res) {
        if (!req.session.usuarioId) {
            return res.redirect('/auth/login?erro=LoginNecessario');
        }

        const { nome, descricao, modo_preparo, link_externo, categorias, responsaveis, imagem } = req.body;
        const usuarioLogadoId = req.session.usuarioId ? Number(req.session.usuarioId) : null;

        if (!nome || !descricao || !modo_preparo || !link_externo || nome.trim() === '' || descricao.trim() === '' || modo_preparo.trim() === '' || link_externo.trim() === '') {
            return res.redirect('/receitas/nova?erro=Preencha todos os campos obrigatorios (Nome, Descricao, Modo de Preparo e Link Externo)');
        }

        try {
            const imagemFinal = imagem && imagem.trim() !== ''
                ? imagem.trim()
                : 'https://placehold.co/1200x800?text=Receita';

            const novaReceita = await Receita.create({
                nome: nome.trim(),
                descricao: descricao.trim(),
                modo_preparo: modo_preparo.trim(),
                link_externo: link_externo.trim(),
                imagem: imagemFinal
            });

            const catIds = categorias ? (Array.isArray(categorias) ? categorias : [categorias]) : [];
            await novaReceita.setCategorias(catIds);

            let respIds = usuarioLogadoId ? [usuarioLogadoId] : [];
            if (responsaveis) {
                const coautorIds = Array.isArray(responsaveis) ? responsaveis : [responsaveis];
                respIds = [...new Set([...respIds, ...coautorIds.map(Number)])];
            }
            if (respIds.length > 0) {
                await novaReceita.setResponsaveis(respIds);
            }

            return res.redirect('/?sucesso=Experimento registrado com sucesso no portfolio');
        } catch (error) {
            console.error(error);
            return res.redirect('/receitas/nova?erro=Falha interna ao gravar no banco SQLite');
        }
    }

    // 3. GET - Formulário de Edição
    static async edit(req, res) {
        const { id } = req.params;
        const usuarioLogadoId = req.session.usuarioId ? Number(req.session.usuarioId) : null;
        const isAdmin = !!req.session.isAdmin;

        if (!req.session.usuarioId) {
            return res.redirect('/auth/login?erro=LoginNecessario');
        }

        try {
            const receitaData = await Receita.findByPk(id, {
                include: [
                    { model: Categoria, as: 'categorias' },
                    { model: Usuario, as: 'responsaveis' }
                ]
            });

            if (!receitaData) return res.redirect('/');
            const receita = receitaData.get({ plain: true });

            const ehResponsavel = receita.responsaveis.some(r => Number(r.id) === usuarioLogadoId);
            if (!ehResponsavel && !isAdmin) {
                return res.redirect('/?erro=Acesso negado. Apenas coautores ou a administracao possuem permissao.');
            }

            const categoriasData = await Categoria.findAll();
            const alunosData = await Usuario.findAll({ where: { isAdmin: false } });

            const categorias = categoriasData.map(c => {
                const cat = c.get({ plain: true });
                cat.marcada = receita.categorias.some(rc => rc.id === cat.id);
                return cat;
            });

            const alunos = alunosData
                .map(a => {
                    const al = a.get({ plain: true });
                    al.marcado = receita.responsaveis.some(rr => rr.id === al.id);
                    return al;
                })
                .filter(aluno => (usuarioLogadoId ? Number(aluno.id) !== usuarioLogadoId : true));

            return res.render('aluno/receita-edit', {
                titulo: `Editar: ${receita.nome}`,
                receita,
                categorias,
                alunos,
                erro: req.query.erro
            });
        } catch (error) {
            return res.redirect('/');
        }
    }

    // 4. POST - Processa alterações mantendo integridade
    static async update(req, res) {
        if (!req.session.usuarioId) {
            return res.redirect('/auth/login?erro=LoginNecessario');
        }

        const { id } = req.params;
        const { nome, descricao, modo_preparo, link_externo, categorias, responsaveis, imagem } = req.body;
        const usuarioLogadoId = req.session.usuarioId ? Number(req.session.usuarioId) : null;
        const isAdmin = !!req.session.isAdmin;

        if (!nome || !descricao || !modo_preparo || !link_externo || nome.trim() === '' || descricao.trim() === '' || modo_preparo.trim() === '' || link_externo.trim() === '') {
            return res.redirect(`/receitas/editar/${id}?erro=Campos obrigatorios nao podem ficar vazios`);
        }

        try {
            const receita = await Receita.findByPk(id, { include: [{ model: Usuario, as: 'responsaveis' }] });
            if (!receita) return res.redirect('/');

            const ehResponsavel = receita.responsaveis.some(r => Number(r.id) === usuarioLogadoId);
            if (!ehResponsavel && !isAdmin) return res.redirect('/?erro=Permissao negada');

            const imgFinal = imagem && imagem.trim() !== '' ? imagem.trim() : receita.imagem;

            await receita.update({
                nome: nome.trim(),
                descricao: descricao.trim(),
                modo_preparo: modo_preparo.trim(),
                link_externo: link_externo.trim(),
                imagem: imgFinal
            });

            const catIds = categorias ? (Array.isArray(categorias) ? categorias : [categorias]) : [];
            await receita.setCategorias(catIds);

            if (!isAdmin) {
                let respIds = usuarioLogadoId ? [usuarioLogadoId] : [];
                if (responsaveis) {
                    const coautorIds = Array.isArray(responsaveis) ? responsaveis : [responsaveis];
                    respIds = [...new Set([...respIds, ...coautorIds.map(Number)])];
                }
                await receita.setResponsaveis(respIds);
            } else if (responsaveis) {
                const respIds = Array.isArray(responsaveis) ? responsaveis : [responsaveis];
                await receita.setResponsaveis(respIds.map(Number));
            }

            return res.redirect(`/receitas/detalhes/${id}?sucesso=Protocolo atualizado com sucesso`);
        } catch (error) {
            return res.redirect(`/receitas/editar/${id}?erro=Erro ao atualizar os dados no banco`);
        }
    }

    // 5. POST - Destruição relacional e remoção de comentários órfãos
    static async delete(req, res) {
        if (!req.session.usuarioId) {
            return res.redirect('/auth/login?erro=LoginNecessario');
        }

        const usuarioLogadoId = req.session.usuarioId ? Number(req.session.usuarioId) : null;
        const isAdmin = !!req.session.isAdmin;

        try {
            const receita = await Receita.findByPk(req.params.id, { include: [{ model: Usuario, as: 'responsaveis' }] });
            if (!receita) return res.redirect('/');

            const ehResponsavel = receita.responsaveis.some(r => Number(r.id) === usuarioLogadoId);

            if (!ehResponsavel && !isAdmin) {
                return res.redirect('/?erro=Permissao negada');
            }

            await Comment.deleteMany({ receita_id: Number(req.params.id) });
            await receita.destroy();

            return res.redirect('/?sucesso=Receita e relatos excluidos permanentemente');
        } catch (error) {
            return res.redirect('/');
        }
    }

    // 6. GET - Exibição em tela cheia
    static async show(req, res) {
        try {
            const receitaData = await Receita.findByPk(req.params.id, {
                include: [
                    { model: Categoria, as: 'categorias' },
                    { model: Usuario, as: 'responsaveis' }
                ]
            });

            if (!receitaData) return res.redirect('/');
            const receita = receitaData.get({ plain: true });

            const usuarioLogadoId = req.session.usuarioId ? Number(req.session.usuarioId) : null;
            const isAdmin = !!req.session.isAdmin;
            const ehResponsavel = Array.isArray(receita.responsaveis)
                ? receita.responsaveis.some(r => Number(r.id) === usuarioLogadoId)
                : false;
            const podeEditar = isAdmin || ehResponsavel;

            const mongoOk = Comment.db && Comment.db.readyState === 1;
            const comentarios = mongoOk
                ? await Comment.find({ receita_id: receita.id }).sort({ data: -1 })
                : [];
            receita.comentarios = comentarios.map(c => ({
                autor: c.autor,
                texto: c.texto,
                data: c.data,
                dataFormatada: c.data ? c.data.toLocaleString('pt-BR', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                }) : '',
                usuario_id: c.usuario_id,
                is_admin: c.is_admin,
                isAluno: c.usuario_id !== null && c.usuario_id !== undefined
            }));

            return res.render('aluno/receita-detalhes', {
                titulo: receita.nome,
                receita,
                podeEditar,
                erro: req.query.erro,
                sucesso: req.query.sucesso
            });
        } catch (error) {
            return res.redirect('/');
        }
    }
}

module.exports = ReceitaController;