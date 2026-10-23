const userInfo = document.querySelector("#userInfo");
const message = document.querySelector("#message");
const result = document.querySelector("#result");
const csrfToken = sessionStorage.getItem("csrf_token") || "";

async function loadCurrentUser() {
  try {
    const response = await fetch("/users/me", { credentials: "same-origin" });
    const data = await response.json();

    if (!response.ok) {
      sessionStorage.removeItem("csrf_token");
      window.location.replace("/login.html");
      return;
    }

    userInfo.textContent = `E-mail: ${data.email} | Perfil: ${data.role}`;
  } catch {
    userInfo.textContent = "Não foi possível verificar a sessão.";
  }
}

document.querySelector("#refreshButton").addEventListener("click", loadCurrentUser);

document.querySelector("#adminButton").addEventListener("click", async () => {
  result.textContent = "Carregando...";
  try {
    const response = await fetch("/admin/users", { credentials: "same-origin" });
    const data = await response.json();
    result.textContent = JSON.stringify(data, null, 2);
  } catch {
    result.textContent = "Não foi possível conectar ao servidor.";
  }
});

document.querySelector("#logoutButton").addEventListener("click", async () => {
  try {
    const response = await fetch("/auth/logout", {
      method: "POST",
      credentials: "same-origin",
      headers: { "X-CSRF-Token": csrfToken }
    });
    const data = await response.json();

    if (!response.ok) {
      message.textContent = data.error || "Não foi possível sair.";
      message.className = "message error";
      return;
    }

    sessionStorage.removeItem("csrf_token");
    window.location.replace("/login.html");
  } catch {
    message.textContent = "Não foi possível conectar ao servidor.";
    message.className = "message error";
  }
});

loadCurrentUser();
