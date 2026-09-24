from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from sqlalchemy import (
    create_engine,
    Column,
    Integer,
    String,
    Boolean,
    DateTime,
    Float,
    Text
)
from sqlalchemy.orm import declarative_base, sessionmaker
from sqlalchemy.engine import URL

from datetime import datetime
from dotenv import load_dotenv
import os


# =========================
# SENTINELLOCK APPLICATION
# =========================

app = FastAPI(
    title="SentinelLock API",
    description="Real-Time Cybersecurity and Digital Forensics System",
    version="1.0.0"
)


# =========================
# CORS
# =========================

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# =========================
# DATABASE CONFIGURATION
# =========================

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    raise ValueError("DATABASE_URL is not configured in .env")

engine = create_engine(DATABASE_URL)

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

Base = declarative_base()


# =========================
# USER MODEL
# =========================

class User(Base):

    __tablename__ = "users"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    full_name = Column(
        String(100),
        nullable=False
    )

    email = Column(
        String(150),
        unique=True,
        nullable=False,
        index=True
    )

    password_hash = Column(
        String(255),
        nullable=False
    )

    role = Column(
        String(30),
        default="user",
        nullable=False
    )

    is_active = Column(
        Boolean,
        default=True,
        nullable=False
    )

    created_at = Column(
        DateTime,
        default=datetime.utcnow,
        nullable=False
    )


# =========================
# DEVICE MODEL
# =========================

class Device(Base):

    __tablename__ = "devices"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    device_name = Column(
        String(100),
        nullable=False
    )

    device_identifier = Column(
        String(150),
        unique=True,
        nullable=False,
        index=True
    )

    device_type = Column(
        String(50),
        nullable=False
    )

    is_active = Column(
        Boolean,
        default=True,
        nullable=False
    )

    created_at = Column(
        DateTime,
        default=datetime.utcnow,
        nullable=False
    )


# =========================
# TRANSACTION MODEL
# =========================

class Transaction(Base):

    __tablename__ = "transactions"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    transaction_reference = Column(
        String(150),
        unique=True,
        nullable=False,
        index=True
    )

    transaction_type = Column(
        String(50),
        nullable=False
    )

    amount = Column(
        Float,
        nullable=False
    )

    sender_identifier = Column(
        String(150),
        nullable=False
    )

    receiver_identifier = Column(
        String(150),
        nullable=False
    )

    status = Column(
        String(30),
        default="completed",
        nullable=False
    )

    risk_score = Column(
        Float,
        default=0.0,
        nullable=False
    )

    is_suspicious = Column(
        Boolean,
        default=False,
        nullable=False
    )

    created_at = Column(
        DateTime,
        default=datetime.utcnow,
        nullable=False
    )


# =========================
# SECURITY EVENT MODEL
# =========================

class SecurityEvent(Base):

    __tablename__ = "security_events"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    event_type = Column(
        String(100),
        nullable=False
    )

    severity = Column(
        String(30),
        nullable=False
    )

    source = Column(
        String(100),
        nullable=False
    )

    description = Column(
        Text,
        nullable=False
    )

    risk_score = Column(
        Float,
        default=0.0,
        nullable=False
    )

    is_resolved = Column(
        Boolean,
        default=False,
        nullable=False
    )

    created_at = Column(
        DateTime,
        default=datetime.utcnow,
        nullable=False
    )


# =========================
# INCIDENT MODEL
# =========================

class Incident(Base):

    __tablename__ = "incidents"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    incident_reference = Column(
        String(150),
        unique=True,
        nullable=False,
        index=True
    )

    title = Column(
        String(200),
        nullable=False
    )

    incident_type = Column(
        String(100),
        nullable=False
    )

    severity = Column(
        String(30),
        nullable=False
    )

    status = Column(
        String(30),
        default="open",
        nullable=False
    )

    risk_score = Column(
        Float,
        default=0.0,
        nullable=False
    )

    description = Column(
        Text,
        nullable=False
    )

    is_resolved = Column(
        Boolean,
        default=False,
        nullable=False
    )

    created_at = Column(
        DateTime,
        default=datetime.utcnow,
        nullable=False
    )

    resolved_at = Column(
        DateTime,
        nullable=True
    )


# =========================
# CREATE DATABASE TABLES
# =========================

Base.metadata.create_all(bind=engine)


# =========================
# BASIC API
# =========================

@app.get("/")
def root():

    return {
        "application": "SentinelLock",
        "status": "online"
    }


@app.get("/database-test")
def database_test():

    with engine.connect() as connection:

        connection.exec_driver_sql("SELECT 1")

    return {
        "database": "connected"
    }


@app.get("/user-model-test")
def user_model_test():

    return {
        "model": "User",
        "table": "users",
        "status": "ready"
    }


@app.get("/device-model-test")
def device_model_test():

    return {
        "model": "Device",
        "table": "devices",
        "status": "ready"
    }


@app.get("/transaction-model-test")
def transaction_model_test():

    return {
        "model": "Transaction",
        "table": "transactions",
        "status": "ready"
    }


@app.get("/security-event-model-test")
def security_event_model_test():

    return {
        "model": "SecurityEvent",
        "table": "security_events",
        "status": "ready"
    }


@app.get("/incident-model-test")
def incident_model_test():

    return {
        "model": "Incident",
        "table": "incidents",
        "status": "ready"
    }