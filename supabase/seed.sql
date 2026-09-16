-- =============================================================================
-- X-Fly Anyway — Expanded Seed Data v2
-- supabase/seed_v2.sql
-- 52 airports, 80 flights, 15 airlines
-- =============================================================================

-- 0. Clear existing
TRUNCATE seat, flight_cabin_class, flight, airport CASCADE;

-- 1. Airports
INSERT INTO airport (id, name, city, country, country_code, timezone) VALUES
-- Thailand
('BKK','Suvarnabhumi Airport','Bangkok','Thailand','TH','Asia/Bangkok'),
('DMK','Don Mueang International Airport','Bangkok','Thailand','TH','Asia/Bangkok'),
('CNX','Chiang Mai International Airport','Chiang Mai','Thailand','TH','Asia/Bangkok'),
('HKT','Phuket International Airport','Phuket','Thailand','TH','Asia/Bangkok'),
('USM','Samui Airport','Koh Samui','Thailand','TH','Asia/Bangkok'),
('HDY','Hat Yai International Airport','Hat Yai','Thailand','TH','Asia/Bangkok'),
('KBV','Krabi Airport','Krabi','Thailand','TH','Asia/Bangkok'),
('URT','Surat Thani Airport','Surat Thani','Thailand','TH','Asia/Bangkok'),
('CEI','Chiang Rai International Airport','Chiang Rai','Thailand','TH','Asia/Bangkok'),
('UTH','Udon Thani International Airport','Udon Thani','Thailand','TH','Asia/Bangkok'),
-- SE Asia
('SIN','Singapore Changi Airport','Singapore','Singapore','SG','Asia/Singapore'),
('KUL','Kuala Lumpur International Airport','Kuala Lumpur','Malaysia','MY','Asia/Kuala_Lumpur'),
('SGN','Tan Son Nhat International Airport','Ho Chi Minh City','Vietnam','VN','Asia/Ho_Chi_Minh'),
('HAN','Noi Bai International Airport','Hanoi','Vietnam','VN','Asia/Ho_Chi_Minh'),
('MNL','Ninoy Aquino International Airport','Manila','Philippines','PH','Asia/Manila'),
('CGK','Soekarno-Hatta International Airport','Jakarta','Indonesia','ID','Asia/Jakarta'),
('DPS','Ngurah Rai International Airport','Denpasar','Indonesia','ID','Asia/Makassar'),
('RGN','Yangon International Airport','Yangon','Myanmar','MM','Asia/Rangoon'),
('PNH','Phnom Penh International Airport','Phnom Penh','Cambodia','KH','Asia/Phnom_Penh'),
('VTE','Wattay International Airport','Vientiane','Laos','LA','Asia/Vientiane'),
-- East Asia
('NRT','Narita International Airport','Tokyo','Japan','JP','Asia/Tokyo'),
('HND','Haneda Airport','Tokyo','Japan','JP','Asia/Tokyo'),
('KIX','Kansai International Airport','Osaka','Japan','JP','Asia/Tokyo'),
('ICN','Incheon International Airport','Seoul','South Korea','KR','Asia/Seoul'),
('PEK','Beijing Capital International Airport','Beijing','China','CN','Asia/Shanghai'),
('PVG','Shanghai Pudong International Airport','Shanghai','China','CN','Asia/Shanghai'),
('HKG','Hong Kong International Airport','Hong Kong','Hong Kong','HK','Asia/Hong_Kong'),
('TPE','Taiwan Taoyuan International Airport','Taipei','Taiwan','TW','Asia/Taipei'),
('CAN','Guangzhou Baiyun International Airport','Guangzhou','China','CN','Asia/Shanghai'),
-- South Asia
('DEL','Indira Gandhi International Airport','New Delhi','India','IN','Asia/Kolkata'),
('BOM','Chhatrapati Shivaji Maharaj International Airport','Mumbai','India','IN','Asia/Kolkata'),
('CMB','Bandaranaike International Airport','Colombo','Sri Lanka','LK','Asia/Colombo'),
('DAC','Hazrat Shahjalal International Airport','Dhaka','Bangladesh','BD','Asia/Dhaka'),
-- Middle East
('DXB','Dubai International Airport','Dubai','United Arab Emirates','AE','Asia/Dubai'),
('AUH','Abu Dhabi International Airport','Abu Dhabi','United Arab Emirates','AE','Asia/Dubai'),
('DOH','Hamad International Airport','Doha','Qatar','QA','Asia/Qatar'),
('RUH','King Khalid International Airport','Riyadh','Saudi Arabia','SA','Asia/Riyadh'),
-- Europe
('LHR','London Heathrow Airport','London','United Kingdom','GB','Europe/London'),
('CDG','Charles de Gaulle Airport','Paris','France','FR','Europe/Paris'),
('FRA','Frankfurt Airport','Frankfurt','Germany','DE','Europe/Berlin'),
('AMS','Amsterdam Airport Schiphol','Amsterdam','Netherlands','NL','Europe/Amsterdam'),
('ZRH','Zurich Airport','Zurich','Switzerland','CH','Europe/Zurich'),
('FCO','Leonardo da Vinci International Airport','Rome','Italy','IT','Europe/Rome'),
('MAD','Adolfo Suarez Madrid-Barajas Airport','Madrid','Spain','ES','Europe/Madrid'),
('MUC','Munich Airport','Munich','Germany','DE','Europe/Berlin'),
-- Oceania
('SYD','Sydney Kingsford Smith Airport','Sydney','Australia','AU','Australia/Sydney'),
('MEL','Melbourne Airport','Melbourne','Australia','AU','Australia/Melbourne'),
('AKL','Auckland Airport','Auckland','New Zealand','NZ','Pacific/Auckland'),
-- Americas
('LAX','Los Angeles International Airport','Los Angeles','United States','US','America/Los_Angeles'),
('JFK','John F. Kennedy International Airport','New York','United States','US','America/New_York'),
('YYZ','Toronto Pearson International Airport','Toronto','Canada','CA','America/Toronto'),
-- Africa
('JNB','O. R. Tambo International Airport','Johannesburg','South Africa','ZA','Africa/Johannesburg'),
('CAI','Cairo International Airport','Cairo','Egypt','EG','Africa/Cairo')
ON CONFLICT (id) DO NOTHING;
-- 2. Flights (80 flights, 15 airlines, multiple dates)
DO $$
DECLARE
  f01 UUID := 'a1000000-0000-0000-0000-000000000001';
  f02 UUID := 'a1000000-0000-0000-0000-000000000002';
  f03 UUID := 'a1000000-0000-0000-0000-000000000003';
  f04 UUID := 'a1000000-0000-0000-0000-000000000004';
  f05 UUID := 'a1000000-0000-0000-0000-000000000005';
  f06 UUID := 'a1000000-0000-0000-0000-000000000006';
  f07 UUID := 'a1000000-0000-0000-0000-000000000007';
  f08 UUID := 'a1000000-0000-0000-0000-000000000008';
  f09 UUID := 'a1000000-0000-0000-0000-000000000009';
  f10 UUID := 'a1000000-0000-0000-0000-000000000010';
  f11 UUID := 'a1000000-0000-0000-0000-000000000011';
  f12 UUID := 'a1000000-0000-0000-0000-000000000012';
  f13 UUID := 'a1000000-0000-0000-0000-000000000013';
  f14 UUID := 'a1000000-0000-0000-0000-000000000014';
  f15 UUID := 'a1000000-0000-0000-0000-000000000015';
  f16 UUID := 'a1000000-0000-0000-0000-000000000016';
  f17 UUID := 'a1000000-0000-0000-0000-000000000017';
  f18 UUID := 'a1000000-0000-0000-0000-000000000018';
  f19 UUID := 'a1000000-0000-0000-0000-000000000019';
  f20 UUID := 'a1000000-0000-0000-0000-000000000020';
  f21 UUID := 'a1000000-0000-0000-0000-000000000021';
  f22 UUID := 'a1000000-0000-0000-0000-000000000022';
  f23 UUID := 'a1000000-0000-0000-0000-000000000023';
  f24 UUID := 'a1000000-0000-0000-0000-000000000024';
  f25 UUID := 'a1000000-0000-0000-0000-000000000025';
  f26 UUID := 'a1000000-0000-0000-0000-000000000026';
  f27 UUID := 'a1000000-0000-0000-0000-000000000027';
  f28 UUID := 'a1000000-0000-0000-0000-000000000028';
  f29 UUID := 'a1000000-0000-0000-0000-000000000029';
  f30 UUID := 'a1000000-0000-0000-0000-000000000030';
  f31 UUID := 'a1000000-0000-0000-0000-000000000031';
  f32 UUID := 'a1000000-0000-0000-0000-000000000032';
  f33 UUID := 'a1000000-0000-0000-0000-000000000033';
  f34 UUID := 'a1000000-0000-0000-0000-000000000034';
  f35 UUID := 'a1000000-0000-0000-0000-000000000035';
  f36 UUID := 'a1000000-0000-0000-0000-000000000036';
  f37 UUID := 'a1000000-0000-0000-0000-000000000037';
  f38 UUID := 'a1000000-0000-0000-0000-000000000038';
  f39 UUID := 'a1000000-0000-0000-0000-000000000039';
  f40 UUID := 'a1000000-0000-0000-0000-000000000040';
  f41 UUID := 'a1000000-0000-0000-0000-000000000041';
  f42 UUID := 'a1000000-0000-0000-0000-000000000042';
  f43 UUID := 'a1000000-0000-0000-0000-000000000043';
  f44 UUID := 'a1000000-0000-0000-0000-000000000044';
  f45 UUID := 'a1000000-0000-0000-0000-000000000045';
  f46 UUID := 'a1000000-0000-0000-0000-000000000046';
  f47 UUID := 'a1000000-0000-0000-0000-000000000047';
  f48 UUID := 'a1000000-0000-0000-0000-000000000048';
  f49 UUID := 'a1000000-0000-0000-0000-000000000049';
  f50 UUID := 'a1000000-0000-0000-0000-000000000050';
  f51 UUID := 'a1000000-0000-0000-0000-000000000051';
  f52 UUID := 'a1000000-0000-0000-0000-000000000052';
  f53 UUID := 'a1000000-0000-0000-0000-000000000053';
  f54 UUID := 'a1000000-0000-0000-0000-000000000054';
  f55 UUID := 'a1000000-0000-0000-0000-000000000055';
  f56 UUID := 'a1000000-0000-0000-0000-000000000056';
  f57 UUID := 'a1000000-0000-0000-0000-000000000057';
  f58 UUID := 'a1000000-0000-0000-0000-000000000058';
  f59 UUID := 'a1000000-0000-0000-0000-000000000059';
  f60 UUID := 'a1000000-0000-0000-0000-000000000060';
  f61 UUID := 'a1000000-0000-0000-0000-000000000061';
  f62 UUID := 'a1000000-0000-0000-0000-000000000062';
  f63 UUID := 'a1000000-0000-0000-0000-000000000063';
  f64 UUID := 'a1000000-0000-0000-0000-000000000064';
  f65 UUID := 'a1000000-0000-0000-0000-000000000065';
  f66 UUID := 'a1000000-0000-0000-0000-000000000066';
  f67 UUID := 'a1000000-0000-0000-0000-000000000067';
  f68 UUID := 'a1000000-0000-0000-0000-000000000068';
  f69 UUID := 'a1000000-0000-0000-0000-000000000069';
  f70 UUID := 'a1000000-0000-0000-0000-000000000070';
  f71 UUID := 'a1000000-0000-0000-0000-000000000071';
  f72 UUID := 'a1000000-0000-0000-0000-000000000072';
  f73 UUID := 'a1000000-0000-0000-0000-000000000073';
  f74 UUID := 'a1000000-0000-0000-0000-000000000074';
  f75 UUID := 'a1000000-0000-0000-0000-000000000075';
  f76 UUID := 'a1000000-0000-0000-0000-000000000076';
  f77 UUID := 'a1000000-0000-0000-0000-000000000077';
  f78 UUID := 'a1000000-0000-0000-0000-000000000078';
  f79 UUID := 'a1000000-0000-0000-0000-000000000079';
  f80 UUID := 'a1000000-0000-0000-0000-000000000080';
