-- ============================================================
-- Kapwa Help — V1 Demo Seed Data
-- ============================================================
-- Self-contained, idempotent. Run after schema.sql.

-- Use fixed UUIDs so we can reference them across inserts.

-- ============================================================
-- Event
-- ============================================================
INSERT INTO events (id, name, slug, description, region, started_at, is_active) VALUES
  ('a0000000-0000-0000-0000-000000000001', 'Typhoon Emong Relief', 'typhoon-emong',
   'Community-led relief coordination for Typhoon Emong affecting La Union province.',
   'La Union', '2026-03-24', true)
ON CONFLICT (slug) DO NOTHING;

-- ============================================================
-- Organizations
-- ============================================================
INSERT INTO organizations (id, event_id, name, description, contact_info) VALUES
  ('b0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001',
   'Citizens for La Union', 'Local civic org coordinating donations and volunteer dispatch', 'info@citizensforlu.ph'),
  ('b0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001',
   'Buhaki LU Chapter', 'Volunteer rescue and relief group — boat and 4x4 access', 'buhaki.launion@gmail.com'),
  ('b0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000001',
   'Art Relief Mobile Kitchen', 'Hot meals program for displaced communities', 'artrelief@gmail.com'),
  ('b0000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000001',
   'LU Provincial Disaster Response', 'Provincial government disaster response unit (PDRRMO)', 'pdrrmo@launion.gov.ph'),
  ('b0000000-0000-0000-0000-000000000005', 'a0000000-0000-0000-0000-000000000001',
   'Ilocos Medical Volunteers', 'Volunteer nurses and doctors coordinating health outreach', 'ilocosmed@gmail.com'),
  ('b0000000-0000-0000-0000-000000000006', 'a0000000-0000-0000-0000-000000000001',
   'San Fernando Rotary Club', 'Civic club funding hygiene kits and potable water', 'rotary.sanfernando@gmail.com'),
  ('b0000000-0000-0000-0000-000000000007', 'a0000000-0000-0000-0000-000000000001',
   'La Union Surf Association', 'Local surfer-led community supporting coastal barangays', 'lusurf@gmail.com'),
  ('b0000000-0000-0000-0000-000000000008', 'a0000000-0000-0000-0000-000000000001',
   'Bayanihan Builders LU', 'Construction volunteers rebuilding homes and shelters', NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  contact_info = EXCLUDED.contact_info;

-- ============================================================
-- Deployment Hubs (independent from orgs, with lat/lng)
-- ============================================================
INSERT INTO deployment_hubs (id, event_id, name, lat, lng, description, notes) VALUES
  ('c0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001',
   'San Juan Municipal Hall', 16.6619, 120.3269, 'Main coordination center',
   'Open 24/7 during relief ops. Running low on hot meals — requesting more rice and canned goods. Volunteers needed for evening shifts. Coordinator: Mayor''s Office, 09175550101.'),
  ('c0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001',
   'Bacnotan Community Center', 16.7314, 120.3494, 'Northern relief staging area',
   'Staging area currently at ~80% capacity. Urgent need for blankets and children''s clothing for evacuees. Contact Brgy. Capt. Reyes at 09175550202.'),
  ('c0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000001',
   'San Fernando City Hall', 16.6159, 120.3267, 'Provincial capital hub',
   'Serves as backup comms center. Supplies adequate. Looking for volunteers for Saturday and Sunday shifts. Satellite phone available for remote coordination. Coordinator: Ms. Aquino, 09175550303.'),
  ('c0000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000001',
   'Bauang Relief Center', 16.5328, 120.3378, 'Southern relief distribution',
   'Southern distribution point. Drinking water stock lasts ~2 days — resupply requested. Medical team on-site until 6 PM daily. Bridge access OK via truck. Coordinator: Mr. Villanueva, 09175550404.'),
  ('c0000000-0000-0000-0000-000000000005', 'a0000000-0000-0000-0000-000000000001',
   'Luna Emergency Shelter', 16.8555, 120.3603, 'Emergency shelter for evacuees',
   'Capacity: ~200 people (currently sheltering 145). Need hygiene kits and additional cots. Road access via 4x4 only after landslide at km 14. Coordinator: Ms. Domingo, 09175550505.'),
  ('c0000000-0000-0000-0000-000000000006', 'a0000000-0000-0000-0000-000000000001',
   'Agoo Parish Hall', 16.3267, 120.3695, 'Southernmost coordination point',
   'Parish hall converted to staging area. Good road access. Kitchen serves 300 meals/day. Low on rice and cooking oil. Coordinator: Fr. Castillo, 09175550606.'),
  ('c0000000-0000-0000-0000-000000000007', 'a0000000-0000-0000-0000-000000000001',
   'Aringay Barangay Hall', 16.4008, 120.3554, 'Central-south relief post',
   'New staging area stood up 2026-04-02. Functioning well but limited vehicle access during high tide. Need fuel for the delivery truck. Coordinator: Brgy. Capt. Molina, 09175550707.'),
  ('c0000000-0000-0000-0000-000000000008', 'a0000000-0000-0000-0000-000000000001',
   'Balaoan Community Gym', 16.8122, 120.3878, 'Northern alternate shelter',
   'Alternate shelter for Luna overflow. 50-person capacity, currently 28 occupied. Volunteer cooks needed mornings. Coordinator: Mr. Pascual, 09175550808.')
ON CONFLICT (id) DO UPDATE SET
  description = EXCLUDED.description,
  notes = EXCLUDED.notes;

-- ============================================================
-- Hub Inventory (which categories each hub has)
-- ============================================================
DO $$
DECLARE
  cat_hot_meals uuid;
  cat_water uuid;
  cat_filtration uuid;
  cat_shelter uuid;
  cat_clothing uuid;
  cat_construction uuid;
  cat_medical uuid;
  cat_hygiene uuid;
  cat_canned uuid;
BEGIN
  SELECT id INTO cat_hot_meals FROM aid_categories WHERE name = 'Hot Meals';
  SELECT id INTO cat_water FROM aid_categories WHERE name = 'Drinking Water';
  SELECT id INTO cat_filtration FROM aid_categories WHERE name = 'Water Filtration';
  SELECT id INTO cat_shelter FROM aid_categories WHERE name = 'Temporary Shelter';
  SELECT id INTO cat_clothing FROM aid_categories WHERE name = 'Clothing';
  SELECT id INTO cat_construction FROM aid_categories WHERE name = 'Construction Materials';
  SELECT id INTO cat_medical FROM aid_categories WHERE name = 'Medical Supplies';
  SELECT id INTO cat_hygiene FROM aid_categories WHERE name = 'Hygiene Kits';
  SELECT id INTO cat_canned FROM aid_categories WHERE name = 'Canned Food';

  -- San Juan hub: hot meals, water, medical
  INSERT INTO hub_inventory (hub_id, aid_category_id) VALUES
    ('c0000000-0000-0000-0000-000000000001', cat_hot_meals),
    ('c0000000-0000-0000-0000-000000000001', cat_water),
    ('c0000000-0000-0000-0000-000000000001', cat_medical)
  ON CONFLICT DO NOTHING;

  -- Bacnotan hub: shelter, clothing, canned food
  INSERT INTO hub_inventory (hub_id, aid_category_id) VALUES
    ('c0000000-0000-0000-0000-000000000002', cat_shelter),
    ('c0000000-0000-0000-0000-000000000002', cat_clothing),
    ('c0000000-0000-0000-0000-000000000002', cat_canned)
  ON CONFLICT DO NOTHING;

  -- San Fernando hub: water filtration, hygiene, medical
  INSERT INTO hub_inventory (hub_id, aid_category_id) VALUES
    ('c0000000-0000-0000-0000-000000000003', cat_filtration),
    ('c0000000-0000-0000-0000-000000000003', cat_hygiene),
    ('c0000000-0000-0000-0000-000000000003', cat_medical)
  ON CONFLICT DO NOTHING;

  -- Bauang hub: hot meals, water, canned food
  INSERT INTO hub_inventory (hub_id, aid_category_id) VALUES
    ('c0000000-0000-0000-0000-000000000004', cat_hot_meals),
    ('c0000000-0000-0000-0000-000000000004', cat_water),
    ('c0000000-0000-0000-0000-000000000004', cat_canned)
  ON CONFLICT DO NOTHING;

  -- Luna hub: shelter, construction, hygiene
  INSERT INTO hub_inventory (hub_id, aid_category_id) VALUES
    ('c0000000-0000-0000-0000-000000000005', cat_shelter),
    ('c0000000-0000-0000-0000-000000000005', cat_construction),
    ('c0000000-0000-0000-0000-000000000005', cat_hygiene)
  ON CONFLICT DO NOTHING;

  -- Agoo hub: hot meals, canned food, clothing
  INSERT INTO hub_inventory (hub_id, aid_category_id) VALUES
    ('c0000000-0000-0000-0000-000000000006', cat_hot_meals),
    ('c0000000-0000-0000-0000-000000000006', cat_canned),
    ('c0000000-0000-0000-0000-000000000006', cat_clothing)
  ON CONFLICT DO NOTHING;

  -- Aringay hub: water, medical, hygiene
  INSERT INTO hub_inventory (hub_id, aid_category_id) VALUES
    ('c0000000-0000-0000-0000-000000000007', cat_water),
    ('c0000000-0000-0000-0000-000000000007', cat_medical),
    ('c0000000-0000-0000-0000-000000000007', cat_hygiene)
  ON CONFLICT DO NOTHING;

  -- Balaoan hub: shelter, clothing
  INSERT INTO hub_inventory (hub_id, aid_category_id) VALUES
    ('c0000000-0000-0000-0000-000000000008', cat_shelter),
    ('c0000000-0000-0000-0000-000000000008', cat_clothing)
  ON CONFLICT DO NOTHING;

  -- ============================================================
  -- Needs (15 needs: 8 pending, 3 verified, 4 in_transit, 0 confirmed)
  -- ============================================================
  INSERT INTO needs (id, event_id, hub_id, lat, lng, access_status, urgency, status, num_people, contact_name, contact_phone, notes) VALUES
    -- 8 pending
    ('d0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', NULL,
     16.6734, 120.3345, 'truck', 'high', 'pending', 45,
     'Maria Santos', '09171234567', 'Flooded area near the river, families on rooftops'),
    ('d0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001', NULL,
     16.7012, 120.3389, '4x4', 'critical', 'pending', 120,
     'Juan Dela Cruz', '09189876543', 'Landslide blocked main road, no food for 2 days'),
    ('d0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000001', NULL,
     16.5912, 120.3489, 'foot_only', 'critical', 'pending', 60,
     'Rosa Fernandez', '09153334455', 'Mountain village, bridge washed out'),
    ('d0000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000001', NULL,
     16.6289, 120.3398, 'cut_off', 'high', 'pending', 200,
     'Carlos Mendoza', '09161112222', 'Entire sitio cut off by flooding'),
    ('d0000000-0000-0000-0000-000000000005', 'a0000000-0000-0000-0000-000000000001', NULL,
     16.4112, 120.3645, 'truck', 'medium', 'pending', 35,
     'Lourdes Aquino', '09177778899', 'Elderly residents displaced, need dry clothes and blankets'),
    ('d0000000-0000-0000-0000-000000000006', 'a0000000-0000-0000-0000-000000000001', NULL,
     16.3412, 120.3723, 'truck', 'high', 'pending', 80,
     'Antonio Reyes', '09208889900', 'Barangay health center damaged, requesting medical supplies'),
    ('d0000000-0000-0000-0000-000000000007', 'a0000000-0000-0000-0000-000000000001', NULL,
     16.8223, 120.3812, '4x4', 'medium', 'pending', 55,
     'Miguel Torres', '09192223344', 'Remote barangay, needs hygiene kits'),
    ('d0000000-0000-0000-0000-000000000008', 'a0000000-0000-0000-0000-000000000001', NULL,
     16.7823, 120.3689, 'foot_only', 'high', 'pending', 42,
     'Celia Bautista', '09173456789', 'Footbridge collapsed, families isolated since Tuesday'),
    -- 3 verified
    ('d0000000-0000-0000-0000-000000000009', 'a0000000-0000-0000-0000-000000000001',
     'c0000000-0000-0000-0000-000000000001', 16.6555, 120.3401, 'truck', 'medium', 'verified', 30,
     'Ana Reyes', '09164445566', 'Elderly residents need medical supplies — verified by PDRRMO team'),
    ('d0000000-0000-0000-0000-000000000010', 'a0000000-0000-0000-0000-000000000001',
     'c0000000-0000-0000-0000-000000000002', 16.7456, 120.3567, '4x4', 'high', 'verified', 85,
     'Pedro Garcia', '09201112233', 'Coastal community cut off by debris, verified by Buhaki volunteers'),
    ('d0000000-0000-0000-0000-000000000011', 'a0000000-0000-0000-0000-000000000001', NULL,
     16.5401, 120.3556, 'truck', 'low', 'verified', 25,
     'Elena Ramos', '09167778899', 'Minor flooding, households need canned food'),
    -- 4 in_transit
    ('d0000000-0000-0000-0000-000000000012', 'a0000000-0000-0000-0000-000000000001',
     'c0000000-0000-0000-0000-000000000004', 16.5489, 120.3412, 'truck', 'high', 'in_transit', 95,
     'Ricardo Dizon', '09175556677', 'Delivery en route — hot meals and drinking water'),
    ('d0000000-0000-0000-0000-000000000013', 'a0000000-0000-0000-0000-000000000001',
     'c0000000-0000-0000-0000-000000000006', 16.3378, 120.3689, 'truck', 'medium', 'in_transit', 50,
     'Josefina Lim', '09182223344', 'Blankets and hygiene kits dispatched via Agoo hub'),
    ('d0000000-0000-0000-0000-000000000014', 'a0000000-0000-0000-0000-000000000001',
     'c0000000-0000-0000-0000-000000000007', 16.3955, 120.3512, '4x4', 'critical', 'in_transit', 110,
     'Benjamin Cortez', '09195556677', 'Medical team en route — pregnant women and children need care'),
    ('d0000000-0000-0000-0000-000000000015', 'a0000000-0000-0000-0000-000000000001',
     'c0000000-0000-0000-0000-000000000005', 16.8478, 120.3723, '4x4', 'high', 'in_transit', 65,
     'Teresita Gomez', '09207778899', 'Shelter materials and tarps being delivered by Luna hub team')
  ON CONFLICT (id) DO UPDATE SET
    hub_id = EXCLUDED.hub_id,
    lat = EXCLUDED.lat,
    lng = EXCLUDED.lng,
    access_status = EXCLUDED.access_status,
    urgency = EXCLUDED.urgency,
    status = EXCLUDED.status,
    num_people = EXCLUDED.num_people,
    contact_name = EXCLUDED.contact_name,
    contact_phone = EXCLUDED.contact_phone,
    notes = EXCLUDED.notes;

  -- ============================================================
  -- Need Categories (multi-select per need)
  -- ============================================================
  INSERT INTO need_categories (need_id, aid_category_id) VALUES
    ('d0000000-0000-0000-0000-000000000001', cat_hot_meals),
    ('d0000000-0000-0000-0000-000000000001', cat_water),
    ('d0000000-0000-0000-0000-000000000002', cat_canned),
    ('d0000000-0000-0000-0000-000000000002', cat_water),
    ('d0000000-0000-0000-0000-000000000002', cat_shelter),
    ('d0000000-0000-0000-0000-000000000003', cat_construction),
    ('d0000000-0000-0000-0000-000000000003', cat_shelter),
    ('d0000000-0000-0000-0000-000000000004', cat_water),
    ('d0000000-0000-0000-0000-000000000004', cat_filtration),
    ('d0000000-0000-0000-0000-000000000004', cat_hot_meals),
    ('d0000000-0000-0000-0000-000000000005', cat_clothing),
    ('d0000000-0000-0000-0000-000000000005', cat_shelter),
    ('d0000000-0000-0000-0000-000000000006', cat_medical),
    ('d0000000-0000-0000-0000-000000000006', cat_hygiene),
    ('d0000000-0000-0000-0000-000000000007', cat_hygiene),
    ('d0000000-0000-0000-0000-000000000007', cat_clothing),
    ('d0000000-0000-0000-0000-000000000008', cat_hot_meals),
    ('d0000000-0000-0000-0000-000000000008', cat_water),
    ('d0000000-0000-0000-0000-000000000009', cat_medical),
    ('d0000000-0000-0000-0000-000000000010', cat_hot_meals),
    ('d0000000-0000-0000-0000-000000000010', cat_clothing),
    ('d0000000-0000-0000-0000-000000000010', cat_hygiene),
    ('d0000000-0000-0000-0000-000000000011', cat_canned),
    ('d0000000-0000-0000-0000-000000000012', cat_hot_meals),
    ('d0000000-0000-0000-0000-000000000012', cat_water),
    ('d0000000-0000-0000-0000-000000000013', cat_clothing),
    ('d0000000-0000-0000-0000-000000000013', cat_hygiene),
    ('d0000000-0000-0000-0000-000000000014', cat_medical),
    ('d0000000-0000-0000-0000-000000000015', cat_shelter),
    ('d0000000-0000-0000-0000-000000000015', cat_construction)
  ON CONFLICT DO NOTHING;

  -- ============================================================
  -- Donations (14 total: cash and in-kind, spread across all 8 orgs)
  -- ============================================================
  INSERT INTO donations (id, event_id, organization_id, donor_name, donor_type, type, amount, date, notes) VALUES
    ('e0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001',
     'b0000000-0000-0000-0000-000000000001', 'Overseas Filipino Workers Assoc.', 'organization', 'cash',
     500000.00, '2026-03-25', 'Emergency fund from OFW community'),
    ('e0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001',
     'b0000000-0000-0000-0000-000000000001', 'Gov. Ricardo Ortega', 'individual', 'cash',
     200000.00, '2026-03-26', NULL),
    ('e0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000001',
     'b0000000-0000-0000-0000-000000000002', NULL, NULL, 'cash',
     150000.00, '2026-03-27', 'Anonymous donor via GCash'),
    ('e0000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000001',
     'b0000000-0000-0000-0000-000000000003', 'San Juan Lions Club', 'organization', 'cash',
     300000.00, '2026-03-28', NULL),
    ('e0000000-0000-0000-0000-000000000005', 'a0000000-0000-0000-0000-000000000001',
     'b0000000-0000-0000-0000-000000000004', 'LU Chamber of Commerce', 'organization', 'cash',
     750000.00, '2026-03-29', 'Business community relief fund'),
    ('e0000000-0000-0000-0000-000000000006', 'a0000000-0000-0000-0000-000000000001',
     'b0000000-0000-0000-0000-000000000003', 'Red Cross LU', 'organization', 'in_kind',
     NULL, '2026-03-26', 'Medical supplies and hygiene kits'),
    ('e0000000-0000-0000-0000-000000000007', 'a0000000-0000-0000-0000-000000000001',
     'b0000000-0000-0000-0000-000000000002', 'Barangay Urbiztondo', 'organization', 'in_kind',
     NULL, '2026-03-27', 'Hot meals for 3 days'),
    ('e0000000-0000-0000-0000-000000000008', 'a0000000-0000-0000-0000-000000000001',
     'b0000000-0000-0000-0000-000000000001', 'Manila Volunteers', 'organization', 'in_kind',
     NULL, '2026-03-28', 'Clothing and blankets'),
    ('e0000000-0000-0000-0000-000000000009', 'a0000000-0000-0000-0000-000000000001',
     'b0000000-0000-0000-0000-000000000005', 'Dr. Elena Aguilar', 'individual', 'cash',
     75000.00, '2026-04-02', 'Donation from Baguio medical community'),
    ('e0000000-0000-0000-0000-000000000010', 'a0000000-0000-0000-0000-000000000001',
     'b0000000-0000-0000-0000-000000000006', 'San Fernando Rotarians', 'organization', 'in_kind',
     NULL, '2026-04-05', 'Hygiene kits assembled at weekly meeting'),
    ('e0000000-0000-0000-0000-000000000011', 'a0000000-0000-0000-0000-000000000001',
     'b0000000-0000-0000-0000-000000000007', NULL, NULL, 'cash',
     45000.00, '2026-04-08', 'Anonymous GCash donations via surf community'),
    ('e0000000-0000-0000-0000-000000000012', 'a0000000-0000-0000-0000-000000000001',
     'b0000000-0000-0000-0000-000000000008', 'LU Home Depot', 'organization', 'in_kind',
     NULL, '2026-04-10', 'Tarps, rope, and basic construction materials'),
    ('e0000000-0000-0000-0000-000000000013', 'a0000000-0000-0000-0000-000000000001',
     'b0000000-0000-0000-0000-000000000005', 'Bataan Nurses Union', 'organization', 'in_kind',
     NULL, '2026-04-14', 'Second shipment of basic medical supplies'),
    ('e0000000-0000-0000-0000-000000000014', 'a0000000-0000-0000-0000-000000000001',
     'b0000000-0000-0000-0000-000000000004', 'Ayala Foundation', 'organization', 'cash',
     1200000.00, '2026-04-17', 'Major corporate grant earmarked for rebuilding phase')
  ON CONFLICT (id) DO UPDATE SET
    organization_id = EXCLUDED.organization_id,
    donor_name = EXCLUDED.donor_name,
    donor_type = EXCLUDED.donor_type,
    type = EXCLUDED.type,
    amount = EXCLUDED.amount,
    date = EXCLUDED.date,
    notes = EXCLUDED.notes;

  -- ============================================================
  -- Donation Categories (for in-kind)
  -- ============================================================
  INSERT INTO donation_categories (donation_id, aid_category_id) VALUES
    ('e0000000-0000-0000-0000-000000000006', cat_medical),
    ('e0000000-0000-0000-0000-000000000006', cat_hygiene),
    ('e0000000-0000-0000-0000-000000000007', cat_hot_meals),
    ('e0000000-0000-0000-0000-000000000008', cat_clothing),
    ('e0000000-0000-0000-0000-000000000010', cat_hygiene),
    ('e0000000-0000-0000-0000-000000000012', cat_shelter),
    ('e0000000-0000-0000-0000-000000000012', cat_construction),
    ('e0000000-0000-0000-0000-000000000013', cat_medical)
  ON CONFLICT DO NOTHING;

  -- ============================================================
  -- Purchases (8 total, spread across 6 orgs, recent dates)
  -- ============================================================
  INSERT INTO purchases (id, event_id, organization_id, cost, date, notes) VALUES
    ('f0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001',
     'b0000000-0000-0000-0000-000000000001', 85000.00, '2026-03-27', 'Bulk water purchase from supplier'),
    ('f0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001',
     'b0000000-0000-0000-0000-000000000003', 120000.00, '2026-03-28', 'Hot meals ingredients for 500 servings'),
    ('f0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000001',
     'b0000000-0000-0000-0000-000000000004', 250000.00, '2026-03-29', 'Temporary shelter materials'),
    ('f0000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000001',
     'b0000000-0000-0000-0000-000000000002', 45000.00, '2026-03-30', 'Hygiene kits assembly'),
    ('f0000000-0000-0000-0000-000000000005', 'a0000000-0000-0000-0000-000000000001',
     'b0000000-0000-0000-0000-000000000005', 95000.00, '2026-04-04', 'Medical supplies restock (IV fluids, wound care)'),
    ('f0000000-0000-0000-0000-000000000006', 'a0000000-0000-0000-0000-000000000001',
     'b0000000-0000-0000-0000-000000000006', 60000.00, '2026-04-09', 'Water filtration units for 4 barangays'),
    ('f0000000-0000-0000-0000-000000000007', 'a0000000-0000-0000-0000-000000000001',
     'b0000000-0000-0000-0000-000000000008', 180000.00, '2026-04-13', 'Lumber and roofing materials for rebuilds'),
    ('f0000000-0000-0000-0000-000000000008', 'a0000000-0000-0000-0000-000000000001',
     'b0000000-0000-0000-0000-000000000003', 72000.00, '2026-04-17', 'Rice, canned goods for next 5 days')
  ON CONFLICT (id) DO UPDATE SET
    organization_id = EXCLUDED.organization_id,
    cost = EXCLUDED.cost,
    date = EXCLUDED.date,
    notes = EXCLUDED.notes;

  -- ============================================================
  -- Purchase Categories
  -- ============================================================
  INSERT INTO purchase_categories (purchase_id, aid_category_id) VALUES
    ('f0000000-0000-0000-0000-000000000001', cat_water),
    ('f0000000-0000-0000-0000-000000000002', cat_hot_meals),
    ('f0000000-0000-0000-0000-000000000003', cat_shelter),
    ('f0000000-0000-0000-0000-000000000003', cat_construction),
    ('f0000000-0000-0000-0000-000000000004', cat_hygiene),
    ('f0000000-0000-0000-0000-000000000005', cat_medical),
    ('f0000000-0000-0000-0000-000000000006', cat_filtration),
    ('f0000000-0000-0000-0000-000000000006', cat_water),
    ('f0000000-0000-0000-0000-000000000007', cat_construction),
    ('f0000000-0000-0000-0000-000000000007', cat_shelter),
    ('f0000000-0000-0000-0000-000000000008', cat_hot_meals),
    ('f0000000-0000-0000-0000-000000000008', cat_canned)
  ON CONFLICT DO NOTHING;

END $$;

-- ============================================================
-- Hazards (6 hazards: 4 active + 2 resolved; 4 with photos, 2 without)
-- ============================================================
INSERT INTO hazards (id, event_id, description, photo_url, latitude, longitude, status, reported_by, contact_phone) VALUES
  ('10000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001',
   'Major flooding along Bauang River — water level 2m above normal, families evacuating to higher ground',
   '/demo-hazards/flooding.jpg', 16.5412, 120.3401, 'active', 'MDRRMO Bauang', '09175551111'),
  ('10000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001',
   'Landslide blocking Naguilian Road km 14 — debris extends approx 30m, heavy equipment needed',
   '/demo-hazards/landslide.jpg', 16.5189, 120.3956, 'active', 'PNP Naguilian', '09175552222'),
  ('10000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000001',
   'Downed power lines near Bacnotan market — keep clear, area not yet secured',
   '/demo-hazards/power-lines.jpg', 16.7289, 120.3512, 'active', NULL, NULL),
  ('10000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000001',
   'Storm damage to San Fernando elementary school roof — classrooms unsafe, avoid north wing',
   NULL, 16.6245, 120.3388, 'active', 'Principal Tanoza', '09175553333'),
  ('10000000-0000-0000-0000-000000000005', 'a0000000-0000-0000-0000-000000000001',
   'Bridge weakened at San Gabriel crossing — do not use heavy vehicles (cleared for light traffic 04-12)',
   '/demo-hazards/bridge.jpg', 16.6945, 120.4123, 'resolved', 'DPWH La Union', '09175554444'),
  ('10000000-0000-0000-0000-000000000006', 'a0000000-0000-0000-0000-000000000001',
   'Debris blocking access road near Aringay market — cleared by community volunteers',
   NULL, 16.4023, 120.3612, 'resolved', NULL, NULL)
ON CONFLICT (id) DO UPDATE SET
  description = EXCLUDED.description,
  photo_url = EXCLUDED.photo_url,
  latitude = EXCLUDED.latitude,
  longitude = EXCLUDED.longitude,
  status = EXCLUDED.status,
  reported_by = EXCLUDED.reported_by,
  contact_phone = EXCLUDED.contact_phone;

-- ============================================================
-- Deployments (for confirmed needs)
-- ============================================================
INSERT INTO deployments (id, event_id, hub_id, need_id, date, notes) VALUES
  ('20000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001',
   'c0000000-0000-0000-0000-000000000002', 'd0000000-0000-0000-0000-000000000004',
   '2026-03-30', 'Boat delivery coordinated with coast guard'),
  ('20000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001',
   'c0000000-0000-0000-0000-000000000004', 'd0000000-0000-0000-0000-000000000007',
   '2026-04-01', 'Regular truck delivery')
ON CONFLICT DO NOTHING;
