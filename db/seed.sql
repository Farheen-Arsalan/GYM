-- PulseFit sample data. Safe to run repeatedly (ON CONFLICT DO NOTHING).

INSERT INTO exercises (name, muscle_group, sets, reps, difficulty, rest_seconds, description) VALUES
  -- Chest
  ('Barbell Bench Press',      'Chest',  4, '6–8',      'Intermediate', 120, 'Drive your feet into the floor and keep your shoulder blades pinned back.'),
  ('Incline Dumbbell Press',   'Chest',  3, '8–10',     'Beginner',      90, 'Set the bench to 30° and lower slowly to the upper chest.'),
  ('Cable Crossover',          'Chest',  3, '12–15',    'Beginner',      60, 'Hug a tree and squeeze hard at the midline.'),
  ('Weighted Dips',            'Chest',  3, '8–12',     'Advanced',      90, 'Lean forward slightly to bias the chest; control the bottom.'),
  ('Push-Ups',                 'Chest',  3, '15–20',    'Beginner',      45, 'Body in one straight line, chest touches the floor every rep.'),
  -- Back
  ('Deadlift',                 'Back',   5, '3–5',      'Advanced',     180, 'Push the floor away and keep the bar close to your shins.'),
  ('Pull-Ups',                 'Back',   4, '6–10',     'Intermediate', 120, 'Lead with the chest and come to a full hang at the bottom.'),
  ('Seated Cable Row',         'Back',   3, '10–12',    'Beginner',      75, 'Pull elbows back, pause and squeeze your shoulder blades.'),
  ('Bent-Over Barbell Row',    'Back',   4, '8–10',     'Intermediate',  90, 'Hinge to 45°, row the bar to your belly button.'),
  ('Lat Pulldown',             'Back',   3, '10–12',    'Beginner',      60, 'Pull the bar to your upper chest, elbows drive down.'),
  -- Legs
  ('Back Squat',               'Legs',   5, '5',        'Advanced',     180, 'Brace hard and let the knees track over the toes.'),
  ('Romanian Deadlift',        'Legs',   3, '8–10',     'Intermediate',  90, 'Hinge at the hips with soft knees — feel the hamstrings.'),
  ('Walking Lunges',           'Legs',   3, '12 / leg', 'Beginner',      60, 'Take a long stride and let the back knee kiss the floor.'),
  ('Leg Press',                'Legs',   4, '10–12',    'Beginner',      90, 'Feet shoulder-width, lower until knees reach 90°.'),
  ('Bulgarian Split Squat',    'Legs',   3, '8 / leg',   'Intermediate',  75, 'Rear foot on the bench, torso tall, drive through the front heel.'),
  -- Arms
  ('Barbell Curl',             'Arms',   3, '10–12',    'Beginner',      60, 'Elbows pinned to your sides — no swinging.'),
  ('Hammer Curl',              'Arms',   3, '12',       'Beginner',      60, 'Neutral grip and a slow, controlled negative.'),
  ('Skull Crushers',           'Arms',   3, '10',       'Intermediate',  75, 'Lower to the forehead with elbows staying narrow.'),
  ('Cable Triceps Pushdown',   'Arms',   3, '12–15',    'Beginner',      45, 'Lock the elbows in place and fully straighten at the bottom.'),
  ('Close-Grip Bench Press',   'Arms',   4, '6–8',      'Advanced',     120, 'Hands shoulder-width, elbows tucked, press through the triceps.'),
  -- Core
  ('Hanging Leg Raise',        'Core',   3, '12',       'Intermediate',  60, 'Curl the pelvis up and avoid swinging.'),
  ('Plank',                    'Core',   3, '60 s',     'Beginner',      45, 'Squeeze your glutes and keep the ribs down.'),
  ('Ab Wheel Rollout',         'Core',   3, '8–10',     'Advanced',      75, 'Hollow body — roll out only as far as you can control.'),
  ('Russian Twist',            'Core',   3, '20',       'Beginner',      45, 'Lean back slightly and rotate from the ribs, not the arms.'),
  ('Cable Woodchop',           'Core',   3, '12 / side', 'Intermediate',  45, 'Rotate through the torso with straight arms, hips stay square.'),
  -- Cardio
  ('Rowing Intervals',         'Cardio', 8, '250 m',    'Intermediate',  60, 'Legs, hips, arms — then reverse on the way back.'),
  ('Assault Bike Sprints',     'Cardio', 10, '20 s',    'Advanced',      40, 'All-out effort, then spin easy until the next sprint.'),
  ('Jump Rope',                'Cardio', 5, '2 min',    'Beginner',      60, 'Stay light on the balls of your feet.'),
  ('Treadmill Hill Walk',      'Cardio', 4, '5 min',    'Beginner',      60, '10–12% incline at a brisk pace — no holding the rails.'),
  ('Burpees',                  'Cardio', 5, '12',       'Intermediate',  60, 'Chest to the floor, explode up and clap overhead.')
ON CONFLICT (name) DO NOTHING;

-- 10 classes in the current week (Monday-based). Re-running in a later week adds that week's classes.
WITH wk AS (SELECT date_trunc('week', now() AT TIME ZONE 'UTC') AS monday)
INSERT INTO classes (title, coach_name, start_time, duration_minutes, capacity, intensity)
SELECT c.title, c.coach, ((wk.monday + c.day_offset * interval '1 day' + c.start_at) AT TIME ZONE 'UTC'), c.mins, c.cap, c.intensity
FROM wk, (VALUES
  ('Sunrise Yoga Flow',       'Maya Chen',     0, time '07:00', 45, 20, 'Low'),
  ('HIIT Burn 30',            'Jordan Blake',  0, time '12:15', 30, 16, 'High'),
  ('Rhythm Spin',             'Lena Park',     1, time '06:30', 45, 24, 'High'),
  ('Boxing Fundamentals',     'Dre Okafor',    1, time '18:30', 60, 14, 'Medium'),
  ('Strength Foundations',    'Sam Rivera',    2, time '17:30', 50, 12, 'Medium'),
  ('Power Vinyasa',           'Sana Ali',      3, time '17:45', 60, 20, 'Medium'),
  ('Tabata Thunder',          'Jordan Blake',  3, time '07:00', 30, 16, 'High'),
  ('Climb & Sprint Ride',     'Lena Park',     4, time '12:00', 45, 24, 'High'),
  ('Pads & Power Boxing',     'Dre Okafor',    4, time '19:15', 60, 14, 'High'),
  ('Weekend Mobility Reset',  'Maya Chen',     5, time '10:30', 40, 20, 'Low')
) AS c(title, coach, day_offset, start_at, mins, cap, intensity)
ON CONFLICT (title, start_time) DO NOTHING;
