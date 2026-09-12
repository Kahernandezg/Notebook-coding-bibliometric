---
title: "Notebook Coding: Teaching Bibliometrics Through Code </>: Reproducible Notebooks for Analyzing Journals on OJS and OpenAlex"
tags:
  - JavaScript
  - Observable
  - bibliometrics
  - open science
  - OpenAlex
  - Open Journal Systems
  - scholarly publishing
authors:
  - name: "Kevin Amilcar Hernández Gutierrez"
    orcid: "0009-0005-6780-1106"
    affiliation: 1
affiliations:
  - name: 'Universidad Centroamericana "José Simeón Cañas" (UCA), El Salvador'
    index: 1
date: "12 September 2026"
bibliography: paper.bib
---

# Summary

`Notebook Coding` is a collection of open, reproducible notebooks, written
in JavaScript for the Observable platform [@observable2024]. The notebooks
compute and visualize bibliometric indicators for academic journals indexed
in OpenAlex [@priem2022openalex] and managed with Open Journal Systems
(OJS).

Rather than relying exclusively on commercial citation databases, or on
externally installed software, each notebook queries the OpenAlex REST API
directly. Cells re-execute whenever the visualization is loaded, so the
panel reflects the state of the OpenAlex index available at the moment of
the query, rather than a previously generated static export.

The project implements fourteen indicators, organized into independent,
descriptively named cells:

- annual production and citations received;
- the ten most-cited works;
- coverage of the United Nations Sustainable Development Goals (SDGs);
- DOI and ORCID coverage;
- open-access status;
- the geographic and institutional provenance of citing works;
- the self-citation rate;
- author productivity according to Lotka's Law;
- the h-index;
- the i10-index;
- two-year mean citedness;
- concentration of author contributions;
- concentration of contributions by country;
- institutional concentration of publications.

For OJS-native statistics, such as page views and downloads, which fall
outside OpenAlex's bibliographic coverage, the case study incorporates
charts built with Datawrapper [@datawrapper2024]. These visualizations use
data drawn directly from OJS's own statistics module.

Each OpenAlex-driven indicator can be embedded into a live OJS installation
as a responsive `<iframe>` pointing to a published Observable cell. It can
also be exported as a static PNG or SVG image.

Reusing the panel for another journal requires changing three main
parameters:

1. the journal's OpenAlex source identifier;
2. a contact email address;
3. an OpenAlex API key, where applicable.
4. Insert `<iframe>` into an OJS code editor window `</>`.

The repository includes an example application that uses the REDC as a unit of analysis 
and a technical guide for insertion in OJS:

- the *Revista Española de Documentación Científica*.