BEGIN

-- Domestic (TG/PG/FD)
INSERT INTO flight (id,flight_number,origin_airport_id,destination_airport_id,departure_time,arrival_time,status) VALUES
  (f01,'TG100','BKK','CNX','2026-09-20 06:30:00+07','2026-09-20 07:50:00+07','scheduled'),
  (f02,'PG201','BKK','HKT','2026-09-20 08:00:00+07','2026-09-20 09:20:00+07','scheduled'),
  (f03,'FD302','BKK','USM','2026-09-20 07:00:00+07','2026-09-20 08:20:00+07','scheduled'),
  (f04,'TG103','BKK','HDY','2026-09-21 09:30:00+07','2026-09-21 11:10:00+07','scheduled'),
  (f05,'PG204','BKK','KBV','2026-09-21 06:45:00+07','2026-09-21 08:05:00+07','scheduled'),
  (f06,'FD305','CNX','BKK','2026-09-21 13:00:00+07','2026-09-21 14:20:00+07','scheduled'),
  (f07,'TG106','HKT','BKK','2026-09-22 14:00:00+07','2026-09-22 15:20:00+07','scheduled'),
  (f08,'PG207','BKK','URT','2026-09-22 07:15:00+07','2026-09-22 08:30:00+07','scheduled'),
  (f09,'FD308','DMK','CNX','2026-09-23 06:00:00+07','2026-09-23 07:20:00+07','scheduled'),
  (f10,'TG109','BKK','CEI','2026-09-23 09:00:00+07','2026-09-23 10:30:00+07','scheduled')
