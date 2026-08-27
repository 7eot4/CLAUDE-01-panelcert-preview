// Generates the real PanelCert product files (.xlsx) sold to customers.
// Run with: node scripts/generate-toolkit.mjs
// Output goes to private-assets/ — never commit these into public/.
import ExcelJS from "exceljs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_DIR = path.join(__dirname, "..", "private-assets");

const BRAND = { name: "PanelCert", primary: "0F172A", accent: "2563EB", light: "F1F5F9" };

function styleTitle(ws, title, subtitle) {
  ws.mergeCells("A1:H1");
  const titleCell = ws.getCell("A1");
  titleCell.value = title;
  titleCell.font = { bold: true, size: 16, color: { argb: "FFFFFFFF" } };
  titleCell.alignment = { vertical: "middle" };
  titleCell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: `FF${BRAND.primary}` } };
  ws.getRow(1).height = 28;

  ws.mergeCells("A2:H2");
  const subCell = ws.getCell("A2");
  subCell.value = subtitle;
  subCell.font = { italic: true, size: 10, color: { argb: "FF475569" } };
  ws.getRow(2).height = 18;
}

function projectInfoBlock(ws, startRow) {
  const fields = ["Project:", "Client:", "Location:", "Prepared by:", "Date:"];
  fields.forEach((label, i) => {
    const row = startRow + i;
    ws.getCell(`A${row}`).value = label;
    ws.getCell(`A${row}`).font = { bold: true };
    ws.mergeCells(`B${row}:D${row}`);
    ws.getCell(`B${row}`).border = { bottom: { style: "thin" } };
  });
  return startRow + fields.length + 1;
}

function tableHeader(ws, row, columns) {
  columns.forEach((col, i) => {
    const cell = ws.getRow(row).getCell(i + 1);
    cell.value = col;
    cell.font = { bold: true, color: { argb: "FFFFFFFF" } };
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: `FF${BRAND.accent}` } };
    cell.alignment = { vertical: "middle", horizontal: "center", wrapText: true };
    cell.border = {
      top: { style: "thin" },
      bottom: { style: "thin" },
      left: { style: "thin" },
      right: { style: "thin" },
    };
  });
  ws.getRow(row).height = 32;
}

function bodyRows(ws, startRow, count, colCount) {
  for (let r = 0; r < count; r++) {
    for (let c = 1; c <= colCount; c++) {
      const cell = ws.getRow(startRow + r).getCell(c);
      cell.border = {
        top: { style: "hair" },
        bottom: { style: "hair" },
        left: { style: "hair" },
        right: { style: "hair" },
      };
      if (r % 2 === 1) {
        cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: `FF${BRAND.light}` } };
      }
    }
  }
}

function signoffBlock(ws, startRow) {
  ws.getCell(`A${startRow}`).value = "Sign-off";
  ws.getCell(`A${startRow}`).font = { bold: true, size: 12 };

  const rows = [
    ["Tested by (name / signature):", "Date:"],
    ["Witnessed by (name / signature):", "Date:"],
    ["Accepted by (client, name / signature):", "Date:"],
  ];
  rows.forEach((pair, i) => {
    const row = startRow + 2 + i;
    ws.getCell(`A${row}`).value = pair[0];
    ws.mergeCells(`B${row}:D${row}`);
    ws.getCell(`B${row}`).border = { bottom: { style: "thin" } };
    ws.getCell(`E${row}`).value = pair[1];
    ws.mergeCells(`F${row}:H${row}`);
    ws.getCell(`F${row}`).border = { bottom: { style: "thin" } };
  });
}

function setColumnWidths(ws, widths) {
  widths.forEach((w, i) => {
    ws.getColumn(i + 1).width = w;
  });
}

