// Alle Einträge aus der JSON-Datei (werden später für Filter und Sortierung gebraucht)
let datensaetze = [];

// Der <tbody>, in den die Zeilen eingefügt werden
const tabelleInhalt = document.getElementById('tabelle-inhalt');

// Zahl im deutschen Format mit genau einer Nachkommastelle, z. B. 182,4
function formatiereZahl(zahl) {
  return zahl.toLocaleString('de-DE', {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1
  });
}

// Erzeugt eine Tabellenzelle. Der Inhalt wird nur als Text eingefügt,
// nie als HTML, damit kein eingeschleuster Code ausgeführt wird.
function erstelleZelle(text, klasse) {
  const zelle = document.createElement('td');
  zelle.textContent = text;
  if (klasse) {
    zelle.className = klasse;
  }
  return zelle;
}

// Leert die Tabelle und baut für jeden Eintrag eine Zeile
function zeigeTabelle(eintraege) {
  tabelleInhalt.replaceChildren();

  eintraege.forEach(function (eintrag) {
    const zeile = document.createElement('tr');
    zeile.append(
      erstelleZelle(eintrag.unternehmen),
      erstelleZelle(eintrag.land),
      erstelleZelle(eintrag.branche),
      erstelleZelle(eintrag.jahr, 'text-end'),
      erstelleZelle(formatiereZahl(eintrag.emissionen), 'text-end')
    );
    tabelleInhalt.append(zeile);
  });
}

// Lädt die Daten vom eigenen Server und zeigt sie an
async function ladeDaten() {
  const antwort = await fetch('data/emissionen.json');
  datensaetze = await antwort.json();
  zeigeTabelle(datensaetze);
}

ladeDaten();
