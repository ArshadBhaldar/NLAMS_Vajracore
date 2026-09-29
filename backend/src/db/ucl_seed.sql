-- ============================================================================
-- VajraBhoomi UCL Module: Mock Data Seed
-- Real Pune urban parcels linking spatial boundaries to CTS numbers & property cards
-- Coordinates are in EPSG:4326 (longitude latitude)
-- Includes Ganesh Patil (Citizen Landowner) for seamless end-to-end integration!
-- ============================================================================

DELETE FROM city_survey_plots WHERE ulpin IN (
    'MH1234567890',
    'MH270100456789',
    'MH270100456790',
    'MH270100456791',
    'MH270100456792'
);

INSERT INTO city_survey_plots (
    ulpin,
    owner_name,
    cts_number,
    property_card_url,
    geometry,
    litigation_flag,
    area_sqm,
    ward,
    zone_classification,
    encroachment_risk
) VALUES
(
    'MH1234567890',
    'Ganesh Patil (Khatedar Landowner)',
    'CTS-1203/P',
    'https://vajrabhoomi-cadastral-docs.s3.ap-south-1.amazonaws.com/property_cards/MH1234567890_card.pdf',
    ST_SetSRID(ST_PolygonFromText('POLYGON((73.8370 18.5160, 73.8385 18.5160, 73.8385 18.5175, 73.8370 18.5175, 73.8370 18.5160))'), 4326),
    FALSE,
    12000.00,
    'Shivajinagar - Deccan Ward 04',
    'Agricultural / Prime Corridor Footprint',
    'Low'
),
(
    'MH270100456789',
    'Kulkarni Enterprises & Brothers Pvt Ltd',
    'CTS-1204/A',
    'https://vajrabhoomi-cadastral-docs.s3.ap-south-1.amazonaws.com/property_cards/MH270100456789_card.pdf',
    ST_SetSRID(ST_PolygonFromText('POLYGON((73.8390 18.5160, 73.8405 18.5160, 73.8405 18.5175, 73.8390 18.5175, 73.8390 18.5160))'), 4326),
    FALSE,
    2450.50,
    'Shivajinagar - Deccan Ward 04',
    'Commercial - Grade A',
    'Low'
),
(
    'MH270100456790',
    'Deshmukh Heritage Estate (Disputed Heirs)',
    'CTS-1205/B',
    'https://vajrabhoomi-cadastral-docs.s3.ap-south-1.amazonaws.com/property_cards/MH270100456790_card.pdf',
    ST_SetSRID(ST_PolygonFromText('POLYGON((73.8410 18.5160, 73.8425 18.5160, 73.8425 18.5175, 73.8410 18.5175, 73.8410 18.5160))'), 4326),
    TRUE,
    1890.75,
    'Shivajinagar - Deccan Ward 04',
    'Mixed Residential & Commercial',
    'High (Civil Suit 482/2023)'
),
(
    'MH270100456791',
    'Pune Municipal Metro Transport Corp',
    'CTS-1206/C',
    'https://vajrabhoomi-cadastral-docs.s3.ap-south-1.amazonaws.com/property_cards/MH270100456791_card.pdf',
    ST_SetSRID(ST_PolygonFromText('POLYGON((73.8390 18.5180, 73.8410 18.5180, 73.8410 18.5195, 73.8390 18.5195, 73.8390 18.5180))'), 4326),
    FALSE,
    3120.00,
    'Shivajinagar - Deccan Ward 04',
    'Public Infrastructure / Transport Hub',
    'Low'
),
(
    'MH270100456792',
    'Shinde Commercial Complex & Mall LLP',
    'CTS-1207/D',
    'https://vajrabhoomi-cadastral-docs.s3.ap-south-1.amazonaws.com/property_cards/MH270100456792_card.pdf',
    ST_SetSRID(ST_PolygonFromText('POLYGON((73.8415 18.5180, 73.8430 18.5180, 73.8430 18.5195, 73.8415 18.5195, 73.8415 18.5180))'), 4326),
    FALSE,
    1680.25,
    'Shivajinagar - Deccan Ward 04',
    'Commercial Retail Hub',
    'Low'
);
