// Tiny UI helper to inject bootstrap text into an element.
export async function injectBootstrapToElement(elementId, url = '/api/agent/bootstrap') {
  const el = document.getElementById(elementId);
  if (!el) return;
  try {
    const res = await fetch(url);
    const txt = await res.text();
    el.textContent = txt;
  } catch (e) {
    el.textContent = 'Failed to load bootstrap';
  }
}