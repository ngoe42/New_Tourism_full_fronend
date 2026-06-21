#!/usr/bin/env python3
"""
audit_canonicals.py — Comprehensive canonicalization audit for nelsontoursandsafaris.com

Checks:
  1. All public pages have correct self-referencing canonical tags
  2. No conflicting canonical signals (redirect + canonical mismatch)
  3. Redirect chains resolve to canonical URLs
  4. Sitemap URLs match canonical choices
  5. www, trailing slash, case variants all redirect correctly

Usage:
  python3 scripts/audit_canonicals.py [--base-url https://nelsontoursandsafaris.com]
"""
import argparse
import re
import sys
import urllib.parse
from typing import Optional

import requests

BASE_URL = "https://nelsontoursandsafaris.com"

PUBLIC_PATHS = [
    "/", "/tours", "/routes", "/experiences", "/blog", "/about",
    "/kilimanjaro", "/trekking", "/meru", "/oldoinyo-lengai",
    "/safari", "/contact",
]

TRACKING_PARAM = "?utm_source=facebook&fbclid=abc123&ref=newsletter"

VARIANT_CHECKS = {
    "www": "https://www.nelsontoursandsafaris.com/",
    "trailing-slash": f"{BASE_URL}/tours/",
    "uppercase": f"{BASE_URL}/Tours",
    "uppercase-trailing": f"{BASE_URL}/TOURS/",
    "http": f"http://{BASE_URL}/",
    "tracking": f"{BASE_URL}/tours{TRACKING_PARAM}",
}


class AuditResult:
    def __init__(self):
        self.passes = 0
        self.fails = 0
        self.warnings = 0
        self.errors: list[str] = []

    def passed(self, msg: str):
        self.passes += 1
        print(f"  \033[32m✓\033[0m {msg}")

    def failed(self, msg: str):
        self.fails += 1
        self.errors.append(msg)
        print(f"  \033[31m✗\033[0m {msg}")

    def warned(self, msg: str):
        self.warnings += 1
        print(f"  \033[33m⚠\033[0m {msg}")

    def summary(self):
        print(f"\n{'='*50}")
        print(f"  \033[32mPasses: {self.passes}\033[0m")
        print(f"  \033[31mFails:  {self.fails}\033[0m")
        print(f"  \033[33mWarnings: {self.warnings}\033[0m")
        print(f"{'='*50}")
        return self.fails


def fetch_canonical(url: str, timeout: int = 10) -> tuple[Optional[str], Optional[str], int]:
    """Fetch a URL and extract its canonical tag. Returns (canonical_url, final_url, status_code)."""
    try:
        resp = requests.get(url, timeout=timeout, allow_redirects=True)
        final_url = resp.url
        html = resp.text
        match = re.search(r'<link\s+rel=["\']canonical["\']\s+href=["\']([^"\']+)["\']', html, re.IGNORECASE)
        canonical = match.group(1) if match else None
        return canonical, final_url, resp.status_code
    except requests.RequestException as e:
        return None, None, 0


def check_redirect_chain(url: str, timeout: int = 10) -> tuple[list[str], int]:
    """Follow redirect chain without following to final. Returns (chain, final_status)."""
    chain = []
    current = url
    for _ in range(10):
        try:
            resp = requests.get(current, timeout=timeout, allow_redirects=False)
            if resp.status_code in (301, 302, 307, 308):
                chain.append(f"{resp.status_code} → {resp.headers.get('Location', '?')}")
                next_url = resp.headers.get("Location", "")
                current = urllib.parse.urljoin(current, next_url)
            else:
                chain.append(f"{resp.status_code} (final)")
                return chain, resp.status_code
        except requests.RequestException as e:
            chain.append(f"ERROR: {e}")
            return chain, 0
    chain.append("LOOP DETECTED (>10 hops)")
    return chain, 0


