import logging

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.router import api_router
from app.core.config import settings
from app.db.database import SessionLocal, engine
from app.db.migrate import run_migrations
from app.db.models import Base, User

logger = logging.getLogger(__name__)

app = FastAPI(title="BuildFlow API")


@app.on_event("startup")
def on_startup():
    Base.metadata.create_all(bind=engine)
    run_migrations()
    db = SessionLocal()
    try:
        if db.query(User).count() == 0:
            from app.db.seed import seed_database

            seed_database(db)
            logger.info("Demo data seeded successfully")
    except Exception:
        logger.exception("Failed to seed database")
        raise
    finally:
        db.close()


app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health_check():
    return {"status": "ok"}
