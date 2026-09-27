# =========================
# SENTINELLOCK MONEY FLOW SERVICE
# =========================

def build_money_flow(
    transaction_reference: str,
    sender_identifier: str,
    receiver_identifier: str,
    amount: float,
    transaction_type: str,
    status: str
) -> dict:
    """
    Build a normalized representation of financial movement
    for investigation.
    """

    return {
        "transaction_reference": transaction_reference,
        "transaction_type": transaction_type,
        "sender": sender_identifier,
        "receiver": receiver_identifier,
        "amount": amount,
        "status": status,
        "flow": [
            {
                "from": sender_identifier,
                "to": receiver_identifier,
                "amount": amount
            }
        ]
    }


def build_money_flow_chain(transactions: list[dict]) -> list[dict]:
    """
    Build a chronological money-flow chain from transactions.
    """

    return [
        {
            "step": index + 1,
            "transaction_reference": transaction["transaction_reference"],
            "from": transaction["sender"],
            "to": transaction["receiver"],
            "amount": transaction["amount"]
        }
        for index, transaction in enumerate(transactions)
    ]