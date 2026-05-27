from sqlalchemy import inspect, text

from app.db.database import engine

PROFILE_COLUMNS = [
    ("phone", "VARCHAR(50)"),
    ("contact_email", "VARCHAR(255)"),
    ("address", "TEXT"),
    ("city", "VARCHAR(100)"),
    ("company", "VARCHAR(255)"),
    ("notes", "TEXT"),
]


def run_migrations() -> None:
    inspector = inspect(engine)
    if "users" not in inspector.get_table_names():
        return

    existing = {col["name"] for col in inspector.get_columns("users")}
    with engine.begin() as conn:
        for name, col_type in PROFILE_COLUMNS:
            if name not in existing:
                conn.execute(text(f"ALTER TABLE users ADD COLUMN {name} {col_type}"))
