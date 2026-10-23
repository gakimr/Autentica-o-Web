const form = document.querySelector("#registerForm");
const message = document.querySelector("#message");

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  message.textContent = "";

  const email = document.querySelector("#email").value.trim();
  const password = document.querySelector("#password").value;
  const confirmPassword = document.querySelector("#confirmPassword").value;

  if (password !== confirmPassword) {
    message.textContent = "As senhas não coincidem.";
    message.className = "message error";
    return;
  }

  try {
    const response = await fetch("/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await response.json();

    if (!response.ok) {
      message.textContent =
        data.error || "Não foi possível realizar o cadastro.";
      message.className = "message error";
      return;
    }

    message.textContent = "Cadastro realizado! Faça o login";
    message.className = "message success";
  } catch {
    message.textContent = "Não foi possível conectar ao servidor.";
    message.className = "message error";
  }
});
