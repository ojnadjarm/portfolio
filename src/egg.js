/* Hidden way into the gallery: type "play" anywhere, or arrive with #play or #gallery. */
var GALLERY = import.meta.env.BASE_URL + 'gallery/';
if (/^#(play|gallery)$/.test(location.hash)) location.replace(GALLERY);
var typed = '';
document.addEventListener('keydown', function (e) {
  if (e.key.length !== 1 || e.target.closest('input, textarea, dialog')) return;
  typed = (typed + e.key.toLowerCase()).slice(-4);
  if (typed === 'play') location.href = GALLERY;
});
