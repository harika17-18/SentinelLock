from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sqlalchemy.orm import Session

from services.risk_engine import (
    calculate_transaction_risk,
    get_risk_level
)

from services.incident_service import (
    build_incident_data
)

from services.alert_service import (
    create_alert
)

from services.correlation_engine import (
    build_correlation_result
)

from services.incident_engine import (
    create_correlated_incident
)

from services.investigation_service import (
    build_investigation_event,
    build_investigation_timeline
)

from services.money_flow_service import (
    build_money_flow,
    build_money_flow_chain
)

from services.evidence_service import (
    create_evidence,
    build_evidence_package
)

from services.response_service import (
    create_response_action
)

from services.audit_service import (
    create_audit_record
)

from services.report_service import (
    generate_investigation_report
)

from auth.jwt_handler import (
    create_access_token
)

from auth.security import (
    hash_password,
    verify_password
)

from auth.dependencies import (
    get_current_user,
    require_role
)

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

from sqlalchemy.orm import (
    declarative_base,
    sessionmaker
)

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
    raise ValueError(
        "DATABASE_URL is not configured in .env"
    )

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

    device_id = Column(
        Integer,
        nullable=True,
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

    device_id = Column(
        Integer,
        nullable=False,
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
# ALERT MODEL
# =========================

class Alert(Base):

    __tablename__ = "alerts"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    incident_reference = Column(
        String,
        nullable=False,
        index=True
    )

    priority = Column(
        String,
        nullable=False
    )

    title = Column(
        String,
        nullable=False
    )

    message = Column(
        Text,
        nullable=False
    )

    status = Column(
        String,
        nullable=False,
        default="new"
    )

    created_at = Column(
        DateTime,
        default=datetime.utcnow,
        nullable=False
    )


# =========================
# RESPONSE ACTION MODEL
# =========================

class ResponseAction(Base):

    __tablename__ = "response_actions"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    incident_reference = Column(
        String,
        nullable=False,
        index=True
    )

    action = Column(
        String,
        nullable=False
    )

    status = Column(
        String,
        nullable=False,
        default="pending"
    )

    requires_authorization = Column(
        Boolean,
        nullable=False,
        default=True
    )

    requested_by = Column(
        Integer,
        nullable=False
    )

    created_at = Column(
        DateTime,
        default=datetime.utcnow,
        nullable=False
    )
    

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    actor = Column(String, nullable=False)
    action = Column(String, nullable=False)
    resource_type = Column(String, nullable=False)
    resource_reference = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)


# =========================
# AUTHENTICATION SCHEMAS
# =========================

class RegisterRequest(BaseModel):

    full_name: str
    email: str
    password: str


class LoginRequest(BaseModel):

    email: str
    password: str


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


# =========================
# RISK TEST
# =========================

@app.get("/risk-test")
def risk_test():

    risk_score = calculate_transaction_risk(
        amount=50000,
        security_risk=20
    )

    return {
        "risk_score": risk_score,
        "risk_level": get_risk_level(risk_score)
    }


# =========================
# INCIDENT TEST
# =========================

@app.get("/incident-test")
def incident_test():

    incident = build_incident_data(
        incident_reference="INC-TEST-001",
        title="Suspicious Financial Activity",
        incident_type="financial_fraud",
        risk_score=55,
        description="Synthetic test incident"
    )

    return incident


# =========================
# ALERT TEST
# =========================

@app.get("/alert-test")
def alert_test():

    alert = create_alert(
        incident_reference="INC-TEST-001",
        risk_score=55,
        title="Suspicious Financial Activity",
        message="A high-risk synthetic transaction requires investigation."
    )

    return alert


# =========================
# TRANSACTION API
# =========================

@app.post("/transactions")
def create_transaction(
    device_id: int,
    transaction_reference: str,
    transaction_type: str,
    amount: float,
    sender_identifier: str,
    receiver_identifier: str,
    current_user: dict = Depends(get_current_user)
):

    with SessionLocal() as db:

        device = (
            db.query(Device)
            .filter(Device.id == device_id)
            .first()
        )

        if not device:

            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Device not found"
            )

        risk_score = calculate_transaction_risk(
            amount=amount,
            security_risk=0
        )

        transaction = Transaction(
            device_id=device_id,
            transaction_reference=transaction_reference,
            transaction_type=transaction_type,
            amount=amount,
            sender_identifier=sender_identifier,
            receiver_identifier=receiver_identifier,
            status="completed",
            risk_score=risk_score,
            is_suspicious=risk_score >= 50
        )

        db.add(transaction)
        db.commit()
        db.refresh(transaction)

        return {
            "id": transaction.id,
            "device_id": transaction.device_id,
            "transaction_reference": transaction.transaction_reference,
            "transaction_type": transaction.transaction_type,
            "amount": transaction.amount,
            "risk_score": transaction.risk_score,
            "is_suspicious": transaction.is_suspicious,
            "status": transaction.status,
            "message": "Transaction created successfully"
        }


