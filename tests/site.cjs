/* Testes do site com Playwright.
   Como rodar, na raiz do projeto:  node tests/site.cjs
   Sobe um servidor local (python3 -m http.server 8330, na pasta acima, para o site responder em
   /biblioteca-de-fitas/ como no GitHub Pages) e abre o site em 1280x900, iPhone 13 e 320px.
   Confere: console limpo, rolagem horizontal, textos cortados, estante e ficha, conto da fita 000,
   fita inexistente, gravador (teclas), versão sem WebGL e com "reduzir movimento", e a página 404.
   Com CAPTURAS=1 salva PNGs em tests/capturas. */
"use strict";
const { chromium, devices } = require("playwright");
const { spawn } = require("child_process");
const path = require("path");
const fs = require("fs");

const PORTA = 8330;
const RAIZ = path.resolve(__dirname, "..");
const SLUG = path.basename(RAIZ);
const BASE = `http://127.0.0.1:${PORTA}/${SLUG}/`;
const CAPTURAS = process.env.CAPTURAS === "1";
const CAP_DIR = path.join(RAIZ, "tests", "capturas");
const ARGS = ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist"];

const falhas = [];
const checa = (c, m) => { if (!c) falhas.push(m); };
const espera = (ms) => new Promise((r) => setTimeout(r, ms));

async function servidor() {
  const proc = spawn("python3", ["-m", "http.server", String(PORTA), "--bind", "127.0.0.1"], { cwd: path.dirname(RAIZ), stdio: "ignore" });
  for (let i = 0; i < 40; i++) { try { const r = await fetch(BASE); if (r.ok) return proc; } catch (e) { /* subindo */ } await espera(150); }
  proc.kill(); throw new Error("Servidor local não subiu na porta " + PORTA);
}

async function basicas(page, rotulo) {
  const l = await page.evaluate(() => ({ doc: document.documentElement.scrollWidth, win: window.innerWidth }));
  checa(l.doc <= l.win, `${rotulo}: rolagem horizontal (${l.doc} > ${l.win})`);
  const cortados = await page.evaluate(() => {
    const out = [];
    for (const el of document.querySelectorAll("h1,h2,h3,p,a,button,li,dt,dd,small,figcaption")) {
      if (el.closest("[hidden],svg") || (el.offsetParent === null && getComputedStyle(el).position !== "fixed")) continue;
      const cs = getComputedStyle(el);
      if (cs.overflow === "hidden" || cs.overflowX === "hidden" || cs.textOverflow === "ellipsis") continue;
      if (el.closest(".lombada, .movel")) continue; /* os rótulos das lombadas são cortados de propósito */
      if (el.scrollWidth > el.clientWidth + 2 && el.clientWidth > 0) out.push(`${el.tagName.toLowerCase()}.${el.className} "${el.textContent.trim().slice(0, 40)}"`);
      const r = el.getBoundingClientRect();
      if (r.right > window.innerWidth + 1 && r.width > 0) out.push(`${el.tagName.toLowerCase()}.${el.className} sai da tela (${Math.round(r.right)})`);
    }
    return out;
  });
  checa(cortados.length === 0, `${rotulo}: textos cortados ou fora da tela: ${cortados.join(" | ")}`);
}

async function abre(browser, opcoes, rotulo, hash, antes) {
  const ctx = await browser.newContext(opcoes);
  const page = await ctx.newPage();
  const erros = [];
  page.on("console", (m) => { if (["error", "warning"].includes(m.type()) && !/GL Driver Message/.test(m.text())) erros.push(m.text()); }); /* aviso de desempenho do WebGL por software do teste, não do site */
  page.on("pageerror", (e) => erros.push("pageerror: " + e.message));
  page.on("requestfailed", (r) => erros.push("falhou: " + r.url()));
  if (antes) await antes(page);
  await page.goto(BASE + (hash || ""), { waitUntil: "load" });
  await espera(900);
  return { ctx, page, erros, rotulo };
}

