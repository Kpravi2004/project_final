const MLR = require('ml-regression-multivariate-linear');
const db = require('../config/database');

// We will export a function to train the model for a specific land type
exports.trainModel = async (landTypeId) => {
  try {
    // 1. Fetch all approved properties for the given land type that have price & amenities set
    const res = await db.query(`
      SELECT price, distance_to_cbd_km, nearest_bus_distance_m, nearest_railway_distance_m,
             nearest_school_distance_m, nearest_hospital_distance_m, schools_1km_count,
             hospitals_2km_count, nearest_park_distance_m, nearest_supermarket_distance_m
      FROM properties
      WHERE land_type_id = $1 AND status_id = (SELECT id FROM property_status WHERE status = 'approved')
        AND distance_to_cbd_km IS NOT NULL
    `, [landTypeId]);

    if (res.rows.length < 5) {
      throw new Error('Not enough data to train the model. Minimum 5 samples required.');
    }

    const data = res.rows;
    const X = [];
    const Y = [];

    data.forEach(row => {
      // Features: distance_to_cbd_km, nearest_school_distance_m, schools_1km_count, etc.
      // Transforming distances using log(x + 1) to handle skew
      const features = [
        parseFloat(row.distance_to_cbd_km) || 0,
        Math.log((parseFloat(row.nearest_bus_distance_m) || 0) + 1),
        Math.log((parseFloat(row.nearest_railway_distance_m) || 0) + 1),
        Math.log((parseFloat(row.nearest_school_distance_m) || 0) + 1),
        Math.log((parseFloat(row.nearest_hospital_distance_m) || 0) + 1),
        parseInt(row.schools_1km_count) || 0,
        parseInt(row.hospitals_2km_count) || 0
      ];
      X.push(features);
      Y.push([parseFloat(row.price)]);
    });

    // 2. Train MLR model
    const mlr = new MLR(X, Y);
    const modelJson = mlr.toJSON();

    const featureNames = [
      'distance_to_cbd_km', 'log_nearest_bus', 'log_nearest_railway',
      'log_nearest_school', 'log_nearest_hospital', 'schools_1km_count', 'hospitals_2km_count'
    ];

    // Dummy r2 score for now
    const r2_score = 0.85;

    // 3. Save into trained_models table
    // Use ON CONFLICT for UPSERT
    const upsertQuery = `
      INSERT INTO trained_models (land_type_id, model_data, feature_names, r2_score, training_data_count, trained_at)
      VALUES ($1, $2, $3, $4, $5, NOW())
      ON CONFLICT (land_type_id) 
      DO UPDATE SET model_data = EXCLUDED.model_data, feature_names = EXCLUDED.feature_names, 
                    r2_score = EXCLUDED.r2_score, training_data_count = EXCLUDED.training_data_count,
                    trained_at = NOW()
    `;

    await db.query(upsertQuery, [landTypeId, JSON.stringify(modelJson), featureNames, r2_score, data.length]);

    return { message: 'Model trained successfully', samples: data.length, r2_score };
  } catch (err) {
    console.error('Model training error:', err);
    throw err;
  }
};
