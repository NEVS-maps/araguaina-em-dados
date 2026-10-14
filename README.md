# Araguaína em Dados · NEVS

Webmapa estático (Leaflet) do Censo 2022 por setor censitário de Araguaína (TO):
cor ou raça. Não precisa de servidor nem de banco de dados.

## Estrutura
```
index.html          página
css/style.css       estilo (paleta NEVS: #79b499, #171717, #f7f4e9)
js/app.js           lógica do mapa, classes, legenda, popup, busca
data/dados.js       setores + município (usado pela página)
data/*.geojson      os mesmos dados em GeoJSON, para abrir no QGIS
lib/                Leaflet 1.9.4 (cópia local, licença BSD-2)
```

## Ver no seu computador
Dê dois cliques em `index.html`. Os dados já vão dentro de `data/dados.js`, então não precisa de servidor.
O mapa de fundo precisa de internet.

## Publicar no GitHub Pages
1. Crie uma conta e um repositório no GitHub (por exemplo `araguaina-em-dados`). Em contas gratuitas, o GitHub Pages costuma exigir repositório **público**; confirme na hora de ativar.
2. Envie o conteúdo desta pasta (`index.html`, `css`, `js`, `data`, `lib`) para o repositório. Não precisa enviar a pasta `webmap_NAO_PUBLICAR`.
3. No repositório, vá em **Settings → Pages**, escolha **Deploy from a branch**, branch `main`, pasta `/ (root)`, e salve.
4. Depois de alguns minutos, o endereço fica `https://SEU-USUARIO.github.io/araguaina-em-dados/`.

Limites do GitHub Pages (documentação oficial): site publicado até 1 GB, banda de 100 GB/mês (limite flexível) e 10 builds por hora. Este mapa tem cerca de 2 MB.

## Incorporar no site Wix (plano gratuito)
No editor do Wix: **Adicionar elementos → Incorporar código → Incorporações populares → Incorporar um site**, clique em **Inserir endereço do site** e cole a URL `https://...github.io/...`.
- Só endereços **HTTPS** funcionam (o GitHub Pages é HTTPS).
- O elemento é um iframe e **não é responsivo**: no celular, confira o tamanho da caixa.
- A documentação do Wix não menciona restrição para plano gratuito, mas não consegui confirmar. Teste no seu editor.
- Alternativa segura: um botão no site Wix que abre o mapa em nova aba.

## Atualizar os dados
Os valores vêm do `araguaina.gpkg` (camada `setores_censo2022`). Se mudar os dados no QGIS, é preciso exportar de novo (WGS84, geometria simplificada) e regenerar `data/dados.js`.

## Notas de método
- Fonte: IBGE, Censo Demográfico 2022, Agregados por Setores Censitários; Malha de Setores Censitários 2022.
- Valores "X" do IBGE (sigilo estatístico) viram **vazio**, e não zero. Aparecem em cinza.
- Classes por quebras naturais (Jenks). Em "Pretos e pardos", limites iguais aos do projeto QGIS.
- Mapa de fundo: OpenStreetMap (a CARTO passou a exigir chave de API e foi retirada). Mantenha a atribuição e respeite a política de tiles do OSM (uso leve).
- A camada de cadastro fiscal (loteamentos/bairros) **não** está no webmapa. Só entra com autorização do DGT/Sefaz.

## Licença
Conteúdo, mapa e código próprios da NEVS: [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/deed.pt-br). Pode usar e adaptar, inclusive comercialmente, citando **NEVS | Geoprocessamento e Produção de Mapas** e indicando se houve alterações.
Dados de origem: IBGE, Censo Demográfico 2022 (dados públicos). A biblioteca Leaflet em `lib/` segue a licença própria dela (BSD-2, ver `lib/LEAFLET-LICENSE.txt`). Mapa de fundo: © colaboradores do OpenStreetMap.
