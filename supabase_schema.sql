
-- Студенттерге ұсынылатын тағамдар кестесі
CREATE TABLE meals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('breakfast', 'lunch', 'snack')),
  serving_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Студенттердің пікірлері кестесі
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  meal_id UUID REFERENCES meals(id) ON DELETE CASCADE,
  overall_rating INTEGER CHECK (overall_rating >= 1 AND overall_rating <= 5),
  taste_rating INTEGER CHECK (taste_rating >= 1 AND taste_rating <= 5),
  portion_rating INTEGER CHECK (portion_rating >= 1 AND portion_rating <= 5),
  service_rating INTEGER CHECK (service_rating >= 1 AND service_rating <= 5),
  comment TEXT,
  student_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Мысал деректерді қосу (Meals)
INSERT INTO meals (name, type) VALUES 
('Ботқа және сүт', 'breakfast'),
('Күріш және тауық', 'lunch'),
('Алма және печенье', 'snack');