# =========================
# SECURITY EVENT API
# =========================

@app.post("/security-events")
def create_security_event(
    device_id: int,
    event_type: str,
    severity: str,
    source: str,
    description: str,
    risk_score: float = 0.0,
    current_user: dict = Depends(get_current_user)
):

    with SessionLocal() as db:

        device = (
            db.query(Device)
            .filter(Device.id == device_id)
            .first()
        )

        if not device:

            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Device not found"
            )

        security_event = SecurityEvent(
            device_id=device_id,
            event_type=event_type,
            severity=severity,
            source=source,
            description=description,
            risk_score=risk_score,
            is_resolved=False
        )

        db.add(security_event)
        db.commit()
        db.refresh(security_event)

        return {
            "id": security_event.id,
            "device_id": security_event.device_id,
            "event_type": security_event.event_type,
            "severity": security_event.severity,
            "source": security_event.source,
            "description": security_event.description,
            "risk_score": security_event.risk_score,
            "is_resolved": security_event.is_resolved,
            "message": "Security event created successfully"
        }


# =========================
# DEVICE API
# =========================

@app.post("/devices")
def create_device(
    device_name: str,
    device_identifier: str,
    device_type: str,
    current_user: dict = Depends(
        require_role("admin")
    )
):

    device = Device(
        device_name=device_name,
        device_identifier=device_identifier,
        device_type=device_type,
        is_active=True
    )

    with SessionLocal() as db:

        existing_device = (
            db.query(Device)
            .filter(
                Device.device_identifier == device_identifier
            )
            .first()
        )

        if existing_device:

            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="A device with this identifier already exists"
            )

        db.add(device)
        db.commit()
        db.refresh(device)

        return {
            "id": device.id,
            "device_name": device.device_name,
            "device_identifier": device.device_identifier,
            "device_type": device.device_type,
            "is_active": device.is_active,
            "message": "Device registered successfully"
        }
        
        
@app.get("/devices")
def get_devices(
    current_user: dict = Depends(get_current_user)
):
    with SessionLocal() as db:

        devices = (
            db.query(Device)
            .order_by(Device.created_at.desc())
            .all()
        )

        return {
            "count": len(devices),
            "devices": [
                {
                    "id": device.id,
                    "device_name": device.device_name,
                    "device_identifier": device.device_identifier,
                    "device_type": device.device_type,
                    "is_active": device.is_active,
                    "created_at": device.created_at
                }
                for device in devices
            ]
        }


# =========================
# REAL CORRELATION API
# =========================

@app.get("/correlate-device/{device_id}")
def correlate_device(
    device_id: int,
    current_user: dict = Depends(get_current_user)
):

    with SessionLocal() as db:

        device = (
            db.query(Device)
            .filter(Device.id == device_id)
            .first()
        )

        if not device:

            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Device not found"
            )

        security_event = (
            db.query(SecurityEvent)
            .filter(
                SecurityEvent.device_id == device_id
            )
            .order_by(
                SecurityEvent.created_at.desc()
            )
            .first()
        )

        transaction = (
            db.query(Transaction)
            .filter(
                Transaction.device_id == device_id
            )
            .order_by(
                Transaction.created_at.desc()
            )
            .first()
        )

        if not security_event:

            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="No security event found for this device"
            )

        if not transaction:

            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="No transaction found for this device"
            )

        result = build_correlation_result(
            transaction_reference=transaction.transaction_reference,
            security_event_id=security_event.id,
            transaction_risk=transaction.risk_score,
            security_event_risk=security_event.risk_score,
            device_id=device_id
        )

        return {
            "device": {
                "id": device.id,
                "device_name": device.device_name,
                "device_identifier": device.device_identifier,
                "device_type": device.device_type
            },
            "correlation": result
        }


