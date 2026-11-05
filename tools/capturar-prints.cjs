/**
 * Captura prints reais das telas para a pagina de apresentacao.
 *
 * Uso (a partir da pasta do site):
 *   $env:NODE_PATH = "C:\...\Sandbox\node_modules"
 *   node tools\capturar-prints.cjs
 *
 * Requer a versao web rodando em BASE_URL.
 */
const { chromium } = require('playwright')
const fs = require('fs')
const path = require('path')

const BASE = process.env.BASE_URL || 'http://127.0.0.1:5199'
const OUT = path.resolve(__dirname, '..', 'assets', 'prints')
fs.mkdirSync(OUT, { recursive: true })

const VIEWPORT = { width: 1440, height: 900 }

async function principal() {
  const browser = await chromium.launch()
  const context = await browser.newContext({
    viewport: VIEWPORT,
    deviceScaleFactor: 2,
    locale: 'pt-BR',
    timezoneId: 'America/Sao_Paulo',
    colorScheme: 'light',
  })
  const page = await context.newPage()

  await page.goto(`${BASE}/login`, { waitUntil: 'domcontentloaded' })
  await page.fill('#email', 'ana@clinica.com.br')
  await page.fill('#password', '123456')
  await page.click('button[type="submit"]')
  await page.waitForSelector('.card.stat', { timeout: 20000 })

  // O tour abre na primeira visita e cobre a tela.
  const pular = page.getByRole('button', { name: 'Pular o tour' })
  if (await pular.count()) {
    await pular.first().click()
    await page.waitForTimeout(300)
  }

  const tirar = async (nome) => {
    await page.waitForTimeout(500)
    await page.screenshot({ path: path.join(OUT, `${nome}.jpg`), type: 'jpeg', quality: 88 })
    console.log('ok:', nome)
  }

  await page.goto(`${BASE}/dashboard`, { waitUntil: 'networkidle' })
  await page.waitForSelector('.card.stat')
  await tirar('painel')

  await page.goto(`${BASE}/patients`, { waitUntil: 'networkidle' })
  await page.waitForTimeout(600)
  await tirar('pacientes')

  // Abre a ficha do primeiro paciente da lista (os cartoes navegam por clique).
  const primeiro = page.locator('.card.patient-card').first()
  if (await primeiro.count()) {
    await primeiro.click()
    await page.waitForURL(/\/patients\/[^/]+$/, { timeout: 10000 })
    await page.waitForTimeout(1200)
    await tirar('prontuario')
  }

  await page.goto(`${BASE}/agenda`, { waitUntil: 'networkidle' })
  await page.waitForTimeout(700)
  await tirar('agenda')

  await page.goto(`${BASE}/lgpd`, { waitUntil: 'networkidle' })
  await page.waitForTimeout(600)
  await tirar('lgpd')

  await page.goto(`${BASE}/reports`, { waitUntil: 'networkidle' })
  await page.waitForTimeout(600)
  await tirar('relatorios')

  await page.goto(`${BASE}/admin`, { waitUntil: 'networkidle' })
  await page.waitForTimeout(600)
  await tirar('configuracoes')

  await browser.close()
  console.log('prints em', OUT)
}

principal().catch((e) => {
  console.error('falhou:', e.message)
  process.exit(1)
})
