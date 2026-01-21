/**
 * QA REPORT GENERATOR - Doutor Motors
 * 
 * Gera relatório consolidado de todos os testes QA
 * Uso: npx playwright test e2e/qa-*.spec.ts --reporter=json > qa-results.json && npx ts-node e2e/qa-report-generator.ts
 */

import * as fs from 'fs';
import * as path from 'path';

interface TestResult {
  title: string;
  status: 'passed' | 'failed' | 'skipped' | 'timedOut';
  duration: number;
  errors?: string[];
}

interface TestSuite {
  title: string;
  tests: TestResult[];
}

interface QAReport {
  timestamp: string;
  summary: {
    total: number;
    passed: number;
    failed: number;
    skipped: number;
    passRate: string;
  };
  categories: {
    name: string;
    passed: number;
    failed: number;
    skipped: number;
    tests: {
      name: string;
      status: string;
      duration: string;
      error?: string;
    }[];
  }[];
}

export function generateQAReport(jsonResults: any): QAReport {
  const suites = jsonResults.suites || [];
  const categories: QAReport['categories'] = [];
  
  let totalPassed = 0;
  let totalFailed = 0;
  let totalSkipped = 0;
  
  function processSpecs(specs: any[], categoryName: string) {
    const categoryTests: QAReport['categories'][0]['tests'] = [];
    let catPassed = 0;
    let catFailed = 0;
    let catSkipped = 0;
    
    for (const spec of specs) {
      const test = spec.tests?.[0] || spec;
      const results = test.results || [];
      const lastResult = results[results.length - 1] || {};
      
      let status = 'passed';
      if (lastResult.status === 'skipped') {
        status = 'skipped';
        catSkipped++;
        totalSkipped++;
      } else if (lastResult.status === 'failed' || lastResult.status === 'timedOut') {
        status = 'failed';
        catFailed++;
        totalFailed++;
      } else {
        catPassed++;
        totalPassed++;
      }
      
      categoryTests.push({
        name: spec.title || test.title || 'Unknown',
        status: status === 'passed' ? '✅ OK' : status === 'failed' ? '❌ FALHA' : '⚪ PULADO',
        duration: `${(lastResult.duration || 0)}ms`,
        error: lastResult.errors?.[0]?.message,
      });
    }
    
    if (categoryTests.length > 0) {
      categories.push({
        name: categoryName,
        passed: catPassed,
        failed: catFailed,
        skipped: catSkipped,
        tests: categoryTests,
      });
    }
  }
  
  function processSuite(suite: any) {
    const title = suite.title || 'Unknown';
    const specs = suite.specs || [];
    const suites = suite.suites || [];
    
    if (specs.length > 0) {
      processSpecs(specs, title);
    }
    
    for (const childSuite of suites) {
      processSuite(childSuite);
    }
  }
  
  for (const suite of suites) {
    processSuite(suite);
  }
  
  const total = totalPassed + totalFailed + totalSkipped;
  const passRate = total > 0 ? ((totalPassed / (totalPassed + totalFailed)) * 100).toFixed(1) : '0';
  
  return {
    timestamp: new Date().toISOString(),
    summary: {
      total,
      passed: totalPassed,
      failed: totalFailed,
      skipped: totalSkipped,
      passRate: `${passRate}%`,
    },
    categories,
  };
}

export function formatReportAsText(report: QAReport): string {
  const lines: string[] = [];
  
  lines.push('═'.repeat(80));
  lines.push('              RELATÓRIO DE QA - DOUTOR MOTORS');
  lines.push('═'.repeat(80));
  lines.push(`Data: ${new Date(report.timestamp).toLocaleString('pt-BR')}`);
  lines.push('─'.repeat(80));
  lines.push('');
  lines.push('RESUMO EXECUTIVO');
  lines.push('─'.repeat(40));
  lines.push(`  Total de Testes: ${report.summary.total}`);
  lines.push(`  ✅ Passou: ${report.summary.passed}`);
  lines.push(`  ❌ Falhou: ${report.summary.failed}`);
  lines.push(`  ⚪ Pulados: ${report.summary.skipped}`);
  lines.push(`  📊 Taxa de Sucesso: ${report.summary.passRate}`);
  lines.push('');
  
  for (const category of report.categories) {
    lines.push('─'.repeat(80));
    lines.push(`📁 ${category.name}`);
    lines.push(`   Passou: ${category.passed} | Falhou: ${category.failed} | Pulados: ${category.skipped}`);
    lines.push('');
    
    for (const test of category.tests) {
      lines.push(`   ${test.status} ${test.name} (${test.duration})`);
      if (test.error) {
        lines.push(`      ⚠️  ${test.error.substring(0, 100)}...`);
      }
    }
    lines.push('');
  }
  
  lines.push('═'.repeat(80));
  lines.push('                    FIM DO RELATÓRIO');
  lines.push('═'.repeat(80));
  
  return lines.join('\n');
}

