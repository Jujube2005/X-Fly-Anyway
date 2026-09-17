/**
 * X-Fly Anyway — Seed Generator (stream edition)
 * Streams directly to file — no OOM.
 *
 * Run:   node scripts/generate-seed.mjs
 * Output: supabase/seed_generated.sql
 */

import { createWriteStream } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");

// ─── CONFIG ──────────────────────────────────────────────────────────────────
const START_DATE = new Date("2026-09-20T00:00:00.000Z");
const END_DATE   = new Date("2026-10-16T00:00:00.000Z"); // 26 days
const MAX_AIRLINES_PER_ROUTE = 3;

// Focus only on routes where at least one side is a PRIMARY hub
// This keeps data realistic without exploding to 100M rows
const PRIMARY = new Set(["BKK","SIN","DXB","DOH","LHR","NRT","ICN","HKG","SYD","LAX","JFK"]);

const ALL_AIRPORTS = new Set([
  "BKK", "DMK", "CNX", "HKT", "USM", "HDY", "KBV", "URT", 
  "SIN", "KUL", "HKG", "NRT", "HND", "ICN", "PEK", "PVG", 
  "DEL", "SYD", "MNL", "SGN", "HAN", "CGK", "DXB", "LHR"
]);

const DURATIONS = {
  "BKK-CNX":70,"CNX-BKK":70,"BKK-HKT":80,"HKT-BKK":80,"BKK-USM":80,"USM-BKK":80,
  "BKK-HDY":100,"HDY-BKK":100,"BKK-KBV":80,"KBV-BKK":80,"BKK-CEI":90,"CEI-BKK":90,
  "BKK-UTH":65,"UTH-BKK":65,"CNX-HKT":110,"HKT-CNX":110,"DMK-CNX":70,"CNX-DMK":70,
  "BKK-SIN":145,"SIN-BKK":145,"BKK-KUL":135,"KUL-BKK":135,
  "BKK-SGN":80,"SGN-BKK":80,"BKK-HAN":110,"HAN-BKK":110,
  "BKK-MNL":180,"MNL-BKK":180,"BKK-CGK":195,"CGK-BKK":195,
  "BKK-DPS":185,"DPS-BKK":185,"BKK-RGN":75,"RGN-BKK":75,
  "SIN-HKT":80,"HKT-SIN":80,"SIN-CNX":120,"CNX-SIN":120,
  "KUL-CNX":110,"CNX-KUL":110,"SIN-KUL":60,"KUL-SIN":60,
  "BKK-NRT":355,"NRT-BKK":355,"BKK-HND":355,"HND-BKK":355,"BKK-KIX":330,"KIX-BKK":330,
  "BKK-ICN":325,"ICN-BKK":325,"BKK-PEK":330,"PEK-BKK":330,
  "BKK-PVG":285,"PVG-BKK":285,"BKK-HKG":165,"HKG-BKK":165,
  "BKK-TPE":225,"TPE-BKK":225,"BKK-CAN":185,"CAN-BKK":185,
  "HKG-NRT":230,"NRT-HKG":230,"HKG-ICN":190,"ICN-HKG":190,
  "HKG-LHR":720,"LHR-HKG":720,"NRT-ICN":130,"ICN-NRT":130,
  "BKK-DEL":230,"DEL-BKK":230,"BKK-BOM":255,"BOM-BKK":255,"BKK-CMB":170,"CMB-BKK":170,
  "BKK-DXB":365,"DXB-BKK":365,"BKK-DOH":385,"DOH-BKK":385,
  "BKK-AUH":370,"AUH-BKK":370,"BKK-RUH":395,"RUH-BKK":395,
  "DXB-LHR":420,"LHR-DXB":420,"DOH-LHR":415,"LHR-DOH":415,
  "DXB-CDG":430,"CDG-DXB":430,"DXB-SIN":255,"SIN-DXB":255,
  "DOH-SIN":270,"SIN-DOH":270,"DXB-JFK":840,"JFK-DXB":840,
  "DXB-NRT":480,"NRT-DXB":480,"DOH-NRT":490,"NRT-DOH":490,
  "DXB-ICN":470,"ICN-DXB":470,"DXB-SYD":840,"SYD-DXB":840,
  "BKK-LHR":685,"LHR-BKK":685,"BKK-CDG":690,"CDG-BKK":690,
  "BKK-FRA":680,"FRA-BKK":680,"BKK-AMS":700,"AMS-BKK":700,
  "BKK-ZRH":690,"ZRH-BKK":690,"BKK-FCO":680,"FCO-BKK":680,
  "BKK-MAD":720,"MAD-BKK":720,"BKK-MUC":690,"MUC-BKK":690,
  "FRA-ICN":600,"ICN-FRA":600,"LHR-ICN":640,"ICN-LHR":640,
  "NRT-CDG":720,"CDG-NRT":720,"LHR-CDG":75,"CDG-LHR":75,
  "LHR-FRA":120,"FRA-LHR":120,"LHR-AMS":75,"AMS-LHR":75,
  "LHR-JFK":420,"JFK-LHR":420,"LHR-LAX":660,"LAX-LHR":660,
  "LHR-SYD":1260,"SYD-LHR":1260,
  "BKK-SYD":545,"SYD-BKK":545,"BKK-MEL":560,"MEL-BKK":560,"BKK-AKL":680,"AKL-BKK":680,
  "SIN-SYD":485,"SYD-SIN":485,"SIN-MEL":500,"MEL-SIN":500,
  "SIN-AKL":600,"AKL-SIN":600,"SIN-LAX":870,"LAX-SIN":870,"SIN-JFK":910,"JFK-SIN":910,
  "NRT-SYD":600,"SYD-NRT":600,"ICN-SYD":610,"SYD-ICN":610,
  "BKK-LAX":855,"LAX-BKK":855,"BKK-JFK":930,"JFK-BKK":930,"BKK-YYZ":920,"YYZ-BKK":920,
  "NRT-LAX":545,"LAX-NRT":545,"ICN-LAX":560,"LAX-ICN":560,
  "HKG-LAX":750,"LAX-HKG":750,"HKG-JFK":910,"JFK-HKG":910,
  "BKK-JNB":640,"JNB-BKK":640,"BKK-CAI":430,"CAI-BKK":430,"DXB-JNB":500,"JNB-DXB":500,
};

