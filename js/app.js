// Alle Einträge aus der JSON-Datei (werden später für Filter und Sortierung gebraucht)
let datensaetze = [];

// Der <tbody>, in den die Zeilen eingefügt werden
const tabelleInhalt = document.getElementById('tabelle-inhalt');

// Die Statuszeile über der Tabelle
const meldung = document.getElementById('daten-meldung');

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

// Lädt die Daten vom eigenen Server und zeigt sie an.
// Geht etwas schief, erscheint eine Meldung statt einer leeren Tabelle.
async function ladeDaten() {
  meldung.textContent = 'Daten werden geladen …';

  try {
    const antwort = await fetch('data/emissionen.json');

    // fetch meldet z. B. "Datei nicht gefunden" (404) nicht von selbst als Fehler
    if (!antwort.ok) {
      throw new Error('HTTP-Status ' + antwort.status);
    }

    datensaetze = await antwort.json();
    zeigeTabelle(datensaetze);
    meldung.textContent = '';
  } catch (fehler) {
    meldung.textContent = 'Die Daten konnten nicht geladen werden. Bitte die Seite später neu laden.';
    meldung.classList.add('ist-fehler');
    // Ohne Daten bliebe nur ein leerer Tabellenkopf stehen, daher ausblenden
    tabelleInhalt.closest('table').hidden = true;
    console.error(fehler); // technische Details nur für Entwickler in der Konsole
  }
}

ladeDaten();
