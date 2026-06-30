import http from 'k6/http';
import { check, sleep, group } from 'k6';
import { Rate, Trend, Counter } from 'k6/metrics';

// ── Options (override via environment variables) ──────────────────────────────────
const BASE_URL = __ENV.BASE_URL || 'http://localhost:8000/api/v1';
const VUS = parseInt(__ENV.VUS || '1000');
const RAMP_UP = __ENV.RAMP_UP || '2m';
const HOLD = __ENV.HOLD || '5m';
const RAMP_DOWN = __ENV.RAMP_DOWN || '1m';
const TARGET_RPS = parseInt(__ENV.TARGET_RPS || '0'); // 0 = unlimited
const AUTH_TOKEN = __ENV.AUTH_TOKEN || ''; // optional bearer token

// ── Custom metrics ────────────────────────────────────────────────────────────────
const bookingSuccess = new Rate('booking_success');
const bookingRateLimited = new Rate('booking_rate_limited');
const bookingErrors = new Counter('booking_errors');
const tourListDuration = new Trend('tour_list_duration');
const tourDetailDuration = new Trend('tour_detail_duration');
const bookingCreateDuration = new Trend('booking_create_duration');
const bookingConflictDetected = new Counter('booking_conflicts');

// ── Stage configuration ───────────────────────────────────────────────────────────
export const options = {
  stages: [
    { target: VUS, duration: RAMP_UP },
    { target: VUS, duration: HOLD },
    { target: 0, duration: RAMP_DOWN },
  ],
  thresholds: {
    http_req_failed: ['rate<0.01'],       // < 1% total failures
    http_req_duration: ['p(95)<2000'],    // p95 < 2s across all endpoints
    booking_success: ['rate>0'],          // at least some bookings succeed
    booking_rate_limited: ['rate<1'],     // not all bookings are rate-limited
  },
};

// ── Helpers ───────────────────────────────────────────────────────────────────────

const AUTH_HEADERS = AUTH_TOKEN
  ? { headers: { Authorization: `Bearer ${AUTH_TOKEN}`, 'Content-Type': 'application/json' } }
  : { headers: { 'Content-Type': 'application/json' } };

// Pool of tour IDs discovered at runtime, refreshed periodically
let tourIdPool = [];
let lastTourRefresh = 0;

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function futureDate(daysAhead) {
  const d = new Date();
  d.setDate(d.getDate() + daysAhead);
  return d.toISOString().slice(0, 10);
}

function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

// Fetch a fresh list of tour IDs from the API
function refreshTourPool() {
  const res = http.get(`${BASE_URL}/tours?per_page=50`, AUTH_HEADERS);
  if (res.status === 200) {
    try {
      const body = JSON.parse(res.body);
      if (body.items && body.items.length > 0) {
        tourIdPool = body.items.map((t) => t.id);
      }
    } catch (_) { /* ignore parse errors */ }
  }
}

// ── Main scenario ─────────────────────────────────────────────────────────────────

export default function () {
  // Each VU = one simulated user session

  // ── Step 1: Browse tours ─────────────────────────────────────────────────────
  group('Browse Tours', () => {
    const res = http.get(`${BASE_URL}/tours?per_page=12`, AUTH_HEADERS);
    tourListDuration.add(res.timings.duration);
    const ok = check(res, {
      'tour list status 200': (r) => r.status === 200,
      'tour list has items': (r) => {
        try { return JSON.parse(r.body).items !== undefined; }
        catch (_) { return false; }
      },
    });
    if (!ok) {
      bookingErrors.add(1);
    }
    // Seed tour pool from first successful response
    if (tourIdPool.length === 0) {
      try {
        const body = JSON.parse(res.body);
        if (body.items) {
          tourIdPool = body.items.map((t) => t.id);
        }
      } catch (_) { /* ignore */ }
    }
  });

  // Think time: 2-5 seconds
  sleep(randomInt(2000, 5000) / 1000);

  // ── Step 2: Check availability (tour detail) ─────────────────────────────────
  let selectedTourId = null;
  group('Check Availability', () => {
    if (tourIdPool.length === 0) {
      refreshTourPool();
    }
    if (tourIdPool.length > 0) {
      selectedTourId = pickRandom(tourIdPool);
      const res = http.get(`${BASE_URL}/tours/${selectedTourId}`, AUTH_HEADERS);
      tourDetailDuration.add(res.timings.duration);
      const ok = check(res, {
        'tour detail status 200': (r) => r.status === 200,
        'tour detail has id': (r) => {
          try { return JSON.parse(r.body).id !== undefined; }
          catch (_) { return false; }
        },
      });
      if (!ok) {
        bookingErrors.add(1);
      }
    }
  });

  // Think time again
  sleep(randomInt(2000, 5000) / 1000);

  // ── Step 3: Book (only 20% of VUs) ──────────────────────────────────────────
  // Each VU flips a coin once per iteration; 20% proceed to booking.
  const shouldBook = Math.random() < 0.2;

  if (shouldBook && selectedTourId !== null && tourIdPool.length > 0) {
    group('Create Booking', () => {
      const guestCount = randomInt(1, 4);
      const payload = JSON.stringify({
        tour_id: selectedTourId,
        travel_date: futureDate(randomInt(7, 60)),
        guests: guestCount,
        contact_name: `LoadTest User ${__VU}`,
        contact_email: `loadtest${__VU}@example.com`,
        contact_phone: `+255123${String(__VU).padStart(7, '0')}`,
        special_requests: 'Load test booking — please ignore',
      });

      const res = http.post(`${BASE_URL}/bookings`, payload, AUTH_HEADERS);
      bookingCreateDuration.add(res.timings.duration);

      if (res.status === 201) {
        // Successful booking
        bookingSuccess.add(1);
        check(res, {
          'booking created with id': (r) => {
            try { return JSON.parse(r.body).id !== undefined; }
            catch (_) { return false; }
          },
          'booking has payment_redirect_url or null': (r) => {
            try {
              const b = JSON.parse(r.body);
              return b.payment_redirect_url !== undefined;
            } catch (_) { return false; }
          },
        });
      } else if (res.status === 429) {
        // Expected under rate limiter — track but don't flag
        bookingRateLimited.add(1);
        check(res, {
          'rate limited body has detail': (r) => {
            try { return JSON.parse(r.body).detail !== undefined; }
            catch (_) { return false; }
          },
        });
      } else if (res.status === 409) {
        // Duplicate / conflict — exactly what the advisory lock + overlap check protects
        bookingConflictDetected.add(1);
        bookingErrors.add(1);
        check(res, {
          'conflict response has detail': (r) => {
            try { return JSON.parse(r.body).detail !== undefined; }
            catch (_) { return false; }
          },
        });
      } else if (res.status === 422) {
        // Validation error (e.g., past date from the validator)
        bookingErrors.add(1);
        check(res, {
          'validation error detail present': (r) => {
            try { return JSON.parse(r.body).detail !== undefined; }
            catch (_) { return false; }
          },
        });
      } else {
        // Unexpected error
        bookingErrors.add(1);
        check(res, {
          'unexpected status': (r) => r.status >= 400 && r.status < 600,
        });
      }
    });
  }
}

// ── Optional teardown ─────────────────────────────────────────────────────────────
export function teardown() {
  console.log(`--- Load test complete ---`);
  console.log(`Tours in pool: ${tourIdPool.length}`);
}
