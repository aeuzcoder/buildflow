# BuildFlow — Demo login credentials

Database seeds automatically on first backend startup (empty database).

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@buildflow.uz | Admin123 |
| Warehouse Manager | warehouse@buildflow.uz | BuildFlow123 |
| Driver 1 | driver1@buildflow.uz | BuildFlow123 |
| Driver 2 | driver2@buildflow.uz | BuildFlow123 |
| Site Manager 1 | site1@buildflow.uz | BuildFlow123 |
| Site Manager 2 | site2@buildflow.uz | BuildFlow123 |
| Supplier 1 | supplier1@buildflow.uz | BuildFlow123 |
| Supplier 2 | supplier2@buildflow.uz | BuildFlow123 |

## Reset demo data

```bash
docker compose exec backend python -m app.db.seed
```

This clears and re-seeds all tables.
