// Script Node.js per liberare le porte 3000 e 3001
// Funziona su tutti i sistemi operativi

const { exec } = require('child_process');
const os = require('os');

const ports = [3000, 3001];
const platform = os.platform();

console.log('🔍 Cercando processi sulle porte 3000 e 3001...');

function killPort(port) {
  return new Promise((resolve) => {
    if (platform === 'win32') {
      // Windows
      exec(`netstat -ano | findstr :${port}`, (error, stdout) => {
        if (stdout) {
          const lines = stdout.trim().split('\n');
          const pids = new Set();
          
          lines.forEach(line => {
            const parts = line.trim().split(/\s+/);
            const pid = parts[parts.length - 1];
            if (pid && pid !== '0' && !isNaN(pid)) {
              pids.add(pid);
            }
          });
          
          pids.forEach(pid => {
            console.log(`  ⚠️  Terminando processo ${pid} sulla porta ${port}`);
            exec(`taskkill /PID ${pid} /F`, () => {});
          });
        } else {
          console.log(`  ✅ Porta ${port} già libera`);
        }
        resolve();
      });
    } else {
      // Linux/Mac
      exec(`lsof -ti:${port}`, (error, stdout) => {
        if (stdout) {
          const pids = stdout.trim().split('\n');
          pids.forEach(pid => {
            if (pid) {
              console.log(`  ⚠️  Terminando processo ${pid} sulla porta ${port}`);
              exec(`kill -9 ${pid}`, () => {});
            }
          });
        } else {
          console.log(`  ✅ Porta ${port} già libera`);
        }
        resolve();
      });
    }
  });
}

async function killAllPorts() {
  for (const port of ports) {
    await killPort(port);
  }
  console.log('✅ Porte liberate!');
}

killAllPorts().then(() => {
  setTimeout(() => process.exit(0), 1000);
});