# =========================
# CORRELATION → INCIDENT → ALERT
# =========================

@app.post("/correlate-device/{device_id}/create-incident")
def correlate_and_create_incident(
    device_id: int,
    current_user: dict = Depends(get_current_user)
):

    with SessionLocal() as db:

        device = (
            db.query(Device)
            .filter(Device.id == device_id)
            .first()
        )

        if not device:

            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Device not found"
            )

        security_event = (
            db.query(SecurityEvent)
            .filter(
                SecurityEvent.device_id == device_id
            )
            .order_by(
                SecurityEvent.created_at.desc()
            )
            .first()
        )

        if not security_event:

            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="No security event found for this device"
            )

        transaction = (
            db.query(Transaction)
            .filter(
                Transaction.device_id == device_id
            )
            .order_by(
                Transaction.created_at.desc()
            )
            .first()
        )

        if not transaction:

            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="No transaction found for this device"
            )

        correlation = build_correlation_result(
            transaction_reference=transaction.transaction_reference,
            security_event_id=security_event.id,
            transaction_risk=transaction.risk_score,
            security_event_risk=security_event.risk_score,
            device_id=device_id
        )

        incident_data = create_correlated_incident(
            transaction_reference=transaction.transaction_reference,
            security_event_id=security_event.id,
            combined_risk_score=correlation["combined_risk_score"],
            correlation_level=correlation["correlation_level"]
        )

        existing_incident = (
            db.query(Incident)
            .filter(
                Incident.incident_reference
                == incident_data["incident_reference"]
            )
            .first()
        )

        if existing_incident:

            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Incident already exists for this correlation"
            )

        incident = Incident(
            incident_reference=incident_data["incident_reference"],
            title=incident_data["title"],
            incident_type=incident_data["incident_type"],
            severity=incident_data["severity"],
            status=incident_data["status"],
            risk_score=incident_data["risk_score"],
            description=incident_data["description"],
            is_resolved=incident_data["is_resolved"]
        )

        db.add(incident)
        db.commit()
        db.refresh(incident)

        alert = create_alert(
            incident_reference=incident.incident_reference,
            risk_score=incident.risk_score,
            title="SentinelLock Security Alert",
            message=(
                f"Suspicious financial activity detected for "
                f"device {device.device_identifier}. "
                f"Transaction {transaction.transaction_reference} "
                f"was correlated with security event "
                f"{security_event.id}."
            )
        )

        stored_alert = Alert(
            incident_reference=alert["incident_reference"],
            priority=alert["priority"],
            title=alert["title"],
            message=alert["message"],
            status=alert["status"]
        )

        db.add(stored_alert)
        db.commit()
        db.refresh(stored_alert)

        return {
            "message": "Correlation processed successfully",

            "device": {
                "id": device.id,
                "device_name": device.device_name,
                "device_identifier": device.device_identifier
            },

            "correlation": correlation,

            "incident": {
                "id": incident.id,
                "incident_reference": incident.incident_reference,
                "title": incident.title,
                "incident_type": incident.incident_type,
                "severity": incident.severity,
                "status": incident.status,
                "risk_score": incident.risk_score,
                "description": incident.description,
                "is_resolved": incident.is_resolved
            },

            "alert": {
                "id": stored_alert.id,
                "incident_reference": stored_alert.incident_reference,
                "priority": stored_alert.priority,
                "title": stored_alert.title,
                "message": stored_alert.message,
                "status": stored_alert.status,
                "created_at": stored_alert.created_at
            }
        }


# =========================
# CORRELATION TEST
# =========================

@app.get("/correlation-test")
def correlation_test():

    result = build_correlation_result(
        transaction_reference="TXN-TEST-001",
        security_event_id=1,
        transaction_risk=35,
        security_event_risk=40
    )

    return result


# =========================
# CORRELATED INCIDENT TEST
# =========================

@app.get("/correlated-incident-test")
def correlated_incident_test():

    incident = create_correlated_incident(
        transaction_reference="TXN-TEST-001",
        security_event_id=1,
        combined_risk_score=37.5,
        correlation_level="medium"
    )

    return incident


# =========================
# INVESTIGATION TEST
# =========================

