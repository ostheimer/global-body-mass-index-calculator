# global-body-mass-index-calculator

WordPress-Plugin „Global Body Mass Index Calculator“ (Version 1.3, Slug `global-body-mass-index-calculator`): BMI-Rechner für Erwachsene und Kinder, metrisch oder imperial, per Shortcode `[gbmicalc]` oder Widget. Das Plugin liegt in der Repo-Wurzel (`gbmicalc.php`, Logik in `includes/class-gbmi-calculator.php`, Frontend in `js/` und `css/`, 24 EU-Sprachen in `languages/`). Kein Build, keine Tests, keine Workflows.

- Veröffentlichung: Dieses Repo ist die Quelle, WordPress.org-SVN die Auslieferung. `bin/sync-dist.sh` baut eine saubere Kopie nach `.wp-dist/<slug>/` (feste Ausschlussliste im Skript, parallel in `.distignore` gepflegt: neue Dev-Dateien in beiden eintragen, sonst landen sie im Plugin-ZIP). `bin/deploy-svn.sh` bereitet danach die SVN-Kopie unter `.svn-deploy/` vor (trunk, assets aus `.wporg-assets/`, Tag) und gibt nur den `svn commit`-Befehl aus; die Zugangsdaten kommen bei dessen Ausführung. Ein Merge auf `main` veröffentlicht nichts.
- Falle: `bin/deploy-svn.sh` hat `VERSION="1.3"` und die Commit-Nachricht fest eingebaut. Vor einem Release `VERSION` anpassen, `Version` in `gbmicalc.php` und `Stable tag` in `readme.txt` gleichziehen.
- Falle (Sicherheit): Version 1.3 behebt eine gespeicherte XSS-Lücke (CVE-2026-8883) über Shortcode- und Widget-Attribute. Attribute laufen deshalb über `shortcode_atts()` mit Bereinigung (`sanitize_text_field`, `sanitize_hex_color`, Integer-Casts) und die Ausgabe ist escaped; kein `extract()` auf Nutzereingaben.
- Übersetzungen: `bin/generate-translations.php` erzeugt die `.po`-Dateien aus der POT-Vorlage, die `.mo` entstehen mit `wp i18n make-mo`.
- Lokale Prüfung per `wp-env` laut `.wp-env.json` (bindet `.wp-dist/…` und Plugin Check ein).
- Offene Aufgaben für das nächste Release (Link-Umstellungen in `gbmicalc.php` und `readme.txt`) stehen in `ROADMAP.md`.
