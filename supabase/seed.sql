-- =============================================================================
-- X-Fly Anyway — Phase 1 Seed Data
-- supabase/seed.sql
--
-- Contains:
--   - 24 airports (Thai domestic + major international)
--   - 20 flights (various routes, multiple dates)
--   - flight_cabin_class pricing per flight
--   - seat map generation (6-wide cinema layout: A–F)
--
-- Run AFTER applying 20260907000001_phase1_schema.sql
-- =============================================================================

-- ---------------------------------------------------------------------------
-- 1. Airports
-- ---------------------------------------------------------------------------
INSERT INTO airport (id, name, city, country, country_code, timezone) VALUES

-- Thailand (domestic)
('BKK', 'Suvarnabhumi Airport',          'Bangkok',      'Thailand',            'TH', 'Asia/Bangkok'),
('DMK', 'Don Mueang International Airport','Bangkok',    'Thailand',            'TH', 'Asia/Bangkok'),
('CNX', 'Chiang Mai International Airport','Chiang Mai', 'Thailand',            'TH', 'Asia/Bangkok'),
('HKT', 'Phuket International Airport',  'Phuket',       'Thailand',            'TH', 'Asia/Bangkok'),
('USM', 'Samui Airport',                 'Koh Samui',    'Thailand',            'TH', 'Asia/Bangkok'),
('HDY', 'Hat Yai International Airport', 'Hat Yai',      'Thailand',            'TH', 'Asia/Bangkok'),
('KBV', 'Krabi Airport',                 'Krabi',        'Thailand',            'TH', 'Asia/Bangkok'),
('URT', 'Surat Thani Airport',           'Surat Thani',  'Thailand',            'TH', 'Asia/Bangkok'),

-- Asia Pacific
('SIN', 'Singapore Changi Airport',      'Singapore',    'Singapore',           'SG', 'Asia/Singapore'),
('KUL', 'Kuala Lumpur International Airport','Kuala Lumpur','Malaysia',          'MY', 'Asia/Kuala_Lumpur'),
('HKG', 'Hong Kong International Airport','Hong Kong',   'Hong Kong',           'HK', 'Asia/Hong_Kong'),
('NRT', 'Narita International Airport',  'Tokyo',        'Japan',               'JP', 'Asia/Tokyo'),
('HND', 'Haneda Airport',                'Tokyo',        'Japan',               'JP', 'Asia/Tokyo'),
('ICN', 'Incheon International Airport', 'Seoul',        'South Korea',         'KR', 'Asia/Seoul'),
('PEK', 'Beijing Capital International Airport','Beijing','China',              'CN', 'Asia/Shanghai'),
('PVG', 'Shanghai Pudong International Airport','Shanghai','China',             'CN', 'Asia/Shanghai'),
('DEL', 'Indira Gandhi International Airport','New Delhi','India',              'IN', 'Asia/Kolkata'),
('SYD', 'Sydney Kingsford Smith Airport','Sydney',       'Australia',           'AU', 'Australia/Sydney'),
('MNL', 'Ninoy Aquino International Airport','Manila',   'Philippines',         'PH', 'Asia/Manila'),
('SGN', 'Tan Son Nhat International Airport','Ho Chi Minh City','Vietnam',      'VN', 'Asia/Ho_Chi_Minh'),
('HAN', 'Noi Bai International Airport', 'Hanoi',        'Vietnam',             'VN', 'Asia/Ho_Chi_Minh'),
('CGK', 'Soekarno-Hatta International Airport','Jakarta','Indonesia',           'ID', 'Asia/Jakarta'),
('DXB', 'Dubai International Airport',   'Dubai',        'United Arab Emirates','AE', 'Asia/Dubai'),

-- Europe
('LHR', 'London Heathrow Airport',       'London',       'United Kingdom',      'GB', 'Europe/London')

ON CONFLICT (id) DO NOTHING;

