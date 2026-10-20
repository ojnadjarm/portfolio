/* The body, faked: every /remote/* route answers from memory, nothing leaves the page. */
"use strict";
(() => {
  const BOOT = "demo";
  const demo = (window.__demo = {
    active: "main",
    mode: "call",
    brains: [
      { name: "main", label: "main", color: "#b04dff", mode: "call", connected: true, waiting: 0 },
      { name: "research", label: "research", color: "#4dd9ff", mode: "call", connected: true, waiting: 0 },
      { name: "portfolio", label: "portfolio", color: "#ff9a4d", mode: "notes", connected: true, waiting: 0 },
    ],
    orbiters: [],
    roster() { return { active: this.active, brains: this.brains.map((b) => ({ ...b })) }; },
  });
  const json = (body, status = 200) =>
    Promise.resolve(new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json", "X-Eye-Boot": BOOT } }));
  const body = (init) => { try { return JSON.parse(init?.body || "{}"); } catch { return {}; } };
  /** A long-poll that never carries a reply: the script drives the page directly. */
  const poll = (signal) => new Promise((ok, no) => {
    const t = setTimeout(() => ok(new Response("null", { headers: { "X-Eye-Boot": BOOT } })), 25_000);
    signal?.addEventListener("abort", () => { clearTimeout(t); no(new DOMException("aborted", "AbortError")); });
  });
  try { Object.defineProperty(navigator, "vibrate", { value: () => false }); } catch {}
  const real = window.fetch.bind(window);
  window.fetch = (input, init = {}) => {
    const url = new URL(typeof input === "string" ? input : input.url, location.href);
    if (url.origin !== location.origin) return Promise.reject(new TypeError("demo: same-origin only"));
    const route = `${(init.method || "GET").toUpperCase()} ${url.pathname.replace(/^.*\/remote\//, "/remote/")}`;
    switch (route) {
      case "POST /remote/audio": return json({ transcript: "" });
      case "GET /remote/cursor": return json({ seq: 0, boot: BOOT });
      case "GET /remote/poll": return poll(init.signal);
      case "GET /remote/brains": return json(demo.roster());
      case "GET /remote/mode": return json({ mode: demo.mode });
      case "GET /remote/orbiters": return json({ orbiters: demo.orbiters });
      case "POST /remote/active": {
        const b = body(init).brain;
        if (!demo.brains.some((r) => r.name === b)) return json({ error: "unknown" }, 400);
        demo.active = b;
        return json(demo.roster());
      }
      case "POST /remote/mode": {
        const m = body(init).mode === "notes" ? "notes" : "call";
        const row = demo.brains.find((r) => r.name === demo.active);
        if (row) row.mode = m;
        demo.mode = m;
        return json({ mode: m });
      }
    }
    if (url.pathname.includes("/remote/")) return json({ ok: true });
    return real(input, init);
  };
})();
