function _1(md){return(
md`# NOTEBOOK CODING: CUADERNOS DE INDICADORES BIBLIOMÉTRICOS PARA REVISTAS EN OJS-OPENALEX`
)}

function _openAlexAuth(){return(
{
  email: "correo@institucion.edu",
  key: "YOUR_API_KEY"
}
)}

function _openAlexQueue()
{
  const maxConcurrent = 3;
  let active = 0;
  const pending = [];
  function runNext() {
    if (active >= maxConcurrent || pending.length === 0) return;
    active++;
    const {task, resolve, reject} = pending.shift();
    task().then(resolve, reject).finally(() => { active--; runNext(); });
  }
  return task => new Promise((resolve, reject) => {
    pending.push({task, resolve, reject});
    runNext();
  });
}


function _openAlexFetch(openAlexQueue,openAlexAuth){return(
(url, retries = 6) => openAlexQueue(async () => {
  const sep = url.includes("?") ? "&" : "?";
  const fullUrl = `${url}${sep}mailto=${openAlexAuth.email}&api_key=${openAlexAuth.key}`;
  for (let attempt = 0; attempt <= retries; attempt++) {
    const res = await fetch(fullUrl);
    if (res.ok) return res.json();
    if (res.status === 429 && attempt < retries) {
      const retryAfter = Number(res.headers.get("retry-after"));
      const wait = !Number.isNaN(retryAfter) && retryAfter > 0
        ? retryAfter * 1000
        : 600 * 2 ** attempt + Math.random() * 300;
      await new Promise(r => setTimeout(r, wait));
      continue;
    }
    throw new Error(`OpenAlex respondió ${res.status} para ${url}`);
  }
})
)}

function _sourceData(openAlexFetch){return(
openAlexFetch("https://api.openalex.org/sources/s6910135")
)}

function _serieAnual(sourceData){return(
sourceData.counts_by_year
  .filter(d => d.year >= 2016)
  .sort((a, b) => a.year - b.year)
  .map(d => ({year: d.year, publicaciones: d.works_count, citas: d.cited_by_count}))
)}

function _7(Plot,serieAnual){return(
Plot.plot({
  title: "Índice de producción anual — Revista española de Documentación Científica",
  subtitle: `Fuente: OpenAlex · actualizado automáticamente (${new Date().toLocaleDateString("es-SV")})`,
  width: 800,
  x: {label: "Año", tickFormat: "d"},
  y: {label: "Documentos publicados", grid: true},
  marks: [
    Plot.line(serieAnual, {x: "year", y: "publicaciones", stroke: "#b02a2a", strokeWidth: 2}),
    Plot.dot(serieAnual, {x: "year", y: "publicaciones", fill: "#b02a2a"}),
    Plot.text(serieAnual, {x: "year", y: "publicaciones", text: "publicaciones", dy: -12})
  ]
})
)}

function _8(Plot,serieAnual){return(
Plot.plot({
  title: "Citas por año — Revista Española de Documentación Científica",
  subtitle: "Fuente: OpenAlex",
  width: 800,
  x: {label: "Año", tickFormat: "d"},
  y: {label: "Citas recibidas", grid: true},
  marks: [
    Plot.line(serieAnual, {x: "year", y: "citas", stroke: "#2c3e50", strokeWidth: 2}),
    Plot.dot(serieAnual, {x: "year", y: "citas", fill: "#2c3e50"})
  ]
})
)}

async function _allWorks(openAlexFetch)
{
  const results = [];
  let cursor = "*";
  while (cursor) {
    const json = await openAlexFetch(
      `https://api.openalex.org/works?filter=primary_location.source.id:s6910135&per_page=200&cursor=${cursor}`
    );
    results.push(...json.results);
    cursor = json.meta.next_cursor;
  }
  return results;
}


function _topCitados(allWorks){return(
allWorks
  .slice()
  .sort((a, b) => b.cited_by_count - a.cited_by_count)
  .slice(0, 10)
  .map(w => ({titulo: w.title, anio: w.publication_year, citas: w.cited_by_count}))
)}

function _11(Plot,topCitados){return(
Plot.plot({
  title: "Top 10 artículos más citados — REDC (OpenAlex)",
  width: 900,
  marginLeft: 390,
  x: {label: "Citas"},
  y: {label: null},
  marks: [
    Plot.barX(topCitados, {x: "citas", y: "titulo", sort: {y: "-x"}, fill: "#b02a2a"}),
    Plot.text(topCitados, {x: "citas", y: "titulo", text: "citas", dx: 15})
  ]
})
)}

async function _sdgData(openAlexFetch)
{
  const json = await openAlexFetch(
    "https://api.openalex.org/works" +
    "?group_by=sustainable_development_goals.id" +
    "&filter=primary_location.source.id:s6910135"
  );

  return (json.group_by || [])
    .filter(d => d.count > 0 && d.key && d.key_display_name)
    .map(d => {
      /*
        Extrae el número desde IDs como:
        SDG1, SDG2, SDG3 ... SDG17.
      */
      const numero = Number(
        String(d.key).replace(/\D/g, "")
      );

      return {
        id: d.key,
        numero,
        ods: d.key_display_name,
        articulos: d.count
      };
    })
    .filter(d => d.numero >= 1 && d.numero <= 17)
    .sort((a, b) => a.numero - b.numero);
}


function _odsIcon(){return(
numero =>
  `https://sdgs.un.org/sites/default/files/2023-09/SDG-Goal-${numero}.png`
)}

