import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class UserBase(BaseModel):
    email: str = Field(..., max_length=255)
    full_name: str | None = None


class UserCreate(UserBase):
    clerk_id: str = Field(..., min_length=1, max_length=255)


class UserSync(BaseModel):
    clerk_id: str = Field(..., min_length=1, max_length=255)
    email: str = Field(..., max_length=255)
    full_name: str | None = None


class UserRegister(BaseModel):
    email: str = Field(..., max_length=255)
    full_name: str | None = None
    password: str = Field(..., min_length=8, max_length=128)


class UserLogin(BaseModel):
    email: str = Field(..., max_length=255)
    password: str = Field(..., min_length=1, max_length=128)


class UserUpdate(BaseModel):
    email: str | None = Field(default=None, max_length=255)
    full_name: str | None = None


class UserResponse(UserBase):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    clerk_id: str
    created_at: datetime
    updated_at: datetime
