/* Araguaína em Dados · NEVS
   Webmapa estático em Leaflet. Dados: IBGE, Censo 2022, agregados por setor censitário. */
(function () {
  'use strict';

  var SETORES = window.NEVS_SETORES;
  var MUN = window.NEVS_MUNICIPIO;
  var nf = new Intl.NumberFormat('pt-BR');
  var f1 = function (v) { return v.toFixed(1).replace('.', ','); };
  var fint = function (v) { return nf.format(v); };

  var LARANJA = ['#ffffd4', '#fed98e', '#fe9929', '#d95f0e', '#993404'];

  // Limites das classes: quebras naturais (Jenks) calculadas só com os setores que têm dado.
  var IND = {
    pct_preta_parda: { rotulo: 'Pretos e pardos', curto: 'pretos e pardos', cores: LARANJA, breaks: [58.2, 67.8, 74.5, 80.6],
      desc: 'Percentual da população residente que se declarou preta ou parda.' },
    pct_parda: { rotulo: 'Pardos', curto: 'pardos', cores: LARANJA, breaks: [48.8, 56.7, 62.5, 70.2],
      desc: 'Percentual da população residente que se declarou parda.' },
    pct_preta: { rotulo: 'Pretos', curto: 'pretos', cores: LARANJA, breaks: [9.3, 13.6, 18.2, 29.1],
      desc: 'Percentual da população residente que se declarou preta.' },
    pct_branca: { rotulo: 'Brancos', curto: 'brancos', cores: LARANJA, breaks: [19.1, 25.1, 32.0, 41.3],
      desc: 'Percentual da população residente que se declarou branca.' }
  };

  // mínimo e máximo reais de cada indicador (para os extremos da legenda)
  Object.keys(IND).forEach(function (k) {
    var vals = SETORES.features.map(function (f) { return f.properties[k]; })
      .filter(function (v) { return v !== null && v !== undefined; });
    IND[k].min = Math.min.apply(null, vals);
    IND[k].max = Math.max.apply(null, vals);
  });

  var atual = 'pct_preta_parda';
  var op = 0.85;
  var sel = null;

  // estado inicial pela URL (#ind=pct_parda), para compartilhar o mapa já no indicador desejado
  var m = /ind=([a-z_]+)/.exec(location.hash);
  if (m && IND[m[1]]) { atual = m[1]; }
  var radio = document.querySelector('input[name=ind][value=' + atual + ']');
  if (radio) { radio.checked = true; }

  function classe(v, ind) {
    var i = 0;
    while (i < 4 && v > ind.breaks[i]) { i++; }   // limite superior inclusivo, como no QGIS
    return i;
  }

  function estilo(feat) {
    var v = feat.properties[atual];
    var sem = v === null || v === undefined;
    return {
      fillColor: sem ? '#cfcfcf' : IND[atual].cores[classe(v, IND[atual])],
      fillOpacity: op, color: '#ffffff', weight: 0.6, opacity: 0.9
    };
  }

  // mapa
  var map = L.map('mapa', { preferCanvas: true, minZoom: 8, maxZoom: 18 });
  map.attributionControl.setPrefix('<a href="https://leafletjs.com" target="_blank" rel="noopener">Leaflet</a>');

  var fundos = {
    osm: L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19, className: 'fundo-suave',
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a>'
    }),
    nenhum: null
  };
  // Aberta direto do disco (file://), o OSM bloqueia os mapas (sem Referer); publicada, funciona.
  var local = location.protocol === 'file:';
  var fundoAtual = local ? null : fundos.osm.addTo(map);
  if (local) { document.getElementById('fundo').value = 'nenhum'; }

  var contorno = L.geoJSON(MUN, {
    interactive: false,
    style: { color: '#171717', weight: 2, fill: false, opacity: 0.9 }
  });

  var porCodigo = {};
  var setores = L.geoJSON(SETORES, {
    style: estilo,
    onEachFeature: function (feat, layer) {
      porCodigo[feat.properties.CD_SETOR] = layer;
      layer.bindPopup(function (l) { return popup(l.feature.properties); }, { maxWidth: 300 });
      if (!L.Browser.mobile) {
        layer.bindTooltip(function (l) { return dica(l.feature.properties); }, { sticky: true, direction: 'top', opacity: 0.95 });
      }
      layer.on('mouseover', function (e) {
        if (e.target !== sel) { e.target.setStyle({ weight: 2.2, color: '#171717', opacity: 1 }); e.target.bringToFront(); }
      });
      layer.on('mouseout', function (e) { if (e.target !== sel) { setores.resetStyle(e.target); } });
    }
  }).addTo(map);
  contorno.addTo(map);

  var limMun = contorno.getBounds();
  map.setMaxBounds(limMun.pad(0.6));
  map.fitBounds(limMun);

  var URBANA = L.latLngBounds([-7.2549, -48.2687], [-7.1238, -48.1468]);

  // marcação do setor selecionado
  function marcar() {
    if (sel) { sel.setStyle({ color: '#171717', weight: 2.8, opacity: 1 }); sel.bringToFront(); }
  }
  map.on('popupopen', function (e) {
    if (sel && sel !== e.popup._source) { setores.resetStyle(sel); }
    sel = e.popup._source; marcar();
  });
  map.on('popupclose', function () {
    if (sel) { var s = sel; sel = null; setores.resetStyle(s); }
  });

  function dica(p) {
    var v = p[atual];
    return 'Setor ' + p.CD_SETOR.slice(-6) + ' · ' + (v === null || v === undefined ? 'sem dado' : f1(v) + '%');
  }

  var COR = [['Branca', 'branca'], ['Preta', 'preta'], ['Parda', 'parda'], ['Amarela', 'amarela'], ['Indígena', 'indigena']];

  function popup(p) {
    var ind = IND[atual], v = p[atual];
    var h = '<div class="pp"><h3>Setor censitário' + (p.SITUACAO ? '<span class="tag">' + p.SITUACAO + '</span>' : '') + '</h3>';
    h += '<div class="cod">' + p.CD_SETOR + '</div>';
    if (v === null || v === undefined) {
      h += '<div class="omit">Sem dado para este indicador: setor sem moradores ou dado omitido pelo IBGE por sigilo estatístico.</div>';
    } else {
      h += '<div class="grande">' + f1(v) + '%<small>' + ind.curto + '</small></div>';
    }
    if (p.pessoas > 0) {
      h += '<table aria-label="Pessoas por cor ou raça">';
      COR.forEach(function (c) {
        var n = p[c[1]];
        h += '<tr><td>' + c[0] + '</td><td>';
        if (n === null || n === undefined) { h += '<span class="nota">omitido</span></td><td>–</td></tr>'; return; }
        h += '<div class="barra"><b style="width:' + Math.min(100, n / p.pessoas * 100).toFixed(1) + '%"></b></div></td><td>' + fint(n) + '</td></tr>';
      });
      h += '</table>';
      h += '<div class="rod">' + fint(p.pessoas) + ' pessoas · ' + fint(p.domicilios) + ' domicílios · ' + p.AREA_KM2.toLocaleString('pt-BR') + ' km²</div>';
    } else {
      h += '<div class="rod">Setor sem moradores no Censo 2022.</div>';
    }
    return h + '</div>';
  }

  // legenda
  function legenda() {
    var ind = IND[atual], cont = [0, 0, 0, 0, 0], sem = 0;
    SETORES.features.forEach(function (f) {
      var v = f.properties[atual];
      if (v === null || v === undefined) { sem++; } else { cont[classe(v, ind)]++; }
    });
    document.getElementById('leg-titulo').textContent = ind.rotulo + ' (%)';
    document.getElementById('leg-desc').textContent = ind.desc;
    var ul = document.getElementById('legenda');
    var h = '';
    for (var i = 0; i < 5; i++) {
      var lo = i === 0 ? ind.min : ind.breaks[i - 1];
      var hi = i === 4 ? ind.max : ind.breaks[i];
      h += '<li><i style="background:' + ind.cores[i] + '"></i><span>' + f1(lo) + ' – ' + f1(hi) + '%</span><span class="n">' + cont[i] + ' setores</span></li>';
    }
    h += '<li class="sem"><i></i><span>Sem dado ou sigilo</span><span class="n">' + sem + ' setores</span></li>';
    ul.innerHTML = h;
  }

  function trocar(k) {
    atual = k;
    setores.setStyle(estilo);
    marcar();
    legenda();
    if (sel && sel.isPopupOpen()) { sel.getPopup().setContent(popup(sel.feature.properties)); }
    try { history.replaceState(null, '', '#ind=' + k); } catch (e) { /* iframe ou arquivo local */ }
  }

  Array.prototype.forEach.call(document.querySelectorAll('input[name=ind]'), function (r) {
    r.addEventListener('change', function () { if (r.checked) { trocar(r.value); } });
  });

  function irMunicipio() { map.fitBounds(limMun); }
  function irCidade() { map.fitBounds(URBANA); }
  document.getElementById('b-mun').addEventListener('click', irMunicipio);
  document.getElementById('b-urb').addEventListener('click', irCidade);

  // atalhos sobre o mapa (aparecem só em telas estreitas, onde o painel fica abaixo do mapa)
  var atalhos = L.control({ position: 'topleft' });
  atalhos.onAdd = function () {
    var d = L.DomUtil.create('div', 'leaflet-bar atalhos');
    d.innerHTML = '<button type="button" id="a-mun">Município</button><button type="button" id="a-urb">Cidade</button>';
    L.DomEvent.disableClickPropagation(d);
    d.querySelector('#a-mun').addEventListener('click', irMunicipio);
    d.querySelector('#a-urb').addEventListener('click', irCidade);
    return d;
  };
  atalhos.addTo(map);

  document.getElementById('fundo').addEventListener('change', function (e) {
    if (fundoAtual) { map.removeLayer(fundoAtual); }
    fundoAtual = fundos[e.target.value];
    if (fundoAtual) { fundoAtual.addTo(map); fundoAtual.bringToBack(); }
  });
  document.getElementById('opac').addEventListener('input', function (e) {
    op = e.target.value / 100; setores.setStyle(estilo); marcar();
  });
  document.getElementById('c-mun').addEventListener('change', function (e) {
    if (e.target.checked) { contorno.addTo(map); } else { map.removeLayer(contorno); }
  });

  // busca por código do setor (aceita os últimos dígitos)
  document.getElementById('busca').addEventListener('submit', function (e) {
    e.preventDefault();
    var msg = document.getElementById('busca-msg');
    var q = document.getElementById('q').value.replace(/\D/g, '');
    if (q.length < 3) { msg.textContent = 'Digite pelo menos 3 dígitos do código.'; return; }
    var achados = Object.keys(porCodigo).filter(function (c) { return c === q || c.slice(-q.length) === q; });
    if (achados.length === 0) { msg.textContent = 'Nenhum setor encontrado com esse código.'; return; }
    if (achados.length > 1) { msg.textContent = achados.length + ' setores encontrados. Digite mais dígitos.'; return; }
    msg.textContent = '';
    var l = porCodigo[achados[0]];
    map.fitBounds(l.getBounds(), { maxZoom: 17 });
    l.openPopup();
  });

  legenda();
})();
