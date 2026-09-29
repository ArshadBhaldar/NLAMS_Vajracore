-- ============================================================================
-- VajraBhoomi: Urban Cadastral Linkage (UCL) Module Schema
-- Links spatial City Survey map polygons with textual Property Cards using
-- the ULPIN (Unique Land Parcel Identification Number) as the primary key.
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

CREATE TABLE IF NOT EXISTS city_survey_plots (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ulpin VARCHAR(14) NOT NULL UNIQUE,
    owner_name VARCHAR(255) NOT NULL,
    cts_number VARCHAR(50) NOT NULL,
    property_card_url TEXT,
    geometry GEOMETRY(Polygon, 4326) NOT NULL,
    litigation_flag BOOLEAN NOT NULL DEFAULT FALSE,
    area_sqm NUMERIC(12, 2),
    ward VARCHAR(100),
    zone_classification VARCHAR(100) DEFAULT 'Commercial / Mixed Use',
    encroachment_risk VARCHAR(50) DEFAULT 'Low',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Spatial GIST index for fast spatial queries & bounding box intersections
CREATE INDEX IF NOT EXISTS idx_city_survey_plots_geom ON city_survey_plots USING GIST (geometry);

-- B-Tree indexes for fast point lookups
CREATE INDEX IF NOT EXISTS idx_city_survey_plots_ulpin ON city_survey_plots (ulpin);
CREATE INDEX IF NOT EXISTS idx_city_survey_plots_cts ON city_survey_plots (cts_number);
CREATE INDEX IF NOT EXISTS idx_city_survey_plots_litigation ON city_survey_plots (litigation_flag);
