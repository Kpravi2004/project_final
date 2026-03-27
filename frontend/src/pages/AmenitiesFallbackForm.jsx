import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const AmenitiesFallbackForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [amenities, setAmenities] = useState({
    counts: {
      schools: 0,
      hospitals: 0,
      bus_stops: 0,
      banks: 0,
      supermarkets: 0,
      parks: 0
    },
    distances: {
      nearest_school_m: 5000,
      nearest_hospital_m: 5000,
      nearest_bus_m: 5000,
      nearest_bank_m: 5000,
      nearest_supermarket_m: 5000,
      nearest_park_m: 5000
    }
  });

  useEffect(() => {
    const fetchProperty = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/properties/${id}`);
        setProperty(res.data);
      } catch (err) {
        console.error(err);
        alert('Failed to fetch property details');
      } finally {
        setLoading(false);
      }
    };
    fetchProperty();
  }, [id]);

  const handleCountChange = (e) => {
    const { name, value } = e.target;
    setAmenities(prev => ({
      ...prev,
      counts: { ...prev.counts, [name]: parseInt(value) || 0 }
    }));
  };

  const handleDistanceChange = (e) => {
    const { name, value } = e.target;
    setAmenities(prev => ({
      ...prev,
      distances: { ...prev.distances, [name]: parseInt(value) || 0 }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      await axios.post(`http://localhost:5000/api/properties/${id}/submit-amenities`, { amenities });
      alert('Amenities submitted successfully! Your property is now pending review again.');
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
      alert('Failed to submit amenities');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="p-20 text-center font-bold">Loading Property Details...</div>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
        <h1 className="text-3xl font-black text-gray-900 mb-2">Provide Amenity Details</h1>
        <p className="text-gray-500 font-bold mb-8 uppercase text-xs tracking-widest">Property ID: #{id} | {property?.title}</p>

        {property?.amenities_request_note && (
          <div className="bg-amber-50 border border-amber-100 p-6 rounded-2xl mb-10">
            <h4 className="text-amber-900 font-black mb-2 uppercase text-[10px] tracking-widest">Admin Note:</h4>
            <p className="text-amber-800 font-medium italic">"{property.amenities_request_note}"</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-12">
          {/* Counts Section */}
          <section>
            <h2 className="text-xl font-black text-gray-800 mb-6 border-b pb-2">Facility Counts (within ~1-2km)</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              {Object.keys(amenities.counts).map(key => (
                <div key={key}>
                  <label className="block text-[10px] font-black text-gray-400 uppercase mb-2 tracking-widest">
                    {key.replace('_', ' ')}
                  </label>
                  <input
                    type="number"
                    name={key}
                    value={amenities.counts[key]}
                    onChange={handleCountChange}
                    min="0"
                    className="w-full bg-gray-50 border border-gray-100 rounded-xl p-3 font-bold focus:ring-2 focus:ring-blue-500 outline-none"
                    required
                  />
                </div>
              ))}
            </div>
          </section>

          {/* Distances Section */}
          <section>
            <h2 className="text-xl font-black text-gray-800 mb-6 border-b pb-2">Approximate Distances (in meters)</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {Object.keys(amenities.distances).map(key => (
                <div key={key}>
                  <label className="block text-[10px] font-black text-gray-400 uppercase mb-2 tracking-widest">
                    Distance to nearest {key.split('_')[1]}
                  </label>
                  <div className="flex items-center space-x-4">
                    <input
                      type="range"
                      name={key}
                      min="100"
                      max="10000"
                      step="100"
                      value={amenities.distances[key]}
                      onChange={handleDistanceChange}
                      className="flex-grow h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                    />
                    <span className="w-20 text-right font-black text-blue-600 font-mono">{amenities.distances[key]}m</span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <div className="pt-10 flex gap-4">
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-black py-4 rounded-2xl shadow-2xl transition-all active:scale-95 disabled:opacity-50"
            >
              {submitting ? 'SUBMITTING...' : 'SUBMIT DATA FOR REVIEW'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="bg-gray-100 text-gray-500 font-bold px-8 rounded-2xl hover:bg-gray-200"
            >
              CANCEL
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AmenitiesFallbackForm;
