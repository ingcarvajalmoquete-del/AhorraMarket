/*
 * Exportación del reporte de ventas a PDF y Excel (.xlsx).
 * Sin librerías externas: genera los archivos directamente en el navegador,
 * por lo que funciona sin internet y sin instalar nada.
 */

const BRAND = "Ahorra Market";
const XLSX_MIME = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
const utf8 = new TextEncoder();

/* ───────────────────────── descarga ───────────────────────── */
export function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

/* ───────────────────────── ZIP (sin compresión) ───────────────────────── */
const CRC_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    table[n] = c >>> 0;
  }
  return table;
})();

function crc32(bytes) {
  let crc = 0xffffffff;
  for (let i = 0; i < bytes.length; i++) crc = CRC_TABLE[(crc ^ bytes[i]) & 0xff] ^ (crc >>> 8);
  return (crc ^ 0xffffffff) >>> 0;
}

function zipStore(files) {
  const parts = [];
  const central = [];
  let offset = 0;

  const now = new Date();
  const dosTime = (now.getHours() << 11) | (now.getMinutes() << 5) | (now.getSeconds() >> 1);
  const dosDate = ((now.getFullYear() - 1980) << 9) | ((now.getMonth() + 1) << 5) | now.getDate();

  files.forEach((file) => {
    const name = utf8.encode(file.name);
    const data = file.data;
    const crc = crc32(data);

    const local = new Uint8Array(30 + name.length);
    const lv = new DataView(local.buffer);
    lv.setUint32(0, 0x04034b50, true);
    lv.setUint16(4, 20, true);
    lv.setUint16(6, 0x0800, true);
    lv.setUint16(8, 0, true);
    lv.setUint16(10, dosTime, true);
    lv.setUint16(12, dosDate, true);
    lv.setUint32(14, crc, true);
    lv.setUint32(18, data.length, true);
    lv.setUint32(22, data.length, true);
    lv.setUint16(26, name.length, true);
    lv.setUint16(28, 0, true);
    local.set(name, 30);

    const entry = new Uint8Array(46 + name.length);
    const cv = new DataView(entry.buffer);
    cv.setUint32(0, 0x02014b50, true);
    cv.setUint16(4, 20, true);
    cv.setUint16(6, 20, true);
    cv.setUint16(8, 0x0800, true);
    cv.setUint16(10, 0, true);
    cv.setUint16(12, dosTime, true);
    cv.setUint16(14, dosDate, true);
    cv.setUint32(16, crc, true);
    cv.setUint32(20, data.length, true);
    cv.setUint32(24, data.length, true);
    cv.setUint16(28, name.length, true);
    cv.setUint32(42, offset, true);
    entry.set(name, 46);

    parts.push(local, data);
    central.push(entry);
    offset += local.length + data.length;
  });

  const centralSize = central.reduce((sum, entry) => sum + entry.length, 0);
  const end = new Uint8Array(22);
  const ev = new DataView(end.buffer);
  ev.setUint32(0, 0x06054b50, true);
  ev.setUint16(8, files.length, true);
  ev.setUint16(10, files.length, true);
  ev.setUint32(12, centralSize, true);
  ev.setUint32(16, offset, true);

  return new Blob([...parts, ...central, end], { type: XLSX_MIME });
}

