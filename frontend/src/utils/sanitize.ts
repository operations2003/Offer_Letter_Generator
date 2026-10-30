import DOMPurify from 'dompurify';

/**
 * Robust HTML sanitizer for user-controlled inputs, document templates,
 * and AI-generated outputs before rendering with dangerouslySetInnerHTML.
 * Mitigates Stored & Reflected Cross-Site Scripting (XSS).
 */
export function sanitizeHtml(dirtyHtml: string | null | undefined): string {
  if (!dirtyHtml || typeof dirtyHtml !== 'string') return '';
  return DOMPurify.sanitize(dirtyHtml, {
    ADD_ATTR: ['target', 'style', 'class', 'colspan', 'rowspan'],
    USE_PROFILES: { html: true },
  });
}
