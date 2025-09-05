-- Insert sample users first
INSERT INTO public.users (id, email, username, display_name, role) VALUES
  ('550e8400-e29b-41d4-a716-446655440001', 'downtown.farmer@example.com', 'downtown.farmer', 'Downtown Farmers Collective', 'vendor'),
  ('550e8400-e29b-41d4-a716-446655440002', 'organic.valley@example.com', 'organic.valley', 'Organic Valley Farm', 'vendor'),
  ('550e8400-e29b-41d4-a716-446655440003', 'seaside.market@example.com', 'seaside.market', 'Seaside Market Organizers', 'vendor'),
  ('550e8400-e29b-41d4-a716-446655440004', 'mountain.view@example.com', 'mountain.view', 'Mountain View Organic', 'vendor'),
  ('550e8400-e29b-41d4-a716-446655440005', 'riverside.market@example.com', 'riverside.market', 'Riverside Community', 'vendor')
ON CONFLICT (id) DO NOTHING;

-- Now insert sample approved markets
INSERT INTO public.markets (market_id, market_name, description, status, creator_id, date, time, latitude, longitude) VALUES
  ('550e8400-e29b-41d4-a716-446655440001', 'Farmers Market Downtown', 'Fresh local produce and artisan goods in the heart of the city', 'approved', '550e8400-e29b-41d4-a716-446655440001', CURRENT_DATE + INTERVAL '7 days', '08:00:00', 37.7749, -122.4194),
  ('550e8400-e29b-41d4-a716-446655440002', 'Organic Valley Market', 'Certified organic fruits, vegetables, and dairy products', 'approved', '550e8400-e29b-41d4-a716-446655440002', CURRENT_DATE + INTERVAL '14 days', '09:00:00', 37.7849, -122.4094),
  ('550e8400-e29b-41d4-a716-446655440003', 'Seaside Saturday Market', 'Weekly market featuring local seafood and coastal specialties', 'approved', '550e8400-e29b-41d4-a716-446655440003', CURRENT_DATE + INTERVAL '3 days', '07:00:00', 37.7949, -122.3994),
  ('550e8400-e29b-41d4-a716-446655440004', 'Mountain View Organic Fair', 'Family-friendly market with organic vegetables, handmade crafts, and live music', 'approved', '550e8400-e29b-41d4-a716-446655440004', CURRENT_DATE + INTERVAL '10 days', '10:00:00', 37.3861, -122.0839),
  ('550e8400-e29b-41d4-a716-446655440005', 'Riverside Community Market', 'Small community market by the river with fresh produce and local honey', 'approved', '550e8400-e29b-41d4-a716-446655440005', CURRENT_DATE + INTERVAL '5 days', '08:30:00', 37.8044, -122.2712)
ON CONFLICT (market_id) DO NOTHING;