function buildFatSheet(wb) {
  const ws = wb.addWorksheet("FAT Checklist");
  styleTitle(ws, "Factory Acceptance Test (FAT) Checklist", "Panel-by-panel sign-off before shipment");
  setColumnWidths(ws, [30, 12, 12, 30, 12, 25]);
  let row = projectInfoBlock(ws, 4);
  row += 1;

  const cols = ["Check item", "Pass", "Fail", "Notes / deviation", "Ref. drawing", "Checked by"];
  tableHeader(ws, row, cols);
  const items = [
    "Enclosure IP rating matches spec",
    "Nameplate / labeling correct and legible",
    "Component list matches BOM",
    "Wiring matches schematic (point-to-point)",
    "Terminal torque per manufacturer spec",
    "Wire numbering / ferrules present and correct",
    "Earthing / bonding continuity verified",
    "Insulation resistance test passed (see IR log)",
    "Breaker / fuse ratings match schedule",
    "I/O points verified against I/O list",
    "HMI / PLC firmware & program version confirmed",
    "Functional test: normal operation sequence",
    "Functional test: alarm / fault simulation",
    "Functional test: E-stop and safety circuits",
    "Door interlocks / mechanical safety verified",
    "Documentation package complete (as-built, manuals)",
    "Cleanliness / no debris in enclosure",
    "Packaging / shipping preparation adequate",
  ];
  bodyRows(ws, row + 1, items.length, cols.length);
  items.forEach((item, i) => {
    ws.getRow(row + 1 + i).getCell(1).value = item;
  });

  signoffBlock(ws, row + 1 + items.length + 2);
  ws.pageSetup = { fitToPage: true, fitToWidth: 1, orientation: "landscape" };
}

function buildSatSheet(wb) {
  const ws = wb.addWorksheet("SAT Checklist");
  styleTitle(ws, "Site Acceptance Test (SAT) Checklist", "On-site commissioning before handover");
  setColumnWidths(ws, [30, 12, 12, 30, 12, 25]);
  let row = projectInfoBlock(ws, 4);
  row += 1;

  const cols = ["Check item", "Pass", "Fail", "Notes / deviation", "Ref. drawing", "Checked by"];
  tableHeader(ws, row, cols);
  const items = [
    "Physical installation matches layout drawing",
    "Cable routing / support / labeling per spec",
    "Field wiring termination points re-checked",
    "Earthing / grounding system verified on site",
    "Power-up sequence followed and logged",
    "Voltage / phase rotation confirmed",
    "Loop checks: field device to controller",
    "Instrument calibration verified / certificates on file",
    "Interlocks and permissives tested",
    "Safety circuits (E-stop, guards) tested on site",
    "Alarm and event logging verified",
    "Communication network / fieldbus verified",
    "Performance test under normal load",
    "Performance test under upset / edge conditions",
    "Operator training completed",
    "Punch list items reviewed with client",
    "As-built documentation handed over",
    "Spare parts / recommended spares list provided",
  ];
  bodyRows(ws, row + 1, items.length, cols.length);
  items.forEach((item, i) => {
    ws.getRow(row + 1 + i).getCell(1).value = item;
  });

  signoffBlock(ws, row + 1 + items.length + 2);
  ws.pageSetup = { fitToPage: true, fitToWidth: 1, orientation: "landscape" };
}

