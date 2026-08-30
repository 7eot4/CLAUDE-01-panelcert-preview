// Generates the real PanelCert product files (.xlsx) sold to customers.
// Run with: node scripts/generate-toolkit.mjs
// Output goes to private-assets/ — never commit these into public/.
//
// Design intent: this is the paid deliverable, so every sheet must be usable
// straight out of the download — dropdowns already wired, project data entered
// once and referenced everywhere, print setup done, and the numeric sheets
// (IR, punch list) doing their own arithmetic. A buyer should not have to
// "finish building" the template they just paid for.
import ExcelJS from "exceljs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_DIR = path.join(__dirname, "..", "private-assets");

const PRODUCT_VERSION = "1.1";
const PRODUCT_YEAR = new Date().getFullYear();

const BRAND = {
  name: "PanelCert",
  primary: "0F172A", // navy — sheet title bands
  accent: "2563EB", // blue — table headers
  light: "F1F5F9", // zebra striping
  band: "E2E8F0", // section band inside checklists
  muted: "64748B", // hint text
  border: "CBD5E1",
};

const STATE = {
  pass: { bg: "DCFCE7", text: "166534" },
  fail: { bg: "FEE2E2", text: "991B1B" },
  warn: { bg: "FEF3C7", text: "92400E" },
};

// The Project Data sheet is the single point of entry for job identification.
// Every other sheet pulls these by formula so nothing is retyped seven times.
const PD = {
  sheet: "Project Data",
  project: "$B$5",
  client: "$B$6",
  contractor: "$B$7",
  location: "$B$8",
  jobNo: "$B$9",
  system: "$B$10",
  docNo: "$B$11",
  revision: "$B$12",
};

const LIST = {
  result: '"Pass,Fail,N/A"',
  yesNo: '"Yes,No,N/A"',
  yesNoPending: '"Yes,No,Pending"',
  severity: '"A - Blocks handover,B - Fix before closeout,C - Minor / cosmetic"',
  punchStatus: '"Open,In progress,Ready for check,Closed"',
  acceptance: '"Accepted,Accepted with punch list,Not accepted"',
  energy: '"Electrical,Hydraulic,Pneumatic,Mechanical,Thermal,Chemical,Gravity,Stored energy"',
  testResult: '"Pass,Fail,Not required,Pending"',
};

const THIN = { style: "thin", color: { argb: `FF${BRAND.border}` } };
const HAIR = { style: "hair", color: { argb: `FF${BRAND.border}` } };
const boxThin = { top: THIN, bottom: THIN, left: THIN, right: THIN };
const boxHair = { top: HAIR, bottom: HAIR, left: HAIR, right: HAIR };

function setColumnWidths(ws, widths) {
  widths.forEach((w, i) => {
    ws.getColumn(i + 1).width = w;
  });
}

function colLetter(index) {
  let n = index;
  let s = "";
  while (n > 0) {
    const rem = (n - 1) % 26;
    s = String.fromCharCode(65 + rem) + s;
    n = Math.floor((n - 1) / 26);
  }
  return s;
}

function sheetTitle(ws, title, subtitle, lastCol) {
  const last = colLetter(lastCol);
  ws.mergeCells(`A1:${last}1`);
  const titleCell = ws.getCell("A1");
  titleCell.value = title;
  titleCell.font = { bold: true, size: 15, color: { argb: "FFFFFFFF" } };
  titleCell.alignment = { vertical: "middle", indent: 1 };
  titleCell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: `FF${BRAND.primary}` } };
  ws.getRow(1).height = 30;

  ws.mergeCells(`A2:${last}2`);
  const subCell = ws.getCell("A2");
  subCell.value = subtitle;
  subCell.font = { italic: true, size: 10, color: { argb: `FF${BRAND.muted}` } };
  subCell.alignment = { vertical: "middle", indent: 1 };
  ws.getRow(2).height = 18;
}

// Project header that reads from the Project Data sheet instead of asking the
// user to retype it. Left as live formulas so a late change to the job number
// propagates to every document in the workbook.
function linkedProjectHeader(ws, startRow, lastCol) {
  const last = colLetter(lastCol);
  const mid = Math.max(3, Math.ceil(lastCol / 2));
  const midLetter = colLetter(mid);
  const rightLabel = colLetter(mid + 1);
  const rightValue = colLetter(mid + 2);

  const pairs = [
    ["Project:", PD.project, "Job / contract no.:", PD.jobNo],
    ["Client:", PD.client, "System / package:", PD.system],
    ["Site / location:", PD.location, "Document no.:", PD.docNo],
    ["Contractor:", PD.contractor, "Revision:", PD.revision],
  ];

  pairs.forEach(([labelL, refL, labelR, refR], i) => {
    const row = startRow + i;
    ws.getCell(`A${row}`).value = labelL;
    ws.getCell(`A${row}`).font = { bold: true, size: 10 };
    ws.mergeCells(`B${row}:${midLetter}${row}`);
    ws.getCell(`B${row}`).value = { formula: `'${PD.sheet}'!${refL}` };
    ws.getCell(`B${row}`).border = { bottom: THIN };

    if (mid + 2 <= lastCol) {
      ws.getCell(`${rightLabel}${row}`).value = labelR;
      ws.getCell(`${rightLabel}${row}`).font = { bold: true, size: 10 };
      ws.mergeCells(`${rightValue}${row}:${last}${row}`);
      ws.getCell(`${rightValue}${row}`).value = { formula: `'${PD.sheet}'!${refR}` };
      ws.getCell(`${rightValue}${row}`).border = { bottom: THIN };
    }
  });

  const noteRow = startRow + pairs.length;
  ws.getCell(`A${noteRow}`).value = "Fields above are filled in automatically from the Project Data tab.";
  ws.getCell(`A${noteRow}`).font = { italic: true, size: 8, color: { argb: `FF${BRAND.muted}` } };

  return noteRow + 2;
}

function tableHeader(ws, row, columns) {
  columns.forEach((col, i) => {
    const cell = ws.getRow(row).getCell(i + 1);
    cell.value = col;
    cell.font = { bold: true, size: 10, color: { argb: "FFFFFFFF" } };
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: `FF${BRAND.accent}` } };
    cell.alignment = { vertical: "middle", horizontal: "center", wrapText: true };
    cell.border = boxThin;
  });
  ws.getRow(row).height = 30;
}

function styleBodyCell(cell, striped) {
  cell.border = boxHair;
  cell.alignment = { vertical: "top", wrapText: true };
  if (striped) {
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: `FF${BRAND.light}` } };
  }
}

function blankRegisterRows(ws, startRow, count, colCount) {
  for (let r = 0; r < count; r++) {
    const row = ws.getRow(startRow + r);
    row.height = 16;
    for (let c = 1; c <= colCount; c++) {
      styleBodyCell(row.getCell(c), r % 2 === 1);
    }
  }
}

function sectionBand(ws, row, text, colCount) {
  ws.mergeCells(`A${row}:${colLetter(colCount)}${row}`);
  const cell = ws.getCell(`A${row}`);
  cell.value = text;
  cell.font = { bold: true, size: 10, color: { argb: `FF${BRAND.primary}` } };
  cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: `FF${BRAND.band}` } };
  cell.alignment = { vertical: "middle", indent: 1 };
  cell.border = boxThin;
  ws.getRow(row).height = 20;
}

function signoffBlock(ws, startRow, lastCol) {
  const last = colLetter(lastCol);
  ws.mergeCells(`A${startRow}:${last}${startRow}`);
  const head = ws.getCell(`A${startRow}`);
  head.value = "Sign-off";
  head.font = { bold: true, size: 11, color: { argb: "FFFFFFFF" } };
  head.fill = { type: "pattern", pattern: "solid", fgColor: { argb: `FF${BRAND.primary}` } };
  head.alignment = { vertical: "middle", indent: 1 };
  ws.getRow(startRow).height = 22;

  const roles = [
    ["Tested by", "Name, company and signature of the person who performed the tests."],
    ["Witnessed by", "Third party or QA witness, where the contract requires one."],
    ["Accepted by (client)", "Client representative accepting the document."],
  ];

  const headerRow = startRow + 1;
  ["Role", "Name", "Company", "Signature", "Date"].forEach((label, i) => {
    const cell = ws.getRow(headerRow).getCell(i + 1);
    cell.value = label;
    cell.font = { bold: true, size: 9, color: { argb: `FF${BRAND.muted}` } };
    cell.border = { bottom: THIN };
  });

  roles.forEach(([role, hint], i) => {
    const row = headerRow + 1 + i;
    ws.getRow(row).height = 26;
    ws.getCell(`A${row}`).value = role;
    ws.getCell(`A${row}`).font = { bold: true, size: 10 };
    ws.getCell(`A${row}`).alignment = { vertical: "middle" };
    for (let c = 2; c <= 5; c++) {
      const cell = ws.getRow(row).getCell(c);
      cell.border = { bottom: THIN };
    }
    if (lastCol >= 6) {
      const note = ws.getRow(row).getCell(6);
      note.value = hint;
      note.font = { italic: true, size: 8, color: { argb: `FF${BRAND.muted}` } };
      note.alignment = { vertical: "middle", wrapText: true };
    }
  });

  return headerRow + 1 + roles.length;
}

