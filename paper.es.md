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
*Notebook Coding* es un proyecto de software de ciencia abierta con una triple dimensión, estructurado como una colección modular de celdas reactivas en cuadernos de Observable diseñadas para calcular y visualizar diecinueve indicadores bibliométricos para revistas académicas en Open Journal Systems (OJS) mediante OpenAlex. El proyecto opera en tres niveles diferenciados: (1) como arquitectura de software cliente que consulta la API REST de OpenAlex mediante una cola de concurrencia acotada; (2) como un panel bibliométrico incrustable en vivo para la gestión editorial en OJS mediante `<iframe>` responsivos; y (3) como una herramienta pedagógica abierta y bifurcable (*forkable*) para la formación aplicada en bibliometría en ciencias de la información. Al pasar del procesamiento de datos offline al renderizado web en el cliente, ofrece a editores, bibliotecarios y estudiantes una alternativa transparente e inspeccionable sin depender de suscripciones comerciales.

### Palabras clave
Bibliometría; código abierto; OpenAlex; cuadernos de Observable; Open Journal Systems (OJS); JavaScript

---

### Introducción
Los equipos editoriales de revistas alojadas en OJS [1] en América Latina y el Caribe rara vez cuentan con acceso institucional a Scopus, el Scimago Journal Rank o Web of Science [2]. Esto limita su capacidad para evaluar y analizar su propia producción, y afecta de manera desproporcionada a las revistas de acceso abierto que no están indexadas en bases de datos comerciales. El propio módulo de estadísticas de OJS [1] reporta vistas de página y descargas conformes con COUNTER [3] para una instalación específica, pero estos datos no siempre garantizan continuidad histórica, y no cubren indicadores bibliométricos como el conteo de citas o las medidas de productividad. Por ello, este estudio propone utilizar OpenAlex, una base de datos bibliográfica emergente que se ha posicionado considerablemente en los últimos años [10]. El panorama de las fuentes de datos para el análisis bibliométrico ha experimentado una transformación notable con la aparición de alternativas abiertas a las bases tradicionales. Macêdo, Schiessl y Shintaku [4] destacan precisamente este fenómeno en su análisis sobre el uso de OpenAlex en los estudios de métricas bibliométricas, donde concluyen que la plataforma constituye una alternativa viable y eficaz que puede complementar las fuentes métricas tradicionales, especialmente para el análisis comparativo de publicaciones y citas [4].

Editores, bibliotecarios y estudiantes de bibliotecología y ciencias de la información que quieren aprender bibliometría aplicada suelen formarse con interfaces propietarias o software que requiere instalación local, o en algunos casos suscripciones costosas o capacitación intensiva para el procesamiento de los datos. Estas herramientas pueden ser inaccesibles para revistas pequeñas, instituciones con recursos limitados o programas de formación que necesitan ejemplos reproducibles e inspeccionables.

En la actualidad no existe una sola herramienta que integre a su vez tiempo real, APIs abiertas e integración nativa en un CMS editorial como OJS. Lo que sí existe es un ecosistema fragmentado, con herramientas que cubren una o dos de esas condiciones, como VOSviewer, Bibliometrix/Biblioshiny y Publish or Perish [5]–[8]. Aunque estas herramientas se encuentran ampliamente consolidadas en la práctica bibliométrica, su facilidad de uso también puede favorecer la generación de resultados aparentemente rigurosos sin una comprensión suficiente de los fundamentos metodológicos. Como advierten Repiso Caballero y Cabezas Clavijo [9], la facilidad de uso de determinadas herramientas puede contribuir a producir resultados vistosos sin que necesariamente exista una adecuada comprensión de los procedimientos bibliométricos empleados.