function buildCommissioningReportSheet(wb) {
  const ws = wb.addWorksheet("Commissioning Report");
  styleTitle(ws, "Commissioning Test Report", "Formal handover summary and acceptance record");
  setColumnWidths(ws, [26, 20, 20, 20, 20, 20]);
  let row = projectInfoBlock(ws, 4);
  row += 1;

  ws.getCell(`A${row}`).value = "Scope summary";
  ws.getCell(`A${row}`).font = { bold: true, size: 12 };
  row += 1;
  ws.mergeCells(`A${row}:F${row + 2}`);
  ws.getCell(`A${row}`).alignment = { wrapText: true, vertical: "top" };
  ws.getCell(`A${row}`).value =
    "Describe the system(s) commissioned, boundaries of work, and reference documents (P&IDs, single-line diagrams, functional spec).";
  ws.getCell(`A${row}`).border = { top: { style: "thin" }, bottom: { style: "thin" }, left: { style: "thin" }, right: { style: "thin" } };
  row += 4;

  const cols = ["Test / system", "Reference doc", "Result", "Deviation raised?", "Corrective action", "Closed out?"];
  tableHeader(ws, row, cols);
  const items = [
    "FAT (see FAT Checklist tab)",
    "SAT (see SAT Checklist tab)",
    "Insulation resistance (see IR Test Log tab)",
    "Cable / termination verification (see Cable Schedule tab)",
    "Safety systems / interlocks",
    "Performance / capacity test",
  ];
  bodyRows(ws, row + 1, items.length, cols.length);
  items.forEach((item, i) => {
    ws.getRow(row + 1 + i).getCell(1).value = item;
  });

  const summaryRow = row + 1 + items.length + 2;
  ws.getCell(`A${summaryRow}`).value = "Overall acceptance status:";
  ws.getCell(`A${summaryRow}`).font = { bold: true };
  ws.mergeCells(`B${summaryRow}:D${summaryRow}`);
  ws.getCell(`B${summaryRow}`).value = "Accepted / Accepted with punch list / Not accepted";
  ws.getCell(`B${summaryRow}`).font = { italic: true, color: { argb: "FF64748B" } };

  signoffBlock(ws, summaryRow + 2);
  ws.pageSetup = { fitToPage: true, fitToWidth: 1, orientation: "landscape" };
}

function buildCableScheduleSheet(wb) {
  const ws = wb.addWorksheet("Cable Schedule");
  styleTitle(ws, "Cable & Termination Schedule", "Register every cable once — track it to closeout");
  setColumnWidths(ws, [12, 22, 22, 10, 14, 14, 14, 20]);
  const row = 4;
  const cols = ["Cable ID", "From (equipment/terminal)", "To (equipment/terminal)", "Cores", "Type / size", "Gland fitted?", "Tested?", "Notes"];
  tableHeader(ws, row, cols);
  bodyRows(ws, row + 1, 40, cols.length);
  ws.pageSetup = { fitToPage: true, fitToWidth: 1, orientation: "landscape" };
}

function buildInsulationLogSheet(wb) {
  const ws = wb.addWorksheet("IR Test Log");
  styleTitle(ws, "Insulation Resistance (IR) Test Log", "Pre- and post-energization readings per circuit");
  setColumnWidths(ws, [14, 20, 12, 12, 14, 14, 12, 20]);
  let row = projectInfoBlock(ws, 4);
  ws.getCell(`A${row}`).value = "Test instrument:";
  ws.getCell(`A${row}`).font = { bold: true };
  ws.mergeCells(`B${row}:D${row}`);
  ws.getCell(`B${row}`).border = { bottom: { style: "thin" } };
  ws.getCell(`E${row}`).value = "Test voltage:";
  ws.getCell(`E${row}`).font = { bold: true };
  ws.mergeCells(`F${row}:H${row}`);
  ws.getCell(`F${row}`).border = { bottom: { style: "thin" } };
  row += 2;

  const cols = ["Circuit ID", "Description", "L-L (MΩ)", "L-N (MΩ)", "L-E (MΩ)", "N-E (MΩ)", "Pass/Fail", "Tested by"];
  tableHeader(ws, row, cols);
  bodyRows(ws, row + 1, 30, cols.length);
  ws.pageSetup = { fitToPage: true, fitToWidth: 1, orientation: "landscape" };
}

function buildLotoSheet(wb) {
  const ws = wb.addWorksheet("LOTO Tag Log");
  styleTitle(ws, "LOTO (Lockout / Tagout) Tag Log", "Isolation point register — audit-ready");
  setColumnWidths(ws, [12, 24, 20, 14, 20, 14, 20]);
  const row = 4;
  const cols = ["Tag #", "Isolation point / device", "Energy source", "Applied by", "Verified by (2nd person)", "Removed by", "Date/time removed"];
  tableHeader(ws, row, cols);
  bodyRows(ws, row + 1, 30, cols.length);
  ws.pageSetup = { fitToPage: true, fitToWidth: 1, orientation: "landscape" };
}

