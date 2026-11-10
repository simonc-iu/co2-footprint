# CO2-Footprint

Diese Website bietet eine öffentliche Übersicht über die jährlichen CO2-Emissionen von Unternehmen und Ländern. Die Daten werden in einer Tabelle dargestellt, die sich nach Land und Unternehmen filtern und sortieren lässt.

Alle Emissionsdaten sind frei erfunden und dienen nur zu Demonstrationszwecken.

## Starten

Die Tabelle lädt ihre Daten aus `data/emissionen.json`. Browser blockieren das, wenn `index.html` direkt per Doppelklick geöffnet wird. Deshalb den Ordner über einen lokalen Server öffnen, zum Beispiel mit der Erweiterung Live Server in VS Code oder im Projektordner mit:

```
python3 -m http.server
```

Danach ist die Seite unter http://localhost:8000 erreichbar. Ein Build-Schritt oder eine Installation ist nicht nötig.

## Hintergrund

Das Projekt ist im Rahmen einer Fallstudie für den Kurs „Programmierung von Webanwendungsoberflächen” an der IU Internationale Hochschule entstanden und wurde von Simon Cülter umgesetzt.