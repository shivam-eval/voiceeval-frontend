import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

/**
 * Generate a comprehensive PDF report from the /kpis/report API response.
 *
 * @param {object} data - Response from GET /agents/{agent_id}/kpis/report
 * @param {string} username - Current user display name
 */
export const exportReportPDF = (data, username = 'User') => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  const kpis = data?.kpis ?? {};
  const totalCalls = data?.total_calls ?? 0;
  const agentName = data?.agent_name ?? data?.agent_id ?? 'Unknown';
  const periodStart = data?.period?.start
    ? new Date(data.period.start).toLocaleDateString()
    : '--';
  const periodEnd = data?.period?.end
    ? new Date(data.period.end).toLocaleDateString()
    : '--';
  const avgDuration = data?.average_duration_seconds ?? 0;
  const earlyTermination = data?.early_termination ?? { count: 0, rate: 0, calls: [] };
  const hallucinations = data?.hallucinations ?? { count: 0, rate: 0, items: [] };

  // KPI helpers
  const getKpiValue = (key, prop) => kpis?.[key]?.[prop] ?? 0;
  const getKpiRate = (key) => Math.round((getKpiValue(key, 'rate')) * 100);
  const getKpiCount = (key) => getKpiValue(key, 'count');

  /* ================= HELPER: metric card ================= */
  const drawMetricCard = (x, y, width, height, title, value, subtitle, color = [20, 184, 166]) => {
    doc.setFillColor(30, 41, 59);
    doc.roundedRect(x, y, width, height, 3, 3, 'F');
    doc.setDrawColor(55, 65, 81);
    doc.setLineWidth(0.5);
    doc.roundedRect(x, y, width, height, 3, 3, 'S');

    doc.setFontSize(8);
    doc.setTextColor(156, 163, 175);
    doc.text(title.toUpperCase(), x + width / 2, y + 8, { align: 'center' });

    const valueStr = String(value);
    let fontSize = 32;
    if (valueStr.length > 8) fontSize = 24;
    else if (valueStr.length > 6) fontSize = 28;

    doc.setFontSize(fontSize);
    doc.setTextColor(color[0], color[1], color[2]);
    doc.setFont('helvetica', 'bold');
    doc.text(valueStr, x + width / 2, y + height / 2 + 5, { align: 'center' });

    doc.setFontSize(9);
    doc.setTextColor(107, 114, 128);
    doc.setFont('helvetica', 'normal');
    doc.text(subtitle, x + width / 2, y + height - 8, { align: 'center' });
  };

  /* ================= PAGE 1: HEADER ================= */

  // Background
  doc.setFillColor(17, 24, 39);
  doc.rect(0, 0, pageWidth, pageHeight, 'F');

  // Header bar
  doc.setFillColor(20, 184, 166);
  doc.rect(0, 0, pageWidth, 12, 'F');

  doc.setFontSize(14);
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.text('VoiceEval', 14, 8);

  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.text(username, pageWidth - 14, 8, { align: 'right' });

  // Title
  doc.setFontSize(20);
  doc.setTextColor(20, 184, 166);
  doc.setFont('helvetica', 'bold');
  doc.text('Call Quality Report', 14, 25);

  // Agent + date range
  doc.setFontSize(10);
  doc.setTextColor(200, 200, 200);
  doc.setFont('helvetica', 'normal');
  doc.text(`Agent: ${agentName}`, 14, 32);
  doc.setFontSize(9);
  doc.setTextColor(156, 163, 175);
  doc.text(`Period: ${periodStart} - ${periodEnd}`, 14, 38);
  doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 43);

  // Total calls badge
  doc.setFillColor(30, 41, 59);
  doc.roundedRect(14, 48, 55, 10, 2, 2, 'F');
  doc.setFontSize(8);
  doc.setTextColor(156, 163, 175);
  doc.text('TOTAL CALLS', 16, 53);
  doc.setFontSize(12);
  doc.setTextColor(20, 184, 166);
  doc.setFont('helvetica', 'bold');
  doc.text(String(totalCalls), 65, 55, { align: 'right' });
  doc.setFont('helvetica', 'normal');

  /* ================= METRIC CARDS (2x3) ================= */

  const cardW = 52;
  const cardH = 36;
  const gap = 8;
  const gridW = cardW * 3 + gap * 2;
  const gridX = (pageWidth - gridW) / 2;
  let startY = 64;

  // Row 1
  drawMetricCard(gridX, startY, cardW, cardH,
    'Issue Resolved', `${getKpiRate('issue_resolved')}%`,
    `${getKpiCount('issue_resolved')} calls`, [20, 184, 166]);

  drawMetricCard(gridX + cardW + gap, startY, cardW, cardH,
    'Hallucination', `${getKpiRate('hallucination')}%`,
    `${getKpiCount('hallucination')} calls`, [251, 146, 60]);

  drawMetricCard(gridX + (cardW + gap) * 2, startY, cardW, cardH,
    'Gibberish', `${getKpiRate('gibberish')}%`,
    `${getKpiCount('gibberish')} calls`, [168, 85, 247]);

  // Row 2
  startY += cardH + gap;

  drawMetricCard(gridX, startY, cardW, cardH,
    'Avg Latency', `${getKpiValue('avg_latency', 'value')} ms`,
    `${getKpiValue('avg_latency', 'count')} calls`, [236, 72, 153]);

  const durationStr = avgDuration >= 60
    ? `${Math.floor(avgDuration / 60)}m ${Math.round(avgDuration % 60)}s`
    : `${Math.round(avgDuration)}s`;
  drawMetricCard(gridX + cardW + gap, startY, cardW, cardH,
    'Avg Duration', durationStr,
    `${totalCalls} calls`, [59, 130, 246]);

  drawMetricCard(gridX + (cardW + gap) * 2, startY, cardW, cardH,
    'Early Termination', `${earlyTermination.count}`,
    `${Math.round(earlyTermination.rate * 100)}% of calls`, [239, 68, 68]);

  /* ================= DETAILED METRICS TABLE ================= */

  let tableY = startY + cardH + 15;

  doc.setFontSize(12);
  doc.setTextColor(20, 184, 166);
  doc.setFont('helvetica', 'bold');
  doc.text('Detailed Metrics', 14, tableY);

  const metricsRows = [
    ['Issue Resolved', `${getKpiRate('issue_resolved')}%`, String(getKpiCount('issue_resolved')), `${getKpiCount('issue_resolved')}/${totalCalls}`],
    ['Hallucination Detected', `${getKpiRate('hallucination')}%`, String(getKpiCount('hallucination')), `${getKpiCount('hallucination')}/${totalCalls}`],
    ['Gibberish Detected', `${getKpiRate('gibberish')}%`, String(getKpiCount('gibberish')), `${getKpiCount('gibberish')}/${totalCalls}`],
    ['Average Latency', `${getKpiValue('avg_latency', 'value')} ms`, String(getKpiValue('avg_latency', 'count')), 'N/A'],
    ['Average Duration', durationStr, String(totalCalls), 'N/A'],
    ['Early Termination', String(earlyTermination.count), String(totalCalls), `${Math.round(earlyTermination.rate * 100)}%`],
  ];

  autoTable(doc, {
    startY: tableY + 5,
    head: [['Metric', 'Value', 'Count', 'Rate']],
    body: metricsRows,
    theme: 'grid',
    headStyles: { fillColor: [20, 184, 166], textColor: [255, 255, 255], fontSize: 10, fontStyle: 'bold' },
    bodyStyles: { fillColor: [30, 41, 59], textColor: [229, 231, 235], fontSize: 9 },
    alternateRowStyles: { fillColor: [31, 41, 55] },
    margin: { left: 14, right: 14 },
    tableLineColor: [55, 65, 81],
    tableLineWidth: 0.5,
  });

  /* ================= ABANDONMENT REASONS TABLE ================= */

  const abandonmentData = kpis?.abandonment_reason?.distribution ?? {};
  if (Object.keys(abandonmentData).length > 0) {
    const currentY = doc.lastAutoTable.finalY + 10;

    doc.setFontSize(12);
    doc.setTextColor(20, 184, 166);
    doc.setFont('helvetica', 'bold');
    doc.text('Abandonment Reasons', 14, currentY);

    const abandonmentRows = Object.entries(abandonmentData).map(([key, value]) => [
      key.charAt(0).toUpperCase() + key.slice(1),
      String(value),
      totalCalls > 0 ? `${Math.round((value / totalCalls) * 100)}%` : '0%',
    ]);

    autoTable(doc, {
      startY: currentY + 5,
      head: [['Reason', 'Calls', '% of Total']],
      body: abandonmentRows,
      theme: 'grid',
      headStyles: { fillColor: [15, 118, 110], textColor: [255, 255, 255], fontSize: 10, fontStyle: 'bold' },
      bodyStyles: { fillColor: [30, 41, 59], textColor: [229, 231, 235], fontSize: 9 },
      alternateRowStyles: { fillColor: [31, 41, 55] },
      margin: { left: 14, right: 14 },
      tableLineColor: [55, 65, 81],
      tableLineWidth: 0.5,
    });
  }

  /* ================= EARLY TERMINATION DETAILS ================= */

  if (earlyTermination.calls && earlyTermination.calls.length > 0) {
    // Check if we need a new page
    const prevY = doc.lastAutoTable?.finalY ?? tableY;
    const spaceNeeded = earlyTermination.calls.length * 12 + 30;
    let etY;

    if (pageHeight - prevY - 20 < spaceNeeded) {
      doc.addPage();
      doc.setFillColor(17, 24, 39);
      doc.rect(0, 0, pageWidth, pageHeight, 'F');
      doc.setFillColor(20, 184, 166);
      doc.rect(0, 0, pageWidth, 12, 'F');
      doc.setFontSize(14);
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.text('VoiceEval', 14, 8);
      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');
      doc.text(username, pageWidth - 14, 8, { align: 'right' });
      etY = 25;
    } else {
      etY = prevY + 12;
    }

    doc.setFontSize(12);
    doc.setTextColor(239, 68, 68);
    doc.setFont('helvetica', 'bold');
    doc.text(`Early Termination Details (${earlyTermination.count} calls)`, 14, etY);

    const etRows = earlyTermination.calls.map((c) => [
      c.call_id || '--',
      (c.reasoning || 'No reasoning provided').substring(0, 120),
    ]);

    autoTable(doc, {
      startY: etY + 5,
      head: [['Call ID', 'Reasoning']],
      body: etRows,
      theme: 'grid',
      headStyles: { fillColor: [153, 27, 27], textColor: [255, 255, 255], fontSize: 10, fontStyle: 'bold' },
      bodyStyles: { fillColor: [30, 41, 59], textColor: [229, 231, 235], fontSize: 8 },
      alternateRowStyles: { fillColor: [31, 41, 55] },
      margin: { left: 14, right: 14 },
      tableLineColor: [55, 65, 81],
      tableLineWidth: 0.5,
      columnStyles: {
        0: { cellWidth: 40 },
        1: { cellWidth: 'auto' },
      },
    });
  }

  /* ================= HALLUCINATION DETAILS ================= */

  if (hallucinations.items && hallucinations.items.length > 0) {
    const prevY = doc.lastAutoTable?.finalY ?? tableY;
    const spaceNeeded = hallucinations.items.length * 15 + 30;
    let halY;

    if (pageHeight - prevY - 20 < spaceNeeded) {
      doc.addPage();
      doc.setFillColor(17, 24, 39);
      doc.rect(0, 0, pageWidth, pageHeight, 'F');
      doc.setFillColor(20, 184, 166);
      doc.rect(0, 0, pageWidth, 12, 'F');
      doc.setFontSize(14);
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.text('VoiceEval', 14, 8);
      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');
      doc.text(username, pageWidth - 14, 8, { align: 'right' });
      halY = 25;
    } else {
      halY = prevY + 12;
    }

    doc.setFontSize(12);
    doc.setTextColor(251, 146, 60);
    doc.setFont('helvetica', 'bold');
    doc.text(`Hallucinations Found (${hallucinations.count} calls)`, 14, halY);

    const halRows = hallucinations.items.map((item) => {
      const texts = (item.hallucination_texts || []).join('; ').substring(0, 150) || '--';
      return [
        item.call_id || '--',
        texts,
        (item.reasoning || '').substring(0, 100),
      ];
    });

    autoTable(doc, {
      startY: halY + 5,
      head: [['Call ID', 'Hallucinations', 'Reasoning']],
      body: halRows,
      theme: 'grid',
      headStyles: { fillColor: [180, 83, 9], textColor: [255, 255, 255], fontSize: 10, fontStyle: 'bold' },
      bodyStyles: { fillColor: [30, 41, 59], textColor: [229, 231, 235], fontSize: 8 },
      alternateRowStyles: { fillColor: [31, 41, 55] },
      margin: { left: 14, right: 14 },
      tableLineColor: [55, 65, 81],
      tableLineWidth: 0.5,
      columnStyles: {
        0: { cellWidth: 35 },
        1: { cellWidth: 80 },
        2: { cellWidth: 'auto' },
      },
    });
  }

  /* ================= FOOTERS ================= */

  const pageCount = doc.internal.getNumberOfPages();

  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);

    doc.setDrawColor(55, 65, 81);
    doc.setLineWidth(0.5);
    doc.line(14, pageHeight - 15, pageWidth - 14, pageHeight - 15);

    doc.setFontSize(8);
    doc.setTextColor(107, 114, 128);
    doc.setFont('helvetica', 'normal');
    doc.text(
      `VoiceEval Report - Page ${i} of ${pageCount}`,
      pageWidth / 2,
      pageHeight - 10,
      { align: 'center' }
    );
    doc.text(
      `Generated on ${new Date().toLocaleDateString()}`,
      pageWidth - 14,
      pageHeight - 10,
      { align: 'right' }
    );
  }

  /* ================= SAVE ================= */

  const dateStr = new Date().toISOString().split('T')[0];
  const safeName = agentName.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 30);
  const filename = `voiceeval-report-${safeName}-${dateStr}.pdf`;
  doc.save(filename);
};