const TZ = {
  BKK:7,DMK:7,CNX:7,HKT:7,USM:7,HDY:7,KBV:7,URT:7,CEI:7,UTH:7,
  SIN:8,KUL:8,SGN:7,HAN:7,MNL:8,CGK:7,DPS:8,RGN:6.5,PNH:7,VTE:7,
  NRT:9,HND:9,KIX:9,ICN:9,PEK:8,PVG:8,HKG:8,TPE:8,CAN:8,
  DEL:5.5,BOM:5.5,CMB:5.5,DXB:4,AUH:4,DOH:3,RUH:3,
  LHR:1,CDG:2,FRA:2,AMS:2,ZRH:2,FCO:2,MAD:2,MUC:2,
  SYD:10,MEL:10,AKL:12,LAX:-7,JFK:-4,YYZ:-4,JNB:2,CAI:3,
};

// ─── HELPERS ─────────────────────────────────────────────────────────────────
let _idx = 1;
function nextId() {
  const n = _idx++;
  return `a2${n.toString(16).padStart(6,"0")}-0000-4000-8000-${String(n).padStart(12,"0")}`;
}

const rand = (a,b) => Math.round(Math.random()*(b-a)+a);

function fmtTs(utcDate, tz) {
  return utcDate.toISOString();
}

function getDur(o,d) { return DURATIONS[`${o}-${d}`] ?? 360; }

function depTimes(dur) {
  if (dur <= 90)  return [6,8,10,13,16,19];
  if (dur <= 250) return [7,11,15,20];
  if (dur <= 480) return [1,9,22];
  return [0,23];
}

function econPrice(dur) {
  if (dur<=90)  return rand(900,2800);
  if (dur<=200) return rand(2500,7500);
  if (dur<=400) return rand(7000,20000);
  if (dur<=600) return rand(18000,35000);
  return rand(32000,60000);
}

// Seat generation disabled — seats are created on-demand by the app
// To re-enable: uncomment the seat generation block in generate()
function cabinCfgs(dur) {
  const ep = econPrice(dur);
  if (dur<=90) return [
    {cl:"economy",        p:ep,    t:150,a:rand(90,149)},
    {cl:"business",       p:ep*3,  t:20, a:rand(8,20)},
  ];
  if (dur>380) return [
    {cl:"economy",        p:ep,    t:210,a:rand(110,209)},
    {cl:"premium_economy",p:ep*1.8,t:48, a:rand(20,48)},
    {cl:"business",       p:ep*4,  t:36, a:rand(6,36)},
    {cl:"first",          p:ep*8,  t:8,  a:rand(1,8)},
  ];
  return [
    {cl:"economy",        p:ep,    t:150,a:rand(80,149)},
    {cl:"premium_economy",p:ep*1.6,t:24, a:rand(8,24)},
    {cl:"business",       p:ep*3.2,t:24, a:rand(4,24)},
  ];
}

