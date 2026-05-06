-- Triggers for seat status maintenance and overbooking prevention.

CREATE OR REPLACE TRIGGER trg_prevent_overbooking
BEFORE INSERT OR UPDATE OF reservation_status, seat_id, schedule_id ON Reservation
FOR EACH ROW
DECLARE
    v_available_seats Schedule.available_seats%TYPE;
    v_seat_status     Seat.seat_status%TYPE;
    v_seat_schedule   Seat.schedule_id%TYPE;
BEGIN
    IF :NEW.reservation_status IN ('Confirmed', 'Checked-In') THEN
        SELECT available_seats
        INTO v_available_seats
        FROM Schedule
        WHERE schedule_id = :NEW.schedule_id;

        SELECT seat_status, schedule_id
        INTO v_seat_status, v_seat_schedule
        FROM Seat
        WHERE seat_id = :NEW.seat_id;

        IF v_seat_schedule <> :NEW.schedule_id THEN
            RAISE_APPLICATION_ERROR(-20020, 'Selected seat does not belong to the selected schedule.');
        END IF;

        IF INSERTING THEN
            IF v_available_seats <= 0 THEN
                RAISE_APPLICATION_ERROR(-20021, 'Flight is fully booked.');
            END IF;

            IF v_seat_status <> 'Available' THEN
                RAISE_APPLICATION_ERROR(-20022, 'Selected seat is not available.');
            END IF;
        ELSIF UPDATING AND :OLD.reservation_status = 'Cancelled' THEN
            IF v_available_seats <= 0 THEN
                RAISE_APPLICATION_ERROR(-20021, 'Flight is fully booked.');
            END IF;

            IF v_seat_status <> 'Available' THEN
                RAISE_APPLICATION_ERROR(-20022, 'Selected seat is not available.');
            END IF;
        END IF;
    END IF;
END;
/

CREATE OR REPLACE TRIGGER trg_update_seat_status
AFTER INSERT OR UPDATE OF reservation_status ON Reservation
FOR EACH ROW
BEGIN
    IF INSERTING AND :NEW.reservation_status IN ('Confirmed', 'Checked-In') THEN
        UPDATE Seat
        SET seat_status = 'Booked'
        WHERE seat_id = :NEW.seat_id;

        UPDATE Schedule
        SET available_seats = available_seats - 1
        WHERE schedule_id = :NEW.schedule_id;
    ELSIF UPDATING THEN
        IF :OLD.reservation_status IN ('Confirmed', 'Checked-In')
           AND :NEW.reservation_status = 'Cancelled' THEN
            UPDATE Seat
            SET seat_status = 'Available'
            WHERE seat_id = :NEW.seat_id;

            UPDATE Schedule
            SET available_seats = available_seats + 1
            WHERE schedule_id = :NEW.schedule_id;
        ELSIF :OLD.reservation_status = 'Cancelled'
              AND :NEW.reservation_status IN ('Confirmed', 'Checked-In') THEN
            UPDATE Seat
            SET seat_status = 'Booked'
            WHERE seat_id = :NEW.seat_id;

            UPDATE Schedule
            SET available_seats = available_seats - 1
            WHERE schedule_id = :NEW.schedule_id;
        END IF;
    END IF;
END;
/
