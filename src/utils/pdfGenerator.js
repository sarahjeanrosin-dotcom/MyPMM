import { jsPDF } from 'jspdf';

// Genea brand colors (RGB)
const NAVY    = [0, 56, 101];    // #003865
const BLUE    = [21, 101, 192];
const BRIGHT  = [33, 150, 243];
const LIGHT   = [227, 242, 253];
const WHITE   = [255, 255, 255];
const DARK    = [30, 41, 59];
const GRAY    = [100, 116, 139];
const LGRAY   = [241, 245, 249];
const BORDER  = [226, 232, 240];

const PAGE_W  = 210;
const MARGIN  = 14;
const CONTENT = PAGE_W - MARGIN * 2;  // 182mm

// ─── Helpers ────────────────────────────────────────────────────

// Strip Unicode characters that break jsPDF's built-in Helvetica encoding
function sanitize(text) {
  if (!text) return '';
  return String(text)
    .replace(/→/g, '->')
    .replace(/←/g, '<-')
    .replace(/…/g, '...')
    .replace(/‘|’/g, "'")
    .replace(/“|”/g, '"')
    .replace(/–/g, '-')
    .replace(/—/g, '--')
    .replace(/•|‣|▸|►/g, '-')
    .replace(/ /g, ' ')
    .replace(/[^\x00-\xFF]/g, '');
}

function formatDate(str) {
  if (!str) return 'TBD';
  const d = new Date(str + 'T12:00:00');
  if (!isNaN(d.getTime())) {
    return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  }
  return str;
}

const LOGO_H_HEADER = 7;                          // mm — logo height in page headers
const LOGO_W_HEADER = LOGO_H_HEADER * (735.8 / 131.6); // ≈ 39 mm
const LOGO_Y_HEADER = (20 - LOGO_H_HEADER) / 2;   // vertically centered in 20mm bar

function header(doc, subtitle, logoDataUrl) {
  doc.setFillColor(...NAVY);
  doc.rect(0, 0, PAGE_W, 20, 'F');
  doc.setFillColor(...BRIGHT);
  doc.rect(0, 20, PAGE_W, 1.5, 'F');

  if (logoDataUrl) {
    doc.addImage(logoDataUrl, 'PNG', MARGIN, LOGO_Y_HEADER, LOGO_W_HEADER, LOGO_H_HEADER);
  } else {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(...WHITE);
    doc.text('GENEA', MARGIN, 13);
  }

  const subtitleX = MARGIN + (logoDataUrl ? LOGO_W_HEADER + 5 : 32);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(180, 210, 255);
  doc.text(subtitle, subtitleX, 13);
}

function footer(doc, pageNum, total) {
  const fy = 287;
  doc.setDrawColor(...BORDER);
  doc.setLineWidth(0.3);
  doc.line(MARGIN, fy, PAGE_W - MARGIN, fy);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(...GRAY);
  doc.text('(c) Genea Security - Confidential', MARGIN, fy + 4.5);
  doc.text(`${pageNum} / ${total}`, PAGE_W - MARGIN, fy + 4.5, { align: 'right' });
}

