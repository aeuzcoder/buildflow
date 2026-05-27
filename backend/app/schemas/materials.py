from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict, Field


class MaterialBrief(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    unit: str
    category: str
    price_per_unit: Decimal


class MaterialCreate(BaseModel):
    name: str = Field(min_length=1, max_length=255)
    unit: str = Field(min_length=1, max_length=20)
    category: str = Field(min_length=1, max_length=100)
    supplier_id: int | None = None
    price_per_unit: Decimal = Field(gt=0)
    stock_quantity: Decimal = Field(ge=0, default=0)


class MaterialUpdate(BaseModel):
    name: str | None = Field(None, min_length=1, max_length=255)
    unit: str | None = Field(None, min_length=1, max_length=20)
    category: str | None = Field(None, min_length=1, max_length=100)
    price_per_unit: Decimal | None = Field(None, gt=0)
    stock_quantity: Decimal | None = Field(None, ge=0)


class MaterialOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    unit: str
    category: str
    supplier_id: int
    price_per_unit: Decimal
    stock_quantity: Decimal
    created_at: datetime
