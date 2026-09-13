"""Check the download flow using a plain static server and Chromium."""
import pathlib
import threading
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from playwright.sync_api import sync_playwright

repo = pathlib.Path(__file__).resolve().parents[1]
class QuietHandler(SimpleHTTPRequestHandler):
    def log_message(self, *args):
        pass

with ThreadingHTTPServer(('127.0.0.1', 0), partial(QuietHandler, directory=str(repo))) as server:
    thread = threading.Thread(target=server.serve_forever, daemon=True)
    thread.start()
    try:
        with sync_playwright() as p:
            browser = p.chromium.launch(executable_path='/usr/bin/chromium', headless=True, args=['--no-sandbox'])
            page = browser.new_page()
            errors = []
            page.on('pageerror', lambda error: errors.append(str(error)))
            page.route('https://fonts.googleapis.com/**', lambda route: route.abort())
            cases = [('', None), ('?establishmentId=', None), ('?establishmentId=abc123', 'abc123'), ('?establishmentId=%20caf%C3%A9%2F%3F%23%26%25%2B%20', ' café/?#&%+ '), ('?establishmentId=%3Cimg%20src%3Dx%20onerror%3Dalert(1)%3E', '<img src=x onerror=alert(1)>')]
            from urllib.parse import unquote
            for width in [390, 1440]:
                page.set_viewport_size({'width': width, 'height': 900})
                for query, expected in cases:
                    page.goto(f'http://127.0.0.1:{server.server_port}/descarga.html' + query)
                    button = page.locator('#open-establishment')
                    assert button.is_visible() == (expected is not None)
                    if expected is not None:
                        href = button.get_attribute('href')
                        assert href.startswith('puesto://app/establishment/')
                        assert unquote(href.split('/establishment/')[1]) == expected
                    assert page.locator('.store-card.android').is_visible()
                    assert page.locator('.store-card.ios').is_visible()
                    assert page.evaluate('document.documentElement.scrollWidth <= innerWidth')
                    assert page.url.endswith('descarga.html' + query)
            assert not errors, errors
            page.goto(f'http://127.0.0.1:{server.server_port}/descarga.html?establishmentId=abc123')
            page.screenshot(path='/tmp/puesto-download-desktop.png', full_page=True, animations='disabled')
            browser.close()
            print('Browser: 10 desktop/mobile cases passed; stores visible, ID preserved, no overflow or JS errors')
    finally:
        server.shutdown()
        thread.join()