function printSetup(ws, { titleRow, lastCol, lastRow, orientation = "landscape" }) {
  ws.pageSetup = {
    orientation,
    fitToPage: true,
    fitToWidth: 1,
    fitToHeight: 0,
    horizontalCentered: true,
    margins: { left: 0.4, right: 0.4, top: 0.5, bottom: 0.5, header: 0.3, footer: 0.3 },
    printArea: `A1:${colLetter(lastCol)}${lastRow}`,
  };
  if (titleRow) {
    ws.pageSetup.printTitlesRow = `${titleRow}:${titleRow}`;
  }
  ws.headerFooter = {
    oddFooter: `&L&9${BRAND.name} Commissioning Toolkit v${PRODUCT_VERSION}&C&9Page &P of &N&R&9&A`,
  };
}

function addValidation(ws, range, formula, prompt) {
  ws.dataValidations.add(range, {
    type: "list",
    allowBlank: true,
    formulae: [formula],
    showErrorMessage: true,
    errorStyle: "warning",
    errorTitle: "Value not in list",
    error: "Pick one of the listed values, or type your own if this job needs a different wording.",
    ...(prompt
      ? { showInputMessage: true, promptTitle: "How to fill this in", prompt }
      : {}),
  });
}

function conditionalPassFail(ws, range) {
  ws.addConditionalFormatting({
    ref: range,
    rules: [
      {
        type: "containsText",
        operator: "containsText",
        text: "Fail",
        priority: 1,
        style: {
          font: { bold: true, color: { argb: `FF${STATE.fail.text}` } },
          fill: { type: "pattern", pattern: "solid", bgColor: { argb: `FF${STATE.fail.bg}` } },
        },
      },
      {
        type: "containsText",
        operator: "containsText",
        text: "Pass",
        priority: 2,
        style: {
          font: { bold: true, color: { argb: `FF${STATE.pass.text}` } },
          fill: { type: "pattern", pattern: "solid", bgColor: { argb: `FF${STATE.pass.bg}` } },
        },
      },
    ],
  });
}

/* ------------------------------------------------------------------ */
/* Checklist sheets (FAT / SAT)                                        */
/* ------------------------------------------------------------------ */

// Columns shared by both acceptance-test checklists. "Guidance" is what turns
// a list of headings into something a less experienced technician can actually
// work from without a supervisor standing next to them.
const CHECK_COLS = [
  "#",
  "Check item",
  "Guidance / method",
  "Result",
  "Reading / value",
  "Notes, deviation or defect",
  "Ref. drawing / doc",
  "Punch #",
  "Checked by",
];
const CHECK_WIDTHS = [5, 38, 44, 10, 14, 34, 16, 8, 16];

function buildChecklistSheet(wb, { name, title, subtitle, sections }) {
  const ws = wb.addWorksheet(name, { properties: { defaultRowHeight: 15 } });
  const lastCol = CHECK_COLS.length;
  sheetTitle(ws, title, subtitle, lastCol);
  setColumnWidths(ws, CHECK_WIDTHS);

  let row = linkedProjectHeader(ws, 4, lastCol);
  const headerRow = row;
  tableHeader(ws, headerRow, CHECK_COLS);
  row += 1;

  const firstDataRow = row;
  const resultRanges = [];
  let itemNo = 0;
  let striped = false;

  sections.forEach((section) => {
    sectionBand(ws, row, section.title, lastCol);
    row += 1;
    const sectionStart = row;

    section.items.forEach(([item, guidance]) => {
      itemNo += 1;
      const r = ws.getRow(row);
      r.height = 28;
      for (let c = 1; c <= lastCol; c++) styleBodyCell(r.getCell(c), striped);
      r.getCell(1).value = itemNo;
      r.getCell(1).alignment = { vertical: "top", horizontal: "center" };
      r.getCell(2).value = item;
      r.getCell(3).value = guidance;
      r.getCell(3).font = { size: 9, color: { argb: `FF${BRAND.muted}` } };
      r.getCell(4).alignment = { vertical: "middle", horizontal: "center" };
      striped = !striped;
      row += 1;
    });

    resultRanges.push(`D${sectionStart}:D${row - 1}`);
  });

  const lastDataRow = row - 1;
  // Section band rows sit inside the block, so validation and highlighting are
  // applied per section rather than over the whole span. The COUNTIF summary can
  // safely use the whole span — band cells in column D are empty.
  const resultRange = `D${firstDataRow}:D${lastDataRow}`;
  resultRanges.forEach((range) => {
    addValidation(
      ws,
      range,
      LIST.result,
      "Pass, Fail or N/A. Anything marked Fail should get a punch list number in the Punch # column."
    );
    conditionalPassFail(ws, range);
  });

  // Summary strip — lets the lead see completion at a glance without counting rows.
  row += 1;
  const summaryRow = row;
  ws.getCell(`A${summaryRow}`).value = "Summary";
  ws.getCell(`A${summaryRow}`).font = { bold: true, size: 11 };
  ws.getCell(`B${summaryRow}`).value = { formula: `"Items: "&${itemNo}` };
  ws.getCell(`C${summaryRow}`).value = { formula: `"Pass: "&COUNTIF(${resultRange},"Pass")` };
  ws.getCell(`C${summaryRow}`).font = { bold: true, color: { argb: `FF${STATE.pass.text}` } };
  ws.getCell(`D${summaryRow}`).value = { formula: `"Fail: "&COUNTIF(${resultRange},"Fail")` };
  ws.getCell(`D${summaryRow}`).font = { bold: true, color: { argb: `FF${STATE.fail.text}` } };
  ws.getCell(`E${summaryRow}`).value = { formula: `"N/A: "&COUNTIF(${resultRange},"N/A")` };
  ws.getCell(`F${summaryRow}`).value = {
    formula: `"Outstanding: "&(${itemNo}-COUNTA(${resultRange}))`,
  };
  ws.getCell(`F${summaryRow}`).font = { bold: true };

  const signEnd = signoffBlock(ws, summaryRow + 2, lastCol);

  ws.views = [{ state: "frozen", xSplit: 2, ySplit: headerRow, activeCell: `B${firstDataRow}` }];
  printSetup(ws, { titleRow: headerRow, lastCol, lastRow: signEnd });

  return { headerRow, firstDataRow, lastDataRow, resultRange, itemCount: itemNo };
}

