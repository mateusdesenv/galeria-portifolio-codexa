/*
  Configuração da API pública da galeria Codexa.

  Local:
  baseUrl: "http://localhost:3333"

  Produção/Vercel:
  baseUrl: "https://SEU-PROJETO.vercel.app"

  Apenas a seção de galeria usa a API.
  O projeto em destaque da primeira seção permanece fixo no HTML.
*/
window.CODEXA_GALLERY_API = {
  baseUrl: "https://codexa-portifolio-api.vercel.app",
  publicPath: "/api/v1/portfolio-items",
  status: "published",
  featuredOnly: false,
  limit: 50,
  timeout: 15000
};
