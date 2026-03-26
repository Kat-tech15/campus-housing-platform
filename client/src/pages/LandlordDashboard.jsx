import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

export default function LandlordDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [houses, setHouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteId, setDeleteId] = useState(null);

  useEffect(() => {
    fetchListings();
  }, []);

  async function fetchListings() {
    setLoading(true);
    try {
      const res = await api.get('/houses/my/listings');
      setHouses(res.data);
    } catch {
      setError('Failed to load your listings.');
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('Are you sure you want to delete this listing?')) return;
    try {
      await api.delete(`/houses/${id}`);
      setHouses(houses.filter(h => h.id !== id));
    } catch {
      setError('Failed to delete listing.');
    }
  }

  async function handleToggleAvailability(house) {
    try {
      const res = await api.put(`/houses/${house.id}`, { available: !house.available });
      setHouses(houses.map(h => h.id === house.id ? res.data : h));
    } catch {
      setError('Failed to update availability.');
    }
  }

  function handleLogout() {
    logout();
    navigate('/');
  }

  return (
    <div className="page">
      <header className="header">
        <div className="header-inner">
          <Link to="/" className="logo">🏠 Campus Housing</Link>
          <nav className="nav">
            <Link to="/" className="nav-link">Browse</Link>
            <span className="nav-user">Hi, {user?.name}</span>
            <button onClick={handleLogout} className="btn btn-outline btn-sm">Logout</button>
          </nav>
        </div>
      </header>

      <main className="main">
        <div className="container">
          <div className="section-header">
            <div>
              <h2>My Listings</h2>
              <p className="section-subtitle">Manage your housing listings</p>
            </div>
            <Link to="/post-house" className="btn btn-primary">+ Add New Listing</Link>
          </div>

          {error && <div className="alert alert-error">{error}</div>}

          {loading ? (
            <div className="loading-grid">
              {[1, 2, 3].map(i => <div key={i} className="card-skeleton" />)}
            </div>
          ) : houses.length === 0 ? (
            <div className="empty-state">
              <span className="empty-icon">🏘️</span>
              <h3>No listings yet</h3>
              <p>Start by adding your first property listing.</p>
              <Link to="/post-house" className="btn btn-primary" style={{ marginTop: '1rem' }}>
                Add First Listing
              </Link>
            </div>
          ) : (
            <div className="dashboard-list">
              {houses.map(house => (
                <div key={house.id} className={`dashboard-card ${!house.available ? 'unavailable' : ''}`}>
                  <div className="dashboard-card-image">
                    {house.image_url ? (
                      <img src={house.image_url} alt={house.title} />
                    ) : (
                      <div className="image-placeholder-sm">🏠</div>
                    )}
                  </div>
                  <div className="dashboard-card-info">
                    <h3>{house.title}</h3>
                    <p className="card-location">📍 {house.location}</p>
                    <p className="card-price">${Number(house.price).toLocaleString()}/month</p>
                    <div className="card-meta">
                      <span>🛏 {house.bedrooms} bed</span>
                      <span>🚿 {house.bathrooms} bath</span>
                      <span className={`status-badge ${house.available ? 'status-available' : 'status-unavailable'}`}>
                        {house.available ? 'Available' : 'Unavailable'}
                      </span>
                    </div>
                  </div>
                  <div className="dashboard-card-actions">
                    <button
                      onClick={() => handleToggleAvailability(house)}
                      className={`btn ${house.available ? 'btn-outline' : 'btn-success'} btn-sm`}
                    >
                      {house.available ? 'Mark Unavailable' : 'Mark Available'}
                    </button>
                    <button
                      onClick={() => navigate(`/edit-house/${house.id}`)}
                      className="btn btn-outline btn-sm"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(house.id)}
                      className="btn btn-danger btn-sm"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
