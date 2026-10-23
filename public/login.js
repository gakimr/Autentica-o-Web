const form = document.querySelector("#loginForm");
const message = document.querySelector("#message");

if (new URLSearchParams(window.location.search).get("registered") === "1") {
  message.textContent = "Cadastro concluído. Agora faça login.";
  message.className = "message success";
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  message.textContent = "";

  try {
    const response = await fetch("/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify({
        email: document.querySelector("#email").value.trim(),
        password: document.querySelector("#password").value
      })
    });
    const data = await response.json();

    if (!response.ok) {
      message.textContent = data.error || "Não foi possível entrar.";
      message.className = "message error";
      return;
    }

    // O cookie HttpOnly é gerenciado pelo navegador; o CSRF fica na sessão da aba.
    sessionStorage.setItem("csrf_token", data.csrf_token);
    window.location.href = "/dashboard.html";
  } catch {
    message.textContent = "Não foi possível conectar ao servidor.";
    message.className = "message error";
  }
});
