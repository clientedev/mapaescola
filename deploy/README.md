# Mapa - Escola SENAI "Morvan Figueiredo"

Aplicação web (React + Vite) que mostra a escola e as estações de Metrô/CPTM mais próximas, com distâncias, modo de impressão e download da imagem.

## Como publicar no Railway (1 link, 1 pacote)

1. Crie um repositório no GitHub e faça upload **apenas do conteúdo desta pasta `deploy/`** (os arquivos vão na raiz do repositório).
2. Vá em [railway.app](https://railway.app) → **New Project** → **Deploy from GitHub repo** → escolha o repositório criado.
3. O Railway detecta automaticamente o `railway.json` e usa:
   - **Build:** `npm install && npm run build`
   - **Start:** `npm start`
4. Em **Settings → Networking**, clique em **Generate Domain** para receber o link público.
5. Pronto — o link `*.up.railway.app` é a única URL da aplicação.

A porta é definida automaticamente pelo Railway via `process.env.PORT`.

## Rodar localmente

```bash
npm install
npm run dev          # servidor de desenvolvimento na porta 5173
# ou para testar a versão de produção:
npm run build
npm start            # serve a build na porta definida em PORT (3000 por padrão)
```

## Estrutura

```
deploy/
├── src/
│   ├── App.tsx           # componente principal do mapa
│   ├── main.tsx          # ponto de entrada React
│   ├── index.css         # estilos (Tailwind v4 + tema)
│   └── assets/school.png # foto da escola
├── public/favicon.svg
├── index.html
├── server.js             # servidor Express para servir a build
├── vite.config.ts
├── tsconfig.json
├── package.json
└── railway.json          # configuração do Railway
```

## Stack

- React 19 + Vite 7
- react-leaflet 5 + Leaflet 1.9 (mapas com tiles do CartoDB)
- Tailwind CSS v4
- html-to-image (geração da imagem para download)
- Express (apenas para servir a build em produção)
