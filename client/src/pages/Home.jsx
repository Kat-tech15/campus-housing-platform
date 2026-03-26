import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

export default function Home() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [houses, setHouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({ location: '', min_price: '', max_price: '' });

  useEffect(() => {
    fetchHouses();
  }, []);

  async function fetchHouses(params = {}) {
    setLoading(true);
    setError('');
    try {
      const query = new URLSearchParams();
      if (params.location) query.set('location', params.location);
      if (params.min_price) query.set('min_price', params.min_price);
      if (params.max_price) query.set('max_price', params.max_price);
      const res = await api.get(`/houses?${query.toString()}`);
      setHouses(res.data);
    } catch {
      setError('Failed to load listings. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  function handleSearch(e) {
    e.preventDefault();
    fetchHouses(filters);
  }

  function handleFilterChange(e) {
    setFilters({ ...filters, [e.target.name]: e.target.value });
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
            {user ? (
              <>
                <span className="nav-user">Hi, {user.name}</span>
                {user.role === 'landlord' && (
                  <Link to="/dashboard" className="nav-link">Dashboard</Link>
                )}
                <button onClick={handleLogout} className="btn btn-outline btn-sm">Logout</button>
              </>
            ) : (
              <>
                <Link to="/login" className="nav-link">Login</Link>
                <Link to="/register" className="btn btn-primary btn-sm">Register</Link>
              </>
            )}
          </nav>
        </div>
      </header>

      <section className="hero">
        <h1>Find Your Perfect Student Home</h1>
        <p>Browse verified campus housing listings near your university</p>
        <form className="search-form" onSubmit={handleSearch}>
          <input
            type="text"
            name="location"
            placeholder="Location (city, neighborhood...)"
            value={filters.location}
            onChange={handleFilterChange}
            className="search-input"
          />
          <input
            type="number"
            name="min_price"
            placeholder="Min Price ($)"
            value={filters.min_price}
            onChange={handleFilterChange}
            className="search-input search-input-sm"
            min="0"
          />
          <input
            type="number"
            name="max_price"
            placeholder="Max Price ($)"
            value={filters.max_price}
            onChange={handleFilterChange}
            className="search-input search-input-sm"
            min="0"
          />
          <button type="submit" className="btn btn-primary">Search</button>
        </form>
      </section>

      <main className="main">
        <div className="container">
          <div className="section-header">
            <h2>Available Listings</h2>
            <span className="count">{houses.length} {houses.length === 1 ? 'listing' : 'listings'} found</span>
          </div>

          {error && <div className="alert alert-error">{error}</div>}

          {loading ? (
            <div className="loading-grid">
              {[1, 2, 3, 4, 5, 6].map(i => <div key={i} className="card-skeleton" />)}
            </div>
          ) : houses.length === 0 ? (
            <div className="empty-state">
              <span className="empty-icon">🏘️</span>
              <h3>No listings found</h3>
              <p>Try adjusting your search filters or check back later.</p>
            </div>
          ) : (
            <div className="house-grid">
              {houses.map(house => (
                <div key={house.id} className={`house-card ${!house.available ? 'unavailable' : ''}`}>
                  <div className="card-image">
                    {house.image_url ? (
                      <img src={house.image_url} alt={house.title} />
                    ) : (
                      <div className="image-placeholder">🏠</div>
                    )}
                    {!house.available && <span className="badge badge-unavailable">Unavailable</span>}
                    {house.available && <span className="badge badge-available">Available</span>}
                  </div>
                  <div className="card-body">
                    <h3 className="card-title">{house.title}</h3>
                    <p className="card-location">📍 {house.location}</p>
                    <p className="card-price">${Number(house.price).toLocaleString()}<span>/month</span></p>
                    <div className="card-meta">
                      <span>🛏 {house.bedrooms} bed</span>
                      <span>🚿 {house.bathrooms} bath</span>
                    </div>
                    {house.amenities && house.amenities.length > 0 && (
                      <div className="card-amenities">
                        {house.amenities.slice(0, 3).map(a => (
                          <span key={a} className="amenity-tag">{a}</span>
                        ))}
                        {house.amenities.length > 3 && (
                          <span className="amenity-tag">+{house.amenities.length - 3}</span>
                        )}
                      </div>
                    )}
                    <button
                      onClick={() => navigate(`/houses/${house.id}`)}
                      className="btn btn-primary btn-full"
                    >
                      View Details
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
