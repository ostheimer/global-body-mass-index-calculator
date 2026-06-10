# Re-review request — reply to the plugins@wordpress.org closure thread

Send this as a **reply to the original closure email** (so the `{#HS:...#} (the ticket token from the original email)` ticket token stays in the subject and routes correctly), from the mailbox that received it.

**To:** plugins@wordpress.org
**Subject:** Re: [WordPress Plugin Directory] Closure Notice - Security: Global Body Mass Index Calculator {#HS:...#} (the ticket token from the original email)

---

Hello,

Thank you for the detailed report. Version 1.3 of Global Body Mass Index Calculator has been committed to SVN (trunk and tag 1.3, revision 3567508) and is ready for re-review.

1) Vulnerability remediation (CVE-2026-8883, stored XSS via the [gbmicalc] shortcode/widget)
- Removed @extract() on the untrusted shortcode/widget input entirely.
- Attributes are now whitelisted with shortcode_atts() and every value is sanitized (sanitize_text_field, sanitize_hex_color, integer casts for height/width).
- All output is context-escaped (esc_html()/esc_attr(), and a sanitized, esc_html()-wrapped inline style block for the colour/size values). I confirmed the exact PoC payload no longer breaks out of any attribute or element.

2) Security and coding-standards review
- I ran the Plugin Check plugin against 1.3 (all categories: General, Plugin Repo, Security, Performance, Accessibility) and it reports no errors and no warnings.
- Beyond the reported issue I also: moved the settings page and widget to the Settings API / WP_Widget with nonce and capability checks (the settings capability was corrected from add_users to manage_options); added an ABSPATH guard and uninstall.php; replaced the deprecated WP_PLUGIN_URL and direct script/style tags with proper enqueuing via plugins_url(); replaced the bundled colour picker with the built-in WordPress colour picker; removed bundled copies of jQuery and a dead script that called an external service; fixed the text domain to match the plugin slug; and fixed accessibility (associated labels, aria-live results, type=number inputs).

3) Plugin update
- Version incremented from 1.2 to 1.3; readme "Tested up to" updated to the current WordPress release.

Please let me know if anything else is needed.

Best regards,
Andreas Ostheimer (helpstring)
