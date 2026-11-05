/* Verificação rápida das páginas: erros, imagens, links, overflow e galeria. */
const { chromium } = require('playwright')
const path = require('path')
const fs = require('fs')

const RAIZ = path.resolve(__dirname, '..')
const PAGINAS = ['index.html', 'notas.html']

function urlDe(arquivo) {
  return 'file:///' + path.join(RAIZ, arquivo).replace(/\\/g, '/')
}

async function checarPagina(browser, arquivo) {
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 })
  const page = await context.newPage()

  const erros = []
  page.on('pageerror', (e) => erros.push('pageerror: ' + e.message))
  page.on('console', (m) => { if (m.type() === 'error') erros.push('console: ' + m.text()) })
  page.on('requestfailed', (r) => erros.push('requestfailed: ' + r.url()))

  await page.goto(urlDe(arquivo), { waitUntil: 'load' })
  await page.waitForTimeout(800)

  await page.evaluate(async () => {
    // força o carregamento das imagens lazy
    for (let y = 0; y < document.body.scrollHeight; y += 600) {
      window.scrollTo(0, y)
      await new Promise((r) => setTimeout(r, 60))
    }
    window.scrollTo(0, 0)
  })
  await page.waitForTimeout(600)

  const imagens = await page.evaluate(() =>
    Array.from(document.images).map((i) => ({
      src: i.getAttribute('src'),
      ok: i.complete && i.naturalWidth > 0,
    }))
  )

  const links = await page.evaluate(() =>
    Array.from(document.querySelectorAll('a[href]')).map((a) => ({
      href: a.getAttribute('href'),
      texto: a.textContent.trim().slice(0, 40),
      baixar: a.hasAttribute('download'),
    }))
  )

  const overflow = {}
  for (const largura of [1440, 1024, 768, 390]) {
    await page.setViewportSize({ width: largura, height: 900 })
    await page.waitForTimeout(250)
    const medida = await page.evaluate(() => ({
      scroll: document.documentElement.scrollWidth,
      client: document.documentElement.clientWidth,
    }))
    overflow[largura] = medida.scroll > medida.client ? `ESTOURA (${medida.scroll} > ${medida.client})` : 'ok'
  }
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.waitForTimeout(250)

  let galeria = null
  if (await page.locator('#galeria-imagem').count()) {
    const antes = await page.locator('#galeria-imagem').getAttribute('src')
    await page.locator('.miniatura[data-print="agenda"]').click()
    await page.waitForTimeout(700)
    const depois = await page.locator('#galeria-imagem').getAttribute('src')
    galeria = {
      antes,
      depois,
      mudou: antes !== depois,
      legenda: await page.locator('#galeria-legenda').innerText(),
      ariaSelecionado: await page.locator('.miniatura[data-print="agenda"]').getAttribute('aria-selected'),
    }
  }

  const estrutura = await page.evaluate(() => ({
    titulo: document.title,
    h1: Array.from(document.querySelectorAll('h1')).map((h) => h.textContent.trim()),
    secoes: document.querySelectorAll('main section').length,
    noindex: !!document.querySelector('meta[name="robots"][content*="noindex"]'),
    overflowX: getComputedStyle(document.body).overflowX,
  }))

  const previa = path.join(process.env.TEMP || '.', 'previa-' + arquivo.replace('.html', '') + '.png')
  await page.screenshot({ path: previa, fullPage: true })

  await context.close()

  return {
    arquivo,
    erros,
    imagens: imagens.length,
    imagensQuebradas: imagens.filter((i) => !i.ok).map((i) => i.src),
    links,
    overflow,
    galeria,
    estrutura,
    previa,
  }
}

async function principal() {
  const browser = await chromium.launch()
  const saida = []
  for (const arquivo of PAGINAS) saida.push(await checarPagina(browser, arquivo))
  await browser.close()

  const instalador = path.join(RAIZ, 'download', 'clinica-psi_1.0.0_x64-setup.exe')
  const binario = fs.existsSync(instalador)
    ? { existe: true, bytes: fs.statSync(instalador).size, mz: fs.readFileSync(instalador).subarray(0, 2).toString('hex').toUpperCase() }
    : { existe: false }

  console.log(JSON.stringify({ paginas: saida, instalador: binario }, null, 2))
}

principal().catch((e) => {
  console.error('falhou:', e.message)
  process.exit(1)
})