-- ---------------------------------------------------------------------------
-- 2. Flights
-- All flights depart from 2026-09-10 to 2026-10-15 for realistic testing
-- Flight numbers: XFA001–XFA020
-- ---------------------------------------------------------------------------

-- We use a DO block to insert flights with explicit UUIDs so we can
-- reference them in flight_cabin_class and seat inserts below.

DO $$
DECLARE
  -- Domestic routes
  f01 UUID := 'a1000000-0000-0000-0000-000000000001';
  f02 UUID := 'a1000000-0000-0000-0000-000000000002';
  f03 UUID := 'a1000000-0000-0000-0000-000000000003';
  f04 UUID := 'a1000000-0000-0000-0000-000000000004';
  f05 UUID := 'a1000000-0000-0000-0000-000000000005';
  f06 UUID := 'a1000000-0000-0000-0000-000000000006';
  f07 UUID := 'a1000000-0000-0000-0000-000000000007';
  f08 UUID := 'a1000000-0000-0000-0000-000000000008';
  -- Regional routes
  f09 UUID := 'a1000000-0000-0000-0000-000000000009';
  f10 UUID := 'a1000000-0000-0000-0000-000000000010';
  f11 UUID := 'a1000000-0000-0000-0000-000000000011';
  f12 UUID := 'a1000000-0000-0000-0000-000000000012';
  f13 UUID := 'a1000000-0000-0000-0000-000000000013';
  f14 UUID := 'a1000000-0000-0000-0000-000000000014';
  -- Long-haul routes
  f15 UUID := 'a1000000-0000-0000-0000-000000000015';
  f16 UUID := 'a1000000-0000-0000-0000-000000000016';
  f17 UUID := 'a1000000-0000-0000-0000-000000000017';
  f18 UUID := 'a1000000-0000-0000-0000-000000000018';
  f19 UUID := 'a1000000-0000-0000-0000-000000000019';
  f20 UUID := 'a1000000-0000-0000-0000-000000000020';

BEGIN

-- ── Domestic Flights ──────────────────────────────────────────────────────
INSERT INTO flight (id, flight_number, origin_code, destination_code, departure_at, arrival_at, status)
VALUES
  (f01,'XFA001','BKK','CNX','2026-09-10 06:30:00+07','2026-09-10 07:50:00+07','scheduled'),
  (f02,'XFA002','BKK','HKT','2026-09-10 08:00:00+07','2026-09-10 09:20:00+07','scheduled'),
  (f03,'XFA003','BKK','USM','2026-09-11 07:00:00+07','2026-09-11 08:20:00+07','scheduled'),
  (f04,'XFA004','BKK','HDY','2026-09-11 09:30:00+07','2026-09-11 11:10:00+07','scheduled'),
  (f05,'XFA005','BKK','KBV','2026-09-12 06:45:00+07','2026-09-12 08:05:00+07','scheduled'),
  (f06,'XFA006','CNX','BKK','2026-09-12 13:00:00+07','2026-09-12 14:20:00+07','scheduled'),
  (f07,'XFA007','HKT','BKK','2026-09-13 14:00:00+07','2026-09-13 15:20:00+07','scheduled'),
  (f08,'XFA008','BKK','URT','2026-09-14 07:15:00+07','2026-09-14 08:30:00+07','scheduled')
ON CONFLICT (id) DO NOTHING;

-- ── Regional Flights ─────────────────────────────────────────────────────
INSERT INTO flight (id, flight_number, origin_code, destination_code, departure_at, arrival_at, status)
VALUES
  (f09,'XFA009','BKK','SIN','2026-09-10 10:00:00+07','2026-09-10 13:20:00+08','scheduled'),
  (f10,'XFA010','BKK','KUL','2026-09-10 11:30:00+07','2026-09-10 14:45:00+08','scheduled'),
  (f11,'XFA011','BKK','HKG','2026-09-11 14:00:00+07','2026-09-11 17:40:00+08','scheduled'),
  (f12,'XFA012','BKK','SGN','2026-09-12 08:30:00+07','2026-09-12 10:00:00+07','scheduled'),
  (f13,'XFA013','BKK','HAN','2026-09-13 09:00:00+07','2026-09-13 11:00:00+07','scheduled'),
  (f14,'XFA014','BKK','MNL','2026-09-15 07:30:00+07','2026-09-15 11:30:00+08','scheduled')
