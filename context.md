# Contexto - Backend Portfolio (NestJS)

## 1. Visão Geral

API REST construída com NestJS para processar o formulário de contato do site portfolio. Recebe dados do formulário e envia email para `malvezzi.dev@gmail.com` via SMTP do Gmail usando nodemailer.

## 2. Estrutura de Arquivos

```
backend/
├── package.json           (dependências e scripts)
├── tsconfig.json          (configuração TypeScript)
├── nest-cli.json          (configuração NestJS CLI)
├── .env                   (variáveis de ambiente - NÃO commitar)
├── .env.example           (template de variáveis)
├── .gitignore             (ignora node_modules, dist, .env)
└── src/
    ├── main.ts            (bootstrap, CORS, ValidationPipe)
    ├── app.module.ts      (módulo raiz)
    └── mail/
        ├── mail.module.ts       (módulo de email)
        ├── mail.controller.ts   (endpoint POST /mail/send)
        ├── mail.service.ts      (transporter nodemailer)
        └── dto/
            └── send-mail.dto.ts (validação do body)
```

## 3. Stack e Dependências

| Pacote | Versão | Função |
|--------|--------|--------|
| `@nestjs/core` | ^10.0.0 | Framework core |
| `@nestjs/common` | ^10.0.0 | Decorators, pipes, guards |
| `@nestjs/platform-express` | ^10.0.0 | HTTP adapter (Express) |
| `@nestjs/config` | ^3.0.0 | Gerenciamento de variáveis de ambiente (.env) |
| `nodemailer` | ^6.9.0 | Envio de emails via SMTP |
| `class-validator` | ^0.14.0 | Decorators de validação (IsEmail, IsNotEmpty) |
| `class-transformer` | ^0.5.1 | Transformação de objetos para classes DTO |
| `reflect-metadata` | ^0.2.0 | Metadata reflection para decorators |
| `rxjs` | ^7.8.0 | Observables (dependência do NestJS) |
| `typescript` | ^5.0.0 | Linguagem |

## 4. Configuração

### 4.1 Variáveis de Ambiente (.env)

| Variável | Descrição |
|----------|-----------|
| `MAIL_USER` | Email Gmail usado como remetente (`malvezzi.dev@gmail.com`) |
| `MAIL_PASS` | App Password do Gmail (16 caracteres, gerada em myaccount.google.com/apppasswords) |

### 4.2 CORS

Origens permitidas:
- `http://localhost:5173` (Vite dev server)
- `http://localhost:4173` (Vite preview)

### 4.3 Porta

Aplicação roda na porta `3000`.

### 4.4 Validação Global

`ValidationPipe` habilitado globalmente - valida automaticamente todos os DTOs recebidos nos endpoints.

## 5. Arquitetura

### 5.1 Módulos

```
AppModule
├── ConfigModule.forRoot()    (carrega .env)
└── MailModule
    ├── MailController        (recebe requests)
    └── MailService           (envia emails)
```

### 5.2 Fluxo de uma Requisição

```
Frontend (fetch POST)
  → MailController.send()
    → ValidationPipe valida SendMailDto
      → MailService.sendContactEmail()
        → nodemailer transporter.sendMail()
          → Gmail SMTP (smtp.gmail.com:587)
            → Email recebido em malvezzi.dev@gmail.com
```

## 6. API

### POST /mail/send

**Request:**
```json
{
  "name": "string (obrigatório)",
  "email": "string (email válido, obrigatório)",
  "message": "string (obrigatório)"
}
```

**Response (sucesso):**
```json
{
  "success": true
}
```

**Response (erro de validação - 400):**
```json
{
  "statusCode": 400,
  "message": ["name should not be empty", "email must be an email"],
  "error": "Bad Request"
}
```

**Response (erro interno - 500):**
```json
{
  "statusCode": 500,
  "message": "Internal server error"
}
```

## 7. Email Enviado

### Configuração SMTP
- **Host:** smtp.gmail.com
- **Porta:** 587
- **Secure:** false (usa STARTTLS)
- **Auth:** App Password do Gmail

### Formato do Email
- **From:** `"Portfolio Contact" <malvezzi.dev@gmail.com>`
- **To:** `malvezzi.dev@gmail.com`
- **Reply-To:** Email do remetente (quem preencheu o formulário)
- **Subject:** `Contato via Portfolio - {nome}`
- **Body (HTML):**
  ```html
  <h2>Nova mensagem do Portfolio</h2>
  <p><strong>Nome:</strong> {name}</p>
  <p><strong>Email:</strong> {email}</p>
  <hr />
  <p><strong>Mensagem:</strong></p>
  <p>{message}</p>
  ```

## 8. Validação (DTO)

| Campo | Decorators | Regra |
|-------|-----------|-------|
| `name` | `@IsString()`, `@IsNotEmpty()` | String não vazia |
| `email` | `@IsEmail()`, `@IsNotEmpty()` | Email válido, não vazio |
| `message` | `@IsString()`, `@IsNotEmpty()` | String não vazia |

## 9. Scripts

| Script | Comando | Função |
|--------|---------|--------|
| `start:dev` | `nest start --watch` | Desenvolvimento com hot reload |
| `start` | `nest start` | Produção sem watch |
| `build` | `nest build` | Compila para `dist/` |
| `start:prod` | `node dist/main` | Roda build de produção |

## 10. Integração com Frontend

O componente `ContactForm.jsx` faz:
```javascript
fetch('http://localhost:3000/mail/send', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ name, email, message }),
})
```

Estados do formulário:
- `idle` - Formulário pronto para preenchimento
- `loading` - Requisição em andamento (campos e botão desabilitados)
- `success` - Email enviado (mostra tela de confirmação com checkmark)
- `error` - Falha no envio (mostra mensagem de erro, permite tentar novamente)

## 11. Segurança

- **CORS** restringe origens permitidas
- **ValidationPipe** sanitiza e valida input
- **App Password** isolada da senha principal do Gmail
- **.gitignore** impede commit de credenciais
- **Reply-To** configurado para responder diretamente ao remetente
