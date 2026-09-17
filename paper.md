# Notebook Coding: Reproducible Observable Notebooks for Bibliometric Analysis and Teaching in OJS Journals with OpenAlex

## (1) Overview

### Title
Notebook Coding: Reproducible Observable Notebooks for Bibliometric Analysis and Teaching in OJS Journals with OpenAlex

### Authors
**Hernández Gutiérrez, Kevin Amílcar**  
ORCID: [https://orcid.org/0009-0005-6780-1106](https://orcid.org/0009-0005-6780-1106)

### Author Roles and Affiliations
Conceptualization, Software, Writing – original draft; Universidad Centroamericana “José Simeón Cañas” (UCA), El Salvador.

### Abstract
*Notebook Coding* is an open and reproducible collection of Observable notebooks designed to compute and visualize nineteen bibliometric indicators—including annual output, citations received, UN Sustainable Development Goals (SDGs) coverage, DOI and ORCID coverage, Open Access status, journal self-citation rate, author productivity according to Lotka's Law, h-index, and i10-index—for academic journals indexed in OpenAlex and managed with Open Journal Systems (OJS). Operating across three distinct levels, it functions as: (1) a client-side software architecture querying the OpenAlex REST API via a rate-limited concurrency queue; (2) an embeddable, live bibliometric dashboard for OJS editorial management using responsive `<iframe>` elements; and (3) a forkable pedagogical tool for hands-on bibliometric training in library and information science (LIS) programs. By shifting from offline data processing to client-side web rendering, it offers editors, librarians, and students an open, inspectable alternative without requiring commercial database subscriptions.

### Keywords
Bibliometrics; Open source; OpenAlex; Observable notebooks; Open Journal Systems (OJS); JavaScript

---

### Introduction
Editorial teams of journals hosted on OJS [1] in Latin America and the Caribbean rarely have institutional access to Scopus, Scimago Journal Rank, or Web of Science [2]. This limits their capacity to evaluate and analyze their own production, disproportionately affecting open-access journals not indexed in commercial databases. The native OJS statistics module [1] reports COUNTER-compliant page views and downloads [3] for a specific installation, but these data do not always guarantee historical continuity and do not cover bibliometric indicators such as citation counts or author productivity measures. Consequently, this study proposes using OpenAlex, an emerging bibliographic database that has gained significant traction in recent years. The data source landscape for bibliometric analysis has undergone a remarkable transformation with the emergence of open alternatives to traditional databases. Macêdo, Schiessl, and Shintaku [4] emphasize this phenomenon in their analysis of OpenAlex for bibliometric studies, concluding that the platform constitutes a viable and effective alternative capable of complementing traditional metric sources, particularly for comparative analyses of publications and citations [4].

Editors, librarians, and library and information science (LIS) students seeking to learn applied bibliometrics are often trained on proprietary interfaces or desktop software that require local installation, expensive subscriptions, or intensive data processing training. These tools can be inaccessible to small journals, resource-constrained institutions, or training programs requiring reproducible and inspectable examples.

Currently, no single tool integrates real-time querying, open APIs, and native embedding into an editorial CMS such as OJS or EPrints. Instead, the ecosystem remains fragmented, with tools covering only one or two of these requirements, such as VOSviewer, Bibliometrix/Biblioshiny, and Publish or Perish [5]–[8]. Although these tools are well consolidated in bibliometric practice, their ease of use can also foster the generation of visually appealing results without a sufficient understanding of underlying methodological foundations. As Repiso Caballero and Cabezas Clavijo [9] warn, the user-friendliness of certain software can lead to flashy outputs without an adequate grasp of the bibliometric procedures employed.

### Table 1: Feature Comparison of Notebook Observable with Alternative Software Tools
| Feature | Notebook Observable | VOSviewer | Bibliometrix | Biblioshiny | Jupyter Notebook |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **Open bibliographic data** | Yes | Partial | Depends | Depends | Yes |
| **OpenAlex API integration** | Yes | Partial | Yes | Yes | Yes |
| **Browser-based** | Yes | No | No | Yes | Yes |
| **No local installation** | Yes | No | No | Yes | No |
| **Direct OJS embedding** | Yes | No | No | No | No |
| **Literate programming** | Yes | No | Partial | Partial | Yes |
| **Executable / interactive cells** | Yes | No | No | Partial | Yes |
| **Educational orientation** | Yes | No | No | Partial | Yes |
| **Reusable / forkable code** | Yes | No | Yes | Yes | Yes |
| **Reproducible execution** | Yes | Partial | Yes | Partial | Yes |
| **Bibliometric visualization** | Yes | Yes | Yes | Yes | Yes |
| **Network analysis** | Partial | Yes | Yes | Yes | Yes |
| **Embeddable as a web component** | Yes | No | No | No | Partial |
| **Programming knowledge required** | Low–Medium | Low | Medium–High | Low | Medium–High |

In this context, Notebook Coding does not aim to replace existing tools, but rather to serve as an alternative oriented toward strengthening the methodological rigor and reproducibility of bibliometric analyses. This aligns with the warnings of Repiso Caballero and Cabezas Clavijo [9], who point to the proliferation of bibliometric studies that do not always achieve necessary methodological complexity. Among the key factors to consider, these authors highlight the choice of "data analysis and visualization software" [9], as this selection dictates the feasible analytical depth and scope.

Notebook Coding bridges part of this gap by operating across three interconnected dimensions: as a modular software architecture composed of independent reactive cells that query the OpenAlex REST API [11], literate programming [12], and interactive visualization in Observable [13]; as a live, embeddable bibliometric dashboard natively integrated into OJS [1] via responsive `<iframe>` components; and as a modular pedagogical tool for the applied teaching of bibliometrics. Rather than relying on commercial databases or desktop software, each cell represents an autonomous indicator structured by data dependencies. In this way, an editorial team can publish a complete dashboard on OJS, while a class or workshop can isolate a single indicator as a standalone exercise without requiring students to grasp the entire workflow from the outset.

---

### Implementation and Architecture
Notebook Coding is structured as a set of independent cells within Observable notebooks [13], each corresponding to a single bibliometric indicator and connected to the OpenAlex REST API [11]. Three request patterns are employed depending on indicator requirements:
1. A rate-limited concurrency queue with exponential backoff for standard API requests;
2. Cursor-based pagination for indicators requiring article-level granular details; and
3. Server-side aggregation using `group_by` for frequency-only metrics.

Native OJS usage statistics [1] (page views and downloads), which fall outside OpenAlex bibliographic coverage, are visualized separately using Datawrapper [14] based on exported OJS data. Each OpenAlex-based indicator can be embedded into a live OJS instance as a responsive `<iframe>` pointing to a published Observable cell [13] or exported as a static PNG/SVG image.

![Figure 1: Logical flow of a bibliometric indicator cell: request pattern -> rate-limited queue -> OpenAlex API -> computation -> visualization -> output](figures/figure1_architecture.png)

#### Rate-Limited Access and Fault Tolerance
Requests to OpenAlex are managed through a bounded concurrency queue utilizing a semaphore capped at three concurrent requests (`maxConcurrent = 3`). Pending requests are held in a FIFO queue, ensuring that total concurrent requests never exceed the threshold even when multiple indicators request data simultaneously.

Every request includes the `mailto` parameter, identifying the party responsible for API usage and granting access to OpenAlex's polite pool. Access credentials (`mailto` and `api_key`) are managed via environment variables or secrets rather than hardcoded in public scripts.

When OpenAlex returns an HTTP 429 response, the request retries up to six times. Wait time is calculated as:

$$t_{wait,k} = \begin{cases} 1000 \cdot r & \text{if the response contains a Retry-After header } r \\ 600 \cdot 2^k + u, & u \sim U(0,300) \text{ ms otherwise} \end{cases}$$

where $k \in \{0, 1, \dots, 5\}$ represents the retry attempt, $r$ is the wait time in seconds specified by `Retry-After`, and $u \sim U(0,300)$ is a uniform random jitter term in milliseconds that prevents retry synchronization.

#### Exhaustive Corpus Retrieval
Indicators requiring complete article-level detail (author productivity, top-cited works, citation provenance) traverse the journal's entire corpus using OpenAlex cursor pagination, starting at `cursor = "*"` with `per_page = 200` items per call, continuing while `meta.next_cursor` exists. A journal with $N$ works is retrieved in $\lceil N/200 \rceil$ requests:

$$Q = \left\lceil \frac{N}{p} \right\rceil$$

Current OpenAlex documentation specifies `per_page = 100` as the maximum for general list queries, whereas grouped queries (`group_by`) return up to 200 groups per page [11, 15]. Authors are advised to verify the actual `meta.per_page` returned by the API before assuming $Q = \lceil N/p \rceil$ holds exactly with $p=200$.

![Figure 2: Annual Output and Citations Received for REDC (Source: OpenAlex)](figures/figure2_annual_output.png)

![Figure 3: Top 10 Most Cited Articles in REDC (OpenAlex)](figures/figure3_top_cited.png)

![Figure 4: REDC Article Classification by UN Sustainable Development Goals (SDGs)](figures/figure4_sdg.png)

#### Server-Side Aggregation
Indicators requiring only frequency counts leverage OpenAlex's `group_by` parameter: SDG coverage, DOI coverage [22], ORCID coverage [23], Open Access status, author concentration, geographic distribution, and institutional concentration. For a coverage indicator, the proportion is calculated as:

$$p = \frac{n_{count}}{n_{total}}, \quad p \in [0, 1], \quad p\% = 100 \cdot p$$

If $n_{total} = 0$, the indicator returns *not available* rather than zero to avoid confounding missing metadata with absence of the phenomenon.

![Figure 5: Metadata Coverage Indicators (DOI & ORCID); Open Access Status Distribution in REDC](figures/figure5_coverage_oa.png)

#### Author Productivity and Lotka's Law
Authors are identified via persistent OpenAlex identifiers. The observed distribution is:

$$A_{obs}(n) = |\{ a : works(a) = n \}|$$

The theoretical benchmark follows Lotka's Law [16]:

$$A_{Lotka}(n) = \frac{A_1}{n^2}, \quad n \ge 1$$

where $A_1$ is the observed count of authors with exactly one publication. In this project, $A_1$ is not estimated by regression and the exponent 2 is not fitted to empirical data; the chart serves as a pedagogical benchmark.

![Figure 6: Author Productivity vs. Lotka's Law Benchmark (Log-Log Scale)](figures/figure6_lotka.png)

#### Self-Citation Rate
The notebook selects the journal's top 50 cited works and retrieves all citing items (`filter=cites:OPENALEX_WORK_ID`). The self-citation rate is defined as:

$$SC = \frac{n_{self}}{n_{self} + n_{ext}} \times 100$$

This metric evaluates self-citation within the top-50 cited cohort rather than across the entire journal historical corpus.

![Figure 7: Geographic Citation Provenance (Top 50 Cited Cohort)](figures/figure7_citation_provenance.png)

#### Precomputed Indices
The h-index, i10-index, and 2-year mean citation count are retrieved directly from the source `summary_stats` field in OpenAlex:

$$h = \max \{ k \in \mathbb{N} : |\{ w : c_w \ge k \}| \ge k \}, \quad i10 = |\{ w : c_w \ge 10 \}|$$

$$C_2 = \frac{\sum_{w \in W_2} c_w}{|W_2|}$$

#### Quality Control
Notebook Coding was validated through a production case study deployment on *Revista Española de Documentación Científica* (REDC) [17], alongside technical integration guidelines for OJS [1].

![Figure 8: Bibliometric Indicators Overview Dashboard](figures/figure8_indicators.png)

---

## (2) Availability

* **Operating system:** None. Notebooks run entirely within modern web browsers (Chrome 120+, Firefox 120+, Edge 120+, Safari 17+) via Observable [13].
* **Programming language:** JavaScript (ES2020+), running in the reactive environment of Observable 2.0 [13].
* **Additional system requirements:** Active internet connection to query the OpenAlex REST API [11].
* **Dependencies:** OpenAlex REST API (`https://help.openalex.org/api/`); Observable runtime [13]; Datawrapper [14] (optional for native OJS stats); Open Journal Systems (OJS) [1].

### Table 2: Cell Documentation - Notebook Coding
| Data cell | Endpoint / Key parameter | Base filter | Calculation | Chart cell(s) that use(s) it |
| :--- | :--- | :--- | :--- | :--- |
| **sourceData** | GET /sources/{id} | — | Complete source record (`summary_stats`, `counts_by_year`) | `serieAnual` (indirect) & `_26` (h-index/i10 cards) |
| **serieAnual** | (derived from `sourceData`) | — | Annual output and citations, `year >= 2016` | `_7` (Annual output) & `_8` (Citations by year) |
| **allWorks** | GET /works + cursor | `primary_location.source.id:{id}` | Full paginated corpus | Feeds `topCitados`, `obrasCitadasTop`, `productividadAutores` |
| **topCitados** | (derived from `allWorks`) | — | Top 10 by `cited_by_count` | `_11` (Top 10 most cited articles) |
| **sdgData** | GET /works?group_by=sustainable_development_goals.id | `primary_location.source.id:{id}` | Article count per SDG | `chartODS` (D3 heatmap across 17 SDGs) |
| **doiData** | GET /works?group_by=has_doi | `primary_location.source.id:{id}` | % with/without DOI | `_16` (DOI coverage) |
| **orcidData** | GET /works?group_by=has_orcid | `primary_location.source.id:{id}` | % with/without ORCID | `_18` (ORCID coverage) |
| **oaData** | GET /works?group_by=open_access.oa_status | `primary_location.source.id:{id}` | Gold/green/hybrid/bronze/closed status | `_20` (Open Access status) |
| **obrasCitadasTop** | (derived from `allWorks`) | — | Top 50 by citations | Feeds `citacionesInfo` |
| **citacionesInfo** | GET /works?filter=cites:{workId} ×50 | `cites:{id}` | Self-citation + citing institution country | `_23` (Citation provenance) & `_26` (Self-citation card) |
| **productividadAutores** | (derived from `allWorks`) | — | Author counts by publication volume | `chartLotka` (Lotka log-log plot) |
| **authorData** | GET /works?group_by=authorships.author.id | `primary_location.source.id:{id}` | Top authors by publication volume | `chartAuthors` (D3 bubble pack) |
| **countryData** | GET /works?group_by=authorships.countries | `primary_location.source.id:{id}` | Geographic affiliation distribution | `chartCountries` (D3 bubble pack) |
| **data (institutions)** | GET /works?group_by=authorships.institutions.lineage | `primary_location.source.id:{id}` | Institutional concentration | `chartInstitutions` (D3 bubble pack) |

### Software Location
* **Public Repository:** Figshare
* **Persistent Identifier:** [https://doi.org/10.6084/m9.figshare.33107114](https://doi.org/10.6084/m9.figshare.33107114) [18]
* **License:** MIT License
* **Publisher:** figshare
* **Version Published:** 1.0.0
* **Code Repository:** GitHub - `Notebook-coding-bibliometric` [19]
* **Repository URL:** [https://github.com/Kahernandezg/Notebook-coding-bibliometric](https://github.com/Kahernandezg/Notebook-coding-bibliometric)
* **Code Notebook:** Observable Notebook [24]
* **Notebook URL:** [https://old.observablehq.com/@kahernandezg/notebook-coding-cuadernos-de-indicadores-biblometr](https://old.observablehq.com/@kahernandezg/notebook-coding-cuadernos-de-indicadores-biblometr)
* **Language:** English (documentation, code, and UI).

---

## (3) Reuse Potential

Reusing the dashboard for another journal requires updating the core configuration object:

```javascript
const config = {
  SOURCE_ID: "s6910135",
  JOURNAL_SHORT_NAME: "REDC",
  JOURNAL_NAME: "Revista Española de Documentación Científica",
  EMAIL: "contact@institution.edu",
  API_KEY: "YOUR_API_KEY"
};
```

Because OpenAlex undergoes continuous updates, reproducibility requires recording execution parameters: `source_id`, `query_date`, `filter`, `mailto`, `api_version`, and `code_version`.

### Limitations
1. OpenAlex coverage varies based on metadata recognition across sources.
2. Author disambiguation may contain occasional duplicates or omissions.
3. The self-citation rate evaluates the top-50 cited works rather than the entire historical corpus.
4. The Lotka's Law chart applies a fixed theoretical exponent ($2$) without regression fitting.
5. Summary indices (h-index, i10-index, 2-year mean citation) are extracted directly from OpenAlex `summary_stats`.
6. Results may change over time as OpenAlex updates its index, so two executions on different dates may not match exactly.
7. OJS usage statistics and OpenAlex bibliometric indicators measure different phenomena and should not be interpreted as equivalent.

---

### Conclusion
#### What is the difference between the Jupyter notebooks from OpenAlex Tutorials and the notebooks from Observable?
While community notebooks and tutorials provided by OpenAlex [25] demonstrate basic data retrieval and API pagination in environments like Jupyter [26], these examples are fundamentally oriented toward offline data processing and developer training. They do not address the challenge of public visualization, web interactivity, or integration with editorial management platforms. Notebook Coding bridges this gap by shifting the focus from data extraction to a client-side publication layer. By leveraging Observable’s reactive JavaScript runtime, each indicator functions as an autonomous, live-querying component that can be seamlessly embedded into Open Journal Systems (OJS) via responsive iframes without intermediate server infrastructure or advanced programming knowledge on the part of editorial teams.

Just as Electronic Laboratory Notebooks (Schubotz et al. [20]) demonstrated the value of interactive environments for data traceability, and computational training workflows (Troupin et al. [21]) highlighted their utility for teaching complex domain-specific analysis, *Notebook Coding* shows that reactive notebooks can shift from private analytical tools into a primary medium for scientific communication. By embedding live OpenAlex queries into OJS, this approach automates real-time editorial transparency while providing an open, forkable framework that streamlines hands-on bibliometric education and ensures computational reproducibility across research workflows.

### Acknowledgements
We thank the OpenAlex, Observable, Datawrapper, and Open Journal Systems communities.

### Funding Statement
Not applicable.

### Competing Interests
The author declares no competing interests.

---

## References

[1] Public Knowledge Project. Open Journal Systems (OJS). Vancouver, BC: PKP; 2026. Available from: https://pkp.sfu.ca/software/ojs/  
[2] Willinsky J. Open Journal Systems: An example of open source software for journal management and publishing. *Library Hi Tech*. 2005; 23(4):504–519. DOI: https://doi.org/10.1108/07378830510636300  
[3] COUNTER. Introduction to COUNTER Reports: Release 5.1. 2024. Available from: https://www.countermetrics.org/wp-content/uploads/2024/04/SPANISH-Reports-guide.pdf  
[4] Macêdo DJ, Schiessl IT, Shintaku M. El uso de OpenAlex en los estudios de métricas bibliométricas. *Biblios: Journal of Librarianship and Information Science*. 2025; (esp):e015. DOI: https://doi.org/10.5195/biblios.2025.1268  
[5] van Eck NJ, Waltman L. Software survey: VOSviewer, a computer program for bibliometric mapping. *Scientometrics*. 2010; 84(2):523–538. DOI: https://doi.org/10.1007/s11192-009-0146-3  
[6] Aria M, Cuccurullo C. bibliometrix: An R-tool for comprehensive science mapping analysis. *Journal of Informetrics*. 2017; 11(4):959–975. DOI: https://doi.org/10.1016/j.joi.2017.08.007  
[7] Aria M, Cuccurullo C, D’Aniello L, Spano M. Biblioshiny and the SAAS Workflow: An integrated framework for transparent and reproducible science mapping. *Journal of Informetrics*. 2026. DOI: https://doi.org/10.1016/j.joi.2026.101837  
[8] Harzing AW. Publish or Perish. 2007. Available from: https://harzing.com/resources/publish-or-perish  
[9] Repiso Caballero R, Cabezas Clavijo Á. Contra la bibliometría ‘rápida y sucia’: aspectos para valorar la complejidad en los análisis bibliométricos. *Revista Panamericana de Comunicación*. 2025; 7(1). DOI: https://doi.org/10.21555/RPC.V7I1.3419  
[10] Priem J, Piwowar H, Orr R. OpenAlex: A fully-open index of scholarly works, authors, venues, institutions, and concepts. *arXiv preprint arXiv:2205.01833*. 2022. DOI: https://doi.org/10.48550/arXiv.2205.01833  
[11] OpenAlex. API reference. 2026. Available from: https://help.openalex.org/api/  
[12] Knuth DE. Literate programming. *The Computer Journal*. 1984; 27(2):97–111. DOI: https://doi.org/10.1093/comjnl/27.2.97  
[13] Observable, Inc. Observable Framework. 2026. Available from: https://observablehq.github.io/framework/  
[14] Datawrapper GmbH. Datawrapper. 2024. Available from: https://www.datawrapper.de  
[15] OpenAlex. Get groups of entities. 2026. Available from: https://docs.openalex.org/how-to-use-the-api/get-groups-of-entities  
[16] Lotka AJ. The frequency distribution of scientific productivity. *Journal of the Washington Academy of Sciences*. 1926; 16(12):317–323.  
[17] Consejo Superior de Investigaciones Científicas. Revista Española de Documentación Científica. Madrid: CSIC; 1977–presente. Available from: https://redc.revistas.csic.es/  
[18] Hernández Gutiérrez KA. Notebook Coding. figshare; 2026. DOI: https://doi.org/10.6084/m9.figshare.33107114  
[19] Hernández Gutiérrez KA. Notebook Coding [GitHub repository]. 2026. Available from: https://github.com/Kahernandezg/Notebook-coding-bibliometric  
[20] Schubotz S, Schubotz M, Auernhammer GK. Electronic Laboratory Notebook: An Adaptable Solution. *Journal of Open Research Software*. 2025; 13(1):11. DOI: https://doi.org/10.5334/jors.391  
[21] Troupin G et al. DIVAnd training: producing ocean climatologies with Jupyter notebooks. *Journal of Open Source Education*. 2026; 9(99):278. DOI: https://doi.org/10.21105/jose.00278  
[22] DOI Foundation. DOI Handbook. Available from: https://www.doi.org/doi-handbook/html/  
[23] ORCID. ORCID e identificadores persistentes. Available from: https://info.orcid.org/es/documentation/integration-guide/orcid-and-persistent-identifiers/  
[24] Hernández Gutiérrez KA. Notebook Coding: cuadernos de indicadores bibliométricos para revistas en OJS-OpenAlex. Observable; 2026. Available from: https://old.observablehq.com/@kahernandezg/notebook-coding-cuadernos-de-indicadores-biblometr  
[25] OurResearch. OpenAlex API tutorials: turn the page [Internet]. GitHub; [2026]. Available from: https://github.com/ourresearch/openalex-api-tutorials/blob/main/notebooks/getting-started/paging.ipynb  
[26] OurResearch. Paging: OpenAlex API tutorials [Internet]. GitHub; [2026]. Available from: https://github.com/ourresearch/openalex-api-tutorials/blob/main/notebooks/getting-started/paging.ipynb