ON CONFLICT (id) DO NOTHING;

-- ── Long-haul Flights ─────────────────────────────────────────────────────
INSERT INTO flight (id, flight_number, origin_code, destination_code, departure_at, arrival_at, status)
VALUES
  (f15,'XFA015','BKK','NRT','2026-09-10 23:30:00+07','2026-09-11 07:30:00+09','scheduled'),
  (f16,'XFA016','BKK','ICN','2026-09-11 22:00:00+07','2026-09-12 05:40:00+09','scheduled'),
  (f17,'XFA017','BKK','DEL','2026-09-12 01:00:00+07','2026-09-12 03:30:00+05:30','scheduled'),
  (f18,'XFA018','BKK','DXB','2026-09-13 00:30:00+07','2026-09-13 05:00:00+04','scheduled'),
  (f19,'XFA019','BKK','SYD','2026-09-14 22:00:00+07','2026-09-15 09:30:00+10','scheduled'),
  (f20,'XFA020','BKK','LHR','2026-09-15 23:59:00+07','2026-09-16 06:30:00+01','scheduled')
ON CONFLICT (id) DO NOTHING;

-- ── flight_cabin_class ────────────────────────────────────────────────────
-- Domestic: economy + business only
-- Regional: economy + premium_economy + business
-- Long-haul: all 4 classes

-- Domestic cabin classes
INSERT INTO flight_cabin_class (flight_id, cabin_class, price, total_seats, available_seats)
VALUES
  (f01,'economy',    1590,  120, 118),  (f01,'business',   5900,  16,  16),
  (f02,'economy',    1890,  120, 110),  (f02,'business',   6900,  16,  16),
  (f03,'economy',    2100,  120, 115),  (f03,'business',   7500,  16,  14),
  (f04,'economy',    1750,  120, 108),  (f04,'business',   6200,  16,  16),
  (f05,'economy',    1890,  120, 120),  (f05,'business',   6800,  16,  16),
  (f06,'economy',    1590,  120, 95),   (f06,'business',   5900,  16,  12),
  (f07,'economy',    1890,  120, 102),  (f07,'business',   6900,  16,  16),
  (f08,'economy',    1650,  120, 119),  (f08,'business',   5800,  16,  16)
ON CONFLICT (flight_id, cabin_class) DO NOTHING;

-- Regional cabin classes
INSERT INTO flight_cabin_class (flight_id, cabin_class, price, total_seats, available_seats)
VALUES
  (f09,'economy',3200,136,130),(f09,'premium_economy',5800,24,24),(f09,'business',12500,16,16),
  (f10,'economy',2900,136,128),(f10,'premium_economy',5500,24,22),(f10,'business',11800,16,16),
  (f11,'economy',3800,136,120),(f11,'premium_economy',6500,24,20),(f11,'business',14000,16,14),
  (f12,'economy',2500,136,134),(f12,'premium_economy',4500,24,24),(f12,'business',10000,16,16),
  (f13,'economy',2700,136,130),(f13,'premium_economy',4800,24,24),(f13,'business',10500,16,16),
  (f14,'economy',3500,136,110),(f14,'premium_economy',6200,24,20),(f14,'business',13500,16,16)
ON CONFLICT (flight_id, cabin_class) DO NOTHING;

