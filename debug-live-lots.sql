-- Check if there are any lots with state = 'live'
SELECT 
  COUNT(*) as total_live_lots
FROM lots
WHERE state = 'live';

-- Check all states in lots table
SELECT 
  state,
  COUNT(*) as count
FROM lots
GROUP BY state;

-- Get detailed info for all lots
SELECT 
  l.id,
  l.lot_number,
  l.state,
  l.car_id,
  l.starting_price,
  l.current_price,
  l.start_at,
  l.end_at,
  l.created_at,
  c.make,
  c.model,
  c.year
FROM lots l
LEFT JOIN cars c ON l.car_id = c.id
ORDER BY l.created_at DESC
LIMIT 10;

-- Check if car_id foreign key is properly set
SELECT 
  l.id as lot_id,
  l.lot_number,
  l.car_id,
  c.id as car_id_from_cars,
  c.make,
  c.model
FROM lots l
LEFT JOIN cars c ON l.car_id = c.id
WHERE l.car_id IS NOT NULL
LIMIT 5;