from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field

from app.db.models import DeliveryStatus
from app.schemas.orders import OrderListOut


class DeliveryOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    order_id: int
    driver_id: int
    vehicle_number: str
    status: DeliveryStatus
    scheduled_at: datetime
    started_at: datetime | None
    delivered_at: datetime | None
    notes: str | None
    order: OrderListOut | None = None


class DeliveryStatusUpdate(BaseModel):
    status: DeliveryStatus
    notes: str | None = None

    @classmethod
    def allowed_driver_statuses(cls) -> set[DeliveryStatus]:
        return {
            DeliveryStatus.LOADING,
            DeliveryStatus.IN_TRANSIT,
            DeliveryStatus.DELIVERED,
            DeliveryStatus.FAILED,
        }