// ─── FETCH OPENFLIGHTS ────────────────────────────────────────────────────────
async function fetchRoutes() {
  const url = "https://raw.githubusercontent.com/jpatokal/openflights/master/data/routes.dat";
  process.stdout.write("  Fetching OpenFlights routes.dat ... ");
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const text = await res.text();
  const seen = new Set();
  const routes = [];
  for (const line of text.split("\n")) {
    const c = line.trim().split(",");
    if (c.length < 8) continue;
    const airline = c[0].trim();
    const origin  = c[2].trim();
    const dest    = c[4].trim();
    const stops   = parseInt(c[7])||0;
    if (
      airline && airline !== "\\N" &&
      origin.length===3 && dest.length===3 && stops===0 &&
      ALL_AIRPORTS.has(origin) && ALL_AIRPORTS.has(dest) &&
      (PRIMARY.has(origin) || PRIMARY.has(dest)) // at least one primary hub
    ) {
      const key = `${airline}-${origin}-${dest}`;
      if (!seen.has(key)) { seen.add(key); routes.push({airline,origin,dest}); }
    }
  }
  console.log(`${routes.length} routes`);
  return routes;
}

// ─── STREAM GENERATOR ─────────────────────────────────────────────────────────
async function generate(routes, stream) {
  const write = (s) => new Promise((ok, err) => {
    if (!stream.write(s)) stream.once("drain", ok);
    else ok();
  });

  const days = [];
  for (let d = new Date(START_DATE); d < END_DATE; d = new Date(d.getTime()+86400000))
    days.push(new Date(d));

  // Group by pair
  const byPair = new Map();
  for (const r of routes) {
    const k = `${r.origin}-${r.dest}`;
    if (!byPair.has(k)) byPair.set(k,[]);
    byPair.get(k).push(r.airline);
  }

  let flightCount=0, cabinCount=0, seatCount=0;
  let flightBuf=[], cabinBuf=[], seatBuf=[];

  const flush = async (force=false) => {
    if (flightBuf.length >= 200 || force) {
      if (flightBuf.length > 0) {
        await write(`INSERT INTO flight (id,flight_number,origin_airport_id,destination_airport_id,departure_time,arrival_time,status) VALUES\n`);
        await write(flightBuf.join(",\n")+";\n\n");
        flightBuf=[];
      }
      if (cabinBuf.length > 0) {
        await write(`INSERT INTO flight_cabin_class (flight_id,cabin_class,price,total_seats,available_seats,currency) VALUES\n`);
        await write(cabinBuf.join(",\n")+";\n\n");
        cabinBuf=[];
      }
      if (seatBuf.length > 0) {
        await write(`INSERT INTO seat (flight_id,cabin_class,row_number,column_letter,seat_number,status,is_window,is_aisle,is_extra_legroom) VALUES\n`);
        await write(seatBuf.join(",\n")+";\n\n");
        seatBuf=[];
      }
    }
  };

  for (const [pair, airlines] of byPair) {
    const [origin, dest] = pair.split("-");
    const dur  = getDur(origin, dest);
    const tzO  = TZ[origin]??0;
    const tzD  = TZ[dest]??0;
    const times = depTimes(dur);
    const als   = airlines.slice(0, MAX_AIRLINES_PER_ROUTE);

    for (const day of days) {
      als.forEach((al, i) => {
        const depH = times[i % times.length];
        const depUtc = new Date(day);
        depUtc.setUTCHours(depH - tzO, rand(0,3)*15, 0, 0);
        const arrUtc = new Date(depUtc.getTime() + dur*60000);

        const id = nextId();
        const fn = `${al}${rand(100,999)}`;

        flightBuf.push(`('${id}','${fn}','${origin}','${dest}','${fmtTs(depUtc,tzO)}','${fmtTs(arrUtc,tzD)}','scheduled')`);
        flightCount++;

        for (const cab of cabinCfgs(dur)) {
          cabinBuf.push(`('${id}','${cab.cl}',${Math.round(cab.p)},${cab.t},${cab.a},'THB')`);
          cabinCount++;

          // Seat generation is disabled to keep file small
          // Seats will be created dynamically on-demand in the app
        }
      });
    }
    await flush();
  }
  await flush(true);

  return {flightCount, cabinCount, seatCount};
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────
async function main() {
  console.log("🚀 X-Fly Anyway Seed Generator (stream mode)");
  console.log("━".repeat(52));

  let routes;
  try {
    routes = await fetchRoutes();
  } catch (e) {
    console.warn(`⚠️  OpenFlights failed (${e.message}). Using built-in fallback.`);
    routes = FALLBACK;
  }

  const out = resolve(ROOT, "supabase", "seed_generated.sql");
  const stream = createWriteStream(out, {encoding:"utf8"});

  const totalDays = Math.round((END_DATE-START_DATE)/86400000);
  console.log(`⚙️  Streaming ${totalDays} days × ${routes.length} routes → seed_generated.sql`);

  await new Promise((ok,err) => { stream.on("open",ok); stream.on("error",err); });

  stream.write(`-- =============================================================================\n`);
  stream.write(`-- X-Fly Anyway — Generated Seed (OpenFlights base + synthetic schedules)\n`);
  stream.write(`-- Generated: ${new Date().toISOString()}\n`);
  stream.write(`-- Routes: ${routes.length} | Days: ${totalDays}\n`);
  stream.write(`-- =============================================================================\n\n`);
  stream.write(`TRUNCATE seat, flight_cabin_class, flight CASCADE;\n\n`);

  const {flightCount, cabinCount, seatCount} = await generate(routes, stream);

  await new Promise((ok,err) => { stream.end(); stream.on("finish",ok); stream.on("error",err); });

  const fs = await import("fs");
  const mb = (fs.statSync(out).size/1048576).toFixed(1);

  console.log(`\n✅ Done!`);
  console.log(`   Flights:  ${flightCount.toLocaleString()}`);
  console.log(`   Cabins:   ${cabinCount.toLocaleString()}`);
  console.log(`   Seats:    ${seatCount.toLocaleString()}`);
  console.log(`   File:     supabase/seed_generated.sql (${mb} MB)`);
  console.log(`\n🎉 Paste into Supabase SQL Editor to import.`);
}

// ─── FALLBACK ─────────────────────────────────────────────────────────────────
const FALLBACK = [
  {airline:"TG",origin:"BKK",dest:"CNX"},{airline:"FD",origin:"BKK",dest:"CNX"},{airline:"WE",origin:"BKK",dest:"CNX"},
  {airline:"TG",origin:"CNX",dest:"BKK"},{airline:"FD",origin:"CNX",dest:"BKK"},{airline:"WE",origin:"CNX",dest:"BKK"},
  {airline:"TG",origin:"BKK",dest:"HKT"},{airline:"FD",origin:"BKK",dest:"HKT"},{airline:"PG",origin:"BKK",dest:"HKT"},
  {airline:"TG",origin:"HKT",dest:"BKK"},{airline:"FD",origin:"HKT",dest:"BKK"},{airline:"PG",origin:"HKT",dest:"BKK"},
  {airline:"TG",origin:"BKK",dest:"HDY"},{airline:"FD",origin:"BKK",dest:"HDY"},
  {airline:"TG",origin:"HDY",dest:"BKK"},{airline:"FD",origin:"HDY",dest:"BKK"},
  {airline:"TG",origin:"BKK",dest:"CEI"},{airline:"PG",origin:"BKK",dest:"CEI"},
  {airline:"TG",origin:"CEI",dest:"BKK"},{airline:"PG",origin:"CEI",dest:"BKK"},
  {airline:"TG",origin:"BKK",dest:"USM"},{airline:"PG",origin:"BKK",dest:"USM"},
  {airline:"TG",origin:"USM",dest:"BKK"},{airline:"PG",origin:"USM",dest:"BKK"},
  {airline:"SQ",origin:"BKK",dest:"SIN"},{airline:"TG",origin:"BKK",dest:"SIN"},{airline:"TR",origin:"BKK",dest:"SIN"},
  {airline:"SQ",origin:"SIN",dest:"BKK"},{airline:"TG",origin:"SIN",dest:"BKK"},{airline:"TR",origin:"SIN",dest:"BKK"},
  {airline:"AK",origin:"BKK",dest:"KUL"},{airline:"MH",origin:"BKK",dest:"KUL"},{airline:"TG",origin:"BKK",dest:"KUL"},
  {airline:"AK",origin:"KUL",dest:"BKK"},{airline:"MH",origin:"KUL",dest:"BKK"},{airline:"TG",origin:"KUL",dest:"BKK"},
  {airline:"VN",origin:"BKK",dest:"SGN"},{airline:"VN",origin:"SGN",dest:"BKK"},
  {airline:"VN",origin:"BKK",dest:"HAN"},{airline:"VN",origin:"HAN",dest:"BKK"},
  {airline:"PR",origin:"BKK",dest:"MNL"},{airline:"PR",origin:"MNL",dest:"BKK"},
  {airline:"GA",origin:"BKK",dest:"CGK"},{airline:"GA",origin:"CGK",dest:"BKK"},
  {airline:"SQ",origin:"SIN",dest:"HKT"},{airline:"AK",origin:"KUL",dest:"CNX"},
  {airline:"JL",origin:"BKK",dest:"NRT"},{airline:"NH",origin:"BKK",dest:"NRT"},{airline:"TG",origin:"BKK",dest:"NRT"},
  {airline:"JL",origin:"NRT",dest:"BKK"},{airline:"NH",origin:"NRT",dest:"BKK"},{airline:"TG",origin:"NRT",dest:"BKK"},
  {airline:"KE",origin:"BKK",dest:"ICN"},{airline:"OZ",origin:"BKK",dest:"ICN"},{airline:"TG",origin:"BKK",dest:"ICN"},
  {airline:"KE",origin:"ICN",dest:"BKK"},{airline:"OZ",origin:"ICN",dest:"BKK"},{airline:"TG",origin:"ICN",dest:"BKK"},
  {airline:"CX",origin:"BKK",dest:"HKG"},{airline:"TG",origin:"BKK",dest:"HKG"},
  {airline:"CX",origin:"HKG",dest:"BKK"},{airline:"TG",origin:"HKG",dest:"BKK"},
  {airline:"CI",origin:"BKK",dest:"TPE"},{airline:"CI",origin:"TPE",dest:"BKK"},
  {airline:"CX",origin:"HKG",dest:"NRT"},{airline:"CX",origin:"HKG",dest:"LHR"},
  {airline:"EK",origin:"BKK",dest:"DXB"},{airline:"TG",origin:"BKK",dest:"DXB"},
  {airline:"EK",origin:"DXB",dest:"BKK"},{airline:"TG",origin:"DXB",dest:"BKK"},
  {airline:"QR",origin:"BKK",dest:"DOH"},{airline:"QR",origin:"DOH",dest:"BKK"},
  {airline:"EY",origin:"BKK",dest:"AUH"},{airline:"EY",origin:"AUH",dest:"BKK"},
  {airline:"EK",origin:"DXB",dest:"LHR"},{airline:"QR",origin:"DOH",dest:"LHR"},
  {airline:"EK",origin:"DXB",dest:"SIN"},{airline:"EK",origin:"DXB",dest:"JFK"},
  {airline:"TG",origin:"BKK",dest:"LHR"},{airline:"BA",origin:"BKK",dest:"LHR"},
  {airline:"TG",origin:"LHR",dest:"BKK"},{airline:"BA",origin:"LHR",dest:"BKK"},
  {airline:"TG",origin:"BKK",dest:"CDG"},{airline:"AF",origin:"BKK",dest:"CDG"},
  {airline:"TG",origin:"CDG",dest:"BKK"},
  {airline:"LH",origin:"BKK",dest:"FRA"},{airline:"LH",origin:"FRA",dest:"BKK"},
  {airline:"KL",origin:"BKK",dest:"AMS"},{airline:"KL",origin:"AMS",dest:"BKK"},
  {airline:"LH",origin:"FRA",dest:"ICN"},{airline:"BA",origin:"LHR",dest:"ICN"},
  {airline:"JL",origin:"NRT",dest:"CDG"},
  {airline:"QF",origin:"BKK",dest:"SYD"},{airline:"TG",origin:"BKK",dest:"SYD"},
  {airline:"QF",origin:"SYD",dest:"BKK"},{airline:"TG",origin:"SYD",dest:"BKK"},
  {airline:"TG",origin:"BKK",dest:"MEL"},{airline:"QF",origin:"BKK",dest:"MEL"},
  {airline:"TG",origin:"MEL",dest:"BKK"},{airline:"QF",origin:"MEL",dest:"BKK"},
  {airline:"NZ",origin:"BKK",dest:"AKL"},{airline:"NZ",origin:"AKL",dest:"BKK"},
  {airline:"SQ",origin:"SIN",dest:"SYD"},{airline:"SQ",origin:"SIN",dest:"MEL"},
  {airline:"UA",origin:"BKK",dest:"LAX"},{airline:"UA",origin:"LAX",dest:"BKK"},
  {airline:"AA",origin:"BKK",dest:"JFK"},{airline:"AA",origin:"JFK",dest:"BKK"},
  {airline:"JL",origin:"NRT",dest:"LAX"},{airline:"KE",origin:"ICN",dest:"LAX"},
  {airline:"SQ",origin:"SIN",dest:"LAX"},{airline:"SQ",origin:"SIN",dest:"JFK"},
  {airline:"HKG",origin:"HKG",dest:"LAX"},{airline:"CX",origin:"HKG",dest:"JFK"},
];

main().catch(e => { console.error("❌",e.message); process.exit(1); });