ON CONFLICT (id) DO NOTHING;

-- SE Asia (SQ/AK/VN/PR/GA/TR/QV/FD)
INSERT INTO flight (id,flight_number,origin_airport_id,destination_airport_id,departure_time,arrival_time,status) VALUES
  (f11,'SQ709','BKK','SIN','2026-09-20 10:00:00+07','2026-09-20 13:20:00+08','scheduled'),
  (f12,'AK801','BKK','KUL','2026-09-20 11:30:00+07','2026-09-20 14:45:00+08','scheduled'),
  (f13,'VN606','BKK','SGN','2026-09-20 08:30:00+07','2026-09-20 10:00:00+07','scheduled'),
  (f14,'VN305','BKK','HAN','2026-09-21 09:00:00+07','2026-09-21 11:00:00+07','scheduled'),
  (f15,'PR731','BKK','MNL','2026-09-21 07:30:00+07','2026-09-21 11:30:00+08','scheduled'),
  (f16,'GA866','BKK','CGK','2026-09-22 08:45:00+07','2026-09-22 12:45:00+07','scheduled'),
  (f17,'TR215','BKK','DPS','2026-09-22 10:00:00+07','2026-09-22 15:00:00+08','scheduled'),
  (f18,'SQ711','SIN','BKK','2026-09-22 14:30:00+08','2026-09-22 15:50:00+07','scheduled'),
  (f19,'AK802','KUL','BKK','2026-09-23 16:00:00+08','2026-09-23 17:20:00+07','scheduled'),
  (f20,'VN607','SGN','BKK','2026-09-23 11:00:00+07','2026-09-23 12:30:00+07','scheduled'),
  (f21,'SQ713','SIN','HKT','2026-09-24 09:00:00+08','2026-09-24 10:20:00+07','scheduled'),
  (f22,'AK900','KUL','CNX','2026-09-24 08:00:00+08','2026-09-24 09:50:00+07','scheduled'),
  (f23,'FD601','BKK','RGN','2026-09-25 08:00:00+07','2026-09-25 09:15:00+06:30','scheduled'),
  (f24,'QV201','BKK','VTE','2026-09-25 09:30:00+07','2026-09-25 10:30:00+07','scheduled')