/* ───────────────────────── XLSX ───────────────────────── */
const xmlEscape = (value) => String(value ?? "")
  // eslint-disable-next-line no-control-regex
  .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, "")
  .replace(/&/g, "&amp;")
  .replace(/</g, "&lt;")
  .replace(/>/g, "&gt;")
  .replace(/"/g, "&quot;");

function colName(index) {
  let name = "";
  let n = index + 1;
  while (n > 0) {
    const rem = (n - 1) % 26;
    name = String.fromCharCode(65 + rem) + name;
    n = Math.floor((n - 1) / 26);
  }
  return name;
}

/* Estilos (índices de cellXfs en styles.xml) */
const S = { DEFAULT: 0, HEADER: 1, MONEY: 2, TEXT: 3, TITLE: 4, LABEL: 5, MONEY_TOTAL: 6, INT: 7, TOTAL_LABEL: 8, INT_TOTAL: 9 };

const text = (value, style = S.DEFAULT) => ({ t: "s", v: value, s: style });
const num = (value, style = S.DEFAULT) => ({ t: "n", v: Number(value) || 0, s: style });

function sheetXml(rows, widths) {
  const cols = widths.map((w, i) => `<col min="${i + 1}" max="${i + 1}" width="${w}" customWidth="1"/>`).join("");

  const body = rows.map((row, r) => {
    const cells = row.map((cell, c) => {
      if (cell === null || cell === undefined) return "";
      const item = typeof cell === "object" ? cell : (typeof cell === "number" ? num(cell) : text(cell));
      const ref = `${colName(c)}${r + 1}`;
      if (item.t === "n") return `<c r="${ref}" s="${item.s}"><v>${item.v}</v></c>`;
      return `<c r="${ref}" s="${item.s}" t="inlineStr"><is><t xml:space="preserve">${xmlEscape(item.v)}</t></is></c>`;
    }).join("");
    return `<row r="${r + 1}">${cells}</row>`;
  }).join("");

  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>`
    + `<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><cols>${cols}</cols><sheetData>${body}</sheetData></worksheet>`;
}

const STYLES_XML = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
<numFmts count="1"><numFmt numFmtId="164" formatCode="&quot;RD$&quot;\\ #,##0.00"/></numFmts>
<fonts count="4">
<font><sz val="11"/><name val="Calibri"/></font>
<font><b/><sz val="11"/><color rgb="FFFFFFFF"/><name val="Calibri"/></font>
<font><b/><sz val="15"/><color rgb="FF3F54C8"/><name val="Calibri"/></font>
<font><b/><sz val="11"/><name val="Calibri"/></font>
</fonts>
<fills count="4">
<fill><patternFill patternType="none"/></fill>
<fill><patternFill patternType="gray125"/></fill>
<fill><patternFill patternType="solid"><fgColor rgb="FF5269DF"/><bgColor indexed="64"/></patternFill></fill>
<fill><patternFill patternType="solid"><fgColor rgb="FFEEF1FD"/><bgColor indexed="64"/></patternFill></fill>
</fills>
<borders count="2">
<border><left/><right/><top/><bottom/><diagonal/></border>
<border><left style="thin"><color rgb="FFD9DEE8"/></left><right style="thin"><color rgb="FFD9DEE8"/></right><top style="thin"><color rgb="FFD9DEE8"/></top><bottom style="thin"><color rgb="FFD9DEE8"/></bottom><diagonal/></border>
</borders>
<cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs>
<cellXfs count="10">
<xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/>
<xf numFmtId="0" fontId="1" fillId="2" borderId="1" xfId="0" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment horizontal="center" vertical="center"/></xf>
<xf numFmtId="164" fontId="0" fillId="0" borderId="1" xfId="0" applyNumberFormat="1" applyBorder="1"/>
<xf numFmtId="0" fontId="0" fillId="0" borderId="1" xfId="0" applyBorder="1"/>
<xf numFmtId="0" fontId="2" fillId="0" borderId="0" xfId="0" applyFont="1"/>
<xf numFmtId="0" fontId="3" fillId="0" borderId="0" xfId="0" applyFont="1"/>
<xf numFmtId="164" fontId="3" fillId="3" borderId="1" xfId="0" applyNumberFormat="1" applyFont="1" applyFill="1" applyBorder="1"/>
<xf numFmtId="1" fontId="0" fillId="0" borderId="1" xfId="0" applyNumberFormat="1" applyBorder="1"/>
<xf numFmtId="0" fontId="3" fillId="3" borderId="1" xfId="0" applyFont="1" applyFill="1" applyBorder="1"/>
<xf numFmtId="1" fontId="3" fillId="3" borderId="1" xfId="0" applyNumberFormat="1" applyFont="1" applyFill="1" applyBorder="1"/>
</cellXfs>
<cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles>
</styleSheet>`;

/** Productos vendidos agregados por nombre. */
function aggregateProducts(sales) {
  const map = new Map();
  sales.forEach((sale) => sale.items.forEach((item) => {
    const entry = map.get(item.productName) || { name: item.productName, quantity: 0, amount: 0 };
    entry.quantity += item.quantity;
    entry.amount += item.lineTotal;
    map.set(item.productName, entry);
  }));
  return [...map.values()].sort((a, b) => b.amount - a.amount);
}

export function buildSalesXlsx({ report, rangeLabel, generatedAt, formatDateTime }) {
  const sales = report.sales;
  const qty = (sale) => sale.items.reduce((sum, item) => sum + item.quantity, 0);

  const header = ["ID", "Fecha", "Productos (cant.)", "Subtotal", "ITBIS", "Total", "Usuario"].map((h) => text(h, S.HEADER));
  const rows = [
    [text(`${BRAND} — Reporte de ventas`, S.TITLE)],
    [text("Período:", S.LABEL), text(rangeLabel)],
    [text("Generado:", S.LABEL), text(generatedAt)],
    [],
    [text("Total de ventas", S.LABEL), num(report.totalSales, S.MONEY_TOTAL)],
    [text("Transacciones", S.LABEL), num(report.transactions, S.INT_TOTAL)],
    [text("Promedio por venta", S.LABEL), num(report.averageTicket, S.MONEY_TOTAL)],
    [],
    header
  ];

  sales.forEach((sale) => rows.push([
    num(sale.id, S.INT),
    text(formatDateTime(sale.createdAt), S.TEXT),
    num(qty(sale), S.INT),
    num(sale.subtotal, S.MONEY),
    num(sale.tax, S.MONEY),
    num(sale.total, S.MONEY),
    text(`Usuario #${sale.userId}`, S.TEXT)
  ]));

  if (sales.length === 0) {
    rows.push([text("No existen ventas en el período seleccionado.", S.TEXT)]);
  } else {
    rows.push([
      text("TOTAL", S.TOTAL_LABEL), text("", S.TOTAL_LABEL),
      num(sales.reduce((sum, sale) => sum + qty(sale), 0), S.INT_TOTAL),
      num(sales.reduce((sum, sale) => sum + sale.subtotal, 0), S.MONEY_TOTAL),
      num(sales.reduce((sum, sale) => sum + sale.tax, 0), S.MONEY_TOTAL),
      num(sales.reduce((sum, sale) => sum + sale.total, 0), S.MONEY_TOTAL),
      text("", S.TOTAL_LABEL)
    ]);
  }

  const products = aggregateProducts(sales);
  const productRows = [[text("Producto", S.HEADER), text("Cantidad vendida", S.HEADER), text("Importe", S.HEADER)]];
  products.forEach((p) => productRows.push([text(p.name, S.TEXT), num(p.quantity, S.INT), num(p.amount, S.MONEY)]));
  if (products.length === 0) productRows.push([text("Sin productos vendidos en el período.", S.TEXT)]);

  const files = [
    { name: "[Content_Types].xml", xml: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/><Override PartName="/xl/worksheets/sheet2.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/><Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/></Types>` },
    { name: "_rels/.rels", xml: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>` },
    { name: "xl/workbook.xml", xml: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets><sheet name="Ventas" sheetId="1" r:id="rId1"/><sheet name="Productos vendidos" sheetId="2" r:id="rId2"/></sheets></workbook>` },
    { name: "xl/_rels/workbook.xml.rels", xml: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet2.xml"/><Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>` },
    { name: "xl/styles.xml", xml: STYLES_XML },
    { name: "xl/worksheets/sheet1.xml", xml: sheetXml(rows, [18, 20, 18, 18, 16, 18, 16]) },
    { name: "xl/worksheets/sheet2.xml", xml: sheetXml(productRows, [38, 18, 18]) }
  ].map((file) => ({ name: file.name, data: utf8.encode(file.xml) }));

  return zipStore(files);
}

/* ───────────────────────── PDF ───────────────────────── */
const PAGE = { w: 595.28, h: 841.89, margin: 40 };

/* Anchos de Helvetica (AFM) para caracteres 32..126, en milésimas de em. */
const HELV = [278, 278, 355, 556, 556, 889, 667, 191, 333, 333, 389, 584, 278, 333, 278, 278,
  556, 556, 556, 556, 556, 556, 556, 556, 556, 556, 278, 278, 584, 584, 584, 556,
  1015, 667, 667, 722, 722, 667, 611, 778, 722, 278, 500, 667, 556, 833, 722, 778,
  667, 778, 722, 667, 611, 722, 667, 944, 667, 667, 611, 278, 278, 278, 469, 556,
  333, 556, 556, 500, 556, 556, 278, 556, 556, 222, 222, 500, 222, 833, 556, 556,
  556, 556, 333, 500, 278, 556, 500, 722, 500, 500, 500, 334, 260, 334, 584];

/* Convierte a texto compatible con WinAnsi (Latin-1) para las fuentes estándar del PDF. */
function toLatin1(value) {
  return String(value ?? "")
    .replace(/→/g, "-")
    .replace(/[–—]/g, "-")
    .replace(/[“”]/g, '"')
    .replace(/[‘’]/g, "'")
    .replace(/\u202f|\u2009/g, " ")
    .replace(/[^\x20-\x7E\xA0-\xFF]/g, "?");
}

function textWidth(value, size, bold = false) {
  let units = 0;
  for (const ch of toLatin1(value)) {
    const code = ch.charCodeAt(0);
    units += code >= 32 && code <= 126 ? HELV[code - 32] : 556;
  }
  return (units / 1000) * size * (bold ? 1.07 : 1);
}

function fit(value, maxWidth, size, bold) {
  let out = toLatin1(value);
  if (textWidth(out, size, bold) <= maxWidth) return out;
  while (out.length > 1 && textWidth(`${out}...`, size, bold) > maxWidth) out = out.slice(0, -1);
  return `${out}...`;
}

const pdfEscape = (value) => toLatin1(value).replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
const rgb = (hex) => [1, 3, 5].map((i) => (parseInt(hex.slice(i, i + 2), 16) / 255).toFixed(3)).join(" ");
const n2 = (value) => Number(value).toFixed(2);

class PdfPage {
  constructor() { this.ops = []; }

  rect(x, yTop, w, h, color) {
    this.ops.push(`${rgb(color)} rg ${n2(x)} ${n2(PAGE.h - yTop - h)} ${n2(w)} ${n2(h)} re f`);
  }

  line(x1, y1, x2, y2, color, width = 0.6) {
    this.ops.push(`${rgb(color)} RG ${width} w ${n2(x1)} ${n2(PAGE.h - y1)} m ${n2(x2)} ${n2(PAGE.h - y2)} l S`);
  }

  text(x, yTop, value, { size = 9, bold = false, color = "#1f2937" } = {}) {
    this.ops.push(`BT /${bold ? "F2" : "F1"} ${size} Tf ${rgb(color)} rg ${n2(x)} ${n2(PAGE.h - yTop)} Td (${pdfEscape(value)}) Tj ET`);
  }
}

export function buildSalesPdf({ report, rangeLabel, generatedAt, formatDateTime, formatCurrency }) {
  const sales = report.sales;
  const columns = [
    { title: "ID", w: 40, align: "left" },
    { title: "Fecha", w: 105, align: "left" },
    { title: "Productos", w: 62, align: "right" },
    { title: "Subtotal", w: 80, align: "right" },
    { title: "ITBIS", w: 70, align: "right" },
    { title: "Total", w: 85, align: "right" },
    { title: "Usuario", w: 73, align: "left" }
  ];
  const tableWidth = columns.reduce((sum, c) => sum + c.w, 0);
  const rowH = 20;
  const pages = [];
  let page;
  let y;

  const drawTableHeader = () => {
    page.rect(PAGE.margin, y, tableWidth, rowH, "#5269DF");
    let x = PAGE.margin;
    columns.forEach((col) => {
      const tx = col.align === "right" ? x + col.w - 8 - textWidth(col.title, 9, true) : x + 8;
      page.text(tx, y + 13.5, col.title, { size: 9, bold: true, color: "#ffffff" });
      x += col.w;
    });
    y += rowH;
  };

  const newPage = (first) => {
    page = new PdfPage();
    pages.push(page);
    if (first) {
      page.rect(0, 0, PAGE.w, 92, "#5269DF");
      page.rect(0, 92, PAGE.w, 4, "#F2A93B");
      page.text(PAGE.margin, 44, BRAND, { size: 22, bold: true, color: "#ffffff" });
      page.text(PAGE.margin, 64, "Reporte de ventas", { size: 12, color: "#E5EAFF" });
      const meta = `Período: ${rangeLabel}`;
      page.text(PAGE.w - PAGE.margin - textWidth(meta, 9), 44, meta, { size: 9, color: "#ffffff" });
      const gen = `Generado: ${generatedAt}`;
      page.text(PAGE.w - PAGE.margin - textWidth(gen, 9), 60, gen, { size: 9, color: "#E5EAFF" });

      const cards = [
        ["Total de ventas", formatCurrency(report.totalSales)],
        ["Transacciones", String(report.transactions)],
        ["Promedio por venta", formatCurrency(report.averageTicket)]
      ];
      const gap = 12;
      const cardW = (PAGE.w - PAGE.margin * 2 - gap * 2) / 3;
      cards.forEach(([label, value], i) => {
        const cx = PAGE.margin + i * (cardW + gap);
        page.rect(cx, 116, cardW, 56, "#F3F5FF");
        page.rect(cx, 116, 4, 56, "#5269DF");
        page.text(cx + 14, 136, label.toUpperCase(), { size: 7.5, bold: true, color: "#6b7280" });
        page.text(cx + 14, 160, value, { size: 15, bold: true, color: "#1f2a6b" });
      });
      y = 196;
    } else {
      page.text(PAGE.margin, 50, `${BRAND} — Reporte de ventas`, { size: 11, bold: true, color: "#3F54C8" });
      page.line(PAGE.margin, 58, PAGE.w - PAGE.margin, 58, "#D9DEE8");
      y = 74;
    }
    drawTableHeader();
  };

  const bottomLimit = PAGE.h - 56;
  newPage(true);

  const drawRow = (cells, { zebra = false, bold = false, fill = null } = {}) => {
    if (y + rowH > bottomLimit) newPage(false);
    if (fill) page.rect(PAGE.margin, y, tableWidth, rowH, fill);
    else if (zebra) page.rect(PAGE.margin, y, tableWidth, rowH, "#F8F9FD");
    let x = PAGE.margin;
    columns.forEach((col, i) => {
      const value = fit(cells[i], col.w - 16, 9, bold);
      const tx = col.align === "right" ? x + col.w - 8 - textWidth(value, 9, bold) : x + 8;
      page.text(tx, y + 13.5, value, { size: 9, bold });
      x += col.w;
    });
    page.line(PAGE.margin, y + rowH, PAGE.margin + tableWidth, y + rowH, "#E6E9F2", 0.5);
    y += rowH;
  };

  if (sales.length === 0) {
    if (y + 40 > bottomLimit) newPage(false);
    page.text(PAGE.margin + 8, y + 26, "No existen ventas en el período seleccionado.", { size: 10, color: "#6b7280" });
  } else {
    sales.forEach((sale, index) => {
      const quantity = sale.items.reduce((sum, item) => sum + item.quantity, 0);
      drawRow([
        `#${sale.id}`, formatDateTime(sale.createdAt), String(quantity),
        formatCurrency(sale.subtotal), formatCurrency(sale.tax), formatCurrency(sale.total), `Usuario #${sale.userId}`
      ], { zebra: index % 2 === 1 });
    });
    drawRow([
      "", "TOTAL", String(sales.reduce((sum, sale) => sum + sale.items.reduce((s, i) => s + i.quantity, 0), 0)),
      formatCurrency(sales.reduce((sum, sale) => sum + sale.subtotal, 0)),
      formatCurrency(sales.reduce((sum, sale) => sum + sale.tax, 0)),
      formatCurrency(sales.reduce((sum, sale) => sum + sale.total, 0)), ""
    ], { bold: true, fill: "#EEF1FD" });
  }

  /* Pie de página con numeración */
  pages.forEach((p, i) => {
    p.line(PAGE.margin, PAGE.h - 40, PAGE.w - PAGE.margin, PAGE.h - 40, "#D9DEE8");
    p.text(PAGE.margin, PAGE.h - 26, `${BRAND} — documento generado automáticamente`, { size: 8, color: "#9ca3af" });
    const label = `Página ${i + 1} de ${pages.length}`;
    p.text(PAGE.w - PAGE.margin - textWidth(label, 8), PAGE.h - 26, label, { size: 8, color: "#9ca3af" });
  });

  /* Ensamblado del archivo PDF (todo en Latin-1: 1 carácter = 1 byte) */
  const objects = [];
  const add = (body) => { objects.push(body); return objects.length; };

  add("<< /Type /Catalog /Pages 2 0 R >>");
  add("");
  add("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>");
  add("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>");

  const kids = [];
  pages.forEach((p) => {
    const stream = p.ops.join("\n");
    const contentId = add(`<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`);
    const pageId = add(`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${n2(PAGE.w)} ${n2(PAGE.h)}] /Resources << /Font << /F1 3 0 R /F2 4 0 R >> >> /Contents ${contentId} 0 R >>`);
    kids.push(`${pageId} 0 R`);
  });
  objects[1] = `<< /Type /Pages /Kids [${kids.join(" ")}] /Count ${pages.length} >>`;

  let pdf = "%PDF-1.4\n";
  const offsets = [];
  objects.forEach((body, i) => {
    offsets.push(pdf.length);
    pdf += `${i + 1} 0 obj\n${body}\nendobj\n`;
  });
  const xref = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  offsets.forEach((offset) => { pdf += `${String(offset).padStart(10, "0")} 00000 n \n`; });
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`;

  const bytes = new Uint8Array(pdf.length);
  for (let i = 0; i < pdf.length; i++) bytes[i] = pdf.charCodeAt(i) & 0xff;
  return new Blob([bytes], { type: "application/pdf" });
}
