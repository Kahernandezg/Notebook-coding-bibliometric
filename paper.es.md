# Notebook Coding: cuadernos reproducibles de Observable para la enseñanza y el análisis bibliométrico de revistas OJS con OpenAlex

## (1) Resumen / Overview

### Título
Notebook Coding: cuadernos reproducibles de Observable para la enseñanza y el análisis bibliométrico de revistas OJS con OpenAlex

### Autores
**Hernández Gutiérrez, Kevin Amílcar**  
ORCID: [https://orcid.org/0009-0005-6780-1106](https://orcid.org/0009-0005-6780-1106)

### Roles y afiliaciones de los autores
Conceptualización, desarrollo de software y redacción (borrador original); Universidad Centroamericana “José Simeón Cañas” (UCA), El Salvador.

### Resumen
*Notebook Coding* es una colección de cuadernos abiertos y reproducibles de Observable que calculan y visualizan diecinueve indicadores bibliométricos, entre ellos la producción anual y las citas recibidas, la cobertura de los Objetivos de Desarrollo Sostenible (ODS) de las Naciones Unidas, la cobertura de DOI y ORCID, el estado de acceso abierto, la tasa de autocitación, la productividad de autores según la Ley de Lotka, el índice h y el índice i10 para revistas académicas indexadas en OpenAlex y gestionadas con Open Journal Systems (OJS). Cada cuaderno consulta directamente la API REST de OpenAlex, por lo que los resultados reflejan el índice en vivo en lugar de una exportación estática. Los indicadores pueden incrustarse en una instalación de OJS como un iframe responsivo o exportarse como imágenes estáticas, lo que ofrece a editores, bibliotecarios y estudiantes sin acceso institucional a Scopus, el Scimago Journal Rank o Web of Science una alternativa reproducible y bifurcable (*forkable*) para la formación aplicada en bibliometría.

### Palabras clave
Bibliometría; código abierto; OpenAlex; cuadernos de Observable; Open Journal Systems (OJS); JavaScript

---

### Introducción
Los equipos editoriales de revistas alojadas en OJS [20] en América Latina y el Caribe rara vez cuentan con acceso institucional a Scopus, el Scimago Journal Rank o Web of Science [11]. Esto limita su capacidad para evaluar y analizar su propia producción, y afecta de manera desproporcionada a las revistas de acceso abierto que no están indexadas en bases de datos comerciales. El propio módulo de estadísticas de OJS [20] reporta vistas de página y descargas conformes con COUNTER [1] para una instalación específica, pero estos datos no siempre garantizan continuidad histórica, y no cubren indicadores bibliométricos como el conteo de citas o las medidas de productividad. Por ello, este estudio propone utilizar OpenAlex, una base de datos bibliográfica emergente que se ha posicionado considerablemente en los últimos años. El panorama de las fuentes de datos para el análisis bibliométrico ha experimentado una transformación notable con la aparición de alternativas abiertas a las bases tradicionales. Macêdo, Schiessl y Shintaku [19] destacan precisamente este fenómeno en su análisis sobre el uso de OpenAlex en los estudios de métricas bibliométricas, donde concluyen que la plataforma constituye una alternativa viable y eficaz que puede complementar las fuentes métricas tradicionales, especialmente para el análisis comparativo de publicaciones y citas [19].

Editores, bibliotecarios y estudiantes de bibliotecología y ciencias de la información que quieren aprender bibliometría aplicada suelen formarse con interfaces propietarias o software que requiere instalación local, o en algunos casos suscripciones costosas o capacitación intensiva para el procesamiento de los datos. Estas herramientas pueden ser inaccesibles para revistas pequeñas, instituciones con recursos limitados o programas de formación que necesitan ejemplos reproducibles e inspeccionables.

En la actualidad no existe una sola herramienta que integre a su vez tiempo real, APIs abiertas e integración nativa en un CMS editorial como OJS o EPrints. Lo que sí existe es un ecosistema fragmentado, con herramientas que cubren una o dos de esas condiciones, como VOSviewer, Bibliometrix/Biblioshiny y Publish or Perish [16]–[19]. Aunque estas herramientas se encuentran ampliamente consolidadas en la práctica bibliométrica, su facilidad de uso también puede favorecer la generación de resultados aparentemente rigurosos sin una comprensión suficiente de los fundamentos metodológicos. Como advierten Repiso Caballero y Cabezas Clavijo [14], la facilidad de uso de determinadas herramientas puede contribuir a producir resultados vistosos sin que necesariamente exista una adecuada comprensión de los procedimientos bibliométricos empleados.

En este contexto, Notebook Coding no pretende reemplazar las herramientas ya existentes, sino incorporarse como una alternativa orientada a fortalecer el rigor y la reproducibilidad metodológica de los análisis bibliométricos. Este argumento resulta pertinente con las advertencias que mencionan Repiso Caballero y Cabezas Clavijo [14], quienes señalan la proliferación de trabajos bibliométricos que no siempre alcanzan la complejidad metodológica necesaria. Entre los factores que estos autores proponen considerar se encuentra la elección de los “programas de análisis y visualización de datos” [14]. La elección de estos programas determina los tipos de análisis posibles y el nivel de profundidad y complejidad de los estudios.

Notebook Coding cierra parte de esta brecha combinando datos bibliográficos abiertos de OpenAlex [10], consultas directas a la API REST [9], programación literaria [5] y visualización interactiva en Observable [7] en un único conjunto de celdas e indicadores bifurcables. En lugar de depender exclusivamente de bases de datos de citas comerciales o de software instalado externamente, cada celda del cuaderno consulta directamente la API REST de OpenAlex [9]; las celdas se vuelven a ejecutar cada vez que se carga la visualización, de modo que el panel refleja el estado del índice de OpenAlex disponible en el momento de la consulta, en lugar de una exportación estática generada previamente. Debido a que cada celda representa uno o más indicadores combinados, tiene un nombre descriptivo y está organizada según sus dependencias de datos, una clase o taller puede usar un solo indicador como ejercicio autónomo sin requerir que los estudiantes comprendan todo el flujo de trabajo desde el principio.

---

### Implementación y arquitectura
Notebook Coding está organizado como un conjunto de celdas independientes en cuadernos de Observable [7], cada una correspondiente a un único indicador bibliométrico y conectada a la API REST de OpenAlex [9]. Se utilizan tres patrones de solicitud, según lo que necesite cada indicador: 
1. Una cola con reintentos y concurrencia acotada para las solicitudes ordinarias a la API;
2. Paginación basada en cursor para los indicadores que requieren el detalle de cada obra; y
3. Agregación del lado del servidor mediante `group_by` para los indicadores que solo necesitan conteos de frecuencia.

Las estadísticas de uso nativas de OJS [20] (vistas de página y descargas), que quedan fuera de la cobertura bibliográfica de OpenAlex, se visualizan por separado usando Datawrapper [2], a partir de datos exportados del propio módulo de estadísticas de OJS. Cada indicador basado en OpenAlex puede incrustarse en una instalación de OJS en vivo como un `<iframe>` responsivo que apunta a una celda publicada de Observable [7], o exportarse como una imagen estática PNG o SVG.

#### Acceso con límite de tasa y tolerancia a fallos
Las solicitudes a OpenAlex se gestionan mediante una cola de concurrencia acotada que utiliza un semáforo con un máximo de tres solicitudes simultáneas (`maxConcurrent = 3`). Las solicitudes pendientes se mantienen en una cola FIFO (primero en entrar, primero en salir), de modo que, incluso cuando varios indicadores solicitan datos al mismo tiempo, el número de solicitudes simultáneas nunca supera el límite configurado.

Cada solicitud incluye el parámetro `mailto`, que identifica a la parte responsable del uso de la API y otorga acceso al *polite pool* (grupo prioritario) de OpenAlex. Las credenciales de acceso (`mailto` y `api_key`), cuando se utilizan, deben almacenarse como secretos o variables de entorno en lugar de incluirse como texto plano en el código publicado.

Cuando OpenAlex devuelve una respuesta HTTP 429, la solicitud se reintenta hasta seis veces. El tiempo de espera se define como:

$$t_{wait,k} = \begin{cases} 1000 \cdot r & \text{si la respuesta contiene un encabezado Retry-After } r \\ 600 \cdot 2^k + u, & u \sim U(0,300) \text{ ms en otro caso} \end{cases}$$

donde $k \in \{0, 1, \dots, 5\}$ es el número de intento de reintento, $r$ es el valor en segundos indicado por `Retry-After`, y $u \sim U(0,300)$ es un término aleatorio uniforme en milisegundos que evita la colisión simultánea de peticiones (*jitter*).

#### Recuperación exhaustiva del corpus
Los indicadores que necesitan el detalle de cada artículo (productividad de autores, las obras más citadas, procedencia de las citas) recorren todo el corpus de la revista mediante la paginación por cursor de OpenAlex, comenzando en `cursor = "*"`, solicitando `per_page = 200` obras por llamada, y continuando mientras `meta.next_cursor` esté presente. Una revista con $N$ obras se recupera en $\lceil N/200 \rceil$ solicitudes. En general, el número aproximado de solicitudes es:

$$Q = \left\lceil \frac{N}{p} \right\rceil$$

La documentación de OpenAlex indica que `per_page = 100` es el máximo admitido para las consultas generales de listado, mientras que las consultas agrupadas (`group_by`) devuelven hasta 200 grupos por página [7, 8]. Se recomienda verificar el valor real devuelto por la API antes de asumir que $Q = \lceil N/p \rceil$ se cumple exactamente con $p=200$.

#### Agregación del lado del servidor
Los indicadores que solo necesitan conteos de frecuencia se calculan utilizando el parámetro `group_by` de OpenAlex: cobertura de los ODS, cobertura de DOI, cobertura de ORCID, estado de acceso abierto, concentración de autores, distribución por país y concentración institucional. Para un indicador de cobertura, la proporción se define como:

$$p = \frac{n_{count}}{n_{total}}, \quad p \in [0, 1], \quad p\% = 100 \cdot p$$

Si $n_{total} = 0$, el indicador se devuelve como *no disponible* en lugar de cero, para evitar confundir la ausencia de datos con la ausencia del fenómeno.

#### Productividad de autores y la Ley of Lotka
Cada autor se identifica mediante su identificador persistente de OpenAlex. La distribución observada es:

$$A_{obs}(n) = |\{ a : works(a) = n \}|$$

La referencia teórica se basa en la Ley de Lotka [6]:

$$A_{Lotka}(n) = \frac{A_1}{n^2}, \quad n \ge 1$$

donde $A_1$ es el número observado de autores con exactamente una publicación. En este proyecto, $A_1$ no se estima por regresión y el exponente 2 no se ajusta a los datos; el gráfico es una comparación pedagógica orientativa.

#### Tasa de autocitación
El cuaderno selecciona las 50 obras más citadas de la revista y recupera todas las obras que las citan (`filter=cites:OPENALEX_WORK_ID`). La tasa se define como:

$$SC = \frac{n_{self}}{n_{self} + n_{ext}} \times 100$$

Esta cifra se calcula sobre el subconjunto de las 50 obras más citadas, no sobre la totalidad del corpus.

#### Índices precalculados
El índice h, el índice i10 y la citación media a dos años se leen directamente del campo `summary_stats` de la fuente en OpenAlex:

$$h = \max \{ k \in \mathbb{N} : |\{ w : c_w \ge k \}| \ge k \}, \quad i10 = |\{ w : c_w \ge 10 \}|$$

$$C_2 = \frac{\sum_{w \in W_2} c_w}{|W_2|}$$

#### Control de calidad
Notebook Coding se ha validado mediante un caso de estudio real aplicado a la *Revista Española de Documentación Científica* (REDC) [21], junto con una guía técnica para incrustar el panel en OJS [20].

---

## (2) Disponibilidad / Availability

* **Sistema operativo:** Ninguno. Los cuadernos se ejecutan completamente dentro de un navegador web moderno (Chrome, Firefox, Edge, Safari) a través de Observable [7].
* **Lenguaje de programación:** JavaScript (ES2020+), ejecutado en el entorno reactivo de Observable 2.0 [7].
* **Requisitos adicionales del sistema:** Conexión activa a internet para consultar la API de OpenAlex [9].
* **Dependencias:** API REST de OpenAlex (`https://help.openalex.org/api/`); entorno de ejecución de Observable [7]; Datawrapper [2] (opcional para estadísticas OJS); Open Journal Systems (OJS) [20].

### Documentación de celdas
| Celda de datos | Endpoint / parámetro clave | Filtro base | Qué calcula | Celda(s) de gráfico que la consume |
| ------ | ------ | ------ | ------ | ------ |
| **sourceData** | GET /sources/{id} | — | Registro fuente completo (`summary_stats`, `counts_by_year`) | `serieAnual` (indirecta) y `_26` (tarjetas h-index/i10-index) |
| **serieAnual** | (derivada de `sourceData`) | — | Producción y citas por año, `year >= 2016` | `_7` (Producción anual) y `_8` (Citas por año) |
| **allWorks** | GET /works + cursor | `primary_location.source.id:{id}` | Corpus completo paginado | `topCitados`, `obrasCitadasTop`, `productividadAutores` |
| **topCitados** | (derivada de `allWorks`) | — | Top 10 por `cited_by_count` | `_11` (Top 10 artículos más citados) |
| **sdgData** | GET /works?group_by=sustainable_development_goals.id | `primary_location.source.id:{id}` | Conteo de artículos por ODS | `chartODS` (heatmap D3 con los 17 ODS) |
| **doiData** | GET /works?group_by=has_doi | `primary_location.source.id:{id}` | % con/sin DOI | `_16` (Cobertura de DOI) |
| **orcidData** | GET /works?group_by=has_orcid | `primary_location.source.id:{id}` | % con/sin ORCID | `_18` (Cobertura de ORCID) |
| **oaData** | GET /works?group_by=open_access.oa_status | `primary_location.source.id:{id}` | Distribución gold/green/hybrid/bronze/closed | `_20` (Estado de Acceso Abierto) |
| **obrasCitadasTop** | (derivada de `allWorks`) | — | Top 50 por citas | `citacionesInfo` |
| **citacionesInfo** | GET /works?filter=cites:{workId} ×50 | `cites:{id}` | Autocitación + país de la institución citante | `_23` (Procedencia de citas) y `_26` (Tarjeta autocitación) |
| **productividadAutores** | (derivada de `allWorks`) | — | Conteo de autores por Nº de artículos | `chartLotka` (Gráfico log-log de Lotka) |
| **authorData** | GET /works?group_by=authorships.author.id | `primary_location.source.id:{id}` | Top autores por Nº de publicaciones | `chartAuthors` (bubble pack D3) |
| **countryData** | GET /works?group_by=authorships.countries | `primary_location.source.id:{id}` | Distribución por país de afiliación | `chartCountries` (bubble pack D3) |
| **data (instituciones)** | GET /works?group_by=authorships.institutions.lineage | `primary_location.source.id:{id}` | Concentración institucional | `chartInstitutions` (bubble pack D3) |

### Ubicación del software
* **Depósito público:** Figshare
* **Identificador persistente:** [https://doi.org/10.6084/m9.figshare.33107114](https://doi.org/10.6084/m9.figshare.33107114) [4]
* **Licencia:** Licencia MIT
* **Versión publicada:** 1.0.0
* **Repositorio de código:** GitHub - `Notebook-coding-bibliometric` [3]
* **URL del repositorio:** [https://github.com/Kahernandezg/Notebook-coding-bibliometric](https://github.com/Kahernandezg/Notebook-coding-bibliometric)
* **Idioma:** Inglés (documentación, código e interfaz).

---

## (3) Potencial de reutilización / Reuse potential

Reutilizar el panel para otra revista requiere modificar el objeto de configuración base:

```javascript
const config = {
  SOURCE_ID: "s6910135",
  JOURNAL_SHORT_NAME: "REDC",
  JOURNAL_NAME: "Revista Española de Documentación Científica",
  EMAIL: "correo@institucion.edu",
  API_KEY: "TU_API_KEY"
};
```

Debido a que OpenAlex se actualiza continuamente, la reproducibilidad depende de documentar para cada ejecución: `source_id`, `query_date`, `filter`, `mailto`, `api_version` y `code_version`.

### Limitaciones
1. OpenAlex puede tener variaciones de cobertura según el reconocimiento de metadatos.
2. Los identificadores de autor pueden presentar duplicaciones.
3. La tasa de autocitación se calcula sobre las 50 obras más citadas.
4. El gráfico de la Ley de Lotka utiliza el exponente fijo 2 sin ajuste por regresión.
5. Los índices resumen (h-index, i10-index, citación media a 2 años) provienen directamente de `summary_stats`.

### Agradecimientos
A las comunidades de OpenAlex, Observable, Datawrapper y Open Journal Systems.

### Declaración de financiamiento
No aplica.

### Conflictos de interés
El autor declara no tener ningún conflicto de interés.

---

## Referencias

[1] COUNTER. Introducción a Informes COUNTER: Versión 5.1. 2024. Disponible en: https://www.countermetrics.org/wp-content/uploads/2024/04/SPANISH-Reports-guide.pdf  
[2] Datawrapper GmbH. Datawrapper. 2024. Disponible en: https://www.datawrapper.de  
[3] Hernández Gutiérrez KA. Notebook Coding [repositorio de GitHub]. 2026. Disponible en: https://github.com/Kahernandezg/Notebook-coding-bibliometric  
[4] Hernández Gutiérrez KA. Notebook Coding. figshare; 2026. DOI: https://doi.org/10.6084/m9.figshare.33107114  
[5] Knuth DE. Literate programming. *The Computer Journal*. 1984; 27(2):97–111. DOI: https://doi.org/10.1093/comjnl/27.2.97  
[6] Lotka AJ. The frequency distribution of scientific productivity. *Journal of the Washington Academy of Sciences*. 1926; 16(12):317–323.  
[7] Observable, Inc. Observable. 2024. Disponible en: https://observablehq.com  
[8] OpenAlex. Get groups of entities. 2026. Disponible en: https://docs.openalex.org/how-to-use-the-api/get-groups-of-entities  
[9] OpenAlex. API reference. 2026. Disponible en: https://help.openalex.org/api/  
[10] Priem J, Piwowar H, Orr R. OpenAlex: A fully-open index of scholarly works, authors, venues, institutions, and concepts. *arXiv preprint arXiv:2205.01833*. 2022. DOI: https://doi.org/10.48550/arXiv.2205.01833  
[11] Willinsky J. Open Journal Systems: An example of open source software for journal management and publishing. *Library Hi Tech*. 2005; 23(4):504–519. DOI: https://doi.org/10.1108/07378830510636300  
[12] Schubotz S, Schubotz M, Auernhammer GK. Electronic Laboratory Notebook: An Adaptable Solution. *Journal of Open Research Software*. 2025; 13(1):11. DOI: https://doi.org/10.5334/jors.391  
[13] Troupin G et al. DIVAnd training: producing ocean climatologies with Jupyter notebooks. *Journal of Open Source Education*. 2026; 9(99):278. DOI: https://doi.org/10.21105/jose.00278  
[14] Repiso Caballero R, Cabezas Clavijo Á. Contra la bibliometría ‘rápida y sucia’: aspectos para valorar la complejidad en los análisis bibliométricos. *Revista Panamericana de Comunicación*. 2025; 7(1). DOI: https://doi.org/10.21555/RPC.V7I1.3419  
[15] van Eck NJ, Waltman L. Software survey: VOSviewer, a computer program for bibliometric mapping. *Scientometrics*. 2010; 84(2):523–538. DOI: https://doi.org/10.1007/s11192-009-0146-3  
[16] Aria M, Cuccurullo C. bibliometrix: An R-tool for comprehensive science mapping analysis. *Journal of Informetrics*. 2017; 11(4):959–975. DOI: https://doi.org/10.1016/j.joi.2017.08.007  
[17] Aria M, Cuccurullo C, D’Aniello L, Spano M. Biblioshiny and the SAAS Workflow: An integrated framework for transparent and reproducible science mapping. *Journal of Informetrics*. 2026. DOI: https://doi.org/10.1016/j.joi.2026.101837  
[18] Harzing AW. Publish or Perish. 2007. Disponible en: https://harzing.com/resources/publish-or-perish  
[19] Macêdo DJ, Schiessl IT, Shintaku M. El uso de OpenAlex en los estudios de métricas bibliométricas. *Biblios: Journal of Librarianship and Information Science*. 2025; (esp):e015. DOI: https://doi.org/10.5195/biblios.2025.1268  
[20] Public Knowledge Project. Open Journal Systems (OJS). Vancouver, BC: PKP; 2026. Disponible en: https://pkp.sfu.ca/software/ojs/  
[21] Consejo Superior de Investigaciones Científicas. Revista Española de Documentación Científica. Madrid: CSIC; 1977–presente. Disponible en: https://redc.revistas.csic.es/  
[22] DOI Foundation. DOI Handbook. Disponible en: https://www.doi.org/doi-handbook/html/  
[23] ORCID. ORCID e identificadores persistentes. Disponible en: https://info.orcid.org/es/documentation/integration-guide/orcid-and-persistent-identifiers/
