// Edit mode: only active when the site is opened through "Manage portfolio.bat"
// (tools/manage.py answers /api/status). On a normal host this file does nothing.
(async () => {
  "use strict";
  let status;
  if (location.port !== "8803" || !/^(127\.0\.0\.1|localhost)$/.test(location.hostname)) return;
  try {
    const r = await fetch("/api/status", { cache: "no-store" });
    if (!r.ok) return;
    status = await r.json();
    if (!status.ok) return;
  } catch { return; }

  const P = window.Portfolio;
  if (!P) return;
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];

  const css = document.createElement("style");
  css.textContent = `
    .edit-x { position: absolute; top: 10px; right: 10px; z-index: 5; display: inline-flex; align-items: center; gap: 6px;
      min-height: 32px; padding: 0 12px; border-radius: 999px; border: 0; cursor: pointer;
      background: #fff; color: #9b2c1c; font: 600 .78rem/1 var(--display); box-shadow: 0 6px 16px -6px rgba(0,0,0,.45); }
    .edit-x:active { transform: scale(.96); }
    .tile-wrap { position: relative; }
    .edit-bar { position: fixed; left: 50%; bottom: calc(16px + env(safe-area-inset-bottom, 0px)); transform: translateX(-50%); z-index: 90;
      display: flex; align-items: center; gap: 14px; padding: 8px 8px 8px 18px; border-radius: 999px;
      background: rgba(18,17,18,.9); color: #f4f1ee; -webkit-backdrop-filter: blur(16px); backdrop-filter: blur(16px);
      font: 500 .86rem/1 var(--display); box-shadow: 0 18px 40px -16px rgba(0,0,0,.5); max-width: calc(100vw - 32px); }
    .edit-bar button { min-height: 36px; padding: 0 14px; border-radius: 999px; border: 0; cursor: pointer; background: #f4f1ee; color: #121112; font: 600 .82rem/1 var(--display); }
    .edit-drawer { position: fixed; right: 16px; bottom: calc(76px + env(safe-area-inset-bottom, 0px)); z-index: 90; width: min(420px, calc(100vw - 32px));
      max-height: min(70vh, 560px); overflow: auto; overscroll-behavior: contain; padding: 18px; border-radius: 20px;
      background: #fff; color: var(--text); border: 1px solid var(--line); box-shadow: 0 30px 60px -24px rgba(0,0,0,.4); display: none; }
    .edit-drawer.open { display: block; }
    .edit-drawer h3 { font: 600 1rem/1.2 var(--display); margin: 0 0 4px; }
    .edit-drawer > p { margin: 0 0 14px; font-size: .84rem; color: var(--muted); }
    .edit-row { display: grid; grid-template-columns: 64px 1fr auto; gap: 12px; align-items: center; padding: 10px 0; border-top: 1px solid var(--line); }
    .edit-row img { width: 64px; height: 40px; object-fit: cover; border-radius: 6px; background: var(--panel); }
    .edit-row b { display: block; font: 600 .86rem/1.25 var(--display); color: var(--ink); }
    .edit-row small { color: var(--muted); font-size: .76rem; }
    .edit-row .acts { display: flex; gap: 6px; }
    .edit-row button { min-height: 32px; padding: 0 10px; border-radius: 999px; cursor: pointer; font: 600 .76rem/1 var(--display); border: 1px solid var(--line); background: #fff; }
    .edit-row button.del { color: #9b2c1c; border-color: #e7c2ba; }
    .lb .edit-lb { display: flex; gap: 8px; }
    .lb .edit-lb button { min-height: 36px; padding: 0 14px; border-radius: 999px; border: 1px solid rgba(255,255,255,.2); background: rgba(255,255,255,.08); color: #f4f1ee; cursor: pointer; font: 600 .8rem/1 var(--display); }
    @media (hover: hover) and (pointer: fine) { .edit-bar button:hover, .edit-row button:hover { filter: brightness(.94); } }
  `;
  document.head.appendChild(css);

  async function api(path, body) {
    const r = await fetch(path, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    const j = await r.json();
    if (!r.ok || !j.ok) throw new Error(j.error || "Save failed");
    Object.assign(P.HIDDEN, j.hidden);
    return j;
  }

  // Remove buttons on every card and hand-placed tile
  function decorate() {
    for (const tile of $$(".tile")) {
      if (tile.parentElement.classList.contains("tile-wrap")) continue;
      const wrap = document.createElement("div");
      wrap.className = "tile-wrap";
      tile.replaceWith(wrap);
      wrap.appendChild(tile);
      const b = document.createElement("button");
      b.type = "button";
      b.className = "edit-x";
      const w = P.byId(tile.dataset.work);
      const many = w && P.visibleClips(w).length > 1;
      b.textContent = many && !tile.closest(".card") ? "Remove clip" : "Remove";
      b.title = many && tile.closest(".card") ? "Removes the whole project (all its clips)" : "Remove from the site";
      b.addEventListener("click", async (e) => {
        e.stopPropagation();
        if (tile.closest(".card") || !many) await hide("work", tile.dataset.work);
        else await hide("clip", tile.dataset.clip);
      });
      wrap.appendChild(b);
    }
  }

  async function hide(kind, id) {
    try { await api("/api/hide", { kind, id }); } catch (err) { return toast(err.message); }
    // Hand-placed tiles: drop them straight away
    for (const t of $$(kind === "work" ? `.tile[data-work="${id}"]` : `.tile[data-clip="${id}"]`)) {
      if (t.closest(".card")) continue;
      const holder = t.closest("[data-holder]") || t.closest(".tile-wrap");
      holder.remove();
    }
    P.rerender();
    decorate();
    paint();
  }

  async function restore(kind, id) {
    try { await api("/api/restore", { kind, id }); } catch (err) { return toast(err.message); }
    toast("Restored. Reload the page to see it back in the hero or panels.");
    P.rerender(); decorate(); paint();
  }

  async function purge(kind, id) {
    const clips = kind === "work" ? P.byId(id).clips : [id];
    const sure = confirm("Delete these video files from the media folder for good? This can't be undone.");
    if (!sure) return;
    try { await api("/api/purge", { kind, id, clips }); } catch (err) { return toast(err.message); }
    paint();
  }

  // Bottom bar + Removed drawer
  const bar = document.createElement("div");
  bar.className = "edit-bar";
  bar.innerHTML = `<span>Edit mode</span><button type="button" class="open-drawer">Removed (0)</button><button type="button" class="publish">Publish</button>`;
  const drawer = document.createElement("div");
  drawer.className = "edit-drawer";
  document.body.append(bar, drawer);
  $(".open-drawer", bar).addEventListener("click", () => drawer.classList.toggle("open"));
  const pub = $(".publish", bar);
  pub.addEventListener("click", async () => {
    pub.disabled = true;
    pub.textContent = "Publishing…";
    try {
      const r = await fetch("/api/publish", { method: "POST", headers: { "Content-Type": "application/json" }, body: "{}" });
      const j = await r.json();
      toast(j.ok ? j.message : j.error);
    } catch { toast("Couldn't reach the manager. Is Manage portfolio.bat still running?"); }
    pub.disabled = false;
    pub.textContent = "Publish";
  });

  function paint() {
    const H = P.HIDDEN;
    const rows = [];
    for (const id of H.works) {
      const w = P.byId(id); if (!w) continue;
      rows.push({ kind: "work", id, title: w.title, sub: "Whole project", poster: w.clips[0], purged: w.clips.every((c) => H.purged.includes(c)) });
    }
    for (const id of H.clips) {
      const w = window.WORKS.find((x) => x.clips.includes(id));
      rows.push({ kind: "clip", id, title: w ? w.title : id, sub: `One clip (${id})`, poster: id, purged: H.purged.includes(id) });
    }
    $(".open-drawer", bar).textContent = `Removed (${rows.length})`;
    drawer.innerHTML = `<h3>Removed from the site</h3><p>Restore puts a piece back. Delete files removes its videos from the media folder so they don't get uploaded.</p>` +
      (rows.length ? "" : `<p>Nothing removed yet.</p>`) +
      rows.map((r) => `<div class="edit-row"><img src="media/${r.poster}.jpg" alt="" onerror="this.style.visibility='hidden'"><div><b>${r.title}</b><small>${r.sub}${r.purged ? " · files deleted" : ""}</small></div>
        <div class="acts">${r.purged ? "" : `<button type="button" data-a="restore" data-k="${r.kind}" data-id="${r.id}">Restore</button><button type="button" class="del" data-a="purge" data-k="${r.kind}" data-id="${r.id}">Delete files</button>`}</div></div>`).join("");
  }
  drawer.addEventListener("click", (e) => {
    const b = e.target.closest("button[data-a]");
    if (!b) return;
    (b.dataset.a === "restore" ? restore : purge)(b.dataset.k, b.dataset.id);
  });

  // Lightbox: remove the clip on screen, or the whole project
  document.addEventListener("lb:show", (e) => {
    const lb = $(".lb");
    let box = $(".edit-lb", lb);
    if (!box) {
      box = document.createElement("div");
      box.className = "edit-lb";
      $(".lb-bar", lb).insertBefore(box, $(".lb-close", lb));
      box.addEventListener("click", async (ev) => {
        const b = ev.target.closest("button"); if (!b) return;
        const cur = P.Lightbox.current; if (!cur) return;
        await hide(b.dataset.k, b.dataset.k === "work" ? cur[0] : cur[1]);
      });
    }
    const w = P.byId(e.detail.work);
    const many = P.visibleClips(w).length > 1;
    box.innerHTML = (many ? `<button type="button" data-k="clip">Remove this clip</button>` : "") + `<button type="button" data-k="work">Remove ${many ? "whole project" : "this piece"}</button>`;
  });

  let toastEl;
  function toast(msg) {
    if (!toastEl) { toastEl = document.createElement("div"); toastEl.className = "edit-bar"; toastEl.style.bottom = "72px"; document.body.appendChild(toastEl); }
    toastEl.textContent = msg; toastEl.style.display = "flex";
    clearTimeout(toast.t); toast.t = setTimeout(() => (toastEl.style.display = "none"), 3200);
  }

  decorate();
  paint();
})();
