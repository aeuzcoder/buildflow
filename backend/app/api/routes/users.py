from fastapi import APIRouter, Depends, Response, status
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_user, require_roles
from app.db.database import get_db
from app.db.models import User, UserRole
from app.schemas.users import UserAdminCreate, UserAdminUpdate, UserDetailOut, UserListOut
from app.services import user_service

router = APIRouter(tags=["users"])


@router.get("", response_model=list[UserListOut])
def list_users(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.ADMIN)),
):
    """GET /users — admin only."""
    return user_service.list_users(db, current_user)


@router.post("", response_model=UserDetailOut, status_code=status.HTTP_201_CREATED)
def create_user(
    data: UserAdminCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.ADMIN)),
):
    """POST /users — admin creates user with any role."""
    return user_service.create_user(db, current_user, data)


@router.get("/{user_id}", response_model=UserDetailOut)
def get_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """GET /users/{id} — admin any user; others only self."""
    return user_service.get_user(db, current_user, user_id)


@router.patch("/{user_id}", response_model=UserDetailOut)
def update_user(
    user_id: int,
    data: UserAdminUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.ADMIN)),
):
    """PATCH /users/{id} — admin edits any user."""
    return user_service.update_user(db, current_user, user_id, data)


@router.patch("/{user_id}/deactivate", response_model=UserDetailOut)
def deactivate_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.ADMIN)),
):
    """PATCH /users/{id}/deactivate — admin deactivates user."""
    return user_service.deactivate_user(db, current_user, user_id)


@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.ADMIN)),
):
    """DELETE /users/{id} — admin deletes user without related records."""
    user_service.delete_user(db, current_user, user_id)
    return Response(status_code=status.HTTP_204_NO_CONTENT)