### Tabla 1: Comparación de características de Notebook Observable con otras herramientas de software
| Característica | Notebook Observable | VOSviewer | Bibliometrix | Biblioshiny | Jupyter Notebook |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **Datos bibliográficos abiertos** | Sí | Parcial | Depende | Depende | Sí |
| **Integración con API de OpenAlex** | Sí | Parcial | Sí | Sí | Sí |
| **Ejecución en navegador web** | Sí | No | No | Sí | Sí |
| **Sin instalación local** | Sí | No | No | Sí | No |
| **Incrustación directa en OJS** | Sí | No | No | No | No |
| **Programación literaria** | Sí | No | Parcial | Parcial | Sí |
| **Celdas ejecutables / interactivas** | Sí | No | No | Parcial | Sí |
| **Orientación educativa** | Sí | No | No | Parcial | Sí |
| **Código reutilizable / bifurcable** | Sí | No | Sí | Sí | Sí |
| **Ejecución reproducible** | Sí | Parcial | Sí | Parcial | Sí |
| **Visualización bibliométrica** | Sí | Sí | Sí | Sí | Sí |
| **Análisis de redes** | Parcial | Sí | Sí | Sí | Sí |
| **Incrustable como componente web** | Sí | No | No | No | Parcial |
| **Conocimiento de programación requerido** | Bajo–Medio | Bajo | Medio–Alto | Bajo | Medio–Alto |

En este contexto, Notebook Coding no pretende reemplazar las herramientas ya existentes, sino incorporarse como una alternativa orientada a fortalecer el rigor y la reproducibilidad metodológica de los análisis bibliométricos. Este argumento resulta pertinente con las advertencias que mencionan Repiso Caballero y Cabezas Clavijo [9], quienes señalan la proliferación de trabajos bibliométricos que no siempre alcanzan la complejidad metodológica necesaria. Entre los factores que estos autores proponen considerar se encuentra la elección de los “programas de análisis y visualización de datos” [9]. La elección de estos programas determina los tipos de análisis posibles y el nivel de profundidad y complejidad de los estudios.

Notebook Coding cierra parte de esta brecha al operar a través de tres dimensiones interconectadas: como una arquitectura de software modular de celdas reactivas independientes que consultan la API REST de OpenAlex [11], programación literaria [12] y visualización interactiva en Observable [13]; como un panel bibliométrico incrustable en vivo integrado nativamente en OJS [1] mediante componentes `<iframe>` responsivos; y como una herramienta pedagógica bifurcable para la enseñanza aplicada de la bibliometría. En lugar de depender de bases comerciales o software de escritorio que requiere instalación local, cada celda representa un indicador autónomo organizado según sus dependencias de datos. De este modo, un equipo editorial puede publicar un panel completo en OJS, mientras que un taller o clase de bibliometría puede aislar un solo indicador como ejercicio independiente sin exigir que los estudiantes comprendan todo el flujo de trabajo desde el principio.

---

### Implementación y arquitectura
Notebook Coding está organizado como un conjunto de celdas independientes en cuadernos de Observable [13], cada una correspondiente a un único indicador bibliométrico y conectada a la API REST de OpenAlex [11]. Se utilizan tres patrones de solicitud, según lo que necesite cada indicador: 
1. Una cola con reintentos y concurrencia acotada para las solicitudes ordinarias a la API;
2. Paginación basada en cursor para los indicadores [23] que requieren el detalle de cada obra; y
3. Agregación del lado del servidor mediante `group_by` para los indicadores que solo necesitan conteos de frecuencia.

Las estadísticas de uso nativas de OJS [1] (vistas de página y descargas), que quedan fuera de la cobertura bibliográfica de OpenAlex, se visualizan por separado usando Datawrapper [14], a partir de datos exportados del propio módulo de estadísticas de OJS. Cada indicador basado en OpenAlex puede incrustarse en una instalación de OJS en vivo como un `<iframe>` responsivo que apunta a una celda publicada de Observable [13], o exportarse como una imagen estática PNG o SVG.

![Figura 1: Flujo lógico de una celda de indicador: patrón de solicitud -> cola con límite de tasa -> API de OpenAlex -> cómputo -> visualización -> salida](figures/figure1_architecture.png)

#### Acceso con límite de tasa y tolerancia a fallos
Las solicitudes a OpenAlex se gestionan mediante una cola de concurrencia acotada que utiliza un semáforo con un máximo de tres solicitudes simultáneas (`maxConcurrent = 3`). Las solicitudes pendientes se mantienen en una cola FIFO (primero en entrar, primero en salir), de modo que, incluso cuando varios indicadores solicitan datos al mismo tiempo, el número de solicitudes simultáneas nunca supera el límite configurado.