@app.get("/investigation-test")
def investigation_test():

    events = [

        build_investigation_event(
            event_type="security_event",
            reference="SEC-TEST-001",
            description="Synthetic SIM change detected",
            risk_score=40
        ),

        build_investigation_event(
            event_type="transaction",
            reference="TXN-TEST-001",
            description="Synthetic UPI transaction detected",
            risk_score=35
        ),

        build_investigation_event(
            event_type="incident",
            reference="INC-TXN-TEST-001-1",
            description="Correlated financial-security incident",
            risk_score=37.5
        )
    ]

    timeline = build_investigation_timeline(events)

    return {
        "incident_reference": "INC-TXN-TEST-001-1",
        "event_count": len(timeline),
        "timeline": timeline
    }


# =========================
# REAL INVESTIGATION
# =========================

@app.get("/incidents/{incident_id}/investigation")
def investigate_incident(
    incident_id: int,
    current_user: dict = Depends(get_current_user)
):

    with SessionLocal() as db:

        # 1. Find incident
        incident = (
            db.query(Incident)
            .filter(Incident.id == incident_id)
            .first()
        )

        if not incident:

            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Incident not found"
            )

        # 2. Extract transaction reference
        #
        # Current incident reference format:
        # INC-{transaction_reference}-{security_event_id}

        incident_body = incident.incident_reference.removeprefix(
            "INC-"
        )

        try:

            transaction_reference, security_event_id = (
                incident_body.rsplit("-", 1)
            )

        except ValueError:

            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Invalid incident reference format"
            )

        # 3. Find related transaction
        transaction = (
            db.query(Transaction)
            .filter(
                Transaction.transaction_reference
                == transaction_reference
            )
            .first()
        )

        events = []

        # 4. Add incident to timeline
        events.append(
            build_investigation_event(
                event_type="incident",
                reference=incident.incident_reference,
                description=incident.description,
                risk_score=incident.risk_score,
                timestamp=incident.created_at
            )
        )

        # 5. Add transaction to timeline
        if transaction:

            events.append(
                build_investigation_event(
                    event_type="transaction",
                    reference=transaction.transaction_reference,
                    description=(
                        f"{transaction.transaction_type} transaction "
                        f"of {transaction.amount} detected"
                    ),
                    risk_score=transaction.risk_score,
                    timestamp=transaction.created_at
                )
            )

            # 6. Find related security event
            try:

                security_event = (
                    db.query(SecurityEvent)
                    .filter(
                        SecurityEvent.id
                        == int(security_event_id)
                    )
                    .first()
                )

            except ValueError:

                security_event = None

            # 7. Add security event to timeline
            if security_event:

                events.append(
                    build_investigation_event(
                        event_type="security_event",
                        reference=str(security_event.id),
                        description=security_event.description,
                        risk_score=security_event.risk_score,
                        timestamp=security_event.created_at
                    )
                )

        # 8. Sort timeline
        timeline = build_investigation_timeline(events)

        return {
            "incident_reference": incident.incident_reference,
            "incident_id": incident.id,
            "event_count": len(timeline),
            "timeline": timeline
        }


# =========================
# MONEY FLOW TEST
# =========================

@app.get("/money-flow-test")
def money_flow_test():

    transaction = build_money_flow(
        transaction_reference="TXN-TEST-001",
        sender_identifier="USER-TEST-001",
        receiver_identifier="MERCHANT-TEST-001",
        amount=50000,
        transaction_type="UPI",
        status="completed"
    )

    chain = build_money_flow_chain([
        transaction
    ])

    return {
        "transaction": transaction,
        "flow_chain": chain
    }
    
    
# =========================
# REAL MONEY FLOW
# =========================

@app.get("/incidents/{incident_id}/money-flow")
def get_incident_money_flow(
    incident_id: int,
    current_user: dict = Depends(get_current_user)
):

    with SessionLocal() as db:

        # 1. Find the incident
        incident = (
            db.query(Incident)
            .filter(Incident.id == incident_id)
            .first()
        )

        if not incident:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Incident not found"
            )

        # 2. Extract transaction reference
        #
        # Current format:
        # INC-{transaction_reference}-{security_event_id}

        incident_body = incident.incident_reference.removeprefix(
            "INC-"
        )

        try:
            transaction_reference, security_event_id = (
                incident_body.rsplit("-", 1)
            )

        except ValueError:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Invalid incident reference format"
            )

        # 3. Find the real transaction
        transaction = (
            db.query(Transaction)
            .filter(
                Transaction.transaction_reference
                == transaction_reference
            )
            .first()
        )

        if not transaction:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Related transaction not found"
            )

        # 4. Build real money flow
        money_flow = build_money_flow(
            transaction_reference=transaction.transaction_reference,
            sender_identifier=transaction.sender_identifier,
            receiver_identifier=transaction.receiver_identifier,
            amount=transaction.amount,
            transaction_type=transaction.transaction_type,
            status=transaction.status
        )

        # 5. Build flow chain
        flow_chain = build_money_flow_chain(
            [money_flow]
        )

        return {
            "incident_reference": incident.incident_reference,
            "incident_id": incident.id,

            "transaction": {
                "id": transaction.id,
                "reference": transaction.transaction_reference,
                "type": transaction.transaction_type,
                "amount": transaction.amount,
                "status": transaction.status,
                "risk_score": transaction.risk_score
            },

            "money_flow": money_flow,

            "flow_chain": flow_chain
        }


