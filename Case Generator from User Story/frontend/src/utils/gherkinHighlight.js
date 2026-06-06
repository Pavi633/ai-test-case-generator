export function highlightGherkin(gherkin) {
  if (!gherkin) return '';

  return gherkin
    .split('\n')
    .map((line) => {
      const trimmed = line.trim();

      if (trimmed.startsWith('#')) {
        return `<span class="gherkin-comment">${escapeHtml(line)}</span>`;
      }
      if (trimmed.startsWith('@')) {
        return `<span class="gherkin-tag">${escapeHtml(line)}</span>`;
      }
      if (/^Feature:/i.test(trimmed)) {
        return `<span class="gherkin-feature">${escapeHtml(line)}</span>`;
      }
      if (/^Scenario(?: Outline)?:/i.test(trimmed)) {
        return `<span class="gherkin-scenario">${escapeHtml(line)}</span>`;
      }
      if (/^Given\b/i.test(trimmed)) {
        return `<span class="gherkin-given">${escapeHtml(line)}</span>`;
      }
      if (/^When\b/i.test(trimmed)) {
        return `<span class="gherkin-when">${escapeHtml(line)}</span>`;
      }
      if (/^Then\b/i.test(trimmed)) {
        return `<span class="gherkin-then">${escapeHtml(line)}</span>`;
      }
      if (/^And\b|^But\b/i.test(trimmed)) {
        const keyword = trimmed.split(/\s/)[0];
        const rest = line.substring(line.indexOf(keyword) + keyword.length);
        const cls = line.toLowerCase().includes('given')
          ? 'gherkin-given'
          : line.toLowerCase().includes('when')
            ? 'gherkin-when'
            : 'gherkin-then';
        return `<span class="${cls}">${escapeHtml(line)}</span>`;
      }

      return escapeHtml(line);
    })
    .join('\n');
}

function escapeHtml(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
