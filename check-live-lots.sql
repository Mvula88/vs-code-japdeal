-- Test query to check lots and cars data
SELECT 
  l.id,
  l.lot_number,
  l.state,
  l.starting_price,
  l.current_price,
  l.created_at,
  c.make,
  c.model,
  c.year
FROM lots l
LEFT JOIN cars c ON l.car_id = c.id
WHERE l.state = 'live'
ORDER BY l.created_at DESC;
