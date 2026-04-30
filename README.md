# Codexa Galeria de Sites

Página em HTML, CSS e JS para a galeria/portfólio da Codexa.

## O que foi ajustado

A seção **Galeria** agora consome a API pública de projetos criada para o CRUD de portfólio.

O projeto exibido na primeira seção do site, em **Projeto em destaque**, continua fixo no HTML e não é buscado na API.

## Endpoint usado pela galeria

```txt
GET /api/v1/portfolio-items?status=published&limit=50
```

O front espera o contrato abaixo em cada item retornado:

```json
{
  "id": "66314f14d0a5f1a75f8d7b21",
  "title": "Advocacia Rodrigues",
  "slug": "advocacia-rodrigues",
  "shortDescription": "Site institucional moderno para escritório de advocacia.",
  "projectUrl": "https://advocacia-rodrigues.vercel.app/",
  "desktopImageUrl": "data:image/png;base64,...",
  "mobileImageUrl": "data:image/png;base64,...",
  "altText": "Projeto Advocacia Rodrigues",
  "category": "Advocacia",
  "tags": ["Landing Page", "Advocacia"],
  "order": 1,
  "status": "published",
  "featured": true
}
```

## Configurar URL da API

Edite o arquivo:

```txt
portfolio-api.config.js
```

Para rodar local:

```js
window.CODEXA_GALLERY_API = {
  baseUrl: "http://localhost:3333",
  publicPath: "/api/v1/portfolio-items",
  status: "published",
  featuredOnly: false,
  limit: 50,
  timeout: 15000
};
```

Para usar a API na Vercel:

```js
window.CODEXA_GALLERY_API = {
  baseUrl: "https://SEU-PROJETO.vercel.app",
  publicPath: "/api/v1/portfolio-items",
  status: "published",
  featuredOnly: false,
  limit: 50,
  timeout: 15000
};
```

## Arquivos principais

- `index.html` — estrutura da página e projeto fixo da primeira seção.
- `style.css` — identidade visual e estados de loading/erro da galeria.
- `script.js` — consumo da API e renderização dinâmica da galeria.
- `portfolio-api.config.js` — configuração da URL da API.
- `assets/` — imagens estáticas usadas pelo projeto fixo e fallback visual.

## Observação importante

A API deve liberar CORS para o domínio onde essa página será publicada. No `.env` da API, use `CORS_ORIGIN=*` para teste ou configure o domínio real da Codexa em produção.

## Filtro pela URL

A galeria agora aceita filtro direto pela URL. Use o parâmetro `filtro` com o slug da categoria:

```txt
/galeria?filtro=advocacia#galeria
/galeria?filtro=restaurantes#galeria
/galeria?filtro=clinicas-odontologicas#galeria
```

Também funciona com os aliases `filter`, `categoria`, `segmento` e `nicho`, por exemplo:

```txt
/galeria?categoria=advocacia#galeria
```

Ao clicar em um filtro da galeria, a URL é atualizada automaticamente. Assim você pode copiar o link e redirecionar o usuário direto para a categoria filtrada.

Para mostrar todos os sites novamente, use:

```txt
/galeria#galeria
```
