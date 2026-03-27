import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const AddProperty = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    title: '', description: '', land_type_id: 1, price: '', area: '', 
    address: '', city: '', district: '', state: 'Tamil Nadu', 
    patta_number: '', survey_number: '', village: '', taluk: '',
    // Residential fields
    plot_shape: '', road_width: '', facing: '', water_connection: false, electricity_connection: false, approval_status: '',
    approval_number: '', gated_community: false, corner_plot: false, landmarks: '',
    // Agricultural fields
    soil_type: '', water_availability: false, irrigation_type: '', electricity_available: false, tree_type: '', tree_stage: '',
    soil_depth: '', road_access_type: '', distance_from_highway: '', fencing_details: ''
  });
  const [media, setMedia] = useState([]);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ 
      ...formData, 
      [name]: type === 'checkbox' ? checked : (name === 'land_type_id' || name === 'price' || name === 'area' || name === 'road_width' || name === 'soil_depth' || name === 'distance_from_highway' ? (value === '' ? '' : parseFloat(value)) : value)
    });
  };

  const handleMediaChange = (e) => {
    const files = Array.from(e.target.files);
    const newMedia = files.map(file => ({
      file,
      preview: URL.createObjectURL(file),
      type: file.type.startsWith('video') ? 'video' : 'image'
    }));
    setMedia([...media, ...newMedia]);
  };

  const removeMedia = (index) => {
    const updated = [...media];
    updated.splice(index, 1);
    setMedia(updated);
  };

  const nextStep = () => setStep(step + 1);
  const prevStep = () => setStep(step - 1);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const finalData = { ...formData, media_count: media.length };
      await axios.post('http://localhost:5000/api/properties', finalData);
      alert('Property listed successfully and pending admin verification.');
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
      alert('Error adding property');
    }
  };

  const renderStepper = () => (
    <div className="flex items-center justify-center mb-12">
      {[1, 2, 3].map((s) => (
        <React.Fragment key={s}>
          <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black transition-all ${step >= s ? 'bg-blue-600 text-white shadow-lg scale-110' : 'bg-gray-200 text-gray-400'}`}>
            {s}
          </div>
          {s < 3 && <div className={`h-1 w-16 mx-2 transition-all ${step > s ? 'bg-blue-600' : 'bg-gray-200'}`}></div>}
        </React.Fragment>
      ))}
    </div>
  );

  return (
    <div className="bg-gray-100 min-h-screen py-16 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-[3rem] shadow-2xl p-10 md:p-16 border border-gray-100 overflow-hidden relative">
          <div className="absolute top-0 left-0 w-full h-2 bg-gray-100">
             <div className="h-full bg-blue-600 transition-all duration-500" style={{ width: `${(step / 3) * 100}%` }}></div>
          </div>
          
          <div className="mb-10 text-center">
            <h2 className="text-4xl font-black text-gray-900 mb-3 tracking-tight">
              {step === 1 && "Common Property Data"}
              {step === 2 && (formData.land_type_id === 1 ? "Agricultural Details" : "Residential Details")}
              {step === 3 && "Media & Final Submission"}
            </h2>
            <p className="text-gray-500 font-medium">Phase {step} of 3: Provide high-fidelity information.</p>
          </div>

          {renderStepper()}
          
          <form onSubmit={handleSubmit} className="space-y-8">
            {step === 1 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="col-span-1 md:col-span-2">
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Listing Title</label>
                  <input name="title" value={formData.title} required className="block w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-gray-900 font-bold" placeholder="e.g., Highway-Facing Commercial Plot" onChange={handleChange} />
                </div>
                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Category</label>
                  <select name="land_type_id" value={formData.land_type_id} className="block w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-gray-900 font-bold appearance-none cursor-pointer" onChange={handleChange}>
                    <option value={1}>Agricultural</option>
                    <option value={2}>Residential</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Price (₹)</label>
                  <input type="number" name="price" value={formData.price} required className="block w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-gray-900 font-bold" placeholder="5000000" onChange={handleChange} />
                </div>
                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Area ({formData.land_type_id === 1 ? 'Acres' : 'Sq Ft'})</label>
                  <input type="number" step="0.01" name="area" value={formData.area} required className="block w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-gray-900 font-bold" placeholder="2.5" onChange={handleChange} />
                </div>
                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Survey Number</label>
                  <input name="survey_number" value={formData.survey_number} required className="block w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-gray-900 font-bold" placeholder="123/4" onChange={handleChange} />
                </div>
                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Village</label>
                  <input name="village" value={formData.village} required className="block w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-gray-900 font-bold" onChange={handleChange} />
                </div>
                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Taluk</label>
                  <input name="taluk" value={formData.taluk} required className="block w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-gray-900 font-bold" onChange={handleChange} />
                </div>
                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">District</label>
                  <input name="district" value={formData.district} required className="block w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-gray-900 font-bold" onChange={handleChange} />
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                {formData.land_type_id === 2 ? (
                  <>
                    <div>
                       <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Plot Shape</label>
                       <select name="plot_shape" value={formData.plot_shape} className="block w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-gray-900 font-bold shadow-sm" onChange={handleChange}>
                         <option value="">Select Shape</option>
                         <option value="Square">Square</option>
                         <option value="Rectangle">Rectangle</option>
                         <option value="L-Shape">L-Shape</option>
                       </select>
                    </div>
                    <div>
                       <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Approval Number</label>
                       <input name="approval_number" value={formData.approval_number} className="block w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-gray-900 font-bold" placeholder="DTCP/CMDA #" onChange={handleChange} />
                    </div>
                    <div>
                      <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Road Width (ft)</label>
                      <input type="number" name="road_width" value={formData.road_width} className="block w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-gray-900 font-bold shadow-sm" placeholder="30" onChange={handleChange} />
                    </div>
                    <div>
                      <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Facing Direction</label>
                      <select name="facing" value={formData.facing} className="block w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-gray-900 font-bold shadow-sm" onChange={handleChange}>
                        <option value="">Select Facing</option>
                        <option value="North">North</option>
                        <option value="South">South</option>
                        <option value="East">East</option>
                        <option value="West">West</option>
                      </select>
                    </div>
                    <div className="flex items-center space-x-4 p-5 bg-blue-50 rounded-[2rem] border border-blue-100">
                      <input type="checkbox" name="corner_plot" checked={formData.corner_plot} className="w-6 h-6 rounded accent-blue-600" onChange={handleChange} />
                      <label className="text-xs font-black text-blue-900 uppercase">Corner Plot</label>
                    </div>
                    <div className="flex items-center space-x-4 p-5 bg-emerald-50 rounded-[2rem] border border-emerald-100">
                      <input type="checkbox" name="gated_community" checked={formData.gated_community} className="w-6 h-6 rounded accent-emerald-600" onChange={handleChange} />
                      <label className="text-xs font-black text-emerald-900 uppercase">Gated Community</label>
                    </div>
                    <div className="col-span-1 md:col-span-2">
                       <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Nearby Landmarks</label>
                       <input name="landmarks" value={formData.landmarks} className="block w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-gray-900 font-bold" placeholder="e.g., Near Apollo Hospital, 2km from Metro" onChange={handleChange} />
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Soil Type</label>
                      <select name="soil_type" value={formData.soil_type} className="block w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-gray-900 font-bold shadow-sm" onChange={handleChange}>
                        <option value="">Select Soil</option>
                        <option value="Red Soil">Red Soil</option>
                        <option value="Black Soil">Black Soil</option>
                        <option value="Clay">Clay</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Soil Depth (ft)</label>
                      <input type="number" name="soil_depth" value={formData.soil_depth} className="block w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-gray-900 font-bold" placeholder="5" onChange={handleChange} />
                    </div>
                    <div>
                      <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Road Access</label>
                      <select name="road_access_type" value={formData.road_access_type} className="block w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-gray-900 font-bold shadow-sm" onChange={handleChange}>
                        <option value="">Select Road Type</option>
                        <option value="Tar Road">Tar Road</option>
                        <option value="Gravel Road">Gravel Road</option>
                        <option value="Mud Road">Mud Road</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Highway Distance (km)</label>
                      <input type="number" name="distance_from_highway" value={formData.distance_from_highway} className="block w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-gray-900 font-bold shadow-sm" placeholder="2.5" onChange={handleChange} />
                    </div>
                    <div className="col-span-1 md:col-span-2">
                       <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Fencing Details</label>
                       <input name="fencing_details" value={formData.fencing_details} className="block w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-gray-900 font-bold" placeholder="e.g., Stone fence, Barbed wire" onChange={handleChange} />
                    </div>
                  </>
                )}
                <div className="col-span-1 md:col-span-2">
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Narrative Description</label>
                  <textarea name="description" value={formData.description} rows="4" required className="block w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-gray-900 font-medium" placeholder="Describe unique features..." onChange={handleChange}></textarea>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="border-4 border-dashed border-gray-100 rounded-[3rem] p-12 text-center bg-gray-50/50 hover:bg-white hover:border-blue-200 transition-all group relative">
                  <input type="file" multiple accept="image/*,video/*" onChange={handleMediaChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                  <div className="w-20 h-20 bg-blue-100 rounded-3xl flex items-center justify-center mx-auto mb-6 text-blue-600 group-hover:scale-110 transition-transform">
                    <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                  </div>
                  <h3 className="text-2xl font-black text-gray-900 mb-2">Upload Visual Assets</h3>
                  <p className="text-gray-500 font-medium">Drag and drop high-quality photos or property walkthrough videos.</p>
                  <p className="mt-4 text-[10px] font-black uppercase text-blue-600 tracking-widest bg-blue-50 inline-block px-4 py-1 rounded-full">MAX 10 FILES • JPG/PNG/MP4</p>
                </div>

                {media.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {media.map((m, i) => (
                      <div key={i} className="relative aspect-square rounded-2xl overflow-hidden border border-gray-100 shadow-sm group">
                        {m.type === 'video' ? (
                          <video src={m.preview} className="w-full h-full object-cover" />
                        ) : (
                          <img src={m.preview} alt="Upload" className="w-full h-full object-cover" />
                        )}
                        <button type="button" onClick={() => removeMedia(i)} className="absolute top-2 right-2 bg-red-600 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                
                <div className="bg-blue-600 p-8 rounded-[2rem] text-white">
                   <h4 className="font-black uppercase tracking-widest text-xs mb-2 text-blue-200">Final Confirmation</h4>
                   <p className="font-medium">By submitting, you represent that all data provided including the {media.length} visual asset(s) are accurate representations of the land.</p>
                </div>
              </div>
            )}

            <div className="flex gap-4 pt-8">
              {step > 1 && (
                <button type="button" onClick={prevStep} className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-900 font-black py-5 rounded-2xl transition-all uppercase tracking-widest text-xs">
                  Back
                </button>
              )}
              {step < 3 ? (
                <button type="button" onClick={nextStep} className="flex-[2] bg-blue-600 hover:bg-blue-700 text-white font-black py-5 rounded-2xl shadow-2xl shadow-blue-500/30 transition-all hover:-translate-y-1 active:scale-95 uppercase tracking-widest text-xs">
                  Continue &rarr;
                </button>
              ) : (
                <button type="submit" className="flex-[2] bg-emerald-600 hover:bg-emerald-700 text-white font-black py-5 rounded-2xl shadow-2xl shadow-emerald-500/30 transition-all hover:-translate-y-1 active:scale-95 uppercase tracking-widest text-xs">
                  Complete Listing
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddProperty;
