CREATE EXTENSION IF NOT EXISTS postgis;

CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    phone VARCHAR(20),
    role VARCHAR(20) CHECK (role IN ('user','admin')) DEFAULT 'user',
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS land_types (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT
);

INSERT INTO land_types (name, description) VALUES 
('Agricultural', 'Land used for farming or cultivation'),
('Residential', 'Land used for building houses or apartments')
ON CONFLICT DO NOTHING;

CREATE TABLE IF NOT EXISTS property_status (
    id SERIAL PRIMARY KEY,
    status VARCHAR(20) UNIQUE NOT NULL
);

INSERT INTO property_status (status) VALUES 
('pending'), ('approved'), ('rejected'), ('sold')
ON CONFLICT DO NOTHING;

CREATE TABLE IF NOT EXISTS properties (
    id SERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    land_type_id INTEGER REFERENCES land_types(id),
    owner_id INTEGER REFERENCES users(id),
    status_id INTEGER REFERENCES property_status(id),
    price DECIMAL(12,2) NOT NULL,
    area DECIMAL(10,2) NOT NULL,
    address TEXT,
    city VARCHAR(100),
    district VARCHAR(100),
    state VARCHAR(50) DEFAULT 'Tamil Nadu',
    location GEOMETRY(POINT, 4326),
    features JSONB,
    patta_number VARCHAR(50),
    survey_number VARCHAR(50),
    village VARCHAR(100),
    taluk VARCHAR(100),
    distance_to_cbd_km DECIMAL(6,2),
    nearest_bus_distance_m INTEGER,
    nearest_railway_distance_m INTEGER,
    nearest_school_distance_m INTEGER,
    nearest_hospital_distance_m INTEGER,
    nearest_park_distance_m INTEGER,
    nearest_supermarket_distance_m INTEGER,
    schools_1km_count INTEGER DEFAULT 0,
    bus_stops_1km_count INTEGER DEFAULT 0,
    hospitals_2km_count INTEGER DEFAULT 0,
    restaurants_1km_count INTEGER DEFAULT 0,
    banks_1km_count INTEGER DEFAULT 0,
    water_bodies_1km_count INTEGER DEFAULT 0,
    nearest_water_body_distance_m INTEGER,
    amenities_data JSONB,
    verified_at TIMESTAMP,
    verified_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_properties_location ON properties USING GIST (location);
CREATE INDEX IF NOT EXISTS idx_properties_status ON properties(status_id);
CREATE INDEX IF NOT EXISTS idx_properties_land_type ON properties(land_type_id);
CREATE INDEX IF NOT EXISTS idx_properties_price ON properties(price);
CREATE INDEX IF NOT EXISTS idx_properties_city ON properties(city);

-- Create mock patta table
CREATE TABLE IF NOT EXISTS mock_patta (
    id SERIAL PRIMARY KEY,
    patta_number VARCHAR(50),
    district VARCHAR(100),
    taluk VARCHAR(100),
    village VARCHAR(100),
    survey_number VARCHAR(50),
    owner_name VARCHAR(200),
    area DECIMAL(10,2),
    latitude DECIMAL(10,8),
    longitude DECIMAL(11,8),
    fmb_sketch_url TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS media (
    id SERIAL PRIMARY KEY,
    property_id INTEGER REFERENCES properties(id) ON DELETE CASCADE,
    url TEXT,
    type VARCHAR(10) CHECK (type IN ('image','video','document')),
    is_primary BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS price_history (
    id SERIAL PRIMARY KEY,
    property_id INTEGER REFERENCES properties(id) ON DELETE CASCADE,
    price DECIMAL(12,2),
    recorded_date DATE,
    source VARCHAR(50) DEFAULT 'user_input',
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS prediction_factors (
    id SERIAL PRIMARY KEY,
    land_type_id INTEGER REFERENCES land_types(id),
    factor_name VARCHAR(100),
    factor_type VARCHAR(20) CHECK (factor_type IN ('numeric','categorical','boolean')),
    possible_values JSONB,
    is_required BOOLEAN DEFAULT TRUE,
    display_order INTEGER DEFAULT 0,
    UNIQUE(land_type_id, factor_name)
);

CREATE TABLE IF NOT EXISTS trained_models (
    id SERIAL PRIMARY KEY,
    land_type_id INTEGER REFERENCES land_types(id) UNIQUE,
    model_data JSONB,
    feature_names TEXT[],
    stats JSONB,
    r2_score DECIMAL(5,4),
    training_data_count INTEGER,
    trained_at TIMESTAMP DEFAULT NOW()
);
-- Seed Admin User (password: admin123)
INSERT INTO users (name, email, password_hash, phone, role) 
VALUES ('System Admin', 'admin@realiestate.com', '$2b$10$BuSIKq4Jt4brx1NLGpJtd.ywK5fRINq60rG0irQpqJcfB1Otmq7.6', '9876543210', 'admin')
ON CONFLICT (email) DO NOTHING;
