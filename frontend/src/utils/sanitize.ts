/**
 * Lightweight, zero-dependency HTML sanitizer for browser environments.
 * Strips dangerous tags (script, object, embed, iframe, form, etc.),
 * inline event handlers (onload, onerror, onclick, etc.), and unsafe javascript: URIs.
 */

const DANGEROUS_TAGS = new Set([
  'script',
  'style',
  'iframe',
  'object',
  'embed',
  'applet',
  'form',
  'input',
  'button',
  'select',
  'textarea',
  'link',
  'meta',
  'base'
]);

function cleanElement(el: Element): void {
  // 1. Remove dangerous attributes and event handlers
  const attrs = Array.from(el.attributes);
  for (const attr of attrs) {
    const name = attr.name.toLowerCase();
    const val = attr.value.trim().toLowerCase();

    // Remove event handlers like onclick, onerror, onload, onmouseover...
    if (name.startsWith('on')) {
      el.removeAttribute(attr.name);
      continue;
    }

    // Remove unsafe protocols like javascript:, vbscript:, data: (except safe image data)
    if (name === 'href' || name === 'src' || name === 'action') {
      if (val.startsWith('javascript:') || val.startsWith('vbscript:') || (val.startsWith('data:') && !val.startsWith('data:image/'))) {
        el.removeAttribute(attr.name);
        continue;
      }
    }
  }

  // 2. Clean child nodes recursively
  const children = Array.from(el.children);
  for (const child of children) {
    const tagName = child.tagName.toLowerCase();
    if (DANGEROUS_TAGS.has(tagName)) {
      child.remove();
    } else {
      cleanElement(child);
    }
  }
}

export function sanitizeHtml(dirtyHtml: string | null | undefined): string {
  if (!dirtyHtml || typeof dirtyHtml !== 'string') return '';

  // If running in a browser environment with DOMParser
  if (typeof window !== 'undefined' && typeof DOMParser !== 'undefined') {
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(dirtyHtml, 'text/html');

      // Remove forbidden tags directly from body
      for (const tag of DANGEROUS_TAGS) {
        const elements = doc.body.querySelectorAll(tag);
        elements.forEach((node) => node.remove());
      }

      // Recursively clean all elements in body
      const rootChildren = Array.from(doc.body.children);
      for (const child of rootChildren) {
        cleanElement(child);
      }

      return doc.body.innerHTML;
    } catch {
      // Fallback below
    }
  }

  // Fallback regex sanitizer for server-side or fallback contexts
  return dirtyHtml
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
    .replace(/on\w+\s*=\s*(["'][^"']*["']|[^\s>]+)/gi, '')
    .replace(/href\s*=\s*["']javascript:[^"']*["']/gi, 'href="#"');
}
