export async function injectBootstrapToElement(elementId: string, url = '/api/agent/bootstrap'): Promise<void> {
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