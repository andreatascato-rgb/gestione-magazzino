# 🎯 LEZIONI APPRESE - STRATEGIE DI RISOLUZIONE PROBLEMI

## 📅 Data: 17 Gennaio 2025 (aggiornato: Gennaio 2025)
## 🎯 Progetto: Sistema Preventivi Multi-Brand - ESTETICSUN

---

## 🚨 PROBLEMI RISOLTI E STRATEGIE APPLICATE

### 1. **ERRORE 500 - "Failed to create biyu quote"**

#### 🔍 **Sintomi:**
- Server restituisce errore 500 durante creazione preventivo
- Log mostra: `NeonDbError: column "signature_data" does not exist`
- Codice 42703 (column does not exist)

#### 🧠 **Strategia di Debug Applicata:**
1. **Analisi Log Server** - Identificato errore specifico nei log
2. **Verifica Schema vs Database Fisico** - Creato script per controllare struttura tabella
3. **Identificazione Discrepanza** - Schema Drizzle definiva colonne non presenti nel DB fisico
4. **Migration Mirata** - Aggiunta solo colonne mancanti senza toccare dati esistenti

#### ✅ **Soluzione Implementata:**
```sql
-- Script di verifica struttura
SELECT column_name, data_type FROM information_schema.columns 
WHERE table_name = 'biyu_quotes';

-- Migration per colonne mancanti
ALTER TABLE biyu_quotes ADD COLUMN IF NOT EXISTS signature_data TEXT;
ALTER TABLE biyu_quotes ADD COLUMN IF NOT EXISTS signature_date TIMESTAMP;
ALTER TABLE biyu_quotes ADD COLUMN IF NOT EXISTS signed_by_name TEXT;
```

#### 📚 **Lezione Appresa:**
> **"SEMPRE verificare che lo schema Drizzle corrisponda al database fisico. Le discrepanze causano errori 500 silenziosi."**

---

### 2. **ERRORE VALIDAZIONE PREMATURA - "Seleziona almeno un prodotto"**

#### 🔍 **Sintomi:**
- Errore appariva cliccando pulsanti brand nel form
- Impediva navigazione libera tra brand
- Validazione si attivava troppo presto

#### 🧠 **Strategia di Debug Applicata:**
1. **Identificazione Timing** - Validazione nel `mutationFn` invece che nel `onSubmit`
2. **Analisi Event Flow** - Pulsanti causavano submit form involontario
3. **Separazione Responsabilità** - Validazione solo al momento del salvataggio

#### ✅ **Soluzione Implementata:**
```typescript
// PRIMA (SBAGLIATO)
const createMutation = useMutation({
  mutationFn: (data) => {
    if (selectedProducts.length === 0) { // ❌ Troppo presto!
      throw new Error("Seleziona almeno un prodotto");
    }
    // ...
  }
});

// DOPO (CORRETTO)
<form onSubmit={(e) => {
  e.preventDefault();
  if (selectedProducts.length === 0) { // ✅ Al momento giusto!
    toast({ title: "Errore", description: "Seleziona almeno un prodotto" });
    return;
  }
  createMutation.mutate(data);
}}>
```

#### 📚 **Lezione Appresa:**
> **"La validazione deve avvenire nel momento giusto: al submit del form, non durante la navigazione UI."**

---

### 3. **ERRORE DATABASE SCHEMA - Colonne Multi-Brand Mancanti**

#### 🔍 **Sintomi:**
- Errore 42703 durante inserimento items preventivo
- `productId` non esisteva più nella tabella
- Foreign key constraint falliva

#### 🧠 **Strategia di Debug Applicata:**
1. **Analisi Architetturale** - Identificato bisogno di denormalizzazione
2. **Progettazione Schema** - Sostituito foreign key con campi descrittivi
3. **Migration Sicura** - Rimozione constraint + aggiunta colonne + aggiornamento dati

#### ✅ **Soluzione Implementata:**
```sql
-- Rimozione foreign key constraint
ALTER TABLE biyu_quote_items DROP CONSTRAINT IF EXISTS biyu_quote_items_product_id_fkey;
ALTER TABLE biyu_quote_items DROP COLUMN IF EXISTS product_id;

-- Aggiunta colonne multi-brand
ALTER TABLE biyu_quote_items ADD COLUMN IF NOT EXISTS product_brand TEXT NOT NULL DEFAULT 'BIYU';
ALTER TABLE biyu_quote_items ADD COLUMN IF NOT EXISTS product_code TEXT NOT NULL DEFAULT '';
ALTER TABLE biyu_quote_items ADD COLUMN IF NOT EXISTS product_name TEXT NOT NULL DEFAULT '';
ALTER TABLE biyu_quote_items ADD COLUMN IF NOT EXISTS product_packaging TEXT;

-- Aggiornamento dati esistenti
UPDATE biyu_quote_items SET 
  product_brand = 'BIYU',
  product_code = COALESCE(product_code, ''),
  product_name = COALESCE(product_name, 'Prodotto')
WHERE product_brand IS NULL;
```

#### 📚 **Lezione Appresa:**
> **"Per sistemi multi-brand, la denormalizzazione è spesso meglio di foreign key complesse. Campi descrittivi offrono più flessibilità."**

---

## 🛠️ **STRATEGIE GENERALI DI DEBUG**

### **1. ANALISI SISTEMATICA DEI LOG**
```bash
# Comando per catturare errori specifici
npm run dev:start 2>&1 | Select-String -Pattern "error|Error|ERROR|42703" -Context 2,2
```

### **2. VERIFICA SCHEMA DATABASE**
```javascript
// Script per verificare struttura tabella
const columns = await sql`
  SELECT column_name, data_type, is_nullable 
  FROM information_schema.columns 
  WHERE table_name = 'nome_tabella'
  ORDER BY ordinal_position;
`;
```

### **3. MIGRATION SICURE**
```sql
-- Pattern per migration sicure
ALTER TABLE tabella ADD COLUMN IF NOT EXISTS nuova_colonna TIPO;
-- Sempre con IF NOT EXISTS per evitare errori
```

### **4. DEBUG FRONTEND/BACKEND**
- **Frontend**: Controllare console browser per errori JavaScript
- **Backend**: Analizzare log server per errori SQL/API
- **Database**: Verificare schema fisico vs schema codice

---

## 🎯 **CHECKLIST DEBUG RAPIDO**

### **Per Errori 500:**
- [ ] Controllare log server per errore specifico
- [ ] Verificare schema database vs codice
- [ ] Controllare colonne mancanti
- [ ] Verificare constraint foreign key

### **Per Errori Frontend:**
- [ ] Controllare console browser
- [ ] Verificare timing validazione
- [ ] Controllare event handlers
- [ ] Verificare state management

### **Per Errori Database:**
- [ ] Eseguire script verifica struttura
- [ ] Controllare migration mancanti
- [ ] Verificare constraint
- [ ] Controllare dati esistenti

---

## 📝 **PATTERN DI SUCCESSO IDENTIFICATI**

### **1. APPROCCIO MODULARE**
- Componenti separati per ogni funzionalità
- API endpoint specifici per ogni operazione
- Schema database ben strutturato

### **2. DEBUG SISTEMATICO**
- Analisi log prima di tutto
- Verifica schema database
- Test incrementali
- Migration sicure

### **3. VALIDAZIONE INTELLIGENTE**
- Validazione al momento giusto
- Messaggi di errore chiari
- Prevenzione errori prematuri

---

---

### 4. **ERRORE TYPESCRIPT - Gestione Tipi Database Schema**

#### 🔍 **Sintomi:**
- Errori TypeScript durante modifiche al database schema
- `boolean | null | undefined` vs `boolean | undefined` incompatibilità
- Protocollo anti-regressione blocca avvio server
- Errori su query storage.ts per campi mancanti

#### 🧠 **Strategia di Debug Applicata:**
1. **Analisi Errori TypeScript** - `npx tsc --noEmit` per identificare errori specifici
2. **Sincronizzazione Schema** - Database schema deve corrispondere ai tipi TypeScript
3. **Migration Graduali** - Prima database, poi codice
4. **Gestione Valori Null** - Conversione esplicita `null` → `undefined`

#### ✅ **Soluzione Implementata:**
```typescript
// ❌ ERRORE: Tipi incompatibili
hasSolarium: boolean | null | undefined  // Database
hasSolarium: boolean | undefined         // TypeScript

// ✅ CORRETTO: Conversione esplicita
const processedData = {
  ...validatedData,
  hasSolarium: validatedData.hasSolarium ?? undefined,
  hasLaser: validatedData.hasLaser ?? undefined,
  // ...
};

// ✅ CORRETTO: Query esplicite con tutti i campi
return await db.select({
  id: segnalazioni.id,
  numeroSegnalazione: segnalazioni.numeroSegnalazione,
  hasSolarium: segnalazioni.hasSolarium,
  hasLaser: segnalazioni.hasLaser,
  // ... tutti i campi esplicitamente
}).from(segnalazioni);
```

#### 📚 **Lezione Appresa:**
> **"SEMPRE aggiornare database schema PRIMA del codice TypeScript. Gestire esplicitamente conversioni null/undefined per evitare errori di tipo."**

---

### 5. **ERRORE MIGRATION SQL - Comandi Multipli**

#### 🔍 **Sintomi:**
- `NeonDbError: cannot insert multiple commands into a prepared statement`
- Migration SQL con più comandi fallisce
- Errori di sintassi con Neon Database

#### 🧠 **Strategia di Debug Applicata:**
1. **Identificazione Limite** - Neon non supporta comandi multipli in una query
2. **Divisione Comandi** - Separare ogni comando SQL
3. **Esecuzione Sequenziale** - Eseguire comandi uno alla volta

#### ✅ **Soluzione Implementata:**
```javascript
// ❌ ERRORE: Comandi multipli
await sql(migrationSQL); // Contiene CREATE TABLE; ALTER TABLE; UPDATE;

// ✅ CORRETTO: Divisione e esecuzione sequenziale
const commands = migration.split(';').filter(cmd => cmd.trim());
for (const command of commands) {
  if (command.trim()) {
    await sql(command.trim());
  }
}
```

#### 📚 **Lezione Appresa:**
> **"Neon Database richiede comandi SQL separati. Sempre dividere migration complesse in comandi singoli per esecuzione sequenziale."**

---

### 6. **ERRORE VALIDAZIONE ZOD - Campi Flessibili**

#### 🔍 **Sintomi:**
- Validazione troppo rigida per campi opzionali
- Form bloccato quando serviva flessibilità
- Validazione "almeno uno" non implementata correttamente

#### 🧠 **Strategia di Debug Applicata:**
1. **Analisi Requisiti** - Identificare bisogno di validazione flessibile
2. **Validazione Custom** - Usare `.refine()` per logica complessa
3. **Messaggi Chiari** - Errori specifici per l'utente

#### ✅ **Soluzione Implementata:**
```typescript
// ❌ ERRORE: Validazione troppo rigida
regione: z.string().min(1, "Regione è obbligatoria"),
citta: z.string().min(1, "Città è obbligatoria"),
provincia: z.string().min(1, "Provincia è obbligatoria"),

// ✅ CORRETTO: Validazione flessibile
regione: z.string().optional(),
citta: z.string().optional(),
provincia: z.string().optional(),
}).refine((data) => {
  return (data.regione && data.regione.trim() !== "") || 
         (data.citta && data.citta.trim() !== "") || 
         (data.provincia && data.provincia.trim() !== "");
}, {
  message: "È obbligatorio inserire almeno uno tra Regione, Città o Provincia",
  path: ["regione"]
});
```

#### 📚 **Lezione Appresa:**
> **"Per validazioni complesse, usare `.refine()` invece di validazioni rigide. Permette logica 'almeno uno' e messaggi di errore personalizzati."**

---

## 🛠️ **STRATEGIE GENERALI DI DEBUG AGGIORNATE**

### **1. GESTIONE TYPESCRIPT ERRORS**
```bash
# Comando per verificare errori TypeScript
npx tsc --noEmit

# Pattern per errori comuni:
# - boolean | null vs boolean | undefined
# - Campi mancanti nelle query
# - Tipi incompatibili tra schema e codice
```

### **2. MIGRATION DATABASE SICURE**
```javascript
// Pattern per migration Neon Database
const commands = migration.split(';').filter(cmd => cmd.trim());
for (const command of commands) {
  if (command.trim()) {
    await sql(command.trim());
  }
}
```

### **3. VALIDAZIONE ZOD FLESSIBILE**
```typescript
// Pattern per validazione "almeno uno"
.refine((data) => {
  return (data.campo1 && data.campo1.trim() !== "") || 
         (data.campo2 && data.campo2.trim() !== "") || 
         (data.campo3 && data.campo3.trim() !== "");
}, {
  message: "Messaggio di errore personalizzato",
  path: ["campo1"] // Campo su cui mostrare l'errore
})
```

