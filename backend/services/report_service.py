# =========================
# SENTINELLOCK REPORT SERVICE
# =========================

from datetime import datetime


def generate_investigation_report(
    incident_reference: str,
    incident_data: dict,
    timeline: list[dict],
    money_flow: list[dict],
    evidence: list[dict]
) -> dict:

    return {
        "report_type": "digital_forensics_investigation",
        "incident_reference": incident_reference,
        "generated_at": datetime.utcnow(),
        "incident": incident_data,
        "timeline": timeline,
        "money_flow": money_flow,
        "evidence": evidence,
        "status": "generated"
    }