-- Long-haul cabin classes
INSERT INTO flight_cabin_class (flight_id, cabin_class, price, total_seats, available_seats)
VALUES
  (f15,'economy',8500,160,145),(f15,'premium_economy',15000,36,32),(f15,'business',35000,24,22),(f15,'first',65000,8,8),
  (f16,'economy',7800,160,138),(f16,'premium_economy',14000,36,30),(f16,'business',32000,24,20),(f16,'first',60000,8,8),
  (f17,'economy',6500,160,155),(f17,'premium_economy',12000,36,36),(f17,'business',28000,24,24),(f17,'first',52000,8,8),
  (f18,'economy',9500,160,140),(f18,'premium_economy',17000,36,30),(f18,'business',40000,24,18),(f18,'first',75000,8,6),
  (f19,'economy',12000,160,130),(f19,'premium_economy',21000,36,28),(f19,'business',52000,24,20),(f19,'first',95000,8,8),
  (f20,'economy',18000,160,120),(f20,'premium_economy',30000,36,24),(f20,'business',75000,24,16),(f20,'first',145000,8,6)
ON CONFLICT (flight_id, cabin_class) DO NOTHING;

-- ── Seat Generation ───────────────────────────────────────────────────────
-- Cinema-style 6-wide layout: A B C | D E F
-- Economy seats start at row 10 (after business/first sections)
-- Business: rows 1–4 (16 seats), First: rows 1–2 (8 seats, long-haul only)

-- Helper: generate seats for a flight section
-- Domestic flights (f01–f08): economy rows 5–24 (120 seats), business rows 1–4 (A–D only, 2-2 layout = 16)

-- ── Domestic flight seats (f01) ──────────────────────────────────────────
-- Business: rows 1–4, columns A-D (2-2 layout simulated as A,B,C,D)
INSERT INTO seat (flight_id, seat_number, row_number, column_letter, cabin_class, is_window, is_aisle, is_exit_row)
SELECT f01,
       row_n::text || col,
       row_n,
       col,
       'business',
       col IN ('A','D'),
       col IN ('B','C'),
       false
FROM generate_series(1,4) AS row_n
CROSS JOIN unnest(ARRAY['A','B','C','D']) AS col
ON CONFLICT (flight_id, seat_number) DO NOTHING;

-- Economy: rows 5–24, columns A–F (6-wide)
INSERT INTO seat (flight_id, seat_number, row_number, column_letter, cabin_class, is_window, is_aisle, is_exit_row)
SELECT f01,
       row_n::text || col,
       row_n,
       col,
       'economy',
       col IN ('A','F'),
       col IN ('C','D'),
       row_n IN (14, 15)
FROM generate_series(5,24) AS row_n
CROSS JOIN unnest(ARRAY['A','B','C','D','E','F']) AS col
ON CONFLICT (flight_id, seat_number) DO NOTHING;

-- Repeat seat structure for f02–f08 (identical aircraft layout)
INSERT INTO seat (flight_id, seat_number, row_number, column_letter, cabin_class, is_window, is_aisle, is_exit_row)
SELECT fid,
       row_n::text || col,
       row_n,
       col,
       CASE WHEN row_n <= 4 THEN 'business' ELSE 'economy' END,
       col IN ('A', CASE WHEN row_n <= 4 THEN 'D' ELSE 'F' END),
       col IN (CASE WHEN row_n <= 4 THEN 'B' ELSE 'C' END,
               CASE WHEN row_n <= 4 THEN 'C' ELSE 'D' END),
       (row_n IN (14, 15) AND row_n > 4)
FROM (VALUES (f02),(f03),(f04),(f05),(f06),(f07),(f08)) AS flights(fid)
CROSS JOIN generate_series(1,24) AS row_n
CROSS JOIN unnest(
  CASE WHEN row_n <= 4 THEN ARRAY['A','B','C','D']
       ELSE ARRAY['A','B','C','D','E','F'] END
) AS col
ON CONFLICT (flight_id, seat_number) DO NOTHING;