function _chartODS(sdgData,d3)
{
  const width = 960;
  const columns = 5;
  const cellWidth = 170;
  const cellHeight = 180;
  const gap = 12;
  const rows = 4;

  /*
    Colores oficiales de los Objetivos de Desarrollo Sostenible.
  */
  const odsInfo = {
    1:  {nombre: "Fin de la pobreza", color: "#E5243B", simbolo: "⌂"},
    2:  {nombre: "Hambre cero", color: "#DDA63A", simbolo: "♨"},
    3:  {nombre: "Salud y bienestar", color: "#4C9F38", simbolo: "♥"},
    4:  {nombre: "Educación de calidad", color: "#C5192D", simbolo: "▣"},
    5:  {nombre: "Igualdad de género", color: "#FF3A21", simbolo: "♀"},
    6:  {nombre: "Agua limpia y saneamiento", color: "#26BDE2", simbolo: "≈"},
    7:  {nombre: "Energía asequible y no contaminante", color: "#FCC30B", simbolo: "☀"},
    8:  {nombre: "Trabajo decente y crecimiento económico", color: "#A21942", simbolo: "↗"},
    9:  {nombre: "Industria, innovación e infraestructura", color: "#FD6925", simbolo: "⚙"},
    10: {nombre: "Reducción de las desigualdades", color: "#DD1367", simbolo: "⇅"},
    11: {nombre: "Ciudades y comunidades sostenibles", color: "#FD9D24", simbolo: "⌂"},
    12: {nombre: "Producción y consumo responsables", color: "#BF8B2E", simbolo: "↻"},
    13: {nombre: "Acción por el clima", color: "#3F7E44", simbolo: "♁"},
    14: {nombre: "Vida submarina", color: "#0A97D9", simbolo: "≈"},
    15: {nombre: "Vida de ecosistemas terrestres", color: "#56C02B", simbolo: "♣"},
    16: {nombre: "Paz, justicia e instituciones sólidas", color: "#00689D", simbolo: "⚖"},
    17: {nombre: "Alianzas para lograr los objetivos", color: "#19486A", simbolo: "◎"}
  };

  /*
    Extrae el número del ODS desde sdgData.
    Funciona tanto si d.key es SDG1, SDG01 o una variante similar.
  */
  function getODSNumber(d) {
    if (d.numero) return Number(d.numero);

    const match = String(d.id || d.ods || "").match(/\d+/);

    return match ? Number(match[0]) : null;
  }

  /*
    Une los datos provenientes de OpenAlex con los 17 ODS.
    Los ODS no detectados por OpenAlex se muestran con 0 artículos.
  */
  const counts = new Map(
    sdgData
      .map(d => [getODSNumber(d), d.articulos || 0])
      .filter(([numero]) => numero >= 1 && numero <= 17)
  );

  const heatmapData = d3.range(1, 18).map(numero => ({
    numero,
    ods: odsInfo[numero].nombre,
    articulos: counts.get(numero) || 0,
    color: odsInfo[numero].color,
    simbolo: odsInfo[numero].simbolo
  }));

  const maxArticulos = d3.max(heatmapData, d => d.articulos) || 1;

  /*
    La opacidad expresa la intensidad de contribución:
    ODS con más artículos = celda más intensa.
  */
  const intensity = d3.scaleLinear()
    .domain([0, maxArticulos])
    .range([0.14, 1]);

  const svgHeight = 110 + rows * (cellHeight + gap) + 35;

  const svg = d3.create("svg")
    .attr("width", width)
    .attr("height", svgHeight)
    .attr("viewBox", [0, 0, width, svgHeight])
    .attr(
      "style",
      "width: 100%; height: auto; background: #FFFFFF; font-family: sans-serif;"
    );

  svg.append("text")
    .attr("x", 30)
    .attr("y", 36)
    .attr("font-size", 22)
    .attr("font-weight", 700)
    .attr("fill", "#1F2937")
    .text("Artículos por Objetivo de Desarrollo Sostenible");

  svg.append("text")
    .attr("x", 30)
    .attr("y", 62)
    .attr("font-size", 13)
    .attr("fill", "#6B7280")
    .text("REDC · Clasificación temática automática de OpenAlex");

  const cell = svg.append("g")
    .attr("transform", "translate(30, 92)")
    .selectAll("g")
    .data(heatmapData)
    .join("g")
    .attr("transform", (d, i) => {
      const col = i % columns;
      const row = Math.floor(i / columns);

      return `translate(${col * (cellWidth + gap)}, ${row * (cellHeight + gap)})`;
    });

  /*
    Fondo de celda: el color oficial se vuelve más intenso
    conforme aumentan los artículos clasificados en ese ODS.
  */
  cell.append("rect")
    .attr("width", cellWidth)
    .attr("height", cellHeight)
    .attr("rx", 10)
    .attr("fill", d => d.color)
    .attr("fill-opacity", d => intensity(d.articulos))
    .attr("stroke", d => d.color)
    .attr("stroke-width", d => d.articulos > 0 ? 2 : 1)
    .attr("stroke-opacity", d => d.articulos > 0 ? 0.9 : 0.25);

  /*
    Número identificador grande del ODS.
  */
  cell.append("text")
    .attr("x", 18)
    .attr("y", 42)
    .attr("font-size", 31)
    .attr("font-weight", 800)
    .attr("fill", d => d.articulos > 0 ? "#FFFFFF" : d.color)
    .text(d => String(d.numero).padStart(2, "0"));

  /*
    Símbolo decorativo representativo.
    No pretende sustituir al icono oficial del ODS.
  */
  cell.append("text")
    .attr("x", cellWidth - 25)
    .attr("y", 43)
    .attr("text-anchor", "middle")
    .attr("font-size", 30)
    .attr("font-weight", 700)
    .attr("fill", d => d.articulos > 0 ? "#FFFFFF" : d.color)
    .text(d => d.simbolo);

  /*
    Nombre del ODS, limitado a dos líneas visuales.
  */
  cell.append("text")
    .attr("x", 15)
    .attr("y", 77)
    .attr("font-size", 12)
    .attr("font-weight", 700)
    .attr("fill", d => d.articulos > 0 ? "#FFFFFF" : "#374151")
    .each(function(d) {
      const words = d.ods.split(" ");
      const firstLine = words.slice(0, Math.ceil(words.length / 2)).join(" ");
      const secondLine = words.slice(Math.ceil(words.length / 2)).join(" ");

      const label = d3.select(this);

      label.append("tspan")
        .attr("x", 15)
        .attr("dy", 0)
        .text(firstLine);

      if (secondLine) {
        label.append("tspan")
          .attr("x", 15)
          .attr("dy", "1.2em")
          .text(secondLine);
      }
    });

  /*
    Valor OpenAlex de artículos por objetivo.
  */
  cell.append("text")
    .attr("x", 15)
    .attr("y", 151)
    .attr("font-size", 25)
    .attr("font-weight", 800)
    .attr("fill", d => d.articulos > 0 ? "#FFFFFF" : "#6B7280")
    .text(d => d.articulos);

  cell.append("text")
    .attr("x", 15)
    .attr("y", 170)
    .attr("font-size", 10)
    .attr("fill", d => d.articulos > 0 ? "#FFFFFF" : "#6B7280")
    .attr("fill-opacity", 0.9)
    .text(d => d.articulos === 1 ? "artículo" : "artículos");

  cell.append("title")
    .text(d =>
      `ODS ${d.numero}: ${d.ods}\n` +
      `${d.articulos} ${d.articulos === 1 ? "artículo" : "artículos"}`
    );

  svg.append("text")
    .attr("x", 30)
    .attr("y", svgHeight - 15)
    .attr("font-size", 11)
    .attr("fill", "#6B7280")
    .text(
      "Fuente: OpenAlex. Un mismo artículo puede asociarse con más de un ODS."
    );

  return svg.node();
}


