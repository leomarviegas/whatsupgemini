# WhatsUpGemini - Guia de Instalação

Guia completo passo a passo para instalar e configurar a extensão WhatsUpGemini para Chrome.

---

## Pré-requisitos

Antes de instalar o WhatsUpGemini, certifique-se de ter:

- ✅ **Google Chrome** (versão 88 ou superior) ou qualquer navegador baseado em Chromium
- ✅ **Conta WhatsApp** com acesso ao WhatsApp Web
- ✅ **Conta Google** para obter a chave da API Gemini
- ✅ **Conexão com a Internet** para chamadas de API

---

## Métodos de Instalação

### Método 1: Instalar do Código Fonte (Modo Desenvolvedor)

Este método é para desenvolvedores ou usuários que desejam instalar a extensão do repositório GitHub.

#### Passo 1: Clonar o Repositório

Abra seu terminal e execute:

```bash
git clone https://github.com/leomarviegas/whatsupgemini.git
cd whatsupgemini
```

Ou baixe o arquivo ZIP:
1. Visite https://github.com/leomarviegas/whatsupgemini
2. Clique em "Code" → "Download ZIP"
3. Extraia o arquivo ZIP para uma pasta

#### Passo 2: Obter a Chave da API Google Gemini

1. Visite o [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Faça login com sua conta Google
3. Clique no botão "Create API Key"
4. Selecione um projeto do Google Cloud (ou crie um novo)
5. Copie a chave da API gerada (começa com `AIza...`)
6. **Importante:** Mantenha esta chave segura e não a compartilhe publicamente

**Exemplo de Chave da API:**
```
AIzaSyABC123def456GHI789jkl012MNO345pqr678
```

#### Passo 3: Carregar a Extensão no Chrome

1. Abra o Google Chrome
2. Navegue até `chrome://extensions/`
3. Ative o "Modo do desenvolvedor" usando o botão no canto superior direito
4. Clique no botão "Carregar sem compactação"
5. Navegue até a pasta do repositório clonado
6. Selecione a pasta `whats-up-gemini-v1`
7. Clique em "Selecionar pasta"

**Guia Visual:**
```
chrome://extensions/
    ↓
[Modo do desenvolvedor: ATIVADO]
    ↓
[Carregar sem compactação]
    ↓
Selecionar: /caminho/para/whatsupgemini/whats-up-gemini-v1/
    ↓
Extensão carregada! ✅
```

#### Passo 4: Configurar a Chave da API

1. Clique no ícone de Extensões (peça de quebra-cabeça) na barra de ferramentas do Chrome
2. Encontre "WhatsUpGemini?" na lista
3. Clique no ícone da extensão
4. Cole sua chave da API Gemini no campo de entrada
5. Clique em "Save API Key"
6. Aguarde a mensagem de sucesso: "API Key saved successfully!"

#### Passo 5: Verificar a Instalação

1. Abra o [WhatsApp Web](https://web.whatsapp.com)
2. Faça login com seu telefone (escaneie o código QR)
3. Navegue até qualquer conversa com mensagens de voz
4. Procure pelos botões "Transcribe" ao lado das mensagens de voz
5. Se os botões aparecerem, a instalação foi bem-sucedida! ✅

---

### Método 2: Instalar da Chrome Web Store (Em Breve)

A extensão estará disponível na Chrome Web Store no futuro. Este método fornecerá atualizações automáticas e instalação mais fácil.

**Passos (quando disponível):**
1. Visite a Chrome Web Store
2. Pesquise por "WhatsUpGemini"
3. Clique em "Usar no Chrome"
4. Configure a chave da API
5. Comece a usar!

---

## Configuração Pós-Instalação

### Configurando a Extensão

#### Gerenciamento da Chave da API

**Para Salvar a Chave da API:**
1. Clique no ícone da extensão na barra de ferramentas do Chrome
2. Digite sua chave da API Gemini
3. Clique em "Save API Key"

**Para Visualizar a Chave da API Salva:**
1. Clique no ícone da extensão
2. Clique no ícone do olho (👁️) para alternar a visibilidade
3. A chave será exibida em texto simples

**Para Atualizar a Chave da API:**
1. Clique no ícone da extensão
2. Limpe a chave existente
3. Digite a nova chave da API
4. Clique em "Save API Key"

#### Permissões da Extensão

A extensão requer as seguintes permissões:

| Permissão | Finalidade | Obrigatória |
|-----------|------------|-------------|
| `activeTab` | Acessar a página do WhatsApp Web | Sim |
| `storage` | Armazenar a chave da API com segurança | Sim |
| `scripting` | Injetar scripts auxiliares | Sim |
| `*://*.whatsapp.com/*` | Executar apenas no WhatsApp Web | Sim |

**Para Revisar as Permissões:**
1. Vá para `chrome://extensions/`
2. Encontre "WhatsUpGemini?"
3. Clique em "Detalhes"
4. Role até a seção "Permissões"

---

## Verificação e Teste

### Testar a Instalação

1. **Abrir o WhatsApp Web**
   ```
   https://web.whatsapp.com
   ```

2. **Encontrar uma Mensagem de Voz**
   - Abra qualquer conversa com mensagens de voz
   - Ou envie uma mensagem de voz para si mesmo

3. **Clicar em Transcrever**
   - Clique no botão "Transcribe"
   - Aguarde 2-5 segundos para o processamento
   - A transcrição deve aparecer abaixo da mensagem

### Comportamento Esperado

**Transcrição Bem-Sucedida:**
- O botão muda para "Transcribing..."
- Após alguns segundos, a transcrição aparece em uma caixa cinza
- O botão retorna ao estado "Transcribe"

**Tratamento de Erros:**
- Se a chave da API for inválida, você verá uma mensagem de erro
- Se a extração de áudio falhar, você verá "Audio data not found"
- Se a rede falhar, você verá "Network error"

---

## Solução de Problemas de Instalação

### Problema 1: Extensão Não Carrega

**Sintomas:**
- "Carregar sem compactação" falha
- Mensagem de erro aparece

**Soluções:**
1. Certifique-se de ter selecionado a pasta correta (`whats-up-gemini-v1`)
2. Verifique se o `manifest.json` existe na pasta
3. Verifique se a versão do Chrome é 88 ou superior
4. Tente reiniciar o Chrome

### Problema 2: Chave da API Não Salva

**Sintomas:**
- "API Key saved successfully!" não aparece
- A chave desaparece após fechar o popup

**Soluções:**
1. Verifique as permissões de armazenamento do Chrome
2. Certifique-se de estar conectado ao Chrome
3. Tente desativar e reativar a extensão
4. Verifique as configurações de sincronização do Chrome

### Problema 3: Botão Transcrever Não Aparece

**Sintomas:**
- Nenhum botão "Transcribe" nas mensagens de voz
- A extensão parece inativa

**Soluções:**
1. Atualize a página do WhatsApp Web (F5)
2. Verifique se a extensão está ativada em `chrome://extensions/`
3. Verifique se você está em `web.whatsapp.com` (não `web.whatsapp.com/send`)
4. Verifique o console do navegador para erros (F12)

### Problema 4: Erro "Authentication Failed"

**Sintomas:**
- Clicar em transcrever mostra "Authentication failed"
- Erros de token JWT no console

**Soluções:**
1. Atualize a página do WhatsApp Web
2. Tente clicar em transcrever novamente (o token pode ter expirado)
3. Desative e reative a extensão
4. Verifique se o relógio do sistema está correto

### Problema 5: Erro de Formato da Chave da API

**Sintomas:**
- Mensagem "Invalid API key format"
- Não consegue salvar a chave da API

**Soluções:**
1. Verifique se a chave começa com `AIza`
2. Certifique-se de que a chave tem pelo menos 30 caracteres
3. Verifique se há espaços extras ou quebras de linha
4. Copie a chave diretamente do Google AI Studio

---

## Opções de Instalação Avançadas

### Instalando em Múltiplos Navegadores

O WhatsUpGemini pode ser instalado em qualquer navegador baseado em Chromium:

**Navegadores Suportados:**
- Google Chrome
- Microsoft Edge
- Brave Browser
- Opera
- Vivaldi

**Passos de Instalação:**
1. Siga os mesmos passos da instalação do Chrome
2. Navegue até a página de extensões do navegador
3. Ative o modo desenvolvedor
4. Carregue a extensão sem compactação

### Instalando para Múltiplos Perfis do Chrome

Se você usa múltiplos perfis do Chrome:

1. Instale a extensão em cada perfil separadamente
2. Cada perfil precisa de sua própria configuração de chave da API
3. As chaves da API não são compartilhadas entre perfis

### Instalando no Chrome OS

1. Abra o navegador Chrome no Chrome OS
2. Siga os passos de instalação padrão
3. A extensão funciona da mesma forma que em outras plataformas

---

## Atualizando a Extensão

### Atualizações Manuais (Modo Desenvolvedor)

1. Navegue até a pasta do repositório
2. Execute `git pull origin main` para obter as últimas alterações
3. Vá para `chrome://extensions/`
4. Clique no ícone de atualização no card da extensão
5. A extensão será recarregada com o novo código

### Atualizações Automáticas (Chrome Web Store)

Quando instalada da Chrome Web Store:
- As atualizações acontecem automaticamente
- Nenhuma ação do usuário é necessária
- As atualizações geralmente chegam em 24-48 horas

---

## Desinstalação

### Remoção Completa

1. Vá para `chrome://extensions/`
2. Encontre "WhatsUpGemini?"
3. Clique em "Remover"
4. Confirme a remoção

**Limpeza de Dados:**
- A chave da API é automaticamente removida
- Nenhum dado residual permanece
- O segredo JWT é excluído

### Desativação Temporária

Para desativar sem remover:
1. Vá para `chrome://extensions/`
2. Encontre "WhatsUpGemini?"
3. Alterne o botão para DESLIGADO
4. A extensão permanece instalada mas inativa

---

## Lista de Verificação de Instalação

Use esta lista para garantir a instalação adequada:

- [ ] Chrome versão 88 ou superior instalado
- [ ] Repositório clonado ou baixado
- [ ] Modo desenvolvedor ativado no Chrome
- [ ] Extensão carregada da pasta `whats-up-gemini-v1`
- [ ] Chave da API Google Gemini obtida
- [ ] Chave da API configurada no popup da extensão
- [ ] WhatsApp Web aberto e logado
- [ ] Botões Transcribe visíveis nas mensagens de voz
- [ ] Transcrição de teste bem-sucedida

---

## Obtendo Ajuda

Se você encontrar problemas durante a instalação:

1. **Verifique a Documentação:**
   - [README.md](../README.md)
   - [TROUBLESHOOTING.md](TROUBLESHOOTING.md)
   - [FAQ.md](FAQ.md)

2. **Pesquise Problemas Existentes:**
   - Visite [GitHub Issues](https://github.com/leomarviegas/whatsupgemini/issues)
   - Pesquise por problemas semelhantes

3. **Relate um Novo Problema:**
   - Crie um novo issue com:
     - Versão do Chrome
     - Sistema operacional
     - Mensagens de erro
     - Passos para reproduzir

4. **Suporte da Comunidade:**
   - Participe das [GitHub Discussions](https://github.com/leomarviegas/whatsupgemini/discussions)
   - Faça perguntas e obtenha ajuda da comunidade

---

## Próximos Passos

Após a instalação bem-sucedida:

1. **Leia o Guia do Usuário:** [USER_GUIDE.md](USER_GUIDE.md)
2. **Explore os Recursos:** Experimente transcrever diferentes tipos de mensagens de voz
3. **Personalize as Configurações:** Configure de acordo com suas preferências
4. **Forneça Feedback:** Compartilhe sua experiência e sugestões

---

**Instalação Concluída! 🎉**

Você está pronto para transcrever mensagens de voz do WhatsApp com precisão alimentada por IA!
