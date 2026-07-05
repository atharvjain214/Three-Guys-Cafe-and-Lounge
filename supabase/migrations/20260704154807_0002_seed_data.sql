/*
# Three Guys Cafe — Seed Data

Populates the database with realistic cafe content:
- 1 primary branch
- 6 categories
- 25+ menu items with variants and addons
- 12+ gallery images
- 4 events
- Active coupons
- Restaurant tables
- System settings
*/

-- ============================================================
-- BRANCH
-- ============================================================

INSERT INTO public.branches (name, slug, address_line1, city, state, postal_code, phone, email, is_primary, latitude, longitude)
VALUES ('Three Guys Cafe — Flagship', 'flagship', '42 Brigade Road', 'Bengaluru', 'Karnataka', '560025', '+91 80 4567 8900', 'hello@threeguyscafe.in', true, 12.9698, 77.7499)
ON CONFLICT (slug) DO NOTHING;

-- ============================================================
-- CATEGORIES
-- ============================================================

INSERT INTO public.categories (name, slug, description, icon, sort_order) VALUES
('Signature Coffee', 'signature-coffee', 'Single-origin beans roasted in-house, brewed to perfection', 'coffee', 1),
('Artisan Tea', 'artisan-tea', 'Hand-picked loose leaf teas from the finest estates', 'tea', 2),
('All-Day Breakfast', 'breakfast', 'Hearty breakfast plates served all day long', 'breakfast', 3),
('Main Course', 'main-course', 'Chef-crafted mains featuring global flavors', 'main', 4),
('Desserts', 'desserts', 'House-made desserts and patisserie', 'dessert', 5),
('Beverages', 'beverages', 'Fresh juices, smoothies, and refreshing drinks', 'beverage', 6)
ON CONFLICT (slug) DO NOTHING;

-- ============================================================
-- MENU ITEMS
-- ============================================================