const FAT_SECTIONS = [
  {
    title: "1. Documentation and identification",
    items: [
      ["Approved drawing set available and at correct revision", "Check the revision block on each sheet against the transmittal — testing to a superseded drawing is the most common source of rework."],
      ["Bill of materials matches installed components", "Walk the BOM line by line; note substitutions and whether they were approved in writing."],
      ["Panel nameplate data matches order (voltage, current, IP, SCCR)", "Compare the rating plate against the purchase spec, not against the drawing alone."],
      ["Wiring diagram, I/O list and cable list issued for test", "You need all three to close out the checks below; missing one is itself a deviation."],
      ["Warning and arc-flash labels fitted where required by spec", "Confirm the label text and language required by the destination site."],
    ],
  },
  {
    title: "2. Enclosure and mechanical",
    items: [
      ["Enclosure type and IP / NEMA rating as specified", "Verify gaskets are continuous and undamaged; a correct rating plate on a damaged seal still fails."],
      ["Doors, locks, hinges and gland plates operate correctly", "Open and close every door fully; check nothing fouls internal components."],
      ["Component layout matches general arrangement drawing", "Deviations here affect maintenance access and future spares."],
      ["Ventilation, filters, heaters and thermostats fitted and set", "Record heater/thermostat setpoints in the reading column."],
      ["Segregation of power and signal wiring maintained", "Look for control and power cables sharing trunking without separation."],
      ["Free of swarf, drilling debris and packaging material", "Inspect the base of the enclosure and behind mounting plates."],
    ],
  },
  {
    title: "3. Power circuits and protection",
    items: [
      ["Incoming supply arrangement matches single-line diagram", "Confirm phases, neutral and earth arrangement, including any TN-S/TN-C-S requirement."],
      ["Protective device ratings and settings match the schedule", "Record actual settings applied, not the nominal rating, in the reading column."],
      ["Conductor sizes and colour coding match the schedule", "Any downsizing must be traced back to an approved change."],
      ["Terminal connections torqued to manufacturer specification", "Record the torque value used; mark terminals after torquing if the spec requires it."],
      ["Busbars, links and covers secure and shrouded", "Check live-part shrouding is refitted after test access."],
      ["Phase rotation / polarity verified at outgoing terminals", "Record the measured rotation in the reading column."],
    ],
  },
  {
    title: "4. Earthing, bonding and insulation",
    items: [
      ["Protective earth continuity verified to all metallic parts", "Test doors, gland plates and mounting plates individually; record the highest reading."],
      ["Earth bar sized, labelled and terminations secure", "Confirm one conductor per terminal unless the terminal is rated for more."],
      ["Insulation resistance test completed and recorded", "Record readings on the IR Test Log tab; disconnect or bypass electronics first."],
      ["Functional / clean earth separated where the design requires it", "Common on instrumentation and drive panels; verify against the design intent."],
    ],
  },
  {
    title: "5. Control circuits, I/O and configuration",
    items: [
      ["Control voltages present and within tolerance at all supplies", "Record measured values for each control supply rail."],
      ["Point-to-point wiring check completed against schematic", "Signed-off point-to-point is what makes later loop checks fast rather than exploratory."],
      ["Wire numbering, ferrules and terminal labelling correct", "Random-sample if the panel is large, but state the sample size in the notes."],
      ["I/O points verified signal-by-signal against the I/O list", "Force each input and output; do not rely on the program indicating it worked."],
      ["Controller, HMI and drive firmware versions recorded", "Write the actual version strings in the reading column — needed for future support."],
      ["Application program and HMI project backed up and archived", "Note the archive location and file name; an unarchived FAT is not repeatable."],
      ["Network addresses, node IDs and bus termination set", "Check termination resistors physically, not just in configuration."],
    ],
  },
  {
    title: "6. Functional testing",
    items: [
      ["Power-up sequence performed without unexpected alarms", "Log any alarm that appears, even if it self-clears."],
      ["Normal operating sequence tested end to end", "Follow the functional design specification step by step, in order."],
      ["Manual / auto and local / remote transfers tested", "Include behaviour on transfer while running, not just from standstill."],
      ["Interlocks and permissives tested individually", "Test each interlock in isolation so a second interlock cannot mask a failure."],
      ["Alarm and fault conditions simulated and annunciated correctly", "Confirm alarm text, priority and any external annunciation."],
      ["Setpoints, timers and scaling checked against the spec", "Record as-tested values; these are the values the site will inherit."],
      ["Loss-of-supply and restart behaviour verified", "Confirm nothing restarts automatically that should not."],
    ],
  },
  {
    title: "7. Safety systems",
    items: [
      ["Emergency stop function tested from every station", "Test each device separately and confirm the whole safety group responds."],
      ["Safety relay / safety controller configuration verified", "Record the safety program checksum or configuration reference."],
      ["Guard, door and light-curtain interlocks tested", "Confirm the machine cannot be reset while a guard is open."],
      ["Reset and restart require deliberate operator action", "An automatic restart after a safety trip is a defect, not a preference."],
      ["Safety function response verified against the design intent", "Record the required and achieved response where a time limit is specified."],
    ],
  },
  {
    title: "8. Final inspection and dispatch",
    items: [
      ["Outstanding defects transferred to the punch list", "Every Fail above should have a matching punch list line before sign-off."],
      ["As-built mark-ups captured on the drawing set", "Mark-ups made now cost minutes; reconstructing them on site costs days."],
      ["Documentation pack assembled (manuals, certificates, backups)", "List what is included so the site can identify what is missing on arrival."],
      ["Loose items, spares and keys bagged and listed", "Attach the list to the panel and copy it into the shipping paperwork."],
      ["Enclosure cleaned, protected and prepared for transport", "Confirm transport bracing and moisture protection suit the shipping route."],
    ],
  },
];

const SAT_SECTIONS = [
  {
    title: "1. Site readiness and pre-energization",
    items: [
      ["Site permits, isolations and access arranged", "Confirm the permit covers the work actually planned for today."],
      ["FAT punch list items closed or formally carried forward", "Anything still open should be visible on the Punch List tab before you start."],
      ["Equipment inspected for transit and storage damage", "Photograph anything suspect before energization, not after."],
      ["Environmental conditions acceptable (temperature, humidity, dust)", "Record ambient conditions; they affect insulation readings later."],
      ["All circuits confirmed isolated and locked off before work", "Log the isolations on the LOTO Tag Log tab."],
    ],
  },
  {
    title: "2. Installation verification",
    items: [
      ["Equipment installed per layout and installation drawings", "Check clearances and maintenance access, not just position."],
      ["Cable routing, support and segregation per specification", "Look at bend radii and support spacing on heavy multicore runs."],
      ["Glanding, sealing and cable entries correct and weatherproof", "Confirm the gland type matches the cable and the enclosure rating."],
      ["Cable identification present at both ends of every run", "Cross-check against the Cable Schedule tab as you go."],
      ["Field devices installed, oriented and accessible", "Confirm displays are readable and isolation valves reachable."],
    ],
  },
  {
    title: "3. Earthing and bonding on site",
    items: [
      ["Main earthing and bonding connections verified", "Check the connection to the site earthing system, not only within the package."],
      ["Earth continuity confirmed to field equipment and structures", "Record the highest measured value in the reading column."],
      ["Cable screens and drains terminated as designed (one end only where specified)", "Screens earthed at both ends where the design says one end is a real defect."],
      ["Insulation resistance re-tested after installation", "Record on the IR Test Log tab; compare against the FAT readings."],
    ],
  },
  {
    title: "4. Energization",
    items: [
      ["Pre-energization checklist completed and countersigned", "This is the point of no return — do not proceed on a verbal confirmation."],
      ["Incoming supply voltage and phase rotation verified", "Record measured line-to-line and line-to-neutral values."],
      ["Energization performed in the agreed sequence", "Energize section by section; log the time of each step."],
      ["Control supplies, UPS and backup supplies verified", "Include changeover behaviour and battery autonomy where specified."],
      ["No unexpected alarms, trips or thermal effects after energization", "Return to the panel after 15–30 minutes and check for warming."],
    ],
  },
  {
    title: "5. Loop checks and instrumentation",
    items: [
      ["Every field loop verified from device to controller and back", "Inject at the device, confirm at the HMI — an end-to-end check, not a terminal check."],
      ["Analogue loops verified at several points across the range", "Check low, mid and high points; a single-point check hides scaling errors."],
      ["Instrument calibration certificates available and in date", "Record certificate references in the notes column."],
      ["Scaling, engineering units and ranges match the instrument index", "Mismatched units are the classic cause of a plant tripping at the wrong value."],
      ["Valve and actuator stroking, travel and feedback verified", "Confirm fail-safe position on loss of signal and loss of supply."],
    ],
  },
  {
    title: "6. Control, interlocks and network",
    items: [
      ["Communication networks and fieldbuses verified end to end", "Record error counters after a period of running, not just at start-up."],
      ["Redundancy and changeover tested where provided", "Force a changeover; do not accept a healthy indication as proof."],
      ["Interlocks and permissives re-tested with real field devices", "Simulation is a FAT method; SAT is where the real device gets tested."],
      ["Sequences, timers and setpoints verified against the spec", "Record any values changed during commissioning, with who authorised them."],
      ["Alarms verified with correct text, priority and routing", "Include any SMS, radio or SCADA routing in the test."],
      ["Time synchronisation and event logging verified", "Unsynchronised timestamps make later incident investigation almost useless."],
    ],
  },
  {
    title: "7. Safety systems on site",
    items: [
      ["Emergency stop tested from every field station", "Test every station individually and record which group each one trips."],
      ["Guards, interlocks and access detection tested in place", "Test with the real guard, at the real speed."],
      ["Trip and shutdown functions tested to the design intent", "Record achieved response where the specification states a limit."],
      ["Fire, gas or other protection interfaces tested", "Coordinate with the responsible party before triggering any site-wide system."],
      ["Safety system bypasses and overrides removed and logged", "A forgotten bypass is one of the most serious handover defects there is."],
    ],
  },
  {
    title: "8. Performance and endurance",
    items: [
      ["Performance verified under normal operating load", "Record the actual duty achieved, not just that it ran."],
      ["Behaviour verified under upset and edge conditions", "Include the conditions the client is most worried about."],
      ["Continuous run / soak test completed for the agreed duration", "State the duration and any interruptions in the notes."],
      ["Energy, capacity or throughput figures recorded", "These figures are usually the contractual acceptance criteria — record them precisely."],
    ],
  },
  {
    title: "9. Handover",
    items: [
      ["Operator and maintenance training delivered and attendance recorded", "Attach or reference the signed attendance sheet."],
      ["Punch list reviewed and agreed with the client", "Agree severity with the client, not just the item text."],
      ["Final software, configuration and parameter backups handed over", "Include the version and where it is stored."],
      ["As-built documentation and certificates handed over", "List document numbers and revisions in the notes column."],
      ["Spares, special tools and consumables handed over", "Cross-check against the contractual spares list."],
      ["Outstanding works and responsibilities agreed in writing", "This is what prevents an argument three months later."],
    ],
  },
];

/* ------------------------------------------------------------------ */
/* Project Data                                                        */
/* ------------------------------------------------------------------ */