# =========================
# REAL INCIDENT EVIDENCE
# =========================

@app.get("/incidents/{incident_id}/evidence")
def get_incident_evidence(
    incident_id: int,
    current_user: dict = Depends(get_current_user)
):

    with SessionLocal() as db:

        # 1. Find the incident
        incident = (
            db.query(Incident)
            .filter(Incident.id == incident_id)
            .first()
        )

        if not incident:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Incident not found"
            )

        # 2. Extract transaction and security-event references
        #
        # Current format:
        # INC-{transaction_reference}-{security_event_id}

        incident_body = incident.incident_reference.removeprefix(
            "INC-"
        )

        try:
            transaction_reference, security_event_id = (
                incident_body.rsplit("-", 1)
            )

        except ValueError:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Invalid incident reference format"
            )

        # 3. Find related transaction
        transaction = (
            db.query(Transaction)
            .filter(
                Transaction.transaction_reference
                == transaction_reference
            )
            .first()
        )

        # 4. Find related security event
        security_event = None

        try:
            security_event = (
                db.query(SecurityEvent)
                .filter(
                    SecurityEvent.id
                    == int(security_event_id)
                )
                .first()
            )

        except ValueError:
            pass

        evidence_items = []

        # 5. Add incident evidence
        evidence_items.append(
            create_evidence(
                evidence_type="incident",
                reference=incident.incident_reference,
                description=incident.description,
                source="sentinel_lock_incident_engine"
            )
        )

        # 6. Add transaction evidence
        if transaction:

            evidence_items.append(
                create_evidence(
                    evidence_type="transaction",
                    reference=transaction.transaction_reference,
                    description=(
                        f"{transaction.transaction_type} transaction "
                        f"of {transaction.amount} detected"
                    ),
                    source="transaction_database"
                )
            )

        # 7. Add security-event evidence
        if security_event:

            evidence_items.append(
                create_evidence(
                    evidence_type="security_event",
                    reference=str(security_event.id),
                    description=security_event.description,
                    source=security_event.source
                )
            )

        # 8. Build evidence package
        evidence_package = build_evidence_package(
            evidence_items
        )

        return {
            "incident_reference": incident.incident_reference,
            "incident_id": incident.id,
            "evidence": evidence_package
        }
        
        
# =========================
# REAL INCIDENT AUDIT LOG
# =========================

@app.post("/incidents/{incident_id}/audit-log")
def create_incident_audit_log(
    incident_id: int,
    current_user: dict = Depends(get_current_user)
):

    with SessionLocal() as db:

        # 1. Find the incident
        incident = (
            db.query(Incident)
            .filter(Incident.id == incident_id)
            .first()
        )

        if not incident:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Incident not found"
            )

        # 2. Create audit record
        audit_data = create_audit_record(
            actor=str(current_user["user_id"]),
            action="investigate_incident",
            resource_type="incident",
            resource_reference=incident.incident_reference,
            description=(
                f"Incident {incident.incident_reference} "
                f"was accessed for investigation."
            )
        )

        # 3. Save audit record
        audit_log = AuditLog(
            actor=audit_data["actor"],
            action=audit_data["action"],
            resource_type=audit_data["resource_type"],
            resource_reference=audit_data["resource_reference"],
            description=audit_data["description"],
            created_at=audit_data["timestamp"]
        )

        db.add(audit_log)
        db.commit()
        db.refresh(audit_log)

        return {
            "message": "Audit log created successfully",
            "audit_log": {
                "id": audit_log.id,
                "actor": audit_log.actor,
                "action": audit_log.action,
                "resource_type": audit_log.resource_type,
                "resource_reference": audit_log.resource_reference,
                "description": audit_log.description,
                "created_at": audit_log.created_at
            }
        }
        
        

