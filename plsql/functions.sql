-- Functions used by procedures, reports, and manual testing.

CREATE OR REPLACE FUNCTION fn_calculate_fare (
    p_schedule_id  IN NUMBER,
    p_travel_class IN VARCHAR2
) RETURN NUMBER
IS
    v_base_fare Flight.base_fare%TYPE;
    v_multiplier NUMBER := 1;
BEGIN
    SELECT f.base_fare
    INTO v_base_fare
    FROM Schedule s
    JOIN Flight f ON f.flight_id = s.flight_id
    WHERE s.schedule_id = p_schedule_id;

    v_multiplier :=
        CASE p_travel_class
            WHEN 'Economy' THEN 1.00
            WHEN 'Premium Economy' THEN 1.25
            WHEN 'Business' THEN 1.50
            WHEN 'First' THEN 2.00
            ELSE 1.00
        END;

    RETURN ROUND(v_base_fare * v_multiplier, 2);
EXCEPTION
    WHEN NO_DATA_FOUND THEN
        RAISE_APPLICATION_ERROR(-20001, 'Invalid schedule ID.');
END;
/

CREATE OR REPLACE FUNCTION fn_available_seats (
    p_schedule_id IN NUMBER
) RETURN NUMBER
IS
    v_available NUMBER;
BEGIN
    SELECT available_seats
    INTO v_available
    FROM Schedule
    WHERE schedule_id = p_schedule_id;

    RETURN v_available;
EXCEPTION
    WHEN NO_DATA_FOUND THEN
        RAISE_APPLICATION_ERROR(-20002, 'Invalid schedule ID.');
END;
/

