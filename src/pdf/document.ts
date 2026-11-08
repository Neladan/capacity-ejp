import type { Content, ContextPageSize, TDocumentDefinitions } from 'pdfmake/interfaces'
import { catalogue } from '../data/catalogue'
import { fr, formatNumber } from '../lib/fr'
import { darken } from '../lib/family-style'
import type { PdfData } from './data'

const C = {
  deep: '#103b33',
  deep2: '#17493f',
  ejp: '#327b57',
  mint: '#a9d9c0',
  mist: '#e9f2f0',
  paper: '#f6faf8',
  ink: '#1c2a26',
  text: '#3d4f4a',
  muted: '#5e7167',
  rule: '#d6e4df',
  onLevel: '#0f1f1a',
}

const MARGIN_X = 48

export interface PdfAssets {
  logoWhite: string
  logoGreen: string
}

/** Construit la définition pdfmake. Fonction pure : pas de pdfmake ici, seulement des données. */
export function buildDocDefinition(data: PdfData, assets: PdfAssets): TDocumentDefinitions {
  const name = data.name
  const content: Content[] = [...cover(data, assets), ...strengthsPage(data), ...bilanPage(data), ...familiesPages(data)]

  return {
    content,
    pageSize: 'A4',
    pageOrientation: 'portrait',
    pageMargins: [MARGIN_X, 56, MARGIN_X, 64],
    info: {
      title: `Mon catalogue des possibles${name ? ` · ${name}` : ''}`,
      author: name || 'EJP Cotonou',
      subject: 'Bilan personnel · EJP Cotonou',
      creator: 'Mon catalogue des possibles · EJP Cotonou',
    },
    language: 'fr-FR',
    defaultStyle: { font: 'Poppins', fontSize: 10, color: C.text, lineHeight: 1.3 },
    styles: {
      kicker: { font: 'PoppinsSemi', fontSize: 9, color: C.ejp, characterSpacing: 0.3 },
      h1: { font: 'Poppins', bold: true, fontSize: 26, color: C.deep, lineHeight: 1.05 },
      h2: { font: 'Poppins', bold: true, fontSize: 16, color: C.deep },
      lede: { font: 'Lora', fontSize: 12, color: C.text, lineHeight: 1.4 },
    },
    background: (page: number, size: ContextPageSize) => (page === 1 ? coverBackground(size) : null),
    footer: (page: number, pages: number) =>
      page === 1
        ? {
            columns: [
              { text: 'EJP Cotonou', color: C.muted, fontSize: 8 },
              { text: `${page} / ${pages}`, alignment: 'right', color: C.muted, fontSize: 8 },
            ],
            margin: [MARGIN_X, 24, MARGIN_X, 0],
          }
        : {
            columns: [
              { text: [{ text: 'EJP Cotonou', font: 'PoppinsSemi', color: C.ejp }, { text: '  ·  Mon catalogue des possibles', color: C.muted }], fontSize: 8 },
              { text: `${page} / ${pages}`, alignment: 'right', color: C.muted, fontSize: 8 },
            ],
            margin: [MARGIN_X, 24, MARGIN_X, 0],
          },
  }
}

function coverBackground(size: ContextPageSize): Content {
  const h = size.height * 0.64
  return {
    absolutePosition: { x: 0, y: 0 },
    canvas: [
      { type: 'rect', x: 0, y: 0, w: size.width, h, color: C.deep },
      { type: 'ellipse', x: size.width + 20, y: h + 10, r1: 300, r2: 300, color: C.deep2 },
      { type: 'rect', x: 0, y: h, w: size.width, h: size.height - h, color: C.paper },
    ],
  }
}