function buildPunchListSheet(wb) {
  const ws = wb.addWorksheet("Punch List");
  styleTitle(ws, "Punch List / Snag List Tracker", "Open items from FAT/SAT through closeout");
  setColumnWidths(ws, [8, 24, 24, 12, 16, 14, 12]);
  const row = 4;
  const cols = ["#", "Area / panel", "Description", "Severity", "Responsible", "Target date", "Closed?"];
  tableHeader(ws, row, cols);
  bodyRows(ws, row + 1, 35, cols.length);
  ws.getColumn(1).alignment = { horizontal: "center" };
  ws.pageSetup = { fitToPage: true, fitToWidth: 1, orientation: "landscape" };
}

function buildInstructionsSheet(wb, includedSheets) {
  const ws = wb.addWorksheet("Read Me", { properties: { tabColor: { argb: `FF${BRAND.accent}` } } });
  ws.mergeCells("A1:F1");
  const title = ws.getCell("A1");
  title.value = `${BRAND.name} Commissioning Toolkit`;
  title.font = { bold: true, size: 18, color: { argb: `FF${BRAND.primary}` } };
  ws.getRow(1).height = 30;

  ws.mergeCells("A2:F2");
  ws.getCell("A2").value = "Editable Excel workbook. Duplicate the tabs you need per project — keep one workbook per job for a clean audit trail.";
  ws.getCell("A2").font = { italic: true, color: { argb: "FF475569" } };

  ws.getCell("A4").value = "Included in this workbook:";
  ws.getCell("A4").font = { bold: true };
  includedSheets.forEach((name, i) => {
    ws.getCell(`A${5 + i}`).value = `• ${name}`;
  });

  const tipsRow = 5 + includedSheets.length + 1;
  ws.getCell(`A${tipsRow}`).value = "Tips:";
  ws.getCell(`A${tipsRow}`).font = { bold: true };
  const tips = [
    "Fill in the project info block at the top of each sheet first.",
    "Pass/Fail columns: use data validation (Data > Data Validation > List) if you want dropdowns.",
    "Duplicate a tab (right-click > Move or Copy > Create a copy) to keep a template clean for the next job.",
    "Questions or an issue with the file? Reply to your order confirmation email.",
  ];
  tips.forEach((tip, i) => {
    ws.getCell(`A${tipsRow + 1 + i}`).value = `- ${tip}`;
  });

  setColumnWidths(ws, [90, 12, 12, 12, 12, 12]);
}

async function buildWorkbook(sheetBuilders, filename) {
  const wb = new ExcelJS.Workbook();
  wb.creator = BRAND.name;
  wb.created = new Date();

  const sheetNames = {
    fat: "FAT Checklist",
    sat: "SAT Checklist",
    report: "Commissioning Report",
    cable: "Cable & Termination Schedule",
    ir: "Insulation Resistance (IR) Test Log",
    loto: "LOTO Tag Log",
    punch: "Punch List / Snag List Tracker",
  };
  buildInstructionsSheet(wb, sheetBuilders.map((k) => sheetNames[k]));

  const builders = {
    fat: buildFatSheet,
    sat: buildSatSheet,
    report: buildCommissioningReportSheet,
    cable: buildCableScheduleSheet,
    ir: buildInsulationLogSheet,
    loto: buildLotoSheet,
    punch: buildPunchListSheet,
  };
  sheetBuilders.forEach((key) => builders[key](wb));

  const outPath = path.join(OUT_DIR, filename);
  await wb.xlsx.writeFile(outPath);
  console.log(`Wrote ${outPath}`);
}

await buildWorkbook(["fat", "sat", "report"], "panelcert-starter.xlsx");
await buildWorkbook(["fat", "sat", "report", "cable", "ir", "loto", "punch"], "panelcert-complete.xlsx");
