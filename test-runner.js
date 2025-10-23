#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');

console.log(' Market API Test Runner');
console.log('========================\n');

// Check if server is running
async function checkServer() {
  try {
    const response = await fetch('http://localhost:3000/health');
    if (response.ok) {
      console.log('Server is running');
      return true;
    }
  } catch (error) {
    console.log('Server is not running');
    console.log('Please start the server with: npm run dev');
    return false;
  }
}

// Run tests
async function runTests() {
  const isServerRunning = await checkServer();
  
  if (!isServerRunning) {
    process.exit(1);
  }

  console.log('\n Running Vitest tests...\n');
  
  const testProcess = spawn('npx', ['vitest', 'run', 'tests/api-simple.test.js'], {
    stdio: 'inherit',
    shell: true
  });

  testProcess.on('close', (code) => {
    if (code === 0) {
      console.log('\n All tests passed!');
    } else {
      console.log('\n Some tests failed');
      process.exit(code);
    }
  });

  testProcess.on('error', (error) => {
    console.error(' Error running tests:', error);
    process.exit(1);
  });
}

// Import fetch for Node.js < 18
if (typeof fetch === 'undefined') {
  global.fetch = require('node-fetch');
}

runTests();
