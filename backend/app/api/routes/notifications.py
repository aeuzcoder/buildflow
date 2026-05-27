from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_user
from app.db.database import get_db
from app.db.models import User
from app.schemas.common import MessageOut
from app.schemas.notifications import NotificationOut
from app.services import notification_service

router = APIRouter(tags=["notifications"])


@router.get("", response_model=list[NotificationOut])
def list_notifications(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """GET /notifications — current user's notifications only."""
    return notification_service.list_notifications(db, current_user)


@router.patch("/read-all", response_model=MessageOut)
def mark_all_read(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """PATCH /notifications/read-all — mark all own notifications as read."""
    count = notification_service.mark_all_as_read(db, current_user)
    return MessageOut(message=f"Marked {count} notification(s) as read")


@router.patch("/{notification_id}/read", response_model=NotificationOut)
def mark_notification_read(
    notification_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """PATCH /notifications/{id}/read — mark own notification as read."""
    return notification_service.mark_as_read(db, current_user, notification_id)