### **4. GESTIONE TIPI DATABASE**
```typescript
// Pattern per conversione null/undefined
const processedData = {
  ...validatedData,
  campoBoolean: validatedData.campoBoolean ?? undefined,
  campoString: validatedData.campoString ?? undefined,
};
```

---

## 🎯 **CHECKLIST DEBUG AGGIORNATA**

### **Per Errori TypeScript:**
- [ ] Eseguire `npx tsc --noEmit` per verificare errori
- [ ] Controllare compatibilità tipi database vs codice
- [ ] Verificare gestione valori null/undefined
- [ ] Aggiornare query per includere tutti i campi

### **Per Errori Migration:**
- [ ] Dividere comandi SQL multipli
- [ ] Eseguire comandi sequenzialmente
- [ ] Usare `IF NOT EXISTS` per sicurezza
- [ ] Verificare sintassi Neon Database

### **Per Errori Validazione:**
- [ ] Analizzare requisiti di validazione
- [ ] Usare `.refine()` per logica complessa
- [ ] Testare messaggi di errore
- [ ] Verificare timing della validazione

---

## 🚀 **CONCLUSIONI AGGIORNATE**

Questo progetto ha dimostrato l'importanza di:
1. **Debug sistematico** - Seguire un processo logico
2. **Verifica schema** - Database fisico deve corrispondere al codice
3. **Migration sicure** - Usare sempre `IF NOT EXISTS` e comandi separati
4. **Validazione timing** - Nel momento giusto, non troppo presto
5. **Gestione tipi** - Conversioni esplicite null/undefined
6. **Validazione flessibile** - Usare `.refine()` per logica complessa
7. **Documentazione** - Registrare lezioni apprese per il futuro

---

## 📅 **AGGIORNAMENTO: 18 Gennaio 2025**
## 🎯 **Sessione: Preventivi BIYU - Badge "NUOVO" e Gestione Firma**

### 7. **ERRORE NAVIGAZIONE - Badge "Modifica Cliente" non funzionante**

#### 🔍 **Sintomi:**
- Badge giallo "NUOVO" appariva correttamente sui preventivi con cliente nuovo
- Pulsante "Modifica Cliente" portava alla lista clienti invece del form specifico
- Navigazione non funzionava per clienti senza `clientId` diretto
- UX confusa per l'utente

#### 🧠 **Strategia di Debug Applicata:**
1. **Analisi Flusso Navigazione** - Identificato che `Link` con parametri non funzionava come previsto
2. **Verifica Dati Disponibili** - Controllato se `clientId` era presente nei dati del preventivo
3. **Implementazione Fallback** - Aggiunta ricerca clienti per nome quando `clientId` mancante
4. **Ottimizzazione UX** - Navigazione immediata + API call in background

#### ✅ **Soluzione Implementata:**
```typescript
// ❌ ERRORE: Link statico non funzionante
<Link to={`/clienti/gestione?id=${q.clientId}&openModal=true`}>
  Modifica Cliente
</Link>

// ✅ CORRETTO: Navigazione dinamica con fallback
onClick={async () => {
  let targetUrl = '';
  if (q.clientId) {
    targetUrl = `/clienti/gestione?id=${q.clientId}`;
  } else {
    // Fallback: cerca cliente per nome
    try {
      const response = await apiRequest(`/api/clients?search=${encodeURIComponent(q.clientName || '')}`, 'GET');
      const clients = await response.json();
      if (clients && clients.length > 0) {
        const client = clients[0];
        targetUrl = `/clienti/gestione?id=${client.id}`;
      }
    } catch (error) {
      toast({ title: "Errore", description: "Impossibile trovare il cliente" });
      return;
    }
  }
  
  // Navigazione immediata
  window.location.href = targetUrl;
  
  // API call in background per aggiornare stato
  (async () => {
    try {
      await apiRequest("PUT", `/api/biyu-quotes/${q.id}/client-code-updated`, {});
      queryClient.invalidateQueries({ queryKey: ["/api/biyu-quotes"] });
    } catch (error) {
      console.error("Errore background:", error);
    }
  })();
}}
```

#### 📚 **Lezione Appresa:**
> **"Per navigazione complessa, implementare sempre un fallback. Separare navigazione immediata da operazioni background per UX migliore."**

---

### 9. **CONFLITTO CSS NON RILEVATO - Tabella Disallineata**

#### 🔍 **Sintomi:**
- Tabella clienti mostrava dati disallineati (colonne non corrispondevano ai dati)
- Valore "ON" appariva sotto colonna "AZIONI" invece di "ATTIVO"
- Il protocollo anti-regressione non ha rilevato il problema
- Nessun errore TypeScript/LSP presente

#### 🧠 **Causa Root:**
- `Table.css` importato in `App.tsx` conteneva stili generici per `.table-container table`
- Questi stili avevano maggiore specificità rispetto a `App.css`
- Conflitto CSS silenzioso: nessun errore di compilazione, solo problema visivo
- Il protocollo controlla solo errori TypeScript, non conflitti CSS

#### ✅ **Soluzione Implementata:**
```css
/* App.css - Aumentata specificità con .registro-page */
.registro-page .table-container table {
  width: 100% !important;
  border-collapse: collapse !important;
  /* ... altri stili con !important per sovrascrivere Table.css */
}

/* Disabilitati pseudo-elementi e animazioni di Table.css */
.registro-page .table-container table thead::before,
.registro-page .table-container table thead::after {
  display: none !important;
}
```

#### 📚 **Lezione Appresa:**
> **"I conflitti CSS non generano errori TypeScript. Il protocollo anti-regressione deve essere esteso per rilevare anche conflitti CSS e problemi di specificità. Verificare sempre import CSS e specificità quando si verificano problemi di rendering visivo."**

#### 🔧 **Raccomandazioni Future:**
1. **Best Practices CSS:**
   - Usare classi specifiche invece di selettori generici
   - Evitare `!important` quando possibile (usare solo quando necessario)
   - Documentare dipendenze CSS nei componenti
   - Testare sempre nel browser dopo modifiche CSS

2. **Strategia di Debug CSS:**
   - Ispezionare stili applicati nel browser DevTools
   - Verificare import CSS nell'ordine corretto
   - Controllare specificità dei selettori CSS
   - Verificare manualmente il rendering visivo

3. **Perché il Protocollo NON Rileva CSS:**
   - I conflitti CSS sono problemi runtime nel browser
   - Richiedono test manuali per essere verificati
   - Non possono essere corretti automaticamente
   - Il protocollo si concentra solo su errori TypeScript correggibili

---

### 8. **ERRORE DATI MANCANTI - Form Pubblico Incompleto**

#### 🔍 **Sintomi:**
- Form pubblico per clienti nuovi non mostrava email e telefono
- Dati fiscali (P.IVA, SDI/PEC, IBAN, Regione) non erano visibili
- PDF generato mancava di informazioni complete
- Checkbox obbligatorio "Confermo i dati anagrafici" non presente

#### 🧠 **Strategia di Debug Applicata:**
1. **Analisi Dati Disponibili** - Verificato che i dati erano presenti nel database
2. **Tracciamento Flusso Dati** - Controllato se i dati arrivavano al frontend
3. **Identificazione Filtri** - Trovato che endpoint escludeva `signatureData`
4. **Implementazione Completa** - Aggiunto tutti i campi mancanti al form e PDF

#### ✅ **Soluzione Implementata:**
```typescript
// ❌ ERRORE: Endpoint escludeva firma
const { signatureData, ...withoutSignature } = (updatedQuote || {}) as any;
res.json(withoutSignature);

// ✅ CORRETTO: Include tutti i dati
res.json(updatedQuote);

// ✅ CORRETTO: Form pubblico completo
{quote.clientEmail && (
  <div className="flex items-center gap-2">
    <Mail className="w-4 h-4 text-muted-foreground" />
    <span>{quote.clientEmail}</span>
  </div>
)}

// ✅ CORRETTO: Dati fiscali per clienti nuovi
{(quote as any).isNewClient && (
  <div className="mt-4 pt-4 border-t">
    <h4 className="font-semibold text-lg mb-3">Dati Fiscali e Anagrafici</h4>
    {(quote as any).clientPiva && (
      <div className="flex items-center gap-2">
        <FileText className="w-4 h-4 text-muted-foreground" />
        <span><strong>P.IVA:</strong> {(quote as any).clientPiva}</span>
      </div>
    )}
    // ... altri campi fiscali
  </div>
)}

// ✅ CORRETTO: Checkbox obbligatorio
{(quote as any).isNewClient && (
  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
    <div className="flex items-start space-x-3">
      <Checkbox
        id="confirm-data"
        checked={confirmDataChecked}
        onCheckedChange={(checked) => setConfirmDataChecked(checked as boolean)}
      />
      <div className="grid gap-1.5 leading-none">
        <label htmlFor="confirm-data">
          Confermo i dati anagrafici inseriti
        </label>
        <p className="text-xs text-muted-foreground">
          Dichiaro di aver verificato e confermare l'esattezza di tutti i dati fiscali e anagrafici.
        </p>
      </div>
    </div>
  </div>
)}
```

#### 📚 **Lezione Appresa:**
> **"SEMPRE verificare che tutti i dati necessari siano inclusi negli endpoint. I filtri per 'sicurezza' possono nascondere dati essenziali per l'UX."**

---

### 9. **ERRORE PDF GENERATION - Firma Mancante**

#### 🔍 **Sintomi:**
- PDF generato non mostrava la firma digitale del cliente
- Tutti gli altri dati erano presenti correttamente
- Firma era presente nel database ma non nel PDF
- Debug mostrava che `signatureData` era `null` nel frontend

#### 🧠 **Strategia di Debug Applicata:**
1. **Debug Console Log** - Aggiunto logging per tracciare presenza firma
2. **Verifica Endpoint** - Controllato se firma era inclusa nella risposta API
3. **Identificazione Filtro** - Trovato che endpoint `/api/biyu-quotes/:id` escludeva `signatureData`
4. **Rimozione Filtro** - Eliminato filtro che nascondeva la firma

#### ✅ **Soluzione Implementata:**
```typescript
// ❌ ERRORE: Endpoint filtrava firma
app.get("/api/biyu-quotes/:id", async (req, res) => {
  const updatedQuote = await storage.getBiyuQuoteById(id);
  const { signatureData, ...withoutSignature } = (updatedQuote || {}) as any;
  res.json(withoutSignature); // ❌ Firma esclusa!
});

// ✅ CORRETTO: Include tutti i dati
app.get("/api/biyu-quotes/:id", async (req, res) => {
  const updatedQuote = await storage.getBiyuQuoteById(id);
  res.json(updatedQuote); // ✅ Firma inclusa!
});

// ✅ CORRETTO: Debug per verificare firma
console.log('🔍 DEBUG PDF - Firma info:', {
  status: quote.status,
  hasSignature: !!hasSignature,
  signatureLength: hasSignature?.length,
  signedByName: quote.signedByName,
  signatureDate: quote.signatureDate,
  isSigned
});

// ✅ CORRETTO: Gestione firma nel PDF
if (hasSignature && quote.signatureData) {
  try {
    const maxWidth = 80;
    const maxHeight = 25;
    doc.addImage(quote.signatureData, 'PNG', 20, yPosition, maxWidth, maxHeight);
    yPosition += maxHeight + 5;
    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    doc.text("Firma digitale del cliente", 20, yPosition);
  } catch (error) {
    console.warn('Errore aggiunta firma al PDF:', error);
    doc.text("Firma digitale presente ma non visualizzabile", 20, yPosition);
  }
}
```

#### 📚 **Lezione Appresa:**
> **"Quando un dato 'dovrebbe essere presente ma non c'è', controllare SEMPRE se è stato filtrato negli endpoint. I filtri di sicurezza possono nascondere dati essenziali."**

---

### 10. **ERRORE FOREIGN KEY CONSTRAINT - Eliminazione Clienti**

#### 🔍 **Sintomi:**
- Impossibile eliminare clienti dal cestino
- Errore: `violates foreign key constraint "biyu_quotes_client_id_fkey"`
- Clienti test rimanevano nel cestino senza possibilità di eliminazione permanente
- Sistema bloccato per pulizia dati

#### 🧠 **Strategia di Debug Applicata:**
1. **Analisi Errore Database** - Identificato constraint foreign key
2. **Verifica Relazioni** - Controllato che preventivi erano ancora collegati ai clienti
3. **Implementazione Cascade** - Aggiunta eliminazione preventivi prima dei clienti
4. **Invalidazione Cache** - Aggiornamento cache per refresh UI

