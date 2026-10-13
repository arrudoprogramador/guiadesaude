const inputBusca = document.getElementById('busca-input');
const cards = document.querySelectorAll('#cards .card');
const semResultados = document.getElementById('sem-resultados');
const contador = document.getElementById('contador');

function atualizarContador() {
    const visiveis = document.querySelectorAll('#cards .card:not([hidden]):not(.card-oculto)').length;

    contador.textContent = visiveis === 1
        ? '1 unidade encontrada'
        : visiveis + ' unidades encontradas';

    if (semResultados) {
        semResultados.hidden = visiveis > 0;
    }
}

let tipoAtual = 'todos';
let ordemAtual = 'padrao';
let prioridadeAtiva = false;

function filtrarCards() {
    const termo = inputBusca.value.trim().toLowerCase();

    cards.forEach((card) => {
        const unidade = unidadeDoCard(card);
        const tipos = unidade
            ? (Array.isArray(unidade.tipoUnidade) ? unidade.tipoUnidade : [unidade.tipoUnidade])
            : [];
        const correspondeBusca = card.textContent.toLowerCase().includes(termo);
        const correspondeTipo = tipoAtual === 'todos' || tipos.includes(tipoAtual);

        card.hidden = !correspondeBusca || !correspondeTipo;
    });

    atualizarContador();
}

    atualizarContador();



if (inputBusca) {
    inputBusca.addEventListener('input', filtrarCards);
    inputBusca.addEventListener('search', filtrarCards);
}

const modal = document.getElementById('modal-unidade');
const modalImagem = document.getElementById('modal-imagem');
const modalNome = document.getElementById('modal-nome');
const modalEndereco = document.getElementById('modal-endereco');
const modalHorario = document.getElementById('modal-horario');
const modalMapa = document.getElementById('modal-mapa');
const modalFechar = document.getElementById('modal-fechar');
const listaCards = document.getElementById('cards');
const modalStatus = document.getElementById('modal-status');
const modalTelefone = document.getElementById('modal-telefone');
const modalVoltar = document.getElementById('modal-voltar');

document.querySelectorAll('#cards .card').forEach((card) => {
    const unidade = unidades.find((item) => item.id === Number(card.dataset.id));
    if (!unidade) return;

    const especialidades = document.createElement('div');
    especialidades.className = 'especialidades-card';

    const tituloEspecialidades = document.createElement('strong');
    tituloEspecialidades.textContent = 'Especialidades';
    especialidades.appendChild(tituloEspecialidades);

    const listaEspecialidades = document.createElement('ul');
    unidade.especialidades.forEach((especialidade) => {
        const item = document.createElement('li');
        item.textContent = especialidade;
        listaEspecialidades.appendChild(item);
    });
    especialidades.appendChild(listaEspecialidades);

    card.querySelector('.descricao-card').appendChild(especialidades);
});

listaCards.addEventListener('click', (evento) => {
    const card = evento.target.closest('.card');
    if (!card) return;

    const imagem = card.querySelector('.imagem-card img');
    const nome = card.querySelector('.title-card p').textContent;
    const linhas = card.querySelectorAll('.linha-cards span');
    const endereco = linhas[0].textContent;
    const horario = linhas[1].textContent;
    const telefone = linhas[2].textContent;

    modalImagem.src = imagem.src;
    modalImagem.alt = imagem.alt;
    modalNome.textContent = nome;
    modalEndereco.textContent = endereco;
    modalHorario.textContent = horario;
    modalTelefone.textContent = telefone;

    const selo = card.querySelector('.selo');
    modalStatus.textContent = selo.textContent;
    modalStatus.className = 'selo-modal selo-' + card.dataset.status;

    //Google Maps
    modalMapa.href =
        'https://www.google.com/maps/search/?api=1&query=' +
        encodeURIComponent(nome + ' ' + endereco);

    modal.showModal();
});

modalFechar.addEventListener('click', () => {
    modal.close();
});

modalVoltar.addEventListener('click', () => {
    modal.close();
});

modal.addEventListener('click', (evento) => {
    if (evento.target === modal) {
        modal.close();
    }
});

//Status da Unidade
function obterStatus(unidade, agora = new Date()) {
    const dia = agora.getDay();
    const horaAtual = agora.getHours() + agora.getMinutes() / 60;

    if (!unidade.dias.includes(dia)) return 'fechado';
    if (horaAtual < unidade.abre || horaAtual >= unidade.fecha) return 'fechado';

    if (unidade.fecha !== 24 && unidade.fecha - horaAtual <= 1) return 'fecha-em-breve';

    return 'aberto';
}

