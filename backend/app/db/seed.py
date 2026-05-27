from datetime import datetime, timedelta
from decimal import Decimal

from sqlalchemy.orm import Session

from app.core.security import hash_password
from app.db.models import (
    ConstructionSite,
    Delivery,
    DeliveryStatus,
    Material,
    Notification,
    Order,
    OrderItem,
    OrderStatus,
    SiteStatus,
    Supplier,
    User,
    UserRole,
)

DEFAULT_PASSWORD = "BuildFlow123"


def _clear_existing_data(db: Session) -> None:
    db.query(Notification).delete()
    db.query(Delivery).delete()
    db.query(OrderItem).delete()
    db.query(Order).delete()
    db.query(Material).delete()
    db.query(Supplier).delete()
    db.query(ConstructionSite).delete()
    db.query(User).delete()
    db.commit()


def seed_database(db: Session) -> None:
    _clear_existing_data(db)

    # --- Users ---
    users = {
        "admin": User(
            email="admin@buildflow.uz",
            hashed_password=hash_password("Admin123"),
            full_name="Admin User",
            role=UserRole.ADMIN,
            phone="+998901112233",
            contact_email="admin.contact@buildflow.uz",
            address="Amir Temur ko'chasi 1",
            city="Toshkent",
            company="BuildFlow HQ",
        ),
        "warehouse": User(
            email="warehouse@buildflow.uz",
            hashed_password=hash_password(DEFAULT_PASSWORD),
            full_name="Ombor Menejeri",
            role=UserRole.WAREHOUSE_MANAGER,
            phone="+998903334455",
            city="Toshkent",
            company="BuildFlow Warehouse",
        ),
        "driver1": User(
            email="driver1@buildflow.uz",
            hashed_password=hash_password(DEFAULT_PASSWORD),
            full_name="Javohir Haydarov",
            role=UserRole.DRIVER,
            phone="+998905556677",
            city="Toshkent",
        ),
        "driver2": User(
            email="driver2@buildflow.uz",
            hashed_password=hash_password(DEFAULT_PASSWORD),
            full_name="Sardor Qodirov",
            role=UserRole.DRIVER,
            phone="+998907778899",
            city="Toshkent",
        ),
        "site1": User(
            email="site1@buildflow.uz",
            hashed_password=hash_password(DEFAULT_PASSWORD),
            full_name="Bobur Rahimov",
            role=UserRole.SITE_MANAGER,
            phone="+998909990011",
            city="Toshkent",
            company="Toshkent City Plaza",
        ),
        "site2": User(
            email="site2@buildflow.uz",
            hashed_password=hash_password(DEFAULT_PASSWORD),
            full_name="Dilshod Karimov",
            role=UserRole.SITE_MANAGER,
            phone="+998901234567",
            city="Toshkent",
            company="Chilonzor Business Center",
        ),
        "supplier1": User(
            email="supplier1@buildflow.uz",
            hashed_password=hash_password(DEFAULT_PASSWORD),
            full_name="Alisher Nazarov",
            role=UserRole.SUPPLIER,
            phone="+998901234567",
            contact_email="alisher@metalpro.uz",
            company="MetalPro Uz",
            city="Toshkent",
        ),
        "supplier2": User(
            email="supplier2@buildflow.uz",
            hashed_password=hash_password(DEFAULT_PASSWORD),
            full_name="Rustam Tursunov",
            role=UserRole.SUPPLIER,
            phone="+998907654321",
            contact_email="rustam@qurilishresurs.uz",
            company="Qurilish Resurs",
            city="Toshkent",
        ),
    }
    db.add_all(users.values())
    db.flush()

    # --- Construction sites (8 mock sites, mixed statuses) ---
    sites = [
        ConstructionSite(
            name="Toshkent City Plaza",
            address="Amir Temur ko'chasi 108, Toshkent",
            latitude=41.3111,
            longitude=69.2797,
            site_manager_id=users["site1"].id,
            status=SiteStatus.ACTIVE,
        ),
        ConstructionSite(
            name="Yunusobod 16-kv",
            address="Yunusobod tumani, 16-mavze, Toshkent",
            latitude=41.3547,
            longitude=69.2864,
            site_manager_id=users["site1"].id,
            status=SiteStatus.ACTIVE,
        ),
        ConstructionSite(
            name="Mirzo Ulug'bek Residence",
            address="Mirzo Ulug'bek tumani, Buyuk ipak yo'li 12, Toshkent",
            latitude=41.3412,
            longitude=69.3348,
            site_manager_id=users["site1"].id,
            status=SiteStatus.PAUSED,
        ),
        ConstructionSite(
            name="Samarqand Registon Mall",
            address="Registon ko'chasi 15, Samarqand",
            latitude=39.6542,
            longitude=66.9597,
            site_manager_id=users["site1"].id,
            status=SiteStatus.COMPLETED,
        ),
        ConstructionSite(
            name="Chilonzor Business Center",
            address="Chilonzor tumani, Bunyodkor ko'chasi 45, Toshkent",
            latitude=41.2756,
            longitude=69.2034,
            site_manager_id=users["site2"].id,
            status=SiteStatus.ACTIVE,
        ),
        ConstructionSite(
            name="Sergeli Metro Plaza",
            address="Sergeli tumani, Temur Malik ko'chasi 88, Toshkent",
            latitude=41.2263,
            longitude=69.2281,
            site_manager_id=users["site2"].id,
            status=SiteStatus.ACTIVE,
        ),
        ConstructionSite(
            name="Qoraqalpog'iston Ishlab chiqarish",
            address="Nukus shahri, Beruniy ko'chasi 22, Qoraqalpog'iston",
            latitude=42.4611,
            longitude=59.6003,
            site_manager_id=users["site2"].id,
            status=SiteStatus.PAUSED,
        ),
        ConstructionSite(
            name="Andijon Textile Factory",
            address="Andijon shahri, Boburshoh ko'chasi 7, Andijon",
            latitude=40.7821,
            longitude=72.3442,
            site_manager_id=users["site2"].id,
            status=SiteStatus.COMPLETED,
        ),
    ]
    db.add_all(sites)
    db.flush()

    # --- Suppliers ---
    suppliers = [
        Supplier(
            company_name="MetalPro Uz",
            contact_email="info@metalpro.uz",
            phone="+998901234567",
            user_id=users["supplier1"].id,
            is_verified=True,
        ),
        Supplier(
            company_name="Qurilish Resurs",
            contact_email="sales@qurilishresurs.uz",
            phone="+998907654321",
            user_id=users["supplier2"].id,
            is_verified=True,
        ),
    ]
    db.add_all(suppliers)
    db.flush()

    # --- Materials ---
    materials = [
        Material(
            name="Cement M400",
            unit="kg",
            category="Beton va qog'oz",
            supplier_id=suppliers[1].id,
            price_per_unit=Decimal("2500"),
            stock_quantity=Decimal("50000"),
        ),
        Material(
            name="Armatura 12mm",
            unit="kg",
            category="Metall buyumlar",
            supplier_id=suppliers[0].id,
            price_per_unit=Decimal("8500"),
            stock_quantity=Decimal("12000"),
        ),
        Material(
            name="G'isht",
            unit="dona",
            category="Qurilish materiallari",
            supplier_id=suppliers[1].id,
            price_per_unit=Decimal("850"),
            stock_quantity=Decimal("200000"),
        ),
        Material(
            name="Qum",
            unit="m3",
            category="Inert materiallar",
            supplier_id=suppliers[1].id,
            price_per_unit=Decimal("120000"),
            stock_quantity=Decimal("500"),
        ),
        Material(
            name="Shag'al",
            unit="m3",
            category="Inert materiallar",
            supplier_id=suppliers[1].id,
            price_per_unit=Decimal("180000"),
            stock_quantity=Decimal("300"),
        ),
        Material(
            name="Profil 60x40",
            unit="m",
            category="Metall buyumlar",
            supplier_id=suppliers[0].id,
            price_per_unit=Decimal("15000"),
            stock_quantity=Decimal("8000"),
        ),
        Material(
            name="Suv izolyatsiya",
            unit="m2",
            category="Izolyatsiya",
            supplier_id=suppliers[1].id,
            price_per_unit=Decimal("45000"),
            stock_quantity=Decimal("2500"),
        ),
        Material(
            name="Elektr kabel",
            unit="m",
            category="Elektr jihozlari",
            supplier_id=suppliers[0].id,
            price_per_unit=Decimal("12000"),
            stock_quantity=Decimal("15000"),
        ),
    ]
    db.add_all(materials)
    db.flush()

    now = datetime.utcnow()
    delivery_base = now + timedelta(days=7)

    # --- Orders (spread across sites) ---
    orders_data = [
        {
            "site": sites[0],
            "creator": users["site1"],
            "status": OrderStatus.PENDING,
            "approved_by": None,
            "notes": "Toshkent City Plaza — sement va g'isht",
            "items": [
                (materials[0], Decimal("500"), materials[0].price_per_unit),
                (materials[2], Decimal("10000"), materials[2].price_per_unit),
                (materials[3], Decimal("5"), materials[3].price_per_unit),
            ],
        },
        {
            "site": sites[1],
            "creator": users["site1"],
            "status": OrderStatus.PENDING,
            "approved_by": None,
            "notes": "Yunusobod 16-kv — qum va shag'al",
            "items": [
                (materials[3], Decimal("10"), materials[3].price_per_unit),
                (materials[4], Decimal("8"), materials[4].price_per_unit),
            ],
        },
        {
            "site": sites[0],
            "creator": users["site1"],
            "status": OrderStatus.APPROVED,
            "approved_by": users["warehouse"],
            "notes": "City Plaza metall konstruksiya",
            "items": [
                (materials[1], Decimal("2000"), materials[1].price_per_unit),
                (materials[5], Decimal("150"), materials[5].price_per_unit),
                (materials[7], Decimal("300"), materials[7].price_per_unit),
            ],
        },
        {
            "site": sites[4],
            "creator": users["site2"],
            "status": OrderStatus.IN_TRANSIT,
            "approved_by": users["warehouse"],
            "notes": "Chilonzor — izolyatsiya va sement",
            "items": [
                (materials[0], Decimal("300"), materials[0].price_per_unit),
                (materials[6], Decimal("120"), materials[6].price_per_unit),
            ],
        },
        {
            "site": sites[4],
            "creator": users["site2"],
            "status": OrderStatus.DELIVERED,
            "approved_by": users["admin"],
            "notes": "Chilonzor — yetkazilgan partiya",
            "items": [
                (materials[2], Decimal("5000"), materials[2].price_per_unit),
                (materials[1], Decimal("800"), materials[1].price_per_unit),
                (materials[7], Decimal("200"), materials[7].price_per_unit),
            ],
        },
        {
            "site": sites[5],
            "creator": users["site2"],
            "status": OrderStatus.PENDING,
            "approved_by": None,
            "notes": "Sergeli Metro Plaza — poydevor materiallari",
            "items": [
                (materials[0], Decimal("400"), materials[0].price_per_unit),
                (materials[3], Decimal("6"), materials[3].price_per_unit),
            ],
        },
        {
            "site": sites[2],
            "creator": users["site1"],
            "status": OrderStatus.REJECTED,
            "approved_by": users["warehouse"],
            "notes": "Mirzo Ulug'bek — byudjet tasdiqlanmadi",
            "items": [
                (materials[5], Decimal("80"), materials[5].price_per_unit),
            ],
        },
        {
            "site": sites[3],
            "creator": users["site1"],
            "status": OrderStatus.DELIVERED,
            "approved_by": users["admin"],
            "notes": "Samarqand Registon — yakuniy yetkazish",
            "items": [
                (materials[2], Decimal("3000"), materials[2].price_per_unit),
                (materials[6], Decimal("50"), materials[6].price_per_unit),
            ],
        },
    ]

    orders: list[Order] = []
    for i, data in enumerate(orders_data):
        order = Order(
            site_id=data["site"].id,
            created_by=data["creator"].id,
            approved_by=data["approved_by"].id if data["approved_by"] else None,
            status=data["status"],
            delivery_date=delivery_base + timedelta(days=i * 2),
            notes=data["notes"],
            created_at=now - timedelta(days=10 - i),
            updated_at=now - timedelta(days=5 - i),
        )
        db.add(order)
        db.flush()
        orders.append(order)

        for material, qty, price in data["items"]:
            db.add(
                OrderItem(
                    order_id=order.id,
                    material_id=material.id,
                    quantity=qty,
                    unit_price=price,
                )
            )

    # --- Deliveries (approved, in_transit, delivered) ---
    deliveries_data = [
        {
            "order": orders[2],
            "driver": users["driver1"],
            "status": DeliveryStatus.ASSIGNED,
            "vehicle_number": "01A123BC",
            "scheduled_at": delivery_base + timedelta(days=3),
            "started_at": None,
            "delivered_at": None,
            "notes": "Ertaga yuklash rejalashtirilgan",
        },
        {
            "order": orders[3],
            "driver": users["driver2"],
            "status": DeliveryStatus.IN_TRANSIT,
            "vehicle_number": "01B456DE",
            "scheduled_at": delivery_base + timedelta(days=1),
            "started_at": now - timedelta(hours=4),
            "delivered_at": None,
            "notes": "Yo'lda — Chilonzor tomonga",
        },
        {
            "order": orders[4],
            "driver": users["driver1"],
            "status": DeliveryStatus.DELIVERED,
            "vehicle_number": "01C789FG",
            "scheduled_at": delivery_base - timedelta(days=2),
            "started_at": now - timedelta(days=2, hours=6),
            "delivered_at": now - timedelta(days=1),
            "notes": "Muvaffaqiyatli yetkazildi",
        },
    ]
    for data in deliveries_data:
        db.add(
            Delivery(
                order_id=data["order"].id,
                driver_id=data["driver"].id,
                vehicle_number=data["vehicle_number"],
                status=data["status"],
                scheduled_at=data["scheduled_at"],
                started_at=data["started_at"],
                delivered_at=data["delivered_at"],
                notes=data["notes"],
            )
        )

    # --- Notifications ---
    notifications = [
        Notification(
            user_id=users["site1"].id,
            title="Yangi buyurtma yaratildi",
            message="Toshkent City Plaza uchun buyurtma #1 yaratildi va tasdiqlashni kutmoqda.",
            is_read=False,
        ),
        Notification(
            user_id=users["warehouse"].id,
            title="Tasdiqlash kerak",
            message="2 ta yangi buyurtma tasdiqlash uchun kutilmoqda.",
            is_read=False,
        ),
        Notification(
            user_id=users["driver1"].id,
            title="Yangi yetkazish tayinlandi",
            message="Sizga #3 buyurtma bo'yicha yetkazish tayinlandi.",
            is_read=True,
        ),
        Notification(
            user_id=users["supplier1"].id,
            title="Buyurtma tasdiqlandi",
            message="MetalPro Uz materiallari uchun buyurtma tasdiqlandi.",
            is_read=False,
        ),
        Notification(
            user_id=users["admin"].id,
            title="Hisobot tayyor",
            message="Oxirgi hafta uchun yetkazish hisoboti tayyor.",
            is_read=True,
        ),
    ]
    db.add_all(notifications)

    db.commit()


if __name__ == "__main__":
    from app.db.database import SessionLocal

    db = SessionLocal()
    try:
        seed_database(db)
        print("Seeded successfully!")
    finally:
        db.close()
