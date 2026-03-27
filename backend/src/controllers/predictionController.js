const db = require('../config/database');
const MLR = require('ml-regression-multivariate-linear');

// Amenity credits (same as before)
const AMENITY_CREDITS = {
  school: { base: 50000, max_dist: 2000 },
  hospital: { base: 60000, max_dist: 3000 },
  bus_stop: { base: 20000, max_dist: 1000 },
  supermarket: { base: 15000, max_dist: 1500 },
  park: { base: 10000, max_dist: 2000 },
  bank: { base: 15000, max_dist: 1000 }
};

/**
 * Helper: Load MLR model for a land type from trained_models table.
 */
async function loadModel(landTypeId) {
  const res = await db.query(
    'SELECT model_data FROM trained_models WHERE land_type_id = $1 AND model_data IS NOT NULL',
    [landTypeId]
  );
  if (res.rows.length === 0) return null;
  return MLR.load(res.rows[0].model_data);
}

/**
 * Helper: Compute credit‑based price.
 */
function computeCreditPrediction(property, amenitiesData) {
  const counts = amenitiesData?.counts || {};
  const distances = amenitiesData?.distances || {};
  let totalBonus = 0;
  const breakdown = {};

  for (const [key, config] of Object.entries(AMENITY_CREDITS)) {
    const count = counts[key + 's'] || 0;
    let distance = Infinity;
    if (key === 'school') distance = distances.nearest_school_m || config.max_dist;
    else if (key === 'hospital') distance = distances.nearest_hospital_m || config.max_dist;
    else if (key === 'bus_stop') distance = distances.nearest_bus_m || config.max_dist;
    else if (key === 'supermarket') distance = distances.nearest_supermarket_m || config.max_dist;
    else if (key === 'park') distance = distances.nearest_park_m || config.max_dist;
    else if (key === 'bank') distance = distances.nearest_bank_m || config.max_dist;

    const distanceFactor = Math.max(0, 1 - (distance / config.max_dist));
    const bonus = config.base * count * distanceFactor;
    totalBonus += bonus;
    breakdown[key] = bonus;
  }
  return {
    predicted_price: parseFloat(property.price) + totalBonus,
    original_price: property.price,
    amenity_bonus: totalBonus,
    breakdown
  };
}

/**
 * Helper: Estimate annual appreciation from price_history.
 */
async function getAnnualAppreciation(propertyId, district = null) {
  // First try property’s own history
  const ownHistory = await db.query(`
    SELECT recorded_date, price FROM price_history
    WHERE property_id = $1
    ORDER BY recorded_date
  `, [propertyId]);

  if (ownHistory.rows.length >= 2) {
    let totalRate = 0;
    let count = 0;
    for (let i = 1; i < ownHistory.rows.length; i++) {
      const prev = ownHistory.rows[i - 1];
      const curr = ownHistory.rows[i];
      const years = (new Date(curr.recorded_date) - new Date(prev.recorded_date)) / (365 * 24 * 60 * 60 * 1000);
      if (years > 0) {
        const rate = (curr.price / prev.price) - 1;
        totalRate += rate / years;
        count++;
      }
    }
    if (count > 0) return totalRate / count;
  }

  // Fallback: district‑level average (if district provided)
  if (district) {
    const districtAvg = await db.query(`
      SELECT AVG(ph.price / p.price - 1) as avg_rate
      FROM price_history ph
      JOIN properties p ON ph.property_id = p.id
      WHERE p.district = $1 AND p.created_at < ph.recorded_date
    `, [district]);
    if (districtAvg.rows[0].avg_rate) return parseFloat(districtAvg.rows[0].avg_rate);
  }

  // Default 5%
  return 0.05;
}

/**
 * POST /api/predict
 * Predict price for a property. If target_year is provided, use MLR model or appreciation.
 */
