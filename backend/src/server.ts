import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import warehousesRouter from './routes/warehouses.js';
import productsRouter from './routes/products.js';
import customersRouter from './routes/customers.js';
import cashRegistersRouter from './routes/cashRegisters.js';
import stockMovementsRouter from './routes/stockMovements.js';
import cashMovementsRouter from './routes/cashMovements.js';

dotenv.config();

// Protocollo Anti-Regressione - Costanti
// Determina la directory backend (dove si trova tsconfig.json)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const BACKEND_DIR = path.resolve(__dirname, '..'); // Vai su di un livello da src/ a backend/
const ROOT_DIR = path.resolve(BACKEND_DIR, '..'); // Cartella root del workspace
const FRONTEND_DIR = path.join(ROOT_DIR, 'frontend');

const PROTOCOL_STATUS_FILE = path.join(BACKEND_DIR, '.protocol-status.json');
const LSP_CHECK_REQUIRED_FILE = path.join(BACKEND_DIR, '.lsp-check-required');

// Protocollo Anti-Regressione - Funzioni
function checkLSPErrors(): boolean {
  try {
    console.log('🔍 PROTOCOLLO ANTI-REGRESSIONE: Controllo errori LSP/TypeScript...');
    console.log(`📁 Directory backend: ${BACKEND_DIR}`);
    console.log('⏳ Esecuzione controllo TypeScript (può richiedere alcuni secondi)...');

    const startTime = Date.now();
    // Verifica che tsconfig.json esista
    const tsconfigPath = path.join(BACKEND_DIR, 'tsconfig.json');
    if (!fs.existsSync(tsconfigPath)) {
      console.error(`❌ tsconfig.json non trovato in: ${tsconfigPath}`);
      return false;
    }

    // Esegui il controllo TypeScript dalla cartella backend (dove si trova tsconfig.json)
    // Cerca TypeScript in diversi percorsi (locale backend, root workspace, o usa npx)
    const rootDir = path.resolve(BACKEND_DIR, '..'); // Cartella root del workspace
    const backendBinDir = path.join(BACKEND_DIR, 'node_modules', '.bin');
    const rootBinDir = path.join(rootDir, 'node_modules', '.bin');
    const backendTscDir = path.join(BACKEND_DIR, 'node_modules', 'typescript', 'bin');
    const rootTscDir = path.join(rootDir, 'node_modules', 'typescript', 'bin');
    
    let tscCommand: string;
    let useShell = false;
    
    // Prova prima backend/.bin/tsc.cmd (Windows)
    const backendTscWin = path.join(backendBinDir, 'tsc.cmd');
    // Prova backend/.bin/tsc (Unix)
    const backendTscUnix = path.join(backendBinDir, 'tsc');
    // Prova root/.bin/tsc.cmd (Windows) - per workspace
    const rootTscWin = path.join(rootBinDir, 'tsc.cmd');
    // Prova root/.bin/tsc (Unix) - per workspace
    const rootTscUnix = path.join(rootBinDir, 'tsc');
    // Prova direttamente dal pacchetto typescript (backend)
    const backendTscPackage = path.join(backendTscDir, 'tsc');
    // Prova direttamente dal pacchetto typescript (root)
    const rootTscPackage = path.join(rootTscDir, 'tsc');
    
    if (fs.existsSync(backendTscWin)) {
      tscCommand = `"${backendTscWin}"`;
      useShell = true;
    } else if (fs.existsSync(backendTscUnix)) {
      tscCommand = backendTscUnix;
    } else if (fs.existsSync(rootTscWin)) {
      tscCommand = `"${rootTscWin}"`;
      useShell = true;
    } else if (fs.existsSync(rootTscUnix)) {
      tscCommand = rootTscUnix;
    } else if (fs.existsSync(backendTscPackage)) {
      tscCommand = process.platform === 'win32' ? `node "${backendTscPackage}"` : `node ${backendTscPackage}`;
    } else if (fs.existsSync(rootTscPackage)) {
      tscCommand = process.platform === 'win32' ? `node "${rootTscPackage}"` : `node ${rootTscPackage}`;
    } else {
      // Ultimo fallback: usa npx con --package per forzare l'uso del pacchetto installato
      tscCommand = 'npx --package=typescript tsc';
      useShell = process.platform === 'win32';
    }
    
    console.log(`🔧 Usando comando: ${tscCommand}`);
    
    const execOptions: any = {
      stdio: ['inherit', 'pipe', 'pipe'], // stdin: inherit, stdout: pipe, stderr: pipe
      cwd: BACKEND_DIR, // Esegui dalla cartella backend
      timeout: 60000, // 60 secondi di timeout
      encoding: 'utf8' as const,
      env: { 
        ...process.env, 
        // Evita prompt di npx
        npm_config_yes: 'true',
        NPX_YES: 'true'
      }
    };
    
    if (useShell) {
      execOptions.shell = true;
    }
    
    let tscOutput = '';
    try {
      tscOutput = execSync(`${tscCommand} --noEmit --skipLibCheck`, execOptions).toString();
    } catch (execError: any) {
      // Cattura l'output anche in caso di errore
      tscOutput = execError.stdout?.toString() || execError.stderr?.toString() || '';
      throw execError;
    }
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);

    console.log(`✅ Nessun errore LSP rilevato - Sistema sicuro per l'avvio (${duration}s)`);
    return true;
  } catch (error: any) {
    if (error.signal === 'SIGTERM' || error.killed || error.code === 'ETIMEDOUT') {
      console.error('\n⏱️  TIMEOUT: Il controllo TypeScript ha impiegato troppo tempo (>60s)');
      console.error('💡 Possibili cause:');
      console.error('   - npx sta scaricando/installando TypeScript');
      console.error('   - Troppi file da controllare');
      console.error('   - Problemi di rete o permessi');
      console.error('\n🔧 Soluzione: Esegui manualmente dalla cartella backend:');
      console.error('   npx tsc --noEmit --skipLibCheck');
      console.error('   Se funziona, il problema è nell\'esecuzione automatica\n');
      return false;
    }
    
    console.error('\n🛑 ===== PROTOCOLLO ANTI-REGRESSIONE ULTRA-RIGIDO ATTIVATO =====');
    console.error('❌ ERRORI LSP/TYPESCRIPT RILEVATI - AVVIO BLOCCATO\n');
    console.error('📋 DETTAGLI ERRORI:');
    console.error('─'.repeat(60));
    
    // Mostra l'output di TypeScript (stdout o stderr)
    const errorOutput = error.stdout?.toString() || error.stderr?.toString() || error.message || '';
    if (errorOutput) {
      console.error(errorOutput);
    } else {
      // Se non c'è output, mostra almeno il messaggio di errore
      console.error(`Errore durante l'esecuzione di TypeScript`);
      console.error(`Messaggio: ${error.message || 'Errore sconosciuto'}`);
      console.error(`\n💡 Esegui manualmente per vedere i dettagli:`);
      console.error(`   cd backend && npx tsc --noEmit --skipLibCheck`);
    }
    
    console.error('─'.repeat(60));
    console.error('\n🚨 Il server NON può avviarsi con errori LSP presenti');
    console.error('💡 Correggi gli errori sopra e riprova');
    console.error('================================================\n');
    return false;
  }
}