function sectionHeading(doc, title, y) {
  const BOX_H = 8;
  doc.setFillColor(...NAVY);
  doc.roundedRect(MARGIN, y, CONTENT, BOX_H, 1.5, 1.5, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(...WHITE);
  doc.text(title.toUpperCase(), MARGIN + 5, y + 5.3);
  return y + BOX_H + 4;
}

function subLabel(doc, label, y, color = NAVY) {
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(...color);
  doc.text(label, MARGIN, y);
  return y + 4.5;
}

function bodyText(doc, text, x, y, maxW) {
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(...DARK);
  const lines = doc.splitTextToSize(text || '—', maxW);
  doc.text(lines, x, y);
  return y + lines.length * 4.8;
}

function checkPage(doc, y, needed = 30) {
  if (y + needed > 275) {
    doc.addPage();
    return 28;
  }
  return y;
}

// ─── Product Brief PDF ───────────────────────────────────────────

export function generateProductBriefPdf(content, logoDataUrl, opts = {}) {
  const { existingDoc = null, skipFooters = false } = opts;
  const doc = existingDoc || new jsPDF({ unit: 'mm', format: 'a4' });
  if (existingDoc) doc.addPage();

  // ── Page 1 header ──
  header(doc, 'Product Brief for Sales', logoDataUrl);
  let y = 26;

  // Title block
  doc.setFillColor(...LIGHT);
  doc.roundedRect(MARGIN, y, CONTENT, 26, 2, 2, 'F');
  doc.setDrawColor(...BRIGHT);
  doc.setLineWidth(0.4);
  doc.roundedRect(MARGIN, y, CONTENT, 26, 2, 2, 'S');
  // Left accent bar
  doc.setFillColor(...NAVY);
  doc.roundedRect(MARGIN, y, 3, 26, 1, 1, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(...NAVY);
  const titleLines = doc.splitTextToSize(content.title.replace('Product Brief: ', ''), CONTENT - 12);
  doc.text(titleLines, MARGIN + 7, y + 8);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(...GRAY);
  doc.text(`${content.productSuite || ''}  ·  Released: ${formatDate(content.releaseDate)}`, MARGIN + 7, y + 8 + titleLines.length * 7 + 1);

  y += 30;

  // Meta row (related releases + help center)
  if (content.relatedReleases || content.helpCenterUrl) {
    doc.setFillColor(...LGRAY);
    doc.roundedRect(MARGIN, y, CONTENT, 14, 1, 1, 'F');

    if (content.relatedReleases) {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.5);
      doc.setTextColor(...NAVY);
      doc.text('RELATED RELEASES', MARGIN + 4, y + 5);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(...DARK);
      const relLines = doc.splitTextToSize(content.relatedReleases, 85);
      doc.text(relLines, MARGIN + 4, y + 10);
    }

    if (content.helpCenterUrl) {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.5);
      doc.setTextColor(...NAVY);
      doc.text('HELP CENTER', MARGIN + 100, y + 5);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(...BRIGHT);
      const urlDisplay = content.helpCenterUrl.length > 45 ? content.helpCenterUrl.slice(0, 43) + '…' : content.helpCenterUrl;
      doc.textWithLink(urlDisplay, MARGIN + 100, y + 10, { url: content.helpCenterUrl });
    }

    y += 18;
  }

  // Product Summary
  y = sectionHeading(doc, 'Product Summary', y);
  y = bodyText(doc, content.summary, MARGIN, y, CONTENT) + 6;

  // ── Competitive Context ──
  const compCtx = content.competitiveContext;
  if (compCtx?.competitors?.length > 0) {
    y = checkPage(doc, y, 50);
    if (y === 28) header(doc, 'Product Brief for Sales', logoDataUrl);

    y = sectionHeading(doc, 'Competitive Context', y);

    // Position badge
    if (compCtx.position) {
      const posColors = {
        'Market Leader':           { fill: [220, 252, 231], text: [22, 101, 52]  },
        'Emerging Differentiator': { fill: [219, 234, 254], text: [29, 78, 216]  },
        'Industry Parity':         { fill: [254, 243, 199], text: [146, 64, 14]  },
      };
      const pc = posColors[compCtx.position] || posColors['Industry Parity'];
      const badgeW = 90;
      doc.setFillColor(...pc.fill);
      doc.roundedRect(MARGIN, y, badgeW, 7, 1, 1, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.5);
      doc.setTextColor(...pc.text);
      doc.text(compCtx.position, MARGIN + 4, y + 4.8);
      y += 11;
    }

    // Table header
    const col1W = CONTENT * 0.52;
    const col2W = CONTENT - col1W;
    doc.setFillColor(...LGRAY);
    doc.rect(MARGIN, y, CONTENT, 7, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(...NAVY);
    doc.text('COMPETITOR', MARGIN + 3, y + 4.8);
    doc.text('HAS THIS FEATURE?', MARGIN + col1W + 3, y + 4.8);
    y += 7;

    // Table rows
    const statusLabel = { yes: 'Yes - Has it', no: "No - Doesn't have it", unknown: 'Unknown' };
    const statusColor = { yes: [220, 38, 38], no: [22, 163, 74], unknown: [100, 116, 139] };

    compCtx.competitors.forEach((item, i) => {
      const rowH = 7;
      if (i % 2 === 0) {
        doc.setFillColor(250, 250, 250);
        doc.rect(MARGIN, y, CONTENT, rowH, 'F');
      }
      doc.setDrawColor(...BORDER);
      doc.setLineWidth(0.2);
      doc.rect(MARGIN, y, CONTENT, rowH, 'S');
      doc.line(MARGIN + col1W, y, MARGIN + col1W, y + rowH);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(...DARK);
      doc.text(sanitize(item.name || ''), MARGIN + 3, y + 4.8);

      const sc = statusColor[item.hasFeature] || statusColor.unknown;
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...sc);
      doc.text(statusLabel[item.hasFeature] || 'Unknown', MARGIN + col1W + 3, y + 4.8);
      y += rowH;
    });
    y += 8;
  }

  // ── Roadmap ──
  y = checkPage(doc, y, 50);
  if (y === 28) header(doc, 'Product Brief for Sales', logoDataUrl);

  y = sectionHeading(doc, 'Product Roadmap', y);
  y += 18;

  const items = (content.roadmapItems || []).slice(0, 6);
  if (items.length > 0) {
    const tlLeft  = MARGIN + 4;
    const tlRight = PAGE_W - MARGIN - 22; // leave room for last label
    const tlW     = tlRight - tlLeft;
    const tlY     = y + 14; // center of the horizontal line

    // Draw timeline line
    doc.setDrawColor(...BORDER);
    doc.setLineWidth(1.2);
    doc.line(tlLeft, tlY, tlRight, tlY);

    items.forEach((item, idx) => {
      const frac  = items.length === 1 ? 0.5 : idx / (items.length - 1);
      const dotX  = tlLeft + frac * tlW;
      const isCur = item.status === 'current';
      const isFnd = item.status === 'foundation';

      // Dot
      if (isCur) {
        doc.setFillColor(...BRIGHT);
        doc.circle(dotX, tlY, 4.5, 'F');
        doc.setFillColor(...WHITE);
        doc.circle(dotX, tlY, 2, 'F');
      } else if (isFnd) {
        doc.setFillColor(...NAVY);
        doc.circle(dotX, tlY, 3, 'F');
      } else {
        doc.setFillColor(...LIGHT);
        doc.setDrawColor(...BRIGHT);
        doc.setLineWidth(0.7);
        doc.circle(dotX, tlY, 3, 'FD');
      }

      // Date above dot (straight, small)
      if (item.releaseDate) {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(6.5);
        doc.setTextColor(...GRAY);
        doc.text(sanitize(item.releaseDate), dotX, tlY - 7, { align: 'center' });
      }

      // Title below dot — steep -55deg angle (lower-right) to prevent overlap
      const shortTitle = item.title
        ? (item.title.length > 18 ? item.title.slice(0, 16) + '...' : item.title)
        : '-';
      doc.setFont('helvetica', isCur ? 'bold' : 'normal');
      doc.setFontSize(7);
      doc.setTextColor(...(isCur ? BRIGHT : isFnd ? NAVY : GRAY));
      doc.text(sanitize(shortTitle), dotX, tlY + 8, { angle: -55 });
    });

    y = tlY + 42; // room for downward-angled labels

    // Legend
    doc.setFillColor(...NAVY);
    doc.circle(MARGIN, y + 2, 2, 'F');
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(...GRAY);
    doc.text('Foundation', MARGIN + 4, y + 3.5);

    doc.setFillColor(...BRIGHT);
    doc.circle(MARGIN + 38, y + 2, 2, 'F');
    doc.text('Current', MARGIN + 42, y + 3.5);

    doc.setFillColor(...LIGHT);
    doc.setDrawColor(...BRIGHT);
    doc.setLineWidth(0.5);
    doc.circle(MARGIN + 68, y + 2, 2, 'FD');
    doc.text('Upcoming', MARGIN + 72, y + 3.5);

    y += 10;
  }

  // ── End Users ──
  y = checkPage(doc, y, 50);
  if (y === 28) header(doc, 'Product Brief for Sales', logoDataUrl);

  y = sectionHeading(doc, 'End Users', y);
  y += 2;

  const colW   = (CONTENT - 6) / 3;
  const col2   = MARGIN + colW + 3;
  const col3   = MARGIN + (colW + 3) * 2;

  const endUserSections = [
    { label: 'WHAT', text: content.endUser?.what },
    { label: 'WHO',  text: content.endUser?.who },
    { label: 'WHY',  text: content.endUser?.why },
  ];

  // Measure tallest column
  const euHeights = endUserSections.map(s => {
    const lines = doc.splitTextToSize(s.text || '—', colW - 4);
    return lines.length * 4.8 + 14;
  });
  const euH = Math.max(...euHeights);

  [MARGIN, col2, col3].forEach((cx, i) => {
    doc.setFillColor(...LGRAY);
    doc.roundedRect(cx, y, colW, euH, 1, 1, 'F');
    doc.setFillColor(235, 240, 248);  // light blue-gray — not navy, so it doesn't look like a second section header
    doc.roundedRect(cx, y, colW, 7, 1, 1, 'F');
    doc.setDrawColor(...BORDER);
    doc.setLineWidth(0.2);
    doc.roundedRect(cx, y, colW, 7, 1, 1, 'S');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(...NAVY);
    doc.text(endUserSections[i].label, cx + colW / 2, y + 4.8, { align: 'center' });
    bodyText(doc, endUserSections[i].text, cx + 3, y + 11, colW - 6);
  });

  y += euH + 6;

  // ── Partners & Integrators ──
  y = checkPage(doc, y, 50);
  if (y === 28) header(doc, 'Product Brief for Sales', logoDataUrl);

  y = sectionHeading(doc, 'Integrators & Partners', y);
  y += 2;

  const partnerSections = [
    { label: 'WHAT', text: content.partner?.what },
    { label: 'WHO',  text: content.partner?.who },
    { label: 'WHY',  text: content.partner?.why },
  ];

  const pHeights = partnerSections.map(s => {
    const lines = doc.splitTextToSize(s.text || '—', colW - 4);
    return lines.length * 4.8 + 14;
  });
  const pH = Math.max(...pHeights);

  [MARGIN, col2, col3].forEach((cx, i) => {
    doc.setFillColor(...LIGHT);
    doc.roundedRect(cx, y, colW, pH, 1, 1, 'F');
    doc.setFillColor(219, 234, 254);  // light blue — distinct from section heading
    doc.roundedRect(cx, y, colW, 7, 1, 1, 'F');
    doc.setDrawColor(...BORDER);
    doc.setLineWidth(0.2);
    doc.roundedRect(cx, y, colW, 7, 1, 1, 'S');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(...BLUE);
    doc.text(partnerSections[i].label, cx + colW / 2, y + 4.8, { align: 'center' });
    bodyText(doc, partnerSections[i].text, cx + 3, y + 11, colW - 6);
  });

  y += pH + 6;

  // ── Additional Resources ──
  const resourceText = [
    content.helpCenterUrl ? `Help Center: ${content.helpCenterUrl}` : '',
    content.additionalResources || '',
  ].filter(Boolean).join('\n');

  if (resourceText.trim()) {
    y = checkPage(doc, y, 30);
    if (y === 28) header(doc, 'Product Brief for Sales', logoDataUrl);

    y = sectionHeading(doc, 'Additional Resources', y);
    y += 2;

    const resourceLines = resourceText.split('\n').filter(l => l.trim());
    resourceLines.forEach(line => {
      y = checkPage(doc, y, 12);
      const urlMatch = line.match(/https?:\/\/[^\s]+/);
      if (urlMatch) {
        const url = urlMatch[0];
        const labelPart = line.replace(url, '').replace(/[:\s]+$/, '').trim();
        if (labelPart) {
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(8.5);
          doc.setTextColor(...DARK);
          doc.text(labelPart, MARGIN, y);
          y += 5;
        }
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8.5);
        doc.setTextColor(...BRIGHT);
        const urlDisplay = url.length > 80 ? url.slice(0, 78) + '…' : url;
        doc.textWithLink(urlDisplay, MARGIN, y, { url });
        y += 6;
      } else {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8.5);
        doc.setTextColor(...DARK);
        const wrapped = doc.splitTextToSize(line, CONTENT);
        doc.text(wrapped, MARGIN, y);
        y += wrapped.length * 4.8 + 2;
      }
    });
  }

  if (!skipFooters) {
    const total = doc.getNumberOfPages();
    for (let i = 1; i <= total; i++) {
      doc.setPage(i);
      footer(doc, i, total);
    }
  }

  return doc;
}