# =========================
# REAL INVESTIGATION REPORT
# =========================

@app.get("/incidents/{incident_id}/report")
def get_investigation_report(
    incident_id: int,
    current_user: dict = Depends(get_current_user)
):

    with SessionLocal() as db:

        # 1. Find the incident
        incident = (
            db.query(Incident)
            .filter(Incident.id == incident_id)
            .first()
        )

        if not incident:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Incident not found"
            )

        # 2. Extract transaction and security-event references
        incident_body = incident.incident_reference.removeprefix(
            "INC-"
        )

        try:
            transaction_reference, security_event_id = (
                incident_body.rsplit("-", 1)
            )

        except ValueError:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Invalid incident reference format"
            )

        # 3. Find related transaction
        transaction = (
            db.query(Transaction)
            .filter(
                Transaction.transaction_reference
                == transaction_reference
            )
            .first()
        )

        # 4. Find related security event
        security_event = None

        try:
            security_event = (
                db.query(SecurityEvent)
                .filter(
                    SecurityEvent.id
                    == int(security_event_id)
                )
                .first()
            )
        except ValueError:
            pass

        # 5. Build investigation timeline
        timeline_events = []

        if security_event:
            timeline_events.append(
                build_investigation_event(
                    event_type="security_event",
                    reference=str(security_event.id),
                    description=security_event.description,
                    risk_score=security_event.risk_score,
                    timestamp=security_event.created_at
                )
            )

        if transaction:
            timeline_events.append(
                build_investigation_event(
                    event_type="transaction",
                    reference=transaction.transaction_reference,
                    description=(
                        f"{transaction.transaction_type} transaction "
                        f"of {transaction.amount} detected"
                    ),
                    risk_score=transaction.risk_score,
                    timestamp=transaction.created_at
                )
            )

        timeline_events.append(
            build_investigation_event(
                event_type="incident",
                reference=incident.incident_reference,
                description=incident.description,
                risk_score=incident.risk_score,
                timestamp=incident.created_at
            )
        )

        timeline = build_investigation_timeline(
            timeline_events
        )

        # 6. Build money flow
        money_flow = None

        if transaction:
            money_flow = build_money_flow(
                transaction_reference=transaction.transaction_reference,
                sender_identifier=transaction.sender_identifier,
                receiver_identifier=transaction.receiver_identifier,
                amount=transaction.amount,
                transaction_type=transaction.transaction_type,
                status=transaction.status
            )

        # 7. Build evidence
        evidence_items = []

        evidence_items.append(
            create_evidence(
                evidence_type="incident",
                reference=incident.incident_reference,
                description=incident.description,
                source="sentinel_lock_incident_engine"
            )
        )

        if transaction:
            evidence_items.append(
                create_evidence(
                    evidence_type="transaction",
                    reference=transaction.transaction_reference,
                    description=(
                        f"{transaction.transaction_type} transaction "
                        f"of {transaction.amount} detected"
                    ),
                    source="transaction_database"
                )
            )

        if security_event:
            evidence_items.append(
                create_evidence(
                    evidence_type="security_event",
                    reference=str(security_event.id),
                    description=security_event.description,
                    source=security_event.source
                )
            )

        evidence = build_evidence_package(
            evidence_items
        )

        # 8. Generate final investigation report
        report = generate_investigation_report(
            incident_reference=incident.incident_reference,
            incident_data={
                "id": incident.id,
                "title": incident.title,
                "incident_type": incident.incident_type,
                "severity": incident.severity,
                "status": incident.status,
                "risk_score": incident.risk_score,
                "description": incident.description
            },
            timeline=timeline,
            money_flow=money_flow,
            evidence=evidence
        )

        return report
    
        

# =========================
# INVESTIGATION PACKAGE TEST
# =========================

