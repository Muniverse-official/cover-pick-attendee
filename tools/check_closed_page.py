#!/usr/bin/env python3
"""Guard the approved FANS PICK closure page, then verify the published URL.

Reopening requires an intentional update to both the homepage and this guard.
No database access or registration submissions are performed by these checks.
"""
from __future__ import annotations

import argparse
import hashlib
from html.parser import HTMLParser
import os
from pathlib import Path
import shutil
import subprocess
import tempfile
import time
from urllib.parse import urljoin, urlsplit
from urllib.request import Request, urlopen

ROOT = Path(__file__).resolve().parents[1]
PUBLIC_URL = "https://muniverse-official.github.io/cover-pick-attendee/"
TITLE = "방청 발표가 마감되었습니다."
DESCRIPTION = "다가오는 다음 팬즈픽을 기대해주세요!"


class Page(HTMLParser):
    def __init__(self) -> None:
        super().__init__()
        self.ids: set[str] = set()
        self.assets: list[str] = []
        self.scripts: list[str] = []
        self.inputs = 0
        self.closed = False

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        values = dict(attrs)
        self.ids.add(values.get("id") or "")
        self.inputs += tag in {"input", "textarea", "form", "button"}
        if tag == "html":
            self.closed = values.get("data-page-state") == "closed"
        if tag == "link" and values.get("rel") == "stylesheet":
            self.assets.append(values.get("href") or "")
        if tag == "script":
            self.scripts.append(values.get("src") or "")
            self.assets.append(values.get("src") or "")


def validate(raw: bytes) -> Page:
    text = raw.decode("utf-8")
    page = Page()
    page.feed(text)
    if not page.closed or not {"closedCard", "closedTitle", "closedDesc"} <= page.ids:
        raise ValueError("Approved closed-page markup is missing")
    if TITLE not in text or DESCRIPTION not in text:
        raise ValueError("Approved Korean closure copy is missing")
    if page.inputs or {"step1", "step2", "verifyBtn", "submitBtn"} & page.ids:
        raise ValueError("Registration controls have reappeared on the closed homepage")
    if [urlsplit(s).path for s in page.scripts] != ["./closed-page.js"]:
        raise ValueError("Only the display-only closed-page script may run")
    if "connect-src 'none'" not in text:
        raise ValueError("The closed homepage must not call registration APIs")
    return page


def fetch(url: str) -> bytes:
    request = Request(url, headers={"User-Agent": "FANS-PICK-Pages-Verification/1.0"})
    with urlopen(request, timeout=12) as response:
        if response.status != 200:
            raise ValueError(f"HTTP {response.status}: {url}")
        return response.read()


def capture(url: str, output: Path) -> None:
    chrome = next((p for n in ("google-chrome", "google-chrome-stable", "chromium")
                   if (p := shutil.which(n))), None)
    if not chrome:
        raise RuntimeError("Chrome is required for published-page screenshot verification")
    output.mkdir(parents=True, exist_ok=True)
    for label, size in (("desktop", "1000,850"), ("mobile", "390,844")):
        with tempfile.TemporaryDirectory(prefix="fans-pick-browser-") as profile:
            result = subprocess.run([
                chrome, "--headless", "--no-sandbox", "--disable-gpu",
                "--disable-dev-shm-usage", "--no-first-run", "--no-default-browser-check",
                "--hide-scrollbars", "--force-device-scale-factor=1",
                f"--user-data-dir={profile}", f"--window-size={size}",
                "--virtual-time-budget=5000", "--dump-dom",
                f"--screenshot={output / ('fans-pick-closed-' + label + '.png')}", url,
            ], capture_output=True, timeout=60, check=True)
            validate(result.stdout)
            (output / f"{label}-dom.html").write_bytes(result.stdout)
            if not (output / f"fans-pick-closed-{label}.png").is_file():
                raise RuntimeError(f"Missing {label} screenshot")
            print(f"LIVE BROWSER PASS: {label}; closed copy present; registration inputs=0", flush=True)


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--url", help="Exact production URL returned by deploy-pages")
    parser.add_argument("--screenshots", type=Path)
    args = parser.parse_args()
    expected = (ROOT / "index.html").read_bytes()
    page = validate(expected)
    for asset in page.assets:
        if not asset.startswith("./") or not (ROOT / urlsplit(asset).path).is_file():
            raise ValueError(f"Missing or nonlocal page asset: {asset}")
    print("SOURCE PASS: closed copy present; registration inputs=0", flush=True)
    if not args.url:
        return
    if args.url.rstrip("/") + "/" != PUBLIC_URL:
        raise ValueError(f"Refusing to verify a different site: {args.url}")
    digest = hashlib.sha256(expected).hexdigest()
    fresh_url = PUBLIC_URL + "?v=" + digest[:16]
    deadline = time.monotonic() + 230
    while True:
        try:
            # Both the ordinary user URL and a fresh URL must serve this exact build.
            for url in (PUBLIC_URL, fresh_url):
                raw = fetch(url)
                validate(raw)
                if raw != expected:
                    raise ValueError(f"Published HTML differs from this build: {url}")
            for asset in page.assets:
                if fetch(urljoin(PUBLIC_URL, asset)) != (ROOT / urlsplit(asset).path).read_bytes():
                    raise ValueError(f"Published asset differs from this build: {asset}")
            break
        except Exception as error:
            if time.monotonic() >= deadline:
                raise RuntimeError("Published page did not converge to the approved closure build") from error
            print(f"Waiting for publication: {error}", flush=True)
            time.sleep(8)
    print(f"LIVE HTTP PASS: {PUBLIC_URL}; exact HTML and CSS/JS match; sha256={digest}", flush=True)
    if args.screenshots:
        capture(PUBLIC_URL, args.screenshots)
    summary = os.environ.get("GITHUB_STEP_SUMMARY")
    if summary:
        with open(summary, "a", encoding="utf-8") as stream:
            stream.write(f"## FANS PICK closure verified\n\nURL: {PUBLIC_URL}\n\n"
                         f"- {TITLE}\n- {DESCRIPTION}\n- Registration inputs: 0\n"
                         f"- Deployed HTML/CSS/JS match this commit\n- SHA-256: `{digest}`\n")


if __name__ == "__main__":
    main()
