const EMPTY_HTML_PATTERN =
  /^(<p><br><\/p>|<div><br><\/div>|<br>|&nbsp;|\s)*$/i;
const ALLOWED_HTML_TAGS = new Set(['p', 'div', 'br', 'b', 'strong', 'i', 'em', 'u', 'ul', 'ol', 'li']);

export function isBlankHtmlNote(value) {
  const html = String(value ?? '').trim();
  return !html || EMPTY_HTML_PATTERN.test(html) || !htmlToPlainText(html).trim();
}

export function normalizeHtmlNote(value) {
  const html = String(value ?? '').trim();
  return isBlankHtmlNote(html) ? '' : sanitizeHtmlNote(html);
}

export function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function noteToHtml(value) {
  const note = String(value ?? '');

  if (/<\/?[a-z][\s\S]*>/i.test(note)) {
    return normalizeHtmlNote(note);
  }

  return note
    .split(/\r?\n/)
    .map((line) => `<p>${escapeHtml(line) || '<br>'}</p>`)
    .join('');
}

export function sanitizeHtmlNote(value) {
  return String(value ?? '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/<\/?([a-z][a-z0-9]*)\b[^>]*>/gi, (tag, tagName) => {
      const normalizedTag = tagName.toLowerCase();

      if (!ALLOWED_HTML_TAGS.has(normalizedTag)) {
        return '';
      }

      if (normalizedTag === 'br') {
        return '<br>';
      }

      return tag.startsWith('</') ? `</${normalizedTag}>` : `<${normalizedTag}>`;
    });
}

export function htmlToPlainText(value) {
  return String(value ?? '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<\/(p|div|li|h[1-6])>/gi, '\n')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}
