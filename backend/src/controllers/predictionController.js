const db = require('../config/database');

const AMENITY_CREDITS = {
  school: { base: 50000, max_dist: 2000 },
  hospital: { base: 60000, max_dist: 3000 },
  bus_stop: { base: 20000, max_dist: 1000 },
  supermarket: { base: 15000, max_dist: 1500 },
  park: { base: 10000, max_dist: 2000 },
  bank: { base: 15000, max_dist: 1000 }
};

exports.predictPrice = async (req, res) => {
  try {
    const { property_id, amenities_data } = req.body;
    
    // Get property
    const propRes = await db.query('SELECT * FROM properties WHERE id = $1', [property_id]);
    if (propRes.rows.length === 0) return res.status(404).json({ message: 'Property not found' });
    const property = propRes.rows[0];

    // Use passed amenities_data or fallback to property.amenities_data
    const data = amenities_data || property.amenities_data || { counts: {}, distances: {} };
    const counts = data.counts || {};
    const distances = data.distances || {};

    let totalAmenityCredit = 0;
    const creditsBreakdown = {};

    for (const [key, config] of Object.entries(AMENITY_CREDITS)) {
      const count = counts[key + 's'] || 0; // naming convention in geoapifyService: schools, hospitals...
      const distMatch = key === 'school' ? 'nearest_school_m' : 
                        key === 'hospital' ? 'nearest_hospital_m' : 
                        key === 'bus_stop' ? 'nearest_bus_m' : null;
      
      const dist = distances[distMatch] || config.max_dist;
      
      // Calculate credit: Base * count * (1 - distance/max_dist)
      // If distance > max_dist, credit for that amenity type is 0
      const distanceFactor = Math.max(0, 1 - (dist / config.max_dist));
      const credit = config.base * count * distanceFactor;
      
      totalAmenityCredit += credit;
      creditsBreakdown[key] = credit;
    }

    // Combine with current price
    // Usually, amenities add a value proportional to the area or land type
    // But as per user: "predict the prices based on the amenties... also consiter the current price"
    // We'll treat the current price as a base and add the amenity bonus
    const predictedPrice = parseFloat(property.price) + totalAmenityCredit;

    res.json({ 
      predicted_price: predictedPrice, 
      original_price: property.price,
      amenity_bonus: totalAmenityCredit,
      breakdown: creditsBreakdown
    });
  } catch (err) {
    console.error('predictPrice error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.trainModels = async (req, res) => {
  res.status(200).json({ message: 'Dynamic credit-based prediction is active. Traditional training not required.' });
};
