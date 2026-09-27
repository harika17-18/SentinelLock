# =========================
# SENTINELLOCK EVIDENCE SERVICE
# =========================

from datetime import datetime


def create_evidence(
    evidence_type: str,
    reference: str,
    description: str,
    source: str
) -> dict:
    return {
        "evidence_type": evidence_type,
        "reference": reference,
        "description": description,
        "source": source,
        "collected_at": datetime.utcnow(),
        "integrity_status": "verified"
    }


def build_evidence_package(evidence_items: list[dict]) -> dict:
    return {
        "evidence_count": len(evidence_items),
        "items": evidence_items,
        "status": "ready_for_investigation"
    }