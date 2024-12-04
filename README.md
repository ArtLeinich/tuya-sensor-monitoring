# 🌡️ Tuya Sensor Monitoring

## Projektbeschreibung

Dieses Projekt ist eine Anwendung, die Daten zu Temperatur und Luftfeuchtigkeit von einem **Tuya S08Pro-Sensor** über die **Tuya-API** abruft, in einer **PostgreSQL-Datenbank** speichert und diese anschließend über ein **Next.js-Frontend** mit App Router visualisiert. Die erfassten Daten können in Form von interaktiven Grafiken angezeigt werden, um Trends und Muster zu analysieren.

---

## 📌 Features

- **Automatischer Datenabruf**: Sensordaten werden alle 5 Minuten mit einem Cron-Job abgerufen.
- **Datenbankintegration**: Speicherung der Sensordaten (Temperatur und Luftfeuchtigkeit) in einer PostgreSQL-Datenbank mittels Prisma ORM.
- **Visualisierung**: Darstellung der Daten in Diagrammen, die sowohl mobil- als auch desktopfreundlich sind.
- **Pagination**: Unterstützung für die Anzeige großer Datenmengen mit Seitenumbrüchen.
- **Fehlerbehandlung**: Erkennung und Behandlung von Duplikaten bei der Datenspeicherung.

---

## 🔧 Technologien

- **Next.js (App Router)**: Für den Aufbau des Webinterfaces und der API-Endpunkte.
- **TypeScript**: Für typsichere Entwicklung.
- **PostgreSQL**: Zur Speicherung der Sensordaten.
- **Prisma ORM**: Für die Datenbankanbindung und -verwaltung.
- **Tuya-API**: Für den Abruf von Sensordaten.
- **node-cron**: Zum Planen regelmäßiger Datenabrufe.
- **Tailwind CSS**: Für ein responsives und modernes Design.

---

## 📂 Projektstruktur

```plaintext
my-monitoring-app/
├── prisma/                  # Prisma-Konfigurationsdateien
│   ├── schema.prisma        # Datenbankschema
├── app/
│   ├── api/                 # API-Routen
│   │   ├── sensor-data/     # Datenendpunkte für Sensoren
│   │   ├── sensor-graphs/   # Endpunkte für Diagramme
│   ├── lib/                 # Hilfsfunktionen (Tuya-API, Token-Handling)
│   ├── components/          # Wiederverwendbare React-Komponenten
│   ├── layout.tsx           # Hauptlayout des Projekts
│   ├── page.tsx             # Startseite
├── public/                  # Statische Dateien (Icons, Bilder)
├── globals.css              # Globale CSS-Stile
├── tailwind.config.ts       # Tailwind-Konfiguration
├── tsconfig.json            # TypeScript-Konfiguration
└── .env                     # Umgebungsvariablen
```

## 🚀 Installation und Setup

### Voraussetzungen

- **Node.js** (>= 20.17.0)
- **PostgreSQL-Datenbank**
- **Tuya-Entwicklerkonto** mit gültigem API-Zugriff

### Schritte

1. **Repository klonen**:

   ```bash
   git clone https://github.com/<Ihr-Benutzername>/tuya-sensor-monitoring.git
   cd tuya-sensor-monitoring
   ```

2. **Abhängigkeiten installieren**:

   ```bash
   npm install
   ```

3. **Umgebungsvariablen konfigurieren**:
   Erstellen Sie eine .env-Datei und fügen Sie folgende Variablen hinzu:

   ```env
   TUYA_CLIENT_ID=<Ihr-Client-ID>
   TUYA_CLIENT_SECRET=<Ihr-Client-Secret>
   DATABASE_URL=postgresql://<Benutzer>:<Passwort>@<Host>:<Port>/<Datenbankname>
   ```

4. **Prisma konfigurieren**:

   ```bash
   npx prisma migrate dev
   ```

5. **Entwicklung starten**:
   ```bash
   npm run dev
   ```

## 📊 Diagramme

Die gespeicherten Daten werden als interaktive Diagramme angezeigt. Für die Implementierung können Bibliotheken wie **Chart.js** oder **ApexCharts** verwendet werden.

## ⚠️ Hinweise

- Stellen Sie sicher, dass der Tuya-API-Schlüssel und das Token regelmäßig aktualisiert werden.
- Der Datenabruf erfolgt standardmäßig alle 5 Minuten. Dies kann in der Datei `lib/tuyaApi.ts` angepasst werden.

## 📅 Roadmap

- **Hinzufügen von Alarmen bei bestimmten Schwellenwerten**:  
  Benachrichtigungen, wenn kritische Temperatur- oder Feuchtigkeitswerte überschritten werden.

- **Unterstützung für mehrere Geräte**:  
  Möglichkeit, mehrere Sensoren in der Anwendung zu integrieren und zu verwalten.

- **Export der Daten als CSV**:  
  Export gespeicherter Daten zur weiteren Analyse in externen Tools.

- **Berechnung von Durchschnittswerten (Tag, Monat, Jahr)**:  
  Automatische Berechnung von Durchschnittswerten für Temperatur und Luftfeuchtigkeit über verschiedene Zeiträume.

- **Integration von externen Wetterdaten**:  
  Einbindung von Temperatur- und Feuchtigkeitswerten eines externen Außensensors zum Vergleich mit Innenwerten.

- **Benachrichtigung über Lüftungsempfehlungen**:  
  Berechnung der Differenz zwischen Innen- und Außendaten und Versenden von Lüftungsempfehlungen bei Bedarf.

## 📄 Lizenz

Dieses Projekt steht unter der MIT-Lizenz. Weitere Informationen finden Sie in der Datei LICENSE.
