const { spawn } = require('child_process');
const path = require('path');

// Define paths
const clientPath = path.join(__dirname, 'client');
const serverPath = path.join(__dirname, 'server');

// Colors for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  cyan: '\x1b[36m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m'
};

// Function to start a process with labeled output
function startProcess(name, cwd, color, prefix) {
  console.log(`${colors.bright}${color}Starting ${name}...${colors.reset}\n`);
  
  const isWindows = process.platform === 'win32';
  const command = isWindows ? 'npm.cmd' : 'npm';
  
  const child = spawn(command, ['run', 'dev'], {
    cwd: cwd,
    shell: isWindows
  });

  // Prefix and colorize stdout
  child.stdout.on('data', (data) => {
    const lines = data.toString().split('\n');
    lines.forEach(line => {
      if (line.trim()) {
        console.log(`${color}[${prefix}]${colors.reset} ${line}`);
      }
    });
  });

  // Prefix and colorize stderr
  child.stderr.on('data', (data) => {
    const lines = data.toString().split('\n');
    lines.forEach(line => {
      if (line.trim()) {
        console.log(`${color}[${prefix}]${colors.reset} ${line}`);
      }
    });
  });

  child.on('error', (error) => {
    console.error(`${colors.red}[${prefix}] Error:${colors.reset}`, error.message);
  });

  child.on('exit', (code, signal) => {
    if (code !== null) {
      console.log(`${color}[${prefix}] Process exited with code ${code}${colors.reset}`);
    } else {
      console.log(`${color}[${prefix}] Process was killed by signal ${signal}${colors.reset}`);
    }
  });

  return child;
}

// Store process references
let frontend = null;
let backend = null;

// Start servers
console.log(`${colors.bright}${colors.yellow}╔════════════════════════════════════╗${colors.reset}`);
console.log(`${colors.bright}${colors.yellow}║  Fest Management App Launcher      ║${colors.reset}`);
console.log(`${colors.bright}${colors.yellow}╚════════════════════════════════════╝${colors.reset}\n`);

// Start frontend first
frontend = startProcess('Frontend Client', clientPath, colors.cyan, 'FRONTEND');

// Wait 2 seconds before starting backend
setTimeout(() => {
  backend = startProcess('Backend Server', serverPath, colors.green, 'BACKEND');
  
  console.log(`\n${colors.bright}${colors.magenta}Both servers are running!${colors.reset}`);
  console.log(`${colors.yellow}Press Ctrl+C to stop all servers${colors.reset}\n`);
}, 2000);

// Handle cleanup on exit
process.on('SIGINT', () => {
  console.log(`\n${colors.yellow}Shutting down servers...${colors.reset}`);
  if (frontend) frontend.kill();
  if (backend) backend.kill();
  process.exit();
});

process.on('SIGTERM', () => {
  console.log(`\n${colors.yellow}Shutting down servers...${colors.reset}`);
  if (frontend) frontend.kill();
  if (backend) backend.kill();
  process.exit();
});