INSERT INTO public.menu_items (name, slug, description, long_description, price, compare_at_price, category_id, calories, prep_time_minutes, is_vegetarian, is_vegan, is_featured, is_available, rating, review_count, tags) VALUES
('Three Guys Signature Latte', 'signature-latte', 'Our house signature — double-shot espresso with velvety steamed milk and a hint of vanilla', 'A carefully balanced double shot of our single-origin espresso, married with silky steamed milk and finished with a whisper of Madagascar vanilla. Served in a pre-warmed 240ml ceramic cup.', 220, 260, (SELECT id FROM public.categories WHERE slug='signature-coffee'), 180, 5, true, false, true, true, 4.8, 124, '{"bestseller","signature"}'),
('Cold Brew Cascade', 'cold-brew-cascade', '18-hour slow-steeped cold brew with chocolatey notes', 'Our cold brew is steeped for 18 hours using a proprietary blend of Arabica beans, resulting in a naturally sweet, low-acidity coffee with deep chocolate and caramel notes. Served over hand-cut ice.', 240, null, (SELECT id FROM public.categories WHERE slug='signature-coffee'), 15, 0, true, true, true, true, 4.7, 89, '{"cold","refreshing"}'),
('Caramel Macchiato', 'caramel-macchiato', 'Espresso marked with steamed milk and caramel drizzle', 'A layered drink of steamed milk, vanilla syrup, two shots of espresso, and a signature caramel drizzle. Beautifully presented in a tall glass.', 250, null, (SELECT id FROM public.categories WHERE slug='signature-coffee'), 220, 5, true, false, false, true, 4.6, 67, '{"popular"}'),
('Flat White', 'flat-white', 'Double ristretto with micro-foamed milk', 'A barista favorite — two ristretto shots topped with silky micro-foam for a velvety, intense coffee experience.', 230, null, (SELECT id FROM public.categories WHERE slug='signature-coffee'), 150, 5, true, false, false, true, 4.7, 54, '{"classic"}'),
('Pour Over Ethiopian', 'pour-over-ethiopian', 'Single-origin Ethiopian Yirgacheffe, hand-poured', 'Bright, floral, and complex. Our Ethiopian Yirgacheffe is brewed using the pour-over method to highlight its jasmine, bergamot, and stone fruit notes.', 280, null, (SELECT id FROM public.categories WHERE slug='signature-coffee'), 10, 6, true, true, true, true, 4.9, 42, '{"single-origin","premium"}'),
('Affogato al Caffe', 'affogato', 'Vanilla gelato drowned in a shot of hot espresso', 'A decadent Italian classic — a scoop of Madagascar vanilla gelato met with a freshly pulled espresso shot. A dessert and coffee in one.', 260, null, (SELECT id FROM public.categories WHERE slug='signature-coffee'), 290, 4, true, false, false, true, 4.8, 38, '{"dessert","indulgent"}'),
('Masala Chai Royale', 'masala-chai-royale', 'Assam tea brewed with whole spices and milk', 'Our signature masala chai — Assam CTC tea simmered with cardamom, cinnamon, clove, ginger, and fresh milk. Sweetened to taste.', 140, null, (SELECT id FROM public.categories WHERE slug='artisan-tea'), 120, 8, true, false, true, true, 4.7, 95, '{"bestseller","indian"}'),
('Kashmiri Kahwa', 'kashmiri-kahwa', 'Saffron and green tea with crushed almonds', 'A traditional Kashmiri green tea infused with saffron, cardamom, cinnamon, and crushed almonds. Warming and aromatic.', 160, null, (SELECT id FROM public.categories WHERE slug='artisan-tea'), 80, 8, true, true, false, true, 4.6, 31, '{"traditional","aromatic"}'),
('Earl Grey Supreme', 'earl-grey-supreme', 'Bergamot-infused black tea with a floral finish', 'Premium Ceylon black tea hand-blended with Italian bergamot oil and cornflower petals. Served with milk or lemon.', 150, null, (SELECT id FROM public.categories WHERE slug='artisan-tea'), 5, 5, true, true, false, true, 4.5, 28, '{"classic"}'),
('Avocado Toast Supreme', 'avocado-toast-supreme', 'Smashed avocado, poached eggs, chili flakes, on sourdough', 'Ripe Hass avocado smashed on toasted artisan sourdough, topped with two soft poached eggs, chili flakes, microgreens, and a drizzle of extra virgin olive oil.', 320, null, (SELECT id FROM public.categories WHERE slug='breakfast'), 420, 12, true, false, true, true, 4.8, 156, '{"bestseller","healthy"}'),
('Truffle Mushroom Omelette', 'truffle-mushroom-omelette', 'Three-egg omelette with truffle oil and wild mushrooms', 'Fluffy three-egg omelette filled with sauteed wild mushrooms, gruyere cheese, and a drizzle of black truffle oil. Served with a side salad.', 380, null, (SELECT id FROM public.categories WHERE slug='breakfast'), 520, 15, true, false, false, true, 4.7, 72, '{"premium","gourmet"}'),
('Belgian Waffle Stack', 'belgian-waffle-stack', 'Crispy Belgian waffles with maple syrup and fresh berries', 'Golden, crispy-on-the-outside Belgian waffles served with pure maple syrup, fresh seasonal berries, and a dusting of powdered sugar.', 290, null, (SELECT id FROM public.categories WHERE slug='breakfast'), 580, 12, true, false, true, true, 4.6, 103, '{"sweet","popular"}'),
('Shakshuka', 'shakshuka', 'Eggs poached in spiced tomato pepper sauce', 'Three eggs poached in a rich, spiced tomato and bell pepper sauce, infused with cumin and paprika. Served with warm pita bread.', 340, null, (SELECT id FROM public.categories WHERE slug='breakfast'), 380, 15, true, false, false, true, 4.7, 64, '{"spicy","middle-eastern"}'),
('Grilled Paneer Tikka Bowl', 'paneer-tikka-bowl', 'Tandoori-spiced paneer with saffron rice and mint chutney', 'Char-grilled paneer marinated in tandoori spices, served over saffron basmati rice with a refreshing mint-coriander chutney and pickled onions.', 420, null, (SELECT id FROM public.categories WHERE slug='main-course'), 620, 18, true, false, true, true, 4.8, 87, '{"bestseller","indian"}'),
('Butter Chicken Risotto', 'butter-chicken-risotto', 'Creamy arborio risotto with butter chicken', 'A fusion masterpiece — creamy arborio risotto slow-cooked with butter chicken gravy, finished with a touch of cream and fresh kasuri methi.', 480, null, (SELECT id FROM public.categories WHERE slug='main-course'), 720, 20, false, false, true, true, 4.9, 91, '{"fusion","bestseller"}'),
('Truffle Mushroom Pizza', 'truffle-mushroom-pizza', 'Wood-fired pizza with truffle cream, wild mushrooms, and mozzarella', 'Hand-stretched dough, wood-fired and topped with truffle cream sauce, wild mushrooms, fresh mozzarella, and arugula.', 520, null, (SELECT id FROM public.categories WHERE slug='main-course'), 820, 22, true, false, false, true, 4.7, 58, '{"premium","italian"}'),
('Mediterranean Bowl', 'mediterranean-bowl', 'Quinoa, hummus, falafel, olives, and tahini dressing', 'A wholesome bowl of quinoa, house-made hummus, crispy falafel, Kalamata olives, cherry tomatoes, cucumber, and a lemon-tahini dressing.', 390, null, (SELECT id FROM public.categories WHERE slug='main-course'), 480, 15, true, true, false, true, 4.6, 49, '{"healthy","vegan"}'),
('Wagyu Beef Burger', 'wagyu-beef-burger', 'Wagyu patty, aged cheddar, caramelized onions, brioche bun', 'A premium 6oz Wagyu beef patty, aged cheddar, caramelized onions, lettuce, tomato, and house sauce on a toasted brioche bun. Served with truffle fries.', 680, null, (SELECT id FROM public.categories WHERE slug='main-course'), 980, 18, false, false, true, true, 4.9, 76, '{"premium","bestseller"}'),
('Molten Chocolate Lava Cake', 'molten-lava-cake', 'Warm chocolate cake with a gooey molten center', 'A rich dark chocolate cake with a flowing molten center, served with a scoop of vanilla bean ice cream and fresh raspberries.', 280, null, (SELECT id FROM public.categories WHERE slug='desserts'), 520, 14, true, false, true, true, 4.9, 134, '{"bestseller","indulgent"}'),
('Tiramisu Classico', 'tiramisu-classico', 'Coffee-soaked ladyfingers with mascarpone cream', 'Authentic Italian tiramisu — espresso-soaked ladyfingers layered with airy mascarpone cream and dusted with cocoa. A house favorite.', 260, null, (SELECT id FROM public.categories WHERE slug='desserts'), 450, 0, true, false, false, true, 4.8, 98, '{"italian","classic"}'),
('New York Cheesecake', 'ny-cheesecake', 'Dense, creamy cheesecake with a graham crust', 'Classic New York-style baked cheesecake on a buttery graham cracker crust, topped with a wild berry compote.', 250, null, (SELECT id FROM public.categories WHERE slug='desserts'), 480, 0, true, false, false, true, 4.7, 81, '{"classic","creamy"}'),
('Creme Brulee', 'creme-brulee', 'Vanilla custard with a caramelized sugar crust', 'Silky vanilla bean custard with a perfectly caramelized sugar crust. Served chilled.', 240, null, (SELECT id FROM public.categories WHERE slug='desserts'), 380, 0, true, false, false, true, 4.6, 52, '{"french","elegant"}'),
('Fresh Watermelon Mint Juice', 'watermelon-mint-juice', 'Cold-pressed watermelon with fresh mint', 'Refreshing cold-pressed watermelon juice with a hint of fresh mint and lime. Perfect for warm days.', 160, null, (SELECT id FROM public.categories WHERE slug='beverages'), 90, 5, true, true, false, true, 4.5, 43, '{"refreshing","vegan"}'),
('Mango Lassi', 'mango-lassi', 'Thick yogurt smoothie with Alphonso mango', 'Creamy, thick lassi made with Alphonso mango pulp, fresh yogurt, and a touch of cardamom. A classic Indian cooler.', 150, null, (SELECT id FROM public.categories WHERE slug='beverages'), 220, 5, true, false, true, true, 4.7, 67, '{"indian","popular"}'),
('Cold Pressed Green Detox', 'green-detox', 'Kale, spinach, apple, celery, ginger', 'A nutrient-packed cold-pressed juice of kale, spinach, green apple, celery, and ginger. Energizing and cleansing.', 220, null, (SELECT id FROM public.categories WHERE slug='beverages'), 110, 5, true, true, false, true, 4.4, 29, '{"healthy","vegan"}'),
('Strawberry Banana Smoothie', 'strawberry-smoothie', 'Fresh strawberries, banana, yogurt, honey', 'A creamy smoothie of fresh strawberries, ripe banana, Greek yogurt, and a drizzle of honey. Topped with granola.', 190, null, (SELECT id FROM public.categories WHERE slug='beverages'), 280, 5, true, false, false, true, 4.6, 51, '{"creamy","popular"}')
ON CONFLICT (slug) DO NOTHING;

