import { jsPDF } from 'jspdf';

const NAVY = [10, 47, 107];
const BLUE = [21, 101, 192];
const BRIGHT_BLUE = [33, 150, 243];
const LIGHT_BLUE = [227, 242, 253];
const WHITE = [255, 255, 255];
const DARK_GRAY = [30, 41, 59];
const MID_GRAY = [100, 116, 139];
const LIGHT_GRAY = [241, 245, 249];
const BORDER_GRAY = [226, 232, 240];

function addPageHeader(doc, subtitle) {
  // Navy header bar
  doc.setFillColor(...NAVY);
  doc.rect(0, 0, 210, 22, 'F');

  // GENEA logo text
  doc.setTextColor(...WHITE);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('GENEA', 14, 14);

  // Subtitle
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(180, 210, 255);
  doc.text(subtitle, 14, 19.5);

  // Accent line
  doc.setFillColor(...BRIGHT_BLUE);
  doc.rect(0, 22, 210, 1.5, 'F');
}

function addPageFooter(doc, pageNum, totalPages) {
  const y = 285;
  doc.setFillColor(...LIGHT_GRAY);
  doc.rect(0, y - 3, 210, 15, 'F');

  doc.setTextColor(...MID_GRAY);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text('© Genea Security — Confidential', 14, y + 5);
  doc.text(`Page ${pageNum} of ${totalPages}`, 196, y + 5, { align: 'right' });

  doc.setDrawColor(...BORDER_GRAY);
  doc.line(14, y - 3, 196, y - 3);
}

function wrapText(doc, text, x, y, maxWidth, lineHeight) {
  const lines = doc.splitTextToSize(text || '', maxWidth);
  doc.text(lines, x, y);
  return y + lines.length * lineHeight;
}

function sectionBox(doc, title, y, color = NAVY) {
  doc.setFillColor(...color);
  doc.rect(14, y, 182, 8, 'F');
  doc.setTextColor(...WHITE);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text(title.toUpperCase(), 18, y + 5.5);
  return y + 10;
}

function labelValue(doc, label, value, x, y, maxWidth = 80) {
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(...NAVY);
  doc.text(label, x, y);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(...DARK_GRAY);
  const lines = doc.splitTextToSize(value || '—', maxWidth);
  doc.text(lines, x, y + 4.5);
  return y + 4.5 + lines.length * 4.5;
}

