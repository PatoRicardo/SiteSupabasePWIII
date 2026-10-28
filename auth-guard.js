(async function protegerRota() {
  const { data: { session } } = await db.auth.getSession();

  if (!session) {
    window.location.href = "login.html";
    return;
  }

  const usuarioEmail = document.getElementById("usuario-email");
  if (usuarioEmail && session.user) {
    usuarioEmail.textContent = session.user.email;
  }

  const btnSair = document.getElementById("btn-sair");
  if (btnSair) {
    btnSair.addEventListener("click", async () => {
      await db.auth.signOut();
      window.location.href = "login.html";
    });
  }
})();
