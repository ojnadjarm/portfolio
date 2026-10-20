// Stand-in for the Electron preload: replays scripted notify() calls, silently.

const DEMO_EVENTS = [
  { kind: "success", title: "Task finished", message: "An agent finished its task and called Navi's notify tool." },
  { kind: "warning", title: "Needs attention", message: "Something an agent ran into needs a look." },
  { kind: "urgent", title: "Needs your approval", message: "An agent is waiting for you to approve before it continues." },
  { kind: "success", message: "Any MCP client can call notify, so you know when an agent needs you without watching the terminal." },
];
const DEMO_FIRST_MS = 2500;
const DEMO_EVERY_MS = 9000;

/** Silent stand-in for the app's chime. */
function playChime() {}

window.navi = {
  onNotify(cb) {
    let i = 0;
    const next = () => {
      cb(DEMO_EVENTS[i]);
      i = (i + 1) % DEMO_EVENTS.length;
    };
    window.setTimeout(() => {
      next();
      window.setInterval(next, DEMO_EVERY_MS);
    }, DEMO_FIRST_MS);
  },
};