-- ============================================================
-- MENU VARIANTS
-- ============================================================

INSERT INTO public.menu_variants (menu_item_id, name, price_adjustment, sort_order) VALUES
((SELECT id FROM public.menu_items WHERE slug='signature-latte'), 'Small (8oz)', -30, 1),
((SELECT id FROM public.menu_items WHERE slug='signature-latte'), 'Regular (12oz)', 0, 2),
((SELECT id FROM public.menu_items WHERE slug='signature-latte'), 'Large (16oz)', 40, 3),
((SELECT id FROM public.menu_items WHERE slug='cold-brew-cascade'), 'Regular (12oz)', 0, 1),
((SELECT id FROM public.menu_items WHERE slug='cold-brew-cascade'), 'Large (16oz)', 40, 2),
((SELECT id FROM public.menu_items WHERE slug='caramel-macchiato'), 'Small (8oz)', -30, 1),
((SELECT id FROM public.menu_items WHERE slug='caramel-macchiato'), 'Regular (12oz)', 0, 2),
((SELECT id FROM public.menu_items WHERE slug='caramel-macchiato'), 'Large (16oz)', 40, 3),
((SELECT id FROM public.menu_items WHERE slug='flat-white'), 'Regular (8oz)', 0, 1),
((SELECT id FROM public.menu_items WHERE slug='flat-white'), 'Large (12oz)', 30, 2),
((SELECT id FROM public.menu_items WHERE slug='masala-chai-royale'), 'Regular', 0, 1),
((SELECT id FROM public.menu_items WHERE slug='masala-chai-royale'), 'Large', 30, 2),
((SELECT id FROM public.menu_items WHERE slug='truffle-mushroom-pizza'), 'Personal (10")', 0, 1),
((SELECT id FROM public.menu_items WHERE slug='truffle-mushroom-pizza'), 'Medium (14")', 120, 2),
((SELECT id FROM public.menu_items WHERE slug='truffle-mushroom-pizza'), 'Large (18")', 220, 3)
ON CONFLICT DO NOTHING;

