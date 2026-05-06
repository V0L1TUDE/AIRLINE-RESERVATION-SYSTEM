# Airline Reservation System DBMS Project

This project is a complete college-level DBMS implementation of an Airline Reservation System using Oracle SQL, PL/SQL, and a simple HTML/CSS/JavaScript frontend.

## Project Structure

```text
AirlineReservationSystem/
+-- backend/
+-- database/
+-- documentation/
+-- frontend/
+-- outputs/
+-- plsql/
+-- queries/
+-- schema/
```

## Main Features

- Passenger, Flight, Schedule, Seat, Reservation, and Payment tables
- Primary keys, foreign keys, unique constraints, check constraints, and indexes
- Views for reservation details, flight availability, and revenue
- PL/SQL functions for fare calculation and seat availability
- PL/SQL procedures for ticket booking, cancellation, and availability checking
- Triggers to update seat status and prevent overbooking
- Reports for booking history, revenue, occupancy rate, and most booked routes
- Simple no-framework frontend for demonstration

## How To Run Database Scripts

Run the scripts in Oracle SQL Developer or SQL*Plus in this order:

```sql
@database/01_create_tables.sql
@database/02_indexes_views.sql
@database/03_sample_data.sql
@plsql/functions.sql
@plsql/procedures.sql
@plsql/triggers.sql
```

To remove all objects and rebuild:

```sql
@database/04_drop_tables.sql
```

## How To Run Frontend

Open `frontend/index.html` in any browser. If the Node backend is running, the frontend reads from Oracle through API calls. If the backend is not running, it falls back to browser local storage for demo use.

## How To Link Frontend With Database

Browsers cannot connect directly to Oracle Database. Use the backend folder as the API layer:

```bash
cd backend
npm install
copy .env.example .env
npm start
```

Edit `.env` before starting:

```env
DB_USER=your_oracle_username
DB_PASSWORD=your_oracle_password
DB_CONNECT_STRING=localhost:1521/XEPDB1
```

Then open:

```text
frontend/index.html
```

## Sample Procedure Call

```sql
SET SERVEROUTPUT ON;

DECLARE
    v_reservation_id NUMBER;
BEGIN
    pr_book_ticket(
        p_passenger_id   => 4,
        p_schedule_id    => 3,
        p_travel_class   => 'Economy',
        p_payment_method => 'UPI',
        p_reservation_id => v_reservation_id
    );
END;
/
```
