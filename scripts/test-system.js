#!/usr/bin/env node

/**
 * PrimeRoseFarms System Testing Script
 * Comprehensive testing and validation of all system components
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

// Test results storage
const testResults = {
  encryption: { passed: 0, failed: 0, tests: [] },
  database: { passed: 0, failed: 0, tests: [] },
  auth: { passed: 0, failed: 0, tests: [] },
  system: { passed: 0, failed: 0, tests: [] }
};

// Utility functions
const log = (message, color = colors.reset) => {
  console.log(`${color}${message}${colors.reset}`);
};

const logHeader = (title) => {
  log(`\n${'='.repeat(60)}`, colors.cyan);
  log(`  ${title}`, colors.bright);
  log(`${'='.repeat(60)}`, colors.cyan);
};

const logTest = (testName, status, details = '') => {
  const statusColor = status === 'PASS' ? colors.green : colors.red;
  const statusSymbol = status === 'PASS' ? '✓' : '✗';
  
  log(`  ${statusSymbol} ${testName}`, statusColor);
  if (details) {
    log(`    ${details}`, colors.yellow);
  }
};

// Test functions
const testEncryptionSystem = () => {
  logHeader('ENCRYPTION SYSTEM TESTS');
  
  try {
    log('Running encryption tests...', colors.blue);
    const output = execSync('npm test -- tests/encryption.test.ts --verbose', { 
      encoding: 'utf8',
      stdio: 'pipe'
    });
    
    const lines = output.split('\n');
    let passed = 0;
    let failed = 0;
    
    lines.forEach(line => {
      if (line.includes('✓')) passed++;
      if (line.includes('✗')) failed++;
    });
    
    testResults.encryption.passed = passed;
    testResults.encryption.failed = failed;
    
    logTest('Encryption Service', passed > 0 && failed === 0 ? 'PASS' : 'FAIL', 
      `${passed} passed, ${failed} failed`);
    
  } catch (error) {
    logTest('Encryption Service', 'FAIL', 'Test execution failed');
    testResults.encryption.failed = 1;
  }
};

const testDatabaseSystem = () => {
  logHeader('DATABASE SYSTEM TESTS');
  
  try {
    log('Running database tests...', colors.blue);
    const output = execSync('npm test -- tests/database.test.ts --verbose', { 
      encoding: 'utf8',
      stdio: 'pipe'
    });
    
    const lines = output.split('\n');
    let passed = 0;
    let failed = 0;
    
    lines.forEach(line => {
      if (line.includes('✓')) passed++;
      if (line.includes('✗')) failed++;
    });
    
    testResults.database.passed = passed;
    testResults.database.failed = failed;
    
    logTest('Database Connection', passed > 0 && failed === 0 ? 'PASS' : 'FAIL', 
      `${passed} passed, ${failed} failed`);
    
  } catch (error) {
    logTest('Database Connection', 'FAIL', 'Test execution failed');
    testResults.database.failed = 1;
  }
};

const testAuthSystem = () => {
  logHeader('AUTHENTICATION SYSTEM TESTS');
  
  try {
    log('Running authentication tests...', colors.blue);
    const output = execSync('npm test -- tests/auth.test.ts --verbose', { 
      encoding: 'utf8',
      stdio: 'pipe'
    });
    
    const lines = output.split('\n');
    let passed = 0;
    let failed = 0;
    
    lines.forEach(line => {
      if (line.includes('✓')) passed++;
      if (line.includes('✗')) failed++;
    });
    
    testResults.auth.passed = passed;
    testResults.auth.failed = failed;
    
    logTest('JWT Authentication', passed > 0 && failed === 0 ? 'PASS' : 'FAIL', 
      `${passed} passed, ${failed} failed`);
    
  } catch (error) {
    logTest('JWT Authentication', 'FAIL', 'Test execution failed');
    testResults.auth.failed = 1;
  }
};

const testSystemHealth = () => {
  logHeader('SYSTEM HEALTH TESTS');
  
  try {
    log('Running system health tests...', colors.blue);
    const output = execSync('npm test -- tests/system-health.test.ts --verbose', { 
      encoding: 'utf8',
      stdio: 'pipe'
    });
    
    const lines = output.split('\n');
    let passed = 0;
    let failed = 0;
    
    lines.forEach(line => {
      if (line.includes('✓')) passed++;
      if (line.includes('✗')) failed++;
    });
    
    testResults.system.passed = passed;
    testResults.system.failed = failed;
    
    logTest('System Health', passed > 0 && failed === 0 ? 'PASS' : 'FAIL', 
      `${passed} passed, ${failed} failed`);
    
  } catch (error) {
    logTest('System Health', 'FAIL', 'Test execution failed');
    testResults.system.failed = 1;
  }
};

const testEnvironmentSetup = () => {
  logHeader('ENVIRONMENT SETUP VALIDATION');
  
  // Check if .env file exists
  const envExists = fs.existsSync('.env');
  logTest('Environment File', envExists ? 'PASS' : 'FAIL', 
    envExists ? '.env file found' : '.env file missing - copy from env.example');
  
  // Check if required directories exist
  const requiredDirs = ['src', 'tests', 'src/types', 'src/utils', 'src/models', 'src/middleware'];
  requiredDirs.forEach(dir => {
    const exists = fs.existsSync(dir);
    logTest(`Directory: ${dir}`, exists ? 'PASS' : 'FAIL');
  });
  
  // Check if required files exist
  const requiredFiles = [
    'package.json',
    'tsconfig.json',
    'jest.config.js',
    'src/app.ts',
    'src/server.ts'
  ];
  requiredFiles.forEach(file => {
    const exists = fs.existsSync(file);
    logTest(`File: ${file}`, exists ? 'PASS' : 'FAIL');
  });
};

const generateTestReport = () => {
  logHeader('TEST SUMMARY REPORT');
  
  const totalPassed = Object.values(testResults).reduce((sum, result) => sum + result.passed, 0);
  const totalFailed = Object.values(testResults).reduce((sum, result) => sum + result.failed, 0);
  const totalTests = totalPassed + totalFailed;
  
  log(`Total Tests: ${totalTests}`, colors.bright);
  log(`Passed: ${totalPassed}`, colors.green);
  log(`Failed: ${totalFailed}`, colors.red);
  log(`Success Rate: ${totalTests > 0 ? ((totalPassed / totalTests) * 100).toFixed(1) : 0}%`, 
    totalFailed === 0 ? colors.green : colors.yellow);
  
  // Detailed breakdown
  log('\nDetailed Results:', colors.bright);
  Object.entries(testResults).forEach(([system, result]) => {
    const status = result.failed === 0 ? 'PASS' : 'FAIL';
    const statusColor = status === 'PASS' ? colors.green : colors.red;
    log(`  ${system.toUpperCase()}: ${result.passed} passed, ${result.failed} failed`, statusColor);
  });
  
  // Generate timestamp
  const timestamp = new Date().toISOString();
  log(`\nTest completed at: ${timestamp}`, colors.cyan);
  
  // Save report to file
  const reportData = {
    timestamp,
    summary: {
      totalTests,
      totalPassed,
      totalFailed,
      successRate: totalTests > 0 ? ((totalPassed / totalTests) * 100).toFixed(1) : 0
    },
    details: testResults
  };
  
  fs.writeFileSync('test-report.json', JSON.stringify(reportData, null, 2));
  log('\nDetailed report saved to: test-report.json', colors.blue);
};

// Main execution
const main = () => {
  log('PrimeRoseFarms System Testing Suite', colors.bright);
  log('=====================================', colors.cyan);
  
  try {
    // Run all tests
    testEnvironmentSetup();
    testEncryptionSystem();
    testDatabaseSystem();
    testAuthSystem();
    testSystemHealth();
    
    // Generate report
    generateTestReport();
    
    // Exit with appropriate code
    const totalFailed = Object.values(testResults).reduce((sum, result) => sum + result.failed, 0);
    process.exit(totalFailed > 0 ? 1 : 0);
    
  } catch (error) {
    log(`\nFatal error during testing: ${error.message}`, colors.red);
    process.exit(1);
  }
};

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { main, testResults };