ON CONFLICT (id) DO NOTHING;

-- East Asia (JL/NH/KE/OZ/CA/MU/CX/CI/CZ)
INSERT INTO flight (id,flight_number,origin_airport_id,destination_airport_id,departure_time,arrival_time,status) VALUES
  (f25,'JL707','BKK','NRT','2026-09-20 23:30:00+07','2026-09-21 07:30:00+09','scheduled'),
  (f26,'NH848','BKK','HND','2026-09-21 00:30:00+07','2026-09-21 08:15:00+09','scheduled'),
  (f27,'JL709','BKK','KIX','2026-09-21 22:00:00+07','2026-09-22 06:00:00+09','scheduled'),
  (f28,'KE658','BKK','ICN','2026-09-21 22:00:00+07','2026-09-22 05:40:00+09','scheduled'),
  (f29,'OZ741','BKK','ICN','2026-09-22 08:00:00+07','2026-09-22 15:45:00+09','scheduled'),
  (f30,'CA837','BKK','PEK','2026-09-22 09:00:00+07','2026-09-22 14:30:00+08','scheduled'),
  (f31,'MU501','BKK','PVG','2026-09-22 07:30:00+07','2026-09-22 12:30:00+08','scheduled'),
  (f32,'CX700','BKK','HKG','2026-09-23 07:00:00+07','2026-09-23 10:45:00+08','scheduled'),
  (f33,'CI831','BKK','TPE','2026-09-23 09:30:00+07','2026-09-23 14:00:00+08','scheduled'),
  (f34,'CZ325','BKK','CAN','2026-09-23 10:00:00+07','2026-09-23 14:00:00+08','scheduled'),
  (f35,'JL708','NRT','BKK','2026-09-24 09:30:00+09','2026-09-24 15:30:00+07','scheduled'),
  (f36,'KE659','ICN','BKK','2026-09-24 10:00:00+09','2026-09-24 14:00:00+07','scheduled')
ON CONFLICT (id) DO NOTHING;

-- South Asia & Middle East (AI/EK/QR/EY/SV/UL)
INSERT INTO flight (id,flight_number,origin_airport_id,destination_airport_id,departure_time,arrival_time,status) VALUES
  (f37,'AI333','BKK','DEL','2026-09-20 01:00:00+07','2026-09-20 03:30:00+05:30','scheduled'),
  (f38,'AI332','DEL','BKK','2026-09-20 18:00:00+05:30','2026-09-20 23:30:00+07','scheduled'),
  (f39,'AI342','BKK','BOM','2026-09-21 03:00:00+07','2026-09-21 06:00:00+05:30','scheduled'),
  (f40,'EK385','BKK','DXB','2026-09-20 00:30:00+07','2026-09-20 05:00:00+04','scheduled'),
  (f41,'EK384','DXB','BKK','2026-09-20 14:30:00+04','2026-09-21 01:30:00+07','scheduled'),
  (f42,'QR831','BKK','DOH','2026-09-21 01:00:00+07','2026-09-21 05:45:00+03','scheduled'),
  (f43,'QR832','DOH','BKK','2026-09-21 08:00:00+03','2026-09-21 21:00:00+07','scheduled'),
  (f44,'EY403','BKK','AUH','2026-09-22 23:45:00+07','2026-09-23 03:30:00+04','scheduled'),
  (f45,'SV846','BKK','RUH','2026-09-23 02:00:00+07','2026-09-23 07:15:00+03','scheduled'),
  (f46,'UL404','BKK','CMB','2026-09-23 01:30:00+07','2026-09-23 03:00:00+05:30','scheduled')
ON CONFLICT (id) DO NOTHING;

-- Europe (TG/BA/AF/LH/KL/LX/IB)
INSERT INTO flight (id,flight_number,origin_airport_id,destination_airport_id,departure_time,arrival_time,status) VALUES
  (f47,'TG910','BKK','LHR','2026-09-20 23:55:00+07','2026-09-21 06:30:00+01','scheduled'),
  (f48,'BA10','BKK','LHR','2026-09-21 22:30:00+07','2026-09-22 05:15:00+01','scheduled'),
  (f49,'TG924','BKK','CDG','2026-09-21 23:40:00+07','2026-09-22 06:30:00+02','scheduled'),
  (f50,'AF161','BKK','CDG','2026-09-22 23:50:00+07','2026-09-23 06:45:00+02','scheduled'),
  (f51,'LH773','BKK','FRA','2026-09-22 23:30:00+07','2026-09-23 06:00:00+02','scheduled'),
  (f52,'KL875','BKK','AMS','2026-09-23 23:45:00+07','2026-09-24 06:30:00+02','scheduled'),
  (f53,'LX181','BKK','ZRH','2026-09-24 23:15:00+07','2026-09-25 06:00:00+02','scheduled'),
  (f54,'TG942','BKK','FCO','2026-09-24 23:45:00+07','2026-09-25 07:00:00+02','scheduled'),
  (f55,'IB6795','BKK','MAD','2026-09-25 23:30:00+07','2026-09-26 07:30:00+02','scheduled'),
  (f56,'LH774','FRA','BKK','2026-09-26 14:00:00+02','2026-09-27 05:15:00+07','scheduled')
