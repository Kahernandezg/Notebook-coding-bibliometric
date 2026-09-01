# NOTEBOOK CODING: BIBLIOMETRIC INDICATOR NOTEBOOKS FOR JOURNALS IN OJS–OPENALEX

[https://observablehq.com/d/cff3d60368bf6eee@372](https://observablehq.com/d/cff3d60368bf6eee@372)

View this notebook in your browser by running a web server in this folder. For example:

~~~sh
npx http-server
~~~

Alternatively, use the [Observable Runtime](https://github.com/observablehq/runtime) to import this module directly into your application. To install it with npm:

~~~sh
npm install @observablehq/runtime@5
npm install https://api.observablehq.com/d/cff3d60368bf6eee@372.tgz?v=3
~~~

Then import the notebook and runtime as follows:

~~~js
import {Runtime, Inspector} from "@observablehq/runtime";
import define from "cff3d60368bf6eee";
~~~

To log the value of a cell named `foo`:

~~~js
const runtime = new Runtime();
const main = runtime.module(define);
main.value("foo").then(value => console.log(value));
~~~

# Bibliometric Indicator Notebooks for OJS + OpenAlex

An interactive notebook for extracting bibliometric metrics from **OpenAlex** and generating reusable, embeddable visualizations for scholarly journals managed with **Open Journal Systems (OJS)**.

The project includes bibliometric indicators, interactive charts, and resources for publishing journal data dashboards directly in OJS.

> **Important:** Do not publish real API keys on GitHub, public Observable notebooks, or shared repositories. Use environment variables, configuration files excluded through `.gitignore`, or deployment secrets.

---

## Contents

- [Features](#features)
- [Quick reuse](#quick-reuse)
- [Repository structure](#repository-structure)
- [Configuration for another journal](#configuration-for-another-journal)
- [Chart guide](#chart-guide)
- [Unique cell names](#unique-cell-names)
- [Embedding visualizations in OJS](#embedding-visualizations-in-ojs)
- [Publishing static charts](#publishing-static-charts)
- [Data updates](#data-updates)
- [License](#license)
- [Sources and credits](#sources-and-credits)

---

## Features

The notebook includes indicators that are ready to be adapted and published:

1. Annual article output.
2. Citations received.
3. Most-cited articles.
4. Classification by Sustainable Development Goals (SDGs).
5. DOI coverage.
6. ORCID coverage.
7. Open-access coverage.
8. Geographic origin of citations.
9. Author productivity according to Lotka’s Law.
10. Author map.
11. Country map.
12. Institution map.

It can also be used to develop additional indicators, such as:

- Institutional concentration.
- Geographic diversity.
- International participation.
- Potential editorial endogamy indicators.
- Authorship distribution.
- Citation trends by year.
- Institutional collaboration.
- Availability of bibliographic metadata.

---

## Quick reuse

To adapt the notebook for another journal, change the following three parameters in the `config.js` file:

| Parameter | Description | Where to obtain it |
|---|---|---|
| `SOURCE_ID` | The journal identifier in OpenAlex | Search for the journal in [OpenAlex Sources](https://openalex.org/sources/) and copy its identifier, for example: `s6910135` |
| `EMAIL` | Contact email used to identify requests sent to OpenAlex | Use an institutional email address or a project contact email |
| `API_KEY` | OpenAlex API access key | Obtain it from your OpenAlex user dashboard |

Example configuration file:

```javascript
const config = {
  SOURCE_ID: "s6910135",
  EMAIL: "email@institution.edu",
  API_KEY: "YOUR_API_KEY"
};
```

> Do not upload `config.js` containing a real API key to a public repository. You can create a `config.example.js` file with placeholder values and exclude `config.js` through `.gitignore`.

Example `config.example.js`:

```javascript
const config = {
  SOURCE_ID: "s6910135",
  EMAIL: "email@institution.edu",
  API_KEY: "YOUR_API_KEY"
};
```

Example `.gitignore`:

```gitignore
config.js
.env
.env.local
```

---

## Repository structure

```text
.
├── index.html              # Observable Runtime entry point
├── runtime.js              # Observable execution engine
├── inspector.css           # Base visualization styles
├── notebook.js             # Cell logic and OpenAlex queries
├── config.js               # Local configuration: SOURCE_ID, EMAIL, and API_KEY
├── config.example.js       # Configuration template without real credentials
└── ojs-embed/              # HTML snippets for embedding charts in OJS
```

---

## Configuration for another journal

To reuse this project with another journal indexed in OpenAlex, review and replace the required identifiers, titles, and credentials.

### 1. Data source

In the cells or functions that query OpenAlex, replace:

```javascript
s6910135
```

with your variable value:

```javascript
config.SOURCE_ID
```

The queries that usually require this change include:

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

Example:

```javascript
url.searchParams.set(
  "filter",
  `primary_location.source.id:${config.SOURCE_ID}`
);
```

### 2. Self-citations and citation origin

In the `citacionesInfo` logic, replace direct comparisons such as:

```javascript
source.id === "https://openalex.org/s6910135"
```

with a comparison based on the configuration variable:

```javascript
source.id === `https://openalex.org/${config.SOURCE_ID}`
```

### 3. Titles and subtitles

Replace journal-specific references, for example:

```text
REDC
Revista Española de Documentación Científica
```

with the short and full name of the journal being analyzed.

You can define these values in `config.js`:

```javascript
const config = {
  SOURCE_ID: "s6910135",
  JOURNAL_SHORT_NAME: "REDC",
  JOURNAL_NAME: "Revista Española de Documentación Científica",
  EMAIL: "email@institution.edu",
  API_KEY: "YOUR_API_KEY"
};
```

### 4. OpenAlex credentials

Update the email address and API key:

```javascript
url.searchParams.set("api_key", config.API_KEY);
url.searchParams.set("mailto", config.EMAIL);
```

---

## Chart guide

| Chart | Main variables or functions | What to edit |
|---|---|---|
| **Annual output** | `sourceData`, `serieAnual`, `_7`, `_8` | Replace `s6910135` with `config.SOURCE_ID` and update journal titles |
| **Top 10 most cited** | `allWorks`, `topCitados`, `_11` | Modify the `source.id:s6910135` filter |
| **SDGs** | `sdgData`, `chartODS` | Modify the `source.id:s6910135` filter; SDG colors may remain unchanged |
| **DOI coverage** | `doiData`, `_16` | Modify the `source.id:s6910135` filter and the percentage subtitle |
| **ORCID coverage** | `orcidData`, `_18` | Modify the `source.id:s6910135` filter and the percentage subtitle |
| **Open access** | `oaData`, `_20` | Modify the `source.id:s6910135` filter |
| **Citation origin** | `citacionesInfo`, `_23` | Modify the works filter and `source.id === "https://openalex.org/s6910135"` |
| **Lotka’s Law** | `productividadAutores`, `chartLotka` | Inherits the `SOURCE_ID` change from `allWorks` |
| **H-index and i10-index** | `_26` | Inherits the change from `sourceData` |
| **Authors: bubble chart** | `authorData`, `chartAuthors` | Modify the `source.id:s6910135` filter |
| **Countries: bubble chart** | `countryData`, `chartCountries` | Modify the `source.id:s6910135` filter |
| **Institutions: bubble chart** | `data`, `chartInstitutions` | Modify the `source.id:s6910135` filter |

---

## Unique cell names

Each chart must have a unique name within the Observable notebook.

Recommended examples:

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

Do not reuse names such as `chart`, `data`, `table`, or `svg` in different cells of the same notebook.

If two cells use the same name, Observable will display an error similar to:

```text
RuntimeError: chart is defined more than once
```

---

## Embedding visualizations in OJS

Visualizations created in Observable can be incorporated into OJS using an `iframe` or as static charts.

### Prerequisites

Before embedding a visualization in OJS, make sure you have:

1. A published notebook on [Observable](https://observablehq.com/).
2. Functional queries to the OpenAlex API.
3. Visualization cells with unique names.
4. Access to the OJS editorial or administrative dashboard.
5. Permission to insert HTML or access the source-code editor in OJS.

### Recommended method: Observable iframe

This option is recommended for interactive charts with tooltips, filters, selectors, or queries that can be updated from OpenAlex.

### Steps

1. Open the Observable notebook.
2. Modify or update the required cells.
3. Verify that the charts display correctly.
4. Select **Export**.
5. Select **Embed cell**.
6. Choose the chart cell you want to publish.
7. Copy the `<iframe>` code generated by Observable.
8. Sign in to OJS and open the page where you want to display the chart.
9. Enable the HTML source-code editor.
10. Paste the `<iframe>` code.
11. Save the changes.
12. Review the public journal page.

Depending on the OJS configuration, the HTML editor may appear as:

- `<>`
- **Source**
- **Source code**
- **HTML**
- **Edit HTML**

### Example: SDG chart

```html
<iframe
  src="https://observablehq.com/embed/YOUR-USERNAME/YOUR-NOTEBOOK@VERSION?cells=chartODS"
  width="100%"
  height="760"
  frameborder="0"
  style="border: none; background: white;">
</iframe>
```

This example displays the distribution of a journal’s articles by Sustainable Development Goal, according to OpenAlex’s thematic classification.

### Example: full bibliometric dashboard

You can embed multiple charts on an OJS page to build a bibliometric dashboard.

```html
<h2>Journal bibliometric indicators</h2>

<h3>Contributions by institution</h3>

<iframe
  src="https://observablehq.com/embed/YOUR-USERNAME/YOUR-NOTEBOOK@VERSION?cells=chartInstitutions"
  width="100%"
  height="850"
  frameborder="0"
  style="border: none;">
</iframe>

<h3>Geographic origin of contributions</h3>

<iframe
  src="https://observablehq.com/embed/YOUR-USERNAME/YOUR-NOTEBOOK@VERSION?cells=chartCountries"
  width="100%"
  height="850"
  frameborder="0"
  style="border: none;">
</iframe>

<h3>Articles by Sustainable Development Goal</h3>

<iframe
  src="https://observablehq.com/embed/YOUR-USERNAME/YOUR-NOTEBOOK@VERSION?cells=chartODS"
  width="100%"
  height="760"
  frameborder="0"
  style="border: none;">
</iframe>

<h3>Author productivity: Lotka’s Law</h3>

<iframe
  src="https://observablehq.com/embed/YOUR-USERNAME/YOUR-NOTEBOOK@VERSION?cells=chartLotka"
  width="100%"
  height="650"
  frameborder="0"
  style="border: none;">
</iframe>

<h3>Geographic origin of citations</h3>

<iframe
  src="https://observablehq.com/embed/YOUR-USERNAME/YOUR-NOTEBOOK@VERSION?cells=chartCitationsCountries"
  width="100%"
  height="600"
  frameborder="0"
  style="border: none;">
</iframe>
```

Replace the following values with those corresponding to your project:

```text
YOUR-USERNAME
YOUR-NOTEBOOK
VERSION
chartInstitutions
chartCountries
chartODS
chartLotka
chartCitationsCountries
```

### Recommended locations in OJS

You can embed the dashboard on an independent page or within existing sections:

- **About the Journal**
- **Statistics**
- **Bibliometric Indicators**
- **Data Dashboard**
- **Editorial Transparency**
- **Journal Impact**
- **Information for Authors**
- Custom editorial pages
- Sidebar blocks, where supported by the OJS theme

Example navigation structure:

```text
Home
└── About
    └── Bibliometric Indicators
        ├── Institutional output
        ├── Geographic origin
        ├── Authors and productivity
        ├── Citations received
        ├── Sustainable Development Goals
        └── Institutional diversity or concentration
```

---

## Publishing static charts

You may also export charts as static images. This option is appropriate when interaction is not needed or when you need to preserve a specific version of the results.

Recommended formats:

| Format | Recommended use |
|---|---|
| PNG | Websites, presentations, news items, and general use |
| SVG | Printing, high-resolution output, and vector editing |

### When to use static charts

Use PNG or SVG when:

- Interaction is not required.
- You want to preserve a fixed version of an indicator.
- The chart will be used in annual reports.
- The visualization will appear in a news item, web page, or article.
- You want to reduce dependence on external services.
- You need a figure for presentations or PDF documents.
- The journal needs to preserve a specific version of the results.

### Embedding an image in OJS

After downloading the chart as PNG or SVG:

1. Sign in to OJS.
2. Open the **Editorial Library** or file manager.
3. Upload the downloaded file.
4. Select the file from the editor or copy its URL.
5. Insert the image into the relevant page, block, or section.

Example HTML:

```html
<img
  src="URL-OF-THE-FILE-UPLOADED-TO-OJS"
  alt="Journal articles by Sustainable Development Goal"
  style="width: 100%; max-width: 1000px; height: auto;">
```

Always modify the `alt` text so that it accurately describes the chart’s content. This improves accessibility for people who use screen readers.

---

## Method comparison

| Feature | Observable iframe | PNG or SVG |
|---|---|---|
| Interactivity | Yes | No |
| Tooltips | Yes | No |
| Filters and selectors | Yes | No |
| Updates from OpenAlex | Yes, when the visualization is reloaded | No; a new image must be uploaded |
| Use in reports | Less recommended | Recommended |
| Print quality | Variable | SVG provides excellent quality |
| Dependency on Observable | Yes | No, after download |
| OJS integration | Through HTML | Through the editorial library or HTML |

---

## Usage recommendations

Use an `iframe` when you want to publish interactive and updatable visualizations, for example:

- Institutions contributing to the journal.
- Most productive authors.
- Countries of author affiliations.
- Countries of citing institutions.
- Articles classified by SDG.
- Institutional concentration indicators.
- Productivity distribution according to Lotka’s Law.
- Publication and citation trends over time.

Use PNG or SVG when you need to retain a static version, for example:

- Annual reports.
- Editorial management reports.
- Institutional reports.
- Presentations.
- Promotional materials.
- Figures for PDF documents.
- Content that must be preserved without future changes.

---

## Data updates

Visualizations embedded through an `iframe` can connect to OpenAlex in real time.

This means that when an OJS page is reloaded, the notebook can run the queries again and display updated results.

Keep the following recommendations in mind:

- OpenAlex may apply temporary request limits.
- Avoid making too many simultaneous requests.
- Use `api_key` and `mailto` in OpenAlex queries.
- Implement caching when the notebook includes many visualizations.
- Keep unique names for every Observable cell.
- Periodically verify that charts continue to work correctly.
- Do not expose private keys in public repositories.
- Document the update date when publishing PNG or SVG charts.

Recommended parameters:

```javascript
url.searchParams.set("api_key", config.API_KEY);
url.searchParams.set("mailto", config.EMAIL);
```

---

## Expected outcome

By combining OpenAlex queries, interactive visualizations, and static charts, it is possible to build a bibliometric dashboard for scholarly journals managed with OJS.

The dashboard may include information on:

- Editorial output.
- Institutional participation.
- Geographic diversity.
- Contribution concentration.
- Author productivity patterns.
- Citations and impact.
- Thematic classification.
- Contributions associated with the SDGs.
- Potential editorial endogamy indicators.
- Metadata quality and coverage, including DOI and ORCID.
- Open access.

In this way, OJS can complement its editorial function with a public space for transparency, bibliometric analysis, and journal data visualization.

---

## License

This project is distributed under the [MIT License](LICENSE).

You may use, copy, modify, and adapt it for any journal indexed in OpenAlex, provided that you retain the license notice and cite the relevant data sources.

```text
MIT License

Copyright (c) 2026

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files, to deal in the Software
without restriction, including the rights to use, copy, modify, merge,
publish, distribute, sublicense, and sell copies of the Software.
```

---

## Sources and credits

- [OpenAlex](https://openalex.org/) for bibliographic metadata and publication metrics.
- [Observable](https://observablehq.com/) for building and publishing interactive visualizations.
- [Observable Plot](https://observablehq.com/plot/) and [D3.js](https://d3js.org/) for charts and data visualization.
- [Open Journal Systems](https://pkp.sfu.ca/ojs/) as the journal publishing platform.
- [Author](https://orcid.org/0009-0005-6780-1106) — Email: [kahernandezg@uca.edu.sv](mailto:kahernandezg@uca.edu.sv)