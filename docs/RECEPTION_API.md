# Reception API contract

Frontend expects these endpoints. Roles: `RECEPTION`, `ADMIN` (unless noted).

## VisitStatus

```
PLANNED, IN_PROGRESS, READY, COMPLETED, CANCELLED
```

Suggested transitions:

- Check-in: `PLANNED` → `IN_PROGRESS`
- Ready: `IN_PROGRESS` → `READY`
- Check-out: `READY` → `COMPLETED`

## VisitResponse (enriched)

```json
{
  "id": 1,
  "date": "2026-09-24",
  "timeSlot": "SLOT_10_00",
  "groomerId": 2,
  "groomerName": "Ola N.",
  "petId": 5,
  "petName": "Milo",
  "petBreed": "Poodle",
  "petNotes": "Gryzie przy pazurkach",
  "customerId": 9,
  "customerName": "Anna Kowalska",
  "customerPhone": "+48123456789",
  "serviceType": "FULL_GROOMING",
  "status": "PLANNED",
  "ownerExpectations": "...",
  "groomerNotes": "..."
}
```

Existing fields stay; add `customerName`, `customerPhone`, `petBreed`, `petNotes`.

## Visits

| Method | Path | Notes |
|--------|------|--------|
| GET | `/api/visits?date=` | day list |
| GET | `/api/visits?from=&to=` | month range |
| POST | `/api/visits` | body: VisitRequest |
| PATCH | `/api/visits/{id}/status` | `{ "status": "READY" }` |
| PATCH | `/api/visits/{id}/reschedule` | see below |

### Reschedule body

```json
{
  "date": "2026-09-24",
  "timeSlot": "SLOT_11_30",
  "groomerId": 2
}
```

Reject if slot taken (same rules as book). Roles: `RECEPTION`, `ADMIN`.

## Customers

| Method | Path | Notes |
|--------|------|--------|
| GET | `/api/customers?q=` | search first/last/phone/email; no `q` → limited list |
| POST | `/api/customers` | `{ firstName, lastName, phoneNumber, email }` |
| GET | `/api/pets?customerId=` | pets for customer |
| POST | `/api/pets` | create pet for customer |

## Groomers / availability

| Method | Path |
|--------|------|
| GET | `/api/groomers` |
| GET | `/api/groomers/{id}/availability?from=&to=` |

## Waitlist

Entity fields: `id`, `customerId`, `petId?`, `preferredGroomerId?`, `preferredService?`, `notes`, `priority` (int), `status` (`WAITING` \| `CONTACTED` \| `BOOKED` \| `CANCELLED`), `createdAt`.

| Method | Path |
|--------|------|
| GET | `/api/waitlist` |
| POST | `/api/waitlist` |
| PATCH | `/api/waitlist/{id}` |
| DELETE | `/api/waitlist/{id}` |
| GET | `/api/waitlist/suggestions?date=&timeSlot=&groomerId=` |

Security: `/api/waitlist/**` → `RECEPTION`, `ADMIN`.

## No SMS / no payments in this iteration
