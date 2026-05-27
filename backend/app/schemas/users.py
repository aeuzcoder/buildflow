from datetime import datetime

from pydantic import BaseModel, ConfigDict, EmailStr, Field

from app.db.models import UserRole


class UserProfileBase(BaseModel):
    full_name: str | None = Field(None, min_length=1, max_length=255)
    phone: str | None = Field(None, max_length=50)
    contact_email: EmailStr | str | None = None
    address: str | None = None
    city: str | None = Field(None, max_length=100)
    company: str | None = Field(None, max_length=255)
    notes: str | None = None


class UserProfileUpdate(UserProfileBase):
    pass


class UserOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    email: str
    full_name: str
    role: UserRole
    is_active: bool
    phone: str | None = None
    contact_email: str | None = None
    address: str | None = None
    city: str | None = None
    company: str | None = None
    notes: str | None = None
    created_at: datetime


class UserListOut(UserOut):
    pass


class UserDetailOut(UserOut):
    pass


class UserAdminCreate(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8)
    full_name: str = Field(min_length=1, max_length=255)
    role: UserRole
    is_active: bool = True
    phone: str | None = Field(None, max_length=50)
    contact_email: EmailStr | str | None = None
    address: str | None = None
    city: str | None = Field(None, max_length=100)
    company: str | None = Field(None, max_length=255)
    notes: str | None = None


class UserAdminUpdate(BaseModel):
    email: EmailStr | None = None
    password: str | None = Field(None, min_length=8)
    full_name: str | None = Field(None, min_length=1, max_length=255)
    role: UserRole | None = None
    is_active: bool | None = None
    phone: str | None = Field(None, max_length=50)
    contact_email: EmailStr | str | None = None
    address: str | None = None
    city: str | None = Field(None, max_length=100)
    company: str | None = Field(None, max_length=255)
    notes: str | None = None
