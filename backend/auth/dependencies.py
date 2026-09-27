# =========================
# SENTINELLOCK AUTH DEPENDENCIES
# =========================

from typing import Callable

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from .jwt_handler import decode_access_token


# =========================
# AUTHENTICATION SCHEME
# =========================

security_scheme = HTTPBearer(
    auto_error=False
)


# =========================
# SUPPORTED ROLES
# =========================

SUPPORTED_ROLES = {
    "user",
    "investigator",
    "admin",
}


# =========================
# GET CURRENT USER
# =========================

def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(
        security_scheme
    )
) -> dict:

    # No Authorization header/token
    if credentials is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication credentials are required",
            headers={
                "WWW-Authenticate": "Bearer"
            }
        )

    try:
        payload = decode_access_token(
            credentials.credentials
        )

        user_id = payload.get("sub")
        role = payload.get("role")

        if user_id is None or role is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid authentication token",
                headers={
                    "WWW-Authenticate": "Bearer"
                }
            )

        if role not in SUPPORTED_ROLES:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Unsupported user role"
            )

        try:
            user_id = int(user_id)
        except (TypeError, ValueError):

            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid authentication token",
                headers={
                    "WWW-Authenticate": "Bearer"
                }
            )

        return {
            "user_id": user_id,
            "role": role
        }

    except HTTPException:
        raise

    except Exception:

        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired authentication token",
            headers={
                "WWW-Authenticate": "Bearer"
            }
        )


# =========================
# MULTI-ROLE AUTHORIZATION
# =========================

def require_roles(
    *required_roles: str
) -> Callable:

    if not required_roles:
        raise ValueError(
            "At least one required role must be provided"
        )

    invalid_roles = set(required_roles) - SUPPORTED_ROLES

    if invalid_roles:
        raise ValueError(
            f"Unsupported roles: {sorted(invalid_roles)}"
        )

    def role_checker(
        current_user: dict = Depends(
            get_current_user
        )
    ) -> dict:

        if current_user["role"] not in required_roles:

            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Insufficient permissions"
            )

        return current_user

    return role_checker


# =========================
# SINGLE-ROLE COMPATIBILITY
# =========================

def require_role(
    required_role: str
) -> Callable:

    return require_roles(
        required_role
    )