async function _doiData(openAlexFetch)
{
  const json = await openAlexFetch("https://api.openalex.org/works?group_by=has_doi&filter=primary_location.source.id:s6910135");
  const total = json.group_by.reduce((s, d) => s + d.count, 0);
  return json.group_by.map(d => ({
    estado: d.key === "true" ? "Con DOI" : "Sin DOI",
    articulos: d.count,
    porcentaje: +(d.count / total * 100).toFixed(1)
  }));
}


function _16(Plot,doiData){return(
Plot.plot({
  title: "Cobertura de DOI — REDC",
  subtitle: `${doiData.find(d => d.estado === "Con DOI")?.porcentaje ?? 0}% de los artículos tiene DOI asignado`,
  width: 500,
   marginLeft: 50,
  marginRight: 50,
  x: {label: "Artículos"},
  y: {label: null},
  marks: [
    Plot.barX(doiData, {x: "articulos", y: "estado", fill: d => d.estado === "Con DOI" ? "#b02a2a" : "#ccc"}),
    Plot.text(doiData, {x: "articulos", y: "estado", text: d => `${d.articulos} (${d.porcentaje}%)`, dx: 10})
  ]
})
)}

async function _orcidData(openAlexFetch)
{
  const json = await openAlexFetch("https://api.openalex.org/works?group_by=has_orcid&filter=primary_location.source.id:s6910135");
  const total = json.group_by.reduce((s, d) => s + d.count, 0);
  return json.group_by.map(d => ({
    estado: d.key === "true" ? "Con ORCID" : "Sin ORCID",
    articulos: d.count,
    porcentaje: +(d.count / total * 100).toFixed(1)
  }));
}


function _18(Plot,orcidData){return(
Plot.plot({
  title: "Cobertura de ORCID — REDC",
  subtitle: `${orcidData.find(d => d.estado === "Con ORCID")?.porcentaje ?? 0}% de los artículos tiene al menos un autor con ORCID`,
  width: 500,
     marginLeft: 100,
     marginRight: 50,
  x: {label: "Artículos"},
  y: {label: null},
  marks: [
    Plot.barX(orcidData, {x: "articulos", y: "estado", fill: d => d.estado === "Con ORCID" ? "#38C728" : "#ccc"}),
    Plot.text(orcidData, {x: "articulos", y: "estado", text: d => `${d.articulos} (${d.porcentaje}%)`, dx: 10})
  ]
})
)}

async function _oaData(openAlexFetch)
{
  const json = await openAlexFetch("https://api.openalex.org/works?group_by=open_access.oa_status&filter=primary_location.source.id:s6910135");
  return json.group_by
    .filter(d => d.count > 0)
    .sort((a, b) => b.count - a.count)
    .map(d => ({estado: d.key_display_name, articulos: d.count}));
}


function _20(Plot,oaData){return(
Plot.plot({
  title: "Estado de Acceso Abierto — REDC",
  subtitle: "gold / green / hybrid / bronze / closed, según clasificación de OpenAlex",
  width: 600,
  marginLeft: 100,
  marginRight: 100,
  x: {label: "Artículos"},
  y: {label: null},
  marks: [
    Plot.barX(oaData, {x: "articulos", y: "estado", sort: {y: "-x"}, fill: "#d68910"}),
    Plot.text(oaData, {x: "articulos", y: "estado", text: "articulos", dx: 10})
  ]
})
)}

function _obrasCitadasTop(allWorks){return(
allWorks
  .filter(w => w.cited_by_count > 0)
  .sort((a, b) => b.cited_by_count - a.cited_by_count)
  .slice(0, 50)
)}

async function _citacionesInfo(obrasCitadasTop,openAlexFetch)
{
  const countryCounts = new Map();
  let autocitas = 0, citasExternas = 0;

  const responses = await Promise.all(
    obrasCitadasTop.map(w => {
      const workId = w.id.replace("https://openalex.org/", "");
      return openAlexFetch(`https://api.openalex.org/works?filter=cites:${workId}&per_page=200`);
    })
  );

  for (const json of responses) {
    for (const w of json.results) {
      const esAutocita = w.primary_location?.source?.id === "https://openalex.org/s6910135";
      esAutocita ? autocitas++ : citasExternas++;
      const paises = new Set();
      for (const a of w.authorships ?? [])
        for (const inst of a.institutions ?? [])
          if (inst.country_code) paises.add(inst.country_code);
      for (const c of paises) countryCounts.set(c, (countryCounts.get(c) ?? 0) + 1);
    }
  }

  return {
    procedenciaCitas: Array.from(countryCounts, ([pais, citas]) => ({pais, citas}))
      .sort((a, b) => b.citas - a.citas).slice(0, 15),
    tasaAutocitacion: +(autocitas / (autocitas + citasExternas) * 100).toFixed(1)
  };
}


