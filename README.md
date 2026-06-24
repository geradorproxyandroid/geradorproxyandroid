# 🔑 Gerador Shadow

Sistema completo de geração e gerenciamento de keys com painel administrativo e controle de usuários.

## 🚀 Deploy no Railway

**IMPORTANTE:** Este projeto está pronto para deploy no Railway. Siga o guia completo:

📖 **[RAILWAY-DEPLOY-SIMPLES.md](./RAILWAY-DEPLOY-SIMPLES.md)** - Guia passo a passo detalhado

### Requisitos:
- Conta no Railway (https://railway.app)
- Código no GitHub (você já tem!)
- 15 minutos

### Resumo do Deploy:
1. Login no Railway com GitHub
2. Deploy from GitHub repo
3. Adicionar MySQL database
4. Configurar 4 variáveis de ambiente
5. Aguardar deploy (3-5 min)
6. Criar admin
7. Site no ar! 🎉

---

## ✨ Funcionalidades

### Painel Administrativo
- ✅ Gerenciamento completo de usuários
- ✅ Controle de créditos e permissões
- ✅ Sistema de bloqueio/desbloqueio
- ✅ Estatísticas e dashboards
- ✅ Auditoria de ações

### Painel do Usuário
- ✅ Geração de keys
- ✅ Histórico de keys geradas
- ✅ Visualização de créditos
- ✅ Perfil e configurações

### Segurança
- ✅ Autenticação JWT
- ✅ Controle de IP bloqueado
- ✅ Logs de auditoria
- ✅ Proteção de rotas

---

## 🛠️ Tecnologias

- **Frontend:** React 19 + Tailwind CSS 4
- **Backend:** Express + tRPC
- **Banco de Dados:** MySQL (Drizzle ORM)
- **Autenticação:** JWT (jose)
- **Deploy:** Railway

---

## 📁 Estrutura do Projeto

```
gerador-shadowxiter/
├── client/              # Frontend React
│   ├── src/
│   │   ├── components/  # Componentes UI
│   │   ├── pages/       # Páginas
│   │   └── lib/         # Utils e tRPC
│   └── public/
├── server/              # Backend Express + tRPC
│   ├── _core/          # Core do servidor
│   ├── db.ts           # Queries do banco
│   └── routers.ts      # Rotas tRPC
├── drizzle/            # Schema e migrations
│   └── schema.ts
├── railway.toml        # Config Railway
├── create-admin.mjs    # Script criar admin
└── README.md
```

---

## 🚀 Deploy Rápido

```bash
# 1. Já tem o código no GitHub? ✅

# 2. Acesse Railway
# https://railway.app

# 3. Siga o guia
# Abra: RAILWAY-DEPLOY-SIMPLES.md
```

---

## 🔐 Primeiro Acesso

Após o deploy, crie o admin:

```bash
# Via Railway Shell
node create-admin.mjs
```

**Login padrão:**
- Usuário: `admin123`
- Senha: `thzin123`

⚠️ **IMPORTANTE:** Mude a senha após primeiro login!

---

## 📝 Scripts Disponíveis

```bash
# Desenvolvimento local
pnpm install        # Instalar dependências
pnpm dev           # Rodar em modo dev
pnpm build         # Build para produção
pnpm start         # Iniciar produção

# Banco de dados
pnpm db:push       # Aplicar schema no banco

# Qualidade
pnpm check         # Type check
pnpm test          # Rodar testes
```

---

## 🌐 Variáveis de Ambiente

No Railway, configure estas variáveis:

```env
DATABASE_URL=mysql://...      # URL do MySQL
JWT_SECRET=...                # Secret do JWT (gerar)
NODE_ENV=production           # Ambiente
PORT=3000                     # Porta
```

---

## 📊 Funcionalidades por Painel

### Admin
- Criar/editar/deletar usuários
- Adicionar/remover créditos
- Bloquear/desbloquear usuários
- Ver estatísticas gerais
- Logs de auditoria

### Usuário
- Gerar keys (consome créditos)
- Ver histórico de keys
- Visualizar saldo de créditos
- Editar perfil

---

## 🔧 Configuração do Banco

O projeto usa Drizzle ORM com MySQL:

```typescript
// drizzle/schema.ts
export const users = mysqlTable("users", {
  id: int("id").primaryKey().autoincrement(),
  username: varchar("username", { length: 255 }).notNull().unique(),
  password: varchar("password", { length: 255 }).notNull(),
  role: mysqlEnum("role", ["admin", "user"]).notNull().default("user"),
  credits: int("credits").notNull().default(0),
  // ...
});
```

---

## 🎯 Roadmap

- [ ] Sistema de notificações
- [ ] Exportar relatórios
- [ ] API pública
- [ ] Integração com pagamentos
- [ ] Dashboard analytics avançado

---

## 🆘 Suporte

**Problemas com deploy?**
→ Consulte [RAILWAY-DEPLOY-SIMPLES.md](./RAILWAY-DEPLOY-SIMPLES.md)

**Dúvidas técnicas?**
→ Abra uma issue no GitHub

**Railway:**
→ https://docs.railway.app

---

## 📄 Licença

MIT License

---

## 🎉 Pronto!

Siga o guia **RAILWAY-DEPLOY-SIMPLES.md** e tenha seu sistema online em 15 minutos!

**Boa sorte! 🚀**