function checkFrontendErrors(): boolean {
  try {
    console.log('🔍 PROTOCOLLO ANTI-REGRESSIONE: Controllo errori Frontend...');
    console.log(`📁 Directory frontend: ${FRONTEND_DIR}`);
    
    // Verifica che la directory frontend esista
    if (!fs.existsSync(FRONTEND_DIR)) {
      console.log('⚠️  Directory frontend non trovata - skip controllo');
      return true;
    }

    // Verifica che tsconfig.json esista nel frontend
    const frontendTsconfigPath = path.join(FRONTEND_DIR, 'tsconfig.json');
    if (!fs.existsSync(frontendTsconfigPath)) {
      console.log('⚠️  tsconfig.json non trovato nel frontend - skip controllo TypeScript');
      return true;
    }

    console.log('⏳ Esecuzione controllo TypeScript frontend...');
    const startTime = Date.now();

    // Cerca TypeScript nel frontend o root
    const rootBinDir = path.join(ROOT_DIR, 'node_modules', '.bin');
    const frontendBinDir = path.join(FRONTEND_DIR, 'node_modules', '.bin');
    
    let tscCommand: string;
    let useShell = false;
    
    const rootTscWin = path.join(rootBinDir, 'tsc.cmd');
    const rootTscUnix = path.join(rootBinDir, 'tsc');
    const frontendTscWin = path.join(frontendBinDir, 'tsc.cmd');
    const frontendTscUnix = path.join(frontendBinDir, 'tsc');
    
    if (fs.existsSync(frontendTscWin)) {
      tscCommand = `"${frontendTscWin}"`;
      useShell = true;
    } else if (fs.existsSync(frontendTscUnix)) {
      tscCommand = frontendTscUnix;
    } else if (fs.existsSync(rootTscWin)) {
      tscCommand = `"${rootTscWin}"`;
      useShell = true;
    } else if (fs.existsSync(rootTscUnix)) {
      tscCommand = rootTscUnix;
    } else {
      tscCommand = 'npx --package=typescript tsc';
      useShell = process.platform === 'win32';
    }

    const execOptions: any = {
      stdio: ['inherit', 'pipe', 'pipe'],
      cwd: FRONTEND_DIR,
      timeout: 30000, // 30 secondi
      encoding: 'utf8' as const,
      env: {
        ...process.env,
        npm_config_yes: 'true',
        NPX_YES: 'true'
      }
    };

    if (useShell) {
      execOptions.shell = true;
    }

    console.log(`🔧 Usando comando: ${tscCommand}`);
    
    let tscOutput = '';
    try {
      tscOutput = execSync(`${tscCommand} --noEmit --skipLibCheck`, execOptions).toString();
    } catch (execError: any) {
      // Cattura l'output anche in caso di errore
      tscOutput = execError.stdout?.toString() || execError.stderr?.toString() || '';
      throw execError;
    }
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(`✅ Nessun errore TypeScript nel frontend (${duration}s)`);
    return true;
  } catch (error: any) {
    if (error.signal === 'SIGTERM' || error.killed || error.code === 'ETIMEDOUT') {
      console.error('\n⏱️  TIMEOUT: Il controllo TypeScript frontend ha impiegato troppo tempo (>30s)');
      console.error('💡 Possibili cause:');
      console.error('   - npx sta scaricando/installando TypeScript');
      console.error('   - Troppi file da controllare');
      console.error('   - Problemi di rete o permessi');
      console.error('\n🔧 Soluzione: Esegui manualmente dalla cartella frontend:');
      console.error('   cd frontend && npx tsc --noEmit --skipLibCheck');
      console.error('   Se funziona, il problema è nell\'esecuzione automatica\n');
      return false;
    }
    
    console.error('\n🛑 ===== PROTOCOLLO ANTI-REGRESSIONE ULTRA-RIGIDO ATTIVATO =====');
    console.error('❌ ERRORI TYPESCRIPT NEL FRONTEND RILEVATI - AVVIO BLOCCATO\n');
    console.error('📋 DETTAGLI ERRORI FRONTEND:');
    console.error('─'.repeat(60));
    
    // Mostra l'output di TypeScript (stdout o stderr)
    const errorOutput = error.stdout?.toString() || error.stderr?.toString() || error.message || '';
    if (errorOutput) {
      console.error(errorOutput);
    } else {
      // Se non c'è output, mostra almeno il messaggio di errore
      console.error(`Errore durante l'esecuzione di TypeScript nel frontend`);
      console.error(`Messaggio: ${error.message || 'Errore sconosciuto'}`);
      console.error(`\n💡 Esegui manualmente per vedere i dettagli:`);
      console.error(`   cd frontend && npx tsc --noEmit --skipLibCheck`);
    }
    
    console.error('─'.repeat(60));
    console.error('\n🚨 Il server NON può avviarsi con errori TypeScript nel frontend');
    console.error('💡 Correggi gli errori sopra e riprova');
    console.error('================================================\n');
    return false;
  }
}

