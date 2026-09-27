# =========================
# SENTINELLOCK RISK ENGINE
# =========================

def calculate_transaction_risk(
    amount: float,
    security_risk: float = 0.0
) -> float:
    """
    Calculate a basic risk score for a transaction.

    This is the initial rule-based engine.
    ML-based risk analysis can be integrated later.
    """

    risk_score = 0.0

    # Amount-based risk
    if amount >= 100000:
        risk_score += 50
    elif amount >= 50000:
        risk_score += 35
    elif amount >= 10000:
        risk_score += 20
    elif amount >= 5000:
        risk_score += 10

    # Security-event risk contribution
    risk_score += security_risk

    # Keep score within 0–100
    risk_score = min(risk_score, 100.0)

    return risk_score


def get_risk_level(risk_score: float) -> str:
    """
    Convert a numerical risk score into a severity level.
    """

    if risk_score >= 75:
        return "critical"

    if risk_score >= 50:
        return "high"

    if risk_score >= 25:
        return "medium"

    return "low"