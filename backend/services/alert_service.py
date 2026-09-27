# =========================
# SENTINELLOCK ALERT SERVICE
# =========================

def determine_alert_priority(risk_score: float) -> str:
    """
    Determine alert priority from the incident risk score.
    """

    if risk_score >= 75:
        return "critical"

    if risk_score >= 50:
        return "high"

    if risk_score >= 25:
        return "medium"

    return "low"


def create_alert(
    incident_reference: str,
    risk_score: float,
    title: str,
    message: str
) -> dict:
    """
    Prepare an alert for an open SentinelLock incident.
    """

    return {
        "incident_reference": incident_reference,
        "priority": determine_alert_priority(risk_score),
        "title": title,
        "message": message,
        "status": "new"
    }