const loginForm = document.getElementById("login-form");
const loginMensagem = document.getElementById("login-mensagem");

function mostrarMensagemLogin(texto, tipo) {
  if (!loginMensagem) return;
  loginMensagem.textContent = texto;
  loginMensagem.className = `mensagem ${tipo}`;
  loginMensagem.hidden = false;
  setTimeout(() => {
    loginMensagem.hidden = true;
  }, 4000);
}

async function verificarSessao() {
  const { data: { session } } = await db.auth.getSession();
  if (session) {
    window.location.href = "index.html";
  }
}

if (loginForm) {
  loginForm.addEventListener("submit", async (evento) => {
    evento.preventDefault();

    const email = document.getElementById("email").value.trim();
    const senha = document.getElementById("senha").value;

    if (!email || !senha) {
      mostrarMensagemLogin("Preencha e-mail e senha.", "erro");
      return;
    }

    const botao = loginForm.querySelector("button[type='submit']");
    botao.disabled = true;
    botao.textContent = "Entrando...";

    const { data, error } = await db.auth.signInWithPassword({
      email: email,
      password: senha,
    });

    botao.disabled = false;
    botao.textContent = "Entrar";

    if (error) {
      mostrarMensagemLogin("E-mail ou senha inválidos.", "erro");
      return;
    }

    if (data.session) {
      window.location.href = "index.html";
    }
  });
}

verificarSessao();
