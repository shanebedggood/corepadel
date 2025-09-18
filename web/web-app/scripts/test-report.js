#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

/**
 * Generate comprehensive test report
 */
function generateTestReport() {
  console.log('🧪 Generating Test Coverage Report...\n');
  
  try {
    // Run unit tests with coverage
    console.log('📊 Running unit tests with coverage...');
    execSync('npm run test:coverage:ci', { stdio: 'inherit' });
    
    // Generate coverage badge
    console.log('\n🏆 Generating coverage badge...');
    execSync('npm run test:coverage:badge', { stdio: 'inherit' });
    
    // Check if coverage thresholds are met
    const coveragePath = path.join(__dirname, '../coverage/coverage-summary.json');
    if (fs.existsSync(coveragePath)) {
      const coverage = JSON.parse(fs.readFileSync(coveragePath, 'utf8'));
      const total = coverage.total;
      
      console.log('\n📈 Coverage Summary:');
      console.log(`Lines: ${total.lines.pct}% (${total.lines.covered}/${total.lines.total})`);
      console.log(`Functions: ${total.functions.pct}% (${total.functions.covered}/${total.functions.total})`);
      console.log(`Branches: ${total.branches.pct}% (${total.branches.covered}/${total.branches.total})`);
      console.log(`Statements: ${total.statements.pct}% (${total.statements.covered}/${total.statements.total})`);
      
      // Check thresholds
      const thresholds = {
        lines: 70,
        functions: 70,
        branches: 70,
        statements: 70
      };
      
      let allThresholdsMet = true;
      for (const [metric, threshold] of Object.entries(thresholds)) {
        if (total[metric].pct < threshold) {
          console.log(`❌ ${metric} coverage (${total[metric].pct}%) below threshold (${threshold}%)`);
          allThresholdsMet = false;
        } else {
          console.log(`✅ ${metric} coverage (${total[metric].pct}%) meets threshold (${threshold}%)`);
        }
      }
      
      if (allThresholdsMet) {
        console.log('\n🎉 All coverage thresholds met!');
      } else {
        console.log('\n⚠️  Some coverage thresholds not met. Consider adding more tests.');
        process.exit(1);
      }
    }
    
    console.log('\n📁 Coverage reports generated in:');
    console.log('  - HTML: coverage/html/index.html');
    console.log('  - LCOV: coverage/lcov/lcov.info');
    console.log('  - JSON: coverage/json/coverage-final.json');
    
  } catch (error) {
    console.error('❌ Error generating test report:', error.message);
    process.exit(1);
  }
}

generateTestReport();