function unidadeDoCard(card) {
    return unidades.find((u) => u.id === Number(card.dataset.id));
}

//Selos de disponibilidade
function atualizarSelos() {
    document.querySelectorAll('.card').forEach((card) => {
        const unidade = unidadeDoCard(card);
        if (!unidade) return;

        const status = obterStatus(unidade);
        card.dataset.status = status;

        let selo = card.querySelector('.selo');
        if (!selo) {
            selo = document.createElement('span');
            card.querySelector('.imagem-card').appendChild(selo);
        }

        selo.className = 'selo selo-' + status;

        if (status === 'aberto') selo.textContent = 'Aberto agora';
        if (status === 'fechado') selo.textContent = 'Fechado';
        if (status === 'fecha-em-breve') selo.textContent = 'Fecha às ' + unidade.fecha + 'h';
    });
}

atualizarSelos();
setInterval(atualizarSelos, 60000);

//Filtro de Prioridade
const botaoPrioridade = document.getElementById('btn-prioridade');
const containerCards = document.getElementById('cards');

function pesoPrioridade(unidade, status) {
    if (status === 'fechado') return 3;
    if (unidade.abre === 0 && unidade.fecha === 24) return 0;  // 24h aberta: topo
    if (status === 'aberto') return 1;
    return 2;  // fecha em breve
}

function aplicarPrioridade(ativa) {
    prioridadeAtiva = ativa;
    containerCards.querySelectorAll('.card').forEach((card) => {
        card.classList.toggle('card-oculto', ativa && card.dataset.status === 'fechado');
    });
    ordenarCards();
    filtrarCards();
}

botaoPrioridade.addEventListener('click', () => {
    const ativa = botaoPrioridade.getAttribute('aria-pressed') !== 'true';

    botaoPrioridade.setAttribute('aria-pressed', ativa);
    botaoPrioridade.textContent = ativa
        ? 'Mostrar todas as unidades'
        : 'Preciso de atendimento agora';

    aplicarPrioridade(ativa);
});

function nomePorCard(card) {
    return card.querySelector('.title-card p').textContent.trim();
}

function ordenarCards() {
    const cardsArr = Array.from(containerCards.querySelectorAll('.card'));

    cardsArr.sort((a, b) => {
        if (prioridadeAtiva) {
            const statusOrder = pesoPrioridade(unidadeDoCard(a), a.dataset.status)
                - pesoPrioridade(unidadeDoCard(b), b.dataset.status);
            if (statusOrder !== 0) return statusOrder;
        }

        if (ordemAtual === 'az') {
            return nomePorCard(a).localeCompare(nomePorCard(b), 'pt-BR', { sensitivity: 'base' });
        }
        if (ordemAtual === 'za') {
            return nomePorCard(b).localeCompare(nomePorCard(a), 'pt-BR', { sensitivity: 'base' });
        }
        return Number(a.dataset.id) - Number(b.dataset.id);
    });

    cardsArr.forEach(card => containerCards.appendChild(card));
}

const btnFiltros = document.getElementById('btn-filtros');
const modalFiltros = document.getElementById('modal-filtros');
const fecharFiltros = document.getElementById('fechar-filtros');
const formFiltros = document.getElementById('form-filtros');
const filtroOrdenacao = document.getElementById('filtro-ordenacao');
const filtroTipo = document.getElementById('filtro-tipo');
const limparFiltros = document.getElementById('limpar-filtros');

btnFiltros.addEventListener('click', () => {
    filtroOrdenacao.value = ordemAtual;
    filtroTipo.value = tipoAtual;
    modalFiltros.showModal();
});

fecharFiltros.addEventListener('click', () => {
    modalFiltros.close();
});

modalFiltros.addEventListener('click', (evento) => {
    if (evento.target === modalFiltros) modalFiltros.close();
});

formFiltros.addEventListener('submit', (evento) => {
    evento.preventDefault();
    ordemAtual = filtroOrdenacao.value;
    tipoAtual = filtroTipo.value;
    ordenarCards();
    filtrarCards();
    modalFiltros.close();
});

limparFiltros.addEventListener('click', () => {
    ordemAtual = 'padrao';
    tipoAtual = 'todos';
    filtroOrdenacao.value = ordemAtual;
    filtroTipo.value = tipoAtual;
    ordenarCards();
    filtrarCards();
    modalFiltros.close();
});