PRAGMA foreign_keys=ON;

CREATE TABLE IF NOT EXISTS timeslot (
  date        TEXT NOT NULL,
  time        TEXT NOT NULL,
  capacity    INTEGER NOT NULL DEFAULT 3,
  booked      INTEGER NOT NULL DEFAULT 0,
  created_at  TEXT NOT NULL DEFAULT (CURRENT_TIMESTAMP),
  PRIMARY KEY (date, time)
);

CREATE TABLE IF NOT EXISTS timeslot_block (
  date        TEXT NOT NULL,
  start       TEXT NOT NULL,
  end         TEXT NOT NULL,
  reason      TEXT,
  created_at  TEXT NOT NULL DEFAULT (CURRENT_TIMESTAMP),
  PRIMARY KEY (date, start, end)
);

BEGIN TRANSACTION;
DELETE FROM timeslot WHERE date = '2025-11-15';
INSERT INTO timeslot (date, time, capacity, booked) VALUES
  ('2025-11-15','13:00',2,0),
  ('2025-11-15','13:30',3,0),
  ('2025-11-15','14:00',3,0),
  ('2025-11-15','14:30',1,0),  -- exception
  ('2025-11-15','15:00',3,0),
  ('2025-11-15','15:30',3,0),
  ('2025-11-15','16:00',3,0),
  ('2025-11-15','16:30',1,0),  -- exception
  ('2025-11-15','17:00',3,0),
  ('2025-11-15','17:30',3,0),
  ('2025-11-15','18:00',3,0),
  ('2025-11-15','18:30',3,0),
  ('2025-11-15','19:00',3,0),
  ('2025-11-15','19:30',3,0),
  ('2025-11-15','20:00',3,0),
  ('2025-11-15','20:30',3,0),
  ('2025-11-15','21:00',2,0),  -- exception
  ('2025-11-15','21:30',2,0);  -- exception
  ('2025-11-15','22:00',1,0);  -- exception
COMMIT;