function cover(data: PdfData, assets: PdfAssets): Content[] {
  const stats: Content[] = catalogue.levels.map((l): Content => ({
    stack: [
      { canvas: [{ type: 'ellipse', x: 7, y: 7, r1: 7, r2: 7, color: l.color }], margin: [0, 0, 0, 6] },
      { text: formatNumber(data.counts[l.id]), font: 'Poppins', bold: true, fontSize: 22, color: C.deep },
      { text: l.label, fontSize: 9, color: C.text },
    ],
  }))
  return [
    { image: assets.logoWhite, width: 96, margin: [0, 0, 0, 92] },
    { text: 'EJP Cotonou · outil de découverte de soi', font: 'PoppinsSemi', fontSize: 9, color: C.mint, margin: [0, 0, 0, 12] },
    { text: catalogue.title, font: 'Poppins', bold: true, fontSize: 40, color: '#ffffff', lineHeight: 1, margin: [0, 0, 160, 16] },
    { text: fr(catalogue.subtitle), font: 'Lora', fontSize: 13, color: '#d6ece0', margin: [0, 0, 150, 40] },
    data.name
      ? { text: [{ text: 'Le bilan de ', color: C.mint }, { text: data.name, font: 'PoppinsSemi', color: '#ffffff' }], fontSize: 14 }
      : { text: 'Mon bilan', font: 'PoppinsSemi', fontSize: 14, color: '#ffffff' },
    { text: data.dateLabel, fontSize: 10, color: C.mint, margin: [0, 4, 0, 0] },
    { text: '', margin: [0, 92, 0, 0] },
    { columns: stats, columnGap: 16, margin: [0, 0, 0, 18] },
    {
      text: `${data.themesSeen} thèmes parcourus sur ${data.themesTotal} · ${formatNumber(data.counts.total)} éléments reconnus`,
      fontSize: 9,
      color: C.muted,
    },
  ]
}

function strengthsPage(data: PdfData): Content[] {
  const title = catalogue.bilan[0]
  const rows: Content[] = data.strengths.map((s, i) => ({
    table: {
      widths: [30, '*'],
      body: [
        [
          {
            stack: [
              { canvas: [{ type: 'ellipse', x: 13, y: 13, r1: 13, r2: 13, color: C.deep }] },
              // Position relative : le chiffre se pose sur le cercle sans ajouter de hauteur.
              { text: String(i + 1), font: 'Poppins', bold: true, color: '#ffffff', fontSize: 11, alignment: 'center', relativePosition: { x: 0, y: -21 } },
            ],
            margin: [0, 2, 0, 0],
          },
          {
            stack: [
              { text: s.label, font: 'PoppinsSemi', fontSize: 12, color: C.ink, lineHeight: 1.15 },
              { text: `${s.family.title} · ${s.theme.title} · n° ${s.id}`, fontSize: 8.5, color: C.muted, margin: [0, 2, 0, 0] },
            ],
          },
        ],
      ],
    },
    layout: {
      hLineWidth: () => 0,
      vLineWidth: () => 0,
      fillColor: () => (i < 3 ? '#e2f0e8' : '#ffffff'),
      paddingLeft: () => 12,
      paddingRight: () => 12,
      paddingTop: () => 7,
      paddingBottom: () => 5,
    },
    margin: [0, 0, 0, 3],
    unbreakable: true,
  }))
  return [
    { text: 'Mon bilan', style: 'kicker', pageBreak: 'before', margin: [0, 0, 0, 6] },
    { text: title, style: 'h1', margin: [0, 0, 0, 6] },
    {
      text: data.strengths.length ? fr('Choisies parmi ce que je sais déjà, dans l’ordre qui me ressemble.') : fr('Je ne les ai pas encore choisies. Je peux les écrire ici :'),
      style: 'lede',
      margin: [0, 0, 0, 14],
    },
    ...(data.strengths.length ? rows : writingLines(10, true)),
  ]
}

function bilanPage(data: PdfData): Content[] {
  const blocks: Content[] = data.bilan.map((b, i) => ({
    stack: [
      { text: b.question, font: 'PoppinsSemi', fontSize: 12, color: C.deep, margin: [0, 0, 0, 8] },
      b.answer
        ? {
            table: { widths: ['*'], body: [[{ text: b.answer, font: 'Lora', fontSize: 11.5, color: C.ink, lineHeight: 1.45 }]] },
            layout: {
              hLineWidth: () => 0,
              vLineWidth: (j: number) => (j === 0 ? 3 : 0),
              vLineColor: () => C.mint,
              paddingLeft: () => 14,
              paddingTop: () => 2,
              paddingBottom: () => 2,
            },
          }
        : { stack: writingLines(3) },
    ],
    margin: [0, i === 0 ? 0 : 22, 0, 0],
    unbreakable: true,
  }))
  return [{ text: 'Mon bilan', style: 'kicker', pageBreak: 'before', margin: [0, 0, 0, 6] }, { text: 'Mes réponses', style: 'h1', margin: [0, 0, 0, 24] }, ...blocks]
}

