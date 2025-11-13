# Setup Git e GitHub

## Prerequisiti

1. **Installa Git** se non l'hai già fatto:
   - Scarica da: https://git-scm.com/download/win
   - Durante l'installazione, assicurati di selezionare "Add Git to PATH"

2. **Verifica l'installazione:**
   ```bash
   git --version
   ```

## Configurazione Iniziale Git

Se è la prima volta che usi Git sul tuo computer, configura nome e email:

```bash
git config --global user.name "Il Tuo Nome"
git config --global user.email "tua.email@example.com"
```

## Setup del Repository

### 1. Inizializza Git nel progetto

```bash
# Dalla root del progetto
git init
```

### 2. Aggiungi tutti i file (tranne quelli in .gitignore)

```bash
git add .
```

### 3. Crea il primo commit

```bash
git commit -m "Initial commit: Web app per gestione magazzino e casse"
```

### 4. Crea un repository su GitHub

1. Vai su https://github.com
2. Clicca su "New repository" (o il pulsante "+" in alto a destra)
3. Scegli un nome per il repository (es: "gestione-magazzino")
4. **NON** selezionare "Initialize with README" (abbiamo già i file)
5. Clicca "Create repository"

### 5. Collega il repository locale a GitHub

GitHub ti mostrerà i comandi da eseguire. In generale saranno:

```bash
# Sostituisci USERNAME e REPO_NAME con i tuoi valori
git remote add origin https://github.com/USERNAME/REPO_NAME.git
git branch -M main
git push -u origin main
```

## Workflow per Commit e Push

### Prima di ogni deploy su Render:

1. **Verifica lo stato dei file:**
   ```bash
   git status
   ```

2. **Aggiungi i file modificati:**
   ```bash
   git add .
   # Oppure aggiungi file specifici:
   # git add frontend/src/pages/Home.tsx
   ```

3. **Crea un commit con un messaggio descrittivo:**
   ```bash
   git commit -m "Descrizione delle modifiche fatte"
   ```

4. **Fai push su GitHub:**
   ```bash
   git push
   ```

## Esempi di Messaggi di Commit

- `feat: aggiunta gestione prodotti`
- `fix: correzione bug salvataggio magazzini`
- `refactor: miglioramento struttura API`
- `docs: aggiornamento README`
- `style: miglioramento UI dashboard`

## Note Importanti

- Il file `.env` è già nel `.gitignore` e **NON** verrà committato (per sicurezza)
- Prima di ogni push, assicurati che tutto funzioni localmente
- Render può fare deploy automatico da GitHub se configuri il webhook

## Deploy su Render

Dopo aver fatto push su GitHub:

1. Vai su https://render.com
2. Crea un nuovo "Web Service"
3. Connetti il tuo repository GitHub
4. Render rileverà automaticamente il progetto
5. Configura le variabili d'ambiente (DATABASE_URL, PORT, ecc.)
6. Render farà il deploy automaticamente ad ogni push su main/master

