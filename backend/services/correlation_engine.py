def calculate_combined_risk(
    transaction_risk: float,
    security_event_risk: float
) -> float:

    combined_score = (
        transaction_risk * 0.5
        + security_event_risk * 0.5
    )

    return min(
        round(combined_score, 2),
        100.0
    )


def determine_correlation_level(
    combined_score: float
) -> str:

    if combined_score >= 75:
        return "critical"

    if combined_score >= 50:
        return "high"

    if combined_score >= 25:
        return "medium"

    return "low"


def build_correlation_result(
    transaction_reference,
    security_event_id,
    transaction_risk,
    security_event_risk,
    device_id=None
):

    combined_score = calculate_combined_risk(
        transaction_risk,
        security_event_risk
    )

    return {
        "device_id": device_id,
        "transaction_reference": transaction_reference,
        "security_event_id": security_event_id,
        "transaction_risk": transaction_risk,
        "security_event_risk": security_event_risk,
        "combined_risk_score": combined_score,
        "correlation_level": determine_correlation_level(
            combined_score
        )
    }