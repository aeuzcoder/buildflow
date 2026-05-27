from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict, Field


class MessageOut(BaseModel):
    message: str


class TimestampMixin(BaseModel):
    created_at: datetime
