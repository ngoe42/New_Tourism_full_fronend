"""
Diagnostic endpoint to test SEO and canonical issues
"""
from fastapi import APIRouter, Request
from fastapi.responses import JSONResponse
import httpx
import re
import socket
import ssl
import datetime

router = APIRouter(prefix="/diagnostic", tags=["Diagnostic"])

PRODUCTION_URL = "https://nelsontoursandsafaris.com"
STAGING_URL = "https://nelsontoursandsafaris.com"


async def fetch(url: str, follow_redirects: bool = True, timeout: int = 15):
    async with httpx.AsyncClient(verify=False, timeout=timeout) as client:
        return await client.get(url, follow_redirects=follow_redirects)


@router.get("/seo")
async def diagnostic_seo(request: Request):
    results = {
        "status": "running",
        "tests": {},
        "errors": [],
        "warnings": [],
        "recommendations": [],
    }

    # === TEST 1: Check 301 Redirect from Staging ===
    try:
        async with httpx.AsyncClient(verify=False, timeout=10) as client:
            resp = await client.get(
                f"{STAGING_URL}/",
                follow_redirects=False,
                headers={"User-Agent": "Googlebot"},
            )
            status = resp.status_code
            location = resp.headers.get("location", "")
            if status == 301 and PRODUCTION_URL in location:
                results["tests"]["redirect"] = {
                    "status": "PASS",
                    "message": f"301 redirects to {location}",
                }
            elif status == 301:
                results["tests"]["redirect"] = {
                    "status": "FAIL",
                    "message": f"301 redirects to wrong URL: {location}",
                }
                results["errors"].append("Redirect goes to wrong URL")
            else:
                results["tests"]["redirect"] = {
                    "status": "FAIL",
                    "message": f"Expected 301, got {status}",
                }
                results["errors"].append("No 301 redirect from staging")
    except Exception as e:
        results["tests"]["redirect"] = {"status": "ERROR", "message": str(e)}
        results["errors"].append(f"Redirect test failed: {str(e)}")

    # === TEST 2: Check Canonical Tag on Production ===
    try:
        resp = await fetch(f"{PRODUCTION_URL}/")
        match = re.search(
            r'<link\s+rel=["\']canonical["\']\s+href=["\']([^"\']+)["\']',
            resp.text,
            re.IGNORECASE,
        )
        if match:
            canonical = match.group(1)
            if PRODUCTION_URL in canonical:
                results["tests"]["canonical"] = {
                    "status": "PASS",
                    "message": f"Canonical set to: {canonical}",
                }
            else:
                results["tests"]["canonical"] = {
                    "status": "FAIL",
                    "message": f"Canonical points to wrong URL: {canonical}",
                }
                results["errors"].append(f"Canonical is {canonical}, not production")
        else:
            results["tests"]["canonical"] = {
                "status": "FAIL",
                "message": "No canonical tag found",
            }
            results["errors"].append("Missing canonical tag")
    except Exception as e:
        results["tests"]["canonical"] = {"status": "ERROR", "message": str(e)}
        results["errors"].append(f"Canonical test failed: {str(e)}")

    # === TEST 3: Check Sitemap ===
    try:
        resp = await fetch(f"{PRODUCTION_URL}/sitemap.xml")
        if resp.status_code == 200:
            has_staging = "railway.app" in resp.text
            if not has_staging:
                results["tests"]["sitemap"] = {
                    "status": "PASS",
                    "message": "Sitemap accessible, no staging URLs found",
                }
            else:
                count = resp.text.count("railway.app")
                results["tests"]["sitemap"] = {
                    "status": "FAIL",
                    "message": f"Sitemap contains {count} staging URL(s)",
                }
                results["errors"].append(f"Sitemap has {count} staging URL(s)")
                staging_urls = re.findall(
                    r"<loc>([^<]*railway\.app[^<]*)</loc>", resp.text
                )
                if staging_urls:
                    results["warnings"].append(
                        f"Staging URLs in sitemap: {staging_urls[:3]}"
                    )
        else:
            results["tests"]["sitemap"] = {
                "status": "FAIL",
                "message": f"Sitemap returned {resp.status_code}",
            }
            results["errors"].append("Sitemap not accessible")
    except Exception as e:
        results["tests"]["sitemap"] = {"status": "ERROR", "message": str(e)}
        results["errors"].append(f"Sitemap test failed: {str(e)}")

    # === TEST 4: Check Robots.txt ===
    try:
        resp = await fetch(f"{PRODUCTION_URL}/robots.txt")
        if resp.status_code == 200:
            if "Disallow: /" in resp.text:
                results["tests"]["robots"] = {
                    "status": "WARNING",
                    "message": "Robots.txt contains Disallow: / - may block crawling",
                }
                results["warnings"].append("Robots.txt disallows all crawling")
            else:
                results["tests"]["robots"] = {
                    "status": "PASS",
                    "message": "Robots.txt allows crawling",
                }
        else:
            results["tests"]["robots"] = {
                "status": "FAIL",
                "message": f"Robots.txt returned {resp.status_code}",
            }
            results["errors"].append("Robots.txt not accessible")
    except Exception as e:
        results["tests"]["robots"] = {"status": "ERROR", "message": str(e)}
        results["errors"].append(f"Robots.txt test failed: {str(e)}")

    # === TEST 5: Check Response Headers ===
    try:
        resp = await fetch(f"{PRODUCTION_URL}/")
        headers = dict(resp.headers)
        results["tests"]["headers"] = {
            "status": "INFO",
            "message": "Headers retrieved",
            "data": {
                "content-type": headers.get("content-type", "MISSING"),
                "x-robots-tag": headers.get("x-robots-tag", "MISSING"),
                "link": headers.get("link", "MISSING"),
                "x-frame-options": headers.get("x-frame-options", "MISSING"),
                "cache-control": headers.get("cache-control", "MISSING"),
            },
        }
        if "noindex" in headers.get("x-robots-tag", "").lower():
            results["errors"].append("X-Robots-Tag header contains noindex")
            results["tests"]["headers"]["status"] = "FAIL"
    except Exception as e:
        results["tests"]["headers"] = {"status": "ERROR", "message": str(e)}
        results["errors"].append(f"Headers test failed: {str(e)}")

    # === TEST 6: Check Hreflang Tags ===
    try:
        resp = await fetch(f"{PRODUCTION_URL}/")
        hreflang = re.findall(
            r'<link\s+rel=["\']alternate["\']\s+href=["\']([^"\']+)["\']',
            resp.text,
            re.IGNORECASE,
        )
        if hreflang:
            results["tests"]["hreflang"] = {
                "status": "INFO",
                "message": f"Found {len(hreflang)} hreflang tags",
            }
            for url in hreflang:
                if "railway.app" in url:
                    results["warnings"].append(f"Hreflang contains staging URL: {url}")
        else:
            results["tests"]["hreflang"] = {
                "status": "INFO",
                "message": "No hreflang tags found",
            }
    except Exception as e:
        results["tests"]["hreflang"] = {"status": "ERROR", "message": str(e)}

    # === TEST 7: Check Open Graph Tags ===
    try:
        resp = await fetch(f"{PRODUCTION_URL}/")
        og_match = re.search(
            r'<meta\s+property=["\']og:url["\']\s+content=["\']([^"\']+)["\']',
            resp.text,
            re.IGNORECASE,
        )
        if og_match:
            og_url = og_match.group(1)
            if "railway.app" in og_url:
                results["tests"]["og"] = {
                    "status": "FAIL",
                    "message": f"OG:URL points to staging: {og_url}",
                }
                results["errors"].append("Open Graph URL is staging")
            else:
                results["tests"]["og"] = {
                    "status": "PASS",
                    "message": f"OG:URL set to: {og_url}",
                }
        else:
            results["tests"]["og"] = {
                "status": "INFO",
                "message": "No OG:URL tag found",
            }
    except Exception as e:
        results["tests"]["og"] = {"status": "ERROR", "message": str(e)}

    # === TEST 8: Check JSON-LD for staging URLs ===
    try:
        resp = await fetch(f"{PRODUCTION_URL}/")
        jsonld_blocks = re.findall(
            r"<script\s+type=[\"']application/ld\+json[\"']>(.+?)</script>",
            resp.text,
            re.IGNORECASE | re.DOTALL,
        )
        if jsonld_blocks:
            staging_found = False
            for block in jsonld_blocks:
                if "railway.app" in block:
                    staging_found = True
                    break
            if staging_found:
                results["tests"]["jsonld"] = {
                    "status": "WARNING",
                    "message": "JSON-LD contains staging URL(s)",
                }
                results["warnings"].append("JSON-LD contains staging URL")
            else:
                results["tests"]["jsonld"] = {
                    "status": "PASS",
                    "message": "JSON-LD doesn't contain staging URLs",
                }
        else:
            results["tests"]["jsonld"] = {
                "status": "INFO",
                "message": "No JSON-LD found",
            }
    except Exception as e:
        results["tests"]["jsonld"] = {"status": "ERROR", "message": str(e)}

    # === TEST 9: Check DNS Resolution ===
    try:
        ip = socket.gethostbyname("nelsontoursandsafaris.com")
        results["tests"]["dns"] = {
            "status": "INFO",
            "message": f"DNS resolves to: {ip}",
        }
    except Exception as e:
        results["tests"]["dns"] = {"status": "ERROR", "message": str(e)}
        results["errors"].append(f"DNS resolution failed: {str(e)}")

    # === TEST 10: Check SSL Certificate ===
    try:
        ctx = ssl.create_default_context()
        with socket.create_connection(
            ("nelsontoursandsafaris.com", 443), timeout=10
        ) as sock:
            with ctx.wrap_socket(sock, server_hostname="nelsontoursandsafaris.com") as ssock:
                cert = ssock.getpeercert()
                expiry = datetime.datetime.strptime(
                    cert["notAfter"], "%b %d %H:%M:%S %Y %Z"
                )
                days_left = (expiry - datetime.datetime.now()).days
                if days_left > 30:
                    results["tests"]["ssl"] = {
                        "status": "PASS",
                        "message": f"SSL valid for {days_left} days",
                    }
                else:
                    results["tests"]["ssl"] = {
                        "status": "WARNING",
                        "message": f"SSL expires in {days_left} days",
                    }
                    results["warnings"].append("SSL certificate expiring soon")
    except Exception as e:
        results["tests"]["ssl"] = {"status": "ERROR", "message": str(e)}
        results["errors"].append(f"SSL test failed: {str(e)}")

    # === TEST 11: Staging Robots.txt ===
    try:
        async with httpx.AsyncClient(verify=False, timeout=10) as client:
            resp = await client.get(
                f"{STAGING_URL}/robots.txt",
                follow_redirects=True,
            )
            if "Disallow: /" in resp.text:
                results["tests"]["staging_robots"] = {
                    "status": "PASS",
                    "message": "Staging robots.txt blocks crawling",
                }
            else:
                results["tests"]["staging_robots"] = {
                    "status": "WARNING",
                    "message": "Staging robots.txt does NOT block crawling",
                }
                results["warnings"].append("Staging robots.txt should Disallow: /")
    except Exception as e:
        results["tests"]["staging_robots"] = {
            "status": "ERROR",
            "message": str(e),
        }

    # === SUMMARY ===
    total = len(results["tests"])
    passed = sum(
        1 for t in results["tests"].values() if t.get("status") == "PASS"
    )
    failed = sum(
        1 for t in results["tests"].values() if t.get("status") == "FAIL"
    )
    warns = sum(
        1 for t in results["tests"].values() if t.get("status") == "WARNING"
    )

    results["summary"] = {
        "total_tests": total,
        "passed": passed,
        "failed": failed,
        "warnings": warns,
        "errors_count": len(results["errors"]),
        "warnings_count": len(results["warnings"]),
    }

    if results["errors"]:
        results["recommendations"].append("Fix the errors listed above")
    if results.get("tests", {}).get("redirect", {}).get("status") != "PASS":
        results["recommendations"].append(
            "Fix 301 redirect from staging to production"
        )
    if results.get("tests", {}).get("canonical", {}).get("status") != "PASS":
        results["recommendations"].append(
            "Fix canonical tag to point to production URL"
        )
    if results.get("tests", {}).get("sitemap", {}).get("status") != "PASS":
        results["recommendations"].append(
            "Remove all staging URLs from sitemap"
        )
    if not results["errors"] and not results["warnings"]:
        results["recommendations"].append(
            "All tests passed. Submit sitemap to Google Search Console"
        )
        results["recommendations"].append(
            "Request re-indexing in URL Inspection tool"
        )
        results["status"] = "PASS"
    else:
        results["status"] = "FAIL"

    return JSONResponse(results)
