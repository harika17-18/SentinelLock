# =========================
# SENTINELLOCK RESPONSE SERVICE
# =========================

def determine_response_action(
    severity: str,
    risk_score: float
) -> str:

    if risk_score >= 75 or severity == "critical":
        return "immediate_review"

    if risk_score >= 50 or severity == "high":
        return "priority_review"

    if risk_score >= 25 or severity == "medium":
        return "investigate"

    return "monitor"


def create_response_action(
    incident_reference: str,
    severity: str,
    risk_score: float
) -> dict:

    action = determine_response_action(
        severity,
        risk_score
    )

    return {
        "incident_reference": incident_reference,
        "action": action,
        "status": "pending",
        "requires_authorization": True
    }