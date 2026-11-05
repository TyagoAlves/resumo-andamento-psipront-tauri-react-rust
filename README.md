# Clínica Psi — site de download

Site estático do **Clínica Psi** (prontuário eletrônico para clínicas
psicológicas), publicado no GitHub Pages. A página inicial existe para uma coisa:
**fazer o download do aplicativo para Windows**.

- `index.html` — landing de download (hero com CTA, recursos, telas, como
  instalar, acesso de demonstração e requisitos).
- `notas.html` — notas técnicas e andamento (arquitetura, investigação da falha
  intermitente nos testes, qualidade e próximos passos). Fora do índice dos
  buscadores (`noindex`).
- Sem framework, sem build: HTML + CSS + JS puros, sem dependência externa.
- 7 capturas reais do sistema em `assets/prints/` (dados fictícios de demonstração).
- Instalador de avaliação em `download/` — o botão baixa da própria página.

## Download

O botão aponta para `download/clinica-psi_1.0.0_x64-setup.exe` (instalador NSIS,
~2,5 MB, instalação por usuário, sem UAC). Para publicar uma versão nova, gere o
instalador, substitua o arquivo em `download/` e atualize o nome nos links de
`index.html` (ou mantenha o mesmo nome e troque só o conteúdo).

O binário publicado é o mesmo da branch `TyagoAlves-dev-v-0.0.0` do repositório
(SHA-256 `EEFCAB138226810C47845A6FD96C0FA88C63A41BE5EEAE2F466C07F971CDAE15`).

## Ver localmente

Basta abrir `index.html` no navegador. Para simular o Pages (e testar caminhos
relativos corretamente), sirva a pasta:

```powershell
npx.cmd --yes serve .
```

Validação automatizada (Playwright): erros de console, imagens, links, overflow
em 4 larguras e troca da galeria.

```powershell
$env:NODE_PATH = "C:\caminho\para\o\projeto\Sandbox\node_modules"
node tools/validar-pagina.cjs
```

## Publicar no GitHub Pages

O repositório já traz o workflow `.github/workflows/pages.yml`.

1. Em **Settings → Pages → Build and deployment**, escolha **Source: GitHub Actions**.
2. O workflow roda a cada push na `main` e publica a raiz do repositório.
3. O endereço fica em
   `https://<usuario>.github.io/resumo-andamento-psipront-tauri-react-rust/`.

```powershell
git add .
git commit -m "Atualiza o site"
git push origin main
```

> **Repositório privado:** o GitHub Pages só publica repositórios privados em
> planos pagos (Pro/Team/Enterprise). Em conta gratuita, o repositório precisa
> ser público para a página ficar no ar.

### Alternativa sem Actions

Se preferir não usar workflow, apague `.github/` e em **Settings → Pages**
escolha **Deploy from a branch → main → / (root)**. O arquivo `.nojekyll`
já está incluído para o Jekyll não ignorar nenhuma pasta.

## Atualizar as capturas de tela

As imagens vêm do app real, não de mockups. Com a versão web rodando em
`http://127.0.0.1:5199`:

```powershell
$env:NODE_PATH = "C:\caminho\para\o\projeto\Sandbox\node_modules"
node tools/capturar-prints.cjs
```

O script faz login com o usuário de demonstração, percorre as telas e grava os
JPEGs em `assets/prints/`. Ajuste `BASE_URL` se o servidor estiver em outra porta.

## Estrutura

```
index.html                  landing de download
notas.html                  notas técnicas e andamento (noindex)
download/*.exe              instalador servido pelo Pages
assets/css/estilo.css       estilos (tema teal, responsivo, reduced-motion)
assets/js/app.js            galeria de telas, topo fixo, animação de entrada
assets/prints/*.jpg         capturas do sistema
assets/favicon.svg          ícone
tools/capturar-prints.cjs   script que gera as capturas (Playwright)
tools/validar-pagina.cjs    validação das páginas (Playwright)
Relatório de continuidade.md registro completo da investigação
.github/workflows/pages.yml publicação no GitHub Pages
```
