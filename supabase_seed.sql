-- ==============================================================================
-- 🚀 TEST.ME - SUPABASE INITIAL SEED DATA
-- Fanlar, darajalar, namunaviy testlar va do'kon mahsulotlari
-- ==============================================================================

-- 1. ASOSIY FANLAR (SUBJECTS)
INSERT INTO public.subjects (id, name_uz, name_ru, description, icon, color, is_active)
VALUES
  ('math', 'Matematika', 'Математика', 'Algebra, geometriya va mantiqiy masalalar', 'fa-calculator', '#3b82f6', true),
  ('english', 'Ingliz tili', 'Английский язык', 'Grammar, vocabulary, reading va CEFR darajalari', 'fa-language', '#10b981', true),
  ('physics', 'Fizika', 'Физика', 'Mexanika, termodinamika va elektrodinamika', 'fa-atom', '#8b5cf6', true),
  ('history', 'O''zbekiston tarixi', 'История Узбекистана', 'Qadimgi davrdan hozirgi kungacha', 'fa-landmark', '#f59e0b', true),
  ('biology', 'Biologiya', 'Биология', 'Botanika, zoologiya va inson anatomiyasi', 'fa-dna', '#ec4899', true),
  ('it', 'Informatika va IT', 'Информатика', 'Dasturlash, kompyuter savodxonligi va algoritmlar', 'fa-laptop-code', '#06b6d4', true)
ON CONFLICT (id) DO UPDATE SET
  name_uz = EXCLUDED.name_uz,
  icon = EXCLUDED.icon,
  color = EXCLUDED.color,
  description = EXCLUDED.description;

-- 2. DARAJALAR (LEVELS)
INSERT INTO public.levels (id, subject_id, name, order_index)
VALUES
  ('math_elem', 'math', 'Boshlang''ich (Elementary)', 1),
  ('math_inter', 'math', 'O''rta (Intermediate)', 2),
  ('math_adv', 'math', 'Murakkab (Advanced / DTM)', 3),
  ('english_elem', 'english', 'A1 - A2 (Beginner)', 1),
  ('english_inter', 'english', 'B1 - B2 (Intermediate)', 2),
  ('english_adv', 'english', 'C1 (Advanced)', 3),
  ('physics_elem', 'physics', 'Asosiy tushunchalar', 1),
  ('physics_adv', 'physics', 'Murakkab masalalar', 2),
  ('history_elem', 'history', 'Umumiy tarix', 1),
  ('biology_elem', 'biology', 'Umumiy biologiya', 1),
  ('it_elem', 'it', 'Boshlang''ich dasturlash', 1)
ON CONFLICT (id) DO NOTHING;

-- 3. DO'KON MAHSULOTLARI (SHOP ITEMS)
INSERT INTO public.shop_items (title, description, price, category, icon, rarity, is_active)
VALUES
  ('Cyberpunk Neon Mavzusi', 'Futuristik binafsha va kiber neon interfeys dizayni', 250, 'theme', 'fa-palette', 'rare', true),
  ('Oltin Ramka (Avatar)', 'Profil uchun hashamatli oltin zarhal hoshiya', 500, 'avatar', 'fa-crown', 'epic', true),
  ('Olovli Streak Qalqoni', 'Streak uzilib qolishidan 1 kunlik himoya qiluvchi tumor', 150, 'badge', 'fa-shield-halved', 'common', true),
  ('DTM Master Unvoni', 'Profilingizda porlab turuvchi maxsus faxriy nishon', 1000, 'badge', 'fa-medal', 'legendary', true),
  ('Matrix Yashil Mavzusi', 'Hackerlar uslubidagi toza yashil-qora terminal dizayni', 350, 'theme', 'fa-terminal', 'rare', true)
ON CONFLICT DO NOTHING;

-- 4. DO'KON QUTILARI (SHOP BOXES)
INSERT INTO public.shop_boxes (box_key, title, price, image_url, items_pool)
VALUES
  ('box_starter', 'Boshlang''ich Quti', 100, '/assets/img/boxes/box_starter.png', '[{"type":"points","amount":150,"chance":0.6},{"type":"theme","id":"matrix","chance":0.4}]'::jsonb),
  ('box_iron', 'Temir Quti', 250, '/assets/img/boxes/box_iron.png', '[{"type":"points","amount":400,"chance":0.5},{"type":"item","id":"shield","chance":0.5}]'::jsonb),
  ('box_golden', 'Oltin Afsonaviy Quti', 750, '/assets/img/boxes/box_golden.png', '[{"type":"points","amount":1500,"chance":0.3},{"type":"item","id":"crown","chance":0.7}]'::jsonb)
ON CONFLICT (box_key) DO NOTHING;
