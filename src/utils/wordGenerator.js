import {
  Document, Packer, Paragraph, TextRun, ImageRun,
  Table, TableRow, TableCell, WidthType, BorderStyle,
  AlignmentType, ShadingType, Header, Footer, PageNumber,
  ExternalHyperlink,
} from 'docx';

function dataUrlToBuffer(dataUrl) {
  const base64 = dataUrl.split(',')[1];
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes.buffer;
}

function logoHeaderChildren(logoDataUrl, subtitle) {
  if (logoDataUrl) {
    const buf = dataUrlToBuffer(logoDataUrl);
    return [
      new ImageRun({
        data: buf,
        transformation: { width: 120, height: 21 },
        type: 'png',
      }),
      new TextRun({ text: `   |   ${subtitle}`, size: 16, color: GRAY_HEX, font: 'Calibri' }),
    ];
  }
  return [new TextRun({ text: `GENEA  |  ${subtitle}`, size: 16, color: NAVY_HEX, bold: true, font: 'Calibri' })];
}

const NAVY_HEX  = '003865';
const BLUE_HEX  = '1565C0';
const BRIGHT_HEX = '2196F3';
const LIGHT_HEX = 'E3F2FD';
const GRAY_HEX  = '64748B';

function heading1(text) {
  return new Paragraph({
    children: [new TextRun({ text, bold: true, size: 32, color: NAVY_HEX, font: 'Calibri' })],
    spacing: { before: 0, after: 160 },
  });
}

function heading2(text) {
  return new Paragraph({
    children: [
      new TextRun({ text: text.toUpperCase(), bold: true, size: 20, color: 'FFFFFF', font: 'Calibri' }),
    ],
    shading: { type: ShadingType.SOLID, color: NAVY_HEX, fill: NAVY_HEX },
    spacing: { before: 240, after: 80 },
    indent: { left: 80 },
  });
}

function heading3(text, color = NAVY_HEX) {
  return new Paragraph({
    children: [new TextRun({ text, bold: true, size: 18, color, font: 'Calibri' })],
    spacing: { before: 160, after: 60 },
  });
}

function body(text) {
  return new Paragraph({
    children: [new TextRun({ text: text || '—', size: 18, color: '1E293B', font: 'Calibri' })],
    spacing: { before: 0, after: 100 },
  });
}

function labeledField(label, value) {
  return [
    new Paragraph({
      children: [new TextRun({ text: label, bold: true, size: 16, color: NAVY_HEX, font: 'Calibri' })],
      spacing: { before: 120, after: 40 },
    }),
    new Paragraph({
      children: [new TextRun({ text: value || '—', size: 18, color: '1E293B', font: 'Calibri' })],
      spacing: { before: 0, after: 80 },
    }),
  ];
}

function divider() {
  return new Paragraph({
    border: { bottom: { color: BLUE_HEX, size: 6, space: 4, style: BorderStyle.SINGLE } },
    spacing: { before: 80, after: 80 },
  });
}

function linkParagraph(label, url) {
  const children = [];
  if (label) {
    children.push(new TextRun({ text: label + ' ', bold: true, size: 18, color: '1E293B', font: 'Calibri' }));
  }
  children.push(
    new ExternalHyperlink({
      link: url,
      children: [new TextRun({ text: url, size: 18, color: BRIGHT_HEX, underline: {}, font: 'Calibri' })],
    })
  );
  return new Paragraph({ children, spacing: { before: 40, after: 60 } });
}

function wwwTable(sections) {
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({
        children: sections.map(s =>
          new TableCell({
            children: [
              new Paragraph({
                children: [new TextRun({ text: s.label, bold: true, size: 18, color: 'FFFFFF', font: 'Calibri' })],
                alignment: AlignmentType.CENTER,
                shading: { type: ShadingType.SOLID, color: NAVY_HEX, fill: NAVY_HEX },
              }),
              new Paragraph({
                children: [new TextRun({ text: s.text || '—', size: 17, color: '1E293B', font: 'Calibri' })],
                spacing: { before: 60, after: 60 },
                indent: { left: 60 },
              }),
            ],
            margins: { top: 60, bottom: 60, left: 80, right: 80 },
          })
        ),
      }),
    ],
  });
}

// ─── Product Brief Word Doc ──────────────────────────────────────

