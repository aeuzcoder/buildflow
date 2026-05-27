from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field

from app.db.models import SiteStatus


class SiteBrief(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    address: str
    status: SiteStatus


class SiteCreate(BaseModel):
    name: str = Field(min_length=1, max_length=255)
    address: str = Field(min_length=1)
    latitude: float = Field(ge=-90, le=90)
    longitude: float = Field(ge=-180, le=180)
    site_manager_id: int | None = None
    status: SiteStatus = SiteStatus.ACTIVE


class SiteUpdate(BaseModel):
    name: str | None = Field(None, min_length=1, max_length=255)
    address: str | None = None
    latitude: float | None = Field(None, ge=-90, le=90)
    longitude: float | None = Field(None, ge=-180, le=180)
    site_manager_id: int | None = None
    status: SiteStatus | None = None


class SiteManagerBrief(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    full_name: str
    email: str
    phone: str | None = None


class SiteOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    address: str
    latitude: float
    longitude: float
    site_manager_id: int
    status: SiteStatus
    created_at: datetime
    site_manager: SiteManagerBrief | None = None