ON CONFLICT (id) DO NOTHING;

-- Oceania & Americas (QF/NZ/TG/UA/AA/EK/AC)
INSERT INTO flight (id,flight_number,origin_airport_id,destination_airport_id,departure_time,arrival_time,status) VALUES
  (f57,'QF24','BKK','SYD','2026-09-20 22:00:00+07','2026-09-21 09:30:00+10','scheduled'),
  (f58,'QF25','SYD','BKK','2026-09-20 12:00:00+10','2026-09-20 17:30:00+07','scheduled'),
  (f59,'NZ72','BKK','AKL','2026-09-21 22:45:00+07','2026-09-22 12:30:00+12','scheduled'),
  (f60,'TG641','BKK','MEL','2026-09-22 21:30:00+07','2026-09-23 09:00:00+10','scheduled'),
  (f61,'UA889','BKK','LAX','2026-09-20 16:00:00+07','2026-09-20 14:30:00-07','scheduled'),
  (f62,'UA888','LAX','BKK','2026-09-21 01:00:00-07','2026-09-22 06:00:00+07','scheduled'),
  (f63,'AA8369','BKK','JFK','2026-09-23 17:00:00+07','2026-09-23 19:30:00-04','scheduled'),
  (f64,'EK216','BKK','JFK','2026-09-24 00:30:00+07','2026-09-24 10:30:00-04','scheduled'),
  (f65,'AC65','BKK','YYZ','2026-09-25 14:00:00+07','2026-09-25 17:00:00-04','scheduled'),
  (f66,'QF26','SYD','BKK','2026-09-27 12:00:00+10','2026-09-27 17:30:00+07','scheduled')
ON CONFLICT (id) DO NOTHING;

-- Inter-regional hub flights
INSERT INTO flight (id,flight_number,origin_airport_id,destination_airport_id,departure_time,arrival_time,status) VALUES
  (f67,'SQ319','SIN','LHR','2026-09-20 23:30:00+08','2026-09-21 06:00:00+01','scheduled'),
  (f68,'EK002','DXB','LHR','2026-09-20 08:30:00+04','2026-09-20 13:00:00+01','scheduled'),
  (f69,'QR007','DOH','LHR','2026-09-20 07:00:00+03','2026-09-20 12:30:00+01','scheduled'),
  (f70,'JL413','NRT','LAX','2026-09-20 17:00:00+09','2026-09-20 11:00:00-07','scheduled'),
  (f71,'KE17','ICN','LAX','2026-09-20 19:00:00+09','2026-09-20 13:30:00-07','scheduled'),
  (f72,'SQ25','SIN','LAX','2026-09-20 00:05:00+08','2026-09-20 00:05:00-07','scheduled'),
  (f73,'EK507','DXB','SIN','2026-09-21 02:30:00+04','2026-09-21 14:30:00+08','scheduled'),
  (f74,'QR961','DOH','SIN','2026-09-21 02:00:00+03','2026-09-21 14:30:00+08','scheduled'),
  (f75,'CX251','HKG','LHR','2026-09-21 23:30:00+08','2026-09-22 06:00:00+01','scheduled'),
  (f76,'JL415','NRT','CDG','2026-09-22 12:00:00+09','2026-09-22 17:00:00+02','scheduled'),
  (f77,'SQ21','SIN','JFK','2026-09-22 22:00:00+08','2026-09-22 06:00:00-04','scheduled'),
  (f78,'EK204','DXB','JFK','2026-09-23 08:25:00+04','2026-09-23 15:00:00-04','scheduled'),
  (f79,'LH718','FRA','ICN','2026-09-23 15:30:00+02','2026-09-24 10:00:00+09','scheduled'),
  (f80,'BA005','LHR','ICN','2026-09-24 13:00:00+01','2026-09-25 08:00:00+09','scheduled')
ON CONFLICT (id) DO NOTHING;

-- 3. Cabin Classes
-- Domestic (economy+business)
INSERT INTO flight_cabin_class (flight_id,cabin_class,price,total_seats,available_seats) VALUES
  (f01,'economy',1590,120,110),(f01,'business',5900,16,16),
  (f02,'economy',1890,120,108),(f02,'business',6900,16,16),
  (f03,'economy',2100,120,115),(f03,'business',7500,16,14),
  (f04,'economy',1750,120,100),(f04,'business',6200,16,16),
  (f05,'economy',1890,120,119),(f05,'business',6800,16,16),
  (f06,'economy',1590,120,95),(f06,'business',5900,16,12),
  (f07,'economy',1890,120,102),(f07,'business',6900,16,16),
  (f08,'economy',1650,120,119),(f08,'business',5800,16,16),
  (f09,'economy',1490,120,118),(f09,'business',5500,16,16),
  (f10,'economy',1790,120,113),(f10,'business',6400,16,14)
ON CONFLICT (flight_id,cabin_class) DO NOTHING;

