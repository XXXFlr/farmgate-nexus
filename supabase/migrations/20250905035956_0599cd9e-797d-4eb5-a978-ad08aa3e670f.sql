-- First, add RLS policies for categories table to allow reading
CREATE POLICY "Anyone can view categories"
ON public.categories
FOR SELECT
USING (true);

-- Add RLS policies for product_categories
CREATE POLICY "Anyone can view product categories"
ON public.product_categories
FOR SELECT
USING (true);

-- Add RLS policies for user_categories to allow reading
CREATE POLICY "Users can view user categories"
ON public.user_categories  
FOR SELECT
USING (true);

-- Insert the necessary categories
INSERT INTO public.categories (category_name) VALUES
  ('Farms'),
  ('Markets'),
  ('Home Growers'),
  ('Food Trucks'),
  ('Vendors')
ON CONFLICT (category_name) DO NOTHING;

-- Insert product categories
INSERT INTO public.product_categories (category_name) VALUES
  ('Produce'),
  ('Meats'),
  ('Dairy & Eggs'),
  ('Prepared Foods'),
  ('Baked Goods'),
  ('Pantry'),
  ('Drinks'),
  ('Salad Greens'),
  ('Vegetables'),
  ('Fruits'),
  ('Herbs'),
  ('Mushrooms'),
  ('Beef'),
  ('Pork'),
  ('Poultry'),
  ('Lamb'),
  ('Seafood'),
  ('Milk'),
  ('Yogurt'),
  ('Cheese'),
  ('Butter'),
  ('Eggs'),
  ('Meals'),
  ('Entrees'),
  ('Sides'),
  ('Soups'),
  ('Appetizers'),
  ('Desserts'),
  ('Breakfast'),
  ('Pizza'),
  ('Seasoning Kits'),
  ('Breads'),
  ('Pastries'),
  ('Specialties'),
  ('Gluten-Free'),
  ('Grains & Pasta'),
  ('Baking Supplies'),
  ('Cereal & Granola'),
  ('Honey & Syrup'),
  ('Jams & Spreads'),
  ('Snacks'),
  ('Spices & Seasonings'),
  ('Sweets & Chocolates'),
  ('Sauces & Dressings'),
  ('Oils & Vinegar'),
  ('Cold'),
  ('Hot'),
  ('Dry'),
  ('Specialty Drink')
ON CONFLICT (category_name) DO NOTHING;

-- Add some sample approved markets to display
INSERT INTO public.markets (market_name, description, status, creator_id, date, time, latitude, longitude) VALUES
  ('Farmers Market Downtown', 'Fresh local produce and artisan goods in the heart of the city', 'approved', gen_random_uuid(), CURRENT_DATE + INTERVAL '7 days', '08:00:00', 37.7749, -122.4194),
  ('Organic Valley Market', 'Certified organic fruits, vegetables, and dairy products', 'approved', gen_random_uuid(), CURRENT_DATE + INTERVAL '14 days', '09:00:00', 37.7849, -122.4094),
  ('Seaside Saturday Market', 'Weekly market featuring local seafood and coastal specialties', 'approved', gen_random_uuid(), CURRENT_DATE + INTERVAL '3 days', '07:00:00', 37.7949, -122.3994)
ON CONFLICT DO NOTHING;

-- Add RLS policies for remaining tables that need them
CREATE POLICY "Users can view all categories assignments"
ON public.product_category_assignments
FOR SELECT
USING (true);

CREATE POLICY "Anyone can view market photos"
ON public.market_photos
FOR SELECT  
USING (true);

CREATE POLICY "Anyone can view product photos"
ON public.product_photos
FOR SELECT
USING (true);

CREATE POLICY "Users can view public products"
ON public.products
FOR SELECT
USING (is_active = true);

CREATE POLICY "Users can manage their own products"
ON public.products
FOR ALL
USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can view market vendors"
ON public.market_vendors
FOR SELECT
USING (true);

CREATE POLICY "Users can apply as vendors"
ON public.market_vendors
FOR INSERT
WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Users can view documents" 
ON public.documents
FOR SELECT
USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can manage their own documents"
ON public.documents
FOR ALL
USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can view chat participants"
ON public.chats
FOR SELECT
USING (auth.uid()::text = user_id_1::text OR auth.uid()::text = user_id_2::text);

CREATE POLICY "Users can create chats"
ON public.chats
FOR INSERT
WITH CHECK (auth.uid()::text = user_id_1::text OR auth.uid()::text = user_id_2::text);

CREATE POLICY "Users can view their messages"
ON public.messages
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.chats 
    WHERE chats.id = messages.chat_id 
    AND (chats.user_id_1::text = auth.uid()::text OR chats.user_id_2::text = auth.uid()::text)
  )
);

CREATE POLICY "Users can send messages"
ON public.messages
FOR INSERT
WITH CHECK (auth.uid()::text = sender_id::text);

CREATE POLICY "Users can view subscriptions"
ON public.subscriptions
FOR SELECT
USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can manage their subscriptions"
ON public.subscriptions
FOR ALL
USING (auth.uid()::text = user_id::text);