// ─── Marketing Playbook PDF ──────────────────────────────────────

export function generateMarketingPlaybookPdf(content, logoDataUrl, opts = {}) {
  const { existingDoc = null, skipFooters = false } = opts;
  const doc = existingDoc || new jsPDF({ unit: 'mm', format: 'a4' });
  if (existingDoc) doc.addPage();

  // ── Title page ──
  doc.setFillColor(...NAVY);
  doc.rect(0, 0, PAGE_W, 297, 'F');

  // Left accent bar
  doc.setFillColor(...BRIGHT);
  doc.rect(0, 0, 5, 297, 'F');

  // Logo or wordmark
  const LOGO_H_LG = 13;
  const LOGO_W_LG = LOGO_H_LG * (735.8 / 131.6); // ≈ 73mm
  if (logoDataUrl) {
    doc.addImage(logoDataUrl, 'PNG', 18, 42, LOGO_W_LG, LOGO_H_LG);
  } else {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(26);
    doc.setTextColor(...WHITE);
    doc.text('GENEA', 18, 52);
  }

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(160, 200, 255);
  doc.text('Marketing Playbook', 18, logoDataUrl ? 62 : 60);

  doc.setFillColor(...BRIGHT);
  doc.rect(18, logoDataUrl ? 65 : 63, 60, 1.5, 'F');

  const pName = content.title.replace('Marketing Playbook: ', '');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.setTextColor(...WHITE);
  const pLines = doc.splitTextToSize(pName, 170);
  doc.text(pLines, 18, logoDataUrl ? 78 : 78);

  let ty = 78 + pLines.length * 9 + 6;

  // Tier badge
  doc.setFillColor(...BLUE);
  doc.roundedRect(18, ty, 55, 9, 2, 2, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(...WHITE);
  doc.text(sanitize(content.tier || ''), 18 + 27.5, ty + 5.8, { align: 'center' });

  ty += 16;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(140, 185, 240);
  doc.text(`Generated ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`, 18, ty);

  ty += 12;
  doc.setFontSize(8.5);
  doc.setTextColor(120, 170, 220);
  doc.text('Channels:', 18, ty);
  Object.keys(content.channels || {}).forEach((ch, i) => {
    doc.setFillColor(...BRIGHT);
    doc.circle(22, ty + 8 + i * 9, 1.5, 'F');
    doc.setTextColor(...WHITE);
    doc.text(ch, 26, ty + 9.5 + i * 9);
  });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 140, 200);
  doc.text('(c) Genea Security - Confidential & Proprietary', PAGE_W / 2, 287, { align: 'center' });

  // ── Tier 4: release notes only — no channel pages ──
  const channels = content.channels || {};
  if (Object.keys(channels).length === 0) {
    doc.addPage();
    header(doc, 'Marketing Playbook', logoDataUrl);
    let y = 26;
    y = sectionHeading(doc, 'Release Notes Only', y);
    y += 4;
    doc.setFillColor(...LGRAY);
    doc.roundedRect(MARGIN, y, CONTENT, 32, 2, 2, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(...NAVY);
    doc.text('Tier 4 -- No Marketing Materials Required', MARGIN + 6, y + 10);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(...GRAY);
    const t4Lines = doc.splitTextToSize('This is a minor update or bug fix. Log it in release notes only. No proactive customer communication or social campaign is needed.', CONTENT - 12);
    doc.text(t4Lines, MARGIN + 6, y + 18);
  }

  // ── Channel pages — Genea colors only ──
  const channelAccents = {
    LinkedIn:  NAVY,
    Instagram: BLUE,
    YouTube:   BRIGHT,
  };

  // ── Helper: render one email audience section onto the doc ──────
  function renderEmailAudience(doc, audience, accentColor, pageLabel, logoDataUrl, startY) {
    let y = startY;
    if (!audience) return y;

    // Subject
    y = sectionHeading(doc, 'Subject Line', y);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(...NAVY);
    const subLines = doc.splitTextToSize(sanitize(audience.subject || ''), CONTENT);
    doc.text(subLines, MARGIN, y);
    y += subLines.length * 6 + 3;

    if (audience.preheader) {
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(8);
      doc.setTextColor(...GRAY);
      doc.text(sanitize(audience.preheader), MARGIN, y);
      y += 6;
    }

    // Body
    y = checkPage(doc, y, 40);
    if (y === 28) header(doc, pageLabel, logoDataUrl);
    y = sectionHeading(doc, 'Email Body', y);
    const bodyLines = doc.splitTextToSize(sanitize(audience.body || ''), CONTENT - 8);
    const bodyH = Math.max(bodyLines.length * 4.8 + 10, 12);
    doc.setFillColor(...LGRAY);
    doc.roundedRect(MARGIN, y, CONTENT, bodyH, 1, 1, 'F');
    doc.setFillColor(...accentColor);
    doc.roundedRect(MARGIN, y, 3, bodyH, 1, 0, 'F');
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(...DARK);
    doc.text(bodyLines, MARGIN + 6, y + 6);
    y += bodyH + 6;

    // CTAs
    y = checkPage(doc, y, 18);
    if (y === 28) header(doc, pageLabel, logoDataUrl);
    y = sectionHeading(doc, 'Calls to Action', y);
    [audience.cta1, audience.cta2].filter(Boolean).forEach(cta => {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(...BLUE);
      doc.text(sanitize(cta), MARGIN, y);
      y += 7;
    });
    y += 2;

    // Vertical emails
    const vertEmails = audience.verticalEmails || [];
    if (vertEmails.length > 0) {
      y = checkPage(doc, y, 20);
      if (y === 28) header(doc, pageLabel, logoDataUrl);
      y = sectionHeading(doc, 'Verticalized Emails', y);

      vertEmails.forEach(({ vertical, subject, body: vbody, cta2 }) => {
        y = checkPage(doc, y, 28);
        if (y === 28) header(doc, pageLabel, logoDataUrl);

        // Vertical label bar
        doc.setFillColor(...LIGHT);
        doc.roundedRect(MARGIN, y, CONTENT, 7, 1, 1, 'F');
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8.5);
        doc.setTextColor(...NAVY);
        doc.text(sanitize(vertical || ''), MARGIN + 4, y + 4.8);
        y += 9;

        if (subject) {
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(8);
          doc.setTextColor(...DARK);
          doc.text('Subject: ' + sanitize(subject), MARGIN + 4, y);
          y += 5.5;
        }
        if (vbody) {
          const vLines = doc.splitTextToSize(sanitize(vbody), CONTENT - 8);
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(8);
          doc.setTextColor(...DARK);
          doc.text(vLines, MARGIN + 4, y);
          y += vLines.length * 4.5 + 3;
        }
        if (cta2) {
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(7.5);
          doc.setTextColor(...BLUE);
          doc.text(sanitize(cta2), MARGIN + 4, y);
          y += 7;
        }
        y += 3;
      });
    }

    return y;
  }

  // Email channel rendered separately — two pages (end users + channel partners)
  if (channels.Email) {
    const em = channels.Email;

    // ── End User email ──
    doc.addPage();
    header(doc, 'Marketing Playbook -- Email: End Users', logoDataUrl);
    let y = 26;
    y = renderEmailAudience(doc, em.endUser || em, NAVY, 'Marketing Playbook -- Email: End Users', logoDataUrl, y);

    // ── Channel Partner email ──
    doc.addPage();
    header(doc, 'Marketing Playbook -- Email: Channel Partners', logoDataUrl);
    y = 26;
    renderEmailAudience(doc, em.channelPartner, BLUE, 'Marketing Playbook -- Email: Channel Partners', logoDataUrl, y);
  }

  const nonEmailChannels = Object.entries(channels).filter(([k]) => k !== 'Email');
  nonEmailChannels.forEach(([channelName, ch]) => {
    doc.addPage();
    header(doc, `Marketing Playbook -- ${channelName}`, logoDataUrl);
    let y = 26;

    // HEADLINE
    y = sectionHeading(doc, 'Headline / Hook', y);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(...NAVY);
    const hLines = doc.splitTextToSize(sanitize(ch.headline || ''), CONTENT);
    doc.text(hLines, MARGIN, y);
    y += hLines.length * 6 + 6;

    // POST COPY
    y = checkPage(doc, y, 40);
    if (y === 28) header(doc, `Marketing Playbook -- ${channelName}`, logoDataUrl);
    y = sectionHeading(doc, 'Post Copy', y);

    const copyLines = doc.splitTextToSize(sanitize(ch.copy || ''), CONTENT - 8);
    const copyH = copyLines.length * 4.8 + 10;
    doc.setFillColor(...LGRAY);
    doc.roundedRect(MARGIN, y, CONTENT, copyH, 1, 1, 'F');
    doc.setFillColor(...accent);
    doc.roundedRect(MARGIN, y, 3, copyH, 1, 0, 'F');
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(...DARK);
    doc.text(copyLines, MARGIN + 6, y + 6);
    y += copyH + 6;

    // CTA
    y = checkPage(doc, y, 20);
    if (y === 28) header(doc, `Marketing Playbook -- ${channelName}`, logoDataUrl);
    y = sectionHeading(doc, 'Call to Action', y);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(...BLUE);
    const ctaLines = doc.splitTextToSize(sanitize(ch.cta || ''), CONTENT);
    doc.text(ctaLines, MARGIN, y);
    y += ctaLines.length * 5.5 + 4;

    // VISUAL DIRECTION
    y = checkPage(doc, y, 24);
    if (y === 28) header(doc, `Marketing Playbook -- ${channelName}`, logoDataUrl);
    y = sectionHeading(doc, 'Visual Direction', y);
    const visLines = doc.splitTextToSize(sanitize(ch.visualDirection || ''), CONTENT - 8);
    const visH = visLines.length * 4.8 + 10;
    doc.setFillColor(...LIGHT);
    doc.roundedRect(MARGIN, y, CONTENT, visH, 1, 1, 'F');
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(...DARK);
    doc.text(visLines, MARGIN + 5, y + 6);
    y += visH + 6;

    // AUDIENCE NOTES
    y = checkPage(doc, y, 24);
    if (y === 28) header(doc, `Marketing Playbook -- ${channelName}`, logoDataUrl);
    y = sectionHeading(doc, 'Audience & Positioning Notes', y);
    const audLines = doc.splitTextToSize(sanitize(ch.audienceNotes || ''), CONTENT - 8);
    const audH = audLines.length * 4.8 + 10;
    doc.setFillColor(...LGRAY);
    doc.roundedRect(MARGIN, y, CONTENT, audH, 1, 1, 'F');
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(...DARK);
    doc.text(audLines, MARGIN + 5, y + 6);
    y += audH + 6;

    // VERTICAL ANGLES
    const angles = ch.verticalAngles || [];
    if (angles.length > 0) {
      y = checkPage(doc, y, 20 + angles.length * 14);
      if (y === 28) header(doc, `Marketing Playbook -- ${channelName}`, logoDataUrl);
      y = sectionHeading(doc, 'Vertical Angles', y);

      angles.forEach(({ vertical, angle }) => {
        const angleLines = doc.splitTextToSize(sanitize(angle || ''), CONTENT - 30);
        const rowH = angleLines.length * 4.8 + 10;
        y = checkPage(doc, y, rowH + 4);

        doc.setFillColor(...LIGHT);
        doc.roundedRect(MARGIN, y, CONTENT, rowH, 1, 1, 'F');
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(7.5);
        doc.setTextColor(...NAVY);
        doc.text(sanitize(vertical || ''), MARGIN + 4, y + 5.5);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8.5);
        doc.setTextColor(...DARK);
        doc.text(angleLines, MARGIN + 28, y + 5.5);
        y += rowH + 3;
      });
      y += 4;
    }
  });

  if (!skipFooters) {
    const total = doc.getNumberOfPages();
    for (let i = 2; i <= total; i++) {
      doc.setPage(i);
      footer(doc, i - 1, total - 1);
    }
  }

  return doc;
}

// ─── Combined PDF ────────────────────────────────────────────────

export function generateCombinedPdf(briefContent, playbookContent, logoDataUrl) {
  if (!briefContent)   return generateMarketingPlaybookPdf(playbookContent, logoDataUrl);
  if (!playbookContent) return generateProductBriefPdf(briefContent, logoDataUrl);

  // Generate brief pages (no footers yet)
  const doc = generateProductBriefPdf(briefContent, logoDataUrl, { skipFooters: true });

  // Append playbook pages into the same doc
  generateMarketingPlaybookPdf(playbookContent, logoDataUrl, { existingDoc: doc, skipFooters: true });

  // Stamp sequential footers across all pages
  const total = doc.getNumberOfPages();
  for (let i = 1; i <= total; i++) {
    doc.setPage(i);
    footer(doc, i, total);
  }

  return doc;
}