@app.get("/investigation-package-test")
def investigation_package_test():

    incident_reference = "INC-TXN-TEST-001-1"

    evidence_items = [

        create_evidence(
            evidence_type="security_event",
            reference="SEC-TEST-001",
            description="Synthetic SIM change event",
            source="device_security"
        ),

        create_evidence(
            evidence_type="transaction",
            reference="TXN-TEST-001",
            description="Synthetic UPI transaction",
            source="payment_system"
        )
    ]

    evidence_package = build_evidence_package(
        evidence_items
    )

    response = create_response_action(
        incident_reference=incident_reference,
        severity="medium",
        risk_score=37.5
    )

    audit = create_audit_record(
        actor="system",
        action="investigation_created",
        resource_type="incident",
        resource_reference=incident_reference,
        description="Investigation package generated from synthetic data"
    )

    timeline = [

        {
            "event_type": "security_event",
            "reference": "SEC-TEST-001",
            "description": "Synthetic SIM change detected"
        },

        {
            "event_type": "transaction",
            "reference": "TXN-TEST-001",
            "description": "Synthetic UPI transaction detected"
        },

        {
            "event_type": "incident",
            "reference": incident_reference,
            "description": "Correlated financial-security incident"
        }
    ]

    money_flow = [

        {
            "step": 1,
            "transaction_reference": "TXN-TEST-001",
            "from": "USER-TEST-001",
            "to": "MERCHANT-TEST-001",
            "amount": 50000
        }
    ]

    incident_data = {
        "severity": "medium",
        "risk_score": 37.5,
        "status": "open"
    }

    report = generate_investigation_report(
        incident_reference=incident_reference,
        incident_data=incident_data,
        timeline=timeline,
        money_flow=money_flow,
        evidence=evidence_items
    )

    return {
        "incident_reference": incident_reference,
        "evidence": evidence_package,
        "response": response,
        "audit": audit,
        "report": report
    }


# ============================================================
# REAL USER REGISTRATION
# ============================================================

@app.post("/auth/register")
def register_user(request: RegisterRequest):

    full_name = request.full_name.strip()
    email = request.email.strip().lower()
    password = request.password

    if not full_name:

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Full name is required"
        )

    if not email or "@" not in email:

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A valid email address is required"
        )

    if len(password) < 8:

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password must contain at least 8 characters"
        )

    with SessionLocal() as db:

        existing_user = (
            db.query(User)
            .filter(User.email == email)
            .first()
        )

        if existing_user:

            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="An account with this email already exists"
            )

        password_hash = hash_password(password)

        user = User(
            full_name=full_name,
            email=email,
            password_hash=password_hash,
            role="user",
            is_active=True
        )

        db.add(user)
        db.commit()
        db.refresh(user)

        return {
            "message": "User registered successfully",
            "user": {
                "id": user.id,
                "full_name": user.full_name,
                "email": user.email,
                "role": user.role,
                "is_active": user.is_active
            }
        }


# ============================================================
# REAL USER LOGIN
# ============================================================

@app.post("/auth/login")
def login_user(request: LoginRequest):

    email = request.email.strip().lower()

    with SessionLocal() as db:

        user = (
            db.query(User)
            .filter(User.email == email)
            .first()
        )

        if not user:

            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password"
            )

        if not user.is_active:

            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="User account is inactive"
            )

        if not verify_password(
            request.password,
            user.password_hash
        ):

            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password"
            )

        token = create_access_token(
            user_id=user.id,
            role=user.role
        )

        return {
            "message": "Login successful",
            "token_type": "bearer",
            "access_token": token,
            "user": {
                "id": user.id,
                "full_name": user.full_name,
                "email": user.email,
                "role": user.role
            }
        }


# ============================================================
# AUTHENTICATION TEST
# ============================================================

@app.post("/auth/test")
def auth_test(
    user_id: int = 1,
    role: str = "user"
):

    token = create_access_token(
        user_id=user_id,
        role=role
    )

    return {
        "message": "Authentication token generated",
        "user_id": user_id,
        "role": role,
        "token_type": "bearer",
        "access_token": token
    }


# ============================================================
# AUTHENTICATION PROTECTED TEST
# ============================================================

@app.get("/auth/me")
def auth_me(
    current_user: dict = Depends(get_current_user)
):

    return {
        "authenticated": True,
        "user": current_user
    }


# ============================================================
# RBAC ADMIN TEST
# ============================================================

@app.get("/admin-test")
def admin_test(
    current_user: dict = Depends(
        require_role("admin")
    )
):

    return {
        "message": "Admin access granted",
        "user": current_user
    }


# =========================
# INCIDENT MANAGEMENT
# =========================