function _23(Plot,citacionesInfo){return(
Plot.plot({
  title: "Procedencia de las citas — REDC",
  subtitle: "País de la institución citante · Basado en los 50 artículos más citados · Fuente: OpenAlex",
  width: 850,
  height: Math.max(
    350,
    citacionesInfo.procedenciaCitas.length * 34 + 120
  ),
  marginTop: 70,
  marginLeft: 180,
  marginRight: 95,
  marginBottom: 45,

  x: {
    label: "Citas recibidas",
    grid: true,
    nice: true
  },

  y: {
    label: null,
    tickFormat: d => {
      const codigo = String(d).trim().toUpperCase();

      /*
        Convierte, por ejemplo:
        ES -> 🇪🇸
        MX -> 🇲🇽
        AR -> 🇦🇷
        US -> 🇺🇸
      */
      const bandera = [...codigo]
        .map(letra =>
          String.fromCodePoint(
            127397 + letra.charCodeAt(0)
          )
        )
        .join("");

      return `${bandera}  ${codigo}`;
    }
  },

  marks: [
    Plot.barX(
      citacionesInfo.procedenciaCitas,
      {
        x: "citas",
        y: "pais",
        sort: {y: "-x"},
        fill: "#234A80",
        insetTop: 3,
        insetBottom: 3,
        rx: 3,
        tip: true,
        title: d =>
          `País: ${d.pais}\nCitas: ${d.citas}`
      }
    ),

    Plot.text(
      citacionesInfo.procedenciaCitas,
      {
        x: "citas",
        y: "pais",
        text: d => d.citas.toLocaleString("es-ES"),
        dx: 12,
        textAnchor: "start",
        fill: "#1F2937",
        fontWeight: 700,
        fontSize: 12
      }
    )
  ]
})
)}

function _productividadAutores(allWorks)
{
  const counts = new Map();
  for (const w of allWorks)
    for (const a of w.authorships ?? [])
      if (a.author?.id) counts.set(a.author.id, (counts.get(a.author.id) ?? 0) + 1);
  const buckets = new Map();
  for (const c of counts.values()) buckets.set(c, (buckets.get(c) ?? 0) + 1);
  return Array.from(buckets, ([articulos, autores]) => ({articulos, autores})).sort((a, b) => a.articulos - b.articulos);
}


function _chartLotka(productividadAutores,Plot,d3)
{
  const datos = productividadAutores.filter(
    d => d.articulos > 0 && d.autores > 0
  );

  const autores1 = datos.find(d => d.articulos === 1)?.autores ?? 1;

  const lotka = datos.map(d => ({
    articulos: d.articulos,
    autores: autores1 / d.articulos ** 2
  }));

  return Plot.plot({
    title: "Ley de Lotka: productividad de autores en REDC",
    subtitle: "Distribución observada y referencia teórica (escala logarítmica)",

    width: 900,
    height: 450,
    marginTop: 50,
    marginRight: 55,
    marginBottom: 50,
    marginLeft: 85,

    style: {
      background: "white",
      color: "#374151",
      fontFamily: "Georgia, 'Times New Roman', serif",
      fontSize: "16px"
    },

    x: {
      type: "log",
      label: "Artículos publicados por autor",
      grid: true,
      tickFormat: d => d3.format(",d")(d)
    },

    y: {
      type: "log",
      label: "Número de autores",
      grid: true,
      tickFormat: d => d3.format(",d")(d)
    },

    marks: [
      Plot.line(lotka, {
        x: "articulos",
        y: "autores",
        stroke: "#8b5e3c",
        strokeWidth: 1.8,
        strokeDasharray: "5,0"
      }),

      Plot.line(datos, {
        x: "articulos",
        y: "autores",
        stroke: "#9f1d2d",
        strokeWidth: 1.5,
        strokeOpacity: 0.65
      }),

      Plot.dot(datos, {
        x: "articulos",
        y: "autores",
        r: 5.8,
        fill: "#9f1d2d",
        stroke: "white",
        strokeWidth: 1.6,
        title: d =>
          `${d.articulos} artículo(s): ${d.autores} autor(es)`
      }),

      Plot.text(
        [
          {x: 0.01, y: 0.95, label: "● Observado"},
          {x: 0.03, y: 0.89, label: "— — Lotka: 1/n²"}
        ],
        {
          x: "x",
          y: "y",
          text: "label",
          frameAnchor: "top-left",
          textAnchor: "start",
          fill: "#4b5563",
          fontSize: 16
        }
      )
    ]
  });
}


function _26(html,sourceData,citacionesInfo){return(
html`<div style="display:flex; gap:32px; font-family:sans-serif; margin:12px 0;">
  <div><div style="font-size:12px;color:#666;">H-index</div><div style="font-size:32px;font-weight:700;color:#b02a2a;">${sourceData.summary_stats.h_index}</div></div>
  <div><div style="font-size:12px;color:#666;">i10-index</div><div style="font-size:32px;font-weight:700;color:#b02a2a;">${sourceData.summary_stats.i10_index}</div></div>
  <div><div style="font-size:12px;color:#666;">Citación media (2 años)</div><div style="font-size:32px;font-weight:700;color:#b02a2a;">${sourceData.summary_stats["2yr_mean_citedness"].toFixed(2)}</div></div>
  <div><div style="font-size:12px;color:#666;">Autocitación (top-50)</div><div style="font-size:32px;font-weight:700;color:#b02a2a;">${citacionesInfo.tasaAutocitacion}%</div></div>
</div>`
)}

