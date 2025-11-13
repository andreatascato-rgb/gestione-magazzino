# 🛠️ SCRIPT DI DEBUG RIUTILIZZABILI

## 📅 Data: 20 Gennaio 2025
## 🎯 Progetto: ESTETICSUN - Script per Debug Database e Server

---

## 📋 **INDICE RAPIDO**

### **🔧 Database & Migration**
- [Script 1: Verifica Struttura Database](#script-1-verifica-struttura-database)
- [Script 2: Migration Sicure](#script-2-migration-sicure)
- [Script 3: Gestione Tipi Database](#script-3-gestione-tipi-database)
- [Script 4: Debug Database Constraints](#script-4-debug-database-constraints)

### **🌐 API & Endpoint**
- [Script 5: Test Endpoint API](#script-5-test-endpoint-api)
- [Script 6: Debug Endpoint Filtri](#script-6-debug-endpoint-filtri)
- [Script 7: Verifica Endpoint Duplicati](#script-7-verifica-endpoint-duplicati)

### **⚛️ React & Frontend**
- [Script 8: Debug React Rendering Loop](#script-8-debug-react-rendering-loop)
- [Script 9: Debug Componenti Controllati](#script-9-debug-componenti-controllati)
- [Script 10: Debug Rendering Sicuro](#script-10-debug-rendering-sicuro)
- [Script 11: Debug Form Callback Completi](#script-11-debug-form-callback-completi)

### **🔌 WebSocket & Connessioni**
- [Script 12: Debug WebSocket Connection](#script-12-debug-websocket-connection)

### **📊 Performance & Analisi**
- [Script 13: Analisi Performance](#script-13-analisi-performance)
- [Script 14: Debug Checklist Automatica](#script-14-debug-checklist-automatica)

### **🎯 TypeScript & Validazione**
- [Script 15: Debug TypeScript Errors](#script-15-debug-typescript-errors)
- [Script 16: Test Validazione Zod](#script-16-test-validazione-zod)
- [Script 17: Debug Type Mismatches](#script-17-debug-type-mismatches)

### **💰 Sistema Prezzi Speciali**
- [Script 18: Debug Prezzi Speciali Flusso](#script-18-debug-prezzi-speciali-flusso)
- [Script 19: Test Completo Sistema Prezzi](#script-19-test-completo-sistema-prezzi)

### **📄 PDF & Navigazione**
- [Script 20: Debug PDF Generation](#script-20-debug-pdf-generation)
- [Script 21: Debug Navigazione Complessa](#script-21-debug-navigazione-complessa)

### **🗑️ Eliminazione & Cestino**
- [Script 22: Debug Eliminazione Cascade](#script-22-debug-eliminazione-cascade)

### **🏗️ Architettura & Componenti**
- [Script 28: Verifica Isolamento Componenti](#script-28-verifica-isolamento-componenti)
- [Script 29: Migration Sicura con Verifica Post-Esecuzione](#script-29-migration-sicura-con-verifica-post-esecuzione)
- [Script 30: Analisi Condivisione Codice tra Componenti](#script-30-analisi-condivisione-codice-tra-componenti)

---

## 🔧 **SCRIPT DATABASE & MIGRATION**

### **Script 1: Verifica Struttura Database**
```javascript
#!/usr/bin/env node
// File: scripts/check-table-structure.js

import { neon } from '@neondatabase/serverless';
import { config } from 'dotenv';

config();

async function checkTableStructure(tableName) {
  if (!process.env.DATABASE_URL) {
    console.error('❌ DATABASE_URL must be set');
    process.exit(1);
  }

  const sql = neon(process.env.DATABASE_URL);
  
  try {
    console.log(`🔍 Checking ${tableName} table structure...`);
    
    const columns = await sql`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = ${tableName}
      ORDER BY ordinal_position;
    `;
    
    console.log(`📋 Columns in ${tableName}:`);
    columns.forEach(col => {
      console.log(`  - ${col.column_name} (${col.data_type}) ${col.is_nullable === 'NO' ? 'NOT NULL' : 'NULL'}`);
    });
    
    return columns;
    
  } catch (error) {
    console.error('❌ Error checking table structure:', error);
    process.exit(1);
  }
}

const tableName = process.argv[2] || 'biyu_quotes';
checkTableStructure(tableName);
```

### **Script 2: Migration Sicure**
```javascript
#!/usr/bin/env node
// File: scripts/run-migrations-safe.js

import { neon } from '@neondatabase/serverless';
import { config } from 'dotenv';
import { readFileSync } from 'fs';

config();

async function runMigrationsSafe() {
  if (!process.env.DATABASE_URL) {
    console.error('❌ DATABASE_URL must be set');
    process.exit(1);
  }

  const sql = neon(process.env.DATABASE_URL);
  
  try {
    console.log('🚀 Eseguendo migration sicure...');
    
    // Migration 1: Crea tabella user_form_defaults
    const migration1 = readFileSync('db/migrations/create_user_form_defaults_table.sql', 'utf8');
    const commands1 = migration1.split(';').filter(cmd => cmd.trim());
    
    for (const command of commands1) {
      if (command.trim()) {
        await sql(command.trim());
      }
    }
    console.log('✅ Tabella user_form_defaults creata');
    
    console.log('🎉 Tutte le migration eseguite con successo!');
    
  } catch (error) {
    console.error('❌ Errore durante l\'esecuzione delle migration:', error);
    process.exit(1);
  }
}

runMigrationsSafe();
```

### **Script 3: Gestione Tipi Database**
```javascript
#!/usr/bin/env node
// File: scripts/fix-database-types.js

import { neon } from '@neondatabase/serverless';
import { config } from 'dotenv';

config();

async function fixDatabaseTypes() {
  if (!process.env.DATABASE_URL) {
    console.error('❌ DATABASE_URL must be set');
    process.exit(1);
  }

  const sql = neon(process.env.DATABASE_URL);
  
  try {
    console.log('🔧 Gestione tipi database...');
    
    // Verifica campi nullable
    const nullableFields = [
      'segnalazioni.citta',
      'segnalazioni.regione',
      'segnalazioni.has_solarium',
      'segnalazioni.has_laser'
    ];
    
    for (const field of nullableFields) {
      const [table, column] = field.split('.');
      const result = await sql`
        SELECT is_nullable 
        FROM information_schema.columns 
        WHERE table_name = ${table} AND column_name = ${column}
      `;
      
      if (result.length > 0) {
        const isNullable = result[0].is_nullable === 'YES';
        console.log(`📋 ${field}: ${isNullable ? 'NULLABLE' : 'NOT NULL'}`);
      }
    }
    
    console.log('✅ Gestione tipi completata');
    
  } catch (error) {
    console.error('❌ Errore durante gestione tipi:', error);
    process.exit(1);
  }
}

fixDatabaseTypes();
```

### **Script 4: Debug Database Constraints**
```javascript
#!/usr/bin/env node
// File: scripts/debug-database-constraints.js

console.log("🔍 DEBUG DATABASE CONSTRAINTS");
console.log("=============================");

// Pattern per rispettare constraint del database
const debugConstraintPattern = `
// ❌ ERRORE: Non rispetta constraint del database
const submitData = {
  targetBrand: data.targetBrand,
  targetProductId: data.targetProductId,
};

// ✅ CORRETTO: Logica condizionale per rispettare i constraint
const submitData = {
  clientId: selectedClient.id,
  priceType: data.priceType,
  targetType: data.targetType,
  // Rispetta il constraint: se PRODUCT, solo targetProductId; se BRAND, solo targetBrand
  targetBrand: data.targetType === 'BRAND' ? data.targetBrand : undefined,
  targetProductId: data.targetType === 'PRODUCT' ? data.targetProductId : undefined,
  fixedPrice: data.fixedPrice && data.fixedPrice !== "" ? data.fixedPrice : undefined,
  discountPercentage: data.discountPercentage && data.discountPercentage !== "" ? data.discountPercentage : undefined,
  notes: data.notes,
  isActive: data.isActive,
};
`;

console.log("📋 Pattern per rispettare constraint del database:");
console.log(debugConstraintPattern);

// Test per verificare constraint
const testConstraintCompliance = (data) => {
  const isBrandType = data.targetType === 'BRAND';
  const isProductType = data.targetType === 'PRODUCT';
  
  const hasBrandWhenBrand = isBrandType ? data.targetBrand : !data.targetBrand;
  const hasProductWhenProduct = isProductType ? data.targetProductId : !data.targetProductId;
  
  console.log("✅ Constraint BRAND rispettato:", hasBrandWhenBrand);
  console.log("✅ Constraint PRODUCT rispettato:", hasProductWhenProduct);
  
  return hasBrandWhenBrand && hasProductWhenProduct;
};

console.log("🧪 Test constraint compliance:", testConstraintCompliance);
```

---

## 🌐 **SCRIPT API & ENDPOINT**

### **Script 5: Test Endpoint API**
```javascript
#!/usr/bin/env node
// File: scripts/test-api-endpoints.js

import { config } from 'dotenv';

config();

async function testEndpoint(url, method = 'GET', data = null) {
  try {
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
      }
    };
    
    if (data) {
      options.body = JSON.stringify(data);
    }
    
    const response = await fetch(url, options);
    
    console.log(`🌐 ${method} ${url}`);
    console.log(`📊 Status: ${response.status} ${response.statusText}`);
    
    if (response.ok) {
      const result = await response.json();
      console.log(`✅ Response length: ${JSON.stringify(result).length} chars`);
    } else {
      const error = await response.text();
      console.log(`❌ Error: ${error}`);
    }
    
  } catch (error) {
    console.log(`❌ Network Error: ${error.message}`);
  }
}

// Test endpoint comuni
async function runTests() {
  const baseUrl = 'http://localhost:3000';
  
  console.log('🧪 Testing API endpoints...\n');
  
  // Test endpoint pubblici
  await testEndpoint(`${baseUrl}/api/health`);
  await testEndpoint(`${baseUrl}/api/app-settings/app_version`);
  
  // Test endpoint protetti (dovrebbero dare 401)
  await testEndpoint(`${baseUrl}/api/biyu-quotes`);
  await testEndpoint(`${baseUrl}/api/clients`);
  
  console.log('\n✅ API tests completed!');
}

runTests();
```

### **Script 6: Debug Endpoint Filtri**
```javascript
#!/usr/bin/env node
// File: scripts/debug-endpoint-filters.js

import { config } from 'dotenv';

config();

async function debugEndpointFilters() {
  const baseUrl = 'http://localhost:3000';
  
  console.log('🔍 Debugging endpoint filters...\n');
  
  const endpoints = [
    {
      name: 'BIYU Quotes List',
      url: '/api/biyu-quotes',
      expectedFields: ['id', 'quoteNumber', 'clientName', 'clientEmail', 'clientPhone', 'isNewClient', 'clientCodeUpdated']
    },
    {
      name: 'BIYU Quote Specific',
      url: '/api/biyu-quotes/1',
      expectedFields: ['id', 'quoteNumber', 'clientName', 'clientEmail', 'clientPhone', 'signatureData', 'signatureDate', 'signedByName']
    },
    {
      name: 'Clients List',
      url: '/api/clients',
      expectedFields: ['id', 'clientCode', 'clientName', 'email', 'phone', 'citta', 'regione', 'provincia']
    }
  ];
  
  for (const endpoint of endpoints) {
    console.log(`📋 Testing: ${endpoint.name}`);
    console.log(`🌐 URL: ${baseUrl}${endpoint.url}`);
    
    try {
      const response = await fetch(`${baseUrl}${endpoint.url}`);
      
      if (response.ok) {
        const data = await response.json();
        const sampleData = Array.isArray(data) ? data[0] : data;
        
        if (sampleData) {
          const actualFields = Object.keys(sampleData);
          const missingFields = endpoint.expectedFields.filter(field => !actualFields.includes(field));
          const extraFields = actualFields.filter(field => !endpoint.expectedFields.includes(field));
          
          console.log(`✅ Status: ${response.status}`);
          console.log(`📊 Campi presenti: ${actualFields.length}`);
          console.log(`📋 Campi attesi: ${endpoint.expectedFields.join(', ')}`);
          console.log(`📋 Campi effettivi: ${actualFields.join(', ')}`);
          
          if (missingFields.length > 0) {
            console.log(`❌ Campi mancanti: ${missingFields.join(', ')}`);
          }
          
          if (extraFields.length > 0) {
            console.log(`➕ Campi extra: ${extraFields.join(', ')}`);
          }
        }
      } else {
        console.log(`❌ Status: ${response.status} ${response.statusText}`);
      }
      
    } catch (error) {
      console.log(`❌ Error: ${error.message}`);
    }
    
    console.log('');
  }
  
  console.log('🎯 Debug endpoint filters completato!');
}

debugEndpointFilters();
```

### **Script 7: Verifica Endpoint Duplicati**
```javascript
#!/usr/bin/env node
// File: scripts/debug-duplicate-endpoints.js

import { readFileSync } from 'fs';
import { join } from 'path';

function debugDuplicateEndpoints() {
  console.log('🔍 Debugging duplicate endpoints...\n');
  
  try {
    const routesPath = join(process.cwd(), 'server', 'routes.ts');
    const routesContent = readFileSync(routesPath, 'utf8');
    
    const endpointPattern = /app\.(get|post|put|delete)\s*\(\s*["']([^"']+)["']/g;
    const endpoints = [];
    let match;
    
    while ((match = endpointPattern.exec(routesContent)) !== null) {
      endpoints.push({
        method: match[1],
        path: match[2],
        line: routesContent.substring(0, match.index).split('\n').length
      });
    }
    
    console.log(`📊 Endpoint trovati: ${endpoints.length}`);
    
    // Raggruppa per path
    const groupedEndpoints = {};
    endpoints.forEach(endpoint => {
      const key = `${endpoint.method}:${endpoint.path}`;
      if (!groupedEndpoints[key]) {
        groupedEndpoints[key] = [];
      }
      groupedEndpoints[key].push(endpoint);
    });
    
    // Trova duplicati
    const duplicates = Object.entries(groupedEndpoints).filter(([key, endpoints]) => endpoints.length > 1);
    
    if (duplicates.length > 0) {
      console.log(`❌ Endpoint duplicati trovati: ${duplicates.length}`);
      
      duplicates.forEach(([key, endpoints]) => {
        console.log(`\n📋 ${key}:`);
        endpoints.forEach((endpoint, index) => {
          console.log(`  ${index + 1}. Riga ${endpoint.line}`);
        });
      });
      
      console.log(`\n⚠️  Attenzione: Gli endpoint duplicati possono causare comportamenti inaspettati!`);
      
    } else {
      console.log(`✅ Nessun endpoint duplicato trovato`);
    }
    
  } catch (error) {
    console.error(`❌ Errore durante analisi endpoint: ${error.message}`);
  }
  
  console.log('\n🎯 Debug duplicate endpoints completato!');
}

debugDuplicateEndpoints();
```

---

## ⚛️ **SCRIPT REACT & FRONTEND**

### **Script 8: Debug React Rendering Loop**
```javascript
#!/usr/bin/env node
// File: scripts/debug-react-rendering-loop.js

console.log("🔍 DEBUG REACT RENDERING LOOP INFINITI");
console.log("=====================================");

// Pattern per evitare re-render infiniti
const debugRenderingPattern = `
// ❌ ERRORE: Array non memoizzato causa re-render infiniti
useEffect(() => {
  const filtered = data.filter(item => condition);
  setFilteredData(filtered);
}, [data, filter]);

// ✅ CORRETTO: Memoizzazione completa degli array
const stableData = useMemo(() => data, [data]);
const filteredDataMemo = useMemo(() => {
  if (!filter) return stableData.slice(0, 10);
  return stableData.filter(item => condition).slice(0, 10);
}, [stableData, filter]);

useEffect(() => {
  setFilteredData(prev => {
    const newFiltered = filteredDataMemo;
    if (JSON.stringify(newFiltered) !== JSON.stringify(prev)) {
      return newFiltered;
    }
    return prev;
  });
}, [filteredDataMemo]);
`;

console.log("📋 Pattern per evitare re-render infiniti:");
console.log(debugRenderingPattern);

// Test per verificare stabilità array
const testArrayStability = (data) => {
  const stableData = useMemo(() => data, [data]);
  const filteredData = useMemo(() => {
    return stableData.filter(item => item.active);
  }, [stableData]);
  
  console.log("✅ Array memoizzato correttamente");
  return filteredData;
};

console.log("🧪 Test array stability:", testArrayStability);
```

### **Script 9: Debug Componenti Controllati**
```javascript
#!/usr/bin/env node
// File: scripts/debug-controlled-components.js

console.log("🔍 DEBUG COMPONENTI CONTROLLATI");
console.log("===============================");

// Pattern per componenti Select sicuri
const debugControlledPattern = `
// ❌ ERRORE: Inconsistenza tra null e undefined
defaultValues: {
  targetProductId: null,
},
value={field.value} // Può essere null o undefined

// ✅ CORRETTO: Gestione consistente di null/undefined
const schema = z.object({
  targetProductId: z.number().optional().nullable(),
});

defaultValues: {
  targetProductId: undefined,
},

// ✅ CORRETTO: Gestione esplicita per Select component
<Select
  value={field.value || ""} // Conversione esplicita
  onValueChange={(value) => field.onChange(value || undefined)}
>
`;

console.log("📋 Pattern per componenti Select sicuri:");
console.log(debugControlledPattern);

// Test per verificare gestione valori
const testValueHandling = (value) => {
  const safeValue = value || "";
  const safeOnChange = (newValue) => newValue || undefined;
  
  console.log(`✅ Valore originale: ${value}`);
  console.log(`✅ Valore sicuro: ${safeValue}`);
  console.log(`✅ onChange sicuro: ${safeOnChange}`);
  
  return { safeValue, safeOnChange };
};

console.log("🧪 Test gestione valori:");
console.log("Test 1:", testValueHandling(null));
console.log("Test 2:", testValueHandling(undefined));
console.log("Test 3:", testValueHandling("123"));
```

### **Script 10: Debug Rendering Sicuro**
```javascript
#!/usr/bin/env node
// File: scripts/debug-safe-rendering.js

console.log("🔍 DEBUG RENDERING SICURO");
console.log("=========================");

// Pattern per rendering sicuro
const debugSafeRenderingPattern = `
// ❌ ERRORE: Rendering non protetto
{data.map((item: any) => (
  <div key={item.id}>...</div>
))}

// ✅ CORRETTO: Rendering sicuro con controlli
const safeData = useMemo(() => {
  if (!data || !Array.isArray(data)) return [];
  return data.filter(item => item && item.id);
}, [data]);

{safeData.length > 0 ? safeData.map(item => (
  <div key={item.id}>...</div>
)) : (
  <div>Nessun elemento disponibile</div>
)}
`;

console.log("📋 Pattern per rendering sicuro:");
console.log(debugSafeRenderingPattern);

// Test per verificare rendering sicuro
const testSafeRendering = (data) => {
  if (!data || !Array.isArray(data)) {
    console.log("✅ Data non valida, restituisco array vuoto");
    return [];
  }
  
  const filteredData = data.filter(item => item && item.id);
  console.log(`✅ Data filtrata: ${filteredData.length} elementi validi`);
  
  return filteredData;
};

console.log("🧪 Test rendering sicuro:");
console.log("Test 1:", testSafeRendering(null));
console.log("Test 2:", testSafeRendering(undefined));
console.log("Test 3:", testSafeRendering([]));
console.log("Test 4:", testSafeRendering([{ id: 1 }, null, { id: 2 }]));
```

### **Script 11: Debug Form Callback Completi**
```javascript
#!/usr/bin/env node
// File: scripts/debug-form-callbacks.js

console.log("🔍 DEBUG FORM CALLBACK COMPLETI");
console.log("===============================");

// Pattern per callback onSuccess completi
const debugCallbackPattern = `
// ❌ ERRORE: Nessun callback onSuccess
const mutation = useMutation({
  mutationFn: saveData,
  onError: (error) => {
    toast({ title: "Errore", description: error.message, variant: "destructive" });
  }
});

// ✅ CORRETTO: Callback onSuccess completo
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
  },
  onError: (error) => {
    toast({ title: "Errore", description: error.message, variant: "destructive" });
  }
});
`;

console.log("📋 Pattern per callback onSuccess completi:");
console.log(debugCallbackPattern);

// Test per verificare callback completi
const testCallbackCompleteness = (mutation) => {
  const hasOnSuccess = mutation.onSuccess !== undefined;
  const hasOnError = mutation.onError !== undefined;
  const hasFormReset = mutation.onSuccess && mutation.onSuccess.toString().includes('form.reset');
  const hasStateReset = mutation.onSuccess && mutation.onSuccess.toString().includes('setEditingItem');
  
  console.log("✅ Callback onSuccess presente:", hasOnSuccess);
  console.log("✅ Callback onError presente:", hasOnError);
  console.log("✅ Form reset presente:", hasFormReset);
  console.log("✅ State reset presente:", hasStateReset);
  
  return hasOnSuccess && hasOnError && hasFormReset && hasStateReset;
};

console.log("🧪 Test callback completeness:", testCallbackCompleteness);
```

---

## 🔌 **SCRIPT WEBSOCKET & CONNESSIONI**

### **Script 12: Debug WebSocket Connection**
```javascript
#!/usr/bin/env node
// File: scripts/debug-websocket-url.js

console.log("🔍 DEBUG WEBSOCKET CONNECTION URL");
console.log("=================================");

// Pattern per URL WebSocket robusti
const debugWebSocketPattern = `
// ❌ ERRORE: URL malformato con porta undefined
const wsUrl = \`ws://localhost:\${window.location.port}/ws\`;

// ✅ CORRETTO: Gestione robusta di tutti i casi
const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
const host = window.location.hostname || "localhost";
const port = window.location.port || (protocol === "wss:" ? "443" : "3000");
const wsUrl = \`\${protocol}//\${host}:\${port}/ws\`;
`;

console.log("📋 Pattern per URL WebSocket robusti:");
console.log(debugWebSocketPattern);

// Test per verificare URL WebSocket
const testWebSocketUrl = () => {
  const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
  const host = window.location.hostname || "localhost";
  const port = window.location.port || (protocol === "wss:" ? "443" : "3000");
  const wsUrl = `${protocol}//${host}:${port}/ws`;
  
  console.log("🔗 URL WebSocket generato:", wsUrl);
  console.log("✅ URL WebSocket valido");
  return wsUrl;
};

console.log("🧪 Test WebSocket URL:", testWebSocketUrl);
```

---

## 📊 **SCRIPT PERFORMANCE & ANALISI**

### **Script 13: Analisi Performance**
```javascript
#!/usr/bin/env node
// File: scripts/analyze-performance.js

import { neon } from '@neondatabase/serverless';
import { config } from 'dotenv';

config();

async function analyzePerformance() {
  if (!process.env.DATABASE_URL) {
    console.error('❌ DATABASE_URL must be set');
    process.exit(1);
  }

  const sql = neon(process.env.DATABASE_URL);
  
  try {
    console.log('📊 Analyzing database performance...\n');
    
    // Conta record per tabella
    const tables = ['biyu_quotes', 'biyu_quote_items', 'clients', 'biyu_products'];
    
    for (const table of tables) {
      const result = await sql`SELECT COUNT(*) as count FROM ${sql(table)}`;
      console.log(`📋 ${table}: ${result[0].count} records`);
    }
    
    // Verifica indici
    console.log('\n🔍 Checking indexes...');
    const indexes = await sql`
      SELECT 
        schemaname,
        tablename,
        indexname,
        indexdef
      FROM pg_indexes 
      WHERE schemaname = 'public'
      ORDER BY tablename, indexname;
    `;
    
    indexes.forEach(idx => {
      console.log(`📌 ${idx.tablename}.${idx.indexname}`);
    });
    
    console.log('\n✅ Performance analysis completed!');
    
  } catch (error) {
    console.error('❌ Error analyzing performance:', error);
    process.exit(1);
  }
}

analyzePerformance();
```

### **Script 14: Debug Checklist Automatica**
```javascript
#!/usr/bin/env node
// File: scripts/debug-checklist.js

import { neon } from '@neondatabase/serverless';
import { config } from 'dotenv';

config();

async function runDebugChecklist() {
  if (!process.env.DATABASE_URL) {
    console.error('❌ DATABASE_URL must be set');
    process.exit(1);
  }

  const sql = neon(process.env.DATABASE_URL);
  
  console.log('🎯 Running Debug Checklist...\n');
  
  const checks = [
    {
      name: 'Database Connection',
      test: async () => {
        await sql`SELECT 1 as test`;
        return true;
      }
    },
    {
      name: 'BIYU Quotes Table',
      test: async () => {
        const result = await sql`SELECT COUNT(*) FROM biyu_quotes`;
        return result[0].count >= 0;
      }
    },
    {
      name: 'BIYU Quote Items Table',
      test: async () => {
        const result = await sql`SELECT COUNT(*) FROM biyu_quote_items`;
        return result[0].count >= 0;
      }
    },
    {
      name: 'Signature Columns Exist',
      test: async () => {
        const columns = await sql`
          SELECT column_name 
          FROM information_schema.columns 
          WHERE table_name = 'biyu_quotes' 
          AND column_name IN ('signature_data', 'signature_date', 'signed_by_name')
        `;
        return columns.length === 3;
      }
    },
    {
      name: 'Multi-Brand Columns Exist',
      test: async () => {
        const columns = await sql`
          SELECT column_name 
          FROM information_schema.columns 
          WHERE table_name = 'biyu_quote_items' 
          AND column_name IN ('product_brand', 'product_code', 'product_name', 'product_packaging')
        `;
        return columns.length === 4;
      }
    }
  ];
  
  for (const check of checks) {
    try {
      const result = await check.test();
      console.log(`${result ? '✅' : '❌'} ${check.name}`);
    } catch (error) {
      console.log(`❌ ${check.name} - Error: ${error.message}`);
    }
  }
  
  console.log('\n🎯 Debug checklist completed!');
}

runDebugChecklist();
```

---

## 🎯 **SCRIPT TYPESCRIPT & VALIDAZIONE**

### **Script 15: Debug TypeScript Errors**
```javascript
#!/usr/bin/env node
// File: scripts/check-typescript-errors.js

import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

async function checkTypeScriptErrors() {
  try {
    console.log('🔍 Verificando errori TypeScript...');
    
    const { stdout, stderr } = await execAsync('npx tsc --noEmit');
    
    if (stderr) {
      console.log('❌ Errori TypeScript trovati:');
      console.log(stderr);
      
      // Analizza errori comuni
      const commonErrors = [
        'boolean | null | undefined',
        'missing the following properties',
        'Argument of type',
        'is not assignable to parameter'
      ];
      
      commonErrors.forEach(errorType => {
        if (stderr.includes(errorType)) {
          console.log(`\n🔧 Suggerimento per "${errorType}":`);
          if (errorType.includes('boolean | null')) {
            console.log('   - Converti null in undefined: campo ?? undefined');
          }
          if (errorType.includes('missing properties')) {
            console.log('   - Aggiungi campi mancanti alle query select');
          }
          if (errorType.includes('not assignable')) {
            console.log('   - Verifica compatibilità tipi tra schema e codice');
          }
        }
      });
      
      process.exit(1);
    } else {
      console.log('✅ Nessun errore TypeScript trovato!');
    }
    
  } catch (error) {
    console.error('❌ Errore durante verifica TypeScript:', error.message);
    process.exit(1);
  }
}

checkTypeScriptErrors();
```

### **Script 16: Test Validazione Zod**
```javascript
#!/usr/bin/env node
// File: scripts/test-zod-validation.js

import { z } from 'zod';

// Schema di test per validazione "almeno uno"
const testSchema = z.object({
  campo1: z.string().optional(),
  campo2: z.string().optional(),
  campo3: z.string().optional(),
}).refine((data) => {
  return (data.campo1 && data.campo1.trim() !== "") || 
         (data.campo2 && data.campo2.trim() !== "") || 
         (data.campo3 && data.campo3.trim() !== "");
}, {
  message: "È obbligatorio inserire almeno uno tra Campo1, Campo2 o Campo3",
  path: ["campo1"]
});

function testZodValidation() {
  console.log('🧪 Testando validazione Zod...\n');
  
  const testCases = [
    { name: 'Tutti i campi vuoti', data: { campo1: '', campo2: '', campo3: '' }, shouldFail: true },
    { name: 'Solo campo1 compilato', data: { campo1: 'valore', campo2: '', campo3: '' }, shouldFail: false },
    { name: 'Solo campo2 compilato', data: { campo1: '', campo2: 'valore', campo3: '' }, shouldFail: false },
    { name: 'Solo campo3 compilato', data: { campo1: '', campo2: '', campo3: 'valore' }, shouldFail: false },
    { name: 'Tutti i campi compilati', data: { campo1: 'valore1', campo2: 'valore2', campo3: 'valore3' }, shouldFail: false },
    { name: 'Campi undefined', data: {}, shouldFail: true }
  ];
  
  testCases.forEach(testCase => {
    try {
      const result = testSchema.parse(testCase.data);
      if (testCase.shouldFail) {
        console.log(`❌ ${testCase.name}: Dovrebbe fallire ma è passato`);
      } else {
        console.log(`✅ ${testCase.name}: Validazione corretta`);
      }
    } catch (error) {
      if (testCase.shouldFail) {
        console.log(`✅ ${testCase.name}: Validazione corretta (fallita come previsto)`);
      } else {
        console.log(`❌ ${testCase.name}: Dovrebbe passare ma è fallita - ${error.message}`);
      }
    }
  });
  
  console.log('\n🎯 Test validazione Zod completati!');
}

testZodValidation();
```

### **Script 17: Debug Type Mismatches**
```javascript
#!/usr/bin/env node
// File: scripts/debug-typescript-mismatches.js

console.log("🔍 DEBUG TYPESCRIPT TYPE MISMATCHES");
console.log("===================================");

// Pattern per gestione tipi TypeScript
const debugTypeScriptPattern = `
// ❌ ERRORE: Type mismatch tra form e database
targetProductId: data.targetProductId, // Può essere null ma tipo non lo accetta

// ✅ CORRETTO: Gestione esplicita dei tipi
const schema = z.object({
  targetProductId: z.number().optional().nullable(),
});

// ✅ CORRETTO: Conversione esplicita in submit
targetProductId: data.targetType === 'PRODUCT' ? (data.targetProductId || undefined) : undefined,

// ✅ CORRETTO: Server-side - conversione per Drizzle
fixedPrice: data.fixedPrice && data.fixedPrice !== "" ? 
  (typeof data.fixedPrice === 'string' ? data.fixedPrice : data.fixedPrice.toString()) : null,
`;

console.log("📋 Pattern per gestione tipi TypeScript:");
console.log(debugTypeScriptPattern);

// Test per verificare gestione tipi
const testTypeHandling = (value, expectedType) => {
  if (value === null || value === undefined) {
    console.log(`✅ Valore null/undefined gestito correttamente`);
    return null;
  }
  
  if (expectedType === 'string' && typeof value === 'number') {
    const converted = value.toString();
    console.log(`✅ Conversione numero -> stringa: ${value} -> ${converted}`);
    return converted;
  }
  
  if (expectedType === 'number' && typeof value === 'string') {
    const converted = parseFloat(value);
    console.log(`✅ Conversione stringa -> numero: ${value} -> ${converted}`);
    return converted;
  }
  
  console.log(`✅ Tipo corretto: ${typeof value}`);
  return value;
};

console.log("🧪 Test gestione tipi:");
console.log("Test 1:", testTypeHandling(123, 'string'));
console.log("Test 2:", testTypeHandling("123.45", 'number'));
console.log("Test 3:", testTypeHandling(null, 'string'));
console.log("Test 4:", testTypeHandling(undefined, 'number'));
```

---

## 💰 **SCRIPT SISTEMA PREZZI SPECIALI**

### **Script 18: Debug Prezzi Speciali Flusso**
```javascript
#!/usr/bin/env node
// File: scripts/debug-special-prices-flow.js

console.log("🔍 DEBUG PREZZI SPECIALI FLUSSO COMPLETO");
console.log("=======================================");

// Pattern per flusso prezzi speciali corretto
const debugSpecialPricesPattern = `
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
`;

console.log("📋 Pattern per flusso prezzi speciali corretto:");
console.log(debugSpecialPricesPattern);

// Test per verificare flusso prezzi speciali
const testSpecialPricesFlow = (product, specialPrice) => {
  const originalPrice = parseFloat(product.price);
  const discountPercentage = specialPrice.discountPercentage;
  const fixedPrice = specialPrice.fixedPrice;
  
  let finalPrice;
  if (fixedPrice) {
    finalPrice = parseFloat(fixedPrice);
  } else if (discountPercentage) {
    finalPrice = originalPrice * (1 - parseFloat(discountPercentage) / 100);
  } else {
    finalPrice = originalPrice;
  }
  
  console.log(`✅ Prezzo originale: ${originalPrice}`);
  console.log(`✅ Prezzo speciale: ${finalPrice}`);
  console.log(`✅ Sconto applicato: ${originalPrice - finalPrice}`);
  
  return finalPrice;
};

console.log("🧪 Test flusso prezzi speciali:");
console.log("Test 1:", testSpecialPricesFlow(
  { price: "100.00" }, 
  { discountPercentage: "10" }
));
console.log("Test 2:", testSpecialPricesFlow(
  { price: "100.00" }, 
  { fixedPrice: "80.00" }
));
console.log("Test 3:", testSpecialPricesFlow(
  { price: "100.00" }, 
  { discountPercentage: "99" }
));
```

### **Script 19: Test Completo Sistema Prezzi**
```javascript
#!/usr/bin/env node
// File: scripts/debug-complete-special-prices-system.js

console.log("🔍 DEBUG COMPLETO SISTEMA PREZZI SPECIALI");
console.log("=========================================");

// Test completo del sistema
const testCompleteSpecialPricesSystem = async () => {
  console.log("🧪 Test completo sistema prezzi speciali...");
  
  // 1. Test creazione prezzo speciale
  console.log("1. Test creazione prezzo speciale...");
  const specialPriceData = {
    clientId: 1,
    priceType: "PERCENTAGE",
    targetType: "PRODUCT",
    targetProductId: 123,
    discountPercentage: "10",
    notes: "Test prezzo speciale",
    isActive: true
  };
  
  // 2. Test calcolo prezzo finale
  console.log("2. Test calcolo prezzo finale...");
  const product = { price: "100.00" };
  const finalPrice = testSpecialPricesFlow(product, { discountPercentage: "10" });
  
  // 3. Test salvataggio preventivo
  console.log("3. Test salvataggio preventivo...");
  const quoteData = {
    items: [{
      productId: 123,
      unitPrice: finalPrice.toString(),
      quantity: 1,
      lineTotal: finalPrice
    }]
  };
  
  // 4. Test aggiornamento statistiche
  console.log("4. Test aggiornamento statistiche...");
  const statsData = {
    unitPrice: finalPrice,
    lineTotal: finalPrice,
    clientId: 1,
    productId: 123
  };
  
  console.log("✅ Test completo sistema prezzi speciali completato");
  return {
    specialPriceData,
    finalPrice,
    quoteData,
    statsData
  };
};

console.log("🧪 Test completo sistema:", testCompleteSpecialPricesSystem);
```

---

## 📄 **SCRIPT PDF & NAVIGAZIONE**

### **Script 20: Debug PDF Generation**
```javascript
#!/usr/bin/env node
// File: scripts/debug-pdf-generation.js

import { neon } from '@neondatabase/serverless';
import { config } from 'dotenv';

config();

async function debugPDFGeneration() {
  if (!process.env.DATABASE_URL) {
    console.error('❌ DATABASE_URL must be set');
    process.exit(1);
  }

  const sql = neon(process.env.DATABASE_URL);
  
  try {
    console.log('🔍 Debugging PDF generation...\n');
    
    // Trova preventivi firmati
    console.log('📋 Cercando preventivi firmati...');
    const signedQuotes = await sql`
      SELECT 
        id,
        quote_number,
        client_name,
        client_email,
        client_phone,
        client_region,
        client_piva,
        client_sdi_pec,
        client_iban,
        signature_data,
        signature_date,
        signed_by_name,
        status,
        is_new_client
      FROM biyu_quotes 
      WHERE signature_data IS NOT NULL 
      AND signature_data != ''
      ORDER BY signature_date DESC 
      LIMIT 5
    `;
    
    console.log(`📊 Preventivi firmati trovati: ${signedQuotes.length}`);
    
    signedQuotes.forEach((quote, index) => {
      console.log(`\n📋 Preventivo ${index + 1}: ${quote.quote_number}`);
      console.log(`  - Cliente: ${quote.client_name}`);
      console.log(`  - Email: ${quote.client_email || 'MANCANTE'}`);
      console.log(`  - Telefono: ${quote.client_phone || 'MANCANTE'}`);
      console.log(`  - Regione: ${quote.client_region || 'MANCANTE'}`);
      console.log(`  - P.IVA: ${quote.client_piva || 'MANCANTE'}`);
      console.log(`  - SDI/PEC: ${quote.client_sdi_pec || 'MANCANTE'}`);
      console.log(`  - IBAN: ${quote.client_iban || 'MANCANTE'}`);
      console.log(`  - Status: ${quote.status}`);
      console.log(`  - Is New Client: ${quote.is_new_client}`);
      console.log(`  - Firma presente: ${!!quote.signature_data}`);
      console.log(`  - Lunghezza firma: ${quote.signature_data?.length || 0}`);
      console.log(`  - Data firma: ${quote.signature_date}`);
      console.log(`  - Firmato da: ${quote.signed_by_name}`);
      
      // Verifica se la firma è valida (base64)
      if (quote.signature_data) {
        const isBase64 = /^data:image\/[a-z]+;base64,/.test(quote.signature_data);
        console.log(`  - Firma base64 valida: ${isBase64}`);
        
        if (isBase64) {
          const base64Data = quote.signature_data.split(',')[1];
          console.log(`  - Dati base64: ${base64Data.substring(0, 50)}...`);
        }
      }
    });
    
    console.log('\n🎯 Debug PDF generation completato!');
    
  } catch (error) {
    console.error('❌ Errore durante debug PDF:', error);
    process.exit(1);
  }
}

debugPDFGeneration();
```

### **Script 21: Debug Navigazione Complessa**
```javascript
#!/usr/bin/env node
// File: scripts/debug-navigation-flow.js

import { config } from 'dotenv';

config();

async function debugNavigationFlow() {
  const baseUrl = 'http://localhost:3000';
  
  console.log('🔍 Debugging navigation flow...\n');
  
  // Test 1: Verifica endpoint clienti
  console.log('📋 Test 1: Endpoint clienti');
  try {
    const response = await fetch(`${baseUrl}/api/clients`);
    const data = await response.json();
    console.log(`✅ Clienti disponibili: ${data.length}`);
    
    if (data.length > 0) {
      const firstClient = data[0];
      console.log(`📋 Primo cliente: ${firstClient.clientName} (ID: ${firstClient.id})`);
    }
  } catch (error) {
    console.log(`❌ Errore endpoint clienti: ${error.message}`);
  }
  
  // Test 2: Verifica endpoint preventivi
  console.log('\n📋 Test 2: Endpoint preventivi');
  try {
    const response = await fetch(`${baseUrl}/api/biyu-quotes`);
    const data = await response.json();
    console.log(`✅ Preventivi disponibili: ${data.length}`);
    
    if (data.length > 0) {
      const firstQuote = data[0];
      console.log(`📋 Primo preventivo: ${firstQuote.quoteNumber}`);
      console.log(`📋 Cliente: ${firstQuote.clientName}`);
      console.log(`📋 Client ID: ${firstQuote.clientId || 'NON PRESENTE'}`);
      console.log(`📋 Is New Client: ${firstQuote.isNewClient || false}`);
    }
  } catch (error) {
    console.log(`❌ Errore endpoint preventivi: ${error.message}`);
  }
  
  console.log('\n🎯 Debug navigazione completato!');
}

debugNavigationFlow();
```

---

## 🗑️ **SCRIPT ELIMINAZIONE & CESTINO**

### **Script 22: Debug Eliminazione Cascade**
```javascript
#!/usr/bin/env node
// File: scripts/debug-cascade-deletion.js

import { neon } from '@neondatabase/serverless';
import { config } from 'dotenv';

config();

async function debugCascadeDeletion() {
  if (!process.env.DATABASE_URL) {
    console.error('❌ DATABASE_URL must be set');
    process.exit(1);
  }

  const sql = neon(process.env.DATABASE_URL);
  
  try {
    console.log('🔍 Debugging cascade deletion...\n');
    
    // Verifica relazioni foreign key
    console.log('📋 Verificando relazioni foreign key...');
    const foreignKeys = await sql`
      SELECT 
        tc.table_name,
        kcu.column_name,
        ccu.table_name AS foreign_table_name,
        ccu.column_name AS foreign_column_name,
        tc.constraint_name
      FROM information_schema.table_constraints AS tc 
      JOIN information_schema.key_column_usage AS kcu
        ON tc.constraint_name = kcu.constraint_name
        AND tc.table_schema = kcu.table_schema
      JOIN information_schema.constraint_column_usage AS ccu
        ON ccu.constraint_name = tc.constraint_name
        AND ccu.table_schema = tc.table_schema
      WHERE tc.constraint_type = 'FOREIGN KEY'
      AND tc.table_schema = 'public'
      ORDER BY tc.table_name, kcu.column_name;
    `;
    
    console.log(`📊 Foreign key constraints trovati: ${foreignKeys.length}`);
    
    foreignKeys.forEach(fk => {
      console.log(`📋 ${fk.table_name}.${fk.column_name} → ${fk.foreign_table_name}.${fk.foreign_column_name}`);
    });
    
    // Verifica clienti con preventivi associati
    console.log('\n📋 Verificando clienti con preventivi associati...');
    const clientsWithQuotes = await sql`
      SELECT 
        c.id,
        c.client_code,
        c.client_name,
        COUNT(bq.id) as quote_count
      FROM clients c
      LEFT JOIN biyu_quotes bq ON c.id = bq.client_id
      GROUP BY c.id, c.client_code, c.client_name
      HAVING COUNT(bq.id) > 0
      ORDER BY quote_count DESC
      LIMIT 10
    `;
    
    console.log(`📊 Clienti con preventivi: ${clientsWithQuotes.length}`);
    
    clientsWithQuotes.forEach(client => {
      console.log(`📋 Cliente ${client.client_code}: ${client.client_name} (${client.quote_count} preventivi)`);
    });
    
    console.log('\n🎯 Debug cascade deletion completato!');
    
  } catch (error) {
    console.error('❌ Errore durante debug cascade:', error);
    process.exit(1);
  }
}

debugCascadeDeletion();
```

---

## 📝 **ISTRUZIONI D'USO RAPIDE**

### **🔧 Database & Migration:**
```bash
node check-table-structure.js biyu_quotes
node run-migrations-safe.js
node fix-database-types.js
node debug-database-constraints.js
```

### **🌐 API & Endpoint:**
```bash
node test-api-endpoints.js
node debug-endpoint-filters.js
node debug-duplicate-endpoints.js
```

### **⚛️ React & Frontend:**
```bash
node debug-react-rendering-loop.js
node debug-controlled-components.js
node debug-safe-rendering.js
node debug-form-callbacks.js
```

### **🔌 WebSocket:**
```bash
node debug-websocket-url.js
```

### **📊 Performance:**
```bash
node analyze-performance.js
node debug-checklist.js
```

### **🎯 TypeScript:**
```bash
node check-typescript-errors.js
node test-zod-validation.js
node debug-typescript-mismatches.js
```

### **💰 Prezzi Speciali:**
```bash
node debug-special-prices-flow.js
node debug-complete-special-prices-system.js
```

### **📄 PDF & Navigazione:**
```bash
node debug-pdf-generation.js
node debug-navigation-flow.js
```

### **🗑️ Eliminazione:**
```bash
node debug-cascade-deletion.js
```

---

## 🚀 **CONCLUSIONI**

Questi script sono stati riorganizzati per essere:
- **📋 Facilmente consultabili** con indice rapido
- **🔧 Specifici** per ogni categoria di problema
- **📝 Non duplicati** - ogni script ha uno scopo unico
- **🎯 Riutilizzabili** per problemi simili futuri
- **📊 Organizzati** per categoria logica

**🎯 Usa l'indice rapido per trovare subito lo script giusto per il tuo problema!**

---

## 🚀 **SCRIPT DEPLOY & DIPENDENZE (NUOVO - 28 Ottobre 2025)**

### **Script 23: Verifica Dipendenze Mancanti**
```bash
#!/bin/bash
# File: scripts/check-missing-dependencies.sh
# Uso: ./scripts/check-missing-dependencies.sh

echo "🔍 Verificando dipendenze mancanti..."

# Estrai tutti gli import esterni (non @/... e non react)
IMPORTS=$(grep -rh "^import.*from ['\"]" client/src/ | \
  grep -v "@/" | \
  grep -v "\"react\"" | \
  grep -v "\"react-" | \
  sed -E "s/.*from ['\"]([^'\"]+)['\"].*/\1/" | \
  sort -u)

MISSING_COUNT=0
FOUND_COUNT=0

echo ""
echo "📋 Controllando dipendenze..."
echo ""

# Verifica che ogni import sia nel package.json
for import in $IMPORTS; do
  # Ignora import relativi
  if [[ $import == .* ]]; then
    continue
  fi
  
  # Estrae il nome del package principale (es: leaflet/dist/leaflet.css -> leaflet)
  PACKAGE=$(echo $import | cut -d'/' -f1)
  
  if ! grep -q "\"$PACKAGE\"" package.json; then
    echo "❌ Dipendenza mancante: $PACKAGE (usato in: $import)"
    MISSING_COUNT=$((MISSING_COUNT + 1))
  else
    echo "✅ $PACKAGE presente"
    FOUND_COUNT=$((FOUND_COUNT + 1))
  fi
done

echo ""
echo "📊 Riepilogo:"
echo "  ✅ Dipendenze trovate: $FOUND_COUNT"
echo "  ❌ Dipendenze mancanti: $MISSING_COUNT"
echo ""

if [ $MISSING_COUNT -gt 0 ]; then
  echo "⚠️  ATTENZIONE: Alcune dipendenze sono mancanti!"
  echo "   Esegui: npm install <package-name> per ogni dipendenza mancante"
  exit 1
else
  echo "🎉 Tutte le dipendenze sono presenti!"
  exit 0
fi
```

### **Script 24: Pre-Commit Check Completo**
```bash
#!/bin/bash
# File: scripts/pre-commit-check.sh
# Uso: ./scripts/pre-commit-check.sh

echo "🚀 PRE-COMMIT CHECK COMPLETO"
echo "============================"
echo ""

# Colori per output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

ERRORS=0

# 1. Verifica dipendenze mancanti
echo "📦 Step 1/3: Verifica dipendenze..."
if ./scripts/check-missing-dependencies.sh; then
  echo -e "${GREEN}✅ Dipendenze OK${NC}"
else
  echo -e "${RED}❌ Dipendenze mancanti${NC}"
  ERRORS=$((ERRORS + 1))
fi
echo ""

# 2. Verifica TypeScript
echo "📝 Step 2/3: Verifica TypeScript..."
if npx tsc --noEmit 2>&1 | tee /tmp/tsc-errors.log; then
  echo -e "${GREEN}✅ TypeScript OK${NC}"
else
  echo -e "${RED}❌ Errori TypeScript trovati${NC}"
  cat /tmp/tsc-errors.log
  ERRORS=$((ERRORS + 1))
fi
echo ""

# 3. Build locale
echo "🔨 Step 3/3: Build locale..."
if npm run build 2>&1 | tee /tmp/build-errors.log; then
  echo -e "${GREEN}✅ Build OK${NC}"
else
  echo -e "${RED}❌ Build fallita${NC}"
  cat /tmp/build-errors.log
  ERRORS=$((ERRORS + 1))
fi
echo ""

# Riepilogo
echo "============================"
if [ $ERRORS -eq 0 ]; then
  echo -e "${GREEN}🎉 TUTTI I CHECK SONO PASSATI!${NC}"
  echo "✅ Puoi procedere con il commit"
  exit 0
else
  echo -e "${RED}❌ TROVATI $ERRORS ERRORI${NC}"
  echo "⚠️  Risolvi gli errori prima di committare"
  exit 1
fi
```

### **Script 25: Analisi Import Esterni**
```bash
#!/bin/bash
# File: scripts/analyze-external-imports.sh
# Uso: ./scripts/analyze-external-imports.sh [path-to-file]

if [ -z "$1" ]; then
  echo "❌ Uso: ./scripts/analyze-external-imports.sh <path-to-file>"
  echo "   Esempio: ./scripts/analyze-external-imports.sh client/src/pages/corso-dettaglio.tsx"
  exit 1
fi

FILE=$1

if [ ! -f "$FILE" ]; then
  echo "❌ File non trovato: $FILE"
  exit 1
fi

echo "🔍 Analizzando import esterni in: $FILE"
echo ""

# Estrai tutti gli import
echo "📋 Import trovati:"
grep "^import" "$FILE" | while read -r line; do
  # Estrai il nome del modulo
  MODULE=$(echo "$line" | sed -E "s/.*from ['\"]([^'\"]+)['\"].*/\1/")
  
  # Classifica l'import
  if [[ $MODULE == @/* ]]; then
    echo "  🔵 INTERNO: $MODULE"
  elif [[ $MODULE == .* ]]; then
    echo "  🟢 RELATIVO: $MODULE"
  elif [[ $MODULE == react* ]]; then
    echo "  🟣 REACT: $MODULE"
  else
    echo "  🔴 ESTERNO: $MODULE"
    # Verifica se è nel package.json
    PACKAGE=$(echo $MODULE | cut -d'/' -f1)
    if grep -q "\"$PACKAGE\"" package.json; then
      echo "     ✅ Presente in package.json"
    else
      echo "     ❌ MANCANTE in package.json - INSTALLARE!"
    fi
  fi
done

echo ""
echo "🎯 Analisi completata"
```

### **Script 26: Fix Dipendenze Automatico (PowerShell)**
```powershell
# File: scripts/fix-missing-dependencies.ps1
# Uso: .\scripts\fix-missing-dependencies.ps1

Write-Host "🔍 Cercando dipendenze mancanti..." -ForegroundColor Cyan

# Estrai tutti gli import esterni
$imports = Get-ChildItem -Path "client/src" -Recurse -Filter "*.tsx" | 
  Select-String -Pattern "^import.*from ['\`"]([^'\`"]+)['\`"]" | 
  ForEach-Object { $_.Matches.Groups[1].Value } | 
  Where-Object { $_ -notmatch "^@/" -and $_ -notmatch "^react" -and $_ -notmatch "^\." } |
  Select-Object -Unique

$packageJson = Get-Content "package.json" | ConvertFrom-Json
$dependencies = @() + $packageJson.dependencies.PSObject.Properties.Name + $packageJson.devDependencies.PSObject.Properties.Name

$missing = @()

foreach ($import in $imports) {
  $package = $import.Split('/')[0]
  if ($dependencies -notcontains $package) {
    Write-Host "❌ Dipendenza mancante: $package" -ForegroundColor Red
    $missing += $package
  } else {
    Write-Host "✅ $package presente" -ForegroundColor Green
  }
}

if ($missing.Count -gt 0) {
  Write-Host "`n⚠️  Trovate $($missing.Count) dipendenze mancanti" -ForegroundColor Yellow
  Write-Host "`nVuoi installarle ora? (S/N)" -ForegroundColor Yellow
  $response = Read-Host
  
  if ($response -eq 'S' -or $response -eq 's') {
    foreach ($package in $missing) {
      Write-Host "`n📦 Installando $package..." -ForegroundColor Cyan
      npm install $package
      
      # Cerca anche i types
      Write-Host "📦 Cercando @types/$package..." -ForegroundColor Cyan
      npm install --save-dev "@types/$package" 2>$null
    }
    Write-Host "`n🎉 Dipendenze installate!" -ForegroundColor Green
  }
} else {
  Write-Host "`n🎉 Tutte le dipendenze sono presenti!" -ForegroundColor Green
}
```

### **Script 27: Git Hook Pre-Commit**
```bash
#!/bin/bash
# File: .git/hooks/pre-commit
# Questo script viene eseguito automaticamente prima di ogni commit

echo "🔒 Running pre-commit checks..."

# Esegui il check completo
if ! ./scripts/pre-commit-check.sh; then
  echo ""
  echo "❌ Pre-commit check fallito!"
  echo "⚠️  Il commit è stato bloccato"
  echo ""
  echo "Opzioni:"
  echo "1. Risolvi gli errori e riprova"
  echo "2. Salta i check (NON RACCOMANDATO): git commit --no-verify"
  exit 1
fi

echo "✅ Pre-commit check passato!"
exit 0
```

**Installazione hook:**
```bash
# Copia lo script nella cartella hooks
cp scripts/pre-commit-hook.sh .git/hooks/pre-commit
chmod +x .git/hooks/pre-commit

# Ora ogni commit eseguirà automaticamente i check!
```

---

## 📝 **ISTRUZIONI D'USO RAPIDE - AGGIORNATE**

### **🚀 Deploy & Dipendenze:**
```bash
# Verifica dipendenze mancanti
./scripts/check-missing-dependencies.sh

# Check completo pre-commit
./scripts/pre-commit-check.sh

# Analizza import di un file specifico
./scripts/analyze-external-imports.sh client/src/pages/corso-dettaglio.tsx

# PowerShell - Fix automatico dipendenze
.\scripts\fix-missing-dependencies.ps1

# Installa git hook automatico
cp scripts/pre-commit-hook.sh .git/hooks/pre-commit
chmod +x .git/hooks/pre-commit
```

### **🔧 Workflow Completo Prima di Deploy:**
```bash
# 1. Verifica dipendenze
./scripts/check-missing-dependencies.sh

# 2. Check TypeScript
npx tsc --noEmit

# 3. Build locale
npm run build

# 4. Se tutto OK, commit
git add .
git commit -m "feat: nuova funzionalità"

# 5. Push e deploy
git push
flyctl deploy
```

---

## 🚀 **CONCLUSIONI AGGIORNATE**

Questi script sono stati aggiornati per includere:
- **📦 Verifica dipendenze automatica** - Previene errori di deploy
- **🔒 Git hooks pre-commit** - Blocca commit con errori
- **🔍 Analisi import esterni** - Identifica librerie mancanti
- **🛠️ Fix automatico** - Installa dipendenze mancanti
- **✅ Check completo pre-deploy** - TypeScript + Build + Dipendenze

**🎯 Usa questi script per evitare errori di deploy e mantenere il codice pulito!**

---

## 🚀 **SCRIPT ARCHITETTURA & COMPONENTI (NUOVO - 29 Gennaio 2025)**

### **Script 28: Verifica Isolamento Componenti**
```bash
#!/bin/bash
# File: scripts/verify-component-isolation.sh
# Uso: ./scripts/verify-component-isolation.sh component1 component2

COMPONENT1=$1
COMPONENT2=$2

if [ -z "$COMPONENT1" ] || [ -z "$COMPONENT2" ]; then
  echo "❌ Uso: ./scripts/verify-component-isolation.sh <component1> <component2>"
  echo "   Esempio: ./scripts/verify-component-isolation.sh MobileTelemarketingCard MobileBellezzaCard"
  exit 1
fi

echo "🔍 Verificando isolamento tra $COMPONENT1 e $COMPONENT2..."
echo ""

# Trova file che contengono entrambi i componenti
echo "📋 File che contengono entrambi i componenti:"
FILES=$(grep -rl "$COMPONENT1" client/src/ | xargs grep -l "$COMPONENT2" 2>/dev/null)

if [ -z "$FILES" ]; then
  echo "✅ Nessun file condivide entrambi i componenti"
else
  echo "❌ File che condividono entrambi:"
  echo "$FILES"
fi

# Verifica import separati
echo ""
echo "📋 Import separati verificati:"
grep -r "import.*$COMPONENT1" client/src/pages/ | head -5
grep -r "import.*$COMPONENT2" client/src/pages/ | head -5

echo ""
echo "🎯 Verifica isolamento completata"
```

### **Script 29: Migration Sicura con Verifica Post-Esecuzione**
```javascript
#!/usr/bin/env node
// File: scripts/run-migration-with-verification.js
// Pattern completo per migration sicure con verifica

import { neon } from '@neondatabase/serverless';
import { config } from 'dotenv';
import { readFileSync } from 'fs';
import { join } from 'path';

config();

async function runMigrationWithVerification(migrationPath, tableName, columnName) {
  if (!process.env.DATABASE_URL) {
    console.error('❌ DATABASE_URL must be set');
    process.exit(1);
  }

  const sql = neon(process.env.DATABASE_URL);
  
  try {
    console.log(`🚀 Eseguendo migration: ${migrationPath}...\n`);
    
    // 1. Leggi migration
    const migrationSQL = readFileSync(join(process.cwd(), migrationPath), 'utf8');
    
    // 2. Dividi comandi (rimuovi statement-breakpoint)
    const commands = migrationSQL
      .split('--> statement-breakpoint')
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
    
    console.log(`📋 Trovati ${commands.length} comandi SQL da eseguire\n`);
    
    // 3. Esegui ogni comando sequenzialmente
    for (let i = 0; i < commands.length; i++) {
      const command = commands[i].trim();
      if (command) {
        console.log(`⚡ Eseguendo comando ${i + 1}/${commands.length}...`);
        
        try {
          await sql(command);
          console.log(`   ✅ Comando ${i + 1} completato\n`);
        } catch (error) {
          // Idempotenza: se esiste già, continua
          if (error.message?.includes('already exists') || 
              error.message?.includes('duplicate') ||
              error.message?.includes('already exists')) {
            console.log(`   ⚠️  Già esistente, continuo...\n`);
          } else {
            throw error;
          }
        }
      }
    }
    
    console.log('✅ Migration completata con successo!');
    
    // 4. Verifica struttura post-migration
    if (tableName && columnName) {
      console.log(`\n🔍 Verificando struttura tabella ${tableName}...`);
      const columns = await sql`
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns 
        WHERE table_name = ${tableName} 
        AND column_name = ${columnName}
      `;
      
      if (columns.length > 0) {
        const col = columns[0];
        console.log(`✅ Colonna ${columnName} presente:`);
        console.log(`   - Tipo: ${col.data_type}`);
        console.log(`   - Nullable: ${col.is_nullable === 'YES' ? 'SÌ' : 'NO'}`);
        console.log(`   - Default: ${col.column_default || 'Nessuno'}`);
      } else {
        console.log(`❌ Colonna ${columnName} non trovata!`);
      }
      
      // 5. Verifica dati popolati
      const countResult = await sql`
        SELECT COUNT(*) as total, COUNT(${sql(columnName)}) as with_value
        FROM ${sql(tableName)}
      `;
      
      console.log(`\n📊 Statistiche:`);
      console.log(`   - Record totali: ${countResult[0].total}`);
      console.log(`   - Record con ${columnName}: ${countResult[0].with_value}`);
    }
    
    console.log('\n🎯 Migration e verifica completate con successo!');
    
  } catch (error) {
    console.error('❌ Errore durante l\'esecuzione della migration:', error);
    console.error('   Dettagli:', error.message);
    process.exit(1);
  }
}

// Esempio d'uso
const migrationPath = process.argv[2] || 'migrations/0011_add_telemarketing_numero_progressivo.sql';
const tableName = process.argv[3] || 'telemarketing_contacts';
const columnName = process.argv[4] || 'numero_progressivo';

runMigrationWithVerification(migrationPath, tableName, columnName);
```

### **Script 30: Analisi Condivisione Codice tra Componenti**
```bash
#!/bin/bash
# File: scripts/analyze-component-sharing.sh
# Uso: ./scripts/analyze-component-sharing.sh

echo "🔍 Analizzando condivisione codice tra componenti..."
echo ""

# Trova tutti i componenti mobile card
COMPONENTS=$(grep -r "export function Mobile" client/src/components/ui/ | \
  sed -E "s/.*export function (Mobile\w+).*/\1/" | \
  sort -u)

echo "📋 Componenti trovati:"
echo "$COMPONENTS"
echo ""

# Per ogni componente, trova file che lo importano
for component in $COMPONENTS; do
  echo "📋 $component:"
  FILES=$(grep -rl "$component" client/src/ 2>/dev/null | grep -v node_modules | head -5)
  if [ -z "$FILES" ]; then
    echo "   ⚠️  Nessun file trovato"
  else
    echo "$FILES" | sed 's/^/   - /'
  fi
  echo ""
done

# Trova funzioni helper condivise
echo "📋 Funzioni helper condivise:"
HELPER_FUNCTIONS=$(grep -r "export (const|function)" client/src/lib/ client/src/utils/ 2>/dev/null | \
  sed -E "s/.*export (const|function) (\w+).*/\2/" | \
  sort -u)

echo "$HELPER_FUNCTIONS" | sed 's/^/   - /'

echo ""
echo "🎯 Analisi completata"
```

### **Script 31: Verifica Stato Migrazioni Database**
```javascript
#!/usr/bin/env node
// File: scripts/check-warehouse-migrations.js
// Uso: node scripts/check-warehouse-migrations.js
// Descrizione: Verifica se le migrazioni warehouse_stock sono già state eseguite

import { neon } from '@neondatabase/serverless';
import { config } from 'dotenv';

config();

async function checkMigrations() {
  if (!process.env.DATABASE_URL) {
    console.error('❌ DATABASE_URL must be set');
    process.exit(1);
  }

  const sql = neon(process.env.DATABASE_URL);
  
  try {
    console.log('🔍 Verificando stato migrazioni warehouse_stock...\n');
    
    // Verifica 1: Colonne warehouse_stock nelle tabelle prodotti
    console.log('📋 Verifica 1: Colonne warehouse_stock nelle tabelle prodotti');
    const tables = [
      'biyu_products',
      'ctech_products',
      'epilsuite_products',
      'skinny_products',
      'depilis_products',
      'epilvip_products',
      'laser_products',
      'bendaggi_products',
      'monouso_products',
      'accessori_depilazione_products',
      'sugar_past_products',
      'giornate_tecniche_products'
    ];
    
    let allColumnsPresent = true;
    for (const tableName of tables) {
      const columns = await sql`
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns 
        WHERE table_name = ${tableName} 
        AND column_name = 'warehouse_stock'
      `;
      
      if (columns.length > 0) {
        const col = columns[0];
        console.log(`   ✅ ${tableName}: warehouse_stock presente`);
      } else {
        console.log(`   ❌ ${tableName}: warehouse_stock MANCANTE`);
        allColumnsPresent = false;
      }
    }
    
    // Verifica 2: Tabella warehouse_stock_history
    console.log('\n📋 Verifica 2: Tabella warehouse_stock_history');
    const historyTable = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'warehouse_stock_history'
      )
    `;
    
    const tableExists = historyTable[0].exists;
    if (tableExists) {
      console.log('   ✅ Tabella warehouse_stock_history presente');
      
      // Verifica colonne
      const historyColumns = await sql`
        SELECT column_name, data_type
        FROM information_schema.columns 
        WHERE table_name = 'warehouse_stock_history'
        ORDER BY ordinal_position
      `;
      console.log(`   📊 Colonne presenti: ${historyColumns.length}`);
      
      // Verifica indici
      const indexes = await sql`
        SELECT indexname 
        FROM pg_indexes 
        WHERE tablename = 'warehouse_stock_history'
      `;
      console.log(`   📊 Indici presenti: ${indexes.length}`);
    } else {
      console.log('   ❌ Tabella warehouse_stock_history MANCANTE');
    }
    
    // Riepilogo
    console.log('\n' + '='.repeat(50));
    if (allColumnsPresent && tableExists) {
      console.log('✅ TUTTE LE MIGRAZIONI SONO GIÀ STATE ESEGUITE');
      console.log('   Puoi procedere direttamente con commit e deploy');
    } else {
      console.log('⚠️  MIGRAZIONI NON COMPLETATE');
      console.log('   Devi eseguire le migrazioni prima del deploy:');
      if (!allColumnsPresent) {
        console.log('   1. node scripts/run-warehouse-stock-migration.js');
      }
      if (!tableExists) {
        console.log('   2. node scripts/run-warehouse-history-migration.js');
      }
    }
    console.log('='.repeat(50));
    
  } catch (error) {
    console.error('❌ Errore durante la verifica:', error);
    console.error('   Dettagli:', error.message);
    process.exit(1);
  }
}

checkMigrations();
```

---

## 📝 **ISTRUZIONI D'USO RAPIDE - AGGIORNATE**

### **🏗️ Architettura & Componenti:**
```bash
# Verifica isolamento componenti
./scripts/verify-component-isolation.sh MobileTelemarketingCard MobileBellezzaCard

# Migration con verifica completa
node scripts/run-migration-with-verification.js migrations/0011_add_telemarketing_numero_progressivo.sql telemarketing_contacts numero_progressivo

# Analizza condivisione codice
./scripts/analyze-component-sharing.sh

# Verifica stato migrazioni warehouse_stock
node scripts/check-warehouse-migrations.js
```

---

## 🚀 **CONCLUSIONI AGGIORNATE**

Questi script sono stati aggiornati per includere:
- **🏗️ Isolamento componenti** - Verifica che componenti correlati siano separati
- **✅ Migration con verifica** - Pattern completo con verifica post-esecuzione
- **📊 Analisi condivisione** - Identifica codice condiviso tra componenti
- **🔄 Pattern riutilizzabili** - Script generici per casi comuni
- **🔍 Verifica migrazioni** - Controlla stato migrazioni prima di eseguirle

**🎯 Usa questi script per mantenere architettura pulita e migration sicure!**