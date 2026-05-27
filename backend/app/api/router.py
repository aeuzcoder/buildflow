from fastapi import APIRouter

from app.api.routes import (
    auth,
    dashboard,
    deliveries,
    materials,
    notifications,
    orders,
    profile,
    sites,
    users,
)

api_router = APIRouter(prefix="/api/v1")

api_router.include_router(auth.router)
api_router.include_router(profile.router)
api_router.include_router(orders.router, prefix="/orders")
api_router.include_router(deliveries.router, prefix="/deliveries")
api_router.include_router(materials.router, prefix="/materials")
api_router.include_router(sites.router, prefix="/sites")
api_router.include_router(users.router, prefix="/users")
api_router.include_router(notifications.router, prefix="/notifications")
api_router.include_router(dashboard.router, prefix="/dashboard")
