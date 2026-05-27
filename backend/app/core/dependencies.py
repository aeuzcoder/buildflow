from typing import Callable

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from app.core.security import decode_token
from app.db.database import get_db
from app.db.models import User, UserRole
from app.schemas.auth import TokenData

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")


def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = decode_token(token)
        user_id = payload.get("sub")
        if user_id is None:
            raise credentials_exception
        token_data = TokenData(
            user_id=int(user_id),
            email=payload.get("email", ""),
            role=UserRole(payload.get("role")),
        )
    except (ValueError, KeyError, TypeError):
        raise credentials_exception from None

    user = db.query(User).filter(User.id == token_data.user_id).first()
    if user is None:
        raise credentials_exception
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Inactive user account",
        )
    return user


def require_admin(user: User) -> User:
    return _require_role(user, UserRole.ADMIN)


def require_warehouse_manager(user: User) -> User:
    return _require_role(user, UserRole.WAREHOUSE_MANAGER)


def require_driver(user: User) -> User:
    return _require_role(user, UserRole.DRIVER)


def require_site_manager(user: User) -> User:
    return _require_role(user, UserRole.SITE_MANAGER)


def require_supplier(user: User) -> User:
    return _require_role(user, UserRole.SUPPLIER)


def require_any_of(roles: list[UserRole], user: User) -> User:
    if user.role not in roles:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Requires one of roles: {[r.value for r in roles]}",
        )
    return user


def _require_role(user: User, role: UserRole) -> User:
    if user.role != role:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Requires role: {role.value}",
        )
    return user


def require_roles(*roles: UserRole) -> Callable[..., User]:
    def dependency(current_user: User = Depends(get_current_user)) -> User:
        return require_any_of(list(roles), current_user)

    return dependency
