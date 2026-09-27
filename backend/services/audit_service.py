# =========================
# SENTINELLOCK AUDIT SERVICE
# =========================

from datetime import datetime


def create_audit_record(
    actor: str,
    action: str,
    resource_type: str,
    resource_reference: str,
    description: str
) -> dict:

    return {
        "actor": actor,
        "action": action,
        "resource_type": resource_type,
        "resource_reference": resource_reference,
        "description": description,
        "timestamp": datetime.utcnow()
    }