function isLSPCheckRequired(): boolean {
  return true;
}

function updateProtocolStatus(lspClean: boolean): void {
  const status = {
    lastLSPCheck: new Date().toISOString(),
    lspClean,
    protocolApplied: lspClean
  };

  fs.writeFileSync(PROTOCOL_STATUS_FILE, JSON.stringify(status, null, 2));

  if (lspClean && fs.existsSync(LSP_CHECK_REQUIRED_FILE)) {
    fs.unlinkSync(LSP_CHECK_REQUIRED_FILE);
  }
}

// Protocollo Anti-Regressione - Controllo pre-avvio
console.log('🚀 AVVIO SERVER CON PROTOCOLLO ANTI-REGRESSIONE INTEGRATO');

if (process.env.NODE_ENV !== 'production') {
  const lspClean = checkLSPErrors();
  const frontendClean = checkFrontendErrors();

  if (!lspClean) {
    console.error('🛑 AVVIO BLOCCATO - Errori TypeScript nel backend');
    process.exit(1);
  }

  if (!frontendClean) {
    console.error('🛑 AVVIO BLOCCATO - Errori TypeScript nel frontend');
    process.exit(1);
  }

  updateProtocolStatus(true);
  console.log('🎯 PROTOCOLLO SUPERATO - Avvio server autorizzato\n');
} else {
  console.log('✅ PRODUZIONE: Protocollo LSP skippato - Bundle già verificato\n');
}

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

// API routes
app.use('/api/warehouses', warehousesRouter);
app.use('/api/products', productsRouter);
app.use('/api/customers', customersRouter);
app.use('/api/cash-registers', cashRegistersRouter);
app.use('/api/stock-movements', stockMovementsRouter);
app.use('/api/cash-movements', cashMovementsRouter);

// Protocollo Anti-Regressione - Cleanup handler
process.on('exit', () => {
  if (process.env.NODE_ENV !== 'production') {
    // Riscrive il file .lsp-check-required per il prossimo avvio
    try {
      fs.writeFileSync(LSP_CHECK_REQUIRED_FILE, '');
    } catch (error) {
      // Ignora errori di scrittura durante l'uscita
    }
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});

