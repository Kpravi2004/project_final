import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useState, useEffect } from 'react';

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMyProperties = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/properties/my-properties');
        setProperties(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchMyProperties();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-3xl font-extrabold text-gray-900 mb-8">Welcome, {user?.name}</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="card p-8 flex flex-col justify-center items-center text-center">
          <h2 className="text-2xl font-bold mb-4 text-gray-800">Looking to Buy?</h2>
          <p className="text-gray-600 mb-6">Explore our curated list of verified properties with ML predicted valuation.</p>
          <Link to="/properties" className="btn-secondary py-3 px-8 text-lg w-full max-w-xs transition">Browse Properties</Link>
        </div>
        
        <div className="card p-8 flex flex-col justify-center items-center text-center border-t-4 border-blue-600">
          <h2 className="text-2xl font-bold mb-4 text-gray-800">Want to Sell?</h2>
          <p className="text-gray-600 mb-6">List your land, and let our system automatically attach accurate pricing and amenities data.</p>
          <Link to="/add-property" className="btn-primary py-3 px-8 text-lg w-full max-w-xs shadow-lg transition">Add New Property</Link>
        </div>
      </div>
      
      <div className="mt-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 border-b pb-4">My Properties</h2>
        
        {loading ? (
          <div className="p-10 text-center font-bold text-gray-500 italic">Loading your listings...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {properties.map(prop => (
              <div key={prop.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="font-bold text-lg truncate pr-2">{prop.title}</h3>
                    <span className={`text-[10px] font-black uppercase px-2 py-1 rounded-md ${
                      prop.status === 'approved' ? 'bg-emerald-100 text-emerald-700' :
                      prop.status === 'amenities_requested' ? 'bg-amber-100 text-amber-700 pulse' :
                      prop.status === 'rejected' ? 'bg-red-100 text-red-700' :
                      'bg-blue-100 text-blue-700'
                    }`}>
                      {prop.status.replace('_', ' ')}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mb-4">{prop.village}, {prop.district}</p>
                  
                  {prop.status === 'amenities_requested' && (
                    <div className="bg-amber-50 p-3 rounded-xl mb-4 text-xs font-medium text-amber-800 border border-amber-100">
                      <p className="font-bold uppercase text-[9px] mb-1">Action Required:</p>
                      <p className="italic">"{prop.amenities_request_note}"</p>
                      <Link 
                        to={`/dashboard/provide-amenities/${prop.id}`}
                        className="mt-3 inline-block bg-amber-500 text-white font-black px-4 py-2 rounded-lg text-center w-full uppercase tracking-tighter hover:bg-amber-600"
                      >
                        Provide Manual Details
                      </Link>
                    </div>
                  )}
                  
                  <div className="flex justify-between items-center text-sm font-bold border-t pt-4">
                    <span className="text-blue-600">₹{parseFloat(prop.price).toLocaleString()}</span>
                    <Link to={`/properties/${prop.id}`} className="text-gray-400 hover:text-blue-600 underline text-xs">View Listing</Link>
                  </div>
                </div>
              </div>
            ))}
            {properties.length === 0 && (
              <div className="col-span-full p-20 text-center bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
                <p className="text-gray-400 font-bold italic">You haven't listed any properties yet.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
