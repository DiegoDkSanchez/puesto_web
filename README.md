# Puesto website

## QR flow through the website

Keep hosting on GitHub Pages. Establishment QR codes must contain:

```text
https://puesto-app.xyz/descarga.html?establishmentId=ESTABLISHMENT_ID
```

URL-encode the ID when generating the QR URL. Scanning the QR opens the download page. With a non-empty ID, the page shows **Abrir en Puesto**, linking to `puesto://app/establishment/<URL-encoded ID>`. Opening the app requires an explicit tap and an installed app. Both store buttons remain visible. After installing, users return to this page and tap the button, or scan the QR again. Store installation does not preserve the ID automatically.

The page never automatically launches the app, redirects to a store, or runs installation-detection timers. Without an ID (or with an empty/whitespace-only ID), it remains the normal download page. Without JavaScript the store links still work.

`URLSearchParams.get` decodes the first `establishmentId` parameter once. Valid IDs retain their exact decoded value, including surrounding whitespace, and are encoded with `encodeURIComponent` for the custom-scheme path. Untrusted IDs are never inserted as HTML.

## Flutter app contract

- Generate HTTPS QR links to the download page above, encoding the ID as a query parameter. Do not put the custom scheme directly in the QR.
- Register the `puesto://` custom scheme on Android and iOS.
- Handle host `app` and path `/establishment/<encoded ID>` on cold start and while the app is running. Decode the ID once and navigate to that establishment; retain the destination through login if needed.
- To keep QR scans going through the website, do not register `/descarga.html` for Android App Links or iOS Universal Links. Remove any existing HTTPS association/intent-filter coverage for this URL in the app configuration. Previously installed app versions may retain existing associations; website changes alone cannot override them.

This manual flow needs no verification JSON files, signing identifiers, proxy, or hosting migration. The former association templates and Nginx configuration have been removed.

## Publish

Publish the changed `descarga.html` and new `download.js` with the existing assets through the repository's normal GitHub Pages process. No DNS or hosting settings need changing. These local edits are not published until deployed.

After publishing, scan a QR with Puesto installed and uninstalled on both Android and iPhone. Confirm the web page opens first, the manual button reaches the right establishment, and returning after installation works.

## Tests

Run `node tests/download-links.cjs` for missing, empty, whitespace-only, ordinary, Unicode, reserved-character, percent-encoded, hostile-markup, and duplicate IDs.

Run `python3 tests/browser-download.py` for desktop/mobile browser checks. It requires Python Playwright and `/usr/bin/chromium`, uses a temporary local static server, and checks that the page stays open, store links remain visible, and the custom-scheme URL preserves the ID. It saves a screenshot at `/tmp/puesto-download-desktop.png`. Real app launching requires device testing.
