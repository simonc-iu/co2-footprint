// Datentabelle der Startseite: Laden, Anzeigen, Filtern, Sortieren.
// Die Sprache (Variable sprache, Funktion text) kommt aus js/sprache.js.

// Alle Einträge aus der JSON-Datei, Grundlage für Filter und Sortierung
let datensaetze = [];

// Der <tbody>, in den die Zeilen eingefügt werden
const tabelleInhalt = document.getElementById('tabelle-inhalt');

// Bereich um die Tabelle, hält beim Laden Platz frei
const tabellenBereich = document.querySelector('.tabellen-bereich');

// Die Statuszeile über der Tabelle
const meldung = document.getElementById('daten-meldung');

// Filterformular und seine Bestandteile
const filterFormular = document.getElementById('filter');
const filterLand = document.getElementById('filter-land');
const filterUnternehmen = document.getElementById('filter-unternehmen');
const laenderListe = document.getElementById('laender-liste');
const filterZuruecksetzen = document.getElementById('filter-zuruecksetzen');

// Knöpfe in den Spaltenköpfen zum Sortieren
const sortierKnoepfe = document.querySelectorAll('.sortier-knopf');

// Aktuelle Sortierung. Beim Öffnen: höchste Emissionen zuerst (Rangliste)
const sortierung = {
  schluessel: 'emissionen',
  richtung: 'absteigend'
};

// Zahlenformat je Sprache. Im Arabischen mit westlichen Ziffern (nu-latn),
// damit die Zahlen zu den deutschen Daten passen und gut vergleichbar bleiben.
const zahlenFormate = {
  de: 'de-DE',
  ar: 'ar-u-nu-latn'
};

// Klassen für Spalten, die erst ab 1024 px Breite erscheinen.
// Auf Smartphone und Tablet bleiben Unternehmen, Land und Emissionen sichtbar.
const nurBreit = 'd-none lg:d-table-cell';

// Höchster Emissionswert im gesamten Datensatz, Bezugsgröße für die Balken
let hoechsterWert = 0;

// Zahl mit genau einer Nachkommastelle im Format der Sprache, z. B. 182,4
function formatiereZahl(zahl) {
  return zahl.toLocaleString(zahlenFormate[sprache], {
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

// Zelle mit deutschem Text aus den Daten. lang="de" sagt Screenreadern,
// dass sie das Wort deutsch aussprechen sollen, auch in der arabischen Ansicht.
function erstelleDatenZelle(text, klasse) {
  const zelle = erstelleZelle(text, klasse);
  zelle.lang = 'de';
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
      erstelleDatenZelle(eintrag.unternehmen),
      erstelleDatenZelle(eintrag.land),
      erstelleDatenZelle(eintrag.branche, nurBreit),
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

// Sortiert die Einträge nach der aktuellen Spalte und Richtung.
// Zahlen werden als Zahlen verglichen (9,3 vor 88,2), Texte nach
// deutschen Regeln (Ägypten bei A).
function sortiere(eintraege) {
  const schluessel = sortierung.schluessel;
  const faktor = sortierung.richtung === 'aufsteigend' ? 1 : -1;

  return eintraege.sort(function (a, b) {
    let vergleich;
    if (typeof a[schluessel] === 'number') {
      vergleich = a[schluessel] - b[schluessel];
    } else {
      vergleich = a[schluessel].localeCompare(b[schluessel], 'de');
    }
    return vergleich * faktor; // -1 dreht die Reihenfolge um
  });
}

// Zeigt die Sortierung im Tabellenkopf: Pfeil für Sehende,
// aria-sort für Screenreader. Nur die sortierte Spalte bekommt aria-sort.
function zeigeSortierung() {
  sortierKnoepfe.forEach(function (knopf) {
    const kopfzelle = knopf.closest('th');
    const pfeil = knopf.querySelector('.sortier-pfeil');

    if (knopf.dataset.schluessel === sortierung.schluessel) {
      const aufsteigend = sortierung.richtung === 'aufsteigend';
      kopfzelle.setAttribute('aria-sort', aufsteigend ? 'ascending' : 'descending');
      pfeil.textContent = aufsteigend ? '↑' : '↓'; // diese Pfeile enthält IBM Plex Sans
    } else {
      kopfzelle.removeAttribute('aria-sort');
      pfeil.textContent = '';
    }
  });
}

// Zeigt in der Statuszeile, wie viele Einträge passen und wie sortiert ist
function zeigeTrefferanzahl(anzahl) {
  const t = texte[sprache]; // kurzer Name für die Texte der aktuellen Sprache

  if (anzahl === 0) {
    meldung.textContent = t.meldung_leer;
    return;
  }

  // Vorlage wählen und Platzhalter durch Werte ersetzen
  const vorlage = anzahl === datensaetze.length ? t.eintraege_alle : t.eintraege_teil;
  const treffer = vorlage
    .replace('{anzahl}', anzahl)
    .replace('{gesamt}', datensaetze.length);
  const sortiert = t.sortiert_nach.replace('{spalte}', t[sortierung.schluessel]);

  // sortierung.richtung ist 'aufsteigend' oder 'absteigend', passt zu den Schlüsseln in texte
  meldung.textContent = treffer + t.trenner + sortiert + ' (' + t[sortierung.richtung] + ')';
}

// Filtert, baut die Tabelle neu und aktualisiert die Trefferanzahl.
// Ohne Treffer wird die Tabelle ausgeblendet, der Hinweis steht darüber.
function aktualisiereAnsicht() {
  // filter liefert eine neue Liste, sortiert wird also nie der Originaldatensatz
  const treffer = sortiere(filtereDaten());
  zeigeTabelle(treffer);
  zeigeSortierung();
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

// Klick auf einen Spaltenkopf: gleiche Spalte → Richtung umdrehen,
// neue Spalte → Zahlen zuerst absteigend (größte oben), Texte aufsteigend (A bis Z)
sortierKnoepfe.forEach(function (knopf) {
  knopf.addEventListener('click', function () {
    const schluessel = knopf.dataset.schluessel;

    if (sortierung.schluessel === schluessel) {
      sortierung.richtung = sortierung.richtung === 'aufsteigend' ? 'absteigend' : 'aufsteigend';
    } else {
      sortierung.schluessel = schluessel;
      const istZahl = typeof datensaetze[0][schluessel] === 'number';
      sortierung.richtung = istZahl ? 'absteigend' : 'aufsteigend';
    }

    aktualisiereAnsicht();
  });
});

// Lädt die Daten vom eigenen Server und zeigt sie an.
// Geht etwas schief, erscheint eine Meldung statt einer leeren Tabelle.
async function ladeDaten() {
  meldung.textContent = text('meldung_laden');

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
  } catch (fehler) {
    meldung.textContent = text('meldung_fehler');
    meldung.classList.add('ist-fehler');
    filterFormular.hidden = true; // ohne Daten gibt es nichts zu filtern
    console.error(fehler); // technische Details nur für Entwickler in der Konsole
  } finally {
    // Geladen oder fehlgeschlagen: reservierten Platz freigeben
    // (finally läuft in beiden Fällen, nach try bzw. catch)
    tabellenBereich.removeAttribute('data-laedt');
  }
}

// Bei einem Sprachwechsel (js/sprache.js) Tabelle und Statuszeile neu aufbauen,
// damit Zahlenformat und Meldungstext zur Sprache passen
document.addEventListener('sprachwechsel', function () {
  if (datensaetze.length > 0) {
    aktualisiereAnsicht();
  }
});

ladeDaten();