Cada solicitud incluye el parámetro `mailto`, que identifica a la parte responsable del uso de la API y otorga acceso al *polite pool* (grupo prioritario) de OpenAlex [15]. Las credenciales de acceso (`mailto` y `api_key`), cuando se utilizan, deben almacenarse como secretos o variables de entorno en lugar de incluirse como texto plano en el código publicado.

Cuando OpenAlex devuelve una respuesta HTTP 429, la solicitud se reintenta hasta seis veces. El tiempo de espera se define como:

$$t_{wait,k} = \begin{cases} 1000 \cdot r & \text{si la respuesta contiene un encabezado Retry-After } r \\ 600 \cdot 2^k + u, & u \sim U(0,300) \text{ ms en otro caso} \end{cases}$$

donde $k \in \{0, 1, \dots, 5\}$ es el número de intento de reintento, $r$ es el valor en segundos indicado por `Retry-After`, y $u \sim U(0,300)$ es un término aleatorio uniforme en milisegundos que evita la colisión simultánea de peticiones (*jitter*).

#### Recuperación exhaustiva del corpus
Los indicadores que necesitan el detalle de cada artículo (productividad de autores, las obras más citadas, procedencia de las citas) recorren todo el corpus de la revista mediante la paginación por cursor de OpenAlex [23], comenzando en `cursor = "*"`, solicitando `per_page = 200` obras por llamada, y continuando mientras `meta.next_cursor` esté presente. Una revista con $N$ obras se recupera en $\lceil N/200 \rceil$ solicitudes, cada una enrutada a través de la misma cola y lógica de reintento descrita anteriormente. En general, si una consulta recupera $N$ obras usando un tamaño de página $p$, el número aproximado de solicitudes es:

$$Q = \left\lceil \frac{N}{p} \right\rceil$$

La documentación actual de OpenAlex sobre “Page through Results” [23] indica que `per_page = 100` es el máximo admitido para las consultas generales de listado, mientras que las consultas agrupadas (`group_by`) devuelven hasta 200 grupos por página [7, 8]. Las celdas de recuperación exhaustiva del corpus en este proyecto solicitan `per_page = 200`, un valor superior al límite general documentado actualmente para el listado de obras; se recomienda verificar el valor real de `meta.per_page` devuelto por la API antes de asumir que $Q = \lceil N/p \rceil$ se cumple exactamente con $p=200$.

![Figura 2: Producción anual y citas recibidas por REDC (Fuente: OpenAlex)](figures/figure2_annual_output.png)

![Figura 3: Los 10 artículos más citados en REDC (OpenAlex)](figures/figure3_top_cited.png)

![Figura 4: Clasificación de los artículos del REDC según los Objetivos de Desarrollo Sostenible (ODS) de la ONU](figures/figure4_sdg.png)

#### Agregación del lado del servidor
Los indicadores que solo necesitan conteos de frecuencia se calculan utilizando el parámetro `group_by` de OpenAlex: cobertura de los ODS, cobertura de DOI [22], cobertura de ORCID [23], estado de acceso abierto, concentración de autores, distribución por país y concentración institucional. OpenAlex devuelve los grupos con sus respectivos conteos, que el cuaderno reorganiza en estructuras adecuadas para la visualización. Para un indicador de cobertura, la proporción se define como:

$$p = \frac{n_{count}}{n_{total}}, \quad p \in [0, 1], \quad p\% = 100 \cdot p$$

Si $n_{total} = 0$, el indicador se devuelve como *no disponible* en lugar de cero, para evitar confundir la ausencia de datos con la ausencia del fenómeno en sí.

![Figura 5: Indicadores de cobertura de metadatos (DOI y ORCID); distribución del estado de acceso abierto en REDC](figures/figure5_coverage_oa.png)

#### Productividad de autores y la Ley de Lotka
Cada autor se identifica mediante su identificador persistente de OpenAlex, y el cuaderno cuenta el número de obras de la revista en las que participa. Sea $n$ el número de obras publicadas por un autor; la distribución observada es:

$$A_{obs}(n) = |\{ a : works(a) = n \}|$$

La referencia teórica se basa en la Ley de Lotka [16]:

$$A_{Lotka}(n) = \frac{A_1}{n^2}, \quad n \ge 1$$

