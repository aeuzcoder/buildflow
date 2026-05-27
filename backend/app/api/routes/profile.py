from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_user
from app.db.database import get_db
from app.db.models import User
from app.schemas.users import UserDetailOut, UserProfileUpdate
from app.services import user_service

router = APIRouter(prefix="/profile", tags=["profile"])


@router.get("/me", response_model=UserDetailOut)
def get_my_profile(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """GET /profile/me — view own profile."""
    return user_service.get_own_profile(db, current_user)


@router.patch("/me", response_model=UserDetailOut)
def update_my_profile(
    data: UserProfileUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """PATCH /profile/me — update own additional info (not role/status)."""
    return user_service.update_own_profile(db, current_user, data)
