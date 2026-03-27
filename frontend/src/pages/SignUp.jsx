import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

const SignUp = () => {
  const [formData, setFormData] = useState({ name: '', email: '', password: '', phone: '' });
  const [error, setError] = useState('');
  
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:5000/api/auth/register', formData);
      login(res.data.user, res.data.token);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full card p-8 border-t-4 border-blue-600">
        <div>
          <h2 className="mt-2 text-center text-3xl font-extrabold text-gray-900">
            Create an Account
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && <div className="text-red-500 text-center bg-red-50 p-2 rounded">{error}</div>}
          <div className="rounded-md shadow-sm space-y-4">
            <div>
              <input name="name" type="text" required className="form-input" placeholder="Full Name" onChange={handleChange} />
            </div>
            <div>
              <input name="email" type="email" required className="form-input" placeholder="Email address" onChange={handleChange} />
            </div>
            <div>
              <input name="phone" type="text" className="form-input" placeholder="Phone Number" onChange={handleChange} />
            </div>
            <div>
              <input name="password" type="password" required className="form-input" placeholder="Password" onChange={handleChange} />
            </div>
          </div>

          <div>
            <button type="submit" className="w-full btn-primary flex justify-center py-3">
              Sign Up
            </button>
          </div>
          <div className="text-center mt-4">
            <span className="text-gray-600">Already have an account? </span>
            <Link to="/signin" className="text-blue-600 font-medium hover:text-blue-500">Sign in</Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SignUp;