#### ✅ **Soluzione Implementata:**
```typescript
// ❌ ERRORE: Eliminazione diretta cliente
await db.delete(clients).where(eq(clients.id, recordId));

// ✅ CORRETTO: Eliminazione cascade
async permanentDeleteItem(id: number, tableName: string, recordId: number) {
  if (tableName === 'clients') {
    // Prima elimina preventivi associati
    await db.delete(biyuQuotes).where(eq(biyuQuotes.clientId, recordId));
    
    // Poi elimina il cliente
    await db.delete(clients).where(eq(clients.id, recordId));
    
    // Invalida cache per refresh UI
    queryCache.invalidate('biyu-quotes');
  } else {
    // Eliminazione normale per altre tabelle
    await db.delete(table).where(eq(table.id, recordId));
  }
}
```

#### 📚 **Lezione Appresa:**
> **"Per eliminazioni cascade, sempre eliminare prima le tabelle dipendenti, poi quelle principali. Invalidare cache per refresh immediato UI."**

---

## 🛠️ **STRATEGIE GENERALI DI DEBUG AGGIORNATE**

### **1. DEBUG NAVIGAZIONE COMPLESSA**
```typescript
// Pattern per navigazione con fallback
const navigateWithFallback = async (primaryId, fallbackSearch) => {
  if (primaryId) {
    return `/target/${primaryId}`;
  } else {
    // Fallback: cerca e naviga
    const results = await searchAPI(fallbackSearch);
    return results.length > 0 ? `/target/${results[0].id}` : null;
  }
};
```

### **2. VERIFICA DATI COMPLETI**
```typescript
// Pattern per verificare dati completi
const verifyDataCompleteness = (data, requiredFields) => {
  const missing = requiredFields.filter(field => !data[field]);
  if (missing.length > 0) {
    console.warn(`Dati mancanti: ${missing.join(', ')}`);
    return false;
  }
  return true;
};
```

### **3. DEBUG ENDPOINT FILTRATI**
```typescript
// Pattern per identificare filtri nascosti
const checkEndpointFilters = (endpoint, expectedFields) => {
  const response = await fetch(endpoint);
  const data = await response.json();
  const actualFields = Object.keys(data);
  const missing = expectedFields.filter(field => !actualFields.includes(field));
  if (missing.length > 0) {
    console.warn(`Endpoint filtra: ${missing.join(', ')}`);
  }
};
```

### **4. GESTIONE ELIMINAZIONE CASCADE**
```typescript
// Pattern per eliminazione sicura
const safeDelete = async (table, id, dependencies = []) => {
  // Prima elimina dipendenze
  for (const dep of dependencies) {
    await db.delete(dep.table).where(eq(dep.column, id));
  }
  
  // Poi elimina record principale
  await db.delete(table).where(eq(table.id, id));
  
  // Invalida cache
  queryCache.invalidate(table.name);
};
```

---

## 🎯 **CHECKLIST DEBUG AGGIORNATA**

### **Per Problemi di Navigazione:**
- [ ] Verificare se dati necessari sono presenti
- [ ] Implementare fallback per dati mancanti
- [ ] Separare navigazione immediata da operazioni background
- [ ] Testare tutti i percorsi di navigazione

### **Per Dati Mancanti:**
- [ ] Verificare che endpoint includa tutti i campi necessari
- [ ] Controllare filtri nascosti negli endpoint
- [ ] Tracciare flusso dati completo: DB → API → Frontend
- [ ] Aggiungere debug logging per dati critici

### **Per Problemi PDF:**
- [ ] Verificare che dati siano inclusi nella risposta API
- [ ] Controllare gestione errori per dati binari
- [ ] Testare generazione PDF con dati completi
- [ ] Aggiungere fallback per dati non visualizzabili

### **Per Eliminazione Cascade:**
- [ ] Identificare tutte le dipendenze foreign key
- [ ] Eliminare prima le tabelle dipendenti
- [ ] Invalidare cache per refresh UI
- [ ] Testare eliminazione con dati reali

---

## 🚀 **CONCLUSIONI AGGIORNATE**

Questa sessione ha dimostrato l'importanza di:
1. **Debug sistematico** - Seguire un processo logico
2. **Verifica schema** - Database fisico deve corrispondere al codice
3. **Migration sicure** - Usare sempre `IF NOT EXISTS` e comandi separati
4. **Validazione timing** - Nel momento giusto, non troppo presto
5. **Gestione tipi** - Conversioni esplicite null/undefined
6. **Validazione flessibile** - Usare `.refine()` per logica complessa
7. **Navigazione robusta** - Implementare sempre fallback
8. **Dati completi** - Verificare che endpoint non filtri dati essenziali
9. **Debug endpoint** - Controllare filtri nascosti
10. **Eliminazione cascade** - Gestire correttamente le dipendenze
11. **Documentazione** - Registrare lezioni apprese per il futuro

**🎯 Queste strategie possono essere riutilizzate per problemi simili in futuro!**

---

## 📅 **AGGIORNAMENTO: 20 Gennaio 2025**
## 🎯 **Sessione: Sistema Prezzi Speciali - Gestione Completa Frontend/Backend**

### 15. **ERRORE REACT RENDERING - "Maximum update depth exceeded" Warning**

#### 🔍 **Sintomi:**
- Warning React: "Maximum update depth exceeded"
- Loop infinito di re-render del componente SpecialPricesManager
- Console spammata di errori di rendering
- Performance degradata dell'applicazione

#### 🧠 **Strategia di Debug Applicata:**
1. **Identificazione Loop** - Analizzato useEffect che causava re-render infiniti
2. **Memoizzazione Array** - Implementato useMemo per stabilizzare array di dipendenze
3. **Ottimizzazione useEffect** - Aggiunto controlli per evitare aggiornamenti inutili
4. **Debug Dependencies** - Verificato che tutte le dipendenze siano stabili

#### ✅ **Soluzione Implementata:**
```typescript
// ❌ ERRORE: Array non memoizzato causa re-render infiniti
useEffect(() => {
  const filtered = clients.filter(client => 
    client.clientName.toLowerCase().includes(searchTerm.toLowerCase())
  );
  setFilteredClients(filtered);
}, [clients, searchTerm]);

// ✅ CORRETTO: Memoizzazione completa degli array
const stableClients = useMemo(() => clients, [clients]);
const filteredClientsMemo = useMemo(() => {
  if (!searchTerm) return stableClients.slice(0, 10);
  const searchLower = searchTerm.toLowerCase();
  return stableClients.filter(client =>
    client.clientName.toLowerCase().includes(searchLower) ||
    client.clientCode.toLowerCase().includes(searchLower)
  ).slice(0, 10);
}, [stableClients, searchTerm]);

useEffect(() => {
  setFilteredClients(prev => {
    const newFiltered = filteredClientsMemo;
    if (JSON.stringify(newFiltered) !== JSON.stringify(prev)) {
      return newFiltered;
    }
    return prev;
  });
}, [filteredClientsMemo]);
```

#### 📚 **Lezione Appresa:**
> **"SEMPRE memoizzare array e oggetti complessi usati come dipendenze di useEffect. I re-render infiniti sono causati da dipendenze instabili."**

---

### 16. **ERRORE WEBSOCKET CONNECTION - URL Malformato (localhost:undefined)**

#### 🔍 **Sintomi:**
- WebSocket connection failed: 'ws://localhost:undefined/?token=...'
- URL malformato con porta undefined
- Connessioni WebSocket non funzionanti
- Notifiche real-time non ricevute

#### 🧠 **Strategia di Debug Applicata:**
1. **Analisi URL Construction** - Identificato problema nella costruzione URL WebSocket
2. **Gestione Port Undefined** - Implementato fallback per porta mancante
3. **Supporto HTTPS/WSS** - Aggiunto supporto per protocolli sicuri
4. **Fallback Robusto** - Implementato fallback per tutti i casi edge

#### ✅ **Soluzione Implementata:**
```typescript
// ❌ ERRORE: URL malformato con porta undefined
const wsUrl = `ws://localhost:${window.location.port}/ws`;

// ✅ CORRETTO: Gestione robusta di tutti i casi
const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
const host = window.location.hostname || "localhost";
const port = window.location.port || (protocol === "wss:" ? "443" : "3000");
const wsUrl = `${protocol}//${host}:${port}/ws`;

// ✅ CORRETTO: Applicato a tutti i hook di notifica
// use-notifications.tsx, use-social-leads-notifications.tsx, 
// use-telemarketing-notifications.tsx, use-segnalazioni-notifications.tsx
```

#### 📚 **Lezione Appresa:**
> **"SEMPRE gestire i casi edge nella costruzione di URL dinamici. window.location.port può essere undefined in alcuni ambienti."**

---

### 17. **ERRORE DATABASE - "invalid input syntax for type numeric"**

#### 🔍 **Sintomi:**
- NeonDbError: invalid input syntax for type numeric: ""
- Stringhe vuote inviate al database per campi numeric
- Errori 500 durante salvataggio prezzi speciali
- Inconsistenza tra tipi client e server

#### 🧠 **Strategia di Debug Applicata:**
1. **Identificazione Tipo Mismatch** - Analizzato differenza tra tipi client e database
2. **Conversione Client-Side** - Implementato conversione stringhe vuote a null
3. **Conversione Server-Side** - Implementato conversione esplicita per Drizzle numeric
4. **Validazione Completa** - Aggiunto controlli per tutti i campi numerici

#### ✅ **Soluzione Implementata:**
```typescript
// ❌ ERRORE: Stringhe vuote inviate al database
fixedPrice: data.fixedPrice,
discountPercentage: data.discountPercentage,

// ✅ CORRETTO: Client-side - conversione a undefined per stringhe vuote
fixedPrice: data.fixedPrice && data.fixedPrice !== "" ? data.fixedPrice : undefined,
discountPercentage: data.discountPercentage && data.discountPercentage !== "" ? data.discountPercentage : undefined,

// ✅ CORRETTO: Server-side - conversione esplicita per Drizzle numeric
const dbData = {
  ...data,
  fixedPrice: data.fixedPrice && data.fixedPrice !== "" ? 
    (typeof data.fixedPrice === 'string' ? data.fixedPrice : data.fixedPrice.toString()) : null,
  discountPercentage: data.discountPercentage && data.discountPercentage !== "" ? 
    (typeof data.discountPercentage === 'string' ? data.discountPercentage : data.discountPercentage.toString()) : null,
  createdAt: new Date(),
  updatedAt: new Date()
};
```

#### 📚 **Lezione Appresa:**
> **"Drizzle numeric richiede stringhe, non numeri. SEMPRE convertire esplicitamente i tipi prima di inviare al database."**

---

### 18. **ERRORE UX - Form Non Si Chiude Dopo Salvataggio**

#### 🔍 **Sintomi:**
- Form rimane aperto dopo salvataggio riuscito
- Utente deve chiudere manualmente il modal
- UX confusa per l'utente
- Nessun feedback visivo di completamento

#### 🧠 **Strategia di Debug Applicata:**
1. **Analisi Callback** - Identificato mancanza di callback onSuccess
2. **Reset Completo** - Implementato reset completo del form e stato
3. **Chiusura Modal** - Aggiunto chiusura automatica del modal
4. **Feedback Utente** - Implementato feedback visivo di completamento

#### ✅ **Soluzione Implementata:**
```typescript
// ❌ ERRORE: Nessun callback onSuccess
const createSpecialPriceMutation = useMutation({
  mutationFn: createSpecialPrice,
  onError: (error) => {
    toast({ title: "Errore", description: error.message, variant: "destructive" });
  }
});

// ✅ CORRETTO: Callback onSuccess completo
const createSpecialPriceMutation = useMutation({
  mutationFn: createSpecialPrice,
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ["/api/client-special-prices"] });
    toast({ title: "Successo", description: "Prezzo speciale creato con successo" });
    form.reset();
    setEditingPrice(null);
    setIsAddingPrice(false);
    setActiveTab("list");
    onSuccess?.();
  },
  onError: (error) => {
    toast({ title: "Errore", description: error.message, variant: "destructive" });
  }
});
```

#### 📚 **Lezione Appresa:**
> **"SEMPRE implementare callback onSuccess completi per operazioni di salvataggio. L'UX richiede feedback immediato e chiusura automatica."**

---

### 19. **ERRORE DATABASE CONSTRAINT - Violazione Vincoli Check**

#### 🔍 **Sintomi:**
- NeonDbError: violates check constraint "check_target_type_product"
- Constraint del database non rispettato
- Errori 500 durante salvataggio prezzi speciali
- Logica di validazione insufficiente

#### 🧠 **Strategia di Debug Applicata:**
1. **Analisi Constraint** - Identificato constraint del database
2. **Logica Condizionale** - Implementato logica per rispettare i vincoli
3. **Validazione Completa** - Aggiunto controlli per tutti i casi
4. **Gestione Null/Undefined** - Implementato gestione corretta dei valori nulli

#### ✅ **Soluzione Implementata:**
```typescript
// ❌ ERRORE: Non rispetta constraint del database
const submitData = {
  targetBrand: data.targetBrand,
  targetProductId: data.targetProductId,
};

