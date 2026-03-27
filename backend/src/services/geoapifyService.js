const axios = require('axios');
require('dotenv').config();

const API_KEY = process.env.GEOAPIFY_API_KEY;

/**
 * Fetches nearby amenities using Geoapify Places API
 * @param {number} lat - Latitude
 * @param {number} lon - Longitude
 * @param {number} radius - Search radius in meters (default 2000)
 */
exports.fetchAmenities = async (lat, lon, radius = 2000) => {
  try {
    // Define the categories we're interested in
    const categories = [
      'education.school',
      'healthcare.hospital',
      'transportation.bus',
      'commercial.supermarket',
      'leisure.park',
      'amenity.bank'
    ].join(',');

    const url = `https://api.geoapify.com/v2/places?categories=${categories}&filter=circle:${lon},${lat},${radius}&limit=20&apiKey=${API_KEY}`;
    
    const response = await axios.get(url);
    const features = response.data.features || [];

    // Process features into a structured format
    const processed = {
      schools: features.filter(f => f.properties.categories.includes('education.school')),
      hospitals: features.filter(f => f.properties.categories.includes('healthcare.hospital')),
      bus_stops: features.filter(f => f.properties.categories.includes('transportation.bus')),
      supermarkets: features.filter(f => f.properties.categories.includes('commercial.supermarket')),
      parks: features.filter(f => f.properties.categories.includes('leisure.park')),
      banks: features.filter(f => f.properties.categories.includes('amenity.bank'))
    };

    return {
      raw: features,
      counts: {
        schools: processed.schools.length,
        hospitals: processed.hospitals.length,
        bus_stops: processed.bus_stops.length,
        supermarkets: processed.supermarkets.length,
        parks: processed.parks.length,
        banks: processed.banks.length
      },
      distances: {
        nearest_school_m: getNearestDistance(processed.schools, lat, lon),
        nearest_hospital_m: getNearestDistance(processed.hospitals, lat, lon),
        nearest_bus_m: getNearestDistance(processed.bus_stops, lat, lon)
      }
    };
  } catch (err) {
    console.error('Geoapify fetch error:', err.response?.data || err.message);
    throw new Error('Failed to fetch amenities from Geoapify');
  }
};

const getNearestDistance = (features, lat, lon) => {
  if (features.length === 0) return null;
  // Geoapify returns distance in properties in some cases, or we can assume the result is sorted by distance
  return features[0].properties.distance || null;
};