-- ============================================================
-- MENU ADDONS
-- ============================================================

INSERT INTO public.menu_addons (name, description, price) VALUES
('Extra Shot', 'Additional espresso shot', 40),
('Oat Milk', 'Swap to oat milk', 30),
('Almond Milk', 'Swap to almond milk', 30),
('Soy Milk', 'Swap to soy milk', 20),
('Whipped Cream', 'House-made whipped cream', 25),
('Caramel Drizzle', 'Extra caramel drizzle', 20),
('Extra Cheese', 'Additional cheese', 50),
('Truffle Fries Side', 'Truffle oil fries with parmesan', 120),
('Garlic Bread', 'Toasted garlic bread with herbs', 90),
('Extra Spicy', 'Add extra chili', 0),
('Ice Cream Scoop', 'Vanilla bean ice cream', 60),
('Berry Compote', 'Mixed berry compote', 40)
ON CONFLICT DO NOTHING;

-- Link addons to coffee items
INSERT INTO public.menu_item_addons (menu_item_id, menu_addon_id, is_required, max_quantity)
SELECT mi.id, ma.id, false, 2
FROM public.menu_items mi, public.menu_addons ma
WHERE mi.slug IN ('signature-latte', 'caramel-macchiato', 'flat-white', 'affogato')
AND ma.name IN ('Extra Shot', 'Oat Milk', 'Almond Milk', 'Soy Milk', 'Whipped Cream', 'Caramel Drizzle')
ON CONFLICT DO NOTHING;