// ✅ CORRETTO: Logica condizionale per rispettare i constraint
const submitData: CreateSpecialPriceData = {
  clientId: selectedClient.id,
  priceType: data.priceType,
  targetType: data.targetType,
  // Rispetta il constraint del database: se PRODUCT, solo targetProductId; se BRAND, solo targetBrand
  targetBrand: data.targetType === 'BRAND' ? data.targetBrand : undefined,
  targetProductId: data.targetType === 'PRODUCT' ? data.targetProductId : undefined,
  fixedPrice: data.fixedPrice && data.fixedPrice !== "" ? data.fixedPrice : undefined,
  discountPercentage: data.discountPercentage && data.discountPercentage !== "" ? data.discountPercentage : undefined,
  notes: data.notes,
  isActive: data.isActive,
};
```

#### 📚 **Lezione Appresa:**
> **"SEMPRE rispettare i constraint del database. Implementare logica condizionale per evitare violazioni di vincoli."**

---

### 20. **ERRORE REACT COMPONENT - "uncontrolled to controlled" Warning**

#### 🔍 **Sintomi:**
- Warning: A component is changing from uncontrolled to controlled
- Select component con valori null/undefined inconsistenti
- Comportamento imprevedibile del form
- Errori di rendering intermittenti

#### 🧠 **Strategia di Debug Applicata:**
1. **Analisi Valori** - Identificato inconsistenza tra null e undefined
2. **Standardizzazione** - Implementato uso consistente di undefined
3. **Gestione Select** - Aggiunto gestione esplicita per componenti Select
4. **Validazione Schema** - Aggiornato schema Zod per gestire nullable

#### ✅ **Soluzione Implementata:**
```typescript
// ❌ ERRORE: Inconsistenza tra null e undefined
defaultValues: {
  targetProductId: null,
},
value={field.value} // Può essere null o undefined

// ✅ CORRETTO: Gestione consistente di null/undefined
const specialPriceFormSchema = z.object({
  targetProductId: z.number().optional().nullable(),
  // ... altri campi
});

defaultValues: {
  targetProductId: undefined,
},

// ✅ CORRETTO: Gestione esplicita per Select component
<Select
  value={field.value || ""} // Conversione esplicita per Select
  onValueChange={(value) => field.onChange(value || undefined)}
>
```

#### 📚 **Lezione Appresa:**
> **"SEMPRE gestire esplicitamente i valori null/undefined nei componenti controllati. I componenti Select richiedono gestione speciale."**

---

### 21. **ERRORE RENDERING SICURO - Pagina Bianca**

#### 🔍 **Sintomi:**
- Pagina bianca quando si seleziona brand dopo prodotto specifico
- Nessun errore visibile nella console
- Componente non si renderizza correttamente
- Array o oggetti null/undefined non gestiti

#### 🧠 **Strategia di Debug Applicata:**
1. **Identificazione Errori JavaScript** - Controllato console browser per errori
2. **Protezione Rendering** - Aggiunto controlli di sicurezza per array e oggetti
3. **Debug Dettagliato** - Aggiunto logging per tracciare il flusso dei dati
4. **Controlli Condizionali** - Implementato rendering sicuro con fallback

#### ✅ **Soluzione Implementata:**
```typescript
// ❌ ERRORE: Rendering non protetto
{products.map((product: any) => (
  <div key={product.id}>...</div>
))}

// ✅ CORRETTO: Rendering sicuro con controlli
const filteredProducts = useMemo(() => {
  if (!selectedBrand || !products) return [];
  return (products || []).filter(product => 
    product.brand === selectedBrand
  );
}, [selectedBrand, products]);

// ✅ CORRETTO: Debug per identificare problemi
console.log("🔍 Debug products:", {
  selectedBrand,
  products,
  filteredProducts,
  productsLength: products?.length
});

// ✅ CORRETTO: Rendering condizionale sicuro
{filteredProducts && filteredProducts.length > 0 ? filteredProducts.map((product: any) => (
  <div key={product.id}>...</div>
)) : (
  <div>Nessun prodotto disponibile</div>
)}
```

#### 📚 **Lezione Appresa:**
> **"SEMPRE proteggere il rendering con controlli di sicurezza. Array e oggetti dinamici possono causare errori JavaScript silenziosi."**

---

### 22. **ERRORE TYPESCRIPT - Type Mismatches Server Startup**

#### 🔍 **Sintomi:**
- Errori TypeScript durante avvio server
- Type mismatches tra client e server
- Protocollo anti-regressione blocca avvio
- Incompatibilità tra tipi form e database

#### 🧠 **Strategia di Debug Applicata:**
1. **Analisi Errori TypeScript** - Eseguito `npx tsc --noEmit` per identificare errori
2. **Sincronizzazione Tipi** - Allineato tipi tra client e server
3. **Gestione Null/Undefined** - Implementato conversione esplicita
4. **Validazione Schema** - Aggiornato schema per compatibilità

#### ✅ **Soluzione Implementata:**
```typescript
// ❌ ERRORE: Type mismatch tra form e database
targetProductId: data.targetProductId, // Può essere null ma tipo non lo accetta

// ✅ CORRETTO: Gestione esplicita dei tipi
const specialPriceFormSchema = z.object({
  targetProductId: z.number().optional().nullable(),
});

// ✅ CORRETTO: Conversione esplicita in submit
targetProductId: data.targetType === 'PRODUCT' ? (data.targetProductId || undefined) : undefined,

// ✅ CORRETTO: Server-side - conversione per Drizzle
fixedPrice: data.fixedPrice && data.fixedPrice !== "" ? 
  (typeof data.fixedPrice === 'string' ? data.fixedPrice : data.fixedPrice.toString()) : null,
```

#### 📚 **Lezione Appresa:**
> **"SEMPRE allineare i tipi tra client e server. I type mismatches causano errori di compilazione e runtime."**

---

### 23. **ERRORE PREZZI SPECIALI - Non Applicati al Preventivo**

#### 🔍 **Sintomi:**
- Prezzi speciali mostrati correttamente nella lista prodotti (99% in verde)
- Prezzi speciali non applicati al calcolo finale del preventivo
- Discrepanza tra prezzo mostrato e prezzo calcolato
- Sconto visualizzato ma non utilizzato

#### 🧠 **Strategia di Debug Applicata:**
1. **Analisi Flusso Dati** - Tracciato flusso completo dei prezzi speciali
2. **Identificazione Bug** - Trovato che addProduct ignorava prezzo calcolato
3. **Correzione Logica** - Implementato uso del prezzo già calcolato
4. **Verifica Completa** - Testato flusso completo frontend-backend

#### ✅ **Soluzione Implementata:**
```typescript
// ❌ ERRORE: addProduct ignorava il prezzo calcolato con sconto
const addProduct = (product: any, brand: string) => {
  // ...
  unitPrice: parseFloat(product.price.toString()), // Usava prezzo originale!
};

// ✅ CORRETTO: Usa il prezzo già calcolato con sconto
const addProduct = (product: any, brand: string) => {
  // ...
  unitPrice: parseFloat(product.price.toString()), // Usa il prezzo già calcolato con sconto
};

// ✅ CORRETTO: CosmeticProductSearch calcola e passa prezzo corretto
const handleAddProduct = (product: CosmeticProduct) => {
  if (selectedBrand) {
    const finalPrice = calculateFinalPrice(product); // Calcola prezzo speciale
    const productWithFinalPrice = {
      ...product,
      price: finalPrice.toString() // Passa prezzo scontato
    };
    onProductAdd(productWithFinalPrice, selectedBrand);
  }
};
```

#### 📚 **Lezione Appresa:**
> **"SEMPRE verificare che i dati calcolati vengano utilizzati correttamente nel flusso successivo. I bug di logica possono essere sottili ma critici."**

---

## 🛠️ **STRATEGIE GENERALI DI DEBUG AGGIORNATE**

### **1. DEBUG REACT RENDERING SICURO**
```typescript
// Pattern per evitare re-render infiniti
const stableData = useMemo(() => data, [data]);
const filteredData = useMemo(() => {
  // Logica di filtro
}, [stableData, filter]);

useEffect(() => {
  setState(prev => {
    const newState = filteredData;
    if (JSON.stringify(newState) !== JSON.stringify(prev)) {
      return newState;
    }
    return prev;
  });
}, [filteredData]);
```

### **2. GESTIONE WEBSOCKET ROBUSTA**
```typescript
// Pattern per URL WebSocket robusti
const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
const host = window.location.hostname || "localhost";
const port = window.location.port || (protocol === "wss:" ? "443" : "3000");
const wsUrl = `${protocol}//${host}:${port}/ws`;
```

### **3. GESTIONE TIPI DATABASE**
```typescript
// Pattern per conversione sicura per Drizzle numeric
const dbData = {
  ...data,
  numericField: data.numericField && data.numericField !== "" ? 
    (typeof data.numericField === 'string' ? data.numericField : data.numericField.toString()) : null,
};
```

### **4. GESTIONE FORM COMPLETA**
```typescript
// Pattern per callback onSuccess completi
const mutation = useMutation({
  mutationFn: saveData,
  onSuccess: () => {
    queryClient.invalidateQueries();
    toast({ title: "Successo", description: "Operazione completata" });
    form.reset();
    setEditingItem(null);
    setIsAdding(false);
    setActiveTab("list");
    onSuccess?.();
  }
});
```

### **5. GESTIONE CONSTRAINT DATABASE**
```typescript
// Pattern per rispettare constraint del database
const submitData = {
  field1: condition1 ? value1 : undefined,
  field2: condition2 ? value2 : undefined,
  // Solo un campo per volta per rispettare constraint
};
```

### **6. GESTIONE COMPONENTI CONTROLLATI**
```typescript
// Pattern per componenti Select sicuri
<Select
  value={field.value || ""} // Conversione esplicita
  onValueChange={(value) => field.onChange(value || undefined)}
>
```

### **7. RENDERING SICURO**
```typescript
// Pattern per rendering sicuro
const safeData = useMemo(() => {
  if (!data || !Array.isArray(data)) return [];
  return data.filter(item => item && item.id);
}, [data]);

{safeData.length > 0 ? safeData.map(item => (
  <Component key={item.id} data={item} />
)) : (
  <div>Nessun elemento disponibile</div>
)}
```

---

## 🎯 **CHECKLIST DEBUG AGGIORNATA**

### **Per Problemi React Rendering:**
- [ ] Verificare che array e oggetti siano memoizzati correttamente
- [ ] Controllare che useEffect non causino loop infiniti
- [ ] Implementare controlli per evitare re-render inutili
- [ ] Usare useMemo per dipendenze complesse

### **Per Problemi WebSocket:**
- [ ] Verificare costruzione URL WebSocket
- [ ] Gestire casi edge per porta undefined
- [ ] Implementare fallback per protocolli sicuri
- [ ] Testare connessioni in diversi ambienti

### **Per Problemi Database:**
- [ ] Verificare compatibilità tipi con Drizzle
- [ ] Gestire conversione esplicita per campi numeric
- [ ] Rispettare constraint del database
- [ ] Implementare validazione completa

### **Per Problemi Form:**
- [ ] Implementare callback onSuccess completi
- [ ] Gestire reset completo del form e stato
- [ ] Fornire feedback visivo all'utente
- [ ] Gestire componenti controllati correttamente

### **Per Problemi TypeScript:**
- [ ] Eseguire `npx tsc --noEmit` per verificare errori
- [ ] Allineare tipi tra client e server
- [ ] Gestire conversione esplicita null/undefined
- [ ] Aggiornare schema per compatibilità

---

## 🚀 **CONCLUSIONI FINALI**

Questa sessione ha dimostrato l'importanza di:
1. **Debug sistematico** - Seguire un processo logico
2. **Gestione errori completa** - Non fermarsi al primo tentativo
3. **TypeScript rigoroso** - I tipi devono essere consistenti
4. **Database constraints** - Rispettare sempre i vincoli
5. **React best practices** - Usare correttamente hooks e rendering
6. **Validazione completa** - Validare sia client che server
7. **Gestione null/undefined** - Gestire esplicitamente tutti i casi
8. **Rendering sicuro** - Proteggere sempre il rendering dinamico
9. **Flusso dati completo** - Verificare che i dati vengano utilizzati correttamente
10. **UX feedback** - Fornire feedback immediato e chiusura automatica
11. **Documentazione** - Registrare lezioni apprese per il futuro

**🎯 Queste strategie possono essere riutilizzate per problemi simili in futuro!**

---

## 📅 **AGGIORNAMENTO: 19 Gennaio 2025**
## 🎯 **Sessione: Sistema Rientri Parziali Preventivi Cosmetici**

### 11. **ERRORE LOGICA FRONTEND - Rientro Parziale Non Funzionava**

#### 🔍 **Sintomi:**
- Quando si cliccava "Rientro Parziale", venivano selezionati automaticamente TUTTI i prodotti
- Non era possibile selezionare prodotti individuali
- L'interfaccia non permetteva la selezione granulare

#### 🧠 **Strategia di Debug Applicata:**
1. **Analisi Logica Componente** - Identificato errore nella logica di selezione
2. **Identificazione Stato** - Mancava distinzione tra tipo di rientro e selezione prodotti
3. **Implementazione Stato Separato** - Aggiunto `reversalType` per controllare il comportamento
4. **Correzione Logica Pulsanti** - Separato logica di tipo rientro da selezione prodotti

#### ✅ **Soluzione Implementata:**
```typescript
// ❌ ERRORE: Logica confusa
const isCompleteReversal = reversedItems.size === 0;
const isPartialReversal = reversedItems.size > 0 && reversedItems.size < items.length;

