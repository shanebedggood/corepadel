#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

/**
 * Generate coverage badge for README
 */
function generateCoverageBadge() {
  try {
    // Read coverage summary
    const coveragePath = path.join(__dirname, '../coverage/coverage-summary.json');
    
    if (!fs.existsSync(coveragePath)) {
      console.log('Coverage summary not found. Run tests with coverage first.');
      return;
    }

    const coverage = JSON.parse(fs.readFileSync(coveragePath, 'utf8'));
    const total = coverage.total;
    
    // Calculate overall coverage percentage
    const percentage = Math.round(total.lines.pct);
    
    // Determine badge color based on coverage
    let color = 'red';
    if (percentage >= 80) color = 'green';
    else if (percentage >= 70) color = 'yellow';
    else if (percentage >= 60) color = 'orange';
    
    // Generate badge URL
    const badgeUrl = `https://img.shields.io/badge/coverage-${percentage}%25-${color}`;
    
    // Generate markdown
    const badgeMarkdown = `![Coverage](${badgeUrl})`;
    
    console.log('Coverage Badge:');
    console.log(badgeMarkdown);
    console.log(`\nCoverage: ${percentage}%`);
    console.log(`Lines: ${total.lines.covered}/${total.lines.total}`);
    console.log(`Functions: ${total.functions.covered}/${total.functions.total}`);
    console.log(`Branches: ${total.branches.covered}/${total.branches.total}`);
    console.log(`Statements: ${total.statements.covered}/${total.statements.total}`);
    
    // Write badge to file
    const badgePath = path.join(__dirname, '../coverage/coverage-badge.md');
    fs.writeFileSync(badgePath, badgeMarkdown);
    console.log(`\nBadge saved to: ${badgePath}`);
    
  } catch (error) {
    console.error('Error generating coverage badge:', error.message);
    process.exit(1);
  }
}

generateCoverageBadge();