export function formatReportAsHTML(report: QAReport): string {
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Relatório QA - Doutor Motors</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0f172a; color: #e2e8f0; padding: 2rem; }
    .container { max-width: 1200px; margin: 0 auto; }
    h1 { text-align: center; color: #f59e0b; margin-bottom: 2rem; }
    .summary { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 1rem; margin-bottom: 2rem; }
    .stat { background: #1e293b; padding: 1.5rem; border-radius: 0.5rem; text-align: center; }
    .stat-value { font-size: 2rem; font-weight: bold; }
    .stat-label { color: #94a3b8; font-size: 0.875rem; }
    .passed { color: #22c55e; }
    .failed { color: #ef4444; }
    .skipped { color: #64748b; }
    .category { background: #1e293b; border-radius: 0.5rem; margin-bottom: 1rem; overflow: hidden; }
    .category-header { padding: 1rem; background: #334155; display: flex; justify-content: space-between; align-items: center; }
    .category-title { font-weight: bold; }
    .category-stats { font-size: 0.875rem; color: #94a3b8; }
    .test-list { padding: 1rem; }
    .test-item { padding: 0.5rem 0; border-bottom: 1px solid #334155; display: flex; justify-content: space-between; }
    .test-item:last-child { border-bottom: none; }
    .test-name { flex: 1; }
    .test-status { font-weight: bold; margin-right: 1rem; }
    .test-duration { color: #64748b; font-size: 0.875rem; }
    .timestamp { text-align: center; color: #64748b; margin-top: 2rem; }
    .pass-rate { font-size: 3rem; color: #f59e0b; }
  </style>
</head>
<body>
  <div class="container">
    <h1>🔧 Relatório de QA - Doutor Motors</h1>
    
    <div class="summary">
      <div class="stat">
        <div class="stat-value pass-rate">${report.summary.passRate}</div>
        <div class="stat-label">Taxa de Sucesso</div>
      </div>
      <div class="stat">
        <div class="stat-value">${report.summary.total}</div>
        <div class="stat-label">Total de Testes</div>
      </div>
      <div class="stat">
        <div class="stat-value passed">${report.summary.passed}</div>
        <div class="stat-label">Passou</div>
      </div>
      <div class="stat">
        <div class="stat-value failed">${report.summary.failed}</div>
        <div class="stat-label">Falhou</div>
      </div>
      <div class="stat">
        <div class="stat-value skipped">${report.summary.skipped}</div>
        <div class="stat-label">Pulados</div>
      </div>
    </div>
    
    ${report.categories.map(cat => `
    <div class="category">
      <div class="category-header">
        <span class="category-title">📁 ${cat.name}</span>
        <span class="category-stats">✅ ${cat.passed} | ❌ ${cat.failed} | ⚪ ${cat.skipped}</span>
      </div>
      <div class="test-list">
        ${cat.tests.map(test => `
        <div class="test-item">
          <span class="test-status ${test.status.includes('OK') ? 'passed' : test.status.includes('FALHA') ? 'failed' : 'skipped'}">${test.status}</span>
          <span class="test-name">${test.name}</span>
          <span class="test-duration">${test.duration}</span>
        </div>
        `).join('')}
      </div>
    </div>
    `).join('')}
    
    <div class="timestamp">
      Gerado em: ${new Date(report.timestamp).toLocaleString('pt-BR')}
    </div>
  </div>
</body>
</html>`;
}

// Main execution
if (require.main === module) {
  const resultsPath = process.argv[2] || 'qa-results.json';
  
  if (!fs.existsSync(resultsPath)) {
    console.error(`Arquivo não encontrado: ${resultsPath}`);
    console.log('Execute: npx playwright test e2e/qa-*.spec.ts --reporter=json > qa-results.json');
    process.exit(1);
  }
  
  const jsonData = JSON.parse(fs.readFileSync(resultsPath, 'utf-8'));
  const report = generateQAReport(jsonData);
  
  // Generate text report
  const textReport = formatReportAsText(report);
  console.log(textReport);
  fs.writeFileSync('qa-report.txt', textReport);
  
  // Generate HTML report
  const htmlReport = formatReportAsHTML(report);
  fs.writeFileSync('qa-report.html', htmlReport);
  
  console.log('\n📄 Relatórios gerados:');
  console.log('  - qa-report.txt');
  console.log('  - qa-report.html');
}