-- ── Regional flight seats (f09–f14) ──────────────────────────────────────
-- Business: rows 1–4, A-D (16 seats)
-- Premium Economy: rows 5–8, A–F (24 seats)
-- Economy: rows 9–30, A–F (136 seats)
INSERT INTO seat (flight_id, seat_number, row_number, column_letter, cabin_class, is_window, is_aisle, is_exit_row)
SELECT fid,
       row_n::text || col,
       row_n,
       col,
       CASE
         WHEN row_n <= 4  THEN 'business'
         WHEN row_n <= 8  THEN 'premium_economy'
         ELSE 'economy'
       END,
       col IN ('A', CASE WHEN row_n <= 4 THEN 'D' ELSE 'F' END),
       col IN (CASE WHEN row_n <= 4 THEN 'B' ELSE 'C' END,
               CASE WHEN row_n <= 4 THEN 'C' ELSE 'D' END),
       row_n IN (15, 16)
FROM (VALUES (f09),(f10),(f11),(f12),(f13),(f14)) AS flights(fid)
CROSS JOIN generate_series(1,30) AS row_n
CROSS JOIN unnest(
  CASE WHEN row_n <= 4 THEN ARRAY['A','B','C','D']
       ELSE ARRAY['A','B','C','D','E','F'] END
) AS col
ON CONFLICT (flight_id, seat_number) DO NOTHING;

-- ── Long-haul flight seats (f15–f20) ─────────────────────────────────────
-- First:           rows 1–2,  A-D (8 seats, 2-2 layout)
-- Business:        rows 3–8,  A-D (24 seats, 2-2 layout)
-- Premium Economy: rows 9–14, A–F (36 seats)
-- Economy:         rows 15–40, A–F (156 seats → capped at 160 total via fcc)
INSERT INTO seat (flight_id, seat_number, row_number, column_letter, cabin_class, is_window, is_aisle, is_exit_row)
SELECT fid,
       row_n::text || col,
       row_n,
       col,
       CASE
         WHEN row_n <= 2  THEN 'first'
         WHEN row_n <= 8  THEN 'business'
         WHEN row_n <= 14 THEN 'premium_economy'
         ELSE 'economy'
       END,
       col IN ('A', CASE WHEN row_n <= 8 THEN 'D' ELSE 'F' END),
       col IN (CASE WHEN row_n <= 8 THEN 'B' ELSE 'C' END,
               CASE WHEN row_n <= 8 THEN 'C' ELSE 'D' END),
       row_n IN (20, 21)
FROM (VALUES (f15),(f16),(f17),(f18),(f19),(f20)) AS flights(fid)
CROSS JOIN generate_series(1,40) AS row_n
CROSS JOIN unnest(
  CASE WHEN row_n <= 8 THEN ARRAY['A','B','C','D']
       ELSE ARRAY['A','B','C','D','E','F'] END
) AS col
ON CONFLICT (flight_id, seat_number) DO NOTHING;

-- Mark a few seats as occupied for realistic testing (economy seats)
UPDATE seat SET status = 'occupied'
WHERE flight_id = f01
  AND seat_number IN ('5A','5B','5C','5D','6A','6B','7F','8E','9A','10C','12B','15A');

UPDATE seat SET status = 'occupied'
WHERE flight_id = f02
  AND seat_number IN ('5A','5B','6C','7D','8E','9F','10A','11B','13C','14D','16E','18F');

UPDATE seat SET status = 'occupied'
WHERE flight_id = f09
  AND seat_number IN ('9A','9B','9C','10D','10E','11F','12A','13B','14C','15D','16E','18F',
                      '20A','20B','21C','22D','23E','24F','25A','26B');

UPDATE seat SET status = 'occupied'
WHERE flight_id = f15
  AND seat_number IN ('15A','15B','15C','16D','16E','17F','18A','19B','20C','21D','22E','23F',
                      '24A','25B','26C','27D','28E','29F','30A','31B','32C','33D');

END;
$$;