async function testaHome(browser, opcoes, rotulo, extra) {
  const { ctx, page, erros } = await abre(browser, opcoes, rotulo, "", extra && extra.antes);
  checa((await page.title()).includes("Biblioteca de Fitas"), `${rotulo}: título da página`);
  checa((await page.locator("h1").first().getAttribute("aria-label")) === "A Biblioteca de Fitas", `${rotulo}: h1 sem nome acessível`);
  await basicas(page, rotulo + " topo");
  /* estante: a fita 000 aparece e a ficha mostra os dados */
  await page.locator("#estante").scrollIntoViewIfNeeded();
  await espera(500);
  const lombadas = await page.locator("button.lombada.cheia").count();
  checa(lombadas === 1, `${rotulo}: esperava 1 fita na estante, veio ${lombadas}`);
  checa((await page.locator(".ficha h3").textContent()).includes("Leia antes de ouvir"), `${rotulo}: ficha não mostra a fita 000`);
  checa((await page.locator(".lombada.vaga").count()) > 10, `${rotulo}: faltam lugares guardados na estante`);
  await basicas(page, rotulo + " estante");
  /* gravador: teclas mudam o estado e o aviso fica visível */
  await page.locator("#gravador").scrollIntoViewIfNeeded();
  await espera(500);
  checa((await page.locator(".visor-estado").textContent()) === "Parado", `${rotulo}: gravador deveria começar parado`);
  await page.locator(".tecla-tocar").click();
  await espera(300);
  checa((await page.locator(".visor-estado").textContent()) === "Tocando", `${rotulo}: tecla tocar não funcionou`);
  await page.locator(".deck-teclas button").nth(2).click();
  await espera(200);
  checa((await page.locator(".visor-estado").textContent()) === "Parado", `${rotulo}: tecla parar não funcionou`);
  await basicas(page, rotulo + " gravador");
  /* abrir a fita 000 pela ficha */
  await page.locator("#estante").scrollIntoViewIfNeeded();
  await page.locator(".ficha .botao").click();
  await espera(800);
  checa(page.url().endsWith("#/fita/000"), `${rotulo}: o botão não levou a #/fita/000 (${page.url()})`);
  checa((await page.locator("article h1").textContent()).includes("Leia antes de ouvir"), `${rotulo}: conto 000 não abriu`);
  checa((await page.locator(".prosa p").count()) >= 3, `${rotulo}: conto sem parágrafos`);
  await basicas(page, rotulo + " leitura");
  if (CAPTURAS) { fs.mkdirSync(CAP_DIR, { recursive: true }); await page.screenshot({ path: path.join(CAP_DIR, `leitura-${rotulo.replace(/\W+/g, "-")}.png`) }); }
  await page.locator(".voltar").click();
  await espera(500);
  checa(!page.url().includes("#/fita"), `${rotulo}: voltar não saiu da leitura`);
  /* a página não pode pedir nada fora do próprio endereço */
  checa(erros.length === 0, `${rotulo}: console/rede com problema: ${erros.slice(0, 4).join(" | ")}`);
  if (CAPTURAS) { fs.mkdirSync(CAP_DIR, { recursive: true }); await page.evaluate(() => scrollTo(0, 0)); await espera(300); await page.screenshot({ path: path.join(CAP_DIR, `capa-${rotulo.replace(/\W+/g, "-")}.png`) }); }
  await ctx.close();
}

async function testaFitaInexistente(browser) {
  const { ctx, page, erros } = await abre(browser, { viewport: { width: 390, height: 800 } }, "fita inexistente", "#/fita/777");
  checa((await page.locator("h1").first().textContent()).includes("Esta fita não está na estante"), "fita inexistente: aviso não apareceu");
  await basicas(page, "fita inexistente");
  checa(erros.filter((e) => !/404/.test(e)).length === 0, "fita inexistente: console com problema: " + erros.join(" | "));
  await ctx.close();
}

async function testa404(browser) {
  for (const [rotulo, op] of [["404 computador", { viewport: { width: 1280, height: 900 } }], ["404 celular", devices["iPhone 13"]], ["404 320px", { viewport: { width: 320, height: 640 } }]]) {
    const ctx = await browser.newContext(op); const page = await ctx.newPage();
    const erros = []; page.on("pageerror", (e) => erros.push(e.message));
    const r = await page.goto(`http://127.0.0.1:${PORTA}/${SLUG}/404.html`, { waitUntil: "load" });
    await espera(400);
    checa(r.ok(), `${rotulo}: não abriu`);
    checa((await page.textContent("body")).includes("Esta fita não está na estante"), `${rotulo}: texto ausente`);
    checa((await page.locator("a.botao, a").first().getAttribute("href")).includes("biblioteca-de-fitas"), `${rotulo}: botão sem o endereço do site`);
    await basicas(page, rotulo);
    checa(erros.length === 0, `${rotulo}: erro de script`);
    await ctx.close();
  }
}

(async () => {
  const srv = await servidor();
  const browser = await chromium.launch({ args: ARGS });
  try {
    await testaHome(browser, { viewport: { width: 1280, height: 900 } }, "computador 1280x900");
    await testaHome(browser, devices["iPhone 13"], "iPhone 13");
    await testaHome(browser, { viewport: { width: 320, height: 640 }, hasTouch: true, isMobile: true }, "320px");
    /* reduzir movimento */
    await testaHome(browser, { viewport: { width: 1280, height: 900 }, reducedMotion: "reduce" }, "reduzir movimento");
    /* sem WebGL: a cena cai para a versão parada e a página continua inteira */
    const semGl = await abre(browser, { viewport: { width: 390, height: 800 } }, "sem WebGL", "", async (p) => {
      await p.addInitScript(() => { const o = HTMLCanvasElement.prototype.getContext; HTMLCanvasElement.prototype.getContext = function (t, ...a) { return /webgl/i.test(t) ? null : o.call(this, t, ...a); }; });
    });
    checa(await semGl.page.locator("header.topo.sem-gl").count() === 1, "sem WebGL: o topo não trocou para a versão parada");
    await basicas(semGl.page, "sem WebGL");
    checa(semGl.erros.length === 0, "sem WebGL: console com problema: " + semGl.erros.slice(0, 3).join(" | "));
    await semGl.ctx.close();
    await testaFitaInexistente(browser);
    await testa404(browser);
  } finally { await browser.close(); srv.kill(); }
  if (falhas.length) { console.log("FALHAS:\n- " + falhas.join("\n- ")); process.exit(1); }
  console.log("Todos os testes passaram.");
})().catch((e) => { console.error(e); process.exit(1); });