donde $A_1$ es el número observado de autores con exactamente una publicación en la revista. En este proyecto, $A_1$ no se estima por regresión, y el exponente 2 no se ajusta a los datos; el gráfico es una comparación pedagógica entre la distribución observada $A_{obs}(n)$ y la predicción de referencia $A_{Lotka}(n)$, no una prueba de que los datos de la revista sigan una distribución de Lotka [16].

![Figura 6: Productividad de los autores frente al punto de referencia de la ley de Lotka (escala log-log)](figures/figure6_lotka.png)

#### Tasa de citación
Para estimar la citación, el cuaderno selecciona las 50 obras más citadas de la revista y, para cada una, recupera todas las obras que la citan, mediante una consulta equivalente a:

`filter=cites:OPENALEX_WORK_ID`

Una obra citante se clasifica como autocitación de la revista si su propio identificador de fuente principal coincide con el identificador de la revista analizada. Sea $n_{self}$ el número de citas provenientes de la misma revista, y $n_{ext}$ el número provenientes de otras revistas o fuentes:

$$SC = \frac{n_{self}}{n_{self} + n_{ext}} \times 100$$

Si el denominador es cero, la tasa se reporta como no disponible. Esta es una tasa calculada sobre el subconjunto de las 50 obras más citadas de la revista, no sobre todo su corpus; el indicador debe interpretarse como una estimación de la citación entre las obras de mayor impacto de la revista, no como una cifra representativa de todo el corpus.

![Figura 7: Procedencia geográfica de las citas (grupo de los 50 más citados)](figures/figure7_citation_provenance.png)

#### Índices precalculados
El índice h, el índice i10 y la citación media a dos años se leen directamente del campo `summary_stats` del registro de la fuente en OpenAlex; el cuaderno no los recalcula a partir de los conteos de citas por obra. Formalmente:

$$h = \max \{ k \in \mathbb{N} : |\{ w : c_w \ge k \}| \ge k \}, \quad i10 = |\{ w : c_w \ge 10 \}|$$

$$C_2 = \frac{\sum_{w \in W_2} c_w}{|W_2|}$$

#### Control de calidad
Notebook Coding se ha validado principalmente mediante un despliegue de caso de estudio en una revista en producción, la *Revista Española de Documentación Científica* (REDC) [17], junto con una guía técnica para incrustar el panel en una instalación de OJS [19]. La cola de solicitudes con límite de tasa y reintentos descrita anteriormente también ofrece una primera línea de defensa contra fallos transitorios de la API, de modo que las respuestas parciales o mal formadas no corrompan silenciosamente la salida de un indicador; los indicadores de cobertura se marcan explícitamente como “no disponible” en lugar de cero cuando OpenAlex no devuelve datos para un filtro determinado, lo que ayuda a evidenciar problemas de calidad de datos en lugar de ocultarlos.

![Figura 8: Panel general de indicadores bibliométricos](figures/figure8_indicators.png)

---

## (2) Disponibilidad / Availability

* **Sistema operativo:** Ninguno. Los cuadernos se ejecutan completamente dentro de un navegador web moderno (Chrome 120+, Firefox 120+, Edge 120+, Safari 17+) a través del Framework Observable [13].
* **Lenguaje de programación:** JavaScript (ES2020+), ejecutado dentro del entorno de ejecución reactivo de Observable 2.0 [13].
* **Requisitos adicionales del sistema:** Conexión activa a internet para consultar la API REST de OpenAlex [11] y, cuando se utilicen, para cargar las incrustaciones de Datawrapper [14].
* **Dependencias:** API REST de OpenAlex (`https://help.openalex.org/api/`); entorno de ejecución de Observable Framework [13]; Datawrapper [14] (opcional para estadísticas OJS); una instalación de Open Journal Systems (OJS) [1].

