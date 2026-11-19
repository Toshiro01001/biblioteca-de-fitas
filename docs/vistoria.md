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
