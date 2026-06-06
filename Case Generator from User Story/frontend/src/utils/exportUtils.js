import { jsPDF } from 'jspdf';

export function downloadFile(content, filename, mimeType) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function downloadFeatureFile(gherkin, filename = 'generated.feature') {
  downloadFile(gherkin, filename, 'text/plain');
}

export function downloadJSON(data, filename = 'test-cases.json') {
  downloadFile(JSON.stringify(data, null, 2), filename, 'application/json');
}

export function downloadCSV(result) {
  const rows = [['Type', 'Title', 'Severity', 'Steps']];

  const addRows = (scenarios, type) => {
    scenarios.forEach((s) => {
      rows.push([type, s.title, s.severity, s.steps.join(' | ')]);
    });
  };

  addRows(result.positive || [], 'Positive');
  addRows(result.negative || [], 'Negative');
  addRows(result.edge || [], 'Edge');

  const csv = rows
    .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    .join('\n');

  downloadFile(csv, 'test-cases.csv', 'text/csv');
}

export function downloadPDF(result, userStory) {
  const doc = new jsPDF();
  let y = 20;

  doc.setFontSize(16);
  doc.text('AI Test Case Generator Report', 14, y);
  y += 12;

  doc.setFontSize(10);
  doc.text(`Generated: ${new Date().toLocaleString()}`, 14, y);
  y += 10;

  doc.setFontSize(12);
  doc.text('User Story:', 14, y);
  y += 6;
  doc.setFontSize(9);
  const storyLines = doc.splitTextToSize(userStory || 'N/A', 180);
  doc.text(storyLines, 14, y);
  y += storyLines.length * 5 + 8;

  doc.setFontSize(11);
  doc.text(`Coverage: ${result.coverageScore}% | Confidence: ${result.confidence}%`, 14, y);
  y += 10;

  const sections = [
    { label: 'Positive Cases', items: result.positive },
    { label: 'Negative Cases', items: result.negative },
    { label: 'Edge Cases', items: result.edge },
  ];

  sections.forEach(({ label, items }) => {
    if (y > 270) {
      doc.addPage();
      y = 20;
    }
    doc.setFontSize(12);
    doc.text(`${label} (${items?.length || 0})`, 14, y);
    y += 7;

    (items || []).forEach((scenario) => {
      if (y > 270) {
        doc.addPage();
        y = 20;
      }
      doc.setFontSize(10);
      doc.text(`• ${scenario.title} [${scenario.severity}]`, 18, y);
      y += 5;
      scenario.steps.forEach((step) => {
        if (y > 275) {
          doc.addPage();
          y = 20;
        }
        doc.setFontSize(8);
        doc.text(`  ${step}`, 22, y);
        y += 4;
      });
      y += 3;
    });
    y += 5;
  });

  doc.save('test-cases-report.pdf');
}

export async function copyToClipboard(text) {
  await navigator.clipboard.writeText(text);
}
