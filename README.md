# Clínica Psi — resumo de andamento

Página estática de apresentação do projeto **Clínica Psi** (prontuário eletrônico
para clínicas psicológicas), feita para publicar no GitHub Pages.

- Sem framework, sem build: `index.html` + CSS + JS puros.
- Nenhuma dependência externa (fontes do sistema, ícones em SVG, imagens locais).
- 7 capturas reais do sistema em `assets/prints/` (dados fictícios de demonstração).

## Ver localmente

Basta abrir `index.html` no navegador. Para simular o Pages (e testar caminhos
relativos corretamente), sirva a pasta:

```powershell
# com Node instalado
npx.cmd --yes serve .
```

## Publicar no GitHub Pages

O repositório já traz o workflow `.github/workflows/pages.yml`.

1. Crie o repositório `resumo-andamento-psipront-tauri-react-rust` no GitHub.
2. Envie os arquivos para a branch `main` (veja os comandos abaixo).
3. Em **Settings → Pages → Build and deployment**, escolha **Source: GitHub Actions**.
4. O workflow roda a cada push na `main`. O endereço fica em
   `https://<usuario>.github.io/resumo-andamento-psipront-tauri-react-rust/`.

```powershell
git init
git add .
git commit -m "Página de apresentação do Clínica Psi"
git branch -M main
git remote add origin git@github.com:TyagoAlves/resumo-andamento-psipront-tauri-react-rust.git
git push -u origin main
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
index.html                  página única
assets/css/estilo.css       estilos (tema teal, responsivo, reduced-motion)
assets/js/app.js            galeria de telas, topo fixo, animação de entrada
assets/prints/*.jpg         capturas do sistema
assets/favicon.svg          ícone
tools/capturar-prints.cjs   script que gera as capturas (Playwright)
.github/workflows/pages.yml publicação no GitHub Pages
```
