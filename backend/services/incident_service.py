def determine_incident_severity(risk_score: float) -> str:
    if risk_score >= 75:
        return "critical"

    if risk_score >= 50:
        return "high"

    if risk_score >= 25:
        return "medium"

    return "low"


def build_incident_data(
    incident_reference,
    title,
    incident_type,
    risk_score,
    description
):
    return {
        "incident_reference": incident_reference,
        "title": title,
        "incident_type": incident_type,
        "severity": determine_incident_severity(risk_score),
        "status": "open",
        "risk_score": risk_score,
        "description": description,
        "is_resolved": False
    }