import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export const exportKPIsToPDF = (data, activeFilters = {}, username = 'User') => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // Safely extract data with fallbacks
  const kpis = data?.kpis ?? {};
  
  // Safe accessor for KPI values
  const getKpiValue = (key, prop) => kpis?.[key]?.[prop] ?? 0;
  const getKpiRate = (key) => Math.round((getKpiValue(key, 'rate')) * 100);
  const getKpiCount = (key) => getKpiValue(key, 'count');
  
  // Calculate totalCalls - use provided value or derive from KPIs
  let totalCalls = data?.totalCalls ?? 0;
  if (totalCalls === 0) {
    const counts = [
      getKpiValue('issue_resolved', 'count'),
      getKpiValue('hallucination', 'count'),
      getKpiValue('gibberish', 'count'),
      getKpiValue('disc_offered', 'count'),
      getKpiValue('avg_latency', 'count')
    ];
    totalCalls = Math.max(...counts, 0);
  }

  /* ================= HELPER FUNCTIONS ================= */
  
  // Draw a metric card with large percentage/value
  const drawMetricCard = (x, y, width, height, title, value, subtitle, color = [20, 184, 166]) => {
    // Card background
    doc.setFillColor(30, 41, 59);
    doc.roundedRect(x, y, width, height, 3, 3, 'F');
    
    // Border
    doc.setDrawColor(55, 65, 81);
    doc.setLineWidth(0.5);
    doc.roundedRect(x, y, width, height, 3, 3, 'S');
    
    // Title
    doc.setFontSize(8);
    doc.setTextColor(156, 163, 175);
    doc.text(title.toUpperCase(), x + width / 2, y + 8, { align: 'center' });
    
    // Large value - adjust font size based on value length
    const valueLength = value.toString().length;
    let fontSize = 32;
    if (valueLength > 8) {
      fontSize = 24;  // Smaller font for long values like "2101.61 ms"
    } else if (valueLength > 6) {
      fontSize = 28;
    }
    
    doc.setFontSize(fontSize);
    doc.setTextColor(color[0], color[1], color[2]);
    doc.setFont('helvetica', 'bold');
    doc.text(value, x + width / 2, y + height / 2 + 5, { align: 'center' });
    
    // Subtitle
    doc.setFontSize(9);
    doc.setTextColor(107, 114, 128);
    doc.setFont('helvetica', 'normal');
    doc.text(subtitle, x + width / 2, y + height - 8, { align: 'center' });
  };

 // Draw a donut chart for abandonment reasons
