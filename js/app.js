// Alle Einträge aus der JSON-Datei (werden später für Filter und Sortierung gebraucht)
let datensaetze = [];

// Der <tbody>, in den die Zeilen eingefügt werden
const tabelleInhalt = document.getElementById('tabelle-inhalt');

// Die Statuszeile über der Tabelle
const meldung = document.getElementById('daten-meldung');

// Höchster Emissionswert im gesamten Datensatz, Bezugsgröße für die Balken
let hoechsterWert = 0;

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

// Erzeugt die Zelle für die Emissionen: schmaler Balken plus Zahl.
// Die Balkenlänge bezieht sich immer auf den höchsten Wert im gesamten
// Datensatz, damit sie auch nach dem Filtern vergleichbar bleibt.
function erstelleEmissionsZelle(wert) {
  const zelle = document.createElement('td');

  const inhalt = document.createElement('div');
  inhalt.className = 'emission';

  // Spur = verfügbare Breite, Balken = Anteil davon
  const spur = document.createElement('span');
  spur.className = 'emission-spur';
  spur.setAttribute('aria-hidden', 'true'); // Wert steht schon als Zahl daneben

  const balken = document.createElement('span');
  balken.className = 'emission-balken';
  balken.style.inlineSize = (wert / hoechsterWert * 100) + '%';
  spur.append(balken);

  const zahl = document.createElement('span');
  zahl.className = 'emission-zahl';
  zahl.textContent = formatiereZahl(wert);

  inhalt.append(spur, zahl);
  zelle.append(inhalt);
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
      erstelleEmissionsZelle(eintrag.emissionen)
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

    // Größten Wert einmal ermitteln: map holt alle Emissionen als Liste,
    // ... (Spread-Syntax) übergibt sie einzeln an Math.max
    hoechsterWert = Math.max(...datensaetze.map(function (eintrag) {
      return eintrag.emissionen;
    }));

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