@app.get("/incidents")
def get_all_incidents(
    current_user: dict = Depends(get_current_user)
):

    with SessionLocal() as db:

        incidents = (
            db.query(Incident)
            .order_by(
                Incident.created_at.desc()
            )
            .all()
        )

        return {
            "count": len(incidents),
            "incidents": [
                {
                    "id": incident.id,
                    "incident_reference": incident.incident_reference,
                    "title": incident.title,
                    "incident_type": incident.incident_type,
                    "severity": incident.severity,
                    "status": incident.status,
                    "risk_score": incident.risk_score,
                    "description": incident.description,
                    "is_resolved": incident.is_resolved,
                    "created_at": incident.created_at
                }
                for incident in incidents
            ]
        }


# =========================
# GET SINGLE INCIDENT
# =========================

@app.get("/incidents/{incident_id}")
def get_incident(
    incident_id: int,
    current_user: dict = Depends(get_current_user)
):

    with SessionLocal() as db:

        incident = (
            db.query(Incident)
            .filter(Incident.id == incident_id)
            .first()
        )

        if not incident:

            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Incident not found"
            )

        return {
            "id": incident.id,
            "incident_reference": incident.incident_reference,
            "title": incident.title,
            "incident_type": incident.incident_type,
            "severity": incident.severity,
            "status": incident.status,
            "risk_score": incident.risk_score,
            "description": incident.description,
            "is_resolved": incident.is_resolved,
            "created_at": incident.created_at
        }


# =========================
# RESOLVE INCIDENT
# =========================

@app.patch("/incidents/{incident_id}/resolve")
def resolve_incident(
    incident_id: int,
    current_user: dict = Depends(get_current_user)
):

    with SessionLocal() as db:

        incident = (
            db.query(Incident)
            .filter(Incident.id == incident_id)
            .first()
        )

        if not incident:

            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Incident not found"
            )

        if incident.is_resolved:

            return {
                "message": "Incident is already resolved",
                "incident_id": incident.id,
                "incident_reference": incident.incident_reference,
                "status": incident.status,
                "is_resolved": incident.is_resolved
            }

        incident.status = "resolved"
        incident.is_resolved = True

        db.commit()
        db.refresh(incident)

        return {
            "message": "Incident resolved successfully",
            "incident_id": incident.id,
            "incident_reference": incident.incident_reference,
            "status": incident.status,
            "is_resolved": incident.is_resolved,
            "resolved_by": current_user["user_id"]
        }


# =========================
# ALERT MANAGEMENT
# =========================

@app.get("/alerts")
def get_all_alerts(
    current_user: dict = Depends(get_current_user)
):

    with SessionLocal() as db:

        alerts = (
            db.query(Alert)
            .order_by(
                Alert.created_at.desc()
            )
            .all()
        )

        return {
            "count": len(alerts),
            "alerts": [
                {
                    "id": alert.id,
                    "incident_reference": alert.incident_reference,
                    "priority": alert.priority,
                    "title": alert.title,
                    "message": alert.message,
                    "status": alert.status,
                    "created_at": alert.created_at
                }
                for alert in alerts
            ]
        }


# =========================
# INCIDENT RESPONSE
# =========================

@app.post("/incidents/{incident_id}/response")
def create_incident_response(
    incident_id: int,
    current_user: dict = Depends(get_current_user)
):

    with SessionLocal() as db:

        incident = (
            db.query(Incident)
            .filter(Incident.id == incident_id)
            .first()
        )

        if not incident:

            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Incident not found"
            )

        response = create_response_action(
            incident_reference=incident.incident_reference,
            severity=incident.severity,
            risk_score=incident.risk_score
        )

        stored_response = ResponseAction(
            incident_reference=response["incident_reference"],
            action=response["action"],
            status=response["status"],
            requires_authorization=response["requires_authorization"],
            requested_by=current_user["user_id"]
        )

        db.add(stored_response)
        db.commit()
        db.refresh(stored_response)

        return {
            "message": "Response recommendation generated",

            "incident": {
                "id": incident.id,
                "incident_reference": incident.incident_reference,
                "severity": incident.severity,
                "risk_score": incident.risk_score,
                "status": incident.status
            },

            "response": {
                "id": stored_response.id,
                "incident_reference": stored_response.incident_reference,
                "action": stored_response.action,
                "status": stored_response.status,
                "requires_authorization": stored_response.requires_authorization,
                "requested_by": stored_response.requested_by,
                "created_at": stored_response.created_at
            },

            "requested_by": current_user["user_id"]
        }