function buildProjectDataSheet(wb) {
  const ws = wb.addWorksheet(PD.sheet, {
    properties: { tabColor: { argb: `FF${BRAND.primary}` } },
  });
  const lastCol = 6;
  sheetTitle(ws, "Project Data", "Fill this tab in once — every other sheet reads from it", lastCol);
  setColumnWidths(ws, [26, 34, 18, 26, 22, 22]);

  ws.getCell("A4").value = "Job identification";
  ws.getCell("A4").font = { bold: true, size: 11, color: { argb: `FF${BRAND.primary}` } };

  const fields = [
    ["Project name", "As it should appear on the client's documents"],
    ["Client", "Company accepting the work"],
    ["Contractor", "Your company"],
    ["Site / location", "Yard, vessel, plant or building"],
    ["Job / contract no.", "Your internal or contractual reference"],
    ["System / package", "e.g. MCC-2 switchboard, thruster control panel"],
    ["Document no.", "Leave blank if the client issues numbers"],
    ["Revision", "Start at 0 or A and log every change below"],
  ];

  fields.forEach(([label, hint], i) => {
    const row = 5 + i;
    ws.getRow(row).height = 18;
    ws.getCell(`A${row}`).value = label;
    ws.getCell(`A${row}`).font = { bold: true, size: 10 };
    const value = ws.getCell(`B${row}`);
    value.border = boxThin;
    value.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFFFFBEB" } };
    ws.getCell(`C${row}`).value = hint;
    ws.getCell(`C${row}`).font = { italic: true, size: 9, color: { argb: `FF${BRAND.muted}` } };
    ws.mergeCells(`C${row}:F${row}`);
  });

  // Personnel — who is entitled to sign what, agreed before testing starts.
  let row = 5 + fields.length + 1;
  ws.getCell(`A${row}`).value = "Personnel and responsibilities";
  ws.getCell(`A${row}`).font = { bold: true, size: 11, color: { argb: `FF${BRAND.primary}` } };
  row += 1;
  tableHeader(ws, row, ["Role", "Name", "Company", "Contact", "Authorised to sign", "Notes"]);
  const personnelHeader = row;
  row += 1;
  const personnelRoles = [
    "Commissioning lead",
    "Test engineer / technician",
    "Client representative",
    "QA / witness",
    "Safety officer / permit holder",
  ];
  blankRegisterRows(ws, row, personnelRoles.length + 3, 6);
  personnelRoles.forEach((role, i) => {
    ws.getCell(`A${row + i}`).value = role;
    ws.getCell(`A${row + i}`).font = { size: 10 };
  });
  addValidation(ws, `E${row}:E${row + personnelRoles.length + 2}`, LIST.yesNo);
  row += personnelRoles.length + 4;

  // Test equipment — an IR reading without a traceable instrument is not evidence.
  ws.getCell(`A${row}`).value = "Test equipment used";
  ws.getCell(`A${row}`).font = { bold: true, size: 11, color: { argb: `FF${BRAND.primary}` } };
  ws.getCell(`C${row}`).value =
    "Readings are only defensible if the instrument that produced them is identified and in calibration.";
  ws.getCell(`C${row}`).font = { italic: true, size: 9, color: { argb: `FF${BRAND.muted}` } };
  row += 1;
  tableHeader(ws, row, [
    "Instrument type",
    "Manufacturer / model",
    "Serial no.",
    "Calibration cert. no.",
    "Calibration due",
    "In calibration?",
  ]);
  const equipHeader = row;
  row += 1;
  const equipRows = 8;
  blankRegisterRows(ws, row, equipRows, 6);
  ["Insulation resistance tester", "Multimeter", "Loop calibrator", "Earth continuity tester"].forEach(
    (t, i) => {
      ws.getCell(`A${row + i}`).value = t;
      ws.getCell(`A${row + i}`).font = { size: 10 };
    }
  );
  ws.getColumn(5).numFmt = "yyyy-mm-dd";
  addValidation(ws, `F${row}:F${row + equipRows - 1}`, LIST.yesNo);
  conditionalPassFail(ws, `F${row}:F${row + equipRows - 1}`);
  row += equipRows + 1;

  // Revision history — expected on any document that goes to a client.
  ws.getCell(`A${row}`).value = "Revision history";
  ws.getCell(`A${row}`).font = { bold: true, size: 11, color: { argb: `FF${BRAND.primary}` } };
  row += 1;
  tableHeader(ws, row, ["Rev.", "Date", "Description of change", "Prepared by", "Checked by", "Approved by"]);
  row += 1;
  const revRows = 8;
  blankRegisterRows(ws, row, revRows, 6);
  ws.getCell(`B${row}`).numFmt = "yyyy-mm-dd";
  const lastRow = row + revRows;

  ws.views = [{ state: "frozen", ySplit: 3 }];
  printSetup(ws, { lastCol, lastRow, orientation: "portrait" });
  return { personnelHeader, equipHeader };
}

/* ------------------------------------------------------------------ */
/* Commissioning report                                                */
/* ------------------------------------------------------------------ */

