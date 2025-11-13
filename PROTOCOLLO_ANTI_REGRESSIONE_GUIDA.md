# 🛡️ PROTOCOLLO ANTI-REGRESSIONE - GUIDA COMPLETA

## 📋 Informazioni Generali

**Data Creazione**: 14 Gennaio 2025  
**Stato**: ATTIVO  
**Ubicazione**: `server/index.ts` (righe 47-129)  
**Scopo**: Garantire che il server non si avvii con errori TypeScript/LSP

## ⚙️ Come Funziona

### Controllo Automatico all'Avvio
Il protocollo esegue automaticamente `npx tsc --noEmit --skipLibCheck` prima di avviare il server.

### Due Scenari Possibili

#### ✅ SCENARIO A - Nessun Errore (Normale)
```
🔍 PROTOCOLLO ANTI-REGRESSIONE: Controllo errori LSP/TypeScript...
✅ Nessun errore LSP rilevato - Sistema sicuro per l'avvio
🎯 PROTOCOLLO SUPERATO - Avvio server autorizzato
🚀 Server avviato su porta 3000
```

#### 🛑 SCENARIO B - Errori Presenti (Blocco)
```
❌ ERRORI LSP/TYPESCRIPT RILEVATI - AVVIO BLOCCATO
🛑 Il server NON può avviarsi con errori LSP presenti
process.exit(1) ← Termina processo
```

## 🚨 Procedura di Risoluzione

### Se il Server si Blocca con Errori LSP

1. **Identifica gli errori**:
   ```
   Usa il tool: get_latest_lsp_diagnostics
   ```

2. **Risolvi TUTTI gli errori TypeScript**:
   - Modifica i file con errori
   - Corregge problemi di tipo
   - Risolvi import mancanti
   - Fix sintassi

3. **Verifica di nuovo**:
   ```
   get_latest_lsp_diagnostics
   ```
   Ripeti fino a **0 errori**

4. **Riavvia il server**:
   ```
   npm run dev
   ```

### Se il Protocollo si Blocca durante il Controllo

**Sintomi**:
```
🔍 PROTOCOLLO ANTI-REGRESSIONE: Controllo errori LSP/TypeScript...
[Si blocca qui senza continuare]
```

**Soluzione**:
1. Termina processi Node bloccati:
   ```bash
   taskkill /f /im node.exe
   ```

2. Verifica che il protocollo usi `stdio: 'inherit'`:
   ```typescript
   // In server/index.ts riga 53
   execSync('npx tsc --noEmit --skipLibCheck', { stdio: 'inherit' });
   ```

3. Riavvia il server:
   ```bash
   npm run dev
   ```

## 📁 File da Monitorare

### File Principali
- `server/index.ts` - Protocollo integrato
- `server/routes.ts` - Endpoint API
- `server/storage.ts` - Gestione storage
- `client/src/**/*.tsx` - Componenti React

### File di Stato
- `.protocol-status.json` - Timestamp ultima verifica
- `.lsp-check-required` - Marker per forzare verifica

## 🔧 Configurazione Attuale

### File .protocol-status.json
```json
{
  "lastLSPCheck": "2024-01-01T00:00:00.000Z",
  "lspClean": true,
  "protocolApplied": true
}
```

### Quando Si Attiva il Controllo
- Prima esecuzione (no file `.protocol-status.json`)
- Passata più di 1 ora dall'ultima verifica
- File marker `.lsp-check-required` esiste

## 🚨 Regole Fondamentali

1. **ZERO errori LSP richiesti** per l'avvio del server
2. **MAI ignorare** errori TypeScript
3. **SEMPRE controllare LSP PRIMA** di modificare il codice
4. **Il protocollo garantisce codice pulito** - non bypassarlo

## 🔧 Bypass Temporaneo (Solo Emergenze)

Se necessario, commenta le righe 116-129 in `server/index.ts`:

```typescript
// if (process.env.NODE_ENV !== 'production' && isLSPCheckRequired()) {
//   const lspClean = checkLSPErrors();
//   if (!lspClean) {
//     console.error('🛑 AVVIO BLOCCATO');
//     process.exit(1);
//   }
//   updateProtocolStatus(true);
//   console.log('🎯 PROTOCOLLO SUPERATO');
// }
```

**ATTENZIONE**: Risolvi comunque gli errori TypeScript per evitare problemi runtime.

## 📊 Comandi Utili

### Controllo TypeScript Manuale
```bash
npx tsc --noEmit --skipLibCheck
```

### Verifica Processi Node
```bash
tasklist | findstr node
```

### Termina Processi Node
```bash
taskkill /f /im node.exe
```

### Controllo Porte
```bash
netstat -an | findstr :3000
```

## 📝 Note Storiche

- **Problema Risolto**: Il protocollo si bloccava con `stdio: 'pipe'`
- **Soluzione Applicata**: Cambiato a `stdio: 'inherit'` per evitare blocchi
- **Risultato**: Protocollo funziona correttamente e garantisce codice pulito

## 🎯 Workflow Standard per Modifiche

1. **Controllo LSP iniziale**: `get_latest_lsp_diagnostics`
2. **Risolvi errori esistenti** (se presenti)
3. **Implementa modifiche richieste**
4. **Verifica finale LSP**: `get_latest_lsp_diagnostics`
5. **Riavvia server**: `npm run dev`

---

**Ricorda**: Il protocollo è progettato per la stabilità del sistema. Segui sempre questo workflow per evitare problemi.
