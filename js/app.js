// Alle Einträge aus der JSON-Datei, Grundlage für Filter und (später) Sortierung
let datensaetze = [];

// Der <tbody>, in den die Zeilen eingefügt werden
const tabelleInhalt = document.getElementById('tabelle-inhalt');

// Die Statuszeile über der Tabelle
const meldung = document.getElementById('daten-meldung');

// Filterformular und seine Bestandteile
const filterFormular = document.getElementById('filter');
const filterLand = document.getElementById('filter-land');
const filterUnternehmen = document.getElementById('filter-unternehmen');
const laenderListe = document.getElementById('laender-liste');
const filterZuruecksetzen = document.getElementById('filter-zuruecksetzen');

// Klassen für Spalten, die erst ab 1024 px Breite erscheinen.
// Auf Smartphone und Tablet bleiben Unternehmen, Land und Emissionen sichtbar.
const nurBreit = 'd-none lg:d-table-cell';

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
      erstelleZelle(eintrag.branche, nurBreit),
      erstelleZelle(eintrag.jahr, 'text-end ' + nurBreit),
      erstelleEmissionsZelle(eintrag.emissionen)
    );
    tabelleInhalt.append(zeile);
  });
}

// Füllt die Vorschlagsliste des Länderfelds: jedes Land nur einmal, alphabetisch.
// new Set(...) entfernt doppelte Einträge, localeCompare sortiert deutsch (Ä bei A).
function fuelleLaenderListe() {
  const laender = [...new Set(datensaetze.map(function (eintrag) {
    return eintrag.land;
  }))];
  laender.sort(function (a, b) {
    return a.localeCompare(b, 'de');
  });

  laender.forEach(function (land) {
    const option = document.createElement('option');
    option.value = land;
    laenderListe.append(option);
  });
}

// Macht Texte vergleichbar: Leerzeichen am Rand weg, alles kleingeschrieben
function normalisiere(text) {
  return text.trim().toLocaleLowerCase('de-DE');
}

// Liefert alle Einträge, die zu beiden Filterfeldern passen (Teilwort genügt).
// Die Eingaben werden nur verglichen und nie in die Seite geschrieben,
// eingeschleuster Code kann deshalb nicht ausgeführt werden.
function filtereDaten() {
  const land = normalisiere(filterLand.value);
  const unternehmen = normalisiere(filterUnternehmen.value);

  return datensaetze.filter(function (eintrag) {
    return normalisiere(eintrag.land).includes(land) &&
      normalisiere(eintrag.unternehmen).includes(unternehmen);
  });
}

// Zeigt in der Statuszeile, wie viele Einträge passen
function zeigeTrefferanzahl(anzahl) {
  if (anzahl === 0) {
    meldung.textContent = 'Keine Einträge gefunden. Bitte die Filter ändern oder zurücksetzen.';
  } else if (anzahl === datensaetze.length) {
    meldung.textContent = 'Alle ' + anzahl + ' Einträge';
  } else {
    meldung.textContent = anzahl + ' von ' + datensaetze.length + ' Einträgen';
  }
}

// Filtert, baut die Tabelle neu und aktualisiert die Trefferanzahl.
// Ohne Treffer wird die Tabelle ausgeblendet, der Hinweis steht darüber.
function aktualisiereAnsicht() {
  const treffer = filtereDaten();
  zeigeTabelle(treffer);
  zeigeTrefferanzahl(treffer.length);
  tabelleInhalt.closest('table').hidden = treffer.length === 0;
}

// Jede Eingabe in einem der Felder filtert sofort. Das input-Event
// steigt vom Feld zum Formular auf, daher genügt ein Listener am Formular.
filterFormular.addEventListener('input', aktualisiereAnsicht);

// Enter im Feld würde das Formular absenden und die Seite neu laden
filterFormular.addEventListener('submit', function (ereignis) {
  ereignis.preventDefault();
});

// Beide Felder leeren, alle Einträge zeigen, Fokus zurück ins erste Feld
filterZuruecksetzen.addEventListener('click', function () {
  filterLand.value = '';
  filterUnternehmen.value = '';
  aktualisiereAnsicht();
  filterLand.focus();
});

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

    fuelleLaenderListe();
    aktualisiereAnsicht(); // zeigt auch die Tabelle, sofern es Treffer gibt
    filterFormular.hidden = false;
  } catch (fehler) {
    meldung.textContent = 'Die Daten konnten nicht geladen werden. Bitte die Seite später neu laden.';
    meldung.classList.add('ist-fehler');
    // Filter und Tabelle bleiben versteckt (im HTML mit hidden vorbelegt)
    console.error(fehler); // technische Details nur für Entwickler in der Konsole
  }
}

ladeDaten();
