from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict, Field

from app.db.models import OrderStatus
from app.schemas.materials import MaterialBrief
from app.schemas.sites import SiteBrief


class OrderItemCreate(BaseModel):
    material_id: int
    quantity: Decimal = Field(gt=0)


class OrderCreate(BaseModel):
    site_id: int
    delivery_date: datetime
    notes: str | None = None
    items: list[OrderItemCreate] = Field(min_length=1)


class OrderItemOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    material_id: int
    quantity: Decimal
    unit_price: Decimal
    material: MaterialBrief | None = None


class OrderOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    site_id: int
    created_by: int
    approved_by: int | None
    status: OrderStatus
    delivery_date: datetime
    notes: str | None
    created_at: datetime
    updated_at: datetime
    site: SiteBrief | None = None
    items: list[OrderItemOut] = []


class OrderListOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    site_id: int
    created_by: int
    status: OrderStatus
    delivery_date: datetime
    notes: str | None
    created_at: datetime
    site: SiteBrief | None = None
