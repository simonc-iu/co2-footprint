// Sprache so früh wie möglich festlegen, noch bevor der Seiteninhalt aufgebaut ist.
// Grund: Firefox gibt eine später geänderte Sprache nicht an Screenreader weiter
// (Test E21). Diese Datei wird deshalb im <head> ohne "defer" geladen.

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

// lang und dir sofort am <html> setzen
document.documentElement.lang = ermittleSprache();
document.documentElement.dir = document.documentElement.lang === 'ar' ? 'rtl' : 'ltr';
