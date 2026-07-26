/**
 * Render PerformanceReportPayload to a PDF buffer (pdfkit).
 */

import PDFDocument from "pdfkit";
import {
  PERFORMANCE_REPORT_METRIC_KIND_LABELS,
} from "@/domain/performance-report/constants";
import type { PerformanceReportPayload } from "@/domain/performance-report/types";

function collectBuffers(doc: PDFKit.PDFDocument): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    doc.on("data", (chunk: Buffer) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);
  });
}

function ensureSpace(doc: PDFKit.PDFDocument, need: number) {
  if (doc.y + need > doc.page.height - 56) {
    doc.addPage();
  }
}

/**
 * Clean branded multi-page athlete performance report.
 */
export async function renderPerformanceReportPdf(
  report: PerformanceReportPayload,
): Promise<Buffer> {
  const doc = new PDFDocument({
    size: "LETTER",
    margins: { top: 54, bottom: 54, left: 54, right: 54 },
    info: {
      Title: `Performance Report — ${report.athleteDisplayName}`,
      Author: report.branding.displayName,
      Subject: `Data period ${report.period.label}`,
      Creator: report.engineVersion,
    },
  });

  const done = collectBuffers(doc);
  const brand = report.branding.displayName;
  const accent = report.branding.accentHex ?? "#1a1a1a";

  // Cover
  doc
    .fillColor(accent)
    .fontSize(11)
    .font("Helvetica-Bold")
    .text(brand.toUpperCase(), { characterSpacing: 1.5 });
  doc.moveDown(0.6);
  doc
    .fillColor("#111111")
    .fontSize(22)
    .font("Helvetica-Bold")
    .text("Performance Report");
  doc.moveDown(0.3);
  doc
    .fillColor("#333333")
    .fontSize(14)
    .font("Helvetica")
    .text(report.athleteDisplayName);
  doc.moveDown(0.8);

  doc
    .fillColor("#111111")
    .fontSize(10)
    .font("Helvetica-Bold")
    .text("Data period");
  doc
    .font("Helvetica")
    .fillColor("#333333")
    .text(report.period.label);
  doc
    .fillColor("#666666")
    .fontSize(9)
    .text(`Generated ${report.generatedAtIso.slice(0, 19).replace("T", " ")} UTC`);
  doc.moveDown(0.8);

  // Estimated / missing callouts on cover
  doc
    .fillColor("#111111")
    .fontSize(10)
    .font("Helvetica-Bold")
    .text("Estimated metrics in this report");
  doc.font("Helvetica").fillColor("#333333").fontSize(9);
  if (report.estimatedMetricLabels.length === 0) {
    doc.text("None — no estimated metrics included.");
  } else {
    doc.text(report.estimatedMetricLabels.join(" · "));
  }
  doc.moveDown(0.5);

  doc
    .fillColor("#111111")
    .fontSize(10)
    .font("Helvetica-Bold")
    .text("Missing data");
  doc.font("Helvetica").fillColor("#333333").fontSize(9);
  if (report.missingDataNotes.length === 0) {
    doc.text("No section-level gaps flagged for this period.");
  } else {
    for (const note of report.missingDataNotes) {
      doc.text(`• ${note}`);
    }
  }
  doc.moveDown(0.8);

  doc
    .fillColor("#555555")
    .fontSize(8)
    .font("Helvetica-Oblique")
    .text(report.honesty.join(" "));

  // Sections
  for (const section of report.sections) {
    doc.addPage();
    doc
      .fillColor(accent)
      .fontSize(9)
      .font("Helvetica-Bold")
      .text(brand);
    doc.moveDown(0.4);
    doc
      .fillColor("#111111")
      .fontSize(16)
      .font("Helvetica-Bold")
      .text(section.title);
    doc.moveDown(0.35);
    doc
      .fillColor("#333333")
      .fontSize(10)
      .font("Helvetica")
      .text(section.summary);
    doc.moveDown(0.5);

    if (section.missingData) {
      ensureSpace(doc, 36);
      doc
        .fillColor("#7a4a00")
        .fontSize(9)
        .font("Helvetica-Bold")
        .text("Missing data");
      doc
        .font("Helvetica")
        .fillColor("#5a3a00")
        .text(section.missingData);
      doc.moveDown(0.45);
    }

    for (const metric of section.metrics) {
      ensureSpace(doc, 28);
      const kindLabel =
        PERFORMANCE_REPORT_METRIC_KIND_LABELS[metric.kind];
      doc
        .fillColor("#111111")
        .fontSize(10)
        .font("Helvetica-Bold")
        .text(metric.label, { continued: true });
      doc
        .font("Helvetica")
        .fillColor("#666666")
        .text(`  [${kindLabel}]`);
      doc
        .fillColor("#111111")
        .font("Helvetica")
        .text(metric.value ?? "—");
      if (metric.note) {
        doc.fillColor("#666666").fontSize(8).text(metric.note);
      }
      doc.moveDown(0.35);
    }

    if (section.bullets.length > 0) {
      doc.moveDown(0.2);
      doc
        .fillColor("#111111")
        .fontSize(9)
        .font("Helvetica-Bold")
        .text("Notes");
      doc.font("Helvetica").fillColor("#333333").fontSize(9);
      for (const b of section.bullets) {
        ensureSpace(doc, 16);
        doc.text(`• ${b}`);
      }
    }

    // Footer on each section page
    const bottom = doc.page.height - 40;
    doc
      .fontSize(7)
      .fillColor("#888888")
      .text(
        `${brand} · ${report.engineVersion} · Period ${report.period.fromIso}–${report.period.toIso}`,
        54,
        bottom,
        { lineBreak: false },
      );
  }

  // Closing honesty page
  doc.addPage();
  doc
    .fillColor("#111111")
    .fontSize(14)
    .font("Helvetica-Bold")
    .text("How to read this report");
  doc.moveDown(0.5);
  doc.font("Helvetica").fontSize(9).fillColor("#333333");
  for (const line of report.honesty) {
    doc.text(`• ${line}`);
    doc.moveDown(0.25);
  }
  doc.moveDown(0.5);
  doc
    .fillColor("#666666")
    .fontSize(8)
    .text(
      `Data period: ${report.period.label}. Engine ${report.engineVersion}.`,
    );

  doc.end();
  return done;
}
