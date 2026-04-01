# 🦁 Karibu Safari — Backend API

Production-ready FastAPI backend for the Karibu Safari luxury travel platform. Powers tour management, bookings, inquiries, trip planning, media uploads, and admin analytics.

---

## 🧱 Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | FastAPI (async) |
| Database | PostgreSQL + SQLAlchemy 2 (async) |
| Migrations | Alembic |
| Auth | JWT (access + refresh tokens) |
| Validation | Pydantic v2 |
| Media Storage | Cloudinary or AWS S3 |
| Caching | Redis (optional) |
| Containerization | Docker + Docker Compose |

---

## 🏗️ Architecture

```
backend/
├── app/
│   ├── core/               # Config, DB engine, security utilities
│   │   ├── config.py       # Pydantic Settings (reads .env)
│   │   ├── database.py     # Async SQLAlchemy engine + session
│   │   └── security.py     # JWT creation/decode, bcrypt hashing
│   │
│   ├── models/             # SQLAlchemy ORM models
│   │   ├── user.py         # User + UserRole enum
│   │   ├── tour.py         # Tour + TourImage
│   │   ├── booking.py      # Booking + BookingStatus enum
│   │   ├── inquiry.py      # Contact inquiries
│   │   ├── trip_plan.py    # Custom trip requests
│   │   ├── media.py        # Uploaded media files
│   │   └── testimonial.py  # Reviews
│   │
│   ├── schemas/            # Pydantic request/response schemas
│   ├── repositories/       # Data access layer (SQL queries)
│   ├── services/           # Business logic layer
│   ├── api/v1/             # FastAPI route handlers
│   ├── dependencies/       # JWT auth middleware + RBAC
│   └── main.py             # App factory, CORS, lifespan
│
├── alembic/                # Database migrations
├── docker-compose.yml
├── Dockerfile
├── requirements.txt
└── .env.example
```

---

## 🚀 Quick Start

### 1. Clone & configure

```bash
git clone https://github.com/IamUnju/New_Tourism_full_fronend.git
cd New_Tourism_full_fronend/backend
cp .env.example .env
# Edit .env with your DB credentials, secret key, and cloud storage keys
```

### 2. Run with Docker (recommended)

```bash
docker-compose up --build
```

API available at: `http://localhost:8000`
Interactive docs: `http://localhost:8000/docs`

### 3. Run locally (without Docker)

```bash
python -m venv venv
venv\Scripts\activate          # Windows
# source venv/bin/activate    # Linux/Mac

pip install -r requirements.txt

# Run migrations
alembic upgrade head

# Start server
uvicorn app.main:app --reload --port 8000
```

---

## 📡 API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/auth/register` | Register new customer |
| POST | `/api/v1/auth/login` | Login → returns JWT tokens |
| POST | `/api/v1/auth/refresh` | Refresh access token |
| GET | `/api/v1/auth/me` | Get current user |

### Tours
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/v1/tours` | Public | List tours (search, filter, paginate) |
| GET | `/api/v1/tours/featured` | Public | Get featured tours |
| GET | `/api/v1/tours/{id_or_slug}` | Public | Get single tour |
| POST | `/api/v1/tours` | Admin | Create tour |
| PUT | `/api/v1/tours/{id}` | Admin | Update tour |
| DELETE | `/api/v1/tours/{id}` | Admin | Delete tour |

### Bookings
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/v1/bookings` | Customer | Create booking |
| GET | `/api/v1/bookings/me` | Customer | My bookings |
| GET | `/api/v1/bookings` | Admin | All bookings |
| PUT | `/api/v1/bookings/{id}/status` | Admin | Update status |

### Inquiries
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/v1/inquiries` | Public | Submit inquiry |
| GET | `/api/v1/inquiries` | Admin | List all |

### Trip Planning
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/v1/trip-plans` | Public/Customer | Submit custom trip request |
| GET | `/api/v1/trip-plans/me` | Customer | My trip plans |
| GET | `/api/v1/trip-plans` | Admin | All trip plans |
| PUT | `/api/v1/trip-plans/{id}` | Admin | Update status/quote |

### Media
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/v1/media/upload` | Admin | Upload image (Cloudinary/S3) |
| DELETE | `/api/v1/media/{id}` | Admin | Delete media |

### Testimonials
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/v1/testimonials` | Public | Submit review |
| GET | `/api/v1/testimonials` | Public | Get approved reviews |
| PUT | `/api/v1/testimonials/{id}/approve` | Admin | Approve review |

### Admin Dashboard
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/v1/admin/dashboard` | Admin | Stats: bookings, revenue, users |

---

## 🔐 Authentication

All protected endpoints use **Bearer JWT tokens**.

```bash
# 1. Login
curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@karibusafari.com", "password": "ChangeMe123!"}'

# 2. Use the access_token
curl http://localhost:8000/api/v1/admin/dashboard \
  -H "Authorization: Bearer <access_token>"
```

**Roles:**
- `customer` — can book tours, submit inquiries, manage own profile
- `admin` — full access to all endpoints

---

## 🖼️ Media Upload (Cloudinary)

Set in `.env`:
```
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

Upload:
```bash
curl -X POST http://localhost:8000/api/v1/media/upload \
  -H "Authorization: Bearer <admin_token>" \
  -F "file=@/path/to/image.jpg"
```

---

## 🗄️ Database Migrations

```bash
# Create a new migration after model changes
alembic revision --autogenerate -m "description"

# Apply all migrations
alembic upgrade head

# Rollback one step
alembic downgrade -1
```

---

## 🌐 Connecting to the React Frontend

The frontend (Vite + React) talks to this API. Set the base URL in your frontend `.env`:

```
VITE_API_URL=http://localhost:8002/api/v1
```

CORS is pre-configured — add your frontend domain to `ALLOWED_ORIGINS` in `.env`.

---

## ⚙️ Environment Variables

See `.env.example` for the full list. Critical variables:

| Variable | Description |
|----------|-------------|
| `SECRET_KEY` | JWT signing secret (min 32 chars) |
| `DATABASE_URL` | Async PostgreSQL URL |
| `DATABASE_URL_SYNC` | Sync URL (used by Alembic) |
| `CLOUDINARY_*` | Cloudinary credentials for image uploads |
| `ALLOWED_ORIGINS` | Comma-separated CORS origins |
| `FIRST_ADMIN_EMAIL` | Auto-created admin user on first run |
| `FIRST_ADMIN_PASSWORD` | Admin password (change immediately) |

---

## 🏥 Health Check

```bash
curl http://localhost:8000/health
# {"status": "ok", "version": "1.0.0", "app": "Karibu Safari API"}
```