function writingLines(n: number, numbered = false): Content[] {
  return Array.from({ length: n }, (_, i) => ({
    columns: [
      numbered ? { text: `${i + 1}.`, width: 20, color: C.muted, fontSize: 10 } : { text: '', width: 0 },
      { canvas: [{ type: 'line', x1: 0, y1: 18, x2: 499 - (numbered ? 20 : 0), y2: 18, lineWidth: 0.8, lineColor: C.rule, dash: { length: 2, space: 3 } }] },
    ],
    margin: [0, 6, 0, 6],
  }))
}

function familiesPages(data: PdfData): Content[] {
  const out: Content[] = [
    { text: 'Mes choix', style: 'kicker', pageBreak: 'before', margin: [0, 0, 0, 6] },
    { text: 'Famille par famille', style: 'h1', margin: [0, 0, 0, 8] },
    { text: fr('Les éléments que j’ai marqués, thème par thème. Le numéro renvoie au catalogue.'), style: 'lede', margin: [0, 0, 0, 12] },
    legend(),
  ]
  if (!data.families.length) {
    out.push({ text: fr('Aucun élément marqué pour l’instant.'), color: C.muted, margin: [0, 24, 0, 0] })
    return out
  }
  data.families.forEach((f, fi) => {
    const accent = f.family.color.accent
    const ink = darken(accent)
    out.push({
      table: {
        widths: [34, '*', 'auto'],
        body: [
          [
            { text: String(f.family.number), font: 'Poppins', bold: true, fontSize: 22, color: '#ffffff', margin: [4, 2, 0, 0] },
            {
              stack: [
                { text: f.family.title, font: 'Poppins', bold: true, fontSize: 14, color: '#ffffff' },
                {
                  text: catalogue.levels.map((l) => `${f.counts[l.id]} ${l.label.toLowerCase()}`).join('  ·  '),
                  fontSize: 8.5,
                  color: '#ffffff',
                  margin: [0, 2, 0, 0],
                },
              ],
            },
            { text: `${f.total}`, font: 'Poppins', bold: true, fontSize: 18, color: '#ffffff', margin: [0, 4, 4, 0] },
          ],
        ],
      },
      layout: {
        hLineWidth: () => 0,
        vLineWidth: () => 0,
        fillColor: () => ink,
        paddingLeft: () => 12,
        paddingRight: () => 12,
        paddingTop: () => 12,
        paddingBottom: () => 12,
      },
      margin: [0, fi === 0 ? 20 : 28, 0, 10],
      // Garde le bandeau avec son premier thème.
      headlineLevel: 1,
    } as Content)

    for (const t of f.themes) {
      const groups: Content[] = t.groups.map((g) => ({
        columns: [
          {
            width: 108,
            columns: [
              { canvas: [{ type: 'ellipse', x: 5, y: 7, r1: 5, r2: 5, color: g.level.color }], width: 16 },
              { text: g.level.label, font: 'PoppinsSemi', fontSize: 9, color: C.ink },
            ],
          },
          {
            width: '*',
            stack: g.items.map((it) => ({
              text: [
                { text: `n° ${it.id}  `, fontSize: 8, color: C.muted },
                { text: it.label, fontSize: 10, color: C.ink },
              ],
              margin: [0, 0, 0, 3],
            })),
          },
        ],
        margin: [0, 4, 0, 4],
      }))
      out.push({
        stack: [
          {
            columns: [
              { text: t.theme.title, font: 'PoppinsSemi', fontSize: 11.5, color: ink },
              { text: `${t.total} / ${t.theme.items.length}`, alignment: 'right', fontSize: 8.5, color: C.muted, width: 'auto' },
            ],
            margin: [0, 0, 0, 4],
          },
          { canvas: [{ type: 'line', x1: 0, y1: 0, x2: 499, y2: 0, lineWidth: 0.6, lineColor: f.family.color.soft }], margin: [0, 0, 0, 6] },
          ...groups,
        ],
        margin: [0, 10, 0, 6],
        unbreakable: t.total <= 18,
      })
    }
  })
  return out
}

function legend(): Content {
  return {
    columns: catalogue.levels.map((l) => ({
      width: 'auto',
      columns: [
        { canvas: [{ type: 'ellipse', x: 5, y: 7, r1: 5, r2: 5, color: l.color }], width: 14 },
        { text: l.label, fontSize: 9, width: 90 },
      ],
    })),
    columnGap: 8,
  }
}