-- SE Asia (econ+prem+biz)
INSERT INTO flight_cabin_class (flight_id,cabin_class,price,total_seats,available_seats) VALUES
  (f11,'economy',3200,136,125),(f11,'premium_economy',6200,24,22),(f11,'business',13500,16,16),
  (f12,'economy',2800,136,130),(f12,'premium_economy',5500,24,24),(f12,'business',11500,16,16),
  (f13,'economy',2400,136,132),(f13,'premium_economy',4800,24,24),(f13,'business',10000,16,16),
  (f14,'economy',2600,136,128),(f14,'premium_economy',5000,24,20),(f14,'business',10500,16,14),
  (f15,'economy',3500,136,110),(f15,'premium_economy',7000,24,20),(f15,'business',14000,16,16),
  (f16,'economy',2900,136,122),(f16,'premium_economy',5800,24,22),(f16,'business',12000,16,16),
  (f17,'economy',2200,136,135),(f17,'premium_economy',4500,24,24),(f17,'business',9500,16,16),
  (f18,'economy',3200,136,120),(f18,'premium_economy',6200,24,20),(f18,'business',13000,16,12),
  (f19,'economy',2800,136,126),(f19,'premium_economy',5600,24,24),(f19,'business',11500,16,16),
  (f20,'economy',2400,136,130),(f20,'premium_economy',4800,24,24),(f20,'business',10000,16,16),
  (f21,'economy',3100,136,128),(f21,'premium_economy',6000,24,22),(f21,'business',12500,16,14),
  (f22,'economy',2700,136,135),(f22,'premium_economy',5200,24,24),(f22,'business',11000,16,16),
  (f23,'economy',2000,136,133),(f23,'premium_economy',4000,24,24),(f23,'business',8500,16,16),
  (f24,'economy',1800,136,134),(f24,'premium_economy',3600,24,24),(f24,'business',7500,16,16)
ON CONFLICT (flight_id,cabin_class) DO NOTHING;

