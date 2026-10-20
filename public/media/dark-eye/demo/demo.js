/* A scripted conversation driving the real page: ready, listening, thinking, speaking, on a loop. */
"use strict";
(() => {
  const D = window.__demo;
  const sleep = (ms) => new Promise((go) => setTimeout(go, ms));
  const MIC_OFF = "Scripted demo · the mic stays off here";

  /** The disc and the space bar answer with a note instead of opening a microphone. */
  toggle = (e) => { e.preventDefault(); warn(MIC_OFF); };

  const TURNS = [
    {
      me: "What are you, exactly?",
      eye: "I am a voice for a Claude session. You talk, I turn your words into text on the machine itself, and the reply comes back out loud.",
    },
    {
      me: "Who are the little creatures around you?",
      eye: "Agents at work. Each one orbits me while its task runs, and leaps back into the eye when it is done.",
      after: () => orbit(["T41", "T43"]),
    },
    {
      me: "Can I talk to another session?",
      eye: "Yes. Every session that joins is a channel with its own colour. Tap the name under me, or press a number key.",
      after: () => channelTo("research"),
    },
    {
      me: "And if I cannot listen right now?",
      eye: "Switch to audio notes. Replies wait in the transcript until you press play.",
      after: () => { D.brains.find((b) => b.name === D.active).mode = D.mode = "notes"; drawMode("notes"); },
    },
  ];

  const AGENTS = {
    T41: { id: "T41", label: "T41 write the tests" },
    T42: { id: "T42", label: "T42 review the docs" },
    T43: { id: "T43", label: "T43 build the site" },
  };
  function orbit(ids) {
    D.orbiters = ids.map((id) => AGENTS[id]);
    crowdSet(D.orbiters);
  }
  function channelTo(name) {
    D.active = name;
    roster(D.roster());
  }

  /** A fake voice meter for the eye's pupil while the reply "speaks", without any audio. */
  const meter = {
    getFloatTimeDomainData(buf) {
      const t = performance.now() / 1000;
      const a = 0.14 * Math.max(0, Math.sin(t * 11)) * (0.6 + 0.4 * Math.sin(t * 3.7));
      for (let i = 0; i < buf.length; i++) buf[i] = a * Math.sin(i * 0.4);
    },
  };

  async function listen(text) {
    recording = true;
    state("listening", "Tap again to send");
    const words = text.split(" ");
    let el = null;
    for (let i = 1; i <= words.length; i++) {
      eye.micTo = 0.35 + Math.random() * 0.45;
      const said = words.slice(0, i).join(" ");
      if (!el) el = line("me", said);
      else { el.dataset.text = said; el.dec.set(said); log.scrollTop = log.scrollHeight; }
      await sleep(260 + Math.random() * 160);
      eye.micTo = 0.05;
      await sleep(80);
    }
    await sleep(500);
    recording = false;
    eye.micTo = 0;
  }

  async function speak(text) {
    const el = line("eye", text, true);
    const ms = text.split(" ").length * 290;
    tap = meter;
    tapBuf = new Float32Array(256);
    playing = src = {};
    state("speaking", "");
    el.dec.reveal(ms);
    await sleep(ms + 500);
    playing = src = null;
  }

  async function run() {
    await sleep(400);
    orbit(["T41", "T42", "T43"]);
    for (;;) {
      for (const turn of TURNS) {
        state("ready", "Tap or <kbd>space</kbd> to talk");
        await sleep(2200);
        await listen(turn.me);
        state("thinking", "Thinking");
        await sleep(2000);
        await speak(turn.eye);
        turn.after?.();
        await sleep(600);
      }
      state("ready", "");
      await sleep(4000);
      log.replaceChildren();
      for (const b of D.brains) b.mode = b.name === "portfolio" ? "notes" : "call";
      D.mode = "call";
      channelTo("main");
      drawMode("call");
      orbit(["T41", "T42", "T43"]);
    }
  }

  // the page's own boot calls enter() once the faked body answers; the script starts after it
  run();
})();