### Tabla 2: Documentación de celdas - Notebook Coding
| Celda de datos | Endpoint / Parámetro clave | Filtro base | Qué calcula | Celda(s) de gráfico que la consume |
| :--- | :--- | :--- | :--- | :--- |
| **sourceData** | GET /sources/{id} | — | Registro fuente completo (`summary_stats`, `counts_by_year`) | `serieAnual` (indirecta) y `_26` (tarjetas h-index/i10-index/citación media) |
| **serieAnual** | (derivada de `sourceData`) | — | Producción y citas por año, `year >= 2016` | `_7` (Plot: producción anual) y `_8` (Plot: citas por año) |
| **allWorks** | GET /works + cursor | `primary_location.source.id:{id}` | Corpus completo paginado | Alimenta a `topCitados`, `obrasCitadasTop` y `productividadAutores` |
| **topCitados** | (derivada de `allWorks`) | — | Top 10 por `cited_by_count` | `_11` (Plot: top 10 artículos más citados) |
| **sdgData** | GET /works?group_by=sustainable_development_goals.id | `primary_location.source.id:{id}` | Conteo de artículos por ODS | `chartODS` (heatmap D3 con los 17 ODS) |
| **doiData** | GET /works?group_by=has_doi | `primary_location.source.id:{id}` | % con/sin DOI | `_16` (Plot: cobertura de DOI) |
| **orcidData** | GET /works?group_by=has_orcid | `primary_location.source.id:{id}` | % con/sin ORCID | `_18` (Plot: cobertura de ORCID) |
| **oaData** | GET /works?group_by=open_access.oa_status | `primary_location.source.id:{id}` | Distribución gold/green/hybrid/bronze/closed | `_20` (Plot: estado de acceso abierto) |
| **obrasCitadasTop** | (derivada de `allWorks`) | — | Top 50 por citas | Alimenta a `citacionesInfo` |
| **citacionesInfo** | GET /works?filter=cites:{workId} ×50 | `cites:{id}` | Autocitación + país de la institución citante | `_23` (Plot: procedencia de las citas) y `_26` (tarjeta % autocitación) |
| **productividadAutores** | (derivada de `allWorks`) | — | Conteo de autores por Nº de artículos | `chartLotka` (Plot log-log: observado vs. Ley de Lotka) |
| **authorData** | GET /works?group_by=authorships.author.id | `primary_location.source.id:{id}` | Top autores por Nº de publicaciones | `chartAuthors` (bubble pack D3) |
| **countryData** | GET /works?group_by=authorships.countries | `primary_location.source.id:{id}` | Distribución por país de afiliación | `chartCountries` (bubble pack D3) |
| **data (instituciones)** | GET /works?group_by=authorships.institutions.lineage | `primary_location.source.id:{id}` | Concentración institucional | `chartInstitutions` (bubble pack D3) |

