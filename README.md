# Araguaína em Dados

Webmapa do Censo Demográfico 2022 por setor censitário de Araguaína (TO), com o percentual da população por cor ou raça (pretos e pardos, pardos, pretos e brancos).

**Elaboração:** NEVS | Geoprocessamento e Produção de Mapas · [Site](https://mapsnevs.wixsite.com/nevs) · [@nevs.maps](https://www.instagram.com/nevs.maps) · maps.nevs@gmail.com

## Como usar
Abra o mapa no navegador, escolha a categoria no painel e clique em um setor para ver os valores. Também é possível buscar um setor pelo código e ajustar o mapa de fundo.

## Estrutura
```
index.html          página
css/style.css       estilo
js/app.js           mapa, classes, legenda, popup e busca
data/dados.js       setores e município (usado pela página)
data/*.geojson      os mesmos dados em GeoJSON (WGS84), para abrir no QGIS
lib/                Leaflet 1.9.4 (cópia local)
```
Não precisa de servidor nem de banco de dados.

## Notas de método
- **Fonte:** IBGE, Censo Demográfico 2022, Agregados por Setores Censitários; Malha de Setores Censitários 2022.
- Valores omitidos pelo IBGE por sigilo estatístico ("X") ficam **vazios**, e não zero, e aparecem em cinza no mapa.
- Classes por quebras naturais (Jenks), calculadas só com os setores que têm dado.
- Geometrias simplificadas para a web; não use este arquivo para medições de precisão.

## Licença
Conteúdo, mapa e código próprios da NEVS: [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/deed.pt-br). Pode usar e adaptar, inclusive comercialmente, citando **NEVS | Geoprocessamento e Produção de Mapas** e indicando se houve alterações.
Dados de origem: IBGE (dados públicos). A biblioteca Leaflet em `lib/` segue a licença própria (BSD-2, ver `lib/LEAFLET-LICENSE.txt`). Mapa de fundo: © colaboradores do OpenStreetMap.
