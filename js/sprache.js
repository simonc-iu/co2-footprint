// Sprachumschaltung für alle Seiten (Anforderung c).
// Texte stehen in js/texte.js. Seitenspezifisches (z. B. die Tabelle) hört auf
// das Ereignis "sprachwechsel" und baut sich selbst neu auf.

// Aktuelle Sprache der Oberfläche: 'de' oder 'ar'
let sprache = 'de';

// Sprachumschalter im Header
const sprachwahl = document.querySelector('.sprachwahl');
const sprachKnoepfe = document.querySelectorAll('.sprachwahl-knopf');

// Welche Sprache beim Öffnen? 1. Adresse (?sprache=ar), z. B. nach dem Umschalten
// oder für Tests; 2. Spracheinstellung des Browsers (navigator.language);
// 3. sonst Deutsch. Nur 'de' und 'ar' sind erlaubt, alles andere wird ignoriert.
function ermittleSprache() {
  const ausAdresse = new URLSearchParams(location.search).get('sprache');
  if (ausAdresse === 'de' || ausAdresse === 'ar') {
    return ausAdresse;
  }
  return navigator.language.startsWith('ar') ? 'ar' : 'de';
}

// Text zu einem Schlüssel. Fehlt eine Übersetzung, steht der deutsche Text da.
function text(schluessel) {
  return texte[sprache][schluessel] ?? texte.de[schluessel];
}

// Schaltet die ganze Oberfläche um: Texte, Leserichtung, Sprachangabe, Links
function setzeSprache(neueSprache) {
  sprache = neueSprache;

  // lang und dir am <html>: Arabisch wird von rechts nach links gesetzt.
  // Das CSS nutzt logische Eigenschaften, das Layout spiegelt sich dadurch von selbst.
  document.documentElement.lang = sprache;
  document.documentElement.dir = sprache === 'ar' ? 'rtl' : 'ltr';

  // Seitentitel: Schlüssel steht am <body> (data-titel)
  document.title = text(document.body.dataset.titel) + ' – CO₂-Footprint';

  // Sichtbare Texte (nur textContent, nie innerHTML)
  document.querySelectorAll('[data-text]').forEach(function (element) {
    element.textContent = text(element.dataset.text);
  });

  // Unsichtbare Beschriftungen für Screenreader
  document.querySelectorAll('[data-text-label]').forEach(function (element) {
    element.setAttribute('aria-label', text(element.dataset.textLabel));
  });

  // Hinweise, die nur in der arabischen Ansicht erscheinen (z. B. "nur auf Deutsch")
  document.querySelectorAll('[data-nur-arabisch]').forEach(function (element) {
    element.hidden = sprache !== 'ar';
  });

  // Gedrückter Zustand der Umschalter-Knöpfe
  sprachKnoepfe.forEach(function (knopf) {
    knopf.setAttribute('aria-pressed', knopf.dataset.sprache === sprache ? 'true' : 'false');
  });

  // Links zu den anderen Seiten nehmen die Sprache mit (?sprache=…),
  // damit die Wahl beim Seitenwechsel erhalten bleibt (ohne Cookie oder Speicher)
  document.querySelectorAll('a[href$=".html"], a[data-ziel]').forEach(function (link) {
    if (!link.dataset.ziel) {
      link.dataset.ziel = link.getAttribute('href'); // ursprüngliches Ziel merken
    }
    link.setAttribute('href', link.dataset.ziel + '?sprache=' + sprache);
  });

  // Seitenspezifische Teile informieren (die Tabelle baut sich dann neu auf)
  document.dispatchEvent(new CustomEvent('sprachwechsel'));
}

// Klick auf "Deutsch" oder "العربية": umschalten und die Wahl in die Adresse
// schreiben, damit sie beim Neuladen erhalten bleibt
sprachKnoepfe.forEach(function (knopf) {
  knopf.addEventListener('click', function () {
    setzeSprache(knopf.dataset.sprache);
    history.replaceState(null, '', '?sprache=' + sprache);
  });
});

setzeSprache(ermittleSprache());
sprachwahl.hidden = false; // Umschalter erst zeigen, wenn JavaScript läuft