exports.predictPrice = async (req, res) => {
  try {
    const { property_id, target_year } = req.body;
    if (!property_id) return res.status(400).json({ message: 'property_id required' });

    // 1. Get property
    const propRes = await db.query('SELECT * FROM properties WHERE id = $1', [property_id]);
    if (propRes.rows.length === 0) return res.status(404).json({ message: 'Property not found' });
    const property = propRes.rows[0];

    // 2. Get amenities data (either stored or from property.amenities_data)
    let amenitiesData = property.amenities_data;
    if (!amenitiesData && property.location) {
      // Optionally fetch live from Geoapify – but we assume stored
      // For simplicity, we use stored or null.
    }

    // 3. If target_year is given, try to use MLR model
    if (target_year) {
      const model = await loadModel(property.land_type_id);
      if (model) {
        // Build feature vector for current property (must match training)
        // Feature order must be the same as in training. We'll define it.
        // For now, we use a placeholder – we'll implement in training.
        const features = await buildFeatureVector(property, amenitiesData, target_year);
        const pred = model.predict([features]);
        const predicted_price = pred[0];
        return res.json({
          predicted_price,
          original_price: property.price,
          target_year,
          model_used: 'mlr'
        });
      }
    }

    // 4. Fallback: credit‑based prediction for current year, then apply appreciation
    const creditPred = computeCreditPrediction(property, amenitiesData);
    if (!target_year) {
      return res.json(creditPred);
    }

    // For future year, use appreciation rate
    const annualRate = await getAnnualAppreciation(property_id, property.district);
    const currentYear = new Date().getFullYear();
    const years = target_year - currentYear;
    const futurePrice = creditPred.predicted_price * Math.pow(1 + annualRate, years);

    return res.json({
      predicted_price: futurePrice,
      original_price: property.price,
      current_predicted: creditPred.predicted_price,
      target_year,
      annual_growth_rate: annualRate,
      model_used: 'credit_with_appreciation'
    });

  } catch (err) {
    console.error('predictPrice error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Admin endpoint: train MLR model for a land type using price history.
 * POST /api/admin/train/price-model
 * Body: { land_type_id }
 */
exports.trainPriceModel = async (req, res) => {
  try {
    const { land_type_id } = req.body;
    if (!land_type_id) return res.status(400).json({ message: 'land_type_id required' });

    // Fetch training data: price_history joined with properties
    const data = await db.query(`
      SELECT
        ph.price,
        ph.recorded_year,
        p.area,
        p.distance_to_cbd_km,
        p.nearest_bus_distance_m,
        p.nearest_railway_distance_m,
        p.nearest_school_distance_m,
        p.nearest_hospital_distance_m,
        p.schools_1km_count,
        p.hospitals_2km_count,
        p.banks_1km_count,
        p.restaurants_1km_count,
        p.water_bodies_1km_count,
        p.plot_shape,
        p.road_width,
        p.facing,
        p.soil_type,
        p.irrigation_type,
        p.tree_type
      FROM price_history ph
      JOIN properties p ON ph.property_id = p.id
      WHERE p.land_type_id = $1
        AND ph.price IS NOT NULL
        AND p.distance_to_cbd_km IS NOT NULL
        AND p.area IS NOT NULL
      LIMIT 5000
    `, [land_type_id]);

    if (data.rows.length < 20) {
      return res.status(400).json({ message: 'Insufficient data for training' });
    }

    // Build feature matrix X and target Y
    const X = [];
    const Y = [];

    for (const row of data.rows) {
      const features = [
        parseFloat(row.area) || 0,
        parseFloat(row.distance_to_cbd_km) || 0,
        Math.log((parseFloat(row.nearest_bus_distance_m) || 0) + 1),
        Math.log((parseFloat(row.nearest_railway_distance_m) || 0) + 1),
        Math.log((parseFloat(row.nearest_school_distance_m) || 0) + 1),
        Math.log((parseFloat(row.nearest_hospital_distance_m) || 0) + 1),
        row.schools_1km_count || 0,
        row.hospitals_2km_count || 0,
        row.banks_1km_count || 0,
        row.restaurants_1km_count || 0,
        row.water_bodies_1km_count || 0,
        row.recorded_year || new Date().getFullYear()
      ];
      // Optional: encode categorical features (plot_shape, soil_type, etc.) – omitted for brevity
      X.push(features);
      Y.push([parseFloat(row.price)]);
    }

    // Normalise features
    const means = [];
    const stds = [];
    for (let i = 0; i < X[0].length; i++) {
      const values = X.map(row => row[i]);
      const mean = values.reduce((a, b) => a + b, 0) / values.length;
      const std = Math.sqrt(values.map(v => Math.pow(v - mean, 2)).reduce((a, b) => a + b, 0) / (values.length - 1)) || 1;
      means.push(mean);
      stds.push(std);
    }
    const Xnorm = X.map(row => row.map((val, i) => (val - means[i]) / stds[i]));

    // Normalise Y
    const priceMean = Y.reduce((a, b) => a + b[0], 0) / Y.length;
    const priceStd = Math.sqrt(Y.map(p => Math.pow(p[0] - priceMean, 2)).reduce((a, b) => a + b, 0) / (Y.length - 1)) || 1;
    const Ynorm = Y.map(p => [(p[0] - priceMean) / priceStd]);

    // Train model
    const mlr = new MLR(Xnorm, Ynorm);
    const modelJson = mlr.toJSON();
    const featureNames = [
      'area', 'distance_to_cbd_km', 'log_bus_dist', 'log_rail_dist',
      'log_school_dist', 'log_hospital_dist', 'schools_count',
      'hospitals_count', 'banks_count', 'restaurants_count', 'water_bodies_count', 'year'
    ];

    // Save model
    const upsertQuery = `
      INSERT INTO trained_models (land_type_id, model_data, feature_names, stats, r2_score, training_data_count, trained_at)
      VALUES ($1, $2, $3, $4, $5, $6, NOW())
      ON CONFLICT (land_type_id) DO UPDATE
      SET model_data = EXCLUDED.model_data,
          feature_names = EXCLUDED.feature_names,
          stats = EXCLUDED.stats,
          r2_score = EXCLUDED.r2_score,
          training_data_count = EXCLUDED.training_data_count,
          trained_at = NOW()
    `;
    const stats = { means, stds, priceMean, priceStd };
    await db.query(upsertQuery, [land_type_id, JSON.stringify(modelJson), featureNames, JSON.stringify(stats), 0.0, data.rows.length]);

    res.json({ message: 'Model trained successfully', samples: data.rows.length });
  } catch (err) {
    console.error('Train model error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};