The source code is available in a public GitHub repository
[@hernandezgutierrez2026github] and archived on figshare under DOI
[10.6084/m9.figshare.33107114](https://doi.org/10.6084/m9.figshare.33107114)
[@hernandezgutierrez2026notebookcoding]. All three resources are released
under the MIT license.

# Statement of need

Editorial teams of journals hosted on OJS across Latin America and the
Caribbean [@willinsky2005open] rarely have institutional access to Scopus,
the Scimago Journal Rank, or Web of Science. This limits their ability to
evaluate and analyze their own output, and disproportionately affects
open-access journals that are not indexed in commercial databases.

OJS's own statistics module reports COUNTER-compliant page views and
downloads for a specific installation, but this data does not always
guarantee historical continuity. Given this and other limitations that OJS
still presents in editorial performance reporting and analytics —
particularly with respect to bibliometric indicators — this project
proposes an alternative approach.

Editors, librarians, and library- and information-science students who want
to learn applied bibliometrics are typically trained around proprietary
interfaces or software that requires installation, or in some cases costly
subscriptions. These tools can be inaccessible to small journals,
resource-limited institutions, or training programs that need reproducible
examples.

`Notebook Coding` closes that gap for a specific, previously underserved
audience: people who run or study a journal that is not indexed in a major
commercial database and want a worked, forkable example of how open
bibliographic data and open literate-programming tools can be combined to
build the same class of indicators, with fully inspectable source code and
reproducible results. The project is aimed at people who manage or study
journals not indexed in major commercial databases and want to learn to
combine:

- open bibliographic data;
- query APIs;
- literate programming [@knuth1984literate];
- interactive visualization;
- reproducible bibliometric analysis.

Each notebook cell represents an indicator connected to an OpenAlex REST API
endpoint, has a descriptive name, and is organized according to its data
dependencies. Because of this, a class or workshop can use a single
indicator as a self-contained exercise without requiring students to
understand the full workflow from the start.

# Methods and formulas

Because notebook-driven bibliometrics is a comparatively unfamiliar
methodology, this section documents, formula by formula and constant by
constant, how each indicator is actually computed and how the underlying
OpenAlex queries are constructed. The description includes the assumptions,
constants, and limitations of each procedure.

## Rate-limited, fault-tolerant access

Requests to OpenAlex are managed through a bounded-concurrency queue. This
queue uses a semaphore with a maximum of three simultaneous requests:
`maxConcurrent = 3`. Pending requests are held in a FIFO (first in, first
out) queue. This way, even when several indicators request data at the same
time, the number of simultaneous requests never exceeds the configured
limit.

Every request includes the `mailto` parameter, which identifies the party
responsible for the API usage and grants access to OpenAlex's so-called
"polite pool." Access credentials (`mailto` and `api_key`), when used,
should be stored as secrets or environment variables rather than committed
as plain text in published code.

When OpenAlex returns an HTTP `429` response, the request is retried up to
six times. The wait time is defined as

$$
t_{\text{wait}}(k) =
\begin{cases}
1000 \cdot r & \text{if the response carries a Retry-After header } r \\
600 \cdot 2^{k} + u, \ u \sim \mathcal{U}(0,300)\text{ ms} & \text{otherwise}
\end{cases}
$$

where:

- $k \in \{0,1,\ldots,5\}$ is the retry attempt number;
- $r$ is the value, in seconds, indicated by `Retry-After`;
- $U(0,300)$ is a uniform random term, expressed in milliseconds;
- the random term prevents several retried requests from firing at exactly
  the same instant.

This strategy corresponds to a standard exponential-backoff-with-jitter
scheme.

## Exhaustive corpus retrieval

Indicators that need per-article detail (author productivity, the most
cited works, citation provenance) cannot rely on aggregate counts alone:
they page through the journal's entire corpus using OpenAlex's cursor
pagination, starting at `cursor = "*"`, requesting `per_page = 200` works
per call, and continuing while `meta.next_cursor` is present. A journal
with $N$ works is thus retrieved in $\lceil N/200 \rceil$ requests, each
routed through the same queue and retry logic described above.

If a query retrieves $N$ works and uses a page size of $p$, the approximate
number of requests is

$$Q = \left\lceil \frac{N}{p} \right\rceil.$$

For general queries, it is recommended to use the page size supported by
the current version of the API. OpenAlex's current documentation states
that `per_page=100` is the maximum supported for general list queries,
while grouped (`group_by`) queries can return up to 200 groups per page and
can likewise be paginated with a cursor for more
[@openalexpaging2026; @openalexgrouping2026]. It is worth noting that the
full-corpus-retrieval cells in this project request `per_page=200`, a value
above the general limit currently documented for listing works; it is
recommended to verify the actual `meta.per_page` value returned by the API
before assuming that $Q = \lceil N/p \rceil$ holds exactly with $p=200$.

## Server-side aggregation

Indicators that only need frequency counts are computed using OpenAlex's
`group_by` parameter. These include:

- SDG coverage;
- DOI coverage;
- ORCID coverage;
- open-access status;
- author concentration;
- distribution by country;
- institutional concentration.

In these cases, OpenAlex returns groups with their respective counts. The
notebook reshapes these groups into structures suitable for visualization.

For a coverage indicator, the proportion is defined as

$$p = \frac{n_{\text{count}}}{n_{\text{total}}}, \qquad p \in [0,1],$$

and the percentage shown on the panel is

$$p_{\%} = 100 \cdot p.$$

If $n_{\text{total}}=0$, the indicator is returned as unavailable rather
than zero, to avoid confusing an absence of data with an absence of the
phenomenon itself.

## Author productivity and Lotka's Law

The notebook identifies each author by their persistent OpenAlex
identifier and counts the number of the journal's works in which they
participate.

Let $n$ be the number of works published by an author. The observed
distribution is expressed as

$$A_{\text{obs}}(n) = \left|\left\{a : \operatorname{works}(a)=n\right\}\right|.$$

The theoretical reference is based on Lotka's Law [@lotka1926frequency]:

$$A_{\text{Lotka}}(n) = \frac{A(1)}{n^2}, \qquad n\geq 1,$$

where $A(1)$ is the observed number of authors with exactly one publication
in the journal.

In this project, $A(1)$ is not estimated by regression, and the exponent
$2$ is not fit to the data. The chart therefore represents a pedagogical
comparison between:

- the observed distribution $A_{\text{obs}}(n)$;
- the reference prediction $A_{\text{Lotka}}(n)$.

This choice simplifies interpretation for beginners, but is also a
limitation: the procedure does not prove that the journal's data strictly
follows a Lotka distribution.

## Self-citation rate

To estimate self-citation, the notebook selects the journal's 50 most-cited
works. For each selected work, it retrieves every work that cites it, via a
query equivalent to

```text
filter=cites:OPENALEX_WORK_ID
```

A citing work is classified as a journal self-citation if its own primary
source identifier matches the identifier of the journal under analysis.

Let $n_{\text{self}}$ be the number of citations originating from the same
journal, and $n_{\text{ext}}$ the number of citations originating from other
journals or sources. The self-citation rate is then

$$SC = \frac{n_{\text{self}}}{n_{\text{self}}+n_{\text{ext}}} \times 100.$$

If the denominator is zero, the rate is reported as unavailable.

This is not a rate computed over the journal's entire corpus, but over the
subset of its 50 most-cited works. This choice reduces the cost of API
queries but limits how far the result can be generalized. The indicator
should therefore be read as an estimate of self-citation among the
journal's highest-impact works, not as a corpus-wide figure.

## Precomputed indices

The h-index, i10-index, and two-year mean citedness are read from the
`summary_stats` field of the OpenAlex Source record. The notebook does not
recompute these three indices from per-work citation counts.

The h-index is formally defined as

$$h = \max\left\{k\in\mathbb{N} : \#\left\{w : c_w \geq k\right\}\geq k\right\},$$

where $w$ represents a work, $c_w$ is the number of citations received by
work $w$, and $h$ is the largest number of works that each have at least
$h$ citations.

The i10-index is defined as

$$i_{10} = \#\left\{w : c_w \geq 10\right\}.$$

Depending on the field used by the source, two-year mean citedness can be
expressed as

$$\overline{C}_{2} = \frac{\sum_{w\in W_{2}} c_w}{|W_{2}|},$$

where $W_{2}$ represents the set of works considered within the two-year
window.

In the notebook, these values are presented as indicators maintained by
OpenAlex. This choice reduces code complexity and facilitates auditing, but
means trusting OpenAlex's own computation of these three specific indices
rather than independently verifying them against all the per-work citation
counts already available in the downloaded corpus.

# Reproducibility and reuse

Reproducibility depends on the availability of:

- the version of the source code;
- the journal's OpenAlex identifier;
- the query date;
- the filter parameters used;
- the responses returned by the API;
- the versions of the JavaScript libraries used.

Because OpenAlex is continuously updated, two runs on different dates may
produce different results. Every run should therefore document at least:

```text
source_id
query_date
filter
mailto
api_version, if available
code_version
```

A minimal example configuration for reusing the panel is

```js
const config = {
  sourceId: "s6910135",
  journalName: "Revista Española de Documentación Científica",
  startYear: 2010,
  endYear: 2026,
  mailto: "institutional-email@example.org"
};
```

# Figures

The panel combines time series, rankings, distributions, and networks so
that each indicator uses a visual form suited to its nature.

![Indicadores bibliométricos](figures/Notebook%20coding%20Indicators.png)

# Limitations

The project has several limitations that should be considered when
interpreting its results:

- OpenAlex does not necessarily represent all content published by a
  journal.
- Coverage can vary depending on the recognition of DOIs, authors,
  affiliations, and sources.
- Author identifiers may be incomplete or duplicated.
- The self-citation rate is computed over the 50 most-cited works, not the
  entire corpus.
- The Lotka's Law chart uses the classical exponent $2$ without estimating
  it by regression.
- The summary indices are read from `summary_stats` and are not
  independently recomputed.
- Results can change as OpenAlex updates its records.
- OJS usage statistics and OpenAlex's bibliometric indicators measure
  different phenomena and should not be interpreted as equivalent.

# Acknowledgements

We acknowledge the OpenAlex, Observable, Datawrapper, and Open
Journal Systems communities. Their open APIs and freely accessible tools
make it possible to build reproducible bibliometric panels without
depending on a commercial data subscription.

# References
