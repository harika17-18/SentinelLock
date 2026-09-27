# =========================
# SENTINELLOCK INCIDENT ENGINE
# =========================

from services.incident_service import build_incident_data


def create_correlated_incident(
    transaction_reference: str,
    security_event_id: int,
    combined_risk_score: float,
    correlation_level: str
) -> dict:
    """
    Create incident data from a correlated
    transaction and security event.
    """

    incident_reference = (
        f"INC-{transaction_reference}-{security_event_id}"
    )

    title = "Correlated Suspicious Financial Activity"

    description = (
        f"Transaction {transaction_reference} was correlated "
        f"with security event {security_event_id}. "
        f"Combined risk score: {combined_risk_score}."
    )

    return build_incident_data(
        incident_reference=incident_reference,
        title=title,
        incident_type="correlated_financial_security_event",
        risk_score=combined_risk_score,
        description=description
    )