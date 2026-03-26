import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

export default function HouseDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [house, setHouse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get(`/houses/${id}`)
      .then(res => setHouse(res.data))
      .catch(() => setError('Listing not found or unavailable.'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="loading-page"><div className="spinner" /></div>;
  if (error) return (
    <div className="page">
      <div className="container" style={{ textAlign: 'center', paddingTop: '4rem' }}>
        <span style={{ fontSize: '4rem' }}>😕</span>
        <h2>{error}</h2>
        <Link to="/" className="btn btn-primary" style={{ marginTop: '1rem' }}>Back to Listings</Link>
      </div>
    </div>
  );

  return (
    <div className="page">
      <header className="header">
        <div className="header-inner">
          <Link to="/" className="logo">🏠 Campus Housing</Link>
          <nav className="nav">
            <Link to="/" className="nav-link">← Back to Listings</Link>
            {user?.role === 'landlord' && (
              <Link to="/dashboard" className="nav-link">Dashboard</Link>
            )}
          </nav>
        </div>
      </header>

      <main className="main">
        <div className="container detail-container">
          <div className="detail-image">
            {house.image_url ? (
              <img src={house.image_url} alt={house.title} />
            ) : (
              <div className="image-placeholder-lg">🏠</div>
            )}
          </div>

          <div className="detail-content">
            <div className="detail-header">
              <div>
                <h1 className="detail-title">{house.title}</h1>
                <p className="detail-location">📍 {house.location}</p>
              </div>
              <div className="detail-price-block">
                <span className="detail-price">${Number(house.price).toLocaleString()}</span>
                <span className="detail-price-label">/month</span>
                <span className={`badge ${house.available ? 'badge-available' : 'badge-unavailable'}`}>
                  {house.available ? 'Available' : 'Not Available'}
                </span>
              </div>
            </div>

            <div className="detail-stats">
              <div className="stat">
                <span className="stat-icon">🛏</span>
                <span className="stat-value">{house.bedrooms}</span>
                <span className="stat-label">Bedroom{house.bedrooms !== 1 ? 's' : ''}</span>
              </div>
              <div className="stat">
                <span className="stat-icon">🚿</span>
                <span className="stat-value">{house.bathrooms}</span>
                <span className="stat-label">Bathroom{house.bathrooms !== 1 ? 's' : ''}</span>
              </div>
            </div>

            {house.description && (
              <div className="detail-section">
                <h3>About this property</h3>
                <p className="detail-desc">{house.description}</p>
              </div>
            )}

            {house.amenities && house.amenities.length > 0 && (
              <div className="detail-section">
                <h3>Amenities</h3>
                <div className="amenity-list">
                  {house.amenities.map(a => (
                    <span key={a} className="amenity-item">✓ {a}</span>
                  ))}
                </div>
              </div>
            )}

            <div className="detail-section contact-card">
              <h3>Contact Landlord</h3>
              <p className="contact-name">🧑‍💼 {house.landlord_name}</p>
              {house.contact_phone && (
                <p className="contact-info">
                  📞 <a href={`tel:${house.contact_phone}`}>{house.contact_phone}</a>
                </p>
              )}
              {house.contact_email && (
                <p className="contact-info">
                  ✉️ <a href={`mailto:${house.contact_email}`}>{house.contact_email}</a>
                </p>
              )}
              {!house.contact_phone && !house.contact_email && (
                <p className="contact-none">No contact info provided.</p>
              )}
            </div>

            {!user && (
              <div className="cta-box">
                <p>Interested? <Link to="/register">Create an account</Link> to save listings and contact landlords.</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