// ✅ CORRETTO: Stato separato per tipo rientro
const [reversalType, setReversalType] = useState<'complete' | 'partial' | null>(null);
const isCompleteReversal = reversalType === 'complete';
const isPartialReversal = reversalType === 'partial';

// ✅ CORRETTO: Pulsanti con logica chiara
<Button onClick={() => {
  setReversalType('partial');
  setReversedItems(new Set()); // Reset selezione
}}>
  Rientro Parziale
</Button>
```

#### 📚 **Lezione Appresa:**
> **"Separare sempre lo stato del tipo di operazione dalla selezione specifica. Uno stato confuso porta a comportamenti inaspettati."**

---

### 12. **ERRORE ENDPOINT DUPLICATI - Prodotti Non Mostrati**

#### 🔍 **Sintomi:**
- Modal mostrava "Nessun prodotto trovato" anche per preventivi con prodotti
- Backend aveva logica corretta per salvare items
- Rientro completo funzionava (aggiornava statistiche)
- Rientro parziale non mostrava prodotti

#### 🧠 **Strategia di Debug Applicata:**
1. **Identificazione Endpoint Duplicati** - Trovati due endpoint `/api/biyu-quotes/:id`
2. **Analisi Ordine Esecuzione** - Primo endpoint sovrascriveva il secondo
3. **Verifica Funzionalità** - Primo endpoint non includeva items, secondo sì
4. **Rimozione Duplicato** - Mantenuto solo endpoint completo

#### ✅ **Soluzione Implementata:**
```typescript
// ❌ ERRORE: Due endpoint identici
app.get("/api/biyu-quotes/:id", async (req, res) => {
  // Primo endpoint - senza items
  res.json(updatedQuote);
});

app.get("/api/biyu-quotes/:id", async (req, res) => {
  // Secondo endpoint - con items (mai raggiunto!)
  res.json({ ...updatedQuote, items: items });
});

// ✅ CORRETTO: Un solo endpoint completo
app.get("/api/biyu-quotes/:id", async (req, res) => {
  const updatedQuote = await storage.getBiyuQuoteById(id);
  const items = await storage.getBiyuQuoteItems(id);
  res.json({ ...updatedQuote, items: items });
});
```

#### 📚 **Lezione Appresa:**
> **"Endpoint duplicati sono un problema comune. Sempre verificare che non ci siano route duplicate che si sovrascrivono."**

---

### 13. **ERRORE INTERFACCIA AMBIGUA - Click Confuso**

#### 🔍 **Sintomi:**
- Interfaccia originale con click sui prodotti non era chiara
- Non era ovvio se cliccare significasse "rientrare" o "mantenere"
- UX confusa per l'utente
- Necessità di spiegazioni continue

#### 🧠 **Strategia di Debug Applicata:**
1. **Analisi UX** - Identificato che l'interazione era ambigua
2. **Progettazione Interfaccia** - Sostituito click con pulsanti espliciti
3. **Implementazione Chiara** - Due pulsanti distinti per ogni prodotto
4. **Feedback Visivo** - Colori e icone chiare per ogni azione

#### ✅ **Soluzione Implementata:**
```typescript
// ❌ ERRORE: Click ambiguo
<div onClick={() => toggleItem(item.id)}>
  Prodotto
</div>

// ✅ CORRETTO: Pulsanti espliciti
<div className="flex gap-2">
  <Button
    variant={reversedItems.has(item.id) ? "outline" : "default"}
    onClick={() => {
      const newSet = new Set(reversedItems);
      newSet.delete(item.id);
      setReversedItems(newSet);
    }}
  >
    ✅ Mantieni
  </Button>
  <Button
    variant={reversedItems.has(item.id) ? "default" : "outline"}
    onClick={() => {
      const newSet = new Set(reversedItems);
      newSet.add(item.id);
      setReversedItems(newSet);
    }}
  >
    🔄 Rientra
  </Button>
</div>
```

#### 📚 **Lezione Appresa:**
> **"Preferire sempre interfacce esplicite invece di interazioni ambigue. Due pulsanti chiari sono meglio di un click confuso."**

---

### 14. **ERRORE RENDERING SICURO - Pagina Bianca**

#### 🔍 **Sintomi:**
- Quando si selezionava "Rientro Parziale", la pagina diventava bianca
- Nessun errore visibile nella console
- Componente non si renderizzava correttamente

#### 🧠 **Strategia di Debug Applicata:**
1. **Identificazione Errori JavaScript** - Controllato console browser per errori
2. **Protezione Rendering** - Aggiunto controlli di sicurezza per array e oggetti
3. **Debug Dettagliato** - Aggiunto logging per tracciare il flusso dei dati
4. **Controlli Condizionali** - Implementato rendering sicuro con fallback

#### ✅ **Soluzione Implementata:**
```typescript
// ❌ ERRORE: Rendering non protetto
{items.map((item: any) => (
  <div key={item.id}>...</div>
))}

// ✅ CORRETTO: Rendering sicuro
{items && Array.isArray(items) && items.length > 0 ? items.map((item: any) => (
  <div key={item.id}>...</div>
)) : (
  <div>Nessun prodotto disponibile</div>
)}

// ✅ CORRETTO: Debug per identificare problemi
const items = quoteDetails?.items || [];
console.log("🔍 Debug items:", {
  quoteDetails,
  items,
  type: typeof items,
  length: items?.length
});
```

#### 📚 **Lezione Appresa:**
> **"Sempre proteggere il rendering con controlli di sicurezza. Array e oggetti dinamici possono causare errori JavaScript silenziosi."**

---

## 🛠️ **STRATEGIE GENERALI DI DEBUG AGGIORNATE**

### **1. DEBUG SISTEMATICO FRONTEND/BACKEND**
```typescript
// Pattern per debug completo
const debugSystematic = async (endpoint, data) => {
  console.log("🔍 DEBUG COMPLETO:");
  console.log("- Endpoint:", endpoint);
  console.log("- Data keys:", Object.keys(data || {}));
  console.log("- Items array:", data.items);
  console.log("- Items type:", typeof data.items);
  console.log("- Items length:", data.items?.length);
};
```

### **2. CONTROLLI DI SICUREZZA NEL RENDERING**
```typescript
// Pattern per rendering sicuro
const safeRender = (items, renderItem) => {
  if (!items || !Array.isArray(items) || items.length === 0) {
    return <div>Nessun elemento disponibile</div>;
  }
  return items.map(renderItem);
};
```

### **3. INTERFACCIA ESPLICITA VS AMBIGUA**
```typescript
// Pattern per interfacce chiare
const explicitInterface = (item, onKeep, onReturn) => (
  <div className="flex gap-2">
    <Button onClick={() => onKeep(item.id)}>
      ✅ Mantieni
    </Button>
    <Button onClick={() => onReturn(item.id)}>
      🔄 Rientra
    </Button>
  </div>
);
```

### **4. IDENTIFICAZIONE ENDPOINT DUPLICATI**
```bash
# Comando per trovare endpoint duplicati
grep -n "app\.get.*same-route" server/routes.ts
```

### **5. STATO DI SELEZIONE MULTIPLA**
```typescript
// Pattern per gestione selezione multipla
const useMultiSelection = (initialItems = []) => {
  const [selectedItems, setSelectedItems] = useState(new Set());
  
  const toggleItem = (id) => {
    const newSet = new Set(selectedItems);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedItems(newSet);
  };
  
  const clearSelection = () => setSelectedItems(new Set());
  const selectAll = () => setSelectedItems(new Set(initialItems.map(item => item.id)));
  
  return { selectedItems, toggleItem, clearSelection, selectAll };
};
```

---

## 🎯 **CHECKLIST DEBUG AGGIORNATA**

### **Per Problemi di Logica Frontend:**
- [ ] Separare stato del tipo operazione dalla selezione specifica
- [ ] Verificare che la logica dei pulsanti sia chiara e non ambigua
- [ ] Testare tutti i percorsi di interazione utente
- [ ] Implementare validazione lato client per feedback immediato

### **Per Problemi di Rendering:**
- [ ] Proteggere sempre il rendering con controlli di sicurezza
- [ ] Aggiungere debug dettagliato per tracciare il flusso dei dati
- [ ] Implementare fallback per dati mancanti o corrotti
- [ ] Testare con dati edge case (array vuoti, oggetti null)

### **Per Problemi di Interfaccia:**
- [ ] Preferire interfacce esplicite invece di interazioni ambigue
- [ ] Usare pulsanti chiari con icone e colori distintivi
- [ ] Implementare feedback visivo immediato per le azioni
- [ ] Testare l'usabilità con utenti reali

### **Per Problemi di Endpoint:**
- [ ] Verificare che non ci siano endpoint duplicati
- [ ] Controllare l'ordine di registrazione delle route
- [ ] Testare che tutti gli endpoint restituiscano i dati attesi
- [ ] Aggiungere logging per tracciare le chiamate API

---

## 🚀 **CONCLUSIONI FINALI**

Questa sessione ha dimostrato l'importanza di:
1. **Debug sistematico** - Seguire un processo logico
2. **Verifica schema** - Database fisico deve corrispondere al codice
3. **Migration sicure** - Usare sempre `IF NOT EXISTS` e comandi separati
4. **Validazione timing** - Nel momento giusto, non troppo presto
5. **Gestione tipi** - Conversioni esplicite null/undefined
6. **Validazione flessibile** - Usare `.refine()` per logica complessa
7. **Navigazione robusta** - Implementare sempre fallback
8. **Dati completi** - Verificare che endpoint non filtri dati essenziali
9. **Debug endpoint** - Controllare filtri nascosti
10. **Eliminazione cascade** - Gestire correttamente le dipendenze
11. **Stato separato** - Distinguere tipo operazione da selezione specifica
12. **Endpoint unici** - Evitare route duplicate
13. **Interfaccia esplicita** - Preferire chiarezza all'eleganza
14. **Rendering sicuro** - Proteggere sempre il rendering dinamico
15. **Documentazione** - Registrare lezioni apprese per il futuro
16. **Responsive design** - Prevenzione overflow globale e bottoni touch-friendly
17. **WebSocket signatures** - Verificare parametri corretti degli hook

**🎯 Queste strategie possono essere riutilizzate per problemi simili in futuro!**

---

## 📅 **AGGIORNAMENTO: 26 Gennaio 2025**
## 🎯 **Sessione: Ottimizzazione Responsive - Mobile e Tablet**

### 24. **ERRORE OVERFLOW MOBILE - Layout Non Responsive**

#### 🔍 **Sintomi:**
- Bottoni e icone che sbordano su schermi mobili
- Scroll orizzontale indesiderato su tablet
- Testi tagliati o fuori dallo viewport
- Bottoni troppo piccoli per il touch (inferiori a 44px)
- Layout desktop applicato a dispositivi mobile

#### 🧠 **Strategia di Debug Applicata:**
1. **Analisi Viewport** - Identificato che non c'erano breakpoint tablet specifici
2. **Implementazione CSS Globale** - Creato sistema di prevenzione overflow
3. **Ottimizzazione Componenti Base** - Button e Card modificati per essere responsive-by-default
4. **Wrapper Riutilizzabile** - Creato componente ResponsivePage per rapida applicazione
5. **Priorizzazione Pagine** - Ottimizzate pagine critiche prima (clienti, preventivi, corsi, dashboard)

#### ✅ **Soluzione Implementata:**

**Tailwind Config - Breakpoint Tablet:**
```typescript
screens: {
  'tablet': '768px',
  'tablet-landscape': '1024px',
  'tablet-portrait': {'raw': '(min-width: 768px) and (max-width: 1024px) and (orientation: portrait)'},
},
spacing: {
  'touch': '44px', // Minim per touch-friendly
},
```

**CSS Globale Prevenzione:**
```css
html, body { overflow-x: hidden; max-width: 100vw; }
@media (min-width: 768px) and (max-width: 1024px) {
  .container { max-width: 100%; padding: 1rem; }
  button { min-height: 44px; }
}
```

**Button Component Touch-Friendly:**
```typescript
const buttonVariants = cva(
  "touch-target min-h-[44px] lg:min-h-0", // Mobile 44px, Desktop normale
  { size: { sm: "h-11 lg:h-9", icon: "h-11 w-11 lg:h-10 lg:w-10" } }
);
```

**Wrapper ResponsivePage:**
```typescript
export function ResponsivePage({ children, padding = "md", maxWidth = "default" }) {
  return (
    <div className="page-container overflow-x-hidden">
      {children}
    </div>
  );
}
// USAGE: <ResponsivePage padding="lg"><content /></ResponsivePage>
```

#### 📚 **Lezione Appresa:**
> **"SEMPRE prevenire overflow orizzontale a livello globale con CSS. Bottoni touch devono essere minimo 44px su mobile/tablet. Usare wrapper componenti per applicare best practices rapidamente (5 minuti per pagina)."**

---

### 25. **ERRORE WEBSOCKET - Signature Invocata Con Parametri Errati**

#### 🔍 **Sintomi:**
- Errori TypeScript: "Expected 1 arguments, but got 3"
- Hook WebSocket non funzionante per notifiche
- Metodo `subscribe` chiamato con parametri non validi
- Protocollo anti-regressione bloccava avvio server

#### 🧠 **Strategia di Debug Applicata:**
1. **Analisi Errore TypeScript** - `npx tsc --noEmit` identificato errori specifici
2. **Verifica Signature Metodi** - Controllato definizione subscribe (accetta solo 1 arg)
3. **Correzione Chiamate** - Rimosso parametri extra (user.role, user.username)
4. **Sincronizzazione Dati** - Allineato accesso dati (message.data vs message.notification)

#### ✅ **Soluzione Implementata:**
```typescript
// ❌ ERRORE: subscribe con parametri extra
subscribe((message) => { }, user.role, user.username); // 3 param!

