/* Escape text; `html` re-enables only the inline tags the copy is allowed to use. */
export function esc(s) {
  return String(s).replace(/[&<>"']/g, function (c) {
    return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
  });
}

var ALLOWED = ['<b>', '</b>', '<u>', '</u>', '<span class="lit">', '<span style="color:var(--acc)">', '</span>'];

export function html(s) {
  var out = esc(s);
  ALLOWED.forEach(function (tag) {
    out = out.split(esc(tag)).join(tag);
  });
  return out;
}
