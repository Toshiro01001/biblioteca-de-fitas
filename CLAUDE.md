# A Biblioteca de Fitas

Site de contos de terror e podcast do Rodrigo Jr, em React compilado (projeto dele de verdade, não é vitrine fictícia). Chega aqui já compilado: `index.html` carrega o programa, o estilo e as fontes de `assets/` (arquivos compilados, não edite à mão). A fonte fica no repositório privado `mil-e-uma-linhas-conteudo`, em `vitrines-fonte/biblioteca-fitas/`, e `node publicar.mjs` compila e copia para cá. Os contos ficam em `fitas/` (um `.md` por fita mais `indice.json`), a página de erro em `404.html` e `404.css`, as licenças em `licencas/`, os testes em `tests/site.cjs` e a vistoria em `docs/`. Veja o `README.md`.

## Regras de trabalho

- Responda em português do Brasil, sem travessões, e chame o dono de Rodrigo Jr.
- Altere só o que foi pedido. Publicar ou fazer merge no `main` depende de pedido dele.
- Toda função criada ou alterada precisa funcionar também no celular. Teste a versão mobile, não só a de computador (`node tests/site.cjs` com o site servido na pasta acima).
- Ao criar ou alterar o site, explique como ele funciona.
- Ao terminar uma alteração, entregue a mensagem de commit em dois blocos rotulados: "Título" (até 50 caracteres) e "Descrição" (estendida, com exatamente o que foi feito).
- Entregue arquivos soltos, nunca em `.zip`.
- O repositório é público: não coloque senhas, chaves secretas nem dados pessoais em arquivos versionados.
- Sem CDN, sem fonte externa, sem analytics, sem script ou estilo inline: a Content-Security-Policy do `index.html` é restritiva e deve continuar assim.
- A cena do topo usa WebGL2. Todo efeito precisa ter versão parada: a página funciona inteira sem WebGL, no celular e com "reduzir movimento".
- Os contos são do Rodrigo Jr. Não invente conto nem publique texto dele sem pedido.
- O rodapé leva a assinatura M1L! | RTJ com o RTJ vivo (`img/marca/`). Não redesenhe as duas marcas.
