# 🚀 GUIA COMPLETO DE EXECUÇÃO SQL - JokaTech

## 📋 INSTRUÇÕES IMPORTANTES

**ANTES DE CONTINUAR COM O CÓDIGO, VOCÊ PRECISA EXECUTAR ESTES 3 ARQUIVOS SQL NO SUPABASE!**

---

## 🔥 PASSO A PASSO:

### **1️⃣ ACESSE O SUPABASE DASHBOARD**
1. Vá para: https://supabase.com/dashboard
2. Faça login na sua conta
3. Selecione o projeto **JokaTech**

---

### **2️⃣ ABRA O SQL EDITOR**
1. No menu lateral esquerdo, clique em **"SQL Editor"**
2. Clique em **"New Query"** (Nova Consulta)

---

### **3️⃣ EXECUTE OS ARQUIVOS SQL NA ORDEM:**

#### **📄 ARQUIVO 1: CREATE_COMPANY_INFO_TABLE.sql**
1. Abra o arquivo `CREATE_COMPANY_INFO_TABLE.sql`
2. Copie **TODO** o conteúdo
3. Cole no SQL Editor do Supabase
4. Clique em **"Run"** (Executar)
5. ✅ Aguarde a mensagem de sucesso

**O que este arquivo faz:**
- Cria a tabela `company_info` para armazenar todas as configurações do site
- Permite editar logo, nome, contatos, redes sociais, métodos de pagamento, etc.
- Tudo em tempo real pelo Dashboard Admin

---

#### **📄 ARQUIVO 2: ADD_USER_CONTROL_COLUMNS.sql**
1. Abra o arquivo `ADD_USER_CONTROL_COLUMNS.sql`
2. Copie **TODO** o conteúdo
3. Cole no SQL Editor do Supabase
4. Clique em **"Run"** (Executar)
5. ✅ Aguarde a mensagem de sucesso

**O que este arquivo faz:**
- Adiciona colunas na tabela `perfis` para controle de usuários
- Permite banir, suspender, adicionar notas do admin
- Controle total sobre clientes e vendedores

---

#### **📄 ARQUIVO 3: CREATE_NEWS_TABLE.sql**
1. Abra o arquivo `CREATE_NEWS_TABLE.sql`
2. Copie **TODO** o conteúdo
3. Cole no SQL Editor do Supabase
4. Clique em **"Run"** (Executar)
5. ✅ Aguarde a mensagem de sucesso

**O que este arquivo faz:**
- Cria a tabela `news` para gerenciar notícias/novidades
- Permite adicionar, editar e remover notícias pelo Dashboard Admin
- Já insere 3 notícias de exemplo

---

## ✅ VERIFICAÇÃO

Após executar os 3 arquivos, verifique se as tabelas foram criadas:

1. No Supabase Dashboard, vá em **"Table Editor"**
2. Você deve ver as seguintes tabelas:
   - ✅ `company_info` (nova)
   - ✅ `news` (nova)
   - ✅ `perfis` (atualizada com novas colunas)

---

## 🎯 PRÓXIMOS PASSOS

Após executar os 3 arquivos SQL com sucesso, **ME CONFIRME** e eu continuarei implementando:

1. ✅ **Página Meu Perfil** - Tema dark completo, botão voltar ao site
2. ✅ **Aba Marketplace Corrigida** - Aprovar/rejeitar produtos funcionando
3. ✅ **Carrinho e Favoritos por Usuário** - Separado por conta
4. ✅ **Bandeiras de Idiomas** - Corrigidas para PC e mobile
5. ✅ **Cores Vermelhas** - Substituir dourado por vermelho em todo o site
6. ✅ **Navbar e Footer** - Conectados ao company_info para edição em tempo real
7. ✅ **Aba Novidades** - Gerenciar notícias pelo Dashboard Admin

---

## ⚠️ PROBLEMAS COMUNS

### **Erro: "relation already exists"**
- **Solução:** A tabela já existe. Pode ignorar este erro.

### **Erro: "permission denied"**
- **Solução:** Verifique se você está logado como admin no Supabase.

### **Erro: "column already exists"**
- **Solução:** A coluna já existe. Pode ignorar este erro.

---

## 📞 PRECISA DE AJUDA?

Se encontrar algum erro durante a execução dos arquivos SQL, **ME ENVIE:**
1. A mensagem de erro completa
2. Qual arquivo estava executando
3. Screenshot do erro (se possível)

---

## 🔥 IMPORTANTE

**NÃO PULE ESTA ETAPA!** 

Os arquivos SQL são essenciais para que o Dashboard Admin funcione corretamente. Sem eles, você não conseguirá:
- ❌ Editar logo, nome e descrições do site
- ❌ Editar contatos e redes sociais
- ❌ Banir ou suspender usuários
- ❌ Gerenciar notícias/novidades
- ❌ Controlar métodos de pagamento

---

## ✅ APÓS EXECUTAR OS 3 ARQUIVOS

**ME CONFIRME** dizendo:
- "✅ Executei os 3 arquivos SQL com sucesso!"

E eu continuarei implementando todas as melhorias restantes! 🚀💪

---

**Boa sorte! Qualquer dúvida, estou aqui para ajudar! 😊**