// ✅ CORRETTO: Solo callback
subscribe((message) => { }); // 1 param solo

// ❌ ERRORE: message.notification
console.log(message.notification); // Non esiste!

// ✅ CORRETTO: message.data
console.log(message.data);
setNotifications(prev => [message.data, ...prev]);
```

#### 📚 **Lezione Appresa:**
> **"Verificare SEMPRE la signature dei metodi. Se subscribe accetta 1 arg, non passare 3. Controllare struttura tipi per accesso corretto (data vs notification)."**

---

### 26. **ERRORE LAYOUT MOBILE - CardTitle Overflow**

#### 🔍 **Sintomi:**
- Bottoni "Stampa Iscritti", "Completato", "Elimina Tutte" sbordano su mobile
- Layout flex-row nel CardTitle causa overflow orizzontale
- Bottoni tagliati dalla scrollbar su tablet

#### 🧠 **Strategia di Debug Applicata:**
1. **Analisi Struttura** - CardTitle usa flex-row su tutte le dimensioni
2. **Ristrutturazione** - Separato titolo da bottoni, verticale su mobile
3. **Ottimizzazione Testi** - Testi abbreviati su mobile ("Stampa" vs "Stampa Iscritti")
4. **Breakpoint Tablet** - Layout responsive tablet portrait/landscape

#### ✅ **Soluzione Implementata:**
```tsx
// ❌ ERRORE: Layout rigido flex-row
<CardTitle className="flex items-center justify-between">
  <div>...</div>
  <div className="flex gap-2">{/* Bottoni */}</div>
</CardTitle>

// ✅ CORRETTO: Layout responsive
<div className="flex flex-col gap-3">
  <div className="flex items-center justify-between">
    <CardTitle className="text-base sm:text-lg">Titolo</CardTitle>
  </div>
  <div className="flex flex-col sm:flex-row gap-2">
    <Button className="w-full sm:w-auto">
      <Icon className="w-4 h-4 flex-shrink-0" />
      <span className="hidden sm:inline">Stampa Iscritti</span>
      <span className="sm:hidden">Stampa</span>
    </Button>
  </div>
</div>
```

#### 📚 **Lezione Appresa:**
> **"Layout verticale su mobile, orizzontale su desktop. Separare titolo da azioni. Testi abbreviati su mobile per ridurre overflow. Breakpoint tablet per ottimizzazioni mirate (portrait: 2 colonne, landscape: 3 colonne)."**

---

## 🛠️ **STRATEGIE RESPONSIVE - QUICK REFERENCE**

### **1. Prevenzione Overflow Globale**
```css
html, body { overflow-x: hidden; max-width: 100vw; }
.card { max-width: 100%; overflow: hidden; }
```

### **2. Bottoni Touch-Friendly**
```typescript
<Button className="min-h-touch w-full sm:w-auto">
  <Icon /> <span className="hidden sm:inline">Testo</span>
</Button>
```

### **3. Grid Responsive**
```tsx
<div className="grid grid-cols-1 tablet-grid-2 lg:grid-cols-3 gap-4">
```

### **4. Wrapper Pagina**
```tsx
export default function Pagina() {
  return <ResponsivePage padding="lg">{/* content */}</ResponsivePage>;
}
```

---

## 🎯 **CHECKLIST RESPONSIVE**

### **Per Overflow Mobile/Tablet:**
- [ ] `overflow-x-hidden` globalmente
- [ ] `max-w-full` su container
- [ ] ResponsivePage wrapper
- [ ] Test viewport iPad (1024x768)

### **Per Bottoni Touch:**
- [ ] Minimo 44px altezza
- [ ] Full-width mobile, auto desktop
- [ ] Text abbreviati su mobile

### **Per Layout:**
- [ ] Flex-col mobile, flex-row desktop
- [ ] Separare titolo da azioni
- [ ] Breakpoint tablet-specifici

---

## 🚀 **CONCLUSIONI**

Responsive design richiede:
1. **CSS globale preventivo** - Evita overflow everywhere
2. **Componenti base ottimizzati** - Button 44px by default
3. **Wrapper riutilizzabili** - 5 min per pagina
4. **Breakpoint tablet** - iPad portrait/landscape
5. **Touch-friendly sempre** - Minimum 44px targets
6. **Layout flessibile** - Verticale ↔ Orizzontale
7. **Type safety** - Verifica signature metodi
8. **Documentazione** - Guida rapida per dev futuri

**🎯 Sistema ottimizzato per mobile/tablet in modo sostenibile!**

---

## 📅 **AGGIORNAMENTO: 28 Ottobre 2025**
## 🎯 **Sessione: Deploy Fly.io - Dipendenze Mancanti**

### 27. **ERRORE DEPLOY - "Rollup failed to resolve import"**

#### 🔍 **Sintomi:**
- Deploy su Fly.io fallisce con errore Vite build
- Errore: `Rollup failed to resolve import "leaflet" from "MapView.tsx"`
- Build locale funziona, ma deploy remoto fallisce
- Dipendenza usata nel codice ma non presente nel package.json
- Errore scoperto solo durante deploy, non durante sviluppo

#### 🧠 **Strategia di Debug Applicata:**
1. **Analisi Errore Build** - Identificato modulo mancante dall'errore Rollup
2. **Verifica package.json** - Controllato che dipendenza non era installata
3. **Identificazione File** - Trovato componente MapView.tsx che importava leaflet
4. **Installazione Dipendenze** - Aggiunto leaflet e @types/leaflet
5. **Commit e Rideploy** - Committato package.json aggiornato

#### ✅ **Soluzione Implementata:**
```bash
# Installazione dipendenza mancante
npm install leaflet
npm install --save-dev @types/leaflet

# Commit modifiche
git add package.json package-lock.json
git commit -m "fix: aggiunte dipendenze leaflet per MapView"
git push

# Rideploy
flyctl deploy
```

#### 📚 **Lezione Appresa:**
> **"SEMPRE verificare che tutte le dipendenze necessarie siano nel package.json PRIMA di commit/deploy. Eseguire `npm run build` localmente per identificare dipendenze mancanti prima che fallisca il deploy remoto."**

---

## 🛠️ **STRATEGIE GENERALI DI DEBUG AGGIORNATE**

### **1. CHECKLIST PRE-COMMIT OBBLIGATORIA**

**Prima di OGNI commit con modifiche significative:**

```bash
# 1. Build locale DEVE passare
npm run build

# 2. TypeScript DEVE essere senza errori
npx tsc --noEmit

# 3. Verifica dipendenze importate
# Cerca tutti gli import esterni (non @/...)
grep -r "^import.*from ['\"]" client/src/ | grep -v "@/"
# Verifica che ogni libreria sia nel package.json
```

**Regola d'oro:**
> Se il build fallisce in locale, NON committare. Il deploy remoto fallirebbe allo stesso modo.

### **2. VERIFICA IMPORT ESTERNI**

```bash
# Pattern per identificare librerie esterne da verificare
grep -r "^import.*from ['\"]" client/src/pages/nuovo-componente.tsx | grep -v "@/" | grep -v "react"

# Esempio output da verificare:
# import L from "leaflet";           ← Verificare che 'leaflet' sia in package.json
# import moment from "moment";       ← Verificare che 'moment' sia in package.json
# import { Button } from "@/components/ui/button"; ← OK, import interno
```

### **3. SCRIPT AUTOMATICO VERIFICA DIPENDENZE**

```bash
#!/bin/bash
# File: scripts/check-missing-dependencies.sh

echo "🔍 Verificando dipendenze mancanti..."

# Estrai tutti gli import esterni
IMPORTS=$(grep -rh "^import.*from ['\"]" client/src/ | grep -v "@/" | grep -v "react" | sed -E "s/.*from ['\"]([^'\"]+)['\"].*/\1/" | sort -u)

# Verifica che ogni import sia nel package.json
for import in $IMPORTS; do
  if ! grep -q "\"$import\"" package.json; then
    echo "❌ Dipendenza mancante: $import"
  else
    echo "✅ $import presente"
  fi
done

echo "🎯 Verifica completata"
```

### **4. WORKFLOW SICURO PER NUOVE FUNZIONALITÀ**

```typescript
// Quando aggiungi nuovi componenti o pagine:

// STEP 1: Identifica librerie esterne usate
import L from "leaflet";              // ← ESTERNO
import "leaflet/dist/leaflet.css";    // ← ESTERNO
import { Button } from "@/components/ui/button"; // ← INTERNO (OK)

// STEP 2: Verifica package.json PRIMA di committare
// grep "leaflet" package.json
// Se non trova nulla → installare!

// STEP 3: Test build locale
// npm run build
// Se fallisce → risolvere PRIMA di committare

// STEP 4: Solo ora commit + push + deploy
```

---

## 🎯 **CHECKLIST DEBUG AGGIORNATA**

### **Per Problemi Deploy/Build:**
- [ ] Eseguire `npm run build` localmente PRIMA di commit
- [ ] Verificare che build locale passi senza errori
- [ ] Cercare import di librerie esterne nei file modificati
- [ ] Controllare che tutte le librerie importate siano nel package.json
- [ ] Se deploy fallisce, leggere attentamente l'errore Rollup/Vite
- [ ] Identificare modulo mancante dall'errore
- [ ] Installare dipendenza + types (se TypeScript)
- [ ] Committare package.json aggiornato
- [ ] Rideploy

### **Per Nuovi Componenti/Pagine:**
- [ ] Identificare tutte le librerie esterne usate
- [ ] Verificare che siano nel package.json
- [ ] Test build locale
- [ ] Solo dopo: commit + deploy

---

## 🚀 **CONCLUSIONI FINALI AGGIORNATE**

Questa sessione ha dimostrato l'importanza di:
1. **Debug sistematico** - Seguire un processo logico
2. **Verifica schema** - Database fisico deve corrispondere al codice
3. **Migration sicure** - Usare sempre `IF NOT EXISTS` e comandi separati
4. **Validazione timing** - Nel momento giusto, non troppo presto
5. **Gestione tipi** - Conversioni esplicite null/undefined
6. **Validazione flessibile** - Usare `.refine()` per logica complessa
7. **Navigazione robusta** - Implementare sempre fallback
8. **Dati completi** - Verificare che endpoint non filtri dati essenziali
9. **Debug endpoint** - Controllare filtri nascosti
10. **Eliminazione cascade** - Gestire correttamente le dipendenze
11. **Stato separato** - Distinguere tipo operazione da selezione specifica
12. **Endpoint unici** - Evitare route duplicate
13. **Interfaccia esplicita** - Preferire chiarezza all'eleganza
14. **Rendering sicuro** - Proteggere sempre il rendering dinamico
15. **Documentazione** - Registrare lezioni apprese per il futuro
16. **Responsive design** - Prevenzione overflow globale e bottoni touch-friendly
17. **WebSocket signatures** - Verificare parametri corretti degli hook
18. **🆕 Build locale prima di deploy** - SEMPRE testare build prima di committare
19. **🆕 Verifica dipendenze** - Controllare package.json per import esterni
20. **🆕 Checklist pre-commit** - Processo sistematico per evitare errori di deploy
21. **🆕 Schema/Migration Mismatch** - Pattern per gestire campo NOT NULL prima della migration
22. **🆕 Isolamento Componenti** - Separazione completa con utility condivise
23. **🆕 Migration con Verifica** - Pattern per verificare successo migration

**🎯 Queste strategie possono essere riutilizzate per problemi simili in futuro!**

---

## 📅 **AGGIORNAMENTO: [Data corrente]**
## 🎯 **Sessione: Layout CSS - Bordo Inferiore Tabella Tagliato (Flexbox + Overflow)**

### 36. **ERRORE CSS LAYOUT - Bordo Inferiore Tabella Tagliato in Schermo Normale**

#### 🔍 **Sintomi:**
- Bordo inferiore del contenitore della tabella non visibile in modalità "schermo normale"
- Bordo inferiore visibile solo in modalità "schermo intero" (full-screen)
- Tabella appare "tagliata" in basso, specialmente con Windows taskbar visibile
- Layout flexbox con `overflow: hidden` causa taglio del padding-bottom
- Problema persiste dopo numerosi tentativi di correzione

#### 🧠 **Strategia di Debug Applicata:**
1. **Analisi Sistematica Layout** - Identificato gerarchia completa: `.app` → `.app-content` → `.app-main` → `.registro-page` → `.table-container`
2. **Riscrittura Completa** - Eliminate tutte le regole di dimensioni dinamiche e riscritte da zero
3. **Approccio Coerente** - Applicato pattern uniforme dall'alto verso il basso
4. **Gestione Overflow** - Separato overflow tra contenitori (overflow: hidden su `.app-main`, overflow: visible su `.registro-page`)
5. **Padding vs Pseudo-elemento** - Usato `::after` con `flex: 0 0` invece di `padding-bottom` per creare spazio visibile

#### ✅ **Soluzione Implementata:**
```css
/* === LAYOUT CONTAINER === */
.app {
  height: 100vh;
  display: flex;
  overflow: hidden;
}