-- East Asia + Long-haul (all 4 classes)
INSERT INTO flight_cabin_class (flight_id,cabin_class,price,total_seats,available_seats) VALUES
  (f25,'economy',8500,160,145),(f25,'premium_economy',15000,36,32),(f25,'business',35000,24,22),(f25,'first',68000,8,8),
  (f26,'economy',9000,160,140),(f26,'premium_economy',16000,36,30),(f26,'business',37000,24,20),(f26,'first',70000,8,6),
  (f27,'economy',8800,160,148),(f27,'premium_economy',15500,36,34),(f27,'business',36000,24,24),(f27,'first',68000,8,8),
  (f28,'economy',7800,160,138),(f28,'premium_economy',14000,36,30),(f28,'business',32000,24,20),(f28,'first',62000,8,8),
  (f29,'economy',8200,160,150),(f29,'premium_economy',14800,36,36),(f29,'business',34000,24,22),(f29,'first',64000,8,8),
  (f30,'economy',7200,160,155),(f30,'premium_economy',13000,36,36),(f30,'business',30000,24,24),(f30,'first',58000,8,8),
  (f31,'economy',7500,160,152),(f31,'premium_economy',13500,36,36),(f31,'business',31000,24,24),(f31,'first',60000,8,8),
  (f32,'economy',5500,160,140),(f32,'premium_economy',10000,36,32),(f32,'business',22000,24,20),(f32,'first',42000,8,8),
  (f33,'economy',7000,160,148),(f33,'premium_economy',12500,36,34),(f33,'business',28000,24,24),(f33,'first',55000,8,8),
  (f34,'economy',6800,160,150),(f34,'premium_economy',12000,36,36),(f34,'business',26000,24,24),(f34,'first',52000,8,8),
  (f35,'economy',8500,160,142),(f35,'premium_economy',15000,36,30),(f35,'business',35000,24,20),(f35,'first',68000,8,6),
  (f36,'economy',7800,160,140),(f36,'premium_economy',14000,36,32),(f36,'business',32000,24,18),(f36,'first',62000,8,8),
  (f37,'economy',6500,160,155),(f37,'premium_economy',12000,36,36),(f37,'business',28000,24,24),(f37,'first',54000,8,8),
  (f38,'economy',6500,160,150),(f38,'premium_economy',12000,36,34),(f38,'business',28000,24,22),(f38,'first',54000,8,8),
  (f39,'economy',7000,160,158),(f39,'premium_economy',13000,36,36),(f39,'business',30000,24,24),(f39,'first',58000,8,8),
  (f40,'economy',9500,160,140),(f40,'premium_economy',17000,36,30),(f40,'business',40000,24,18),(f40,'first',78000,8,6),
  (f41,'economy',9500,160,138),(f41,'premium_economy',17000,36,30),(f41,'business',40000,24,20),(f41,'first',78000,8,8),
  (f42,'economy',10000,160,145),(f42,'premium_economy',18000,36,32),(f42,'business',42000,24,22),(f42,'first',82000,8,8),
  (f43,'economy',10000,160,142),(f43,'premium_economy',18000,36,30),(f43,'business',42000,24,20),(f43,'first',82000,8,6),
  (f44,'economy',9800,160,148),(f44,'premium_economy',17500,36,34),(f44,'business',41000,24,22),(f44,'first',80000,8,8),
  (f45,'economy',11000,160,150),(f45,'premium_economy',19000,36,36),(f45,'business',45000,24,24),(f45,'first',88000,8,8),
  (f46,'economy',5800,160,158),(f46,'premium_economy',11000,36,36),(f46,'business',26000,24,24),(f46,'first',50000,8,8),
  (f47,'economy',18000,160,120),(f47,'premium_economy',32000,36,24),(f47,'business',80000,24,16),(f47,'first',155000,8,6),
  (f48,'economy',20000,160,115),(f48,'premium_economy',36000,36,22),(f48,'business',88000,24,14),(f48,'first',170000,8,4),
  (f49,'economy',18500,160,118),(f49,'premium_economy',33000,36,22),(f49,'business',82000,24,16),(f49,'first',160000,8,6),
  (f50,'economy',19000,160,112),(f50,'premium_economy',34000,36,20),(f50,'business',84000,24,14),(f50,'first',162000,8,4),
  (f51,'economy',18000,160,120),(f51,'premium_economy',32000,36,24),(f51,'business',80000,24,18),(f51,'first',155000,8,6),
  (f52,'economy',19500,160,110),(f52,'premium_economy',35000,36,22),(f52,'business',86000,24,16),(f52,'first',165000,8,6),
  (f53,'economy',20000,160,118),(f53,'premium_economy',36000,36,24),(f53,'business',88000,24,20),(f53,'first',170000,8,8),
  (f54,'economy',18000,160,122),(f54,'premium_economy',32000,36,26),(f54,'business',80000,24,18),(f54,'first',155000,8,6),
  (f55,'economy',19500,160,115),(f55,'premium_economy',35000,36,22),(f55,'business',86000,24,16),(f55,'first',165000,8,4),
  (f56,'economy',18000,160,118),(f56,'premium_economy',32000,36,24),(f56,'business',80000,24,16),(f56,'first',155000,8,6),
  (f57,'economy',12000,160,130),(f57,'premium_economy',22000,36,28),(f57,'business',55000,24,20),(f57,'first',105000,8,8),
  (f58,'economy',12000,160,128),(f58,'premium_economy',22000,36,28),(f58,'business',55000,24,18),(f58,'first',105000,8,8),
  (f59,'economy',14000,160,125),(f59,'premium_economy',25000,36,24),(f59,'business',62000,24,18),(f59,'first',120000,8,6),
  (f60,'economy',13000,160,128),(f60,'premium_economy',24000,36,26),(f60,'business',60000,24,20),(f60,'first',115000,8,8),
  (f61,'economy',25000,160,118),(f61,'premium_economy',45000,36,20),(f61,'business',115000,24,14),(f61,'first',220000,8,4),
  (f62,'economy',25000,160,115),(f62,'premium_economy',45000,36,18),(f62,'business',115000,24,12),(f62,'first',220000,8,4),
  (f63,'economy',28000,160,110),(f63,'premium_economy',50000,36,16),(f63,'business',125000,24,10),(f63,'first',240000,8,2),
  (f64,'economy',26000,160,112),(f64,'premium_economy',47000,36,18),(f64,'business',120000,24,12),(f64,'first',230000,8,4),
  (f65,'economy',27000,160,115),(f65,'premium_economy',48000,36,20),(f65,'business',122000,24,12),(f65,'first',235000,8,4),
  (f66,'economy',12000,160,130),(f66,'premium_economy',22000,36,28),(f66,'business',55000,24,20),(f66,'first',105000,8,8),
  (f67,'economy',21000,160,140),(f67,'premium_economy',45000,36,30),(f67,'business',145000,24,18),(f67,'first',275000,8,6),
  (f68,'economy',15000,160,145),(f68,'premium_economy',33000,36,32),(f68,'business',120000,24,20),(f68,'first',230000,8,8),
  (f69,'economy',16000,160,142),(f69,'premium_economy',35000,36,30),(f69,'business',128000,24,18),(f69,'first',245000,8,6),
  (f70,'economy',18000,160,148),(f70,'premium_economy',38000,36,34),(f70,'business',135000,24,22),(f70,'first',260000,8,8),
  (f71,'economy',17000,160,142),(f71,'premium_economy',36000,36,32),(f71,'business',130000,24,20),(f71,'first',250000,8,8),
  (f72,'economy',22000,160,136),(f72,'premium_economy',48000,36,28),(f72,'business',155000,24,16),(f72,'first',295000,8,4),
  (f73,'economy',12000,160,150),(f73,'premium_economy',26000,36,34),(f73,'business',88000,24,22),(f73,'first',168000,8,8),
  (f74,'economy',11000,160,152),(f74,'premium_economy',24000,36,36),(f74,'business',82000,24,24),(f74,'first',157000,8,8),
  (f75,'economy',19000,160,138),(f75,'premium_economy',42000,36,28),(f75,'business',140000,24,16),(f75,'first',268000,8,4),
  (f76,'economy',22000,160,140),(f76,'premium_economy',48000,36,30),(f76,'business',155000,24,18),(f76,'first',295000,8,6),
  (f77,'economy',26000,160,130),(f77,'premium_economy',57000,36,24),(f77,'business',178000,24,12),(f77,'first',340000,8,2),
  (f78,'economy',24000,160,132),(f78,'premium_economy',54000,36,26),(f78,'business',168000,24,14),(f78,'first',320000,8,4),
  (f79,'economy',18000,160,148),(f79,'premium_economy',38000,36,32),(f79,'business',135000,24,20),(f79,'first',258000,8,8),
  (f80,'economy',19000,160,142),(f80,'premium_economy',42000,36,28),(f80,'business',142000,24,18),(f80,'first',272000,8,6)
