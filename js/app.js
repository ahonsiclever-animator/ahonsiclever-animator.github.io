(() => {
  "use strict";
  const META = window.MEDIA_META || {};
  const HIDDEN = window.HIDDEN || { works: [], clips: [], purged: [] };
  const CATS = window.CATS || [];
  const ALL_WORKS = window.WORKS || [];
  const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = matchMedia("(hover: hover) and (pointer: fine)").matches;
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];

  // ---------- Data (respecting removed pieces) ----------
  const clipHidden = (c) => HIDDEN.clips.includes(c) || HIDDEN.purged.includes(c);
  function visibleClips(w) { return w.clips.filter((c) => !clipHidden(c) && META[c]); }
  function works() {
    return ALL_WORKS.filter((w) => !HIDDEN.works.includes(w.id) && visibleClips(w).length);
  }
  const byId = (id) => ALL_WORKS.find((w) => w.id === id);
  const catName = (id) => (CATS.find((c) => c.id === id) || {}).name || "";

  function fmt(sec) {
    const s = Math.round(sec);
    return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
  }
  const PLAY = '<svg viewBox="0 0 10 10" aria-hidden="true"><path d="M1 0l9 5-9 5z"/></svg>';

  // ---------- Tiles ----------
  // A tile shows the poster; its short muted loop plays on hover (fine pointers)
  // or while on screen when it lives in an autoplay area. Click opens the lightbox.
  function makeTile(workId, clipId, opts = {}) {
    const m = META[clipId];
    const w = byId(workId);
    const el = document.createElement("button");
    el.type = "button";
    el.className = "tile";
    el.dataset.work = workId;
    el.dataset.clip = clipId;
    if (opts.ratio) el.style.setProperty("--ar", opts.ratio);
    else if (m) el.style.setProperty("--ar", m.vertical ? "9 / 16" : "16 / 9");
    el.setAttribute("aria-label", `Play ${w ? w.title : "video"}`);
    const n = w ? visibleClips(w).length : 1;
    el.innerHTML =
      `<img src="media/${clipId}.jpg" alt="${w ? escapeHtml(w.title) : ""}" loading="lazy" decoding="async">` +
      `<span class="dur">${PLAY}${m ? fmt(m.dur) : ""}</span>` +
      (opts.showCount && n > 1 ? `<span class="dur count">${n} clips</span>` : "");
    el.addEventListener("click", () => Lightbox.open(workId, clipId));
    if (!reduceMotion) {
      if (opts.autoplay) autoObserver.observe(el);
      else if (finePointer) {
        el.addEventListener("pointerenter", () => playLoop(el));
        el.addEventListener("pointerleave", () => stopLoop(el));
      }
    }
    return el;
  }

  function ensureVideo(tile) {
    let v = $("video", tile);
    if (!v) {
      v = document.createElement("video");
      v.muted = true; v.loop = true; v.playsInline = true;
      v.setAttribute("muted", ""); v.setAttribute("playsinline", "");
      v.preload = "none";
      v.src = `media/${tile.dataset.clip}-loop.mp4`;
      v.addEventListener("playing", () => tile.classList.add("is-playing"));
      tile.insertBefore(v, tile.firstChild.nextSibling);
    }
    return v;
  }
  function playLoop(tile) { const v = ensureVideo(tile); v.play().catch(() => {}); }
  function stopLoop(tile) {
    const v = $("video", tile);
    if (!v) return;
    v.pause();
    tile.classList.remove("is-playing");
  }
  const autoObserver = new IntersectionObserver((entries) => {
    for (const e of entries) e.isIntersecting ? playLoop(e.target) : stopLoop(e.target);
  }, { rootMargin: "120px 0px" });

  function escapeHtml(s) {
    return String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  }

  // ---------- Hydrate hand-placed slots ----------
  // <div data-slot="work-id" data-clip="clip-id" data-ratio="4 / 3" data-autoplay></div>
  function hydrateSlots() {
    for (const slot of $$("[data-slot]")) {
      const w = byId(slot.dataset.slot);
      const wanted = slot.dataset.clip || (w && w.clips[0]);
      const ok = w && works().includes(w) && !clipHidden(wanted) && META[wanted];
      const holder = slot.closest("[data-holder]") || slot;
      if (!ok) { holder.remove(); continue; }
      const tile = makeTile(w.id, wanted, { ratio: slot.dataset.ratio, autoplay: "autoplay" in slot.dataset });
      slot.replaceWith(tile);
    }
    // Hero captions read their duration from the data
    for (const d of $$("[data-dur]")) { const m = META[d.dataset.dur]; if (m) d.textContent = fmt(m.dur); }
    // A panel or spec that lost every tile goes too
    for (const p of $$(".panel, .case-media")) if (!$(".tile", p)) (p.closest(".spec") || p).remove();
  }

  // ---------- Grids ----------
  function card(w) {
    const fig = document.createElement("figure");
    fig.className = "card";
    fig.dataset.work = w.id;
    const first = visibleClips(w)[0];
    fig.appendChild(makeTile(w.id, first, { ratio: "4 / 3", showCount: true }));
    const cap = document.createElement("figcaption");
    cap.innerHTML = `<h3>${escapeHtml(w.title)}</h3><p>${escapeHtml(w.client ? `${w.client} · ${catName(w.cat)}` : catName(w.cat))}</p>`;
    fig.appendChild(cap);
    return fig;
  }

  function renderPicks() {
    for (const g of $$("[data-picks]")) {
      g.textContent = "";
      const ids = g.dataset.picks.split(",").map((s) => s.trim());
      const list = works().filter((w) => ids.includes(w.id)).sort((a, b) => ids.indexOf(a.id) - ids.indexOf(b.id));
      list.forEach((w) => g.appendChild(card(w)));
    }
  }

  let currentFilter = "all";
  function renderWorkPage() {
    const root = $("#work-root");
    if (!root) return;
    const chips = $("#chips");
    const list = works();
    const cats = CATS.filter((c) => list.some((w) => w.cat === c.id));
    if (currentFilter !== "all" && !cats.some((c) => c.id === currentFilter)) currentFilter = "all";
    chips.innerHTML =
      `<li><button class="chip" type="button" data-f="all" aria-pressed="${currentFilter === "all"}">All work<span class="c">${list.length}</span></button></li>` +
      cats.map((c) => `<li><button class="chip" type="button" data-f="${c.id}" aria-pressed="${currentFilter === c.id}">${c.name}<span class="c">${list.filter((w) => w.cat === c.id).length}</span></button></li>`).join("");
    root.textContent = "";
    for (const c of cats) {
      if (currentFilter !== "all" && currentFilter !== c.id) continue;
      const block = document.createElement("section");
      block.className = "cat-block";
      block.id = c.id;
      block.innerHTML = `<div class="cat-head"><h2 class="h3">${c.name}</h2><p>${escapeHtml(c.blurb)}</p></div><div class="grid"></div>`;
      const grid = $(".grid", block);
      list.filter((w) => w.cat === c.id).forEach((w) => grid.appendChild(card(w)));
      root.appendChild(block);
    }
  }
  function initChips() {
    const chips = $("#chips");
    if (!chips) return;
    const fromHash = location.hash.slice(1);
    if (CATS.some((c) => c.id === fromHash)) currentFilter = fromHash;
    chips.addEventListener("click", (e) => {
      const b = e.target.closest(".chip");
      if (!b) return;
      currentFilter = b.dataset.f;
      history.replaceState(null, "", currentFilter === "all" ? location.pathname : `#${currentFilter}`);
      renderWorkPage();
    });
  }

  // ---------- Lightbox ----------
  const Lightbox = (() => {
    let el, media, title, meta, blurb, count, seq = [], i = 0, lastFocus = null;

    function build() {
      el = document.createElement("div");
      el.className = "lb";
      el.setAttribute("role", "dialog");
      el.setAttribute("aria-modal", "true");
      el.setAttribute("aria-label", "Video viewer");
      el.innerHTML = `
        <div class="lb-bar">
          <span class="lb-count"></span>
          <button class="lb-btn lb-close" type="button" aria-label="Close">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>
          </button>
        </div>
        <div class="lb-stage"><video class="lb-media" controls playsinline preload="metadata"></video></div>
        <div class="lb-info">
          <div><h2></h2><p class="lb-blurb"></p><p class="lb-meta"></p></div>
          <div class="lb-nav">
            <button class="lb-btn lb-prev" type="button" aria-label="Previous">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 5l-7 7 7 7"/></svg>
            </button>
            <button class="lb-btn lb-next" type="button" aria-label="Next">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 5l7 7-7 7"/></svg>
            </button>
          </div>
        </div>`;
      document.body.appendChild(el);
      media = $(".lb-media", el);
      title = $("h2", el); blurb = $(".lb-blurb", el); meta = $(".lb-meta", el); count = $(".lb-count", el);
      $(".lb-close", el).addEventListener("click", close);
      $(".lb-prev", el).addEventListener("click", () => step(-1));
      $(".lb-next", el).addEventListener("click", () => step(1));
      $(".lb-stage", el).addEventListener("click", (e) => { if (e.target === e.currentTarget) close(); });
      document.addEventListener("keydown", (e) => {
        if (!el.classList.contains("open")) return;
        if (e.key === "Escape") close();
        else if (e.key === "ArrowRight") step(1);
        else if (e.key === "ArrowLeft") step(-1);
      });
      swipe($(".lb-stage", el));
      media.addEventListener("loadedmetadata", fit);
      addEventListener("resize", () => { if (el.classList.contains("open")) fit(); });
    }

    // Size the video to the largest box that fits the stage at its own aspect ratio,
    // so vertical and wide clips are always shown whole (and 720p clips scale up).
    function fit() {
      const stage = $(".lb-stage", el);
      const cs = getComputedStyle(stage);
      const availW = stage.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
      const availH = stage.clientHeight - 8;
      const cur = seq[i] && META[seq[i][1]];
      const vw = media.videoWidth || (cur && cur.vertical ? 9 : 16);
      const vh = media.videoHeight || (cur && cur.vertical ? 16 : 9);
      if (availW <= 0 || availH <= 0) return;
      const k = Math.min(availW / vw, availH / vh);
      media.style.width = `${Math.floor(vw * k)}px`;
      media.style.height = `${Math.floor(vh * k)}px`;
    }

    // Flat list of [workId, clipId] in page order, so arrows walk clip by clip.
    function sequence() {
      const scope = $("#work-root") ? $$("#work-root .card").map((c) => c.dataset.work) : works().map((w) => w.id);
      const out = [];
      scope.forEach((id) => { const w = byId(id); if (w) visibleClips(w).forEach((c) => out.push([id, c])); });
      return out;
    }

    function show() {
      const [wid, cid] = seq[i];
      const w = byId(wid);
      const clips = visibleClips(w);
      const k = clips.indexOf(cid);
      media.src = `media/${cid}.mp4`;
      media.poster = `media/${cid}.jpg`;
      fit();
      media.play().catch(() => {});
      title.textContent = w.title;
      blurb.textContent = w.blurb || "";
      meta.textContent = [w.client, catName(w.cat), clips.length > 1 ? `Clip ${k + 1} of ${clips.length}` : ""].filter(Boolean).join(" · ");
      count.textContent = `${i + 1} / ${seq.length}`;
      el.dataset.work = wid;
      el.dataset.clip = cid;
      document.dispatchEvent(new CustomEvent("lb:show", { detail: { work: wid, clip: cid } }));
    }

    function open(workId, clipId) {
      if (!el) build();
      seq = sequence();
      i = Math.max(0, seq.findIndex(([w, c]) => w === workId && c === clipId));
      if (!seq.length) return;
      lastFocus = document.activeElement;
      document.body.classList.add("lb-open");
      el.classList.add("open");
      show();
      $(".lb-close", el).focus({ preventScroll: true });
    }
    function close() {
      if (!el) return;
      el.classList.remove("open");
      document.body.classList.remove("lb-open");
      media.pause();
      media.removeAttribute("src");
      media.load();
      if (lastFocus) lastFocus.focus({ preventScroll: true });
    }
    function step(d) {
      if (!seq.length) return;
      i = (i + d + seq.length) % seq.length;
      show();
    }
    function refresh() {
      if (!el || !el.classList.contains("open")) return;
      seq = sequence();
      if (!seq.length) return close();
      i = Math.min(i, seq.length - 1);
      show();
    }

    // Horizontal swipe: media follows the finger 1:1, release projects momentum
    // to decide next / previous / settle back.
    function swipe(stage) {
      let x0 = 0, y0 = 0, dx = 0, id = null, locked = null, hist = [];
      stage.addEventListener("pointerdown", (e) => {
        if (e.pointerType === "mouse" || e.target !== media && e.target !== stage) return;
        id = e.pointerId; x0 = e.clientX; y0 = e.clientY; dx = 0; locked = null; hist = [[e.timeStamp, e.clientX]];
        media.style.transition = "none";
      });
      stage.addEventListener("pointermove", (e) => {
        if (e.pointerId !== id) return;
        const mx = e.clientX - x0, my = e.clientY - y0;
        if (!locked && Math.hypot(mx, my) > 10) {
          locked = Math.abs(mx) > Math.abs(my) ? "x" : "y";
          if (locked === "x") stage.setPointerCapture(id);
        }
        if (locked !== "x") return;
        dx = mx;
        hist.push([e.timeStamp, e.clientX]); if (hist.length > 5) hist.shift();
        media.style.transform = `translateX(${dx}px)`;
      });
      const end = (e) => {
        if (e.pointerId !== id) return;
        id = null;
        media.style.transition = "";
        if (locked !== "x") { media.style.transform = ""; return; }
        const [t0, xa] = hist[0], [t1, xb] = hist[hist.length - 1];
        const v = t1 > t0 ? ((xb - xa) / (t1 - t0)) * 1000 : 0; // px/s
        const projected = dx + (v / 1000) * 0.99 / (1 - 0.99);
        media.style.transform = "";
        if (Math.abs(projected) > stage.clientWidth * 0.25) step(projected < 0 ? 1 : -1);
      };
      stage.addEventListener("pointerup", end);
      stage.addEventListener("pointercancel", end);
    }

    return { open, close, refresh, get current() { return el && el.classList.contains("open") ? seq[i] : null; } };
  })();

  // ---------- Header ----------
  function initHeader() {
    const top = $(".top");
    if (!top) return;
    const onScroll = () => top.classList.toggle("scrolled", scrollY > 8);
    addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  // ---------- Boot ----------
  function renderAll() {
    hydrateSlots();
    renderPicks();
    renderWorkPage();
  }
  initHeader();
  initChips();
  renderAll();
  const yr = $("#year"); if (yr) yr.textContent = new Date().getFullYear();

  // Edit mode hooks (js/edit.js loads only when served by tools/manage.py)
  window.Portfolio = { HIDDEN, works, byId, visibleClips, Lightbox, rerender() { renderPicks(); renderWorkPage(); Lightbox.refresh(); }, catName };
})();
