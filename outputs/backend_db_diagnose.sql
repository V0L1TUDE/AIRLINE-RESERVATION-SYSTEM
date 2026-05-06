SET PAGESIZE 100
SET LINESIZE 180

PROMPT === CONNECTION ===
SHOW USER

SELECT
    SYS_CONTEXT('USERENV', 'SERVICE_NAME') AS service_name,
    SYS_CONTEXT('USERENV', 'CURRENT_SCHEMA') AS current_schema,
    SYS_CONTEXT('USERENV', 'CON_NAME') AS container_name
FROM dual;

PROMPT === PROJECT OBJECTS VISIBLE TO THIS USER ===
SELECT owner, object_name, object_type, status
FROM all_objects
WHERE object_name IN (
    'PASSENGER',
    'FLIGHT',
    'SCHEDULE',
    'SEAT',
    'RESERVATION',
    'PAYMENT',
    'VW_FLIGHT_AVAILABILITY',
    'VW_RESERVATION_DETAILS',
    'VW_REVENUE_PER_FLIGHT'
)
ORDER BY owner, object_type, object_name;

PROMPT === USER TABLES ===
SELECT table_name
FROM user_tables
WHERE table_name IN (
    'PASSENGER',
    'FLIGHT',
    'SCHEDULE',
    'SEAT',
    'RESERVATION',
    'PAYMENT'
)
ORDER BY table_name;

PROMPT === USER VIEWS ===
SELECT view_name
FROM user_views
WHERE view_name IN (
    'VW_FLIGHT_AVAILABILITY',
    'VW_RESERVATION_DETAILS',
    'VW_REVENUE_PER_FLIGHT'
)
ORDER BY view_name;

EXIT;
