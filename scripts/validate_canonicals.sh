#!/usr/bin/env bash
set -euo pipefail

# validate_canonicals.sh — Verify canonical tags, redirects, and chains
# Usage: ./scripts/validate_canonicals.sh

BASE_URL="${1:-https://nelsontoursandsafaris.com}"
PASS=0
FAIL=0
WARN=0

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

check_url() {
    local url="$1"
    local expected_canonical="$2"

    echo -n "  Checking: $url ... "

    local http_code
    local final_url
    local canonical

    http_code=$(curl -sL -o /tmp/_canonical_body -w "%{http_code}" --max-time 10 "$url" 2>/dev/null || echo "000")
    final_url=$(curl -sL -o /dev/null -w "%{url_effective}" --max-time 10 "$url" 2>/dev/null || echo "")
    canonical=$(grep -oP '<link rel="canonical" href="\K[^"]+' /tmp/_canonical_body 2>/dev/null || echo "")

    if [[ "$http_code" == "000" ]]; then
        echo -e "${RED}FAIL (unreachable)${NC}"
        FAIL=$((FAIL + 1))
        return
    fi

    if [[ "$http_code" -ge 400 ]]; then
        echo -e "${RED}FAIL (HTTP $http_code)${NC}"
        FAIL=$((FAIL + 1))
        return
    fi

    if [[ -z "$canonical" ]]; then
        echo -e "${RED}FAIL (no canonical tag)${NC}"
        FAIL=$((FAIL + 1))
        return
    fi

    if [[ "$canonical" != "$expected_canonical" ]]; then
        echo -e "${RED}FAIL (canonical mismatch: got \"$canonical\", expected \"$expected_canonical\")${NC}"
        FAIL=$((FAIL + 1))
        return
    fi

    echo -e "${GREEN}PASS${NC}"
    PASS=$((PASS + 1))
}

check_redirect() {
    local url="$1"
    local expected_status="$2"
    local expected_location="$3"

    echo -n "  Redirect: $url ... "

    local http_code
    local location

    http_code=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 "$url" 2>/dev/null || echo "000")
    location=$(curl -s -o /dev/null -w "%{redirect_url}" --max-time 10 "$url" 2>/dev/null || echo "")

    if [[ "$http_code" == "000" ]]; then
        echo -e "${RED}FAIL (unreachable)${NC}"
        FAIL=$((FAIL + 1))
        return
    fi

    if [[ "$http_code" != "$expected_status" ]]; then
        echo -e "${RED}FAIL (status $http_code, expected $expected_status)${NC}"
        FAIL=$((FAIL + 1))
        return
    fi

    if [[ -n "$expected_location" ]] && [[ "$location" != "$expected_location" ]] && [[ "$location" != "$expected_location/" ]]; then
        echo -e "${YELLOW}WARN (redirect location \"$location\", expected \"$expected_location\")${NC}"
        WARN=$((WARN + 1))
    else
        echo -e "${GREEN}PASS${NC}"
        PASS=$((PASS + 1))
    fi
}

echo "========================================"
echo " Canonialization Validation"
echo " Base URL: $BASE_URL"
echo "========================================"
echo ""

echo "--- Canonical Tags ---"
check_url "$BASE_URL/" "$BASE_URL/"
check_url "$BASE_URL/tours" "$BASE_URL/tours"
check_url "$BASE_URL/routes" "$BASE_URL/routes"
check_url "$BASE_URL/experiences" "$BASE_URL/experiences"
check_url "$BASE_URL/blog" "$BASE_URL/blog"
check_url "$BASE_URL/about" "$BASE_URL/about"
check_url "$BASE_URL/kilimanjaro" "$BASE_URL/kilimanjaro"
check_url "$BASE_URL/trekking" "$BASE_URL/trekking"
check_url "$BASE_URL/meru" "$BASE_URL/meru"
check_url "$BASE_URL/oldoinyo-lengai" "$BASE_URL/oldoinyo-lengai"
check_url "$BASE_URL/safari" "$BASE_URL/safari"
check_url "$BASE_URL/contact" "$BASE_URL/contact"

echo ""
echo "--- Redirects ---"
check_redirect "http://$BASE_URL/" 301 "https://$BASE_URL/"
check_redirect "https://www.$BASE_URL/" 301 "https://$BASE_URL/"
check_redirect "$BASE_URL/Tours" 301 "$BASE_URL/tours"
check_redirect "$BASE_URL/tours/" 301 "$BASE_URL/tours"
check_redirect "$BASE_URL/TOURS/" 301 "$BASE_URL/tours"

echo ""
echo "--- Canonical with Tracking Params ---"
check_url "$BASE_URL/tours?utm_source=facebook&fbclid=abc123" "$BASE_URL/tours"

echo ""
echo "========================================"
echo -e "${GREEN}PASS: $PASS${NC}"
echo -e "${RED}FAIL: $FAIL${NC}"
echo -e "${YELLOW}WARN: $WARN${NC}"
echo "========================================"

exit $FAIL