async function _chart(require)
{
  const d3 = await require("d3@7");

  const url = "https://api.openalex.org/sources/s6910135?select=counts_by_year,display_name,first_publication_year,last_publication_year";

  const response = await fetch(url);
  if (!response.ok) throw new Error(`Error de OpenAlex: ${response.status}`);

  const source = await response.json();
  const raw = source.counts_by_year || [];

  const firstYear = source.first_publication_year || d3.min(raw, d => d.year);
  const lastYear = source.last_publication_year || d3.max(raw, d => d.year);

  const byYear = new Map(raw.map(d => [d.year, d]));

  const data = d3.range(firstYear, lastYear + 1)
    .map(year => {
      const item = byYear.get(year) || {};
      return {
        year,
        works: item.works_count || 0,
        citations: item.cited_by_count || 0
      };
    })
    .filter(d => d.year >= 2014);

  const width = 960;
  const height = 430;

  const margin = {
    top: 92,
    right: 55,
    bottom: 55,
    left: 75
  };

  const plotWidth = width - margin.left - margin.right;
  const plotHeight = height - margin.top - margin.bottom;

  const container = document.createElement("div");

  container.style.cssText = `
    max-width: ${width}px;
    margin: auto;
    font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  `;

  const tooltip = d3.select(container)
    .append("div")
    .style("position", "fixed")
    .style("visibility", "hidden")
    .style("z-index", 1000)
    .style("pointer-events", "none")
    .style("padding", "10px 14px")
    .style("border-radius", "8px")
    .style("background", "rgba(17,24,39,.96)")
    .style("color", "white")
    .style("font-size", "12.5px")
    .style("line-height", 1.5)
    .style("box-shadow", "0 8px 24px rgba(0,0,0,.22)");

  function createChart(metric, title, subtitle, color, legend, id) {
    const svg = d3.create("svg")
      .attr("viewBox", [0, 0, width, height])
      .attr("width", width)
      .attr("height", height)
      .style("display", "block")
      .style("max-width", "100%")
      .style("height", "auto")
      .style("margin-bottom", "32px")
      .style("background", "white")
      .style("border", "1px solid #f0f0f0")
      .style("border-radius", "10px")
      .style("box-shadow", "0 2px 8px rgba(0,0,0,.04)");

    const x = d3.scaleLinear()
      .domain(d3.extent(data, d => d.year))
      .range([margin.left, width - margin.right]);

    const y = d3.scaleLinear()
      .domain([0, (d3.max(data, d => d[metric]) || 1) * 1.15])
      .nice()
      .range([height - margin.bottom, margin.top]);

    const line = d3.line()
      .defined(d => d[metric] > 0)
      .x(d => x(d.year))
      .y(d => y(d[metric]))
      .curve(d3.curveMonotoneX);

    const area = d3.area()
      .defined(d => d[metric] > 0)
      .x(d => x(d.year))
      .y0(height - margin.bottom)
      .y1(d => y(d[metric]))
      .curve(d3.curveMonotoneX);

    const defs = svg.append("defs");

    defs.append("clipPath")
      .attr("id", `clip-${id}`)
      .append("rect")
      .attr("x", margin.left)
      .attr("y", margin.top)
      .attr("width", plotWidth)
      .attr("height", plotHeight);

    const gradient = defs.append("linearGradient")
      .attr("id", `gradient-${id}`)
      .attr("x1", "0%")
      .attr("y1", "0%")
      .attr("x2", "0%")
      .attr("y2", "100%");

    gradient.append("stop")
      .attr("offset", "0%")
      .attr("stop-color", color)
      .attr("stop-opacity", 0.2);

    gradient.append("stop")
      .attr("offset", "100%")
      .attr("stop-color", color)
      .attr("stop-opacity", 0.02);

    // Cuadrícula horizontal.
    svg.append("g")
      .attr("transform", `translate(${margin.left},0)`)
      .call(
        d3.axisLeft(y)
          .ticks(7)
          .tickSize(-plotWidth)
          .tickFormat("")
      )
      .call(g => g.select(".domain").remove())
      .call(g => g.selectAll("line")
        .attr("stroke", "#e5e7eb")
        .attr("stroke-dasharray", "3,3"));

    // Cuadrícula vertical.
    svg.append("g")
      .attr("transform", `translate(0,${height - margin.bottom})`)
      .call(
        d3.axisBottom(x)
          .ticks(Math.min(data.length, 12))
          .tickSize(-plotHeight)
          .tickFormat("")
      )
      .call(g => g.select(".domain").remove())
      .call(g => g.selectAll("line")
        .attr("stroke", "#e5e7eb")
        .attr("stroke-dasharray", "3,3"));

    const plot = svg.append("g")
      .attr("clip-path", `url(#clip-${id})`);

    // Área y línea.
    plot.append("path")
      .datum(data)
      .attr("fill", `url(#gradient-${id})`)
      .attr("d", area);

    plot.append("path")
      .datum(data)
      .attr("fill", "none")
      .attr("stroke", color)
      .attr("stroke-width", 2.8)
      .attr("d", line);

    const values = data.filter(d => d[metric] > 0);

    // Puntos.
    plot.selectAll("circle")
      .data(values)
      .join("circle")
      .attr("cx", d => x(d.year))
      .attr("cy", d => y(d[metric]))
      .attr("r", 4.3)
      .attr("fill", "white")
      .attr("stroke", color)
      .attr("stroke-width", 2.2);

    // Etiquetas numéricas.
    plot.selectAll("text.value")
      .data(values)
      .join("text")
      .attr("class", "value")
      .attr("x", d => x(d.year))
      .attr("y", d => y(d[metric]) - 12)
      .attr("text-anchor", "middle")
      .attr("font-size", "10.5px")
      .attr("font-weight", 600)
      .attr("fill", color)
      .text(d => d[metric].toLocaleString());

    // Ejes.
    svg.append("g")
      .attr("transform", `translate(0,${height - margin.bottom})`)
      .call(
        d3.axisBottom(x)
          .ticks(Math.min(data.length, 12))
          .tickFormat(d3.format("d"))
      )
      .call(g => g.select(".domain").attr("stroke", "#d1d5db"))
      .call(g => g.selectAll("text")
        .attr("font-size", "12px")
        .attr("fill", "#4b5563"));

    svg.append("g")
      .attr("transform", `translate(${margin.left},0)`)
      .call(d3.axisLeft(y).ticks(7))
      .call(g => g.select(".domain").remove())
      .call(g => g.selectAll("text")
        .attr("font-size", "12px")
        .attr("fill", color));

    // Título y subtítulo.
    svg.append("text")
      .attr("x", margin.left)
      .attr("y", 30)
      .attr("font-size", "20px")
      .attr("font-weight", 700)
      .attr("fill", "#111827")
      .text(title);

    svg.append("text")
      .attr("x", margin.left)
      .attr("y", 51)
      .attr("font-size", "13px")
      .attr("fill", "#6b7280")
      .text(subtitle);

    // Leyenda.
    const legendGroup = svg.append("g")
      .attr("transform", `translate(${margin.left},74)`);

    legendGroup.append("line")
      .attr("x2", 25)
      .attr("stroke", color)
      .attr("stroke-width", 2.8);

    legendGroup.append("circle")
      .attr("cx", 12.5)
      .attr("r", 3.8)
      .attr("fill", "white")
      .attr("stroke", color)
      .attr("stroke-width", 2);

    legendGroup.append("text")
      .attr("x", 34)
      .attr("y", 4)
      .attr("font-size", "12px")
      .attr("fill", "#374151")
      .text(legend);

    // Área interactiva y tooltip.
    const bisect = d3.bisector(d => d.year).center;

    svg.append("rect")
      .attr("x", margin.left)
      .attr("y", margin.top)
      .attr("width", plotWidth)
      .attr("height", plotHeight)
      .attr("fill", "transparent")
      .style("cursor", "crosshair")
      .on("mousemove", event => {
        const [mouseX] = d3.pointer(event, svg.node());
        const datum = data[bisect(data, x.invert(mouseX))];

        if (!datum) return;

        tooltip
          .style("visibility", "visible")
          .style("left", `${event.clientX + 14}px`)
          .style("top", `${event.clientY - 58}px`)
          .html(`
            <strong style="font-size:14px">${datum.year}</strong><br>
            <span style="color:${color}">●</span>
            ${legend}: <strong>${datum[metric].toLocaleString()}</strong>
          `);
      })
      .on("mouseleave", () => tooltip.style("visibility", "hidden"));

    return svg.node();
  }

  container.append(
    createChart(
      "works",
      "Publicaciones indexadas por año",
      "Revista Española de Documentación Científica",
      "#c41e3a",
      "Publicaciones indexadas",
      "works"
    ),
    createChart(
      "citations",
      "Citas recibidas por año",
      "Citas anuales registradas en OpenAlex para Revista Española de Documentación Científica",
      "#6b7280",
      "Citas recibidas",
      "citations"
    )
  );

  return container;
}


