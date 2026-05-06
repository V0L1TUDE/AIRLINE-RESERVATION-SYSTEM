-- Stored procedures for booking, cancellation, and availability checks.
-- Enable DBMS_OUTPUT in SQL Developer to see printed messages.

CREATE OR REPLACE PROCEDURE pr_check_availability (
    p_schedule_id     IN NUMBER,
    p_available_seats OUT NUMBER
)
IS
BEGIN
    p_available_seats := fn_available_seats(p_schedule_id);

    DBMS_OUTPUT.PUT_LINE('Available seats for schedule '
        || p_schedule_id || ': ' || p_available_seats);
END;
/

CREATE OR REPLACE PROCEDURE pr_book_ticket (
    p_passenger_id      IN NUMBER,
    p_schedule_id       IN NUMBER,
    p_travel_class      IN VARCHAR2,
    p_payment_method    IN VARCHAR2,
    p_reservation_id    OUT NUMBER
)
IS
    v_seat_id       Seat.seat_id%TYPE;
    v_fare_amount   Reservation.fare_amount%TYPE;
    v_transaction   Payment.transaction_ref%TYPE;
BEGIN
    -- Lock one available seat so concurrent bookings cannot take it.
    SELECT seat_id
    INTO v_seat_id
    FROM Seat
    WHERE schedule_id = p_schedule_id
      AND seat_class = p_travel_class
      AND seat_status = 'Available'
      AND ROWNUM = 1
    FOR UPDATE;

    v_fare_amount := fn_calculate_fare(p_schedule_id, p_travel_class);

    INSERT INTO Reservation (
        passenger_id,
        schedule_id,
        seat_id,
        travel_class,
        reservation_status,
        fare_amount
    )
    VALUES (
        p_passenger_id,
        p_schedule_id,
        v_seat_id,
        p_travel_class,
        'Confirmed',
        v_fare_amount
    )
    RETURNING reservation_id INTO p_reservation_id;

    v_transaction := 'TXN-SW-' || TO_CHAR(p_reservation_id);

    INSERT INTO Payment (
        reservation_id,
        amount,
        payment_method,
        payment_status,
        transaction_ref
    )
    VALUES (
        p_reservation_id,
        v_fare_amount,
        p_payment_method,
        'Paid',
        v_transaction
    );

    COMMIT;
    DBMS_OUTPUT.PUT_LINE('Ticket booked successfully. Reservation ID: ' || p_reservation_id);
EXCEPTION
    WHEN NO_DATA_FOUND THEN
        ROLLBACK;
        RAISE_APPLICATION_ERROR(-20010, 'No available seat found for the selected class.');
    WHEN OTHERS THEN
        ROLLBACK;
        RAISE;
END;
/

CREATE OR REPLACE PROCEDURE pr_cancel_ticket (
    p_reservation_id IN NUMBER
)
IS
    v_status Reservation.reservation_status%TYPE;
BEGIN
    SELECT reservation_status
    INTO v_status
    FROM Reservation
    WHERE reservation_id = p_reservation_id
    FOR UPDATE;

    IF v_status = 'Cancelled' THEN
        RAISE_APPLICATION_ERROR(-20011, 'Reservation is already cancelled.');
    END IF;

    UPDATE Reservation
    SET reservation_status = 'Cancelled'
    WHERE reservation_id = p_reservation_id;

    UPDATE Payment
    SET payment_status = 'Refunded'
    WHERE reservation_id = p_reservation_id
      AND payment_status = 'Paid';

    COMMIT;
    DBMS_OUTPUT.PUT_LINE('Reservation cancelled and payment marked as refunded.');
EXCEPTION
    WHEN NO_DATA_FOUND THEN
        ROLLBACK;
        RAISE_APPLICATION_ERROR(-20012, 'Reservation not found.');
    WHEN OTHERS THEN
        ROLLBACK;
        RAISE;
END;
/

