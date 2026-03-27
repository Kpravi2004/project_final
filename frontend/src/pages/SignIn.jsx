import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

const SignIn = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:5000/api/auth/login', { email, password });
      login(res.data.user, res.data.token);
      if (res.data.user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full card p-8">
        <div>
          <h2 className="mt-2 text-center text-3xl font-extrabold text-gray-900">
            Sign in to your account
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && <div className="text-red-500 text-center bg-red-50 p-2 rounded">{error}</div>}
          <div className="rounded-md shadow-sm space-y-4">
            <div>
              <label className="sr-only">Email address</label>
              <input type="email" required className="form-input" placeholder="Email address"
                     value={email} onChange={e => setEmail(e.target.value)} />
            </div>
            <div>
              <label className="sr-only">Password</label>
              <input type="password" required className="form-input" placeholder="Password"
                     value={password} onChange={e => setPassword(e.target.value)} />
            </div>
          </div>

          <div>
            <button type="submit" className="w-full btn-primary flex justify-center py-3">
              Sign in
            </button>
          </div>
          <div className="text-center mt-4">
            <span className="text-gray-600">Don't have an account? </span>
            <Link to="/signup" className="text-blue-600 font-medium hover:text-blue-500">Sign up</Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SignIn;
