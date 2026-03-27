import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { Link } from 'react-router-dom';

const AdminPropertyList = () => {
  const { user } = useContext(AuthContext);
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [filters, setFilters] = useState({
    land_type_id: '',
    status: '',
    search: ''
  });

  useEffect(() => {
    fetchProperties();
  }, [filters]);

  const fetchProperties = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams(filters).toString();
      const res = await axios.get(`http://localhost:5000/api/admin/properties?${queryParams}`);
      setProperties(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to permanently delete this property?')) return;
    try {
      await axios.delete(`http://localhost:5000/api/admin/properties/${id}`);
      setProperties(properties.filter(p => p.id !== id));
    } catch (err) {
      alert('Error deleting property');
      console.error(err);
    }
  };

  const startEdit = (property) => {
    setEditingId(property.id);
    setEditForm({
      title: property.title,
      price: property.price,
      area: property.area,
      status: property.status
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({});
  };

  const handleEditChange = (e) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  const saveEdit = async (id) => {
    try {
      await axios.put(`http://localhost:5000/api/admin/properties/${id}`, {
        title: editForm.title,
        price: editForm.price,
        area: editForm.area,
      });
      alert('Property updated successfully');
      setEditingId(null);
      fetchProperties();
    } catch (err) {
      alert('Error updating property');
      console.error(err);
    }
  };

  if (user?.role !== 'admin') {
    return <div className="p-12 text-center text-2xl text-red-600 font-bold">Access Denied</div>;
  }

  return (
    <div className="bg-gray-50 min-h-screen py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 border-b pb-6 gap-6">
          <div>
             <h1 className="text-3xl font-extrabold text-gray-900">Inventory Management</h1>
             <p className="text-gray-500 mt-1 uppercase text-[10px] font-black tracking-widest">Total Active Records: {properties.length}</p>
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
             <input name="search" value={filters.search} onChange={handleFilterChange} className="px-4 py-2 bg-white border border-gray-200 rounded-full text-xs font-bold focus:ring-2 focus:ring-blue-500" placeholder="Search Title, Patta..." />
             <select name="land_type_id" value={filters.land_type_id} onChange={handleFilterChange} className="px-4 py-2 bg-white border border-gray-200 rounded-full text-xs font-bold cursor-pointer">
               <option value="">All Types</option>
               <option value="1">Agricultural</option>
               <option value="2">Residential</option>
             </select>
             <select name="status" value={filters.status} onChange={handleFilterChange} className="px-4 py-2 bg-white border border-gray-200 rounded-full text-xs font-bold cursor-pointer">
               <option value="">All Status</option>
               <option value="approved">Approved</option>
               <option value="pending">Pending</option>
               <option value="rejected">Rejected</option>
             </select>
             <Link to="/admin" className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-6 rounded-full shadow transition-all active:scale-95 text-xs">
               &larr; Review Queue
             </Link>
             <Link to="/add-property" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-full shadow-lg transition-all active:scale-95 text-xs">
               Upload Form
             </Link>
          </div>
        </div>
        
        {loading && properties.length === 0 ? (
           <div className="flex justify-center p-20"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div></div>
        ) : (
          <div className="bg-white shadow overflow-x-auto rounded-[2rem] border border-gray-100 p-2">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50 uppercase text-[10px] font-black tracking-widest text-gray-500">
                <tr>
                  <th scope="col" className="px-6 py-4 text-left">ID & Title</th>
                  <th scope="col" className="px-6 py-4 text-left">Type</th>
                  <th scope="col" className="px-6 py-4 text-left">Price (₹)</th>
                  <th scope="col" className="px-6 py-4 text-left">Area</th>
                  <th scope="col" className="px-6 py-4 text-left">Status</th>
                  <th scope="col" className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {properties.map(p => (
                  <tr key={p.id} className="hover:bg-blue-50/50 transition-colors">
                    <td className="px-6 py-4 font-bold text-gray-900">
                      <div className="flex flex-col">
                        <span className="text-xs text-blue-500">#{p.id}</span>
                        {editingId === p.id ? (
                           <input name="title" value={editForm.title} onChange={handleEditChange} className="border border-blue-300 rounded px-2 py-1 mt-1 text-sm bg-white" />
                        ) : (
                           <span className="truncate max-w-xs">{p.title}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 font-black uppercase tracking-widest">
                       {p.land_type_name}
                    </td>
                    <td className="px-6 py-4 text-sm font-mono text-gray-900 font-bold">
                       {editingId === p.id ? (
                           <input type="number" name="price" value={editForm.price} onChange={handleEditChange} className="border border-blue-300 rounded px-2 py-1 bg-white w-24" />
                       ) : (
                           `₹${parseFloat(p.price).toLocaleString('en-IN')}`
                       )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 font-bold">
                       {editingId === p.id ? (
                           <input type="number" step="0.01" name="area" value={editForm.area} onChange={handleEditChange} className="border border-blue-300 rounded px-2 py-1 bg-white w-20" />
                       ) : (
                           `${p.area} ${p.land_type_id === 1 ? 'Ac' : 'SqFt'}`
                       )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 inline-flex text-[10px] leading-5 font-black uppercase tracking-widest rounded-full ${p.status === 'approved' ? 'bg-emerald-100 text-emerald-800' : p.status === 'pending' ? 'bg-amber-100 text-amber-800' : p.status === 'rejected' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'}`}>
                        {p.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {editingId === p.id ? (
                        <>
                          <button onClick={() => saveEdit(p.id)} className="text-emerald-600 hover:text-emerald-900 mx-2 font-black uppercase text-[10px] tracking-widest">Save</button>
                          <button onClick={cancelEdit} className="text-gray-500 hover:text-gray-700 font-black uppercase text-[10px] tracking-widest">Cancel</button>
                        </>
                      ) : (
                        <>
                          <button onClick={() => startEdit(p)} className="text-blue-600 hover:text-blue-900 mx-2 font-black uppercase text-[10px] tracking-widest">Edit</button>
                          <button onClick={() => handleDelete(p.id)} className="text-red-600 hover:text-red-900 font-black uppercase text-[10px] tracking-widest">Delete</button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {properties.length === 0 && (
              <div className="py-12 text-center text-gray-400 font-bold">No properties found in system.</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPropertyList;
