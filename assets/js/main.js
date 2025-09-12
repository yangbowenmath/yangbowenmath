
(function(){
  function $(sel, ctx){ return (ctx||document).querySelector(sel); }
  function $all(sel, ctx){ return Array.from((ctx||document).querySelectorAll(sel)); }

  document.addEventListener("DOMContentLoaded", function(){
    const S = window.SITE || {};
    const page = document.body.getAttribute("data-page") || "home";

    // Title
    const h1 = document.querySelector("main h1");
    const baseTitle = S.shortName ? S.shortName : document.title;
    if (h1) document.title = `${baseTitle} — ${h1.textContent.trim()}`;
    else document.title = baseTitle;

    // Favicon and theme-color
    const theme = S.themeColor || "#0f766e";
    const tc = document.createElement("meta");
    tc.name = "theme-color"; tc.content = theme; document.head.appendChild(tc);

    // JSON-LD (schema.org Person)
    const person = {
      "@context":"https://schema.org",
      "@type":"Person",
      "name": S.name,
      "email": S.email ? `mailto:${S.email}` : undefined,
      "jobTitle": S.role,
      "affiliation": S.affiliation?.name,
      "worksFor": S.affiliation?.name,
      "url": location.origin + location.pathname.replace(/\/[^\/]*$/, "/"),
      "sameAs": [S.orcid && `https://orcid.org/${S.orcid}`, S.scholar, S.arxiv, S.github, S.mastodon, S.twitter, S.bluesky].filter(Boolean)
    };
    const ld = document.createElement("script");
    ld.type="application/ld+json"; ld.textContent = JSON.stringify(person, null, 2);
    document.head.appendChild(ld);

    // Build nav
    const nav = $("#site-nav");
    if (nav){
      nav.innerHTML = `
        <a class="brand" href="index.html">
          <img src="assets/images/profile.svg" alt="${S.headshotAlt || 'Headshot'}" width="36" height="36" />
          <span class="name">${S.name || ""}</span>
          <span class="role">${S.role || ""}</span>
        </a>
        <button class="nav-toggle" aria-label="Toggle navigation" aria-expanded="false">☰</button>
        <ul class="links">
          <li><a href="index.html" data-link="home">Home</a></li>
          <li><a href="research.html" data-link="research">Research</a></li>
          <li><a href="teaching.html" data-link="teaching">Teaching</a></li>
          <li><a href="cv.html" data-link="cv">CV</a></li>
        </ul>
        <div class="actions">
          <button id="theme-toggle" class="btn" title="Toggle dark mode" aria-label="Toggle dark mode">🌓</button>
        </div>
      `;
      // active link
      $all('a[data-link]', nav).forEach(a => {
        if (a.getAttribute('data-link') === page){
          a.classList.add('active');
          a.setAttribute('aria-current','page');
        }
      });
      // nav toggle (mobile)
      const t = $(".nav-toggle", nav);
      const links = $(".links", nav);
      t?.addEventListener("click", () => {
        const expanded = t.getAttribute("aria-expanded") === "true";
        t.setAttribute("aria-expanded", String(!expanded));
        links.classList.toggle("open");
      });
    }

    // Footer
    const footer = $("footer .foot-meta");
    if (footer){
      const yr = new Date().getFullYear();
      footer.innerHTML = `© ${yr} ${S.name || ""}. Site last updated ${S.lastUpdated || ""}.`;
    }
    const contacts = $("#contact-list");
    if (contacts){
      contacts.innerHTML = `
        ${S.email ? `<li><a href="mailto:${S.email}">Email</a></li>` : ""}
        ${S.affiliation?.url ? `<li><a href="${S.affiliation.url}" target="_blank" rel="noopener">Affiliation</a></li>` : ""}
        ${S.orcid ? `<li><a href="https://orcid.org/${S.orcid}" target="_blank" rel="noopener">ORCID</a></li>` : ""}
        ${S.scholar ? `<li><a href="${S.scholar}" target="_blank" rel="noopener">Google Scholar</a></li>` : ""}
        ${S.arxiv ? `<li><a href="${S.arxiv}" target="_blank" rel="noopener">arXiv</a></li>` : ""}
        ${S.github ? `<li><a href="${S.github}" target="_blank" rel="noopener">GitHub</a></li>` : ""}
        ${S.mastodon ? `<li><a href="${S.mastodon}" target="_blank" rel="me noopener">Mastodon</a></li>` : ""}
        ${S.twitter ? `<li><a href="${S.twitter}" target="_blank" rel="noopener">X/Twitter</a></li>` : ""}
        ${S.bluesky ? `<li><a href="${S.bluesky}" target="_blank" rel="noopener">Bluesky</a></li>` : ""}
      `;
    }

    // News on home
    const newsList = $("#news");
    if (newsList && Array.isArray(S.news)){
      newsList.innerHTML = S.news
        .sort((a,b) => (b.date||"").localeCompare(a.date||""))
        .map(item => `<li><time datetime="${item.date}">${item.date}</time> <span>${item.text}</span></li>`)
        .join("");
    }

    // Dark mode: load preference
    const themeToggle = $("#theme-toggle");
    const saved = localStorage.getItem("theme");
    if (saved === "dark") document.documentElement.classList.add("dark");
    if (saved === "light") document.documentElement.classList.remove("dark");
    themeToggle?.addEventListener("click", () => {
      const isDark = document.documentElement.classList.toggle("dark");
      localStorage.setItem("theme", isDark ? "dark" : "light");
    });

    // Selected publications on home, if available
    if (window.PUBLICATIONS && $("#selected-pubs")){
      const me = (S.name || "").toLowerCase();
      const sel = window.PUBLICATIONS.filter(p => p.selected);
      $("#selected-pubs").innerHTML = sel.map(p => {
        const year = p.year ? `(${p.year})` : "";
        const authors = (p.authors||[]).map(a => {
          const an = a.toLowerCase();
          return me && an.includes(me) ? `<strong>${a}</strong>` : a;
        }).join(", ");
        const links = [
          p.pdf && `<a href="${p.pdf}" target="_blank" rel="noopener">PDF</a>`,
          p.arxiv && `<a href="https://arxiv.org/abs/${p.arxiv}" target="_blank" rel="noopener">arXiv</a>`,
          p.doi && `<a href="https://doi.org/${p.doi}" target="_blank" rel="noopener">DOI</a>`
        ].filter(Boolean).join(" • ");
        return `<li>
          <span class="paper-title">${p.title}</span> ${year}<br/>
          <span class="paper-authors">${authors}</span>${p.venue ? `. <em>${p.venue}</em>.`:""} ${links?`<span class="dot">•</span> ${links}`:""}
        </li>`;
      }).join("");
    }
  });
})();