ON CONFLICT (flight_id,cabin_class) DO NOTHING;

-- 4. Seat Generation
-- Domestic (rows 1-24)
INSERT INTO seat (flight_id,seat_number,row_number,column_letter,cabin_class,is_window,is_aisle,is_exit_row)
SELECT fid, row_n::text||col, row_n, col,
  CASE WHEN row_n<=4 THEN 'business' ELSE 'economy' END,
  col IN ('A', CASE WHEN row_n<=4 THEN 'D' ELSE 'F' END),
  col IN (CASE WHEN row_n<=4 THEN 'B' ELSE 'C' END, CASE WHEN row_n<=4 THEN 'C' ELSE 'D' END),
  row_n IN (14,15) AND row_n>4
FROM (VALUES (f01),(f02),(f03),(f04),(f05),(f06),(f07),(f08),(f09),(f10)) AS flights(fid)
CROSS JOIN generate_series(1,24) AS row_n
CROSS JOIN unnest(CASE WHEN row_n<=4 THEN ARRAY['A','B','C','D'] ELSE ARRAY['A','B','C','D','E','F'] END) AS col
ON CONFLICT (flight_id,seat_number) DO NOTHING;

-- Regional (rows 1-30)
INSERT INTO seat (flight_id,seat_number,row_number,column_letter,cabin_class,is_window,is_aisle,is_exit_row)
SELECT fid, row_n::text||col, row_n, col,
  CASE WHEN row_n<=4 THEN 'business' WHEN row_n<=8 THEN 'premium_economy' ELSE 'economy' END,
  col IN ('A', CASE WHEN row_n<=4 THEN 'D' ELSE 'F' END),
  col IN (CASE WHEN row_n<=4 THEN 'B' ELSE 'C' END, CASE WHEN row_n<=4 THEN 'C' ELSE 'D' END),
  row_n IN (15,16)
FROM (VALUES (f11),(f12),(f13),(f14),(f15),(f16),(f17),(f18),(f19),(f20),(f21),(f22),(f23),(f24)) AS flights(fid)
CROSS JOIN generate_series(1,30) AS row_n
CROSS JOIN unnest(CASE WHEN row_n<=4 THEN ARRAY['A','B','C','D'] ELSE ARRAY['A','B','C','D','E','F'] END) AS col
ON CONFLICT (flight_id,seat_number) DO NOTHING;

-- Long-haul (rows 1-40, all 4 classes)
INSERT INTO seat (flight_id,seat_number,row_number,column_letter,cabin_class,is_window,is_aisle,is_exit_row)
SELECT fid, row_n::text||col, row_n, col,
  CASE WHEN row_n<=2 THEN 'first' WHEN row_n<=8 THEN 'business' WHEN row_n<=14 THEN 'premium_economy' ELSE 'economy' END,
  col IN ('A', CASE WHEN row_n<=8 THEN 'D' ELSE 'F' END),
  col IN (CASE WHEN row_n<=8 THEN 'B' ELSE 'C' END, CASE WHEN row_n<=8 THEN 'C' ELSE 'D' END),
  row_n IN (20,21)
FROM (VALUES
  (f25),(f26),(f27),(f28),(f29),(f30),(f31),(f32),(f33),(f34),(f35),(f36),
  (f37),(f38),(f39),(f40),(f41),(f42),(f43),(f44),(f45),(f46),
  (f47),(f48),(f49),(f50),(f51),(f52),(f53),(f54),(f55),(f56),
  (f57),(f58),(f59),(f60),(f61),(f62),(f63),(f64),(f65),(f66),
  (f67),(f68),(f69),(f70),(f71),(f72),(f73),(f74),(f75),(f76),(f77),(f78),(f79),(f80)
) AS flights(fid)
CROSS JOIN generate_series(1,40) AS row_n
CROSS JOIN unnest(CASE WHEN row_n<=8 THEN ARRAY['A','B','C','D'] ELSE ARRAY['A','B','C','D','E','F'] END) AS col
ON CONFLICT (flight_id,seat_number) DO NOTHING;

-- 5. Occupied seats for realism
UPDATE seat SET status='occupied' WHERE flight_id=f01 AND seat_number IN ('5A','5B','6C','7D','8E','9F','10A','12B','15A');
UPDATE seat SET status='occupied' WHERE flight_id=f02 AND seat_number IN ('5A','5B','6C','7D','8E','9F','11B','13C','14D');
UPDATE seat SET status='occupied' WHERE flight_id=f11 AND seat_number IN ('9A','9B','10D','11F','12A','13B','14C','15D','16E','18F','20A','21B');
UPDATE seat SET status='occupied' WHERE flight_id=f25 AND seat_number IN ('15A','15B','16D','17F','18A','19B','20C','21D','22E','23F','24A','25B','30C');
UPDATE seat SET status='occupied' WHERE flight_id=f40 AND seat_number IN ('15A','16B','17C','18D','19E','20F','21A','22B','23C','24D');
UPDATE seat SET status='occupied' WHERE flight_id=f47 AND seat_number IN ('15A','16B','17C','18D','20E','21F','22A','23B','25C','26D','28E','30F');
UPDATE seat SET status='occupied' WHERE flight_id=f61 AND seat_number IN ('15A','15B','16C','17D','18E','19F','20A','21B','22C','23D','24E','25F','26A','27B','28C');

END;
$$;
