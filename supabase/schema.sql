-- ==============================================================================
-- 🚀 TEST.ME - SUPABASE POSTGRESQL PRODUCTION DATABASE SCHEMA (IDEMPOTENT)
-- ==============================================================================

-- 1. PROFILES (auth.users bilan bog'langan foydalanuvchilar profili)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT NOT NULL,
  email TEXT,
  photo_url TEXT,
  points BIGINT DEFAULT 100 CHECK (points >= 0),
  is_premium BOOLEAN DEFAULT FALSE,
  is_admin BOOLEAN DEFAULT FALSE,
  admin_role TEXT DEFAULT 'user',
  referral_code TEXT UNIQUE,
  referred_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  streak_count INT DEFAULT 0,
  last_active_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

-- 2. SUBJECTS (Fanlar)
CREATE TABLE IF NOT EXISTS public.subjects (
  id TEXT PRIMARY KEY,
  name_uz TEXT NOT NULL,
  name_ru TEXT,
  description TEXT,
  icon TEXT,
  color TEXT DEFAULT '#4f46e5',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

-- 3. LEVELS (Darajalar)
CREATE TABLE IF NOT EXISTS public.levels (
  id TEXT PRIMARY KEY,
  subject_id TEXT NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  order_index INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

-- 4. TESTS (Test to'plamlari)
CREATE TABLE IF NOT EXISTS public.tests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subject_id TEXT NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
  level_id TEXT REFERENCES public.levels(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  duration_minutes INT DEFAULT 20,
  total_questions INT DEFAULT 10,
  is_ai_generated BOOLEAN DEFAULT FALSE,
  creator_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

-- 5. QUESTIONS (Savollar)
CREATE TABLE IF NOT EXISTS public.questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  test_id UUID NOT NULL REFERENCES public.tests(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  options JSONB NOT NULL,
  answer TEXT NOT NULL,
  hint TEXT,
  order_index INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

-- 6. RESULTS (Test natijalari)
CREATE TABLE IF NOT EXISTS public.results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  test_id UUID REFERENCES public.tests(id) ON DELETE SET NULL,
  score INT NOT NULL,
  total INT NOT NULL,
  percentage NUMERIC(5,2) GENERATED ALWAYS AS (ROUND((score::NUMERIC / NULLIF(total, 0)) * 100, 2)) STORED,
  duration_seconds INT DEFAULT 0,
  test_level TEXT,
  subject_id TEXT,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

-- 7. CERTIFICATES (Sertifikatlar)
CREATE TABLE IF NOT EXISTS public.certificates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cert_code TEXT UNIQUE NOT NULL,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  user_name TEXT NOT NULL,
  cert_type TEXT NOT NULL,
  name_uz TEXT NOT NULL,
  name_ru TEXT,
  desc_uz TEXT,
  desc_ru TEXT,
  trigger_result_id UUID REFERENCES public.results(id) ON DELETE SET NULL,
  issued_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

-- 8. SHOP ITEMS (Do'kon mahsulotlari)
CREATE TABLE IF NOT EXISTS public.shop_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  price INT NOT NULL CHECK (price >= 0),
  category TEXT DEFAULT 'theme',
  icon TEXT,
  rarity TEXT DEFAULT 'common',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

-- 9. USER INVENTORY (Foydalanuvchi buyumlari)
CREATE TABLE IF NOT EXISTS public.user_inventory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  item_id UUID REFERENCES public.shop_items(id) ON DELETE CASCADE,
  acquired_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()),
  UNIQUE(user_id, item_id)
);

-- 11. USER TRANSACTIONS (TP Coins sarfi va mukofotlar tarixi)
CREATE TABLE IF NOT EXISTS public.user_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  points INT NOT NULL,
  type TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

-- 12. USER GOALS (Maqsadlar)
CREATE TABLE IF NOT EXISTS public.user_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  is_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

-- 13. SUPPORT MESSAGES (Qo'llab-quvvatlash va bot xabarlari)
CREATE TABLE IF NOT EXISTS public.support_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT,
  phone TEXT,
  request_type TEXT,
  subject TEXT,
  message TEXT NOT NULL,
  source TEXT DEFAULT 'web',
  telegram_chat_id BIGINT,
  status TEXT DEFAULT 'new',
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

-- ==============================================================================
-- ⚡ INDEKSLAR
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_questions_test_id ON public.questions(test_id);
CREATE INDEX IF NOT EXISTS idx_results_user_id ON public.results(user_id);
CREATE INDEX IF NOT EXISTS idx_results_created_at ON public.results(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_profiles_points ON public.profiles(points DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON public.user_transactions(user_id);

-- ==============================================================================
-- 🔐 ROW LEVEL SECURITY (RLS)
-- ==============================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.levels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shop_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_messages ENABLE ROW LEVEL SECURITY;

-- 1. Profiles
DROP POLICY IF EXISTS "Public profiles are readable by everyone" ON public.profiles;
CREATE POLICY "Public profiles are readable by everyone" ON public.profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- 2. Subjects, Levels, Tests & Questions
DROP POLICY IF EXISTS "Anyone can view active subjects" ON public.subjects;
CREATE POLICY "Anyone can view active subjects" ON public.subjects FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "Anyone can view levels" ON public.levels;
CREATE POLICY "Anyone can view levels" ON public.levels FOR SELECT USING (true);

DROP POLICY IF EXISTS "Anyone can view tests" ON public.tests;
CREATE POLICY "Anyone can view tests" ON public.tests FOR SELECT USING (true);

DROP POLICY IF EXISTS "Anyone can view questions" ON public.questions;
CREATE POLICY "Anyone can view questions" ON public.questions FOR SELECT USING (true);

-- 3. Results
DROP POLICY IF EXISTS "Users can view their own results" ON public.results;
CREATE POLICY "Users can view their own results" ON public.results FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own results" ON public.results;
CREATE POLICY "Users can insert their own results" ON public.results FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 4. Certificates
DROP POLICY IF EXISTS "Anyone can verify certificate" ON public.certificates;
CREATE POLICY "Anyone can verify certificate" ON public.certificates FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users insert their certificates" ON public.certificates;
CREATE POLICY "Users insert their certificates" ON public.certificates FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 5. Shop & Transactions
DROP POLICY IF EXISTS "Anyone can view shop items" ON public.shop_items;
CREATE POLICY "Anyone can view shop items" ON public.shop_items FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "Users can view their inventory" ON public.user_inventory;
CREATE POLICY "Users can view their inventory" ON public.user_inventory FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert to inventory" ON public.user_inventory;
CREATE POLICY "Users can insert to inventory" ON public.user_inventory FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view transactions" ON public.user_transactions;
CREATE POLICY "Users can view transactions" ON public.user_transactions FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert transactions" ON public.user_transactions;
CREATE POLICY "Users can insert transactions" ON public.user_transactions FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 6. Goals
DROP POLICY IF EXISTS "Users manage goals" ON public.user_goals;
CREATE POLICY "Users manage goals" ON public.user_goals FOR ALL USING (auth.uid() = user_id);

-- 7. Support Messages
DROP POLICY IF EXISTS "Anyone can create support message" ON public.support_messages;
CREATE POLICY "Anyone can create support message" ON public.support_messages FOR INSERT WITH CHECK (true);

-- ==============================================================================
-- 🤖 AUTO PROFILE CREATION TRIGGER
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, email, photo_url, referral_code)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    NEW.email,
    NEW.raw_user_meta_data->>'avatar_url',
    LOWER(SUBSTRING(MD5(NEW.id::text || NOW()::text) FROM 1 FOR 8))
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ==============================================================================
-- 🛡️ PRIVILEGE ESCALATION GUARD (Zero-Defect Security Audit Fix)
-- Oddiy foydalanuvchilar o'zini admin (is_admin=true) yoki premium qila olmaydi
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.protect_profile_privileges()
RETURNS TRIGGER AS $$
BEGIN
  IF (OLD.is_admin IS DISTINCT FROM NEW.is_admin OR 
      OLD.admin_role IS DISTINCT FROM NEW.admin_role OR
      OLD.is_premium IS DISTINCT FROM NEW.is_premium) THEN
    -- Faqat service_role tokeni imtiyozlarni o'zgartira oladi
    IF COALESCE(current_setting('request.jwt.claim.role', true), '') <> 'service_role' THEN
      NEW.is_admin := OLD.is_admin;
      NEW.admin_role := OLD.admin_role;
      NEW.is_premium := OLD.is_premium;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_protect_profile_privileges ON public.profiles;
CREATE TRIGGER trg_protect_profile_privileges
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.protect_profile_privileges();

-- ==============================================================================
-- 👨‍🏫 TEACHER LMS (O'QITUVCHILAR KABINETI & SINFLAR TIZIMI)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.classes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  subject_id TEXT REFERENCES public.subjects(id) ON DELETE SET NULL,
  grade TEXT, -- Masalan: '9-A', '11-B', 'IELTS Foundation'
  join_code VARCHAR(8) UNIQUE NOT NULL, -- 6-8 xonali qisqa taklif kodi
  academic_year TEXT DEFAULT '2026-2027',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.class_students (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id UUID NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'pending', 'blocked')),
  UNIQUE(class_id, student_id)
);

CREATE TABLE IF NOT EXISTS public.class_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id UUID NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
  teacher_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  test_id UUID REFERENCES public.tests(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  deadline TIMESTAMPTZ,
  max_attempts INT DEFAULT 1,
  time_limit_minutes INT DEFAULT 30,
  show_answers_immediately BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS for Teacher LMS
ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.class_students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.class_assignments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Teachers manage their own classes" ON public.classes;
CREATE POLICY "Teachers manage their own classes" ON public.classes 
  FOR ALL USING (auth.uid() = teacher_id);

DROP POLICY IF EXISTS "Students can view classes they joined" ON public.classes;
CREATE POLICY "Students can view classes they joined" ON public.classes 
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.class_students 
      WHERE class_students.class_id = classes.id 
      AND class_students.student_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Teachers manage class students" ON public.class_students;
CREATE POLICY "Teachers manage class students" ON public.class_students 
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.classes 
      WHERE classes.id = class_students.class_id 
      AND classes.teacher_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Students can join and view their enrollment" ON public.class_students;
CREATE POLICY "Students can join and view their enrollment" ON public.class_students 
  FOR ALL USING (auth.uid() = student_id);

DROP POLICY IF EXISTS "Teachers manage assignments" ON public.class_assignments;
CREATE POLICY "Teachers manage assignments" ON public.class_assignments 
  FOR ALL USING (auth.uid() = teacher_id);

DROP POLICY IF EXISTS "Enrolled students can view assignments" ON public.class_assignments;
CREATE POLICY "Enrolled students can view assignments" ON public.class_assignments 
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.class_students 
      WHERE class_students.class_id = class_assignments.class_id 
      AND class_students.student_id = auth.uid()
      AND class_students.status = 'active'
    )
  );