-- Link addons to food items
INSERT INTO public.menu_item_addons (menu_item_id, menu_addon_id, is_required, max_quantity)
SELECT mi.id, ma.id, false, 3
FROM public.menu_items mi, public.menu_addons ma
WHERE mi.slug IN ('wagyu-beef-burger', 'paneer-tikka-bowl', 'butter-chicken-risotto')
AND ma.name IN ('Extra Cheese', 'Truffle Fries Side', 'Garlic Bread', 'Extra Spicy')
ON CONFLICT DO NOTHING;

-- Link addons to desserts
INSERT INTO public.menu_item_addons (menu_item_id, menu_addon_id, is_required, max_quantity)
SELECT mi.id, ma.id, false, 2
FROM public.menu_items mi, public.menu_addons ma
WHERE mi.slug IN ('molten-lava-cake', 'ny-cheesecake', 'belgian-waffle-stack')
AND ma.name IN ('Ice Cream Scoop', 'Berry Compote', 'Whipped Cream')
ON CONFLICT DO NOTHING;

-- ============================================================
-- TABLES
-- ============================================================

INSERT INTO public.tables (table_number, seats, location, is_active) VALUES
('T01', 2, 'window', true),
('T02', 2, 'window', true),
('T03', 4, 'main', true),
('T04', 4, 'main', true),
('T05', 4, 'main', true),
('T06', 6, 'main', true),
('T07', 6, 'lounge', true),
('T08', 8, 'lounge', true),
('T09', 2, 'patio', true),
('T10', 4, 'patio', true),
('T11', 10, 'private', true),
('T12', 12, 'private', true)
ON CONFLICT DO NOTHING;

-- ============================================================
-- GALLERY
-- ============================================================

