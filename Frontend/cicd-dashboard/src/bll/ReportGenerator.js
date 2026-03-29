// ============================================================
// BLL Module: ReportGenerator.js
// Business Logic Layer — Analytics, Filtering & Report Generation
// ============================================================

import { pipelines, builds, failures } from '../data/mockData.js';

const REPORT_TYPES      = ['Pipeline Summary', 'Build Report', 'Failure Analysis', 'Recovery Report', 'Full Audit Log', 'Recovery Statistics'];
const EXPORT_FORMATS    = ['PDF', 'CSV', 'JSON'];
const MAX_DATE_RANGE_DAYS = 365;
const MIN_DATE_RANGE_DAYS = 1;

export function validateReportForm(reportForm) {
  const errors = [];
  if (!REPORT_TYPES.includes(reportForm.reportType)) {
    errors.push(`Report type must be one of: ${REPORT_TYPES.join(', ')}`);
  }
  if (reportForm.startDate && reportForm.endDate) {
    const start = new Date(reportForm.startDate);
    const end   = new Date(reportForm.endDate);
    const diffDays = Math.floor((end - start) / (1000 * 60 * 60 * 24));
    if (end <= start) errors.push('End date must be after start date.');
    if (diffDays > MAX_DATE_RANGE_DAYS) errors.push(`Date range cannot exceed ${MAX_DATE_RANGE_DAYS} days.`);
  }
  if (reportForm.format && !EXPORT_FORMATS.includes(reportForm.format)) {
    errors.push(`Export format must be one of: ${EXPORT_FORMATS.join(', ')}`);
  }
  return { isValid: errors.length === 0, errors };
}

export function getWeeklyChartData() {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const dayCounts = {};
  days.forEach(d => { dayCounts[d] = { day: d, passed: 0, failed: 0 }; });

  pipelines.forEach(p => {
    if (!p.startedAt) return;
    const date = new Date(p.startedAt);
    const dayIdx = date.getDay() === 0 ? 6 : date.getDay() - 1;
    const dayName = days[dayIdx];
    if (!dayName) return;
    if (p.status === 'success') dayCounts[dayName].passed++;
    else if (p.status === 'failed') dayCounts[dayName].failed++;
  });

  return days.map(d => dayCounts[d]);
}

export function filterByDateRange(startDate, endDate) {
  const start = new Date(startDate);
  const end   = new Date(endDate);
  return pipelines.filter(p => {
    if (!p.startedAt) return false;
    const d = new Date(p.startedAt);
    return d >= start && d <= end;
  });
}

export function generateReport(reportForm) {
  const validation = validateReportForm(reportForm);
  if (!validation.isValid) {
    return { success: false, report: null, message: 'Validation failed.', errors: validation.errors };
  }

  const report = {
    reportId:    `RPT-${Date.now()}`,
    type:        reportForm.reportType,
    format:      reportForm.format || 'PDF',
    generatedAt: new Date().toISOString(),
    generatedBy: 'Admin',
    summary: {
      totalPipelines: pipelines.length,
      passed: pipelines.filter(p => p.status === 'success').length,
      failed: pipelines.filter(p => p.status === 'failed').length,
    },
  };

  return {
    success: true,
    report,
    message: `Report generated: ${reportForm.reportType}`,
    errors: [],
  };
}

export function getReportStats() {
  const total = pipelines.length;
  const passed = pipelines.filter(p => p.status === 'success').length;
  const successRate = total > 0 ? `${Math.round((passed / total) * 100)}%` : 'N/A';

  return {
    totalReports: 34,
    pipelineSuccessRate: successRate,
    totalFailures: failures.length,
    totalBuilds: builds.length,
  };
}
