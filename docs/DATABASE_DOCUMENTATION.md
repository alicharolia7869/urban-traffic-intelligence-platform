# Database Module Documentation (`backend/database/db.py`)

## 1. Overview
`backend/database/db.py` is the core database connection, engine configuration, and session management module for the **Urban Traffic Intelligence Platform**. It provides the SQLAlchemy ORM foundation used by the FastAPI REST gateway (`backend/main.py`, `backend/api/router.py`), ML pipelines (`ml/`), and database schema models (`backend/database/schema.py`).

By default, the module connects to a local **SQLite** database (`backend/database/traffic.db`) for zero-configuration local development, while supporting seamless switching to **PostgreSQL** (or any SQLAlchemy-compatible database) in production via the `DATABASE_URL` environment variable.

---

## 2. File Location & Dependencies

- **File Path**: `backend/database/db.py`
- **Default SQLite File**: `backend/database/traffic.db`
- **Schema Models**: `backend/database/schema.py`
- **External Libraries**:
  - `os` (Standard Library): Path resolution and environment variable lookup.
  - `typing.Generator` (Standard Library): Type annotation for the FastAPI dependency generator.
  - `sqlalchemy.create_engine`: Constructs the core database connection pool and dialect engine.
  - `sqlalchemy.orm.Session`, `declarative_base`, `sessionmaker`: ORM session lifecycle and declarative model registration.

---

## 3. Configuration & Module Attributes

### `DATABASE_PATH`
```python
DATABASE_PATH = os.path.abspath(os.path.join(os.path.dirname(__file__), "traffic.db"))
```
- **Type**: `str`
- **Purpose**: Computes the absolute filesystem path to `traffic.db` inside the `backend/database/` directory, ensuring the SQLite file is always resolved consistently regardless of the current working directory from which Python or Uvicorn is launched.

---

### `DATABASE_URL`
```python
DATABASE_URL = os.getenv("DATABASE_URL", f"sqlite:///{DATABASE_PATH}")
```
- **Type**: `str`
- **Environment Variable**: `DATABASE_URL`
- **Default**: `sqlite:///<absolute-path-to-traffic.db>`
- **Purpose**: Determines the target database connection string.
  - **Local Development (Default)**: Uses local SQLite (`traffic.db`).
  - **Production Override**: Set `DATABASE_URL=postgresql://user:password@host:5432/dbname` in the environment to switch to PostgreSQL without modifying code.

---

### `connect_args`
```python
connect_args = {"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}
```
- **Type**: `dict`
- **Purpose**: Passes dialect-specific driver arguments to `create_engine()`:
  - When using **SQLite**, Python's built-in `sqlite3` driver restricts connection usage to the thread that created it by default. Because FastAPI handles requests concurrently across thread pools, `{"check_same_thread": False}` is required to allow request worker threads to safely use pooled connections.
  - When using **PostgreSQL** or another database engine, `connect_args` defaults to `{}`.

---

### `engine`
```python
engine = create_engine(
    DATABASE_URL,
    connect_args=connect_args,
    echo=False,
    pool_pre_ping=True
)
```
- **Type**: `sqlalchemy.engine.Engine`
- **Parameters**:
  - `DATABASE_URL`: Target connection URI.
  - `connect_args`: Driver-level connection arguments (`check_same_thread` for SQLite).
  - `echo=False`: Suppresses raw SQL query logging in standard output for clean production logs (change to `True` when debugging SQL queries).
  - `pool_pre_ping=True`: Executes a lightweight `SELECT 1` health check before checking out a connection from the pool, automatically recycling dropped or stale connections.

---

### `SessionLocal`
```python
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
```
- **Type**: `sqlalchemy.orm.sessionmaker`
- **Parameters**:
  - `autocommit=False`: Ensures all database writes occur inside explicit transactions requiring `db.commit()`.
  - `autoflush=False`: Prevents automatic flushing of pending object states before every query unless explicitly flushed or committed.
  - `bind=engine`: Associates all created `Session` instances with the global `engine`.

---

### `Base`
```python
Base = declarative_base()
```
- **Type**: Declarative meta class
- **Purpose**: Serves as the parent class for all ORM models defined in `backend/database/schema.py`:
  - `Road` (`roads`)
  - `TrafficReading` (`traffic_readings`)
  - `Weather` (`weather`)
  - `Incident` (`incidents`)
  - `VehicleData` (`vehicle_data`)
  - `Prediction` (`predictions`)
  - `ModelMetric` (`model_metrics`)

---

## 4. Functions

### `get_db()`
```python
def get_db() -> Generator[Session, None, None]:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
```
- **Return Type**: `Generator[Session, None, None]`
- **Purpose**: FastAPI dependency injection generator that manages the lifecycle of a database session per HTTP request.
- **Execution Flow**:
  1. **Acquire**: Creates a new isolated `Session` instance via `SessionLocal()` when an API request enters a route handler.
  2. **Execute**: `yield`s the session (`db`) to the endpoint function so it can run queries or transactions.
  3. **Release**: Guarantees `db.close()` runs inside the `finally` block as soon as the request completes—even if an exception is raised—preventing connection leaks.

---

## 5. Architecture & Data Flow

```mermaid
flowchart LR
    Env["Environment Variable\n(DATABASE_URL)"] --> URL["DATABASE_URL\n(SQLite or PostgreSQL)"]
    Path["DATABASE_PATH\n(backend/database/traffic.db)"] --> URL
    URL --> Engine["SQLAlchemy Engine\n(pool_pre_ping=True)"]
    Engine --> SessionFactory["SessionLocal\n(sessionmaker)"]
    Base["Base\n(declarative_base)"] --> Schema["ORM Models\n(backend/database/schema.py)"]
    Schema --> Engine
    SessionFactory --> GetDB["get_db() Generator"]
    GetDB --> FastAPI["FastAPI Endpoints\n(Depends(get_db))"]
```

---

## 6. Usage Examples

### A. Using `get_db` in FastAPI Routes (`backend/api/router.py`)
```python
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from backend.database.db import get_db
from backend.database.schema import Road

router = APIRouter()

@router.get("/api/roads")
def list_roads(db: Session = Depends(get_db)):
    return db.query(Road).all()
```

### B. Initializing Database Tables (`backend/main.py` / `ml/data/generator.py`)
```python
from backend.database.db import Base, engine
import backend.database.schema  # Registers all ORM models on Base.metadata

# Create all tables if they do not exist
Base.metadata.create_all(bind=engine)
```

### C. Using `SessionLocal` in Standalone Scripts (`ml/`)
```python
from backend.database.db import SessionLocal
from backend.database.schema import ModelMetric

db = SessionLocal()
try:
    metrics = db.query(ModelMetric).all()
    db.commit()
finally:
    db.close()
```