### Ubicación del software
* **Depósito público:** Figshare
* **Identificador persistente:** [https://doi.org/10.6084/m9.figshare.33107114](https://doi.org/10.6084/m9.figshare.33107114) [18]
* **Licencia:** Licencia MIT
* **Editor:** figshare
* **Versión publicada:** 1.0.0
* **Repositorio de código:** GitHub - `Notebook-coding-bibliometric` [19]
* **URL del repositorio:** [https://github.com/Kahernandezg/Notebook-coding-bibliometric](https://github.com/Kahernandezg/Notebook-coding-bibliometric)
* **Cuaderno de código:** Observable Notebook [24]
* **URL del cuaderno:** [https://old.observablehq.com/@kahernandezg/notebook-coding-cuadernos-de-indicadores-biblometr](https://old.observablehq.com/@kahernandezg/notebook-coding-cuadernos-de-indicadores-biblometr)
* **Idioma:** Inglés/Español (documentación, comentarios de código e interfaz).

---

## (3) Potencial de reutilización / Reuse potential

Reutilizar el panel para otra revista requiere cambiar tres parámetros principales: (1) el identificador de fuente de OpenAlex de la revista; (2) una dirección de correo electrónico de contacto; y (3) una clave de API de OpenAlex, cuando corresponda, además de insertar el `<iframe>` resultante en una ventana del editor de código de OJS [19]. Una configuración de ejemplo mínima es:

```javascript
const config = {
  sourceId: "s6910135",
  journalName: "Revista Española de Documentación Científica",
  startYear: 2010,
  endYear: 2026,
  mailto: "correo@institucion.edu"
};
```

Debido a que OpenAlex se actualiza continuamente, dos ejecuciones en fechas distintas pueden producir resultados diferentes. Por lo tanto, la reproducibilidad depende de documentar, para cada ejecución, al menos lo siguiente: `source_id`, `query_date`, `filter`, `mailto`, `api_version` y `code_version`.

### Limitaciones
1. OpenAlex no necesariamente representa todo el contenido publicado por una revista, y la cobertura puede variar según el reconocimiento de DOIs, autores, afiliaciones y fuentes.
2. Los identificadores de autor pueden estar incompletos o duplicados.
3. La tasa de autocitación se calcula sobre las 50 obras más citadas, no sobre todo el corpus.
4. El gráfico de la Ley de Lotka utiliza el exponente clásico 2 sin estimarlo mediante regresión.
5. Los índices resumen (índice h, índice i10, citación media a dos años) se leen de `summary_stats` y no se recalculan de forma independiente.
6. Los resultados pueden cambiar a medida que OpenAlex actualiza sus registros, por lo que dos ejecuciones en fechas distintas pueden no coincidir exactamente.
7. Las estadísticas de uso de OJS y los indicadores bibliométricos de OpenAlex miden fenómenos diferentes y no deben interpretarse como equivalentes.

---

### Conclusiones
#### ¿Qué diferencia existe entre los notebooks Jupyter de OpenAlex Tutorials y los notebooks de Observable?
Si bien los cuadernos comunitarios y los tutoriales que ofrece OpenAlex [25] muestran la recuperación básica de datos y la paginación de la API en entornos como Jupyter [26], estos ejemplos están orientados fundamentalmente al procesamiento de datos sin conexión y a la capacitación de desarrolladores. No abordan el reto de la visualización pública, la interactividad web ni la integración con plataformas de gestión editorial. Notebook Coding cierra esta brecha al cambiar el enfoque de la extracción de datos a una capa de publicación del lado del cliente. Al aprovechar el tiempo de ejecución reactivo de JavaScript de Observable, cada indicador funciona como un componente autónomo de consulta en tiempo real que se puede integrar a la perfección en Open Journal Systems (OJS) a través de iframes adaptables, sin necesidad de infraestructura de servidor intermedia ni conocimientos avanzados de programación por parte de los equipos editoriales.

Al igual que los cuadernos de laboratorio de Schubotz et al. [20] demostraron la utilidad de los entornos interactivos para estructurar la trazabilidad de los datos, o las experiencias de capacitación con cuadernos de Troupin et al. [21] mostraron su valor para enseñar flujos computacionales complejos de forma práctica, *Notebook Coding* prueba que los cuadernos reactivos pueden salir del ámbito de análisis privado para convertirse en un canal directo de comunicación abierta. Al integrar consultas en vivo a OpenAlex dentro de OJS, la propuesta no solo automatiza la visualización de métricas en tiempo real para la gestión editorial, sino que proporciona un entorno abierto y bifurcable que facilita la enseñanza de la bibliometría aplicada y garantiza la reproducibilidad técnica en la investigación.

### Agradecimientos
Agradecemos a las comunidades de OpenAlex, Observable, Datawrapper y Open Journal Systems. Sus API abiertas y herramientas de acceso gratuito permiten construir paneles bibliométricos reproducibles sin depender de una suscripción comercial a datos.

### Declaración de financiamiento
No aplica.

### Conflictos de interés
El autor declara no tener ningún conflicto de interés.

---

## Referencias

[1] Public Knowledge Project. Open Journal Systems (OJS). Vancouver, BC: PKP; 2026. Disponible en: https://pkp.sfu.ca/software/ojs/  
[2] Willinsky J. Open Journal Systems: An example of open source software for journal management and publishing. *Library Hi Tech*. 2005; 23(4):504–519. DOI: https://doi.org/10.1108/07378830510636300  
[3] COUNTER. Introducción a Informes COUNTER: Versión 5.1. 2024. Disponible en: https://www.countermetrics.org/wp-content/uploads/2024/04/SPANISH-Reports-guide.pdf  
[4] Macêdo DJ, Schiessl IT, Shintaku M. El uso de OpenAlex en los estudios de métricas bibliométricas. *Biblios: Journal of Librarianship and Information Science*. 2025; (esp):e015. DOI: https://doi.org/10.5195/biblios.2025.1268  
[5] van Eck NJ, Waltman L. Software survey: VOSviewer, a computer program for bibliometric mapping. *Scientometrics*. 2010; 84(2):523–538. DOI: https://doi.org/10.1007/s11192-009-0146-3  
[6] Aria M, Cuccurullo C. bibliometrix: An R-tool for comprehensive science mapping analysis. *Journal of Informetrics*. 2017; 11(4):959–975. DOI: https://doi.org/10.1016/j.joi.2017.08.007  
[7] Aria M, Cuccurullo C, D’Aniello L, Spano M. Biblioshiny and the SAAS Workflow: An integrated framework for transparent and reproducible science mapping. *Journal of Informetrics*. 2026. DOI: https://doi.org/10.1016/j.joi.2026.101837  
[8] Harzing AW. Publish or Perish. 2007. Disponible en: https://harzing.com/resources/publish-or-perish  
[9] Repiso Caballero R, Cabezas Clavijo Á. Contra la bibliometría ‘rápida y sucia’: aspectos para valorar la complejidad en los análisis bibliométricos. *Revista Panamericana de Comunicación*. 2025; 7(1). DOI: https://doi.org/10.21555/RPC.V7I1.3419  
[10] Priem J, Piwowar H, Orr R. OpenAlex: A fully-open index of scholarly works, authors, venues, institutions, and concepts. *arXiv preprint arXiv:2205.01833*. 2022. DOI: https://doi.org/10.48550/arXiv.2205.01833  
[11] OpenAlex. API reference. 2026. Disponible en: https://help.openalex.org/api/  
[12] Knuth DE. Literate programming. *The Computer Journal*. 1984; 27(2):97–111. DOI: https://doi.org/10.1093/comjnl/27.2.97  
[13] Observable, Inc. Observable Framework. 2026. Disponible en: https://observablehq.github.io/framework/  
[14] Datawrapper GmbH. Datawrapper. 2024. Disponible en: https://www.datawrapper.de  
[15] OpenAlex. Get groups of entities. 2026. Disponible en: https://docs.openalex.org/how-to-use-the-api/get-groups-of-entities  
[16] Lotka AJ. The frequency distribution of scientific productivity. *Journal of the Washington Academy of Sciences*. 1926; 16(12):317–323.  
[17] Consejo Superior de Investigaciones Científicas. Revista Española de Documentación Científica. Madrid: CSIC; 1977–presente. Disponible en: https://redc.revistas.csic.es/  
[18] Hernández Gutiérrez KA. Notebook Coding. figshare; 2026. DOI: https://doi.org/10.6084/m9.figshare.33107114  
[19] Hernández Gutiérrez KA. Notebook Coding [repositorio de GitHub]. 2026. Disponible en: https://github.com/Kahernandezg/Notebook-coding-bibliometric  
[20] Schubotz S, Schubotz M, Auernhammer GK. Electronic Laboratory Notebook: An Adaptable Solution. *Journal of Open Research Software*. 2025; 13(1):11. DOI: https://doi.org/10.5334/jors.391  
[21] Troupin G et al. DIVAnd training: producing ocean climatologies with Jupyter notebooks. *Journal of Open Source Education*. 2026; 9(99):278. DOI: https://doi.org/10.21105/jose.00278  
[22] DOI Foundation. DOI Handbook. Disponible en: https://www.doi.org/doi-handbook/html/  
[23] ORCID. ORCID e identificadores persistentes. Disponible en: https://info.orcid.org/es/documentation/integration-guide/orcid-and-persistent-identifiers/  
[24] Hernández Gutiérrez KA. Notebook Coding: cuadernos de indicadores bibliométricos para revistas en OJS-OpenAlex. Observable; 2026. Disponible en: https://old.observablehq.com/@kahernandezg/notebook-coding-cuadernos-de-indicadores-biblometr  
[25] OurResearch. OpenAlex API tutorials: turn the page [Internet]. GitHub; [2026]. Disponible en: https://github.com/ourresearch/openalex-api-tutorials/blob/main/notebooks/getting-started/paging.ipynb  
[26] OurResearch. Paging: OpenAlex API tutorials [Internet]. GitHub; [2026]. Disponible en: https://github.com/ourresearch/openalex-api-tutorials/blob/main/notebooks/getting-started/paging.ipynb
