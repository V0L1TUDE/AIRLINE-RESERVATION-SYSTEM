# PL/SQL Procedure Demo

## Check Availability

```sql
SET SERVEROUTPUT ON;

DECLARE
    v_available NUMBER;
BEGIN
    pr_check_availability(1, v_available);
END;
/
```

Expected output:

```text
Available seats for schedule 1: 4
```

## Book Ticket

```sql
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

Expected output:

```text
Ticket booked successfully. Reservation ID: 100
```

## Cancel Ticket

```sql
BEGIN
    pr_cancel_ticket(100);
END;
/
```

Expected output:

```text
Reservation cancelled and payment marked as refunded.
```

