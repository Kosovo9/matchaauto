-- EduBarter & HealthBarter Migration
-- 1. Rural Schools
CREATE TABLE IF NOT EXISTS rural_schools (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    region VARCHAR(255) NOT NULL,
    contact_phone VARCHAR(50),
    needs TEXT [],
    -- Array of strings
    accepts TEXT [],
    -- Array of strings (barter items)
    students_count INT DEFAULT 0,
    is_offline_mode BOOLEAN DEFAULT TRUE,
    verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
-- 2. Rural Clinics
CREATE TABLE IF NOT EXISTS rural_clinics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    region VARCHAR(255) NOT NULL,
    services TEXT [],
    -- ["consulta", "parto"]
    accepts TEXT [],
    -- ["frijol", "leña"]
    is_offline_mode BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
-- 3. Clinic Inventory
CREATE TABLE IF NOT EXISTS clinic_inventory (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clinic_id UUID REFERENCES rural_clinics(id),
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50),
    -- analgesic, antibiotic
    quantity DECIMAL(10, 2) NOT NULL,
    unit VARCHAR(50),
    expires_at DATE,
    source VARCHAR(50),
    -- donation, purchase, barter
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
-- 4. Barter Escrows (Shared)
CREATE TABLE IF NOT EXISTS barter_escrows (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID REFERENCES rural_schools(id),
    -- Optional, link to school
    clinic_id UUID REFERENCES rural_clinics(id),
    -- Optional, link to clinic
    parent_id UUID NOT NULL,
    -- Or patient_id (User ID)
    facilitator_id UUID,
    amount DECIMAL(10, 2),
    barter_item VARCHAR(255),
    status VARCHAR(50) DEFAULT 'draft',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    released_at TIMESTAMP WITH TIME ZONE
);