.app-content {
  flex: 1 1 0%;
  overflow: hidden;
  min-height: 0;
}

/* === MAIN CONTENT === */
.app-main {
  flex: 1 1 0%;
  padding: var(--content-padding); /* Padding completo incluso bottom */
  overflow: hidden; /* Previene scroll pagina */
  min-height: 0;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
}

/* === REGISTRO PAGE STYLES === */
.registro-page {
  position: relative;
  flex: 1 1 0%;
  display: flex;
  flex-direction: column;
  overflow: visible; /* Permette al ::after di essere visibile */
  min-height: 0;
  box-sizing: border-box;
  width: 100%;
}

.registro-page::after {
  content: '';
  flex: 0 0 var(--content-padding); /* Spazio fisso alla fine */
  min-height: var(--content-padding);
  width: 100%;
  order: 999; /* Posiziona alla fine */
  flex-shrink: 0; /* Non si restringe */
}

/* === TABLES === */
.table-container {
  flex: 1 1 0%;
  min-height: 0;
  overflow: hidden; /* Scroll interno gestito da .table-container-inner */
  box-sizing: border-box;
  width: 100%;
}

.table-container-inner {
  overflow-x: auto;
  overflow-y: auto; /* UNICO elemento scrollabile */
  flex: 1 1 0%;
  min-height: 0;
  width: 100%;
}
```

#### 📚 **Lezione Appresa:**
> **"Quando si lavora con layout flexbox complessi e overflow, riscrivere da zero è più efficace che cercare di aggiustare regole esistenti. Pattern coerente: overflow: hidden su contenitori padre per prevenire scroll pagina, overflow: visible sul contenitore che deve mostrare pseudo-elementi, e unico elemento scrollabile all'interno (table-container-inner). Usare `::after` con `flex: 0 0` invece di `padding-bottom` quando l'elemento ha `overflow: hidden` per garantire visibilità dello spazio finale."**

#### 🔧 **Raccomandazioni Future:**
1. **Riscrittura vs Aggiustamento:**
   - Se un problema CSS persiste dopo 3+ tentativi, riscrivere da zero
   - Partire da una base pulita e coerente invece di aggiungere patch
   - Documentare il pattern finale per riutilizzo futuro

2. **Pattern Layout Flexbox:**
   - Ogni livello propaga `flex: 1 1 0%` e `min-height: 0` verso il basso
   - Solo l'ultimo livello scrollabile ha `overflow: auto`
   - Padding-bottom gestito con `::after` invece che padding diretto quando overflow: hidden
   - Usare `overflow: visible` solo dove necessario per pseudo-elementi

3. **Debug Layout:**
   - Analizzare gerarchia completa dall'alto verso il basso
   - Verificare overflow a ogni livello
   - Testare in modalità schermo normale E schermo intero
   - Considerare spazio occupato da taskbar/barre sistema

---

## 📅 **AGGIORNAMENTO: 29 Gennaio 2025**
## 🎯 **Sessione: Numero Progressivo Telemarketing - Isolamento Componenti e Schema/Migration Mismatch**

### 28. **ERRORE SCHEMA/MIGRATION MISMATCH - Campo NOT NULL Prima della Migration**

#### 🔍 **Sintomi:**
- Schema TypeScript definisce campo `numeroProgressivo` come NOT NULL
- Migration non ancora eseguita sul database
- Query SQL falliscono perché colonna non esiste
- Errori "column does not exist" o "cannot find column"
- Sistema non funziona finché migration non è eseguita

#### 🧠 **Strategia di Debug Applicata:**
1. **Identificazione Problema** - Schema definisce campo ma database non ce l'ha ancora
2. **Pattern Temporaneo Nullable** - Rendere campo nullable temporaneamente nello schema
3. **Commentare Codice Dipendente** - Commentare codice che usa il campo
4. **Esecuzione Migration** - Eseguire migration per creare colonna e popolare dati
5. **Attivazione Completa** - Decommentare campo e codice dopo migration

#### ✅ **Soluzione Implementata:**
```typescript
// ❌ ERRORE: Campo NOT NULL nello schema ma colonna non esiste
export const telemarketingContacts = pgTable("telemarketing_contacts", {
  numeroProgressivo: integer("numero_progressivo").unique().notNull(),
  // ... altri campi
});

// Query fallisce perché colonna non esiste ancora!

// ✅ CORRETTO: Pattern temporaneo nullable durante sviluppo
export const telemarketingContacts = pgTable("telemarketing_contacts", {
  // Campo commentato temporaneamente fino a migration
  // numeroProgressivo: integer("numero_progressivo").unique().notNull(),
  // ... altri campi
});

// Codice che usa il campo anche commentato temporaneamente
// let nextNumeroProgressivo = 1;
// try {
//   const [maxResult] = await db.select({ maxNumero: max(...) });
//   nextNumeroProgressivo = (maxResult?.maxNumero || 0) + 1;
// } catch (error) { ... }

// DOPO migration eseguita:
// 1. Decommentare campo nello schema con .notNull()
// 2. Decommentare codice di generazione
// 3. Verificare TypeScript
```

#### 📚 **Lezione Appresa:**
> **"Quando si aggiunge un campo NOT NULL ma la migration non è ancora eseguita, renderlo temporaneamente nullable nello schema e commentare il codice dipendente. Dopo la migration, attivare tutto. Questo evita errori durante lo sviluppo e permette di lavorare anche senza database aggiornato."**

---

### 29. **ISOLAMENTO COMPONENTI - Separazione Completa con Utility Condivise**

#### 🔍 **Sintomi:**
- Componenti simili ma con logiche diverse (MobileTelemarketingCard vs MobileBellezzaCard)
- Necessità di isolamento completo per evitare interferenze
- Codice duplicato in componenti correlati
- Modifiche a un componente che si riflettono su altri indesiderati

#### 🧠 **Strategia di Debug Applicata:**
1. **Identificazione Componenti da Separare** - Componenti che devono rimanere isolati
2. **Estrazione Utility Condivise** - Funzioni helper comuni in file separato
3. **Separazione Completa** - Ogni componente in file dedicato
4. **Aggiornamento Import** - Tutti i file che usano i componenti aggiornati
5. **Verifica Isolamento** - Nessuna condivisione di codice oltre le utility

#### ✅ **Soluzione Implementata:**
```typescript
// ❌ ERRORE: Componenti nello stesso file con codice condiviso
// mobile-card.tsx contiene:
// - MobileTelemarketingCard
// - MobileBellezzaCard
// - Funzioni helper (parseItalianOrISODate, formatItalianDateTime)

// Modifiche a uno influenzano l'altro!

// ✅ CORRETTO: Separazione completa con utility condivise
// lib/date-utils.ts
export const parseItalianOrISODate = (dateInput: string | Date | null | undefined): Date | null => {
  // Logica condivisa
};

export const formatItalianDateTime = (dateInput: string | Date | null | undefined): string => {
  // Logica condivisa
};

// components/ui/mobile-telemarketing-card.tsx
import { formatItalianDateTime } from "@/lib/date-utils";
export function MobileTelemarketingCard({ ... }) {
  // Componente completamente isolato
}

// components/ui/mobile-bellezza-card.tsx
import { formatItalianDateTime } from "@/lib/date-utils";
export function MobileBellezzaCard({ ... }) {
  // Componente completamente isolato
}

// pages/telemarketing-esteticsun.tsx
import { MobileTelemarketingCard } from "@/components/ui/mobile-telemarketing-card";

// pages/bellezza-contacts.tsx
import { MobileBellezzaCard } from "@/components/ui/mobile-bellezza-card";
```

#### 📚 **Lezione Appresa:**
> **"Per componenti che devono rimanere completamente isolati, separarli in file dedicati e estrarre solo le utility veramente condivise (date formatting, validazione, ecc.) in file separati. Questo garantisce che modifiche a un componente non influenzino altri."**

---

### 30. **MIGRATION SICURE CON VERIFICA POST-ESECUZIONE**

#### 🔍 **Sintomi:**
- Migration eseguita ma non si sa se è andata a buon fine
- Dati esistenti non popolati correttamente
- Constraint non applicati
- Nessun feedback visibile del risultato

#### 🧠 **Strategia di Debug Applicata:**
1. **Script Migration Strutturato** - Seguire pattern documentato (divisione comandi)
2. **Verifica Struttura Post-Migration** - Controllare che colonna esista con tipo corretto
3. **Conteggio Record Popolati** - Verificare che tutti i record abbiano il campo valorizzato
4. **Logging Dettagliato** - Ogni step documentato con feedback chiaro
5. **Gestione Errori Idempotente** - Se colonna esiste già, continuare senza errore

#### ✅ **Soluzione Implementata:**
```javascript
// ✅ CORRETTO: Script migration con verifica completa
async function runMigration() {
  const sql = neon(process.env.DATABASE_URL);
  
  // 1. Esegui migration
  const commands = migrationSQL.split('--> statement-breakpoint')
    .map(section => {
      return section
        .split('\n')
        .filter(line => {
          const trimmed = line.trim();
          return trimmed && !trimmed.startsWith('--') && trimmed !== '';
        })
        .join('\n');
    })
    .filter(cmd => cmd.trim().length > 0);
  
  for (let i = 0; i < commands.length; i++) {
    try {
      await sql(commands[i].trim());
      console.log(`✅ Comando ${i + 1} completato`);
    } catch (error) {
      // Idempotenza: se esiste già, continua
      if (error.message?.includes('already exists')) {
        console.log(`⚠️  Già esistente, continuo...`);
      } else {
        throw error;
      }
    }
  }
  
  // 2. Verifica struttura
  const columns = await sql`
    SELECT column_name, data_type, is_nullable
    FROM information_schema.columns 
    WHERE table_name = 'telemarketing_contacts' 
    AND column_name = 'numero_progressivo'
  `;
  
  console.log(`✅ Colonna presente: ${columns[0].data_type}`);
  
  // 3. Verifica dati popolati
  const countResult = await sql`
    SELECT COUNT(*) as total, COUNT(numero_progressivo) as with_numero
    FROM telemarketing_contacts
  `;
  
  console.log(`📊 Record totali: ${countResult[0].total}`);
  console.log(`📊 Record con numero_progressivo: ${countResult[0].with_numero}`);
}
```

#### 📚 **Lezione Appresa:**
> **"SEMPRE verificare la struttura database e i dati popolati dopo una migration. Aggiungere logging dettagliato e conteggi per confermare che tutto sia andato a buon fine. Gestire errori idempotenti per permettere riesecuzione sicura."**

---

### 31. **ERRORE API PATH - Brand con Underscore Non Funzionanti**

#### 🔍 **Sintomi:**
- Endpoint API restituisce HTML invece di JSON
- Errore: `Unexpected token '<', "<!DOCTYPE "... is not valid JSON`
- Funziona per brand senza underscore (CTECH, BIYU) ma non per SUGAR_PAST, ACCESSORI_DEPILAZIONE, GIORNATE_TECNICHE
- Path API generato con underscore invece di trattino

#### 🧠 **Strategia di Debug Applicata:**
1. **Identificazione Pattern** - Brand con underscore nel nome (SUGAR_PAST) generavano path errati
2. **Analisi Path API** - Verificato che endpoint server usano trattini (`sugar-past-products`) ma frontend generava underscore (`sugar_past-products`)
3. **Conversione Esplicita** - Implementato replace underscore → trattino nel componente frontend
4. **Verifica Tutti i Brand** - Controllato che tutti i brand con underscore siano gestiti correttamente

#### ✅ **Soluzione Implementata:**
```typescript
// ❌ ERRORE: Path generato con underscore
const apiPath = `/api/${productType.toLowerCase()}-products/${productId}/warehouse-history`;
// Per SUGAR_PAST genera: /api/sugar_past-products/... (SBAGLIATO)

