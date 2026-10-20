/** Vite plugin (build only): emits `build.json` with the short git commit and build time, read by `sites verify`. */
import { execFileSync } from 'node:child_process';

export function stamp(root, now = new Date()) {
  let commit = 'none';
  try { commit = execFileSync('git', ['-C', root, 'rev-parse', '--short', 'HEAD'], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim(); } catch {}
  const p = (n) => String(n).padStart(2, '0');
  const built = `${now.getFullYear()}-${p(now.getMonth() + 1)}-${p(now.getDate())} ${p(now.getHours())}:${p(now.getMinutes())}:${p(now.getSeconds())}`;
  return { commit, built };
}

export function stampPlugin() {
  let root = '';
  return {
    name: 'build-stamp',
    apply: 'build',
    configResolved(config) { root = config.root; },
    generateBundle() { this.emitFile({ type: 'asset', fileName: 'build.json', source: `${JSON.stringify(stamp(root))}\n` }); },
  };
}