def main():
    parser = argparse.ArgumentParser(description="Audit canonical tags on nelsontoursandsafaris.com")
    parser.add_argument("--base-url", default=BASE_URL, help="Base URL to check")
    args = parser.parse_args()

    result = AuditResult()
    base = args.base_url.rstrip("/")

    print(f"\n\033[1mCanonicalization Audit for {base}\033[0m\n")

    # ── 1. Public page canonical tags ──
    print("\033[1m1. Public Page Canonical Tags\033[0m")
    for path in PUBLIC_PATHS:
        url = f"{base}{path}"
        canonical, final, status = fetch_canonical(url)
        expected = f"{base}{path}"
        if not canonical:
            result.failed(f"{url} → no canonical tag (HTTP {status})")
        elif canonical == expected:
            result.passed(f"{url} → canonical: {canonical}")
        elif canonical.rstrip("/") == expected.rstrip("/"):
            result.warned(f"{url} → canonical has trailing slash difference: {canonical}")
        else:
            result.failed(f"{url} → canonical mismatch: expected {expected}, got {canonical}")

    # ── 2. Variant redirects ──
    print("\n\033[1m2. URL Variant Redirects\033[0m")
    
    print("  Checking www...")
    chain, status = check_redirect_chain(VARIANT_CHECKS["www"])
    expected_chain = (
        "301 → https://nelsontoursandsafaris.com/",
        "200 (final)"
    )
    if chain[0].startswith("301") and chain[-1].startswith("200"):
        result.passed(f"www redirects: {' → '.join(chain)}")
    else:
        result.failed(f"www redirect chain: {' → '.join(chain)}")

    print("  Checking trailing slash...")
    chain, status = check_redirect_chain(VARIANT_CHECKS["trailing-slash"])
    if chain[0].startswith("301") and "tours" in chain[0] and not chain[0].rstrip("/").endswith("tours/"):
        result.passed(f"trailing slash redirects: {' → '.join(chain)}")
    else:
        result.warned(f"trailing slash chain: {' → '.join(chain)}")

    print("  Checking uppercase...")
    chain, status = check_redirect_chain(VARIANT_CHECKS["uppercase"])
    if chain[0].startswith("301") and "tours" in chain[0].lower() and "TOURS" not in chain[0]:
        result.passed(f"uppercase redirects: {' → '.join(chain)}")
    else:
        result.warned(f"uppercase chain: {' → '.join(chain)}")

    print("  Checking uppercase + trailing...")
    chain, status = check_redirect_chain(VARIANT_CHECKS["uppercase-trailing"])
    if chain[0].startswith("301"):
        result.passed(f"uppercase+trailing redirects: {' → '.join(chain)}")
    else:
        result.warned(f"uppercase+trailing chain: {' → '.join(chain)}")

    print("  Checking HTTP→HTTPS...")
    chain, status = check_redirect_chain(VARIANT_CHECKS["http"])
    if any("https" in hop for hop in chain):
        result.passed(f"HTTP redirects: {' → '.join(chain)}")
    else:
        result.warned(f"HTTP chain: {' → '.join(chain)}")

    # ── 3. Tracking param canonical ──
    print("\n\033[1m3. Tracking Parameter Canonical\033[0m")
    canonical, final, status = fetch_canonical(VARIANT_CHECKS["tracking"])
    expected = f"{base}/tours"
    if canonical == expected:
        result.passed(f"URL with tracking params → canonical: {canonical}")
    else:
        result.failed(f"URL with tracking params → expected {expected}, got {canonical}")

    # ── 4. Dynamic page canonical (if reachable) ──
    print("\n\033[1m4. Dynamic Page Sample (if tours exist)\033[0m")
    try:
        tours_resp = requests.get(f"{base}/tours", timeout=10)
        tour_links = re.findall(r'href="(/tours/[^"\']+)"', tours_resp.text)
        if tour_links:
            sample_slug = tour_links[0]
            sample_url = f"{base}{sample_slug}"
            canonical, final, status = fetch_canonical(sample_url)
            expected = f"{base}{sample_slug}"
            if canonical == expected:
                result.passed(f"{sample_slug} → canonical: {canonical}")
            elif canonical:
                result.failed(f"{sample_slug} → canonical mismatch: {canonical}")
            else:
                result.failed(f"{sample_slug} → no canonical tag")
        else:
            result.warned("No tour links found on /tours to sample")
    except requests.RequestException:
        result.warned("Could not reach /tours to sample dynamic pages")

    # ── 5. Sitemap canonical consistency ──
    print("\n\033[1m5. Sitemap URL Consistency\033[0m")
    try:
        sm_resp = requests.get(f"{base}/sitemap.xml", timeout=10)
        if sm_resp.status_code == 200:
            sitemap_urls = re.findall(r'<loc>([^<]+)</loc>', sm_resp.text)
            result.passed(f"Sitemap accessible: {len(sitemap_urls)} URLs")
            
            print(f"    Checking first 5 sitemap URLs...")
            for sm_url in sitemap_urls[:5]:
                canonical, final, status = fetch_canonical(sm_url)
                if canonical == sm_url:
                    result.passed(f"  {sm_url}")
                elif canonical and canonical.rstrip("/") == sm_url.rstrip("/"):
                    result.warned(f"  {sm_url} → canonical has slash mismatch: {canonical}")
                else:
                    result.failed(f"  {sm_url} → canonical mismatch: {canonical}")
        else:
            result.failed(f"Sitemap returned HTTP {sm_resp.status_code}")
    except requests.RequestException:
        result.failed("Could not fetch sitemap.xml")

    # ── 6. No conflicting signals ──
    print("\n\033[1m6. Conflicting Signal Check\033[0m")
    for path in PUBLIC_PATHS:
        url = f"{base}{path}"
        try:
            resp = requests.get(url, timeout=10, allow_redirects=False)
            if resp.status_code in (301, 302):
                location = resp.headers.get("Location", "")
                # Also check canonical tag (would require following redirect, but that shows redirect target)
                html = resp.text
                canonical = re.search(r'<link\s+rel=["\']canonical["\']\s+href=["\']([^"\']+)["\']', html, re.IGNORECASE)
                if canonical and canonical.group(1) != location:
                    result.failed(f"{url} → redirects to {location} but canonical is {canonical.group(1)}")
                else:
                    result.passed(f"{url} → redirect {resp.status_code} → {location}")
            else:
                result.passed(f"{url} → no redirect (HTTP {resp.status_code})")
        except requests.RequestException:
            result.warned(f"{url} → unreachable")

    return result.summary()


if __name__ == "__main__":
    sys.exit(main())
