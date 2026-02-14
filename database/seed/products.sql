PRAGMA foreign_keys = ON;

DROP TABLE IF EXISTS bundle_choice_option;
DROP TABLE IF EXISTS bundle_choice_slot;
DROP TABLE IF EXISTS bundle_fixed_item;
DROP TABLE IF EXISTS product;

CREATE TABLE product (
  id TEXT PRIMARY KEY,
  sku INTEGER NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('main','fries','loaded_fries','drink','dessert','meal')),
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  picture_url TEXT,
  price_minor INTEGER NOT NULL,
  active INTEGER NOT NULL DEFAULT 1,
  created_at INTEGER NOT NULL DEFAULT (strftime('%s','now')),
  updated_at INTEGER NOT NULL DEFAULT (strftime('%s','now')),
  CONSTRAINT product_sku_unique UNIQUE (sku),
  CONSTRAINT product_type_name_unique UNIQUE (type, name)
);

CREATE TABLE bundle_fixed_item (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  meal_product_id TEXT NOT NULL REFERENCES product(id) ON DELETE CASCADE,
  item_product_id TEXT NOT NULL REFERENCES product(id) ON DELETE RESTRICT,
  quantity INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE bundle_choice_slot (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  meal_product_id TEXT NOT NULL REFERENCES product(id) ON DELETE CASCADE,
  label TEXT NOT NULL,
  restrict_type TEXT CHECK (restrict_type IN ('main','fries','loaded_fries','drink','dessert','meal')),
  min_items INTEGER NOT NULL DEFAULT 1,
  max_items INTEGER NOT NULL DEFAULT 1,
  sort_order INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE bundle_choice_option (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slot_id INTEGER NOT NULL REFERENCES bundle_choice_slot(id) ON DELETE CASCADE,
  product_id TEXT NOT NULL REFERENCES product(id) ON DELETE RESTRICT,
  delta_minor INTEGER NOT NULL DEFAULT 0
);

-- DEFAULT image for items w/o their own
-- https://pub-380de5703af14b6c80771ab9010b390b.r2.dev/cheeseSteakSando.jpeg

-- Mains
INSERT INTO product (id, sku, type, name, description, picture_url, price_minor) VALUES
('p1', 1, 'main', 'Cheesesteak Sando',
 'Thinly sliced ribeye steak layered with caramelized onions and sweet gherkins, drizzled with our signature garlic aioli and rich cheese sauce, all sandwiched between slices of soft, buttery Shokupan bread.',
 'https://assets.beefbros.co.uk/cheeseSteakSandoV2.jpg', 1300),
('p2', 2, 'main', 'Smash Sando',
 'Two juicy beef smash patties stacked with melted cheese, caramelized onions, and sweet gherkins, finished with our house burger sauce, all sandwiched between slices of soft, buttery Shokupan bread.',
 'https://assets.beefbros.co.uk/smashPattySandoV2.jpg', 950);

-- Fries
INSERT INTO product (id, sku, type, name, description, picture_url, price_minor) VALUES
('p3', 3, 'fries', 'Plain Fries',
 'A generous portion of our golden, crispy fries — served plain.',
 'https://assets.beefbros.co.uk/plainFries.jpeg', 300),
('p4', 4, 'fries', 'Beef Bros Fries',
 'A generous portion of our golden, crispy fries — tossed in our signature Beef Bros special seasoning for an extra kick of flavor.',
 'https://assets.beefbros.co.uk/plainFries.jpeg', 300);

-- Loaded Fries
INSERT INTO product (id, sku, type, name, description, picture_url, price_minor) VALUES
('p5', 5, 'loaded_fries', 'Loaded Cheese Fries',
 'Crispy fries coated in our special seasoning, topped with caramelized onions and diced gherkins, then smothered in our creamy cheese sauce and house burger sauce.',
 'https://assets.beefbros.co.uk/loadedCheeseFries.jpeg', 500),
('p6', 6, 'loaded_fries', 'Loaded Smash Fries',
 'Our signature seasoned fries loaded with a chopped-up smash patty, caramelized onions, and diced gherkins, finished with a drizzle of our rich cheese sauce and burger sauce.',
 'https://assets.beefbros.co.uk/loadedSmashFriesV2.jpg', 700),
('p7', 7, 'loaded_fries', 'Loaded Steak Fries',
 'Our signature seasoned fries loaded with a chopped-up ribeye, caramelized onions, and diced gherkins, finished with a drizzle of our rich cheese sauce and garlic aioli.',
 'https://assets.beefbros.co.uk/loadedSmashFriesV2.jpg', 900);

-- Dessert
INSERT INTO product (id, sku, type, name, description, picture_url, price_minor) VALUES
('p8', 8, 'dessert', 'Milk Cake',
 'A soft, indulgent milk cake soaked overnight in our special milk mixture, topped with a luscious frosting, melted chocolate, and a sprinkle of crushed pistachio.',
 'https://assets.beefbros.co.uk/milkCake.jpeg', 500);

-- Drinks
INSERT INTO product (id, sku, type, name, description, picture_url, price_minor) VALUES
('p9',  9,  'drink', 'Tango Apple 330ml Can',            'Tango Apple 330ml Can',  'https://assets.beefbros.co.uk/tangoApple.png', 150),
('p10', 10, 'drink', 'Tango Cherry 330ml Can',           'Tango Cherry 330ml Can', 'https://assets.beefbros.co.uk/tangoCherry.png', 150),
('p11', 11, 'drink', 'Tango Mango 330ml Can',            'Tango Mango 330ml Can',  'https://assets.beefbros.co.uk/tangoMango.png', 150),
('p12', 12, 'drink', 'Tango Orange 330ml Can',           'Tango Orange 330ml Can', 'https://assets.beefbros.co.uk/tangoOrange.png', 150),
('p13', 13, 'drink', 'Tango Strawberry Smash 330ml Can', 'Tango Strawberry Smash 330ml Can', 'https://assets.beefbros.co.uk/tangoStrawberrySmash.png', 150);

-- Meals
INSERT INTO product (id, sku, type, name, description, picture_url, price_minor) VALUES
('p14', 14, 'meal', 'Smash Sando Meal for 1',
 'Smash Sando + Fries (choose 1) + Drink (choose 1)',
 'https://assets.beefbros.co.uk/smashPattySandoV2.jpg', 1200),
('p15', 15, 'meal', 'Smash Sando Meal for 2',
 'Smash Sando × 2 + Fries (choose 2) + Drinks (choose 2)',
 'https://assets.beefbros.co.uk/smashPattySandoV2.jpg', 2000),
('p16', 16, 'meal', 'Cheesesteak Sando Meal for 1',
 'Cheesesteak Sando + Fries (choose 1) + Drink (choose 1)',
 'https://assets.beefbros.co.uk/cheeseSteakSandoV2.jpg', 1500);

-- Fixed mains included per meal
INSERT INTO bundle_fixed_item (meal_product_id, item_product_id, quantity) VALUES
('p14','p2',1),
('p15','p2',2),
('p16','p1',1);

-- Choice slots (Drink + Side)
INSERT INTO bundle_choice_slot (meal_product_id, label, restrict_type, min_items, max_items, sort_order) VALUES
('p14','Drink','drink',1,1,0),
('p14','Side','fries',1,1,1),
('p15','Drink','drink',2,2,0),
('p15','Side','fries',2,2,1),
('p16','Drink','drink',1,1,0),
('p16','Side','fries',1,1,1);

-- Drinks allowed in all Drink slots
INSERT INTO bundle_choice_option (slot_id, product_id, delta_minor)
SELECT id, 'p9', 0  FROM bundle_choice_slot WHERE label='Drink';
INSERT INTO bundle_choice_option (slot_id, product_id, delta_minor)
SELECT id, 'p10', 0 FROM bundle_choice_slot WHERE label='Drink';
INSERT INTO bundle_choice_option (slot_id, product_id, delta_minor)
SELECT id, 'p11', 0 FROM bundle_choice_slot WHERE label='Drink';
INSERT INTO bundle_choice_option (slot_id, product_id, delta_minor)
SELECT id, 'p12', 0 FROM bundle_choice_slot WHERE label='Drink';
INSERT INTO bundle_choice_option (slot_id, product_id, delta_minor)
SELECT id, 'p13', 0 FROM bundle_choice_slot WHERE label='Drink';

-- For Side, only plain/seasoned fries (NOT loaded) per your current meal rules
INSERT INTO bundle_choice_option (slot_id, product_id, delta_minor)
SELECT id, 'p3', 0 FROM bundle_choice_slot WHERE label='Side';
INSERT INTO bundle_choice_option (slot_id, product_id, delta_minor)
SELECT id, 'p4', 0 FROM bundle_choice_slot WHERE label='Side';
