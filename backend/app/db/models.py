import enum
from datetime import datetime

from sqlalchemy import (
    Boolean,
    Column,
    DateTime,
    Enum,
    Float,
    ForeignKey,
    Integer,
    Numeric,
    String,
    Text,
    UniqueConstraint,
)
from sqlalchemy.orm import declarative_base, relationship

Base = declarative_base()


class UserRole(str, enum.Enum):
    ADMIN = "admin"
    WAREHOUSE_MANAGER = "warehouse_manager"
    DRIVER = "driver"
    SITE_MANAGER = "site_manager"
    SUPPLIER = "supplier"


class SiteStatus(str, enum.Enum):
    ACTIVE = "active"
    PAUSED = "paused"
    COMPLETED = "completed"


class OrderStatus(str, enum.Enum):
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"
    IN_TRANSIT = "in_transit"
    DELIVERED = "delivered"
    CANCELLED = "cancelled"


class DeliveryStatus(str, enum.Enum):
    ASSIGNED = "assigned"
    LOADING = "loading"
    IN_TRANSIT = "in_transit"
    DELIVERED = "delivered"
    FAILED = "failed"


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, nullable=False, index=True)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=False)
    role = Column(Enum(UserRole, name="user_role"), nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    phone = Column(String(50), nullable=True)
    contact_email = Column(String(255), nullable=True)
    address = Column(Text, nullable=True)
    city = Column(String(100), nullable=True)
    company = Column(String(255), nullable=True)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    managed_sites = relationship(
        "ConstructionSite",
        back_populates="site_manager",
        foreign_keys="ConstructionSite.site_manager_id",
    )
    supplier_profile = relationship(
        "Supplier",
        back_populates="user",
        uselist=False,
    )
    orders_created = relationship(
        "Order",
        back_populates="creator",
        foreign_keys="Order.created_by",
    )
    orders_approved = relationship(
        "Order",
        back_populates="approver",
        foreign_keys="Order.approved_by",
    )
    deliveries = relationship("Delivery", back_populates="driver")
    notifications = relationship("Notification", back_populates="user")


class ConstructionSite(Base):
    __tablename__ = "construction_sites"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    address = Column(Text, nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    site_manager_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    status = Column(Enum(SiteStatus, name="site_status"), nullable=False, default=SiteStatus.ACTIVE)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    site_manager = relationship(
        "User",
        back_populates="managed_sites",
        foreign_keys=[site_manager_id],
    )
    orders = relationship("Order", back_populates="site")


class Supplier(Base):
    __tablename__ = "suppliers"

    id = Column(Integer, primary_key=True, index=True)
    company_name = Column(String(255), nullable=False)
    contact_email = Column(String(255), nullable=False)
    phone = Column(String(50), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    is_verified = Column(Boolean, default=False, nullable=False)

    user = relationship("User", back_populates="supplier_profile")
    materials = relationship("Material", back_populates="supplier")


class Material(Base):
    __tablename__ = "materials"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    unit = Column(String(20), nullable=False)  # kg, m3, piece
    category = Column(String(100), nullable=False)
    supplier_id = Column(Integer, ForeignKey("suppliers.id"), nullable=False)
    price_per_unit = Column(Numeric(12, 2), nullable=False)
    stock_quantity = Column(Numeric(12, 2), nullable=False, default=0)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    supplier = relationship("Supplier", back_populates="materials")
    order_items = relationship("OrderItem", back_populates="material")


class Order(Base):
    __tablename__ = "orders"

    id = Column(Integer, primary_key=True, index=True)
    site_id = Column(Integer, ForeignKey("construction_sites.id"), nullable=False)
    created_by = Column(Integer, ForeignKey("users.id"), nullable=False)
    approved_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    status = Column(
        Enum(OrderStatus, name="order_status"),
        nullable=False,
        default=OrderStatus.PENDING,
    )
    delivery_date = Column(DateTime, nullable=False)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(
        DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
        nullable=False,
    )

    site = relationship("ConstructionSite", back_populates="orders")
    creator = relationship(
        "User",
        back_populates="orders_created",
        foreign_keys=[created_by],
    )
    approver = relationship(
        "User",
        back_populates="orders_approved",
        foreign_keys=[approved_by],
    )
    items = relationship(
        "OrderItem",
        back_populates="order",
        cascade="all, delete-orphan",
    )
    delivery = relationship(
        "Delivery",
        back_populates="order",
        uselist=False,
    )


class OrderItem(Base):
    __tablename__ = "order_items"

    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("orders.id"), nullable=False)
    material_id = Column(Integer, ForeignKey("materials.id"), nullable=False)
    quantity = Column(Numeric(12, 2), nullable=False)
    unit_price = Column(Numeric(12, 2), nullable=False)

    order = relationship("Order", back_populates="items")
    material = relationship("Material", back_populates="order_items")


class Delivery(Base):
    __tablename__ = "deliveries"
    __table_args__ = (UniqueConstraint("order_id", name="uq_delivery_order_id"),)

    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("orders.id"), nullable=False, unique=True)
    driver_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    vehicle_number = Column(String(50), nullable=False)
    status = Column(
        Enum(DeliveryStatus, name="delivery_status"),
        nullable=False,
        default=DeliveryStatus.ASSIGNED,
    )
    scheduled_at = Column(DateTime, nullable=False)
    started_at = Column(DateTime, nullable=True)
    delivered_at = Column(DateTime, nullable=True)
    notes = Column(Text, nullable=True)

    order = relationship("Order", back_populates="delivery")
    driver = relationship("User", back_populates="deliveries")


class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    title = Column(String(255), nullable=False)
    message = Column(Text, nullable=False)
    is_read = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    user = relationship("User", back_populates="notifications")