function buildCommissioningReportSheet(wb, included, ranges) {
  const ws = wb.addWorksheet("Commissioning Report");
  const lastCol = 7;
  sheetTitle(
    ws,
    "Commissioning Test Report",
    "Formal handover summary and acceptance record",
    lastCol
  );
  setColumnWidths(ws, [34, 24, 16, 18, 34, 16, 16]);

  let row = linkedProjectHeader(ws, 4, lastCol);

  ws.getCell(`A${row}`).value = "1. Scope of work commissioned";
  ws.getCell(`A${row}`).font = { bold: true, size: 11, color: { argb: `FF${BRAND.primary}` } };
  row += 1;
  ws.mergeCells(`A${row}:${colLetter(lastCol)}${row + 3}`);
  const scope = ws.getCell(`A${row}`);
  scope.value =
    "Describe the system(s) commissioned, the physical and functional boundaries of the work, and the governing documents (functional design specification, single-line diagrams, P&IDs, I/O list, applicable project standards). State explicitly anything inside the physical boundary that was NOT commissioned under this report.";
  scope.font = { italic: true, size: 9, color: { argb: `FF${BRAND.muted}` } };
  scope.alignment = { wrapText: true, vertical: "top" };
  scope.border = boxThin;
  row += 5;

  ws.getCell(`A${row}`).value = "2. Test results summary";
  ws.getCell(`A${row}`).font = { bold: true, size: 11, color: { argb: `FF${BRAND.primary}` } };
  row += 1;

  const cols = [
    "Test / activity",
    "Reference document",
    "Result",
    "Deviation raised?",
    "Corrective action / comment",
    "Closed out?",
    "Date",
  ];
  tableHeader(ws, row, cols);
  const tableHeaderRow = row;
  row += 1;

  // Pull live counts from the checklist tabs so the summary cannot silently
  // disagree with the detail sheets behind it.
  const activities = [];
  if (included.includes("fat")) {
    activities.push({
      label: "Factory Acceptance Test",
      ref: "FAT Checklist tab",
      result: ranges.fat
        ? {
            formula: `IF(COUNTA('FAT Checklist'!${ranges.fat.resultRange})=0,"Not started",IF(COUNTIF('FAT Checklist'!${ranges.fat.resultRange},"Fail")>0,"Fail - "&COUNTIF('FAT Checklist'!${ranges.fat.resultRange},"Fail")&" item(s)","Pass"))`,
          }
        : null,
    });
  }
  if (included.includes("sat")) {
    activities.push({
      label: "Site Acceptance Test",
      ref: "SAT Checklist tab",
      result: ranges.sat
        ? {
            formula: `IF(COUNTA('SAT Checklist'!${ranges.sat.resultRange})=0,"Not started",IF(COUNTIF('SAT Checklist'!${ranges.sat.resultRange},"Fail")>0,"Fail - "&COUNTIF('SAT Checklist'!${ranges.sat.resultRange},"Fail")&" item(s)","Pass"))`,
          }
        : null,
    });
  }
  if (included.includes("ir")) {
    activities.push({
      label: "Insulation resistance testing",
      ref: "IR Test Log tab",
      result: ranges.ir
        ? {
            formula: `IF(COUNTA('IR Test Log'!${ranges.ir.verdictRange})=0,"Not started",IF(COUNTIF('IR Test Log'!${ranges.ir.verdictRange},"Fail")>0,"Fail - "&COUNTIF('IR Test Log'!${ranges.ir.verdictRange},"Fail")&" circuit(s)","Pass"))`,
          }
        : null,
    });
  }
  if (included.includes("cable")) {
    activities.push({ label: "Cable and termination verification", ref: "Cable Schedule tab", result: null });
  }
  activities.push({ label: "Earthing and bonding verification", ref: "", result: null });
  activities.push({ label: "Safety systems and interlock testing", ref: "", result: null });
  activities.push({ label: "Loop checks and instrument calibration", ref: "", result: null });
  activities.push({ label: "Performance / capacity test", ref: "", result: null });
  activities.push({ label: "Operator and maintenance training", ref: "", result: null });

  const firstActivityRow = row;
  activities.forEach((activity, i) => {
    const r = ws.getRow(row + i);
    r.height = 20;
    for (let c = 1; c <= lastCol; c++) styleBodyCell(r.getCell(c), i % 2 === 1);
    r.getCell(1).value = activity.label;
    if (activity.ref) {
      r.getCell(2).value = activity.ref;
      r.getCell(2).font = { size: 9, color: { argb: `FF${BRAND.muted}` } };
    }
    if (activity.result) {
      r.getCell(3).value = activity.result;
      r.getCell(3).font = { bold: true };
    }
    r.getCell(3).alignment = { vertical: "middle", horizontal: "center" };
    r.getCell(7).numFmt = "yyyy-mm-dd";
  });
  row += activities.length;
  const lastActivityRow = row - 1;

  const manualResultRows = activities
    .map((a, i) => (a.result ? null : firstActivityRow + i))
    .filter((v) => v !== null);
  manualResultRows.forEach((r) => addValidation(ws, `C${r}:C${r}`, LIST.testResult));
  addValidation(ws, `D${firstActivityRow}:D${lastActivityRow}`, LIST.yesNo);
  addValidation(ws, `F${firstActivityRow}:F${lastActivityRow}`, LIST.yesNoPending);
  conditionalPassFail(ws, `C${firstActivityRow}:C${lastActivityRow}`);

  row += 1;
  ws.getCell(`A${row}`).value = "3. Outstanding items";
  ws.getCell(`A${row}`).font = { bold: true, size: 11, color: { argb: `FF${BRAND.primary}` } };
  row += 1;
  if (included.includes("punch") && ranges.punch) {
    ws.getCell(`A${row}`).value = "Open punch list items (live count):";
    ws.getCell(`A${row}`).font = { size: 10 };
    ws.getCell(`C${row}`).value = {
      formula: `COUNTIF('Punch List'!${ranges.punch.statusRange},"Open")+COUNTIF('Punch List'!${ranges.punch.statusRange},"In progress")+COUNTIF('Punch List'!${ranges.punch.statusRange},"Ready for check")`,
    };
    ws.getCell(`C${row}`).font = { bold: true, size: 12 };
    ws.getCell(`C${row}`).alignment = { horizontal: "center" };
    ws.getCell(`D${row}`).value = "of which severity A (blocks handover):";
    ws.getCell(`D${row}`).font = { size: 10 };
    ws.getCell(`F${row}`).value = {
      formula: `COUNTIFS('Punch List'!${ranges.punch.severityRange},"A*",'Punch List'!${ranges.punch.statusRange},"<>Closed")`,
    };
    ws.getCell(`F${row}`).font = { bold: true, size: 12, color: { argb: `FF${STATE.fail.text}` } };
    ws.getCell(`F${row}`).alignment = { horizontal: "center" };
    row += 2;
  } else {
    ws.getCell(`A${row}`).value = "List any works, tests or documents outstanding at the date of this report.";
    ws.getCell(`A${row}`).font = { italic: true, size: 9, color: { argb: `FF${BRAND.muted}` } };
    row += 2;
  }

  ws.getCell(`A${row}`).value = "4. Acceptance";
  ws.getCell(`A${row}`).font = { bold: true, size: 11, color: { argb: `FF${BRAND.primary}` } };
  row += 1;
  ws.getCell(`A${row}`).value = "Overall acceptance status:";
  ws.getCell(`A${row}`).font = { bold: true, size: 11 };
  ws.mergeCells(`B${row}:D${row}`);
  const statusCell = ws.getCell(`B${row}`);
  statusCell.border = boxThin;
  statusCell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFFFFBEB" } };
  statusCell.alignment = { horizontal: "center", vertical: "middle" };
  statusCell.font = { bold: true, size: 11 };
  ws.getRow(row).height = 22;
  addValidation(ws, `B${row}:B${row}`, LIST.acceptance, "Select the contractual acceptance status for this system.");
  ws.getCell(`E${row}`).value =
    '"Accepted with punch list" means the client takes the system into use with agreed outstanding items.';
  ws.getCell(`E${row}`).font = { italic: true, size: 8, color: { argb: `FF${BRAND.muted}` } };
  row += 2;

  ws.getCell(`A${row}`).value = "Limitations and conditions of acceptance";
  ws.getCell(`A${row}`).font = { bold: true, size: 10 };
  row += 1;
  ws.mergeCells(`A${row}:${colLetter(lastCol)}${row + 2}`);
  const limits = ws.getCell(`A${row}`);
  limits.value =
    "State any test performed under simulated rather than process conditions, any function accepted on the basis of a supplier certificate, and any part of the scope deferred to a later date.";
  limits.font = { italic: true, size: 9, color: { argb: `FF${BRAND.muted}` } };
  limits.alignment = { wrapText: true, vertical: "top" };
  limits.border = boxThin;
  row += 4;

  const signEnd = signoffBlock(ws, row, lastCol);
  ws.views = [{ state: "frozen", ySplit: 3 }];
  printSetup(ws, { titleRow: tableHeaderRow, lastCol, lastRow: signEnd, orientation: "landscape" });
}

/* ------------------------------------------------------------------ */
/* Registers                                                           */
/* ------------------------------------------------------------------ */

function buildCableScheduleSheet(wb) {
  const ws = wb.addWorksheet("Cable Schedule");
  const cols = [
    "Cable ID",
    "From (equipment / terminal)",
    "To (equipment / terminal)",
    "Service / function",
    "Type / specification",
    "Cores x c.s.a.",
    "Voltage rating",
    "Length (m)",
    "Route / tray ref.",
    "Glanded both ends?",
    "Terminated?",
    "Continuity checked",
    "IR tested (see IR log)",
    "Checked by",
    "Date",
    "Notes",
  ];
  const lastCol = cols.length;
  sheetTitle(ws, "Cable & Termination Schedule", "Register every cable once — track it through to closeout", lastCol);
  setColumnWidths(ws, [14, 26, 26, 20, 22, 14, 13, 11, 18, 13, 12, 13, 15, 15, 12, 30]);

  let row = linkedProjectHeader(ws, 4, lastCol);
  const headerRow = row;
  tableHeader(ws, headerRow, cols);
  row += 1;

  const dataRows = 80;
  blankRegisterRows(ws, row, dataRows, lastCol);
  const lastDataRow = row + dataRows - 1;

  addValidation(ws, `J${row}:J${lastDataRow}`, LIST.yesNo);
  addValidation(ws, `K${row}:K${lastDataRow}`, LIST.yesNo);
  addValidation(ws, `L${row}:L${lastDataRow}`, LIST.result);
  addValidation(ws, `M${row}:M${lastDataRow}`, LIST.result);
  conditionalPassFail(ws, `L${row}:M${lastDataRow}`);
  ws.getColumn(8).numFmt = "0.0";
  ws.getColumn(15).numFmt = "yyyy-mm-dd";

  const summaryRow = lastDataRow + 2;
  ws.getCell(`A${summaryRow}`).value = "Summary";
  ws.getCell(`A${summaryRow}`).font = { bold: true, size: 11 };
  ws.getCell(`B${summaryRow}`).value = { formula: `"Cables registered: "&COUNTA(A${row}:A${lastDataRow})` };
  ws.getCell(`D${summaryRow}`).value = { formula: `"Terminated: "&COUNTIF(K${row}:K${lastDataRow},"Yes")` };
  ws.getCell(`F${summaryRow}`).value = { formula: `"Continuity passed: "&COUNTIF(L${row}:L${lastDataRow},"Pass")` };
  ws.getCell(`I${summaryRow}`).value = { formula: `"Total length (m): "&ROUND(SUM(H${row}:H${lastDataRow}),1)` };
  [`B${summaryRow}`, `D${summaryRow}`, `F${summaryRow}`, `I${summaryRow}`].forEach((ref) => {
    ws.getCell(ref).font = { bold: true };
  });

  ws.autoFilter = { from: { row: headerRow, column: 1 }, to: { row: lastDataRow, column: lastCol } };
  ws.views = [{ state: "frozen", xSplit: 1, ySplit: headerRow, activeCell: `A${row}` }];
  printSetup(ws, { titleRow: headerRow, lastCol, lastRow: summaryRow });
}

