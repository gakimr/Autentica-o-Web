let csrfToken = "";

const result = document.querySelector("#result");
const status = document.querySelector("#status");

function show(data) {
  result.textContent = JSON.stringify(data, null, 2);
  if (data?.error) status.textContent = data.error;
  else if (data?.role) status.textContent = `Login realizado. Perfil: ${data.role}`;
  else if (data?.email) status.textContent = `Autenticado como ${data.email} (${data.role}).`;
  else if (data?.message) status.textContent = data.message;
}

async function api(path, method = "GET", body = null, needsCsrf = false) {
  const headers = {};
  if (body) headers["Content-Type"] = "application/json";
  if (needsCsrf) headers["X-CSRF-Token"] = csrfToken;

  const response = await fetch(path, {
    method,
    headers,
    credentials: "same-origin",
    body: body ? JSON.stringify(body) : undefined
  });

  const data = await response.json().catch(() => ({ error: "Resposta inválida do servidor" }));
  show(data);
  return { response, data };
}

document.querySelector("#registerForm").addEventListener("submit", async (event) => {
  event.preventDefault();
  await api("/auth/register", "POST", {
    email: document.querySelector("#registerEmail").value,
    password: document.querySelector("#registerPassword").value
  });
});

document.querySelector("#loginForm").addEventListener("submit", async (event) => {
  event.preventDefault();
  const { response, data } = await api("/auth/login", "POST", {
    email: document.querySelector("#loginEmail").value,
    password: document.querySelector("#loginPassword").value
  });
  if (response.ok) csrfToken = data.csrf_token;
});

document.querySelector("#meButton").addEventListener("click", () => api("/users/me"));
document.querySelector("#adminButton").addEventListener("click", () => api("/admin/users"));
document.querySelector("#logoutButton").addEventListener("click", async () => {
  const { response } = await api("/auth/logout", "POST", null, true);
  if (response.ok) {
    csrfToken = "";
    status.textContent = "Você saiu da aplicação.";
  }
});
