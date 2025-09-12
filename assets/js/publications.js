
/* Publications data and rendering logic */
window.PUBLICATIONS = [
  {
    id: "ruba2025witt",
    title: "Witt Groups and the Bulk–Boundary Correspondence for Stabilizer States",
    authors: ["First Last", "Blazej Ruba"],
    venue: "Preprint",
    year: 2025,
    arxiv: "",
    doi: "",
    pdf: "",
    selected: true,
    abstract: "We develop a Witt-group framework for the bulk–boundary correspondence in Pauli stabilizer states, connecting algebraic invariants to boundary phenomena."
  },
  {
    id: "bulkboundary2025",
    title: "Bulk–boundary correspondence in Pauli stabilizer codes",
    authors: ["First Last"],
    venue: "Preprint",
    year: 2025,
    arxiv: "",
    doi: "",
    pdf: "",
    selected: true,
    abstract: "A framework for quasi‑symplectic modules, boundary operator algebras, and charge modules using Laurent polynomial methods and algebraic tools like Ext groups and the Witt group."
  },
  {
    id: "cliffordqca2025",
    title: "Categorifying Clifford QCA",
    authors: ["First Last"],
    venue: "Working paper",
    year: 2025,
    arxiv: "",
    doi: "",
    pdf: "",
    selected: false,
    abstract: "Explores categorical structures underlying Clifford quantum cellular automata with connections to operator algebras and L‑theory."
  }
];

(function(){
  function $(sel, ctx){ return (ctx||document).querySelector(sel); }
  function $all(sel, ctx){ return Array.from((ctx||document).querySelectorAll(sel)); }

  function bibtex(p){
    const authors = (p.authors||[]).map(a => {
      // Convert "First Last" to "Last, First"
      const parts = a.split(" ");
      if (parts.length > 1){
        const last = parts.pop();
        return `${last}, ${parts.join(" ")}`;
      }
      return a;
    }).join(" and ");
    const year = p.year || "xxxx";
    const key = (p.id || (p.authors?.[0] || "key").split(" ").pop()+year).replace(/[^A-Za-z0-9]+/g, "");
    const venue = p.venue || "";
    const arxiv = p.arxiv ? `\n  eprint = {${p.arxiv}},\n  archivePrefix = {arXiv},` : "";
    const doi = p.doi ? `\n  doi = {${p.doi}},` : "";
    const url = p.pdf ? `\n  url = {${p.pdf}},` : "";
    return `@article{${key},
  title = {${p.title}},
  author = {${authors}},${venue?`\n  journal = {${venue}},`:""}
  year = {${year}},${arxiv}${doi}${url}
}`;
  }

  function uniqueTags(list){
    const tags = new Set();
    list.forEach(p => (p.tags||[]).forEach(t => tags.add(t)));
    return Array.from(tags).sort();
  }

  function render(list){
    const S = window.SITE || {};
    const me = (S.name || "").toLowerCase();
    // Group by year
    const byYear = {};
    list.forEach(p => {
      const y = p.year || "In press";
      byYear[y] = byYear[y] || [];
      byYear[y].push(p);
    });
    const years = Object.keys(byYear).sort((a,b) => String(b).localeCompare(String(a)));
    const container = $("#pub-list");
    container.innerHTML = years.map(y => {
      const items = byYear[y].map(p => {
        const authors = (p.authors||[]).map(a => {
          const an = a.toLowerCase();
          return me && an.includes(me) ? `<strong>${a}</strong>` : a;
        }).join(", ");
        const links = [
          p.pdf && `<a href="${p.pdf}" target="_blank" rel="noopener">PDF</a>`,
          p.arxiv && `<a href="https://arxiv.org/abs/${p.arxiv}" target="_blank" rel="noopener">arXiv</a>`,
          p.doi && `<a href="https://doi.org/${p.doi}" target="_blank" rel="noopener">DOI</a>`
        ].filter(Boolean).join(" • ");
        const badges = [p.venue].filter(Boolean).map(v => `<span class="badge">${v}</span>`).join(" ");
        return `<li class="pub">
          <div>
            <span class="paper-title">${p.title}</span> ${badges}
            <div class="paper-meta">
              <span class="paper-authors">${authors}</span>${p.venue?`. <em>${p.venue}</em>.`:""} ${p.year?`(${p.year}).`:""}
              ${links?`<span class="dot">•</span> ${links}`:""}
            </div>
            ${p.abstract?`<details><summary>Abstract</summary><p>${p.abstract}</p></details>`:""}
            <div class="pub-actions">
              <button class="btn small" data-bib='${bibtex(p).replace(/'/g,"&#39;")}'>Copy BibTeX</button>
            </div>
          </div>
        </li>`;
      }).join("");
      return `<section class="year-group">
        <h3>${y}</h3>
        <ol>${items}</ol>
      </section>`;
    }).join("");

    // Copy BibTeX handlers
    $all("button[data-bib]").forEach(btn => {
      btn.addEventListener("click", async () => {
        const text = btn.getAttribute("data-bib").replace(/&#39;/g,"'");
        try {
          await navigator.clipboard.writeText(text);
          btn.textContent = "Copied ✓";
          setTimeout(()=>btn.textContent="Copy BibTeX", 1500);
        } catch {
          // Fallback
          const ta = document.createElement("textarea");
          ta.value = text; document.body.appendChild(ta); ta.select();
          document.execCommand("copy"); document.body.removeChild(ta);
          btn.textContent = "Copied ✓";
          setTimeout(()=>btn.textContent="Copy BibTeX", 1500);
        }
      });
    });
  }

  document.addEventListener("DOMContentLoaded", function(){
    const list = window.PUBLICATIONS || [];
    const search = document.getElementById("pub-search");
    const exportBtn = document.getElementById("export-bib");
    const tagWrap = document.getElementById("tag-filters");

    // Build tag filters if tags exist
    const tags = uniqueTags(list);
    if (tagWrap && tags.length){
      tags.forEach(tag => {
        const b = document.createElement("button");
        b.className = "btn small ghost";
        b.textContent = tag;
        b.setAttribute("data-tag", tag);
        b.addEventListener("click", () => {
          const active = b.classList.toggle("active");
          // multi-select tags
          const activeTags = Array.from(tagWrap.querySelectorAll(".btn.active")).map(x => x.getAttribute("data-tag"));
          filterAndRender();
        });
        tagWrap.appendChild(b);
      });
    }

    function filterAndRender(){
      const q = (search?.value || "").toLowerCase().trim();
      const activeTags = tagWrap ? Array.from(tagWrap.querySelectorAll(".btn.active")).map(x => x.getAttribute("data-tag")) : [];
      const filtered = list.filter(p => {
        const hay = [p.title, (p.authors||[]).join(" "), p.venue, (p.tags||[]).join(" ")].join(" ").toLowerCase();
        const hitQ = !q || hay.includes(q);
        const hitTags = !activeTags.length || (p.tags||[]).some(t => activeTags.includes(t));
        return hitQ && hitTags;
      });
      render(filtered);
    }

    search?.addEventListener("input", filterAndRender);
    render(list);

    exportBtn?.addEventListener("click", () => {
      const bib = (window.PUBLICATIONS || []).map(bibtex).join("\n\n");
      const blob = new Blob([bib], {type:"text/plain"});
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "publications.bib";
      a.click();
      URL.revokeObjectURL(url);
    });
  });
})();