function buildInsulationLogSheet(wb) {
  const ws = wb.addWorksheet("IR Test Log");
  const cols = [
    "Circuit ID",
    "Description",
    "Stage",
    "Test voltage (V)",
    "L1-L2 (MΩ)",
    "L2-L3 (MΩ)",
    "L1-L3 (MΩ)",
    "L-N (MΩ)",
    "L-E (MΩ)",
    "N-E (MΩ)",
    "Lowest (MΩ)",
    "Verdict",
    "Ambient °C",
    "RH %",
    "Tested by",
    "Date",
    "Notes",
  ];
  const lastCol = cols.length;
  sheetTitle(ws, "Insulation Resistance (IR) Test Log", "Readings per circuit, judged against your project acceptance limit", lastCol);
  setColumnWidths(ws, [14, 28, 16, 13, 12, 12, 12, 12, 12, 12, 12, 12, 11, 9, 16, 12, 30]);

  let row = linkedProjectHeader(ws, 4, lastCol);

  // Acceptance criteria block — the single most important missing piece in a
  // generic IR log: a reading means nothing without the limit it is judged against.
  ws.getCell(`A${row}`).value = "Acceptance criteria";
  ws.getCell(`A${row}`).font = { bold: true, size: 11, color: { argb: `FF${BRAND.primary}` } };
  row += 1;

  ws.getCell(`A${row}`).value = "Minimum acceptable insulation resistance (MΩ):";
  ws.getCell(`A${row}`).font = { bold: true, size: 10 };
  ws.mergeCells(`A${row}:C${row}`);
  const limitCell = ws.getCell(`D${row}`);
  const LIMIT_REF = `$D$${row}`;
  limitCell.value = 1;
  limitCell.numFmt = "0.00";
  limitCell.font = { bold: true, size: 12 };
  limitCell.alignment = { horizontal: "center", vertical: "middle" };
  limitCell.border = boxThin;
  limitCell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFFFFBEB" } };
  ws.mergeCells(`E${row}:${colLetter(lastCol)}${row}`);
  ws.getCell(`E${row}`).value =
    "Set this to the limit your project specification, client standard or governing code requires. The Verdict column judges every reading against this cell. Insulation resistance falls with temperature and humidity — record both, and re-test rather than accepting a marginal reading.";
  ws.getCell(`E${row}`).font = { italic: true, size: 9, color: { argb: `FF${BRAND.muted}` } };
  ws.getCell(`E${row}`).alignment = { wrapText: true, vertical: "middle" };
  ws.getRow(row).height = 30;
  row += 2;

  const headerRow = row;
  tableHeader(ws, headerRow, cols);
  row += 1;

  const dataRows = 60;
  blankRegisterRows(ws, row, dataRows, lastCol);
  const firstDataRow = row;
  const lastDataRow = row + dataRows - 1;

  // Lowest reading + verdict computed rather than left to the technician's eye.
  for (let r = firstDataRow; r <= lastDataRow; r++) {
    const lowest = ws.getCell(`K${r}`);
    lowest.value = { formula: `IF(COUNT(E${r}:J${r})=0,"",MIN(E${r}:J${r}))` };
    lowest.numFmt = "0.00";
    lowest.alignment = { horizontal: "center", vertical: "middle" };
    lowest.font = { bold: true };

    const verdict = ws.getCell(`L${r}`);
    verdict.value = {
      formula: `IF(COUNT(E${r}:J${r})=0,"",IF(MIN(E${r}:J${r})>=${LIMIT_REF},"Pass","Fail"))`,
    };
    verdict.alignment = { horizontal: "center", vertical: "middle" };
    verdict.font = { bold: true };
  }

  addValidation(ws, `C${firstDataRow}:C${lastDataRow}`, '"Pre-energization,Post-energization,Re-test,FAT,SAT"');
  ws.getColumn(4).numFmt = "0";
  [5, 6, 7, 8, 9, 10].forEach((c) => {
    ws.getColumn(c).numFmt = "0.00";
  });
  ws.getColumn(13).numFmt = "0.0";
  ws.getColumn(16).numFmt = "yyyy-mm-dd";
  conditionalPassFail(ws, `L${firstDataRow}:L${lastDataRow}`);

  const summaryRow = lastDataRow + 2;
  ws.getCell(`A${summaryRow}`).value = "Summary";
  ws.getCell(`A${summaryRow}`).font = { bold: true, size: 11 };
  ws.getCell(`B${summaryRow}`).value = {
    formula: `"Circuits tested: "&COUNTIF(L${firstDataRow}:L${lastDataRow},"<>")`,
  };
  ws.getCell(`D${summaryRow}`).value = {
    formula: `"Pass: "&COUNTIF(L${firstDataRow}:L${lastDataRow},"Pass")`,
  };
  ws.getCell(`D${summaryRow}`).font = { bold: true, color: { argb: `FF${STATE.pass.text}` } };
  ws.getCell(`F${summaryRow}`).value = {
    formula: `"Fail: "&COUNTIF(L${firstDataRow}:L${lastDataRow},"Fail")`,
  };
  ws.getCell(`F${summaryRow}`).font = { bold: true, color: { argb: `FF${STATE.fail.text}` } };
  ws.getCell(`H${summaryRow}`).value = {
    formula: `"Lowest reading on job (MΩ): "&IF(COUNT(K${firstDataRow}:K${lastDataRow})=0,"-",MIN(K${firstDataRow}:K${lastDataRow}))`,
  };
  ws.getCell(`H${summaryRow}`).font = { bold: true };
  ws.getCell(`B${summaryRow}`).font = { bold: true };

  const signEnd = signoffBlock(ws, summaryRow + 2, lastCol);

  ws.autoFilter = { from: { row: headerRow, column: 1 }, to: { row: lastDataRow, column: lastCol } };
  ws.views = [{ state: "frozen", xSplit: 2, ySplit: headerRow, activeCell: `A${firstDataRow}` }];
  printSetup(ws, { titleRow: headerRow, lastCol, lastRow: signEnd });

  return { verdictRange: `$L$${firstDataRow}:$L$${lastDataRow}` };
}

function buildLotoSheet(wb) {
  const ws = wb.addWorksheet("LOTO Tag Log");
  const cols = [
    "Tag / lock #",
    "Permit ref.",
    "Isolation point / device",
    "Equipment isolated",
    "Energy source",
    "Isolation method",
    "Applied by",
    "Date / time applied",
    "Zero-energy state verified by",
    "Verification method",
    "Removed by",
    "Date / time removed",
    "Equipment returned to service by",
    "Notes",
  ];
  const lastCol = cols.length;
  sheetTitle(ws, "LOTO (Lockout / Tagout) Tag Log", "Isolation register — every lock accounted for, applied through to removal", lastCol);
  setColumnWidths(ws, [13, 14, 28, 24, 16, 22, 18, 18, 24, 22, 18, 18, 24, 26]);

  let row = linkedProjectHeader(ws, 4, lastCol);

  ws.mergeCells(`A${row}:${colLetter(lastCol)}${row}`);
  const warn = ws.getCell(`A${row}`);
  warn.value =
    "A lock is not removed until the person who applied it, or a documented authorised process, removes it. Verify the zero-energy state after isolating and before any work starts — an isolation that has not been proved dead is not an isolation.";
  warn.font = { bold: true, size: 9, color: { argb: `FF${STATE.warn.text}` } };
  warn.fill = { type: "pattern", pattern: "solid", fgColor: { argb: `FF${STATE.warn.bg}` } };
  warn.alignment = { wrapText: true, vertical: "middle", indent: 1 };
  warn.border = boxThin;
  ws.getRow(row).height = 30;
  row += 2;

  const headerRow = row;
  tableHeader(ws, headerRow, cols);
  row += 1;

  const dataRows = 45;
  blankRegisterRows(ws, row, dataRows, lastCol);
  const firstDataRow = row;
  const lastDataRow = row + dataRows - 1;

  addValidation(ws, `E${firstDataRow}:E${lastDataRow}`, LIST.energy);
  addValidation(
    ws,
    `F${firstDataRow}:F${lastDataRow}`,
    '"Breaker locked off,Isolator locked off,Fuse withdrawn,Valve locked closed,Blank / spade fitted,Line broken,Blocked / pinned"'
  );
  addValidation(
    ws,
    `J${firstDataRow}:J${lastDataRow}`,
    '"Voltage test (prove-test-prove),Try-start,Pressure gauge at zero,Visual - line broken,Other"'
  );
  ws.getColumn(8).numFmt = "yyyy-mm-dd hh:mm";
  ws.getColumn(12).numFmt = "yyyy-mm-dd hh:mm";

  // Anything applied and not yet removed is highlighted — the state that matters on site.
  ws.addConditionalFormatting({
    ref: `A${firstDataRow}:${colLetter(lastCol)}${lastDataRow}`,
    rules: [
      {
        type: "expression",
        formulae: [`AND($A${firstDataRow}<>"",$L${firstDataRow}="")`],
        priority: 1,
        style: {
          fill: { type: "pattern", pattern: "solid", bgColor: { argb: `FF${STATE.warn.bg}` } },
        },
      },
    ],
  });

  const summaryRow = lastDataRow + 2;
  ws.getCell(`A${summaryRow}`).value = "Summary";
  ws.getCell(`A${summaryRow}`).font = { bold: true, size: 11 };
  ws.getCell(`C${summaryRow}`).value = {
    formula: `"Locks applied: "&COUNTA(A${firstDataRow}:A${lastDataRow})`,
  };
  ws.getCell(`E${summaryRow}`).value = {
    formula: `"Still applied (not removed): "&SUMPRODUCT((A${firstDataRow}:A${lastDataRow}<>"")*(L${firstDataRow}:L${lastDataRow}=""))`,
  };
  ws.getCell(`E${summaryRow}`).font = { bold: true, color: { argb: `FF${STATE.warn.text}` } };
  ws.getCell(`C${summaryRow}`).font = { bold: true };
  ws.getCell(`I${summaryRow}`).value =
    "All isolations must be cleared and this register closed out before handover.";
  ws.getCell(`I${summaryRow}`).font = { italic: true, size: 9, color: { argb: `FF${BRAND.muted}` } };

  const signEnd = signoffBlock(ws, summaryRow + 2, lastCol);

  ws.autoFilter = { from: { row: headerRow, column: 1 }, to: { row: lastDataRow, column: lastCol } };
  ws.views = [{ state: "frozen", xSplit: 1, ySplit: headerRow, activeCell: `A${firstDataRow}` }];
  printSetup(ws, { titleRow: headerRow, lastCol, lastRow: signEnd });
}

