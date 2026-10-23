# Autenticação Web — PoC

Projeto didático em Node.js e Express para demonstrar autenticação com **sessão no servidor**, cookie, token CSRF e autorização por perfil.

## Tecnologias
- Node.js 20+
- Express
- SQLite (`better-sqlite3`)
- Argon2id para hash de senhas
- HTML, CSS e JavaScript 

## Como executar
1. Instale Node.js 20 ou superior.
2. No terminal, dentro desta pasta, execute `npm install`.
3. Copie `.env.example` para `.env` e troque `ADMIN_PASSWORD` por uma senha forte.
   - Windows: `copy .env.example .env`
   - Linux/macOS: `cp .env.example .env`
4. Execute `npm start`.
5. Acesse `http://localhost:3000`.

O administrador é criado na primeira execução se `ADMIN_EMAIL` e `ADMIN_PASSWORD` estiverem configurados. O cadastro público sempre cria usuários `cliente`.

## Fluxo de telas
- `/` — cadastro.
- `/login.html` — login.
- `/dashboard.html` — painel com funcionalidades protegidas.

O painel verifica a sessão pela API e redireciona para o login se não houver uma sessão válida. A proteção real é feita no backend pelas rotas e middlewares, não apenas pela interface.

## Organização
```text
public/
  index.html       # cadastro
  login.html       # login
  dashboard.html   # área após login
  style.css
  register.js
  login.js
  dashboard.js
src/
  controllers/
  middleware/
  routes/
  utils/
  database.js
server.js
.env.example
package.json
```

## Rotas da API
| Método | Endpoint | Acesso | Função |
|---|---|---|---|
| POST | `/auth/register` | Público | Cadastra usuário cliente |
| POST | `/auth/login` | Público | Valida credenciais e cria sessão |
| POST | `/auth/logout` | Login + CSRF | Encerra a sessão |
| GET | `/users/me` | Login | Exibe usuário autenticado |
| GET | `/admin/users` | Apenas admin | Lista usuários |



## Segurança 
- Senhas armazenadas com hash Argon2id.
- Token aleatório de sessão; apenas seu hash é armazenado no banco.
- Operações que alteram estado exigem token CSRF.
- Middleware separa autenticação de autorização.
- Mensagem de login genérica para credenciais incorretas.
