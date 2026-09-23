const form = document.getElementById("filme-form");
const formTitle = document.getElementById("form-title");
const btnCancelar = document.getElementById("btn-cancelar");
const inputBusca = document.getElementById("busca");
const listaFilmes = document.getElementById("lista-filmes");
const contador = document.getElementById("contador");
const mensagem = document.getElementById("mensagem");

let filmes = [];

function escapeHtml(texto) {
  const div = document.createElement("div");
  div.textContent = texto ?? "";
  return div.innerHTML;
}

function mostrarMensagem(texto, tipo) {
  mensagem.textContent = texto;
  mensagem.className = `mensagem ${tipo}`;
  mensagem.hidden = false;
  setTimeout(() => {
    mensagem.hidden = true;
  }, 4000);
}

function limparFormulario() {
  form.reset();
  document.getElementById("filme-id").value = "";
  formTitle.textContent = "Cadastrar Filme";
  btnCancelar.hidden = true;
}

function renderizar(lista) {
  contador.textContent = filmes.length;

  if (lista.length === 0) {
    listaFilmes.innerHTML = '<p class="vazio">Nenhum filme encontrado.</p>';
    return;
  }

  listaFilmes.innerHTML = lista
    .map((filme) => {
      const capa = filme.imagem_url
        ? `<img src="${escapeHtml(filme.imagem_url)}" alt="Capa de ${escapeHtml(filme.titulo)}" onerror="this.parentElement.innerHTML='🎬'" />`
        : "🎬";
      const nota = filme.nota != null ? `<span class="badge badge-nota">⭐ ${Number(filme.nota).toFixed(1)}</span>` : "";
      const sinopse = filme.sinopse
        ? `<p class="filme-sinopse">${escapeHtml(filme.sinopse)}</p>`
        : "";

      return `
        <article class="filme">
          <div class="filme-capa">${capa}</div>
          <div class="filme-corpo">
            <h3 class="filme-titulo">${escapeHtml(filme.titulo)}</h3>
            <div class="filme-meta">
              <span class="badge">${escapeHtml(filme.genero)}</span>
              <span class="badge">${escapeHtml(String(filme.ano))}</span>
              ${nota}
            </div>
            <p class="filme-info">Direção: ${escapeHtml(filme.diretor)}</p>
            ${sinopse}
            <div class="filme-acoes">
              <button class="btn btn-small btn-edit" data-acao="editar" data-id="${filme.id}">Editar</button>
              <button class="btn btn-small btn-delete" data-acao="excluir" data-id="${filme.id}">Excluir</button>
            </div>
          </div>
        </article>
      `;
    })
    .join("");
}

async function carregarFilmes() {
  listaFilmes.innerHTML = '<p class="carregando">Carregando filmes...</p>';

  const { data, error } = await db
    .from("filmes")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    listaFilmes.innerHTML = '<p class="vazio">Erro ao carregar filmes.</p>';
    mostrarMensagem(`Erro ao carregar: ${error.message}`, "erro");
    return;
  }

  filmes = data || [];
  aplicarBusca();
}

function aplicarBusca() {
  const termo = inputBusca.value.trim().toLowerCase();
  if (!termo) {
    renderizar(filmes);
    return;
  }

  const filtrados = filmes.filter(
    (f) =>
      f.titulo.toLowerCase().includes(termo) ||
      f.genero.toLowerCase().includes(termo) ||
      f.diretor.toLowerCase().includes(termo)
  );
  renderizar(filtrados);
}

async function salvarFilme(evento) {
  evento.preventDefault();

  const id = document.getElementById("filme-id").value;
  const filme = {
    titulo: document.getElementById("titulo").value.trim(),
    genero: document.getElementById("genero").value,
    ano: Number(document.getElementById("ano").value),
    diretor: document.getElementById("diretor").value.trim(),
    nota: document.getElementById("nota").value ? Number(document.getElementById("nota").value) : null,
    sinopse: document.getElementById("sinopse").value.trim() || null,
  };

  if (id) {
    const { error } = await db.from("filmes").update(filme).eq("id", id);
    if (error) {
      mostrarMensagem(`Erro ao alterar: ${error.message}`, "erro");
      return;
    }
    mostrarMensagem("Filme alterado com sucesso!", "sucesso");
  } else {
    const { error } = await db.from("filmes").insert([filme]);
    if (error) {
      mostrarMensagem(`Erro ao cadastrar: ${error.message}`, "erro");
      return;
    }
    mostrarMensagem("Filme cadastrado com sucesso!", "sucesso");
  }

  limparFormulario();
  await carregarFilmes();
}

function editarFilme(id) {
  const filme = filmes.find((f) => f.id === id);
  if (!filme) return;

  document.getElementById("filme-id").value = filme.id;
  document.getElementById("titulo").value = filme.titulo;
  document.getElementById("genero").value = filme.genero;
  document.getElementById("ano").value = filme.ano;
  document.getElementById("diretor").value = filme.diretor;
  document.getElementById("nota").value = filme.nota ?? "";
  document.getElementById("sinopse").value = filme.sinopse ?? "";

  formTitle.textContent = "Alterar Filme";
  btnCancelar.hidden = false;
  window.scrollTo({ top: 0, behavior: "smooth" });
}

async function excluirFilme(id) {
  const filme = filmes.find((f) => f.id === id);
  const confirmar = confirm(`Deseja realmente excluir "${filme ? filme.titulo : ""}"?`);
  if (!confirmar) return;

  const { error } = await db.from("filmes").delete().eq("id", id);
  if (error) {
    mostrarMensagem(`Erro ao excluir: ${error.message}`, "erro");
    return;
  }

  mostrarMensagem("Filme excluído com sucesso!", "sucesso");
  await carregarFilmes();
}

form.addEventListener("submit", salvarFilme);

btnCancelar.addEventListener("click", () => {
  limparFormulario();
});

inputBusca.addEventListener("input", aplicarBusca);

listaFilmes.addEventListener("click", (evento) => {
  const botao = evento.target.closest("button[data-acao]");
  if (!botao) return;

  const id = botao.dataset.id;
  if (botao.dataset.acao === "editar") editarFilme(id);
  if (botao.dataset.acao === "excluir") excluirFilme(id);
});

carregarFilmes();
