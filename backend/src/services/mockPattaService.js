const db = require('../config/database');

exports.getPattaDetails = async (pattaNumber) => {
  try {
    const result = await db.query('SELECT * FROM mock_patta WHERE patta_number = $1', [pattaNumber]);
    if (result.rows.length === 0) return null;
    return result.rows[0];
  } catch (error) {
    console.error('Error fetching mock patta details:', error);
    throw error;
  }
};

exports.generateFallbackAmenities = (lat, lng, landTypeId) => {
  // A simple fallback generator to provide dummy amenities if real ones fail.
  return {
    distance_to_cbd_km: Math.floor(Math.random() * 15) + 10,
    nearest_bus_distance_m: Math.floor(Math.random() * 3000) + 500,
    nearest_railway_distance_m: Math.floor(Math.random() * 15000) + 5000,
    nearest_school_distance_m: Math.floor(Math.random() * 4000) + 1000,
    nearest_hospital_distance_m: Math.floor(Math.random() * 8000) + 2000,
    nearest_park_distance_m: Math.floor(Math.random() * 5000) + 1000,
    nearest_supermarket_distance_m: Math.floor(Math.random() * 7000) + 2000,
    schools_1km_count: Math.floor(Math.random() * 2),
    bus_stops_1km_count: Math.floor(Math.random() * 2),
    hospitals_2km_count: 0,
    restaurants_1km_count: Math.floor(Math.random() * 2),
    banks_1km_count: Math.floor(Math.random() * 2),
    water_bodies_1km_count: landTypeId === 1 ? Math.floor(Math.random() * 3) : 0,
    nearest_water_body_distance_m: landTypeId === 1 ? Math.floor(Math.random() * 2000) + 100 : null,
    amenities_data: { source: 'mock_fallback', lat, lng }
  };
};