export async function generateProductBriefDocx(content, logoDataUrl) {
  const sections = [
    heading1(content.title.replace('Product Brief: ', '')),

    new Paragraph({
      children: [
        new TextRun({ text: (content.productSuite || ''), size: 18, color: GRAY_HEX, font: 'Calibri' }),
        new TextRun({ text: '  ·  Released: ', size: 18, color: GRAY_HEX, font: 'Calibri' }),
        new TextRun({ text: content.releaseDate || 'TBD', size: 18, color: GRAY_HEX, font: 'Calibri' }),
      ],
      spacing: { before: 0, after: 200 },
    }),

    divider(),

    ...labeledField('Related Releases', content.relatedReleases),

    ...(content.helpCenterUrl ? [
      new Paragraph({
        children: [
          new TextRun({ text: 'Help Center Article: ', bold: true, size: 16, color: NAVY_HEX, font: 'Calibri' }),
          new ExternalHyperlink({
            link: content.helpCenterUrl,
            children: [new TextRun({ text: content.helpCenterUrl, size: 18, color: BRIGHT_HEX, underline: {}, font: 'Calibri' })],
          }),
        ],
        spacing: { before: 120, after: 200 },
      }),
    ] : []),

    heading2('Product Summary'),
    body(content.summary),

    heading2('Product Roadmap'),
    ...(content.roadmapItems || []).map(item =>
      new Paragraph({
        children: [
          new TextRun({ text: `[${item.status.toUpperCase()}]  `, bold: true, size: 16, color: item.status === 'current' ? BRIGHT_HEX : item.status === 'foundation' ? NAVY_HEX : GRAY_HEX, font: 'Calibri' }),
          new TextRun({ text: item.title || '', bold: item.status === 'current', size: 18, font: 'Calibri', color: '1E293B' }),
          ...(item.releaseDate ? [new TextRun({ text: `  ${item.releaseDate}`, size: 16, color: GRAY_HEX, font: 'Calibri' })] : []),
          ...(item.description ? [new TextRun({ text: `\n${item.description}`, size: 16, color: GRAY_HEX, font: 'Calibri' })] : []),
        ],
        spacing: { before: 80, after: 80 },
        indent: { left: 200 },
        bullet: { level: 0 },
      })
    ),

    heading2('End Users'),
    wwwTable([
      { label: 'WHAT', text: content.endUser?.what },
      { label: 'WHO',  text: content.endUser?.who },
      { label: 'WHY',  text: content.endUser?.why },
    ]),

    heading2('Integrators & Partners'),
    wwwTable([
      { label: 'WHAT', text: content.partner?.what },
      { label: 'WHO',  text: content.partner?.who },
      { label: 'WHY',  text: content.partner?.why },
    ]),

    ...(content.helpCenterUrl || content.additionalResources ? [
      heading2('Additional Resources'),
      ...(content.helpCenterUrl ? [linkParagraph('Help Center:', content.helpCenterUrl)] : []),
      ...((content.additionalResources || '').split('\n').filter(l => l.trim()).map(line => {
        const urlMatch = line.match(/https?:\/\/[^\s]+/);
        if (urlMatch) {
          const url = urlMatch[0];
          const label = line.replace(url, '').replace(/[:\s]+$/, '').trim();
          return linkParagraph(label, url);
        }
        return body(line);
      })),
    ] : []),
  ];

  const doc = new Document({
    sections: [{
      properties: {},
      children: sections,
      headers: {
        default: new Header({
          children: [new Paragraph({
            children: logoHeaderChildren(logoDataUrl, 'Product Brief'),
          })],
        }),
      },
      footers: {
        default: new Footer({
          children: [new Paragraph({
            children: [
              new TextRun({ text: '© Genea Security — Confidential    ', size: 14, color: GRAY_HEX, font: 'Calibri' }),
              new TextRun({ children: [PageNumber.CURRENT], size: 14, color: GRAY_HEX, font: 'Calibri' }),
            ],
            alignment: AlignmentType.CENTER,
          })],
        }),
      },
    }],
  });

  return Packer.toBlob(doc);
}

// ─── Marketing Playbook Word Doc ─────────────────────────────────

export async function generateMarketingPlaybookDocx(content, logoDataUrl) {
  const channelAccents = { LinkedIn: NAVY_HEX, Instagram: BLUE_HEX, YouTube: BRIGHT_HEX };

  const children = [
    heading1(content.title.replace('Marketing Playbook: ', '')),
    new Paragraph({
      children: [new TextRun({ text: `${content.tier || ''}  ·  Generated ${new Date().toLocaleDateString()}`, size: 18, color: GRAY_HEX, font: 'Calibri' })],
      spacing: { before: 0, after: 240 },
    }),
    divider(),
  ];

  Object.entries(content.channels || {}).forEach(([channelName, ch]) => {
    const accent = channelAccents[channelName] || NAVY_HEX;

    children.push(
      new Paragraph({
        children: [new TextRun({ text: channelName.toUpperCase(), bold: true, size: 24, color: 'FFFFFF', font: 'Calibri' })],
        shading: { type: ShadingType.SOLID, color: accent, fill: accent },
        spacing: { before: 320, after: 100 },
        indent: { left: 80 },
      }),
      heading3('Headline / Hook'),
      new Paragraph({
        children: [new TextRun({ text: ch.headline || '', bold: true, size: 22, color: NAVY_HEX, font: 'Calibri' })],
        spacing: { before: 0, after: 160 },
      }),
      heading3('Post Copy'),
      new Paragraph({
        children: [new TextRun({ text: ch.copy || '', size: 18, color: '1E293B', font: 'Calibri' })],
        shading: { type: ShadingType.SOLID, color: 'F1F5F9', fill: 'F1F5F9' },
        spacing: { before: 60, after: 160 },
        indent: { left: 80, right: 80 },
      }),
      heading3('Call to Action'),
      new Paragraph({
        children: [new TextRun({ text: ch.cta || '', bold: true, size: 18, color: BLUE_HEX, font: 'Calibri' })],
        spacing: { before: 0, after: 120 },
      }),
      heading3('Visual Direction'),
      body(ch.visualDirection),
      heading3('Audience & Positioning Notes'),
      body(ch.audienceNotes),
      divider(),
    );
  });

  const doc = new Document({
    sections: [{
      children,
      headers: {
        default: new Header({
          children: [new Paragraph({
            children: logoHeaderChildren(logoDataUrl, 'Marketing Playbook'),
          })],
        }),
      },
      footers: {
        default: new Footer({
          children: [new Paragraph({
            children: [
              new TextRun({ text: '© Genea Security — Confidential    ', size: 14, color: GRAY_HEX, font: 'Calibri' }),
              new TextRun({ children: [PageNumber.CURRENT], size: 14, color: GRAY_HEX, font: 'Calibri' }),
            ],
            alignment: AlignmentType.CENTER,
          })],
        }),
      },
    }],
  });

  return Packer.toBlob(doc);
}