INSERT INTO public.gallery (title, description, image_url, category, is_featured, sort_order) VALUES
('Morning Espresso', 'A perfectly pulled shot of our signature espresso', 'https://images.unsplash.com/photo-1510707577719-ae7c1480563a?w=1200&q=80', 'coffee', true, 1),
('Latte Art', 'Barista-crafted latte art in our flagship cafe', 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=1200&q=80', 'coffee', true, 2),
('Cozy Interior', 'Our warm and inviting lounge seating area', 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=1200&q=80', 'interior', true, 3),
('Avocado Toast', 'Our bestselling avocado toast supreme', 'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=1200&q=80', 'food', true, 4),
('Brunch Spread', 'A full brunch spread for two', 'https://images.unsplash.com/photo-1533333978761-925b62922f4e?w=1200&q=80', 'food', false, 5),
('Cold Brew', 'Our 18-hour slow-steeped cold brew', 'https://images.unsplash.com/photo-1461023058943-07fcbe16d835?w=1200&q=80', 'coffee', false, 6),
('Dessert Plating', 'Molten lava cake with vanilla ice cream', 'https://images.unsplash.com/photo-1606313564200-757ec4ba3d30?w=1200&q=80', 'food', true, 7),
('Evening Ambiance', 'The lounge at golden hour', 'https://images.unsplash.com/photo-1559339352-11d035aa65de?w=1200&q=80', 'interior', false, 8),
('Pour Over', 'Hand-poured Ethiopian single origin', 'https://images.unsplash.com/photo-1495475324561-fbd795b9f8d8?w=1200&q=80', 'coffee', false, 9),
('Wagyu Burger', 'Our premium Wagyu beef burger', 'https://images.unsplash.com/photo-1568901346378-23c1b654f13f?w=1200&q=80', 'food', true, 10),
('Patisserie Display', 'Fresh desserts in our display case', 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=1200&q=80', 'food', false, 11),
('Barista Station', 'Our espresso bar in action', 'https://images.unsplash.com/photo-1453614512568-c4024d13c247?w=1200&q=80', 'interior', false, 12)
ON CONFLICT DO NOTHING;

-- ============================================================
-- EVENTS
-- ============================================================

INSERT INTO public.events (title, slug, description, long_description, image_url, event_date, end_date, location, price, capacity, is_featured, is_published) VALUES
('Live Jazz Night', 'live-jazz-night', 'An evening of smooth jazz with The Midnight Trio', 'Join us for an unforgettable evening of live jazz with The Midnight Trio. Enjoy our signature cocktails and a special tapas menu while soaking in the soulful sounds of saxophone, piano, and upright bass.', 'https://images.unsplash.com/photo-1511192336575-5a79af67a629?w=1200&q=80', now() + interval '14 days', now() + interval '14 days 3 hours', 'The Lounge at Three Guys', 0, 40, true, true),
('Coffee Cupping Workshop', 'coffee-cupping-workshop', 'Learn the art of coffee tasting with our head roaster', 'Discover the world of specialty coffee in this hands-on workshop. Our head roaster will guide you through the cupping process, from identifying flavor notes to understanding roast profiles. Includes a bag of our signature beans to take home.', 'https://images.unsplash.com/photo-1447933601403-65cace1d7c14?w=1200&q=80', now() + interval '7 days', now() + interval '7 days 2 hours', 'Roastery at Three Guys', 800, 15, true, true),
('Sunday Brunch Buffet', 'sunday-brunch-buffet', 'All-you-can-eat brunch with live music', 'Indulge in our lavish Sunday brunch buffet featuring an array of breakfast classics, live pasta and dosa stations, fresh juices, and a dessert bar. Live acoustic music sets the perfect mood.', 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=1200&q=80', now() + interval '3 days', now() + interval '3 days 4 hours', 'Main Hall at Three Guys', 650, 80, true, true),
('Latte Art Throwdown', 'latte-art-throwdown', 'Watch baristas compete in a latte art competition', 'An exciting evening as our baristas go head-to-head in a latte art competition. Audience participation, free tastings, and prizes. Come cheer for your favorite barista!', 'https://images.unsplash.com/photo-1541167760496-1628856ab772?w=1200&q=80', now() + interval '21 days', now() + interval '21 days 2 hours', 'The Lounge at Three Guys', 0, 50, false, true)
ON CONFLICT (slug) DO NOTHING;

-- ============================================================
-- COUPONS
-- ============================================================

INSERT INTO public.coupons (code, description, discount_type, discount_value, min_order_amount, max_discount_amount, usage_limit, per_user_limit, valid_until, is_active) VALUES
('WELCOME10', '10% off your first order', 'percentage', 10, 200, 100, 1000, 1, now() + interval '365 days', true),
('FLAT50', 'Flat 50 off on orders above 300', 'fixed_amount', 50, 300, 50, 500, 1, now() + interval '90 days', true),
('FREEDEL', 'Free delivery on any order', 'free_delivery', 0, 0, null, 1000, 5, now() + interval '60 days', true),
('WEEKEND20', '20% off on weekends', 'percentage', 20, 500, 200, 200, 1, now() + interval '30 days', true)
ON CONFLICT (code) DO NOTHING;

-- ============================================================
-- PROMOTIONS
-- ============================================================

INSERT INTO public.promotions (title, description, badge, is_active, is_featured, sort_order) VALUES
('First Order Special', 'Get 10% off your first order with code WELCOME10', 'New Customer', true, true, 1),
('Weekend Brunch', 'Join us for our lavish Sunday brunch buffet every weekend', 'Every Sunday', true, true, 2),
('Happy Hours', 'Buy one get one free on all coffee between 3-5 PM', 'Daily 3-5 PM', true, false, 3),
('Loyalty Rewards', 'Earn points on every order and redeem for free items', 'Members Only', true, false, 4)
ON CONFLICT DO NOTHING;

-- ============================================================
-- SYSTEM SETTINGS
-- ============================================================

INSERT INTO public.system_settings (key, value, description) VALUES
('restaurant_name', '"Three Guys Cafe And Lounge"', 'Restaurant display name'),
('restaurant_tagline', '"Premium Coffee. Soulful Food. Unforgettable Moments."', 'Restaurant tagline'),
('restaurant_phone', '"+91 80 4567 8900"', 'Contact phone number'),
('restaurant_email', '"hello@threeguyscafe.in"', 'Contact email'),
('restaurant_address', '"42 Brigade Road, Bengaluru, Karnataka 560025"', 'Restaurant address'),
('tax_rate', '0.05', 'GST rate (5%)'),
('currency', '"INR"', 'Currency code'),
('currency_symbol', '"₹"', 'Currency symbol'),
('loyalty_points_per_rupee', '1', 'Loyalty points earned per rupee spent'),
('loyalty_redeem_rate', '100', 'Rupees per 100 points redeemed'),
('min_order_amount', '150', 'Minimum order amount for delivery'),
('delivery_fee', '40', 'Standard delivery fee'),
('opening_time', '"08:00"', 'Opening time'),
('closing_time', '"23:00"', 'Closing time'),
('social_instagram', '"https://instagram.com/threeguyscafe"', 'Instagram URL'),
('social_facebook', '"https://facebook.com/threeguyscafe"', 'Facebook URL'),
('social_twitter', '"https://twitter.com/threeguyscafe"', 'Twitter URL')
ON CONFLICT (key) DO NOTHING;

-- ============================================================
-- SEO SETTINGS
-- ============================================================

INSERT INTO public.seo_settings (page_key, title, description, keywords) VALUES
('home', 'Three Guys Cafe And Lounge — Premium Dining & Lounge Experience', 'Experience artisan coffee, signature dishes, and an immersive lounge atmosphere at Three Guys Cafe And Lounge. Reserve your table or order online today.', ARRAY['cafe', 'lounge', 'restaurant', 'coffee', 'dining', 'bengaluru', 'reservation']),
('menu', 'Menu — Three Guys Cafe And Lounge', 'Explore our full menu of signature coffees, artisan teas, all-day breakfast, chef-crafted mains, and house-made desserts.', ARRAY['menu', 'coffee', 'food', 'breakfast', 'dinner', 'desserts']),
('about', 'About Us — Three Guys Cafe And Lounge', 'The story of Three Guys Cafe And Lounge — born from a passion for great coffee, soulful food, and unforgettable moments.', ARRAY['about', 'story', 'cafe', 'lounge', 'bengaluru']),
('reservation', 'Reserve a Table — Three Guys Cafe And Lounge', 'Book your table at Three Guys Cafe And Lounge. Choose your date, time, and party size for a premium dining experience.', ARRAY['reservation', 'booking', 'table', 'dining', 'cafe']),
('contact', 'Contact Us — Three Guys Cafe And Lounge', 'Get in touch with Three Guys Cafe And Lounge. Find our location, hours, phone, and email.', ARRAY['contact', 'location', 'phone', 'email', 'cafe'])
ON CONFLICT (page_key) DO NOTHING;
