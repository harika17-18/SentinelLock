from fastapi import FastAPI
from sqlalchemy import create_engine, text

app = FastAPI(
    title="SentinelLock API",
    description="Real-Time Cybersecurity and Digital Forensics System",
    version="1.0.0"
)

DATABASE_URL = "postgresql://postgres:harik@17@localhost:5432/sentinel_lock"

engine = create_engine(DATABASE_URL)


@app.get("/")
def root():
    return {
        "application": "SentinelLock",
        "status": "online"
    }


@app.get("/database-test")
def database_test():
    with engine.connect() as connection:
        result = connection.execute(text("SELECT 1"))
        return {
            "database": "connected",
            "result": result.scalar()
        }