async function _authorData()
{
  const API_KEY = "YOUR_API_KEY";
  const MAILTO = "correo@institucion.edu";

  const url = new URL("https://api.openalex.org/works");

  url.searchParams.set(
    "filter",
    "primary_location.source.id:/s6910135"
  );

  url.searchParams.set(
    "group_by",
    "authorships.author.id"
  );

  /*
    Recupera hasta 200 autores agrupados,
    ordenados posteriormente por el valor de publicaciones.
  */
  url.searchParams.set("per_page", "200");

  url.searchParams.set("include_xpac", "true");
  url.searchParams.set("api_key", API_KEY);
  url.searchParams.set("mailto", MAILTO);

  const res = await fetch(url);

  if (!res.ok) {
    throw new Error(
      `OpenAlex respondió ${res.status}: ${res.statusText}`
    );
  }

  const json = await res.json();

  return {
    name: "REDC",
    children: (json.group_by || [])
      .filter(d =>
        d.key &&
        d.key !== "unknown" &&
        d.key_display_name &&
        d.count > 0
      )
      .map(d => ({
        id: d.key,
        name: d.key_display_name,
        value: d.count
      }))
      .sort((a, b) => b.value - a.value)
  };
}


function _chartAuthors(d3,authorData)
{
  const width = 1000;
  const height = width;
  const margin = 1;

  const format = d3.format(",d");
  /* Fondo neutro con una leve tonalidad azul */
  const backgroundColor = "#F7F9FC";
  /*
    Nodo raíz o contenedor:
    gris azulado suave para no competir con los nodos institucionales.
  */
  const parentColor = "#E8EEF5";
  const parentStroke = "#9AAFC4";
  /*
    Paleta para autores.
    Se mantiene independiente de institutionPalette,
    para no alterar la visualización institucional.
  */
  const authorPalette = [
    "#B2182B", /* Rojo oscuro */
    "#D6604D", /* Rojo medio */
    "#E8897E", /* Rojo claro */
    "#C0392B", /* Rojo intenso */
    "#A93226", /* Rojo vino */

    "#2166AC", /* Azul oscuro */
    "#4393C3", /* Azul medio */
    "#67A9CF", /* Azul claro */
    "#2E86C1", /* Azul intenso */
    "#1F4E79", /* Azul profundo */

    "#8E3B46", /* Rojo grisáceo */
    "#5B8DB8", /* Azul grisáceo */
    "#C85A54", /* Rojo coral */
    "#3D6D99", /* Azul acero */
    "#A94442", /* Rojo terracota */
    "#4C78A8"  /* Azul institucional */
  ];

  const authorColor = d3.scaleOrdinal()
    .domain(authorData.children.map(d => d.id))
    .range(authorPalette);

  function authorTextColor(authorId) {
    const color = d3.color(authorColor(authorId));

    const luminance =
      0.299 * color.r +
      0.587 * color.g +
      0.114 * color.b;

    return luminance > 165 ? "#4A3428" : "#FFFDF7";
  }

  const pack = d3.pack()
    .size([width - margin * 2, height - margin * 2])
    .padding(3);

  const root = pack(
    d3.hierarchy(authorData)
      .sum(d => d.value)
      .sort((a, b) => b.value - a.value)
  );

  const svg = d3.create("svg")
    .attr("width", width)
    .attr("height", height)
    .attr("viewBox", [-margin, -margin, width, height])
    .attr(
      "style",
      `width: 100%; height: auto; font: 10px sans-serif; background:${backgroundColor};`
    )
    .attr("text-anchor", "middle");

  const node = svg.append("g")
    .selectAll()
    .data(root.descendants())
    .join("g")
    .attr("transform", d => `translate(${d.x},${d.y})`);

  node.append("title")
    .text(d =>
      `${d.ancestors()
        .map(d => d.data.name)
        .reverse()
        .join(" / ")}\n${format(d.value)} publicaciones`
    );

  node.append("circle")
    .attr("fill", d =>
      d.children ? parentColor : authorColor(d.data.id)
    )
    .attr("stroke", d =>
      d.children ? parentStroke : "#6B7C8C"
    )
    .attr("stroke-width", d => d.children ? 1.5 : 1)
    .attr("r", d => d.r);

  const text = node
    .filter(d => !d.children && d.r > 10)
    .append("text")
    .attr("clip-path", d => `circle(${d.r})`)
    .attr("fill", d => authorTextColor(d.data.id))
    .attr("font-weight", "600");

  text.selectAll()
    .data(d => d.data.name.split(/\s+/g))
    .join("tspan")
    .attr("x", 0)
    .attr("y", (d, i, nodes) => `${i - nodes.length / 2 + 0.15}em`)
    .text(d => d);

  text.append("tspan")
    .attr("x", 0)
    .attr(
      "y",
      d => `${d.data.name.split(/\s+/g).length / 2 + 0.5}em`
    )
    .attr("fill", d => authorTextColor(d.data.id))
    .attr("fill-opacity", 0.82)
    .attr("font-size", "9px")
    .text(d => `${format(d.value)} pub.`);
  
  return svg.node();
}


