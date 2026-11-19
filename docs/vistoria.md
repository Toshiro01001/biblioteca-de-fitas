# Vistoria de segurança: A Biblioteca de Fitas

Data: 19/11/2026. Escopo: a página compilada inteira (`index.html`, `404.html`, `404.css`, `assets/`, `fitas/`, `fonts/`, `img/`), os testes e a fonte em React.

## O que foi conferido

- **Política de segurança de conteúdo (CSP)** em `index.html`: `default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; font-src 'self'; connect-src 'self'; media-src 'self'; object-src 'none'; base-uri 'self'; form-action 'none'`. Sem `unsafe-inline`, sem `unsafe-eval`, sem origem externa. A página 404 usa `script-src 'none'` e `connect-src 'none'`. O teste automático confere que o console fica limpo (qualquer bloqueio da CSP apareceria como erro).
- **Script e estilo inline:** nenhum `<script>` com código, nenhum `<style>` e nenhum atributo `style` escrito no HTML. As alturas e inclinações das lombadas são propriedades CSS postas pelo React pelo CSSOM, que a CSP permite.
- **Conteúdo dos contos:** o leitor (`texto.jsx`) monta parágrafos, títulos, divisórias, itálico e negrito pela árvore de elementos. Não há `innerHTML`, `dangerouslySetInnerHTML`, `eval`, `new Function` nem `document.write` na fonte. O nome do arquivo de cada fita só é aceito se bater com `^[\w-]+\.md$` e é sempre buscado dentro de `./fitas/`.
- **Nenhum envio de dados.** Não há formulário, `form-action 'none'`, e a página só pede arquivos do próprio endereço.
- **O que fica no navegador:** nada. Não há cookie, `localStorage`, `sessionStorage` nem IndexedDB.
- **Dependências em tempo de execução:** React, React DOM e Lenis, compiladas dentro de `assets/`, e quatro fontes livres (SIL OFL) servidas do próprio site. Licenças em `licencas/`. Sem CDN, sem fonte externa, sem analytics.
- **Links externos:** um só, para https://mileumalinhas.com.br (assinatura do rodapé).
- **Som:** sintetizado pelo navegador (WebAudio) e só começa depois que a pessoa aperta uma tecla. Não há arquivo de áudio nem pedido de microfone.
- **Dados pessoais e segredos:** nenhuma senha, chave, token, e-mail, telefone ou CPF no repositório (busca feita por texto em todos os arquivos versionados). As histórias são ficção.

## Riscos residuais

- O GitHub Pages não permite cabeçalhos HTTP próprios, então a CSP vai em `<meta>`. Ela não cobre `frame-ancestors`: o site poderia ser aberto dentro de um quadro de outro site. Risco baixo: não há login nem dado sensível.
- Os contos serão texto do próprio dono do site. Se um dia forem aceitos textos de terceiros, o leitor continua seguro (nada vira HTML), mas será preciso revisar o conteúdo antes de publicar.
- O mesmo vale para os episódios em áudio: quando chegarem, `media-src 'self'` já os limita a arquivos do próprio site.

## Testes que sustentam esta vistoria

`node tests/site.cjs`: console limpo em 1280x900, iPhone 13, 320 px, com "reduzir movimento" e sem WebGL; sem rolagem horizontal nem texto cortado; estante, ficha, leitura da fita 000, fita inexistente, gravador e página 404.

## Raio-X ProfitizeBuild (19/11/2026, site no ar)

Nota geral 73/100: velocidade 72, celular 100, SEO 86, Pixel 11, privacidade 79. A primeira tela aparece em 1,1 s no 4G, sem salto de layout, com HTTPS, bom contraste, botões fáceis de tocar e nenhuma chave secreta exposta.

Pontos apontados e decisão:

- **Pixel da Meta, Google Analytics:** não instalados de propósito. O site não tem anúncio e a política de segurança bloqueia script de fora. Entram só se o dono pedir (exigiria política de privacidade e ajuste da CSP).
- **Política de privacidade, termos de uso, CNPJ:** não se aplicam por enquanto, porque o site não coleta dado, não vende e não tem formulário. Voltam a valer se isso mudar.
- **JavaScript ocupa 1,4 s no carregamento (médio):** pendente. É a medição em celular simulado, sem placa de vídeo, e o WebGL só liga depois do `load`. Possível melhora: carregar a cena e o som sob demanda.
- **Sem imagem de compartilhamento (og:image) e sem sitemap:** pendentes, a pedido do dono.
- **github.io, redirecionamento http para https e dados estruturados:** o endereço é do GitHub Pages (o https já abre); o domínio próprio fica para quando o dono quiser.

## Terror (19/11/2026)

Efeitos novos: névoa, poeira, falha da TV, sombra, título que corrompe, estática na leitura e som sintetizado. Sem biblioteca nova, sem arquivo de áudio, sem requisição externa, sem script ou estilo inline; a política de segurança (CSP) ficou igual. A estática usa uma imagem `data:` já permitida em `img-src`. Tudo tem versão parada (sem WebGL, "reduzir movimento"). O som só começa depois do toque em "Ligar o gravador". Testes passaram em 1280x900, iPhone 13, 320 px, com "reduzir movimento" e sem WebGL.

## Som da interface (19/11/2026)

Biblioteca nova: `uisfx` 0.4.0 (MIT, licença em `licencas/uisfx-MIT.txt`), compilada dentro do site; os sons são sintetizados no navegador, sem arquivo de áudio e sem requisição externa. A política de segurança (CSP) ficou igual. O áudio só é criado depois de um gesto do usuário e o som começa desligado. A preferência (ligado e volume) fica só no `localStorage` do aparelho, sem dado pessoal. Testes passaram em 1280x900, iPhone 13 e 320 px.
