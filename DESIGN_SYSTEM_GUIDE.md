# 🎨 DRIPLUG DESIGN SYSTEM GUIDE 2025

**Documento di riferimento per stili comuni del gestionale**  
*Luxury Management System - Professional Dark Theme*

---

## 📋 INDICE

1. [Palette Colori](#palette-colori)
2. [Tipografia](#tipografia)
3. [Spaziatura](#spaziatura)
4. [Border Radius](#border-radius)
5. [Shadow](#shadow)
6. [Transizioni](#transizioni)
7. [Glass Effects](#glass-effects)
8. [Componenti Comuni](#componenti-comuni)
   - [Backdrop](#backdrop)
   - [Modal](#modal)
   - [Tabelle](#tabelle)
   - [Bottoni](#bottoni)
   - [Form](#form)
   - [Filtri](#filtri)
   - [Card/Box](#cardbox)
   - [Badge](#badge)
9. [Layout Patterns](#layout-patterns)
10. [Esempi di Codice](#esempi-di-codice)

---

## 🎨 PALETTE COLORI

### Primary - Oro/Giallo (Brand)
```css
--color-primary-600: #E6C200;  /* Rich Gold - USATO PER ELEMENTI PRINCIPALI */
--color-primary-500: #FFD700;  /* Pure Gold - HOVER */
--color-primary-800: #B39200;  /* Dark Gold - GRADIENTI */
--color-primary: var(--color-primary-600);  /* DEFAULT */
--color-primary-hover: var(--color-primary-500);
```

**Utilizzo:**
- Bottoni primary (`btn-primary`)
- Testo attivo/selezionato
- Border focus
- Shadow colorate
- Badge importanti
- Glow effects

---

### Accent - Blu (Secondario)
```css
--color-accent-600: #0284c7;   /* Deep Sky */
--color-accent-500: #0ea5e9;   /* Sky Blue - HOVER */
--color-accent-800: #075985;   /* Deep Blue */
```

**Utilizzo:**
- Elementi secondari
- Link
- Info badges

⚠️ **NOTA:** Il blu accent NON va usato per pulsanti comuni (riservato ad altro), usa grigio!

---

### Neutral - Grigi (Utilità)
```css
--color-neutral-500: #737373;  /* Medium Gray */
--color-neutral-600: #525252;  /* Dark Gray */
--color-neutral-700: #404040;  /* Darker Gray */
--color-neutral-400: #a3a3a3;  /* Light Gray - HOVER */
```

**Utilizzo:**
- Bottoni secondari/referral (`btn-referral`, `btn-secondary`)
- Background neutri
- Testo secondario
- Border sottili

---

### Testo
```css
--color-text-primary: #fafafa;           /* Testo principale */
--color-text-secondary: rgba(250, 250, 250, 0.8);  /* Testo secondario */
--color-text-tertiary: rgba(250, 250, 250, 0.6);   /* Testo terziario */
--color-text-disabled: rgba(250, 250, 250, 0.4);   /* Testo disabilitato */
--color-text-inverse: #121214;           /* Testo su background scuro (bottoni) */
```

---

### Background
```css
--color-background: #121214;           /* Background principale */
--color-background-secondary: #18181b; /* Background secondario */
--color-background-hover: #2a2a2e;     /* Hover state */
```

---

### Glow Colors (Effetti di luce)
```css
--bg-glow-gold: rgba(230, 194, 0, 0.1);        /* Glow oro sottile */
--bg-glow-gold-strong: rgba(230, 194, 0, 0.14); /* Glow oro forte */
--bg-glow-blue: rgba(2, 132, 199, 0.1);        /* Glow blu sottile */
```

**Utilizzo:**
- Background glow effects
- Shadow colorate
- Ambient lighting

---

## 📝 TIPOGRAFIA

### Font Family
```css
--font-family-primary: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
--font-family-mono: 'SF Mono', 'JetBrains Mono', Monaco, monospace;
```

### Font Sizes
```css
--font-size-xs: 0.75rem;    /* 12px - Labels, badge */
--font-size-sm: 0.875rem;   /* 14px - Testo secondario */
--font-size-base: 1rem;     /* 16px - Testo normale */
--font-size-lg: 1.125rem;   /* 18px - Testo importante */
--font-size-xl: 1.25rem;    /* 20px - Sottotitoli */
--font-size-2xl: 1.5rem;    /* 24px - Titoli sezione */
--font-size-3xl: 1.875rem;  /* 30px - Titoli pagina */
```

### Font Weights
```css
--font-weight-light: 300;
--font-weight-normal: 400;    /* Testo normale */
--font-weight-medium: 500;    /* Labels, badge */
--font-weight-semibold: 600;  /* Titoli sezione */
--font-weight-bold: 700;      /* Titoli pagina */
```

### Line Heights
```css
--line-height-tight: 1.25;    /* Titoli */
--line-height-normal: 1.5;    /* Testo normale */
--line-height-relaxed: 1.75;  /* Testo lungo */
```

### Letter Spacing
```css
--letter-spacing-normal: 0;
--letter-spacing-wide: 0.025em;
--letter-spacing-wider: 0.05em;  /* UPPERCASE labels, badge */
```

---

## 📏 SPAZIATURA

**Sistema basato su 4px (0.25rem)**

```css
--spacing-1: 0.25rem;   /* 4px - Gap minimi */
--spacing-2: 0.5rem;    /* 8px - Gap piccoli */
--spacing-3: 0.75rem;   /* 12px - Padding interno */
--spacing-4: 1rem;      /* 16px - Gap medi, padding */
--spacing-5: 1.25rem;   /* 20px - Padding container */
--spacing-6: 1.5rem;    /* 24px - Margin tra sezioni */
--spacing-8: 2rem;      /* 32px - Padding grandi */
```

**Utilizzo tipico:**
- Gap tra elementi: `var(--spacing-3)` o `var(--spacing-4)`
- Padding container: `var(--spacing-5)`
- Margin sezioni: `var(--spacing-6)`
- Padding modal: `var(--spacing-5)`

---

## 🔲 BORDER RADIUS

```css
--radius-sm: 0.25rem;   /* 4px - Badge piccoli */
--radius-base: 0.375rem; /* 6px */
--radius-md: 0.5rem;    /* 8px - Bottoni, input */
--radius-lg: 0.75rem;   /* 12px - Container, panel */
--radius-xl: 1rem;      /* 16px - Modal */
--radius-full: 9999px;  /* Badge, pill */
```

**Utilizzo:**
- Bottoni: `var(--radius-md)`
- Input: `var(--radius-md)`
- Container/Panel: `var(--radius-lg)`
- Modal: `var(--radius-xl)`
- Badge pill: `var(--radius-full)`

---

## 🌑 SHADOW

### Shadow Standard (Nere)
```css
--shadow-sm: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1);
--shadow-base: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1);
--shadow-md: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1);
--shadow-lg: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
```

### Shadow Colorate (Brand)
```css
--shadow-primary: 
  0 4px 14px 0 rgba(230, 194, 0, 0.25),
  0 2px 6px 0 rgba(230, 194, 0, 0.15);

--shadow-primary-lg: 
  0 10px 30px 0 rgba(230, 194, 0, 0.35),
  0 4px 12px 0 rgba(230, 194, 0, 0.2),
  0 0 0 1px rgba(230, 194, 0, 0.1);
```

**Utilizzo:**
- Container/Panel: `var(--shadow-base)`
- Modal: `var(--shadow-lg)`
- Bottoni primary: `var(--shadow-primary)`
- Bottoni primary hover: `var(--shadow-primary-lg)`

---

## ⏱️ TRANSIZIONI

```css
--transition-fast: 150ms cubic-bezier(0.4, 0, 0.2, 1);
--transition-base: 200ms cubic-bezier(0.4, 0, 0.2, 1);      /* DEFAULT */
--transition-slow: 300ms cubic-bezier(0.4, 0, 0.2, 1);
--transition-smooth: 250ms cubic-bezier(0.25, 0.46, 0.45, 0.94);
--transition-luxury: 350ms cubic-bezier(0.23, 1, 0.32, 1);  /* PER ELEMENTI LUXURY */
--transition-all: all var(--transition-base);
```

**Utilizzo:**
- Standard: `var(--transition-base)` o `var(--transition-all)`
- Luxury components (bottoni, modal): `var(--transition-luxury)`
- Input focus: `var(--transition-luxury)`

---

## 🔮 GLASS EFFECTS

### Glass Backgrounds
```css
--glass-bg: rgba(39, 39, 42, 0.7);        /* Glass standard */
--glass-bg-light: rgba(39, 39, 42, 0.5);  /* Glass leggero */
--glass-bg-heavy: rgba(39, 39, 42, 0.85); /* Glass pesante */
--glass-bg-luxury: linear-gradient(
  180deg,
  rgba(39, 39, 42, 0.8) 0%,
  rgba(39, 39, 42, 0.7) 50%,
  rgba(39, 39, 42, 0.75) 100%
);  /* PER CONTAINER, PANEL, TABELLE */
```

### Glass Border
```css
--glass-border: rgba(255, 255, 255, 0.1);
```

### Backdrop Filter
```css
backdrop-filter: blur(10px);
-webkit-backdrop-filter: blur(10px);
```

**Utilizzo:**
- Container/Panel/Tabelle: `background: var(--glass-bg-luxury);`
- Input: `background: var(--glass-bg-light);`
- Hover/Focus: `background: var(--glass-bg);`
- Border: `border: 1px solid var(--glass-border);`

---

## 🧩 COMPONENTI COMUNI

### BACKDROP

**Classe:** `.dropdown-backdrop` o `.shared-backdrop`

**Stile standard:**
```css
.shared-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(
    180deg,
    rgba(0, 0, 0, 0.6) 0%,
    rgba(0, 0, 0, 0.55) 50%,
    rgba(0, 0, 0, 0.5) 100%
  );
  backdrop-filter: blur(2px);
  -webkit-backdrop-filter: blur(2px);
  animation: fadeIn 0.3s ease-out;
  z-index: 999;
}
```

**Utilizzo:**
```jsx
{showModal && (
  <>
    <div className="dropdown-backdrop" onClick={handleClose} />
    <div className="modal-overlay">
      {/* contenuto */}
    </div>
  </>
)}
```

---

### MODAL

**Struttura standard:**
```jsx
{showModal && (
  <>
    <div className="dropdown-backdrop" onClick={handleClose} />
    <div className="modal-overlay">
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Titolo Modal</h3>
          <button className="close-btn" onClick={handleClose}>×</button>
        </div>
        <div className="modal-body">
          {/* contenuto */}
        </div>
      </div>
    </div>
  </>
)}
```

**Stile:**
- Background: `var(--glass-bg-luxury)`
- Border: `1px solid var(--glass-border)`
- Border-radius: `var(--radius-xl)`
- Shadow: `var(--shadow-lg)`
- Padding: `var(--spacing-5)`

---

### TABELLE

**Struttura:**
```jsx
<div className="table-container">
  <table>
    <thead>
      <tr>
        <th>Colonna 1</th>
        <th>Colonna 2</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>Dato 1</td>
        <td>Dato 2</td>
      </tr>
    </tbody>
  </table>
</div>
```

**Stile Container:**
```css
.table-container {
  background: var(--glass-bg-luxury);
  border-radius: var(--radius-lg);
  box-shadow: 
    var(--shadow-base),
    0 0 0 1px rgba(255, 255, 255, 0.08),
    inset 0 1px 0 rgba(255, 255, 255, 0.05);
  border: 1px solid var(--glass-border);
  overflow: hidden;
}
```

**Stile Celle:**
```css
th, td {
  padding: 0.875rem 1rem;  /* var(--spacing-3) var(--spacing-4) */
  text-align: center;
  box-sizing: border-box;
}
```

---

### BOTTONI

#### Primary Button (Azione principale)
```jsx
<button className="btn btn-primary">Testo</button>
```

**Colore:** Oro/Giallo  
**Utilizzo:** Azioni principali (es. "Nuovo Cliente", "Salva")

---

#### Referral Button (Azione secondaria)
```jsx
<button className="btn btn-referral">Testo</button>
```

**Colore:** Grigio con effetto glass  
**Utilizzo:** Azioni secondarie (es. "Referral")

**Stile:**
- Background: Gradiente grigio con opacità
- Glass effect: `backdrop-filter: blur(10px)`
- Transition: `var(--transition-luxury)`
- Shadow multi-layer
- Hover: Glow dorato sottile `0 0 15px rgba(230, 194, 0, 0.08)`

---

#### Secondary Button
```jsx
<button className="btn btn-secondary">Testo</button>
```

**Colore:** Grigio neutro  
**Utilizzo:** Azioni secondarie generiche

---

#### Danger Button
```jsx
<button className="btn btn-danger">Testo</button>
```

**Colore:** Rosso  
**Utilizzo:** Azioni distruttive (elimina)

---

#### Outline Button
```jsx
<button className="btn btn-outline">Testo</button>
```

**Colore:** Trasparente con bordo  
**Utilizzo:** Azioni terziarie

---

### FORM

**Struttura:**
```jsx
<form>
  <div className="form-group">
    <label>Nome *</label>
    <input type="text" />
  </div>
</form>
```

**Stile Input:**
```css
.form-group input,
.form-group select,
.form-group textarea {
  width: 100%;
  padding: var(--spacing-3) var(--spacing-4);
  border: 1px solid var(--color-border-dark);
  border-radius: var(--radius-md);
  background: var(--glass-bg-light);
  color: var(--color-text-primary);
  transition: var(--transition-luxury);
}

.form-group input:focus,
.form-group select:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 
    0 0 0 3px rgba(230, 194, 0, 0.15),
    0 0 20px rgba(230, 194, 0, 0.1);
  background: var(--glass-bg);
}
```

---

### FILTRI

**Struttura:**
```jsx
<div className="filters-panel">
  <div className="filters-bar">
    <div className="search-input-wrapper">
      <span className="search-icon">🔍</span>
      <input className="search-input" placeholder="Cerca..." />
    </div>
    <div className="filters-actions">
      <div className="filter-group-inline">
        <label>Filtro</label>
        <Dropdown />
      </div>
    </div>
  </div>
  <div className="filter-results-count">
    <strong>5</strong> risultati
  </div>
</div>
```

**Stile Panel:**
```css
.filters-panel {
  background: var(--glass-bg-luxury);
  border-radius: var(--radius-lg);
  box-shadow: 
    var(--shadow-base),
    0 0 0 1px rgba(255, 255, 255, 0.08),
    inset 0 1px 0 rgba(255, 255, 255, 0.05);
  border: 1px solid var(--glass-border);
  padding: var(--spacing-5);
  margin-bottom: var(--spacing-5);
}
```

---

### CARD/BOX

**Utilizzo standard:**
- Background: `var(--glass-bg-luxury)`
- Border: `1px solid var(--glass-border)`
- Border-radius: `var(--radius-lg)`
- Shadow: `var(--shadow-base)`
- Padding: `var(--spacing-5)`

**Esempio:**
```css
.card {
  background: var(--glass-bg-luxury);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-lg);
  box-shadow: 
    var(--shadow-base),
    0 0 0 1px rgba(255, 255, 255, 0.08),
    inset 0 1px 0 rgba(255, 255, 255, 0.05);
  padding: var(--spacing-5);
}
```

---

### BADGE

**Badge Standard (Primary):**
```css
.badge {
  display: inline-flex;
  align-items: center;
  padding: var(--spacing-1) var(--spacing-3);
  border-radius: var(--radius-full);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}
```

**Badge Referral/Colorato:**
```css
.referral-badge,
.customer-name-badge {
  display: inline-flex;
  align-items: center;
  padding: var(--spacing-1) var(--spacing-3);
  border-radius: var(--radius-full);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  border: 1px solid;
  /* Stile dinamico basato su colore */
  background: linear-gradient(135deg, rgba(r, g, b, 0.15) 0%, rgba(r, g, b, 0.08) 100%);
  border-color: rgba(r, g, b, 0.4);
  color: rgb(r, g, b);
  box-shadow: 0 2px 8px rgba(r, g, b, 0.25);
}
```

---

## 📐 LAYOUT PATTERNS

### Page Header
```jsx
<div className="page-header">
  <div className="page-header-content">
    <div className="page-header-title">
      <span className="page-header-icon">👥</span>
      <h2>Titolo Pagina</h2>
      <span className="page-header-badge">Badge</span>
    </div>
  </div>
  <div style={{ display: 'flex', gap: 'var(--spacing-3)' }}>
    <button className="btn btn-referral">Azione 1</button>
    <button className="btn btn-primary">Azione 2</button>
  </div>
</div>
```

### Breadcrumb
```jsx
<div className="page-breadcrumb">
  <span className="breadcrumb-item">Registro</span>
  <span className="breadcrumb-separator">›</span>
  <span className="breadcrumb-item active">Clienti</span>
</div>
```

### Registro Page Structure
```jsx
<div className="registro-page">
  <div className="page-breadcrumb">...</div>
  <div className="page-header">...</div>
  <div className="filters-panel">...</div>
  <div className="table-container">...</div>
</div>
```

---

## 💻 ESEMPI DI CODICE

### Modal Completo
```jsx
{showModal && (
  <>
    <div className="dropdown-backdrop" onClick={() => !isSaving && setShowModal(false)} />
    <div className="modal-overlay">
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{editing ? 'Modifica' : 'Nuovo'}</h3>
          <button 
            className="close-btn" 
            onClick={() => setShowModal(false)}
            disabled={isSaving}
          >
            ×
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Nome *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              disabled={isSaving}
            />
          </div>
          <div className="form-actions">
            <button 
              type="button" 
              className="btn btn-secondary" 
              onClick={() => setShowModal(false)}
              disabled={isSaving}
            >
              Annulla
            </button>
            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={isSaving}
            >
              {isSaving ? 'Salvataggio...' : 'Salva'}
            </button>
          </div>
        </form>
      </div>
    </div>
  </>
)}
```

### Tabella Completa
```jsx
<div className="table-container">
  <table>
    <thead>
      <tr>
        <th className="col-nome">Nome</th>
        <th className="col-azioni">Azioni</th>
      </tr>
    </thead>
    <tbody>
      {items.map((item) => (
        <tr key={item.id}>
          <td className="col-nome">{item.name}</td>
          <td className="col-azioni">
            <div className="action-buttons">
              <button className="action-btn edit" onClick={() => handleEdit(item)}>
                <span className="action-btn-icon">✏️</span>
              </button>
              <button className="action-btn delete" onClick={() => handleDelete(item.id)}>
                <span className="action-btn-icon">🗑️</span>
              </button>
            </div>
          </td>
        </tr>
      ))}
    </tbody>
  </table>
</div>
```

---

## ✅ CHECKLIST COERENZA

Quando crei un nuovo componente, verifica:

- [ ] Usa le variabili CSS (`var(--color-primary)`, `var(--spacing-4)`, ecc.)
- [ ] Background glass: `var(--glass-bg-luxury)` per container
- [ ] Border: `1px solid var(--glass-border)`
- [ ] Border-radius: `var(--radius-lg)` per container
- [ ] Shadow: `var(--shadow-base)` per container
- [ ] Transizioni: `var(--transition-luxury)` per elementi luxury
- [ ] Padding: `var(--spacing-5)` per container
- [ ] Gap: `var(--spacing-3)` o `var(--spacing-4)` tra elementi
- [ ] Colori: Primary (oro) per azioni principali, Grigio per secondarie
- [ ] Backdrop: Usa sempre `.dropdown-backdrop` standard
- [ ] Modal: Struttura standard con `.modal-overlay` e `.modal`

---

## 🎯 REGOLE IMPORTANTI

1. **COERENZA COLORI:**
   - Primary (oro) = Azioni principali, focus, brand
   - Grigio = Azioni secondarie, neutral
   - Blu accent = NON usare per pulsanti comuni (riservato)

2. **COERENZA GLASS:**
   - Container/Panel/Tabelle: `var(--glass-bg-luxury)`
   - Input: `var(--glass-bg-light)`
   - Focus/Hover: `var(--glass-bg)`

3. **COERENZA SPACING:**
   - SEMPRE usare variabili: `var(--spacing-X)`
   - Non usare valori hardcoded come `16px`, `20px`, ecc.

4. **COERENZA SHADOW:**
   - Container: `var(--shadow-base)`
   - Modal: `var(--shadow-lg)`
   - Bottoni primary: `var(--shadow-primary)`

5. **COERENZA TRANSIZIONI:**
   - Standard: `var(--transition-base)`
   - Luxury: `var(--transition-luxury)`

---

**Ultimo aggiornamento:** Gennaio 2025  
**Versione:** 1.0.0