async function _countryData()
{
  const API_KEY = "YOUR_API_KEY";
  const MAILTO = "correo@institucion.edu";

  const url = new URL("https://api.openalex.org/works");

  url.searchParams.set(
    "filter",
    "primary_location.source.id:/s6910135"
  );

  url.searchParams.set(
    "group_by",
    "authorships.countries"
  );

  /*
    Hasta 200 países agrupados.
    Nota: OpenAlex admite actualmente 200 como comportamiento heredado.
  */
  url.searchParams.set("per_page", "200");

  url.searchParams.set("include_xpac", "true");

  /*
    Autenticación e identificación de la solicitud.
  */
  url.searchParams.set("api_key", API_KEY);
  url.searchParams.set("mailto", MAILTO);

  const res = await fetch(url);

  if (!res.ok) {
    throw new Error(
      `OpenAlex respondió ${res.status}: ${res.statusText}`
    );
  }

  const json = await res.json();

  return {
    name: "REDC",
    children: (json.group_by || [])
      .filter(d =>
        d.key &&
        d.key !== "unknown" &&
        d.key_display_name &&
        d.count > 0
      )
      .map(d => ({
        id: d.key,
        name: d.key_display_name,
        value: d.count
      }))
      .sort((a, b) => b.value - a.value)
  };
}


function _chartCountries(d3,countryData)
{
  const width = 1000;
  const height = width;
  const margin = 1;

  const format = d3.format(",d");

  const backgroundColor = "#F7F9FC";
  /*
    Nodo raíz o contenedor:
    gris azulado suave para no competir con los nodos institucionales.
  */
  const parentColor = "#E8EEF5";
  const parentStroke = "#9AAFC4";
  /*
    Paleta para autores.
    Se mantiene independiente de institutionPalette,
    para no alterar la visualización institucional.
  */
  const countryPalette = [
    "#B2182B", /* Rojo oscuro */
    "#D6604D", /* Rojo medio */
    "#E8897E", /* Rojo claro */
    "#C0392B", /* Rojo intenso */
    "#A93226", /* Rojo vino */

    "#2166AC", /* Azul oscuro */
    "#4393C3", /* Azul medio */
    "#67A9CF", /* Azul claro */
    "#2E86C1", /* Azul intenso */
    "#1F4E79", /* Azul profundo */

    "#8E3B46", /* Rojo grisáceo */
    "#5B8DB8", /* Azul grisáceo */
    "#C85A54", /* Rojo coral */
    "#3D6D99", /* Azul acero */
    "#A94442", /* Rojo terracota */
    "#4C78A8"  /* Azul institucional */
  ];

  const countryColor = d3.scaleOrdinal()
    .domain(countryData.children.map(d => d.id))
    .range(countryPalette);

  function countryTextColor(countryId) {
    const color = d3.color(countryColor(countryId));

    const luminance =
      0.299 * color.r +
      0.587 * color.g +
      0.114 * color.b;

    return luminance > 165 ? "#4A3428" : "#FFFDF7";
  }

  const pack = d3.pack()
    .size([width - margin * 2, height - margin * 2])
    .padding(3);

  const root = pack(
    d3.hierarchy(countryData)
      .sum(d => d.value)
      .sort((a, b) => b.value - a.value)
  );

  const svg = d3.create("svg")
    .attr("width", width)
    .attr("height", height)
    .attr("viewBox", [-margin, -margin, width, height])
    .attr(
      "style",
      `width: 100%; height: auto; font: 10px sans-serif; background:${backgroundColor};`
    )
    .attr("text-anchor", "middle");

  const node = svg.append("g")
    .selectAll()
    .data(root.descendants())
    .join("g")
    .attr("transform", d => `translate(${d.x},${d.y})`);

  node.append("title")
    .text(d =>
      `${d.ancestors()
        .map(d => d.data.name)
        .reverse()
        .join(" / ")}\n${format(d.value)} publicaciones`
    );

  node.append("circle")
    .attr("fill", d =>
      d.children ? parentColor : countryColor(d.data.id)
    )
    .attr("stroke", d =>
      d.children ? parentStroke : "#6B7C8C"
    )
    .attr("stroke-width", d => d.children ? 1.5 : 1)
    .attr("r", d => d.r);

  const text = node
    .filter(d => !d.children && d.r > 14)
    .append("text")
    .attr("clip-path", d => `circle(${d.r})`)
    .attr("fill", d => countryTextColor(d.data.id))
    .attr("font-weight", "600");

  text.append("tspan")
    .attr("x", 0)
    .attr("y", "-0.1em")
    .text(d => d.data.name);

  text.append("tspan")
    .attr("x", 0)
    .attr("y", "1.1em")
    .attr("fill-opacity", 0.82)
    .attr("font-size", "9px")
    .text(d => `${format(d.value)} pub.`);

  return svg.node();
}


async function _data()
{
  const API_KEY = "YOUR_API_KEY";
  const MAILTO = "correo@institucion.edu";

  const res = await fetch(
    "https://api.openalex.org/works" +
    "?filter=primary_location.source.id:s6910135" +
    "&group_by=authorships.institutions.lineage" +
    "&per_page=200" +
    "&include_xpac=true" +
    "&api_key=" + encodeURIComponent(API_KEY) +
    "&mailto=" + encodeURIComponent(MAILTO)
  );

  if (!res.ok) {
    throw new Error(
      `OpenAlex respondió ${res.status}: ${res.statusText}`
    );
  }

  const json = await res.json();

  return {
    name: "REDC",
    children: json.group_by
      .filter((g) => g.key !== "unknown" && g.key_display_name)
      .map((g) => ({
        name: g.key_display_name,
        value: g.count
      }))
      .filter((g) => g.value > 0)
  };
}