export function generateProductBriefPdf(content) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  let currentPage = 1;

  // --- PAGE 1 ---
  addPageHeader(doc, 'Product Brief');

  // Title block
  doc.setFillColor(...LIGHT_BLUE);
  doc.rect(14, 28, 182, 28, 'F');
  doc.setDrawColor(...BRIGHT_BLUE);
  doc.setLineWidth(0.5);
  doc.rect(14, 28, 182, 28);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.setTextColor(...NAVY);
  const titleLines = doc.splitTextToSize(content.title.replace('Product Brief: ', ''), 170);
  doc.text(titleLines, 20, 38);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(...MID_GRAY);
  doc.text(`Product Suite: ${content.productSuite || '—'}`, 20, 38 + titleLines.length * 8);

  let y = 62;

  // Meta info row
  doc.setFillColor(...WHITE);
  doc.setDrawColor(...BORDER_GRAY);
  doc.setLineWidth(0.3);
  doc.rect(14, y, 182, 20, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(...NAVY);
  doc.text('RELEASE DATE', 20, y + 6);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(...DARK_GRAY);
  doc.text(content.releaseDate || '—', 20, y + 12);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(...NAVY);
  doc.text('RELATED RELEASES', 80, y + 6);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(...DARK_GRAY);
  const relLines = doc.splitTextToSize(content.relatedReleases || '—', 108);
  doc.text(relLines, 80, y + 12);

  y += 26;

  // Product Summary
  y = sectionBox(doc, 'Product Summary', y);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(...DARK_GRAY);
  const summaryLines = doc.splitTextToSize(content.summary || '', 178);
  doc.text(summaryLines, 16, y + 5);
  y = y + 5 + summaryLines.length * 4.5 + 8;

  // Product Roadmap section
  if (y > 200) {
    doc.addPage();
    currentPage++;
    addPageHeader(doc, 'Product Brief');
    y = 30;
  }

  y = sectionBox(doc, 'Product Roadmap', y);
  y += 5;

  const items = content.roadmapItems || [];
  const timelineY = y + 10;
  const timelineLeft = 20;
  const timelineRight = 190;
  const timelineWidth = timelineRight - timelineLeft;

  // Timeline line
  doc.setDrawColor(...BORDER_GRAY);
  doc.setLineWidth(1.5);
  doc.line(timelineLeft, timelineY, timelineRight, timelineY);

  const statusOrder = ['foundation', 'current', 'future'];

  items.forEach((item, idx) => {
    const fraction = items.length === 1 ? 0.5 : idx / (items.length - 1);
    const dotX = timelineLeft + fraction * timelineWidth;
    const isCurrent = item.status === 'current';
    const isFoundation = item.status === 'foundation';

    // Dot
    if (isCurrent) {
      doc.setFillColor(...BRIGHT_BLUE);
      doc.circle(dotX, timelineY, 4, 'F');
      doc.setFillColor(...NAVY);
      doc.circle(dotX, timelineY, 2, 'F');
    } else if (isFoundation) {
      doc.setFillColor(...NAVY);
      doc.circle(dotX, timelineY, 3, 'F');
    } else {
      doc.setFillColor(...LIGHT_BLUE);
      doc.setDrawColor(...BRIGHT_BLUE);
      doc.setLineWidth(0.8);
      doc.circle(dotX, timelineY, 3, 'FD');
    }

    // Label above
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(...NAVY);
    const labelLines = doc.splitTextToSize(item.title || '—', 38);
    doc.text(labelLines, dotX, timelineY - 8, { align: 'center' });

    // Date below
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.setTextColor(...MID_GRAY);
    doc.text(item.releaseDate || '', dotX, timelineY + 7, { align: 'center' });

    // Feature note URL
    if (item.isReleased && item.featureNoteUrl) {
      doc.setTextColor(...BRIGHT_BLUE);
      doc.setFontSize(6);
      const urlText = item.featureNoteUrl.length > 30 ? item.featureNoteUrl.substring(0, 28) + '...' : item.featureNoteUrl;
      doc.text(urlText, dotX, timelineY + 12, { align: 'center' });
      doc.setTextColor(...DARK_GRAY);
    }

    // Description below
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.setTextColor(...MID_GRAY);
    const descLines = doc.splitTextToSize(item.description || '', 36);
    doc.text(descLines, dotX, timelineY + 17, { align: 'center' });
  });

  y = timelineY + 28;

  // Status legend
  doc.setFillColor(...NAVY);
  doc.circle(20, y + 2, 2, 'F');
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(...MID_GRAY);
  doc.text('Foundation', 24, y + 4);

  doc.setFillColor(...BRIGHT_BLUE);
  doc.circle(60, y + 2, 2, 'F');
  doc.text('Current Release', 64, y + 4);

  doc.setFillColor(...LIGHT_BLUE);
  doc.setDrawColor(...BRIGHT_BLUE);
  doc.setLineWidth(0.5);
  doc.circle(105, y + 2, 2, 'FD');
  doc.text('Future', 109, y + 4);

  y += 12;

  // End Users section
  if (y > 220) {
    doc.addPage();
    currentPage++;
    addPageHeader(doc, 'Product Brief');
    y = 30;
  }

  y = sectionBox(doc, 'End Users', y);
  y += 5;

  const halfW = 85;
  const col2X = 113;

  // WHAT box
  doc.setFillColor(...LIGHT_BLUE);
  doc.rect(16, y, halfW, 6, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(...NAVY);
  doc.text('WHAT', 20, y + 4.5);
  y += 7;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(...DARK_GRAY);
  const whatLines = doc.splitTextToSize(content.endUser.what || '—', halfW - 6);
  doc.text(whatLines, 16, y);
  y += whatLines.length * 4.5 + 4;

  // WHO box
  doc.setFillColor(...LIGHT_BLUE);
  doc.rect(16, y, halfW, 6, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(...NAVY);
  doc.text('WHO', 20, y + 4.5);
  y += 7;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(...DARK_GRAY);
  const whoLines = doc.splitTextToSize(content.endUser.who || '—', halfW - 6);
  doc.text(whoLines, 16, y);
  y += whoLines.length * 4.5 + 4;

  // WHY box
  doc.setFillColor(...LIGHT_BLUE);
  doc.rect(16, y, halfW, 6, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(...NAVY);
  doc.text('WHY', 20, y + 4.5);
  y += 7;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(...DARK_GRAY);
  const whyLines = doc.splitTextToSize(content.endUser.why || '—', halfW - 6);
  doc.text(whyLines, 16, y);
  y += whyLines.length * 4.5 + 10;

  // Integrators & Partners section
  if (y > 220) {
    doc.addPage();
    currentPage++;
    addPageHeader(doc, 'Product Brief');
    y = 30;
  }

  y = sectionBox(doc, 'Integrators & Partners', y, BLUE);
  y += 5;

  doc.setFillColor(227, 242, 253);
  doc.rect(16, y, halfW, 6, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(...BLUE);
  doc.text('WHAT', 20, y + 4.5);
  y += 7;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(...DARK_GRAY);
  const pWhatLines = doc.splitTextToSize(content.partner.what || '—', halfW - 6);
  doc.text(pWhatLines, 16, y);
  y += pWhatLines.length * 4.5 + 4;

  doc.setFillColor(227, 242, 253);
  doc.rect(16, y, halfW, 6, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(...BLUE);
  doc.text('WHO', 20, y + 4.5);
  y += 7;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(...DARK_GRAY);
  const pWhoLines = doc.splitTextToSize(content.partner.who || '—', halfW - 6);
  doc.text(pWhoLines, 16, y);
  y += pWhoLines.length * 4.5 + 4;

  doc.setFillColor(227, 242, 253);
  doc.rect(16, y, halfW, 6, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(...BLUE);
  doc.text('WHY', 20, y + 4.5);
  y += 7;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(...DARK_GRAY);
  const pWhyLines = doc.splitTextToSize(content.partner.why || '—', halfW - 6);
  doc.text(pWhyLines, 16, y);
  y += pWhyLines.length * 4.5 + 10;

  // Additional Resources
  if (y > 240) {
    doc.addPage();
    currentPage++;
    addPageHeader(doc, 'Product Brief');
    y = 30;
  }

  if (content.additionalResources) {
    y = sectionBox(doc, 'Additional Resources', y, [51, 65, 85]);
    y += 5;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(...DARK_GRAY);
    const resLines = doc.splitTextToSize(content.additionalResources, 178);
    doc.text(resLines, 16, y);
    y += resLines.length * 4.5 + 10;
  }

  // Add footers to all pages
  const total = doc.getNumberOfPages();
  for (let i = 1; i <= total; i++) {
    doc.setPage(i);
    addPageFooter(doc, i, total);
  }

  return doc;
}

export function generateMarketingPlaybookPdf(content) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });

  // --- TITLE PAGE ---
  doc.setFillColor(...NAVY);
  doc.rect(0, 0, 210, 297, 'F');

  // Decorative elements
  doc.setFillColor(...BLUE);
  doc.rect(0, 0, 8, 297, 'F');

  doc.setFillColor(33, 150, 243, 0.15);
  doc.circle(180, 60, 80, 'F');

  doc.setFillColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.text('GENEA', 20, 50);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(180, 210, 255);
  doc.text('Marketing Playbook', 20, 58);

  // Accent line
  doc.setFillColor(...BRIGHT_BLUE);
  doc.rect(20, 62, 80, 2, 'F');

  // Product name
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(24);
  doc.setTextColor(...WHITE);
  const pNameLines = doc.splitTextToSize(content.title.replace('Marketing Playbook: ', ''), 170);
  doc.text(pNameLines, 20, 85);

  // Tier badge
  const tierY = 85 + pNameLines.length * 10 + 10;
  const tierColors = {
    'Tier 1': [220, 53, 69],
    'Tier 2': [33, 150, 243],
    'Tier 3': [40, 167, 69],
    'Tier 4': [108, 117, 125],
  };
  const tierColor = tierColors[content.tier] || BRIGHT_BLUE;
  doc.setFillColor(...tierColor);
  doc.roundedRect(20, tierY, 70, 10, 2, 2, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(...WHITE);
  doc.text(content.tier, 55, tierY + 6.5, { align: 'center' });

  // Generation date
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(180, 210, 255);
  doc.text(`Generated: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`, 20, tierY + 22);

  // Channel list
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(150, 190, 240);
  doc.text('Channels included:', 20, tierY + 34);

  const channels = Object.keys(content.channels);
  channels.forEach((ch, idx) => {
    doc.setFillColor(...BRIGHT_BLUE);
    doc.circle(24, tierY + 43 + idx * 9, 1.5, 'F');
    doc.setTextColor(...WHITE);
    doc.setFontSize(9);
    doc.text(ch, 28, tierY + 45 + idx * 9);
  });

  // Footer on title page
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(100, 140, 200);
  doc.text('© Genea Security — Confidential & Proprietary', 105, 285, { align: 'center' });

  // --- CHANNEL PAGES ---
  const channelIcons = {
    LinkedIn: 'in',
    Instagram: 'ig',
    YouTube: 'yt',
  };

  const channelColors = {
    LinkedIn: [0, 119, 181],
    Instagram: [193, 53, 132],
    YouTube: [255, 0, 0],
  };

  channels.forEach((channelName, channelIdx) => {
    doc.addPage();
    addPageHeader(doc, `Marketing Playbook — ${channelName}`);

    const ch = content.channels[channelName];
    const chColor = channelColors[channelName] || BLUE;

    let y = 30;

    // Channel header
    doc.setFillColor(...chColor);
    doc.rect(14, y, 182, 12, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.setTextColor(...WHITE);
    doc.text(channelName.toUpperCase(), 20, y + 8.5);

    // Channel icon hint
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(255, 255, 255, 0.7);
    doc.text(`[${channelIcons[channelName] || channelName.substring(0, 2).toUpperCase()}]`, 188, y + 8.5, { align: 'right' });

    y += 16;

    // HEADLINE
    doc.setFillColor(...LIGHT_BLUE);
    doc.rect(14, y, 182, 7, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(...NAVY);
    doc.text('HEADLINE', 18, y + 5);
    y += 9;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(...NAVY);
    const headlineLines = doc.splitTextToSize(ch.headline, 174);
    doc.text(headlineLines, 14, y);
    y += headlineLines.length * 5.5 + 6;

    // POST COPY
    doc.setFillColor(...LIGHT_BLUE);
    doc.rect(14, y, 182, 7, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(...NAVY);
    doc.text('POST COPY', 18, y + 5);
    y += 9;

    // Copy box
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(...BORDER_GRAY);
    doc.setLineWidth(0.5);

    const copyLines = doc.splitTextToSize(ch.copy, 170);
    const copyBoxH = copyLines.length * 4.5 + 8;
    doc.rect(14, y, 182, copyBoxH, 'FD');

    // Left accent bar
    doc.setFillColor(...chColor);
    doc.rect(14, y, 3, copyBoxH, 'F');

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(...DARK_GRAY);
    doc.text(copyLines, 21, y + 5.5);
    y += copyBoxH + 8;

    // CTA
    doc.setFillColor(...LIGHT_BLUE);
    doc.rect(14, y, 182, 7, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(...NAVY);
    doc.text('CALL TO ACTION', 18, y + 5);
    y += 9;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(...BLUE);
    doc.text(ch.cta, 14, y);
    y += 8;

    // VISUAL DIRECTION
    if (y > 230) {
      doc.addPage();
      addPageHeader(doc, `Marketing Playbook — ${channelName}`);
      y = 30;
    }

    doc.setFillColor(...LIGHT_BLUE);
    doc.rect(14, y, 182, 7, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(...NAVY);
    doc.text('VISUAL DIRECTION', 18, y + 5);
    y += 9;

    doc.setFillColor(255, 253, 235);
    doc.setDrawColor(253, 224, 71);
    doc.setLineWidth(0.5);
    const visLines = doc.splitTextToSize(ch.visualDirection, 170);
    const visH = visLines.length * 4.5 + 8;
    doc.rect(14, y, 182, visH, 'FD');
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(113, 83, 0);
    doc.text(visLines, 18, y + 5.5);
    y += visH + 8;

    // AUDIENCE NOTES
    doc.setFillColor(...LIGHT_BLUE);
    doc.rect(14, y, 182, 7, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(...NAVY);
    doc.text('AUDIENCE NOTES', 18, y + 5);
    y += 9;

    doc.setFillColor(240, 253, 244);
    doc.setDrawColor(134, 239, 172);
    doc.setLineWidth(0.5);
    const audLines = doc.splitTextToSize(ch.audienceNotes, 170);
    const audH = audLines.length * 4.5 + 8;
    doc.rect(14, y, 182, audH, 'FD');
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(20, 83, 45);
    doc.text(audLines, 18, y + 5.5);
  });

  // Footers on all pages (skip title page)
  const total = doc.getNumberOfPages();
  for (let i = 1; i <= total; i++) {
    doc.setPage(i);
    if (i > 1) {
      addPageFooter(doc, i - 1, total - 1);
    }
  }

  return doc;
}
