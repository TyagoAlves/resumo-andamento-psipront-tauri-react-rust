/* Verificação rápida da página: erros, imagens, overflow e galeria. */
const { chromium } = require('playwright')
const path = require('path')

const ARQUIVO = 'file:///' + path.resolve(__dirname, '..', 'index.html').replace(/\\/g, '/')
const PREVIA = path.join(process.env.TEMP || '.', 'previa-apresentacao.png')

async function principal() {
  const browser = await chromium.launch()
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 })
  const page = await context.newPage()

  const erros = []
  page.on('pageerror', (e) => erros.push('pageerror: ' + e.message))
  page.on('console', (m) => { if (m.type() === 'error') erros.push('console: ' + m.text()) })
  page.on('requestfailed', (r) => erros.push('requestfailed: ' + r.url()))

  await page.goto(ARQUIVO, { waitUntil: 'load' })
  await page.waitForTimeout(800)

  const imagens = await page.evaluate(() =>
    Array.from(document.images).map((i) => ({
      src: i.getAttribute('src'),
      ok: i.complete && i.naturalWidth > 0,
      w: i.naturalWidth,
    }))
  )

  const overflow = {}
  for (const largura of [1440, 1024, 768, 390]) {
    await page.setViewportSize({ width: largura, height: 900 })
    await page.waitForTimeout(250)
    overflow[largura] = await page.evaluate(() => ({
      scroll: document.documentElement.scrollWidth,
      client: document.documentElement.clientWidth,
    }))
  }

  await page.setViewportSize({ width: 1440, height: 900 })
  await page.waitForTimeout(300)

  // galeria: clicar na miniatura "Agenda"
  const antes = await page.locator('#galeria-imagem').getAttribute('src')
  await page.locator('.miniatura[data-print="agenda"]').click()
  await page.waitForTimeout(600)
  const depois = await page.locator('#galeria-imagem').getAttribute('src')
  const legenda = await page.locator('#galeria-legenda').innerText()
  const ariaSelecionado = await page.locator('.miniatura[data-print="agenda"]').getAttribute('aria-selected')

  // contagem de seções e títulos
  const estrutura = await page.evaluate(() => ({
    secoes: document.querySelectorAll('main section').length,
    h1: document.querySelectorAll('h1').length,
    h2: Array.from(document.querySelectorAll('h2')).map((h) => h.textContent.trim()),
  }))

  await page.screenshot({ path: PREVIA, fullPage: true })

  await browser.close()

  return {
    erros,
    imagens,
    imagensQuebradas: imagens.filter((i) => !i.ok).length,
    overflow: Object.fromEntries(
      Object.entries(overflow).map(([w, v]) => [w, v.scroll > v.client ? `ESTOURA (${v.scroll} > ${v.client})` : 'ok'])
    ),
    galeria: { antes, depois, mudou: antes !== depois, legenda, ariaSelecionado },
    estrutura,
    previa: PREVIA,
  }
}

principal().then((r) => console.log(JSON.stringify(r, null, 2))).catch((e) => {
  console.error('falhou:', e.message)
  process.exit(1)
})