function _chartInstitutions(d3,data,html)
{
  const width = 1000;
  const height = width;
  const margin = 1;

  const format = d3.format(",d");

  if (!data || !data.children || data.children.length === 0) {
    return html`<div style="
      padding: 24px;
      border: 1px solid #9AAFC4;
      border-radius: 8px;
      background: #F7F9FC;
      color: #3F3F3F;
      font: 14px sans-serif;
    ">
      No hay instituciones disponibles para visualizar.
    </div>`;
  }

  const backgroundColor = "#F7F9FC";
  const parentColor = "#E8EEF5";
  const parentStroke = "#9AAFC4";

  const institutionPalette = [
    "#B2182B",
    "#D6604D",
    "#E8897E",
    "#C0392B",
    "#A93226",
    "#2166AC",
    "#4393C3",
    "#67A9CF",
    "#2E86C1",
    "#1F4E79",
    "#8E3B46",
    "#5B8DB8",
    "#C85A54",
    "#3D6D99",
    "#A94442",
    "#4C78A8"
  ];

  const institutionColor = d3.scaleOrdinal()
    .domain(data.children.map(d => d.name))
    .range(institutionPalette);

  function textColor(institutionName) {
    const color = d3.color(institutionColor(institutionName));

    const luminance =
      0.299 * color.r +
      0.587 * color.g +
      0.114 * color.b;

    return luminance > 165 ? "#3F3F3F" : "#FFFFFF";
  }

  function nameLines(name) {
    return name.split(/\s+/).filter(Boolean);
  }

  const pack = d3.pack()
    .size([width - margin * 2, height - margin * 2])
    .padding(3);

  const root = pack(
    d3.hierarchy(data)
      .sum(d => d.value || 0)
      .sort((a, b) => b.value - a.value)
  );

  const svg = d3.create("svg")
    .attr("width", width)
    .attr("height", height)
    .attr("viewBox", [-margin, -margin, width, height])
    .attr(
      "style",
      `width: 100%; height: auto; font: 10px sans-serif; background: ${backgroundColor};`
    )
    .attr("text-anchor", "middle");

  const node = svg.append("g")
    .selectAll("g")
    .data(root.descendants())
    .join("g")
    .attr("transform", d => `translate(${d.x},${d.y})`);

  node.append("title")
    .text(d =>
      `${d.ancestors()
        .map(d => d.data.name)
        .reverse()
        .join(" / ")}\n${format(d.value)} publicaciones`
    );

  node.append("circle")
    .attr("fill", d =>
      d.children ? parentColor : institutionColor(d.data.name)
    )
    .attr("stroke", d =>
      d.children ? parentStroke : "#6B7C8C"
    )
    .attr("stroke-width", d => d.children ? 1.5 : 1)
    .attr("r", d => d.r);

  const text = node
    .filter(d => !d.children && d.r > 14)
    .append("text")
    .attr("clip-path", d => `circle(${d.r})`)
    .attr("fill", d => textColor(d.data.name))
    .attr("font-weight", "600")
    .attr("pointer-events", "none");

  text.each(function(d) {
    const lines = nameLines(d.data.name);
    const visibleLines = lines.slice(0, 3);
    const label = d3.select(this);

    visibleLines.forEach((line, index) => {
      label.append("tspan")
        .attr("x", 0)
        .attr(
          "y",
          `${index - (visibleLines.length - 1) / 2 - 0.45}em`
        )
        .text(line);
    });

    label.append("tspan")
      .attr("x", 0)
      .attr(
        "y",
        `${(visibleLines.length - 1) / 2 + 1.15}em`
      )
      .attr("fill-opacity", 0.82)
      .attr("font-size", "9px")
      .attr("font-weight", "400")
      .text(`${format(d.value)} pub.`);
  });

  return svg.node();
}


export default function define(runtime, observer) {
  const main = runtime.module();
  main.variable(observer()).define(["md"], _1);
  main.variable(observer("openAlexAuth")).define("openAlexAuth", _openAlexAuth);
  main.variable(observer("openAlexQueue")).define("openAlexQueue", _openAlexQueue);
  main.variable(observer("openAlexFetch")).define("openAlexFetch", ["openAlexQueue","openAlexAuth"], _openAlexFetch);
  main.variable(observer("sourceData")).define("sourceData", ["openAlexFetch"], _sourceData);
  main.variable(observer("serieAnual")).define("serieAnual", ["sourceData"], _serieAnual);
  main.variable(observer()).define(["Plot","serieAnual"], _7);
  main.variable(observer()).define(["Plot","serieAnual"], _8);
  main.variable(observer("allWorks")).define("allWorks", ["openAlexFetch"], _allWorks);
  main.variable(observer("topCitados")).define("topCitados", ["allWorks"], _topCitados);
  main.variable(observer()).define(["Plot","topCitados"], _11);
  main.variable(observer("sdgData")).define("sdgData", ["openAlexFetch"], _sdgData);
  main.variable(observer("odsIcon")).define("odsIcon", _odsIcon);
  main.variable(observer("chartODS")).define("chartODS", ["sdgData","d3"], _chartODS);
  main.variable(observer("doiData")).define("doiData", ["openAlexFetch"], _doiData);
  main.variable(observer()).define(["Plot","doiData"], _16);
  main.variable(observer("orcidData")).define("orcidData", ["openAlexFetch"], _orcidData);
  main.variable(observer()).define(["Plot","orcidData"], _18);
  main.variable(observer("oaData")).define("oaData", ["openAlexFetch"], _oaData);
  main.variable(observer()).define(["Plot","oaData"], _20);
  main.variable(observer("obrasCitadasTop")).define("obrasCitadasTop", ["allWorks"], _obrasCitadasTop);
  main.variable(observer("citacionesInfo")).define("citacionesInfo", ["obrasCitadasTop","openAlexFetch"], _citacionesInfo);
  main.variable(observer()).define(["Plot","citacionesInfo"], _23);
  main.variable(observer("productividadAutores")).define("productividadAutores", ["allWorks"], _productividadAutores);
  main.variable(observer("chartLotka")).define("chartLotka", ["productividadAutores","Plot","d3"], _chartLotka);
  main.variable(observer()).define(["html","sourceData","citacionesInfo"], _26);
  main.variable(observer("chart")).define("chart", ["require"], _chart);
  main.variable(observer("authorData")).define("authorData", _authorData);
  main.variable(observer("chartAuthors")).define("chartAuthors", ["d3","authorData"], _chartAuthors);
  main.variable(observer("countryData")).define("countryData", _countryData);
  main.variable(observer("chartCountries")).define("chartCountries", ["d3","countryData"], _chartCountries);
  main.variable(observer("data")).define("data", _data);
  main.variable(observer("chartInstitutions")).define("chartInstitutions", ["d3","data","html"], _chartInstitutions);
  return main;
}