function buildPunchListSheet(wb) {
  const ws = wb.addWorksheet("Punch List");
  const cols = [
    "#",
    "Raised on (tab / test)",
    "Area / panel / tag",
    "Description of defect",
    "Severity",
    "Responsible party",
    "Raised by",
    "Date raised",
    "Target date",
    "Status",
    "Corrective action taken",
    "Date closed",
    "Days open",
    "Closed out by",
    "Client accepted",
  ];
  const lastCol = cols.length;
  sheetTitle(ws, "Punch List / Snag List Tracker", "Open items from FAT and SAT through to closeout", lastCol);
  setColumnWidths(ws, [6, 20, 22, 42, 24, 20, 16, 13, 13, 16, 38, 13, 11, 18, 14]);

  let row = linkedProjectHeader(ws, 4, lastCol);

  ws.getCell(`A${row}`).value = "Severity key:";
  ws.getCell(`A${row}`).font = { bold: true, size: 9 };
  ws.mergeCells(`B${row}:${colLetter(lastCol)}${row}`);
  ws.getCell(`B${row}`).value =
    "A — blocks handover or acceptance   |   B — must be fixed before contractual closeout   |   C — minor or cosmetic, can be agreed as a residual item";
  ws.getCell(`B${row}`).font = { size: 9, color: { argb: `FF${BRAND.muted}` } };
  row += 2;

  const headerRow = row;
  tableHeader(ws, headerRow, cols);
  row += 1;

  const dataRows = 70;
  blankRegisterRows(ws, row, dataRows, lastCol);
  const firstDataRow = row;
  const lastDataRow = row + dataRows - 1;

  for (let r = firstDataRow; r <= lastDataRow; r++) {
    ws.getCell(`A${r}`).value = { formula: `IF(D${r}="","",ROW()-${firstDataRow - 1})` };
    ws.getCell(`A${r}`).alignment = { horizontal: "center", vertical: "top" };
    // Age in days: counts to closure if closed, otherwise to today.
    ws.getCell(`M${r}`).value = {
      formula: `IF(H${r}="","",IF(L${r}="",TODAY()-H${r},L${r}-H${r}))`,
    };
    ws.getCell(`M${r}`).alignment = { horizontal: "center", vertical: "top" };
    ws.getCell(`M${r}`).numFmt = "0";
  }

  addValidation(ws, `B${firstDataRow}:B${lastDataRow}`, '"FAT,SAT,IR test,Cable check,Site walkdown,Client comment,Other"');
  addValidation(ws, `E${firstDataRow}:E${lastDataRow}`, LIST.severity, "A blocks handover, B must be closed before closeout, C is minor.");
  addValidation(ws, `J${firstDataRow}:J${lastDataRow}`, LIST.punchStatus);
  addValidation(ws, `O${firstDataRow}:O${lastDataRow}`, LIST.yesNo);
  ws.getColumn(8).numFmt = "yyyy-mm-dd";
  ws.getColumn(9).numFmt = "yyyy-mm-dd";
  ws.getColumn(12).numFmt = "yyyy-mm-dd";

  // Overdue and severity-A items should be impossible to miss on a printout.
  ws.addConditionalFormatting({
    ref: `A${firstDataRow}:${colLetter(lastCol)}${lastDataRow}`,
    rules: [
      {
        type: "expression",
        formulae: [`AND($I${firstDataRow}<>"",$I${firstDataRow}<TODAY(),$J${firstDataRow}<>"Closed")`],
        priority: 1,
        style: {
          font: { color: { argb: `FF${STATE.fail.text}` } },
          fill: { type: "pattern", pattern: "solid", bgColor: { argb: `FF${STATE.fail.bg}` } },
        },
      },
      {
        type: "expression",
        formulae: [`AND(LEFT($E${firstDataRow},1)="A",$J${firstDataRow}<>"Closed")`],
        priority: 2,
        style: {
          fill: { type: "pattern", pattern: "solid", bgColor: { argb: `FF${STATE.warn.bg}` } },
        },
      },
      {
        type: "expression",
        formulae: [`$J${firstDataRow}="Closed"`],
        priority: 3,
        style: {
          font: { color: { argb: `FF${STATE.pass.text}` } },
        },
      },
    ],
  });

  const summaryRow = lastDataRow + 2;
  const statusRange = `J${firstDataRow}:J${lastDataRow}`;
  const severityRange = `E${firstDataRow}:E${lastDataRow}`;
  ws.getCell(`A${summaryRow}`).value = "Summary";
  ws.getCell(`A${summaryRow}`).font = { bold: true, size: 11 };
  ws.getCell(`C${summaryRow}`).value = { formula: `"Raised: "&COUNTA(D${firstDataRow}:D${lastDataRow})` };
  ws.getCell(`E${summaryRow}`).value = { formula: `"Open: "&COUNTIF(${statusRange},"Open")+COUNTIF(${statusRange},"In progress")+COUNTIF(${statusRange},"Ready for check")` };
  ws.getCell(`E${summaryRow}`).font = { bold: true, color: { argb: `FF${STATE.warn.text}` } };
  ws.getCell(`G${summaryRow}`).value = { formula: `"Closed: "&COUNTIF(${statusRange},"Closed")` };
  ws.getCell(`G${summaryRow}`).font = { bold: true, color: { argb: `FF${STATE.pass.text}` } };
  ws.getCell(`I${summaryRow}`).value = {
    formula: `"Severity A open: "&COUNTIFS(${severityRange},"A*",${statusRange},"<>Closed")`,
  };
  ws.getCell(`I${summaryRow}`).font = { bold: true, color: { argb: `FF${STATE.fail.text}` } };
  ws.getCell(`K${summaryRow}`).value = {
    formula: `"Overdue: "&SUMPRODUCT((I${firstDataRow}:I${lastDataRow}<>"")*(I${firstDataRow}:I${lastDataRow}<TODAY())*(${statusRange}<>"Closed"))`,
  };
  ws.getCell(`K${summaryRow}`).font = { bold: true, color: { argb: `FF${STATE.fail.text}` } };
  ws.getCell(`C${summaryRow}`).font = { bold: true };

  const signEnd = signoffBlock(ws, summaryRow + 2, lastCol);

  ws.autoFilter = { from: { row: headerRow, column: 1 }, to: { row: lastDataRow, column: lastCol } };
  ws.views = [{ state: "frozen", xSplit: 1, ySplit: headerRow, activeCell: `B${firstDataRow}` }];
  printSetup(ws, { titleRow: headerRow, lastCol, lastRow: signEnd });

  return {
    statusRange: `$J$${firstDataRow}:$J$${lastDataRow}`,
    severityRange: `$E$${firstDataRow}:$E$${lastDataRow}`,
  };
}

/* ------------------------------------------------------------------ */
/* Read Me                                                             */
/* ------------------------------------------------------------------ */

const LICENCE_TEXT = {
  starter: [
    "Licensed to the individual purchaser, for use on one active project at a time.",
    "You may print, complete and issue the completed documents to your client as part of your own project deliverables.",
    "You may not resell, sublicense, publish or redistribute the blank template itself, in any format.",
  ],
  complete: [
    "Licensed to the individual purchaser, for use on one active project at a time.",
    "You may print, complete and issue the completed documents to your client as part of your own project deliverables.",
    "You may not resell, sublicense, publish or redistribute the blank template itself, in any format.",
  ],
  team: [
    "Team licence: covers unlimited projects and unlimited named people within the purchasing company.",
    "You may store this workbook on company systems, adapt it to your house standard, and issue completed documents to clients.",
    "You may not resell, sublicense, publish or redistribute the blank template itself, or supply it to a company outside the licence holder.",
    "Priority support: reply to your order confirmation email and your message goes to the front of the queue.",
  ],
};

