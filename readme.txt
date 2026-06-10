=== Global Body Mass Index Calculator ===
Contributors: helpstring
Tags: bmi, calculator, body mass index, health, fitness
Requires at least: 5.7
Tested up to: 7.0
Requires PHP: 7.2
Stable tag: 1.3
License: GPLv2 or later
License URI: https://www.gnu.org/licenses/gpl-2.0.html

BMI calculator for adults and children — add it with the [gbmicalc] shortcode or a widget, in a colour-customisable, fully translatable interface.

== Description ==

Global Body Mass Index Calculator adds a clean, responsive Body Mass Index calculator to your WordPress site. Visitors can work out the BMI for an adult or a child, switch between imperial and metric units, and see a clear, plain-language result — all without leaving your page.

Drop it anywhere with the `[gbmicalc]` shortcode or the "BMI Calculator" widget/block.

**Features**

* Separate calculators for adults and children, on two tabs.
* Imperial (feet, inches, pounds) or metric (centimetres, kilograms) units.
* Plain-language result with the weight-status category — and, for children, the BMI-for-age percentile.
* Colour-customisable (card, text, tabs and button) through the built-in WordPress colour picker, with an adjustable size.
* Responsive layout that adapts from desktop to mobile.
* Works both as a shortcode and as a widget/block.
* Translation-ready, with bundled translations for the 24 official languages of the European Union.
* Accessible markup: labelled fields, results announced to screen readers, keyboard-friendly tabs.

**How the categories are determined**

* Adults: the standard WHO BMI ranges (underweight, normal, overweight, obese).
* Children and teens (2–20 years): the BMI is interpreted against CDC BMI-for-age percentiles.

**Disclaimer**

This plugin is provided for general information only and is not medical advice. BMI is a screening tool, not a diagnosis, and it does not account for muscle mass, body composition, pregnancy or other factors. Always consult a qualified healthcare professional about your health.

**Links**

[Demo](https://www.ostheimer.at/wordpress-plugins/global-body-mass-index/) · [More plugins by Ostheimer](https://www.ostheimer.at/leistungen-preise/wordpress/wordpress-plugins/)

== Installation ==

1. Install the plugin from the Plugins screen in WordPress, or upload the `global-body-mass-index-calculator` folder to `/wp-content/plugins/`.
1. Activate the plugin through the 'Plugins' menu.
1. Add the `[gbmicalc]` shortcode to a post or page, or add the "BMI Calculator" widget/block to a widget area.
1. Optionally adjust the defaults under Settings → BMI Calculator.

== Frequently Asked Questions ==

= How do I add the calculator to a page? =

Insert the `[gbmicalc]` shortcode into any post or page, or add the "BMI Calculator" widget/block to a widget area.

= Can I switch between imperial and metric units? =

Yes. Choose Standard (feet, inches, pounds) or Metric (centimetres, kilograms) on the settings page, or per widget.

= How accurate is the child calculator? =

For children and teens aged 2–20, the BMI is interpreted using the CDC BMI-for-age percentile method, which is the standard approach for that age group. It is a screening indicator, not a diagnosis.

= Can I change the colours and size? =

Yes. The settings page and each widget expose colour pickers (background gradient, text, button, and the active/inactive tabs) and width/height fields.

= Does it work in the block editor and block themes? =

Yes. Use the shortcode in a Shortcode block, or add the widget through the block-based widgets screen. It has been tested with block themes.

= Is it available in my language? =

The plugin ships with translations for all 24 official EU languages and is fully translation-ready; you can also translate it at translate.wordpress.org. The bundled translations are machine-assisted starting points and native-speaker contributions are very welcome.

== Screenshots ==

1. Adult calculator with a result, on the front end.
2. The child calculator tab.
3. The calculator on a narrow (mobile) screen.
4. The settings page: mode, size and colours.
5. The calculator in German — one of the 24 bundled EU languages.

== Changelog ==

= 1.3 =
* Redesigned the front end: modern, mobile-responsive layout, clearer active/inactive tabs, a single heading, accessible labelled fields and announced results.
* Security: fixed a stored Cross-Site Scripting (XSS) vulnerability in the `[gbmicalc]` shortcode and widget (CVE-2026-8883); all attributes and saved options are now whitelisted, sanitised and escaped on output.
* Security: the settings page and widget now use the WordPress Settings API and WP_Widget, with nonce and capability checks.
* Fixed the child weight-status logic (the overweight/obese categories were unreachable) and added input validation so blank, zero or negative entries no longer produce a misleading result.
* Result sentences are now self-contained, properly translatable templates.
* Replaced the legacy widget with the modern WP_Widget API; replaced WP_PLUGIN_URL and direct script/style tags with proper enqueuing; replaced the bundled colour picker with the built-in WordPress colour picker; removed bundled copies of jQuery.
* Fixed the text domain to match the plugin slug and added bundled translations for all 24 official languages of the European Union.
* Tested up to WordPress 7.0.

= 1.2 =
* JS bugs fix

= 1.1 =
* Tested up to WordPress 5.1

= 1.0.7.0 =
* Tested up to WordPress 3.5
* Translation fixed

= 1.0.6.0 =
* Critical error fixed

= 1.0.5.0 =
* Fixed many bugs

= 1.0.1.0 =
* Initial Release

== Upgrade Notice ==

= 1.3 =
Security release: fixes a stored XSS vulnerability (CVE-2026-8883), fixes the child weight-status categories, and modernises the UI. All users should update.
