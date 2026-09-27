# =========================
# SENTINELLOCK AUTH DEPENDENCIES
# =========================

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

from .jwt_handler import decode_access_token


security_scheme = HTTPBearer()


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(
        security_scheme
    )
) -> dict:

    try:
        payload = decode_access_token(
            credentials.credentials
        )

        return {
            "user_id": int(payload["sub"]),
            "role": payload["role"]
        }

    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired authentication token"
        )


def require_role(required_role: str):

    def role_checker(
        current_user: dict = Depends(get_current_user)
    ):

        if current_user["role"] != required_role:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Insufficient permissions"
            )

        return current_user

    return role_checker