function buildReadMeSheet(wb, { includedSheets, tier }) {
  const ws = wb.addWorksheet("Read Me", {
    properties: { tabColor: { argb: `FF${BRAND.accent}` } },
  });
  setColumnWidths(ws, [4, 44, 62, 14, 14, 14]);

  ws.mergeCells("A1:F1");
  const title = ws.getCell("A1");
  title.value = `${BRAND.name} Commissioning Toolkit`;
  title.font = { bold: true, size: 20, color: { argb: "FFFFFFFF" } };
  title.fill = { type: "pattern", pattern: "solid", fgColor: { argb: `FF${BRAND.primary}` } };
  title.alignment = { vertical: "middle", indent: 1 };
  ws.getRow(1).height = 36;

  ws.mergeCells("A2:F2");
  const sub = ws.getCell("A2");
  const tierName = tier === "team" ? "Team Licence" : tier === "starter" ? "Starter" : "Complete";
  sub.value = `${tierName} edition · version ${PRODUCT_VERSION} · © ${PRODUCT_YEAR} ${BRAND.name}`;
  sub.font = { italic: true, size: 10, color: { argb: `FF${BRAND.muted}` } };
  sub.alignment = { vertical: "middle", indent: 1 };
  ws.getRow(2).height = 20;

  let row = 4;

  const heading = (text) => {
    ws.getCell(`B${row}`).value = text;
    ws.getCell(`B${row}`).font = { bold: true, size: 12, color: { argb: `FF${BRAND.primary}` } };
    row += 1;
  };
  const line = (label, text) => {
    ws.getRow(row).height = text && text.length > 90 ? 28 : 16;
    ws.getCell(`B${row}`).value = label;
    ws.getCell(`B${row}`).font = { size: 10, bold: Boolean(text) };
    ws.getCell(`B${row}`).alignment = { vertical: "top", wrapText: true };
    if (text) {
      ws.getCell(`C${row}`).value = text;
      ws.getCell(`C${row}`).font = { size: 10, color: { argb: "FF334155" } };
      ws.getCell(`C${row}`).alignment = { vertical: "top", wrapText: true };
    }
    row += 1;
  };
  const spacer = () => {
    row += 1;
  };

  heading("Start here");
  line("1. Open the Project Data tab and fill it in.", "Project name, client, job number and revision are entered once and appear automatically at the top of every other sheet.");
  line("2. Record your test instruments on the same tab.", "Serial numbers and calibration dates. A reading with no traceable instrument behind it is not evidence.");
  line("3. Work through the checklists.", "The Result column is a dropdown: Pass, Fail or N/A. Anything you mark Fail should get a line on the Punch List tab.");
  line("4. Log readings as you take them.", "The IR Test Log works out the lowest reading and the pass/fail verdict for you, against the acceptance limit you set at the top of that tab.");
  line("5. Close out and sign.", "The Commissioning Report pulls live counts from the other tabs, so the summary cannot drift out of step with the detail behind it.");
  spacer();

  heading("What is in this workbook");
  includedSheets.forEach((name) => {
    line(`•  ${name}`, "");
  });
  spacer();

  heading("Things worth knowing");
  line("One workbook per job.", "Save a copy per project rather than adding tabs to a master file. It keeps the audit trail clean and lets you archive the job intact.");
  line("Dropdowns are already set up.", "Result, severity, status and energy-source columns are validated lists. You can still type your own wording if a job needs it — you will just get a warning prompt.");
  line("Sheets are print-ready.", "Landscape, scaled to page width, header row repeated on every printed page, and a page-number footer. Print to PDF for issue to the client.");
  line("Coloured cells are calculated.", "Lowest reading, verdict, days open and the summary rows are formulas. Overwrite them only if you mean to.");
  line("Rows can be added.", "Insert rows inside an existing table rather than typing under the last row, so formulas, validation and formatting carry over.");
  line("Need more capacity?", "Copy the last data row and paste down. Validation, borders and formulas come with it.");
  spacer();

  heading("Scope and limitations — please read");
  line(
    "This is a documentation framework, not a compliance certificate.",
    "The checklists follow accepted FAT / SAT and commissioning practice across industrial, panel-building and marine work. They are deliberately not tied to one national code."
  );
  line(
    "You set the acceptance criteria.",
    "Insulation resistance limits, torque values, response times and test voltages must come from your project specification, the equipment manufacturer's data, or the standard governing your job."
  );
  line(
    "Competence is assumed.",
    "These documents are written for qualified electrical, automation and commissioning personnel working under their own company's safety procedures and permit system."
  );
  line(
    "Adapt it.",
    "Delete items that do not apply and add the ones your client insists on. A checklist you have adapted to the job is worth more than one you followed blindly."
  );
  spacer();

  heading("Licence");
  LICENCE_TEXT[tier].forEach((text) => line(`•  ${text}`, ""));
  spacer();

  heading("Support");
  line("Something wrong with the file, or a document you wish was in here?", "Reply to your order confirmation email. A working commissioning technician reads it.");
  line("Version", `${PRODUCT_VERSION} — check your order email for update notifications.`);

  const lastRow = row;
  ws.pageSetup = {
    orientation: "portrait",
    fitToPage: true,
    fitToWidth: 1,
    fitToHeight: 0,
    margins: { left: 0.5, right: 0.5, top: 0.5, bottom: 0.5, header: 0.3, footer: 0.3 },
    printArea: `A1:F${lastRow}`,
  };
  ws.headerFooter = { oddFooter: `&L&9${BRAND.name} Commissioning Toolkit v${PRODUCT_VERSION}&R&9Page &P of &N` };
  ws.views = [{ state: "frozen", ySplit: 2, showGridLines: false }];
}

/* ------------------------------------------------------------------ */
/* Workbook assembly                                                   */
/* ------------------------------------------------------------------ */

// Counted from the section data rather than hardcoded, so the Read Me can never
// advertise a number the workbook does not actually contain.
const countItems = (sections) => sections.reduce((n, s) => n + s.items.length, 0);

const SHEET_LABELS = {
  project: "Project Data — job details, personnel, test equipment, revision history",
  fat: `FAT Checklist — ${countItems(FAT_SECTIONS)} checks across ${FAT_SECTIONS.length} sections, with method guidance`,
  sat: `SAT Checklist — ${countItems(SAT_SECTIONS)} checks across ${SAT_SECTIONS.length} sections, with method guidance`,
  report: "Commissioning Report — handover summary with live results from the other tabs",
  cable: "Cable & Termination Schedule — 80-row register with progress totals",
  ir: "IR Test Log — 60 circuits, automatic verdict against your acceptance limit",
  loto: "LOTO Tag Log — 45 isolations, applied through to removal",
  punch: "Punch List — 70 items, severity, ageing and overdue highlighting",
};

async function buildWorkbook(keys, filename, tier) {
  const wb = new ExcelJS.Workbook();
  wb.creator = BRAND.name;
  wb.lastModifiedBy = BRAND.name;
  wb.created = new Date();
  wb.modified = new Date();
  wb.title = `${BRAND.name} Commissioning Toolkit`;
  wb.subject = "Industrial commissioning documentation";
  wb.company = BRAND.name;
  // Formulas are written without cached results, so ask Excel to calculate on open.
  wb.calcProperties = { ...(wb.calcProperties || {}), fullCalcOnLoad: true };

  buildReadMeSheet(wb, {
    includedSheets: ["project", ...keys].map((k) => SHEET_LABELS[k]),
    tier,
  });
  buildProjectDataSheet(wb);

  const ranges = {};
  if (keys.includes("fat")) {
    ranges.fat = buildChecklistSheet(wb, {
      name: "FAT Checklist",
      title: "Factory Acceptance Test (FAT) Checklist",
      subtitle: "Panel and system acceptance before despatch from the works",
      sections: FAT_SECTIONS,
    });
    ranges.fat.resultRange = `$D$${ranges.fat.firstDataRow}:$D$${ranges.fat.lastDataRow}`;
  }
  if (keys.includes("sat")) {
    ranges.sat = buildChecklistSheet(wb, {
      name: "SAT Checklist",
      title: "Site Acceptance Test (SAT) Checklist",
      subtitle: "On-site commissioning and acceptance before handover",
      sections: SAT_SECTIONS,
    });
    ranges.sat.resultRange = `$D$${ranges.sat.firstDataRow}:$D$${ranges.sat.lastDataRow}`;
  }

  // The report reads from the register tabs, so build those first and place the
  // report sheet afterwards by reordering at the end.
  if (keys.includes("cable")) buildCableScheduleSheet(wb);
  if (keys.includes("ir")) ranges.ir = buildInsulationLogSheet(wb);
  if (keys.includes("loto")) buildLotoSheet(wb);
  if (keys.includes("punch")) ranges.punch = buildPunchListSheet(wb);
  if (keys.includes("report")) buildCommissioningReportSheet(wb, keys, ranges);

  // Present the report immediately after the checklists it summarises.
  const desiredOrder = [
    "Read Me",
    PD.sheet,
    "FAT Checklist",
    "SAT Checklist",
    "Commissioning Report",
    "Cable Schedule",
    "IR Test Log",
    "LOTO Tag Log",
    "Punch List",
  ];
  desiredOrder.forEach((name, index) => {
    const sheet = wb.getWorksheet(name);
    if (sheet) sheet.orderNo = index + 1;
  });

  wb.views = [{ activeTab: 0 }];

  const outPath = path.join(OUT_DIR, filename);
  await wb.xlsx.writeFile(outPath);
  console.log(`Wrote ${outPath}`);
}

await buildWorkbook(["fat", "sat", "report"], "panelcert-starter.xlsx", "starter");
await buildWorkbook(
  ["fat", "sat", "report", "cable", "ir", "loto", "punch"],
  "panelcert-complete.xlsx",
  "complete"
);
await buildWorkbook(
  ["fat", "sat", "report", "cable", "ir", "loto", "punch"],
  "panelcert-team.xlsx",
  "team"
);
