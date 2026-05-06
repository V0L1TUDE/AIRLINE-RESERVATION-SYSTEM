# Backend Setup

The frontend cannot connect directly to Oracle Database. Use this backend as the API layer between the browser and the DBMS project.

Right now we are exposing these read APIs:

```text
GET /api/flights
GET /api/reservations
POST /api/book
POST /api/cancel/:id
```

## 1. Install Node Dependencies

Open a terminal in this folder:

```bash
cd AirlineReservationSystem/backend
npm install
```

## 2. Configure Database Connection

Copy `.env.example` to `.env`:

```bash
copy .env.example .env
```

Edit `.env` with your Oracle credentials:

```env
PORT=3000
DB_USER=system
DB_PASSWORD=your_password
DB_CONNECT_STRING=localhost:1521/XEPDB1
```

Common Oracle connection strings:

```text
Oracle XE 21c: localhost:1521/XEPDB1
Oracle XE 11g: localhost:1521/XE
```

## 3. Create Database Objects

Run these scripts in Oracle SQL Developer:

```sql
@../database/01_create_tables.sql
@../database/02_indexes_views.sql
@../database/03_sample_data.sql
@../plsql/functions.sql
@../plsql/procedures.sql
@../plsql/triggers.sql
```

## 4. Start Backend

```bash
npm start
```

The API will run at:

```text
http://localhost:3000
```

Test it in the browser:

```text
http://localhost:3000/api/health
http://localhost:3000/api/flights
http://localhost:3000/api/reservations
```

Test booking with an API client such as Postman:

```json
{
  "passengerId": 4,
  "scheduleId": 3,
  "travelClass": "Economy",
  "paymentMethod": "UPI"
}
```

Test cancellation with an API client:

```text
POST http://localhost:3000/api/cancel/100
```