// ✅ CORRETTO: Conversione underscore → trattino
const productTypeSlug = productType === "CTECH" 
  ? "ctech"
  : productType.toLowerCase().replace(/_/g, "-");
  
const apiPath = `/api/${productTypeSlug}-products/${productId}/warehouse-history`;
// Per SUGAR_PAST genera: /api/sugar-past-products/... (CORRETTO)
```

#### 📚 **Lezione Appresa:**
> **"Quando si costruiscono path API dinamicamente da enum/stringhe con underscore, sempre convertire in trattini per match con endpoint server. Verificare tutti i casi edge (brand con underscore) prima di considerare completato."**

---

### 32. **ERRORE WEBSOCKET HMR - URL Malformato (localhost:undefined)**

#### 🔍 **Sintomi:**
- Errore console: `WebSocket connection to 'ws://localhost:undefined/?token=...' failed`
- Errore: `The URL 'ws://localhost:undefined/?token=...' is invalid`
- HMR (Hot Module Replacement) non funziona correttamente
- Sviluppo rallentato per mancanza di hot reload

#### 🧠 **Strategia di Debug Applicata:**
1. **Identificazione Configurazione** - Vite HMR non aveva configurazione esplicita di port
2. **Analisi vite.config.ts** - Verificato che mancavano `host` e `clientPort` espliciti
3. **Configurazione Esplicita** - Aggiunto port, host e clientPort espliciti alla configurazione HMR

#### ✅ **Soluzione Implementata:**
```typescript
// ❌ ERRORE: Configurazione HMR mancante o incompleta
export default defineConfig({
  server: {
    port: 3000,
    // HMR non configurato esplicitamente
  }
});

// ✅ CORRETTO: Configurazione HMR esplicita
export default defineConfig({
  server: {
    port: 3000,
    host: "localhost",
    hmr: {
      port: 3000,
      host: "localhost",
      clientPort: 3000, // Importante per WebSocket
    }
  }
});
```

#### 📚 **Lezione Appresa:**
> **"Sempre configurare esplicitamente HMR in vite.config.ts con host, port e clientPort per evitare URL malformati. Il clientPort è critico per WebSocket connection."**

---

### 33. **ERRORE REACT RENDERING - "Maximum update depth exceeded" in Componenti con Filtri**

#### 🔍 **Sintomi:**
- Warning React: `Maximum update depth exceeded`
- Componente si re-renderizza infinitamente
- Loop causato da `useState` in `useEffect` senza dipendenze corrette
- Performance degradata, browser può diventare non responsivo

#### 🧠 **Strategia di Debug Applicata:**
1. **Identificazione Loop** - Analizzato stack trace per trovare componente responsabile
2. **Analisi State Management** - Trovato `useState` aggiornato in `useEffect` che causava re-render
3. **Sostituzione con useMemo** - Convertito `filteredClients` da state a `useMemo` per evitare aggiornamenti ciclici
4. **Rimozione useEffect Duplicato** - Eliminato `useEffect` non necessario che causava loop

#### ✅ **Soluzione Implementata:**
```typescript
// ❌ ERRORE: useState + useEffect causano loop infinito
const [filteredClients, setFilteredClients] = useState([]);

useEffect(() => {
  const filtered = clients.filter(/* ... */);
  setFilteredClients(filtered); // Causa re-render → loop
}, [clients, searchTerm]);

// ✅ CORRETTO: useMemo invece di useState
const filteredClients = useMemo(() => {
  return clients.filter(/* ... */);
}, [clients, searchTerm]);
// Nessun setState, nessun loop
```

#### 📚 **Lezione Appresa:**
> **"Quando si filtra/trasforma dati derivati, usare `useMemo` invece di `useState` + `useEffect`. Evita loop infiniti e migliora performance. Rimuovere sempre `useEffect` duplicati o non necessari."**

---

### 34. **ERRORE PERFORMANCE - Input Fields Lenti e Caratteri Mancanti**

#### 🔍 **Sintomi:**
- Input fields rispondono molto lentamente
- Se si digita velocemente, solo la prima lettera viene registrata
- Chiamate API eccessive ad ogni keystroke
- UX pessima, impossibile digitare normalmente

#### 🧠 **Strategia di Debug Applicata:**
1. **Identificazione Bottleneck** - Ogni `onChange` triggerava chiamata API immediata
2. **Implementazione Local State** - Stato locale per input, aggiornamento immediato UI
3. **Debouncing API Calls** - Chiamate API solo su `onBlur` invece che su ogni `onChange`
4. **Sincronizzazione State** - Aggiornamento state locale e server separati

#### ✅ **Soluzione Implementata:**
```typescript
// ❌ ERRORE: API call ad ogni keystroke
const [reservedBy, setReservedBy] = useState(product.reservedBy);

<Input
  value={reservedBy}
  onChange={(e) => {
    setReservedBy(e.target.value);
    updateProduct({ reservedBy: e.target.value }); // Troppo frequente!
  }}
/>

// ✅ CORRETTO: Local state + API solo su blur
const [localReservedBy, setLocalReservedBy] = useState(product.reservedBy);

<Input
  value={localReservedBy}
  onChange={(e) => {
    setLocalReservedBy(e.target.value); // Aggiornamento immediato UI
  }}
  onBlur={() => {
    if (localReservedBy !== product.reservedBy) {
      updateProduct({ reservedBy: localReservedBy }); // API solo quando necessario
    }
  }}
/>
```

#### 📚 **Lezione Appresa:**
> **"Per input fields che richiedono chiamate API, usare sempre local state per UI immediata e chiamate API solo su `onBlur` o con debounce. Evita chiamate eccessive e migliora drasticamente UX."**

---

### 35. **VERIFICA MIGRAZIONI GIÀ ESEGUITE - Evitare Esecuzioni Duplicate**

#### 🔍 **Sintomi:**
- Non si sa se una migration è già stata eseguita
- Tentativo di eseguire migration già applicata
- Confusione su stato database vs codice
- Rischio di errori o duplicazioni

#### 🧠 **Strategia di Debug Applicata:**
1. **Script di Verifica** - Creare script dedicato per verificare stato migrazioni
2. **Controllo Struttura Database** - Verificare presenza colonne/tabelle tramite `information_schema`
3. **Verifica Indici** - Controllare che indici siano presenti
4. **Report Completo** - Output chiaro che indica cosa è presente e cosa manca

#### ✅ **Soluzione Implementata:**
```javascript
// ✅ Script di verifica migrazioni
async function checkMigrations() {
  const sql = neon(process.env.DATABASE_URL);
  
  // Verifica colonne warehouse_stock
  const tables = ['biyu_products', 'ctech_products', /* ... */];
  for (const tableName of tables) {
    const columns = await sql`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_name = ${tableName} 
      AND column_name = 'warehouse_stock'
    `;
    
    if (columns.length > 0) {
      console.log(`✅ ${tableName}: warehouse_stock presente`);
    } else {
      console.log(`❌ ${tableName}: warehouse_stock MANCANTE`);
    }
  }
  
  // Verifica tabella warehouse_stock_history
  const historyTable = await sql`
    SELECT EXISTS (
      SELECT FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'warehouse_stock_history'
    )
  `;
  
  if (historyTable[0].exists) {
    console.log('✅ Tabella warehouse_stock_history presente');
  } else {
    console.log('❌ Tabella warehouse_stock_history MANCANTE');
  }
}
```

#### 📚 **Lezione Appresa:**
> **"Sempre creare script di verifica per controllare stato migrazioni prima di eseguirle. Usare `information_schema` per verificare struttura database. Evita esecuzioni duplicate e fornisce feedback chiaro sullo stato."**

---

## 🛠️ **STRATEGIE GENERALI DI DEBUG AGGIORNATE**

### **1. GESTIONE SCHEMA/MIGRATION MISMATCH**
```typescript
// Pattern per aggiungere campo NOT NULL prima della migration
// STEP 1: Schema temporaneo nullable o commentato
export const table = pgTable("table", {
  // newField: integer("new_field"), // Temporaneamente commentato
});

// STEP 2: Codice commentato
// const value = await calculateValue();
// insertValues.newField = value;

// STEP 3: Esegui migration
// node scripts/run-migration.js

// STEP 4: Attiva schema e codice
export const table = pgTable("table", {
  newField: integer("new_field").notNull(), // Attivato
});
// const value = await calculateValue(); // Decommentato
```

### **2. ISOLAMENTO COMPONENTI**
```typescript
// Pattern per isolamento completo
// 1. Identifica componenti da separare
// 2. Estrai utility condivise in lib/
// 3. Crea file separato per ogni componente
// 4. Aggiorna tutti gli import
// 5. Verifica che non ci siano condivisioni oltre le utility
```

### **3. MIGRATION CON VERIFICA**
```javascript
// Pattern per migration sicure con verifica
async function runMigrationSafe() {
  // 1. Esegui comandi sequenzialmente (dividi per statement-breakpoint)
  // 2. Gestisci errori idempotenti (already exists, duplicate)
  // 3. Verifica struttura post-migration (information_schema)
  // 4. Verifica dati popolati (COUNT con/senza valore)
  // 5. Logging dettagliato per ogni step
}
```

---

## 🎯 **CHECKLIST DEBUG AGGIORNATA**

### **Per Schema/Migration Mismatch:**
- [ ] Rendere campo temporaneamente nullable o commentato nello schema
- [ ] Commentare codice che usa il campo
- [ ] Eseguire migration
- [ ] Verificare struttura database (information_schema.columns)
- [ ] Decommentare campo e codice
- [ ] Verificare TypeScript (`npx tsc --noEmit`)

### **Per Isolamento Componenti:**
- [ ] Identificare componenti da separare
- [ ] Estrarre utility condivise in file separato (`lib/` o `utils/`)
- [ ] Creare file dedicato per ogni componente
- [ ] Aggiornare tutti gli import nelle pagine
- [ ] Verificare che non ci siano condivisioni indesiderate (grep)

### **Per Migration Sicure:**
- [ ] Dividere comandi SQL sequenzialmente (split per `--> statement-breakpoint`)
- [ ] Gestire errori idempotenti (already exists, duplicate)
- [ ] Verificare struttura post-migration (information_schema.columns)
- [ ] Verificare dati popolati (COUNT con/senza valore)
- [ ] Logging dettagliato per ogni step

### **Per Path API Dinamici:**
- [ ] Verificare conversione underscore → trattino per brand con underscore
- [ ] Testare tutti i brand (con e senza underscore)
- [ ] Verificare che path generati matchino endpoint server
- [ ] Controllare errori JSON parsing (spesso indicano path errati)

### **Per Performance Input Fields:**
- [ ] Usare local state per aggiornamento UI immediato
- [ ] Chiamate API solo su `onBlur` o con debounce
- [ ] Evitare chiamate API ad ogni `onChange`
- [ ] Sincronizzare state locale e server separatamente

### **Per React Rendering Loop:**
- [ ] Usare `useMemo` per dati derivati invece di `useState` + `useEffect`
- [ ] Verificare dipendenze `useEffect` per evitare loop
- [ ] Rimuovere `useEffect` duplicati o non necessari
- [ ] Analizzare stack trace per identificare componente responsabile

### **Per WebSocket HMR:**
- [ ] Configurare esplicitamente `host`, `port` e `clientPort` in vite.config.ts
- [ ] Verificare che `clientPort` corrisponda a `port` server
- [ ] Testare connessione WebSocket dopo configurazione

### **Per Verifica Migrazioni:**
- [ ] Creare script di verifica prima di eseguire migrazioni
- [ ] Usare `information_schema` per controllare struttura database
- [ ] Verificare colonne, tabelle e indici
- [ ] Fornire report chiaro su cosa è presente e cosa manca

---
