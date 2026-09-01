# NOTEBOOK CODING: CUADERNOS DE INDICADORES BIBLIOMÉTRICOS PARA REVISTAS EN OJS-OPENALEX

[https://old.observablehq.com/@kahernandezg/notebook-coding-cuadernos-de-indicadores-biblometr](https://old.observablehq.com/@kahernandezg/notebook-coding-cuadernos-de-indicadores-biblometr)

View this notebook in your browser by running a web server in this folder. For
example:

~~~sh
npx http-server
~~~

Or, use the [Observable Runtime](https://github.com/observablehq/runtime) to
import this module directly into your application. To npm install:

~~~sh
npm install @observablehq/runtime@5
npm install https://api.observablehq.com/d/cff3d60368bf6eee@372.tgz?v=3
~~~

Then, import your notebook and the runtime as:

~~~js
import {Runtime, Inspector} from "@observablehq/runtime";
import define from "cff3d60368bf6eee";
~~~

To log the value of the cell named “foo”:

~~~js
const runtime = new Runtime();
const main = runtime.module(define);
main.value("foo").then(value => console.log(value));
~~~

# Cuadernos de Indicadores Bibliométricos para OJS + OpenAlex

Notebook interactivo para extraer métricas bibliométricas desde **OpenAlex** y generar visualizaciones reutilizables y embebibles para revistas científicas gestionadas con **Open Journal Systems (OJS)**.

El proyecto incluye indicadores bibliométricos, gráficos interactivos y recursos para publicar paneles de datos de revistas directamente en OJS.

> **Importante:** no publiques claves de API reales en GitHub, Observable público ni repositorios compartidos. Usa variables de entorno, archivos de configuración excluidos con `.gitignore` o secretos de despliegue.

---

## Contenido

- [Características](#características)
- [Reutilización rápida](#reutilización-rápida)
- [Estructura del repositorio](#estructura-del-repositorio)
- [Configuración para otra revista](#configuración-para-otra-revista)
- [Guía por gráfico](#guía-por-gráfico)
- [Insertar visualizaciones en OJS](#insertar-visualizaciones-en-ojs)
- [Publicar gráficos estáticos](#publicar-gráficos-estáticos)
- [Actualización de datos](#actualización-de-datos)
- [Licencia](#licencia)

---

## Características

El notebook incluye indicadores listos para adaptar y publicar:

1. Producción anual de artículos.
2. Citas recibidas.
3. Artículos más citados.
4. Clasificación por Objetivos de Desarrollo Sostenible (ODS).
5. Cobertura de DOI.
6. Cobertura de ORCID.
7. Acceso abierto.
8. Procedencia geográfica de las citas.
9. Productividad de autores según la Ley de Lotka.
10. Mapa de autores.
11. Mapa de países.
12. Mapa de instituciones.

También puede utilizarse para desarrollar indicadores adicionales, tales como:

- Concentración institucional.
- Diversidad geográfica.
- Participación internacional.
- Posibles indicadores de endogamia editorial.
- Distribución de autorías.
- Evolución de citas por año.
- Colaboración institucional.
- Presencia de metadatos bibliográficos.

---

## Reutilización rápida

Para adaptar el notebook a otra revista, cambia los siguientes tres parámetros en el archivo `config.js`:

| Parámetro | Descripción | Dónde obtenerlo |
|---|---|---|
| `SOURCE_ID` | Identificador de la revista en OpenAlex | Busca la revista en [OpenAlex Sources](https://openalex.org/sources/) y copia su identificador, por ejemplo: `s6910135` |
| `EMAIL` | Correo electrónico de contacto para identificar las consultas a OpenAlex | Utiliza un correo institucional o de contacto del proyecto |
| `API_KEY` | Clave de acceso a la API de OpenAlex | Obténla desde el panel de usuario de OpenAlex |

Ejemplo de archivo de configuración:

```javascript
const config = {
  SOURCE_ID: "s6910135",
  EMAIL: "correo@institucion.edu",
  API_KEY: "TU_API_KEY"
};
```

> No subas `config.js` con una API key real a un repositorio público. Puedes crear un archivo `config.example.js` con valores de ejemplo y excluir `config.js` mediante `.gitignore`.

Ejemplo de `config.example.js`:

```javascript
const config = {
  SOURCE_ID: "s6910135",
  EMAIL: "correo@institucion.edu",
  API_KEY: "TU_API_KEY"
};
```

Ejemplo de `.gitignore`:

```gitignore
config.js
.env
.env.local
```

---

## Estructura del repositorio

```text
.
├── index.html              # Punto de entrada del Runtime de Observable
├── runtime.js              # Motor de ejecución de Observable
├── inspector.css           # Estilos base de la visualización
├── notebook.js             # Lógica de las celdas y consultas OpenAlex
├── config.js               # Configuración local: SOURCE_ID, EMAIL y API_KEY
├── config.example.js       # Plantilla de configuración sin credenciales reales
└── ojs-embed/              # Snippets HTML para insertar gráficos en OJS
```

---

## Configuración para otra revista

Para reutilizar este proyecto con otra revista indexada en OpenAlex, revisa y sustituye los identificadores, títulos y credenciales necesarios.

### 1. Fuente de datos

En las celdas o funciones que consultan OpenAlex, reemplaza:

```javascript
s6910135
```

por el valor de tu variable:

```javascript
config.SOURCE_ID
```

Las consultas que normalmente requieren esta modificación incluyen:

```text
sourceData
allWorks
sdgData
doiData
orcidData
oaData
authorData
countryData
data
citacionesInfo
```

Ejemplo:

```javascript
url.searchParams.set(
  "filter",
  `primary_location.source.id:${config.SOURCE_ID}`
);
```

### 2. Autocitas y procedencia de citas

En la lógica de `citacionesInfo`, sustituye comparaciones directas como esta:

```javascript
source.id === "https://openalex.org/s6910135"
```

por una comparación basada en la variable de configuración:

```javascript
source.id === `https://openalex.org/${config.SOURCE_ID}`
```

### 3. Títulos y subtítulos

Reemplaza referencias específicas a la revista, por ejemplo:

```text
REDC
Revista Española de Documentación Científica
```

por el nombre corto y el nombre completo de la revista que analizarás.

Puedes definirlos en `config.js`:

```javascript
const config = {
  SOURCE_ID: "s6910135",
  JOURNAL_SHORT_NAME: "REDC",
  JOURNAL_NAME: "Revista Española de Documentación Científica",
  EMAIL: "correo@institucion.edu",
  API_KEY: "TU_API_KEY"
};
```

### 4. Credenciales de OpenAlex

Actualiza el correo y la clave de API:

```javascript
url.searchParams.set("api_key", config.API_KEY);
url.searchParams.set("mailto", config.EMAIL);
```

---

## Guía por gráfico

| Gráfico | Variables o funciones principales | Qué debes editar |
|---|---|---|
| **Producción anual** | `sourceData`, `serieAnual`, `_7`, `_8` | Sustituye `s6910135` por `config.SOURCE_ID` y actualiza títulos de la revista |
| **Top 10 citados** | `allWorks`, `topCitados`, `_11` | Modifica el filtro `source.id:s6910135` |
| **ODS** | `sdgData`, `chartODS` | Modifica el filtro `source.id:s6910135`; los colores ODS pueden mantenerse |
| **Cobertura DOI** | `doiData`, `_16` | Modifica el filtro `source.id:s6910135` y el subtítulo porcentual |
| **Cobertura ORCID** | `orcidData`, `_18` | Modifica el filtro `source.id:s6910135` y el subtítulo porcentual |
| **Acceso abierto** | `oaData`, `_20` | Modifica el filtro `source.id:s6910135` |
| **Procedencia de citas** | `citacionesInfo`, `_23` | Modifica el filtro de obras y `source.id === "https://openalex.org/s6910135"` |
| **Ley de Lotka** | `productividadAutores`, `chartLotka` | Hereda el cambio de `SOURCE_ID` desde `allWorks` |
| **H-index e i10-index** | `_26` | Hereda el cambio desde `sourceData` |
| **Autores: burbujas** | `authorData`, `chartAuthors` | Modifica el filtro `source.id:s6910135` |
| **Países: burbujas** | `countryData`, `chartCountries` | Modifica el filtro `source.id:s6910135` |
| **Instituciones: burbujas** | `data`, `chartInstitutions` | Modifica el filtro `source.id:s6910135` |

---

## Nombres únicos de celdas

Cada gráfico debe tener un nombre único dentro del cuaderno de Observable.

Ejemplos recomendados:

```javascript
chartInstitutions
```

```javascript
chartCountries
```

```javascript
chartAuthors
```

```javascript
chartODS
```

```javascript
chartLotka
```

```javascript
chartCitationsCountries
```

```javascript
chartEditorialEndogamy
```

No repitas nombres como `chart`, `data`, `table` o `svg` en distintas celdas del mismo cuaderno.

Si dos celdas usan el mismo nombre, Observable mostrará un error similar a este:

```text
RuntimeError: chart is defined more than once
```

---

## Insertar visualizaciones en OJS

Las visualizaciones creadas en Observable pueden incorporarse en OJS mediante `iframe` o como gráficos estáticos.

### Requisitos previos

Antes de insertar una visualización en OJS, debes contar con:

1. Un cuaderno publicado en [Observable](https://observablehq.com/).
2. Consultas funcionales a la API de OpenAlex.
3. Celdas de visualización con nombres únicos.
4. Acceso al panel editorial o administrativo de OJS.
5. Permisos para insertar HTML o utilizar el editor de código fuente en OJS.

### Método recomendado: iframe de Observable

Esta opción es recomendable para gráficos interactivos con tooltips, filtros, selectores o consultas actualizables desde OpenAlex.

#### Pasos

1. Abre el cuaderno de Observable.
2. Modifica o actualiza las celdas necesarias.
3. Comprueba que los gráficos se visualicen correctamente.
4. Selecciona la opción **Exportar** o **Export**.
5. Selecciona **Embed cell** o **Embeber celda**.
6. Elige la celda del gráfico que deseas publicar.
7. Copia el código `<iframe>` que genera Observable.
8. Ingresa a OJS y abre la página donde deseas mostrar el gráfico.
9. Activa el editor de código fuente HTML.
10. Pega el código `<iframe>`.
11. Guarda los cambios.
12. Revisa la página pública de la revista.

Según la configuración de OJS, el editor HTML puede aparecer como:

- `<>`
- **Source**
- **Código fuente**
- **HTML**
- **Editar HTML**

### Ejemplo: gráfico de ODS

```html
<iframe
  src="https://observablehq.com/embed/TU-USUARIO/TU-CUADERNO@VERSION?cells=chartODS"
  width="100%"
  height="760"
  frameborder="0"
  style="border: none; background: white;">
</iframe>
```

Este ejemplo muestra la distribución de artículos de una revista por Objetivos de Desarrollo Sostenible, según la clasificación temática de OpenAlex.

### Ejemplo: panel bibliométrico completo

Puedes insertar varios gráficos en una página de OJS para construir un panel bibliométrico.

```html
<h2>Indicadores bibliométricos de la revista</h2>

<h3>Contribuciones por institución</h3>

<iframe
  src="https://observablehq.com/embed/TU-USUARIO/TU-CUADERNO@VERSION?cells=chartInstitutions"
  width="100%"
  height="850"
  frameborder="0"
  style="border: none;">
</iframe>

<h3>Procedencia geográfica de las contribuciones</h3>

<iframe
  src="https://observablehq.com/embed/TU-USUARIO/TU-CUADERNO@VERSION?cells=chartCountries"
  width="100%"
  height="850"
  frameborder="0"
  style="border: none;">
</iframe>

<h3>Artículos por Objetivo de Desarrollo Sostenible</h3>

<iframe
  src="https://observablehq.com/embed/TU-USUARIO/TU-CUADERNO@VERSION?cells=chartODS"
  width="100%"
  height="760"
  frameborder="0"
  style="border: none;">
</iframe>

<h3>Productividad de autores: Ley de Lotka</h3>

<iframe
  src="https://observablehq.com/embed/TU-USUARIO/TU-CUADERNO@VERSION?cells=chartLotka"
  width="100%"
  height="650"
  frameborder="0"
  style="border: none;">
</iframe>

<h3>Procedencia de las citas</h3>

<iframe
  src="https://observablehq.com/embed/TU-USUARIO/TU-CUADERNO@VERSION?cells=chartCitationsCountries"
  width="100%"
  height="600"
  frameborder="0"
  style="border: none;">
</iframe>
```

Sustituye estos valores por los correspondientes a tu proyecto:

```text
TU-USUARIO
TU-CUADERNO
VERSION
chartInstitutions
chartCountries
chartODS
chartLotka
chartCitationsCountries
```

### Ubicaciones recomendadas en OJS

Puedes insertar el panel en una página independiente o dentro de secciones ya existentes:

- **Acerca de la revista**
- **Estadísticas**
- **Indicadores bibliométricos**
- **Panel de datos**
- **Transparencia editorial**
- **Impacto de la revista**
- **Información para autores**
- Páginas editoriales personalizadas
- Bloques laterales, si el tema de OJS lo permite

Ejemplo de estructura de navegación:

```text
Inicio
└── Acerca de
    └── Indicadores bibliométricos
        ├── Producción institucional
        ├── Procedencia geográfica
        ├── Autores y productividad
        ├── Citas recibidas
        ├── Objetivos de Desarrollo Sostenible
        └── Diversidad o concentración institucional
```

---

## Publicar gráficos estáticos

También puedes exportar gráficos como imágenes estáticas. Esta opción es apropiada cuando no necesitas interacción o deseas preservar una versión específica de los resultados.

Los formatos recomendados son:

| Formato | Uso recomendado |
|---|---|
| PNG | Sitios web, presentaciones, noticias y uso general |
| SVG | Impresión, alta resolución y edición vectorial |

### Cuándo usar gráficos estáticos

Utiliza PNG o SVG cuando:

- No se requiere interacción.
- Deseas conservar una versión fija de un indicador.
- El gráfico se utilizará en informes anuales.
- La visualización aparecerá en una noticia, página o artículo.
- Deseas reducir la dependencia de servicios externos.
- Necesitas una figura para presentaciones o documentos PDF.
- La revista necesita preservar una versión específica de los resultados.

### Insertar una imagen en OJS

Después de descargar el gráfico como PNG o SVG:

1. Ingresa a OJS.
2. Abre la **Biblioteca editorial** o el gestor de archivos.
3. Carga el archivo descargado.
4. Selecciona el archivo desde el editor o copia su URL.
5. Inserta la imagen en la página, bloque o sección correspondiente.

Ejemplo de inserción mediante HTML:

```html
<img
  src="URL-DEL-ARCHIVO-CARGADO-EN-OJS"
  alt="Artículos de la revista por Objetivo de Desarrollo Sostenible"
  style="width: 100%; max-width: 1000px; height: auto;">
```

Modifica siempre el texto de `alt` para describir correctamente el contenido del gráfico. Esto mejora la accesibilidad para personas que usan lectores de pantalla.

---

## Comparación de métodos

| Característica | iframe de Observable | PNG o SVG |
|---|---|---|
| Interactividad | Sí | No |
| Tooltips | Sí | No |
| Filtros y selectores | Sí | No |
| Actualización desde OpenAlex | Sí, al recargar la visualización | No; requiere cargar una imagen nueva |
| Uso en informes | Menos recomendable | Recomendable |
| Calidad de impresión | Variable | SVG ofrece excelente calidad |
| Dependencia de Observable | Sí | No, después de descargar |
| Inserción en OJS | Mediante HTML | Mediante biblioteca editorial o HTML |

---

## Recomendaciones de uso

Utiliza un `iframe` cuando quieras publicar visualizaciones explorables y actualizadas, por ejemplo:

- Instituciones que contribuyen a la revista.
- Autores más productivos.
- Países de procedencia de autorías.
- Países de instituciones citantes.
- Artículos clasificados por ODS.
- Indicadores de concentración institucional.
- Distribución de productividad según la Ley de Lotka.
- Evolución temporal de publicaciones y citas.

Utiliza PNG o SVG cuando quieras mantener una versión estática, por ejemplo:

- Informes anuales.
- Informes de gestión editorial.
- Memorias institucionales.
- Presentaciones.
- Material promocional.
- Figuras para documentos PDF.
- Contenido que deba preservarse sin modificaciones.

---

## Actualización de datos

Las visualizaciones incorporadas mediante `iframe` pueden conectarse a OpenAlex en tiempo real.

Esto significa que, al recargar la página de OJS, el cuaderno puede volver a ejecutar las consultas y mostrar resultados actualizados.

Ten en cuenta las siguientes recomendaciones:

- OpenAlex puede aplicar límites temporales de solicitudes.
- Evita realizar demasiadas consultas simultáneamente.
- Utiliza `api_key` y `mailto` en las consultas a OpenAlex.
- Implementa almacenamiento en caché cuando el cuaderno tenga muchas visualizaciones.
- Mantén nombres únicos para cada celda de Observable.
- Comprueba periódicamente que los gráficos funcionen correctamente.
- No expongas claves privadas en repositorios públicos.
- Documenta la fecha de actualización si publicas gráficos PNG o SVG.

Ejemplo de parámetros recomendados:

```javascript
url.searchParams.set("api_key", config.API_KEY);
url.searchParams.set("mailto", config.EMAIL);
```

---

## Resultado esperado

Al combinar consultas de OpenAlex, visualizaciones interactivas y gráficos estáticos, es posible construir un panel bibliométrico para revistas científicas gestionadas con OJS.

El panel puede incluir información sobre:

- Producción editorial.
- Participación institucional.
- Diversidad geográfica.
- Concentración de contribuciones.
- Patrones de productividad autoral.
- Citas e impacto.
- Clasificación temática.
- Contribuciones vinculadas con los ODS.
- Posibles indicadores de endogamia editorial.
- Calidad y cobertura de metadatos, como DOI y ORCID.
- Acceso abierto.

De esta forma, OJS puede complementar su función editorial con un espacio público de transparencia, análisis bibliométrico y visualización de datos de la revista.

---

## Licencia

Este proyecto se distribuye bajo la licencia [MIT](LICENSE).

Puedes usarlo, copiarlo, modificarlo y adaptarlo para cualquier revista indexada en OpenAlex, siempre que mantengas el aviso de licencia y cites las fuentes de datos correspondientes.

```text
MIT License

Copyright (c) 2026

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files, to deal in the Software
without restriction, including the rights to use, copy, modify, merge,
publish, distribute, sublicense, and sell copies of the Software.
```

---

## Fuentes y créditos

- [OpenAlex](https://openalex.org/) para los metadatos bibliográficos y las métricas de publicaciones.
- [Observable](https://observablehq.com/) para la construcción y publicación de visualizaciones interactivas.
- [Observable Plot](https://observablehq.com/plot/) y [D3.js](https://d3js.org/) para gráficos y visualización de datos.
- [Open Journal Systems](https://pkp.sfu.ca/ojs/) como plataforma editorial para revistas científicas.
- [Autor](https://orcid.org/0009-0005-6780-1106) Correo: kahernandezg@uca.edu.sv