// Draw a donut chart for abandonment reasons
const drawDonutChart = (x, y, radius, data, colors) => {
  const total = Object.values(data).reduce((sum, val) => sum + val, 0);
  if (total === 0) return;

  let currentAngle = -90; // Start from top

  Object.entries(data).forEach(([key, value], index) => {
    const sliceAngle = (value / total) * 360;
    const colorIdx = index % colors.length;
    
    // Skip slices that are too small to render
    if (sliceAngle < 0.5) {
      currentAngle += sliceAngle;
      return;
    }

    const startAngle = (currentAngle * Math.PI) / 180;
    const endAngle = ((currentAngle + sliceAngle) * Math.PI) / 180;
    
    // Draw the slice using triangles/polygons
    const innerRadius = radius * 0.55;
    const outerRadius = radius;
    
    // Number of segments to approximate the arc (more = smoother)
    const numSegments = Math.max(Math.ceil(sliceAngle / 3), 2);
    const angleIncrement = (sliceAngle * Math.PI / 180) / numSegments;
    
    doc.setFillColor(colors[colorIdx][0], colors[colorIdx][1], colors[colorIdx][2]);
    
    // Draw the slice as a series of quadrilaterals
    for (let i = 0; i < numSegments; i++) {
      const angle1 = startAngle + (i * angleIncrement);
      const angle2 = startAngle + ((i + 1) * angleIncrement);
      
      // Calculate the four corners of each segment
      const innerX1 = x + innerRadius * Math.cos(angle1);
      const innerY1 = y + innerRadius * Math.sin(angle1);
      const outerX1 = x + outerRadius * Math.cos(angle1);
      const outerY1 = y + outerRadius * Math.sin(angle1);
      
      const innerX2 = x + innerRadius * Math.cos(angle2);
      const innerY2 = y + innerRadius * Math.sin(angle2);
      const outerX2 = x + outerRadius * Math.cos(angle2);
      const outerY2 = y + outerRadius * Math.sin(angle2);
      
      // Draw as two triangles to form a quadrilateral
      doc.triangle(innerX1, innerY1, outerX1, outerY1, outerX2, outerY2, 'F');
      doc.triangle(innerX1, innerY1, outerX2, outerY2, innerX2, innerY2, 'F');
    }
    
    // Add borders between slices for better separation
    doc.setDrawColor(17, 24, 39); // Match background
    doc.setLineWidth(1);
    
    const startInnerX = x + innerRadius * Math.cos(startAngle);
    const startInnerY = y + innerRadius * Math.sin(startAngle);
    const startOuterX = x + outerRadius * Math.cos(startAngle);
    const startOuterY = y + outerRadius * Math.sin(startAngle);
    
    const endInnerX = x + innerRadius * Math.cos(endAngle);
    const endInnerY = y + innerRadius * Math.sin(endAngle);
    const endOuterX = x + outerRadius * Math.cos(endAngle);
    const endOuterY = y + outerRadius * Math.sin(endAngle);
    
    // Draw radial lines at slice boundaries
    doc.line(startInnerX, startInnerY, startOuterX, startOuterY);
    doc.line(endInnerX, endInnerY, endOuterX, endOuterY);

    // Add label with value and percentage (only if slice is large enough)
    if (sliceAngle > 15) { // Only show label if slice is > 15 degrees
      const midAngle = ((currentAngle + sliceAngle / 2) * Math.PI) / 180;
      const labelRadius = radius * 0.78;
      const labelX = x + labelRadius * Math.cos(midAngle);
      const labelY = y + labelRadius * Math.sin(midAngle);
      
      const percentage = Math.round((value / total) * 100);
      
      // Draw value with shadow/outline effect for better readability
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      
      // Shadow/outline (dark)
      doc.setTextColor(0, 0, 0);
      doc.text(`${value}`, labelX + 0.3, labelY + 0.3, { align: 'center' });
      doc.text(`${value}`, labelX - 0.3, labelY - 0.3, { align: 'center' });
      
      // Main text (white)
      doc.setTextColor(255, 255, 255);
      doc.text(`${value}`, labelX, labelY, { align: 'center' });
      
      // Draw percentage below
      doc.setFontSize(7);
      doc.setFont('helvetica', 'normal');
      
      // Shadow
      doc.setTextColor(0, 0, 0);
      doc.text(`${percentage}%`, labelX + 0.2, labelY + 4.2, { align: 'center' });
      
      // Main text
      doc.setTextColor(255, 255, 255);
      doc.text(`${percentage}%`, labelX, labelY + 4, { align: 'center' });
    }

    currentAngle += sliceAngle;
  });

  // Draw center circle (donut hole)
  doc.setFillColor(17, 24, 39);
  doc.circle(x, y, radius * 0.55, 'F');
  
  // Add subtle border to center
  doc.setDrawColor(55, 65, 81);
  doc.setLineWidth(0.5);
  doc.circle(x, y, radius * 0.55, 'S');

  // Total in center with better styling
  doc.setFontSize(22);
  doc.setTextColor(20, 184, 166);
  doc.setFont('helvetica', 'bold');
  doc.text(total.toString(), x, y + 1, { align: 'center' });
  
  doc.setFontSize(7);
  doc.setTextColor(156, 163, 175);
  doc.setFont('helvetica', 'normal');
  doc.text('TOTAL', x, y + 7, { align: 'center' });
};
  // Draw legend for donut chart
  const drawLegend = (x, y, data, colors) => {
    let offsetY = 0;
    
    Object.entries(data).forEach(([key, value], index) => {
      const colorIdx = index % colors.length;
      
      // Color box
      doc.setFillColor(colors[colorIdx][0], colors[colorIdx][1], colors[colorIdx][2]);
      doc.roundedRect(x, y + offsetY, 4, 4, 1, 1, 'F');
      
      // Label
      doc.setFontSize(9);
      doc.setTextColor(200, 200, 200);
      doc.setFont('helvetica', 'normal');
      const label = key.charAt(0).toUpperCase() + key.slice(1);
      doc.text(`${label} (${value})`, x + 6, y + offsetY + 3);
      
      offsetY += 7;
    });
  };

  /* ================= PAGE 1: HEADER & METRICS ================= */
  
  // Background
  doc.setFillColor(17, 24, 39);
  doc.rect(0, 0, pageWidth, pageHeight, 'F');
  
  // Header bar with teal accent
  doc.setFillColor(20, 184, 166);
  doc.rect(0, 0, pageWidth, 12, 'F');
  
  // VoiceEval branding (left)
  doc.setFontSize(14);
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.text('VoiceEval', 14, 8);
  
  // Username (right)
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.text(username, pageWidth - 14, 8, { align: 'right' });
  
  // Report title
  doc.setFontSize(20);
  doc.setTextColor(20, 184, 166);
  doc.setFont('helvetica', 'bold');
  doc.text('Call Quality KPI Report', 14, 25);
  
  // Generation date
  doc.setFontSize(9);
  doc.setTextColor(156, 163, 175);
  doc.setFont('helvetica', 'normal');
  doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 32);
  
  // Total calls badge
  doc.setFillColor(30, 41, 59);
  doc.roundedRect(14, 38, 50, 10, 2, 2, 'F');
  doc.setFontSize(8);
  doc.setTextColor(156, 163, 175);
  doc.text('TOTAL CALLS', 16, 43);
  doc.setFontSize(12);
  doc.setTextColor(20, 184, 166);
  doc.setFont('helvetica', 'bold');
  doc.text(totalCalls.toString(), 60, 45, { align: 'right' });
  doc.setFont('helvetica', 'normal');

  /* ================= METRIC CARDS - 2x2 GRID ================= */
  
  const cardWidth = 52;  // Increased from 48 to 52
  const cardHeight = 38;
  const startY = 55;
  const gapX = 8;
  const gapY = 8;
  
  // Calculate center position for 2x2 grid
  const gridWidth = (cardWidth * 2) + gapX;
  const gridStartX = (pageWidth - gridWidth) / 2;
  
  // Row 1, Column 1: Issue Resolved
  drawMetricCard(
    gridStartX, startY, cardWidth, cardHeight,
    'ISSUE RESOLVED',
    `${getKpiRate('issue_resolved')}%`,
    `Detected in ${getKpiCount('issue_resolved')} calls`,
    [20, 184, 166]
  );
  
  // Row 1, Column 2: Hallucination
  drawMetricCard(
    gridStartX + cardWidth + gapX, startY, cardWidth, cardHeight,
    'HALLUCINATION',
    `${getKpiRate('hallucination')}%`,
    `Detected in ${getKpiCount('hallucination')} calls`,
    [251, 146, 60]
  );
  
  // Row 2, Column 1: Gibberish
  drawMetricCard(
    gridStartX, startY + cardHeight + gapY, cardWidth, cardHeight,
    'GIBBERISH',
    `${getKpiRate('gibberish')}%`,
    `Detected in ${getKpiCount('gibberish')} calls`,
    [168, 85, 247]
  );
  
  // Row 2, Column 2: Average Latency
  drawMetricCard(
    gridStartX + cardWidth + gapX, startY + cardHeight + gapY, cardWidth, cardHeight,
    'AVG LATENCY',
    `${getKpiValue('avg_latency', 'value')} ms`,
    `Across ${getKpiValue('avg_latency', 'count')} calls`,
    [236, 72, 153]
  );

  /* ================= ABANDONMENT REASON DONUT CHART (CENTERED BELOW) ================= */
  
  const chartStartY = startY + (cardHeight * 2) + (gapY * 2) + 5;
  const chartWidth = 180;
  const chartHeight = 55;
  const chartStartX = (pageWidth - chartWidth) / 2;
  
  // Chart container background
  doc.setFillColor(30, 41, 59);
  doc.roundedRect(chartStartX, chartStartY, chartWidth, chartHeight, 3, 3, 'F');
  doc.setDrawColor(55, 65, 81);
  doc.setLineWidth(0.5);
  doc.roundedRect(chartStartX, chartStartY, chartWidth, chartHeight, 3, 3, 'S');
  
  // Chart title
  doc.setFontSize(10);
  doc.setTextColor(156, 163, 175);
  doc.setFont('helvetica', 'bold');
  doc.text('ABANDONMENT REASON', chartStartX + chartWidth / 2, chartStartY + 8, { align: 'center' });
  
  // Chart colors matching the teal theme
  const chartColors = [
    [20, 184, 166],   // teal-500
    [13, 148, 136],   // teal-600
    [15, 118, 110],   // teal-700
    [17, 94, 89],     // teal-800
    [19, 78, 74],     // teal-900
    [4, 47, 46],      // teal-950
  ];
  
  const abandonmentData = kpis?.abandonment_reason?.distribution ?? {};
  
  if (Object.keys(abandonmentData).length > 0) {
    const chartCenterX = chartStartX + 35;
    const chartCenterY = chartStartY + 32;
    
    drawDonutChart(chartCenterX, chartCenterY, 18, abandonmentData, chartColors);
    
    // Legend (positioned to the right of donut) - in 2 columns for better fit
    const legendStartX = chartCenterX + 30;
    const legendStartY = chartCenterY - 20;
    
    const abandonmentEntries = Object.entries(abandonmentData);
    const midPoint = Math.ceil(abandonmentEntries.length / 2);
    
    // Left column
    abandonmentEntries.slice(0, midPoint).forEach(([key, value], index) => {
      const colorIdx = index % chartColors.length;
      const y = legendStartY + (index * 8);
      
      // Color box
      doc.setFillColor(chartColors[colorIdx][0], chartColors[colorIdx][1], chartColors[colorIdx][2]);
      doc.roundedRect(legendStartX, y, 4, 4, 1, 1, 'F');
      
      // Label
      doc.setFontSize(9);
      doc.setTextColor(200, 200, 200);
      doc.setFont('helvetica', 'normal');
      const label = key.charAt(0).toUpperCase() + key.slice(1);
      doc.text(`${label} (${value})`, legendStartX + 6, y + 3);
    });
    
    // Right column
    abandonmentEntries.slice(midPoint).forEach(([key, value], index) => {
      const actualIndex = index + midPoint;
      const colorIdx = actualIndex % chartColors.length;
      const y = legendStartY + (index * 8);
      const x = legendStartX + 55;
      
      // Color box
      doc.setFillColor(chartColors[colorIdx][0], chartColors[colorIdx][1], chartColors[colorIdx][2]);
      doc.roundedRect(x, y, 4, 4, 1, 1, 'F');
      
      // Label
      doc.setFontSize(9);
      doc.setTextColor(200, 200, 200);
      doc.setFont('helvetica', 'normal');
      const label = key.charAt(0).toUpperCase() + key.slice(1);
      doc.text(`${label} (${value})`, x + 6, y + 3);
    });
  } else {
    doc.setFontSize(9);
    doc.setTextColor(107, 114, 128);
    doc.text('No data available', chartStartX + chartWidth / 2, chartStartY + chartHeight / 2, { align: 'center' });
  }

  /* ================= ACTIVE FILTERS (IF ANY) ================= */
  
  const tableStartY = chartStartY + chartHeight + 15;
  
  if (Object.keys(activeFilters).length > 0) {
    const filtersY = tableStartY;
    
    // Section header
    doc.setFontSize(12);
    doc.setTextColor(20, 184, 166);
    doc.setFont('helvetica', 'bold');
    doc.text('Active Filters', 14, filtersY);
    
    // Filters table
    const filterRows = Object.entries(activeFilters).map(([key, value]) => {
      const displayKey = key.replace(/_/g, ' ').toUpperCase();
      const displayValue = value.eq !== undefined ? `= ${value.eq}` : 
                          value.gt !== undefined ? `> ${value.gt}` : 
                          JSON.stringify(value);
      return [displayKey, displayValue];
    });
    
    autoTable(doc, {
      startY: filtersY + 5,
      head: [['Filter', 'Condition']],
      body: filterRows,
      theme: 'grid',
      headStyles: { 
        fillColor: [20, 184, 166],
        textColor: [255, 255, 255],
        fontSize: 9,
        fontStyle: 'bold'
      },
      bodyStyles: {
        fillColor: [30, 41, 59],
        textColor: [229, 231, 235],
        fontSize: 9
      },
      alternateRowStyles: {
        fillColor: [31, 41, 55]
      },
      margin: { left: 14, right: 14 },
      tableLineColor: [55, 65, 81],
      tableLineWidth: 0.5,
    });
  }

  /* ================= DETAILED METRICS TABLE ================= */
  
  const metricsTableY = Object.keys(activeFilters).length > 0 
    ? (doc.lastAutoTable?.finalY ?? tableStartY) + 15 
    : tableStartY;
  
  // Section header
  doc.setFontSize(12);
  doc.setTextColor(20, 184, 166);
  doc.setFont('helvetica', 'bold');
  doc.text('Detailed Metrics Breakdown', 14, metricsTableY);
  
  // Comprehensive metrics table
  const detailedMetrics = [
    ['Metric', 'Value', 'Count', 'Rate'],
    [
      'Issue Resolved',
      getKpiRate('issue_resolved') + '%',
      getKpiCount('issue_resolved'),
      getKpiCount('issue_resolved') + '/' + totalCalls
    ],
    [
      'Hallucination Detected',
      getKpiRate('hallucination') + '%',
      getKpiCount('hallucination'),
      getKpiCount('hallucination') + '/' + totalCalls
    ],
    [
      'Gibberish Detected',
      getKpiRate('gibberish') + '%',
      getKpiCount('gibberish'),
      getKpiCount('gibberish') + '/' + totalCalls
    ],
    [
      'Discount Offered',
      getKpiRate('disc_offered') + '%',
      getKpiCount('disc_offered'),
      getKpiCount('disc_offered') + '/' + totalCalls
    ],
    [
      'Average Latency',
      getKpiValue('avg_latency', 'value') + ' ms',
      getKpiValue('avg_latency', 'count'),
      'N/A'
    ],
  ];
  
  autoTable(doc, {
    startY: metricsTableY + 5,
    head: [detailedMetrics[0]],
    body: detailedMetrics.slice(1),
    theme: 'grid',
    headStyles: { 
      fillColor: [20, 184, 166],
      textColor: [255, 255, 255],
      fontSize: 10,
      fontStyle: 'bold'
    },
    bodyStyles: {
      fillColor: [30, 41, 59],
      textColor: [229, 231, 235],
      fontSize: 9
    },
    alternateRowStyles: {
      fillColor: [31, 41, 55]
    },
    margin: { left: 14, right: 14 },
    tableLineColor: [55, 65, 81],
    tableLineWidth: 0.5,
  });
  
  // Check if we need a new page for abandonment breakdown
  const currentY = doc.lastAutoTable.finalY;
  const remainingSpace = pageHeight - currentY - 30; // 30 for footer space
  
  // Abandonment reasons breakdown
  const abandonmentDataTable = kpis?.abandonment_reason?.distribution ?? {};
  if (Object.keys(abandonmentDataTable).length > 0) {
    const abandonmentRows = Object.entries(abandonmentDataTable).map(([key, value]) => [
      key.charAt(0).toUpperCase() + key.slice(1),
      value,
      Math.round((value / totalCalls) * 100) + '%'
    ]);
    
    // Estimate if table will fit (rough estimate: 10 per row + 15 for header)
    const estimatedTableHeight = (abandonmentRows.length * 10) + 25;
    
    if (estimatedTableHeight > remainingSpace) {
      // Add new page if needed
      doc.addPage();
      
      // Background for new page
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
      
      doc.setFontSize(12);
      doc.setTextColor(20, 184, 166);
      doc.setFont('helvetica', 'bold');
      doc.text('Abandonment Reason Breakdown', 14, 25);
      
      autoTable(doc, {
        startY: 30,
        head: [['Abandonment Reason', 'Calls', '% of Total']],
        body: abandonmentRows,
        theme: 'grid',
        headStyles: { 
          fillColor: [15, 118, 110],
          textColor: [255, 255, 255],
          fontSize: 10,
          fontStyle: 'bold'
        },
        bodyStyles: {
          fillColor: [30, 41, 59],
          textColor: [229, 231, 235],
          fontSize: 9
        },
        alternateRowStyles: {
          fillColor: [31, 41, 55]
        },
        margin: { left: 14, right: 14 },
        tableLineColor: [55, 65, 81],
        tableLineWidth: 0.5,
      });
    } else {
      // Fits on same page
      autoTable(doc, {
        startY: currentY + 10,
        head: [['Abandonment Reason', 'Calls', '% of Total']],
        body: abandonmentRows,
        theme: 'grid',
        headStyles: { 
          fillColor: [15, 118, 110],
          textColor: [255, 255, 255],
          fontSize: 10,
          fontStyle: 'bold'
        },
        bodyStyles: {
          fillColor: [30, 41, 59],
          textColor: [229, 231, 235],
          fontSize: 9
        },
        alternateRowStyles: {
          fillColor: [31, 41, 55]
        },
        margin: { left: 14, right: 14 },
        tableLineColor: [55, 65, 81],
        tableLineWidth: 0.5,
      });
    }
  }

  /* ================= FOOTER ================= */
  
  const pageCount = doc.internal.getNumberOfPages();
  
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    
    // Footer line
    doc.setDrawColor(55, 65, 81);
    doc.setLineWidth(0.5);
    doc.line(14, pageHeight - 15, pageWidth - 14, pageHeight - 15);
    
    // Footer text
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

  /* ================= SAVE PDF ================= */
  
  const filename = `voiceeval-kpi-report-${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(filename);
};