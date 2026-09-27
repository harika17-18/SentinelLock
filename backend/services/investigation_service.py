# =========================
# SENTINELLOCK INVESTIGATION SERVICE
# =========================

from datetime import datetime


def build_investigation_event(
    event_type: str,
    reference: str,
    description: str,
    risk_score: float = 0.0,
    timestamp: datetime | None = None
) -> dict:
    """
    Create a standardized event for the investigation timeline.
    """

    return {
        "event_type": event_type,
        "reference": reference,
        "description": description,
        "risk_score": risk_score,
        "timestamp": timestamp or datetime.utcnow()
    }


def build_investigation_timeline(events: list[dict]) -> list[dict]:
    """
    Sort investigation events chronologically.
    """

    return sorted(
        events,
        key=lambda event: event["timestamp"]
    )