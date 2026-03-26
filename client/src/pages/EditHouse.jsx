import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import api from '../api/axios';

const AMENITY_OPTIONS = ['WiFi', 'Parking', 'Water', 'Electricity', 'Security'];

export default function EditHouse() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    api.get(`/houses/${id}`)
      .then(res => {
        const h = res.data;
        setForm({
          title: h.title || '',
          description: h.description || '',
          location: h.location || '',
          price: String(h.price || ''),
          bedrooms: String(h.bedrooms || 1),
          bathrooms: String(h.bathrooms || 1),
          amenities: Array.isArray(h.amenities) ? h.amenities : [],
          contact_phone: h.contact_phone || '',
          contact_email: h.contact_email || '',
          image_url: h.image_url || '',
          available: h.available !== false,
        });
      })
      .catch(() => setError('Failed to load listing data.'))
      .finally(() => setFetching(false));
  }, [id]);

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    if (type === 'checkbox' && name === 'amenities') {
      const updated = checked
        ? [...form.amenities, value]
        : form.amenities.filter(a => a !== value);
      setForm({ ...form, amenities: updated });
    } else if (type === 'checkbox') {
      setForm({ ...form, [name]: checked });
    } else {
      setForm({ ...form, [name]: value });
    }
    setError('');
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.title || !form.location || !form.price) {
      setError('Title, location, and price are required');
      return;
    }
    if (isNaN(parseFloat(form.price)) || parseFloat(form.price) < 0) {
      setError('Please enter a valid price');
      return;
    }
    setLoading(true);
    try {
      await api.put(`/houses/${id}`, {
        ...form,
        price: parseFloat(form.price),
        bedrooms: parseInt(form.bedrooms),
        bathrooms: parseInt(form.bathrooms),
      });
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update listing');
    } finally {
      setLoading(false);
    }
  }

  if (fetching) return <div className="loading-page"><div className="spinner" /></div>;

  if (!form) return (
    <div className="page">
      <div className="container" style={{ textAlign: 'center', paddingTop: '4rem' }}>
        <h2>{error || 'Listing not found'}</h2>
        <Link to="/dashboard" className="btn btn-primary" style={{ marginTop: '1rem' }}>Back to Dashboard</Link>
      </div>
    </div>
  );

  return (
    <div className="page">
      <header className="header">
        <div className="header-inner">
          <Link to="/" className="logo">🏠 Campus Housing</Link>
          <nav className="nav">
            <Link to="/dashboard" className="nav-link">← Dashboard</Link>
          </nav>
        </div>
      </header>

      <main className="main">
        <div className="container form-container">
          <h2>Edit Listing</h2>
          <p className="section-subtitle">Update your property details</p>

          {error && <div className="alert alert-error">{error}</div>}

          <form onSubmit={handleSubmit} className="form">
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="title">Title *</label>
                <input id="title" type="text" name="title" value={form.title}
                  onChange={handleChange} className="form-input"
                  placeholder="e.g. Cozy 2BR near Campus" />
              </div>
              <div className="form-group">
                <label htmlFor="location">Location *</label>
                <input id="location" type="text" name="location" value={form.location}
                  onChange={handleChange} className="form-input"
                  placeholder="e.g. Downtown, University Ave" />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="description">Description</label>
              <textarea id="description" name="description" value={form.description}
                onChange={handleChange} className="form-input form-textarea"
                placeholder="Describe the property..." rows={4} />
            </div>

            <div className="form-row form-row-3">
              <div className="form-group">
                <label htmlFor="price">Monthly Price ($) *</label>
                <input id="price" type="number" name="price" value={form.price}
                  onChange={handleChange} className="form-input" min="0" step="0.01" />
              </div>
              <div className="form-group">
                <label htmlFor="bedrooms">Bedrooms</label>
                <select id="bedrooms" name="bedrooms" value={form.bedrooms}
                  onChange={handleChange} className="form-input">
                  {[1,2,3,4,5,6].map(n => <option key={n} value={n}>{n}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="bathrooms">Bathrooms</label>
                <select id="bathrooms" name="bathrooms" value={form.bathrooms}
                  onChange={handleChange} className="form-input">
                  {[1,2,3,4].map(n => <option key={n} value={n}>{n}</option>)}
                </select>
              </div>
            </div>

            <div className="form-group">
              <label>Amenities</label>
              <div className="checkbox-group">
                {AMENITY_OPTIONS.map(opt => (
                  <label key={opt} className={`checkbox-option ${form.amenities.includes(opt) ? 'checked' : ''}`}>
                    <input
                      type="checkbox"
                      name="amenities"
                      value={opt}
                      checked={form.amenities.includes(opt)}
                      onChange={handleChange}
                    />
                    {opt}
                  </label>
                ))}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="contact_phone">Contact Phone</label>
                <input id="contact_phone" type="tel" name="contact_phone"
                  value={form.contact_phone} onChange={handleChange} className="form-input" />
              </div>
              <div className="form-group">
                <label htmlFor="contact_email">Contact Email</label>
                <input id="contact_email" type="email" name="contact_email"
                  value={form.contact_email} onChange={handleChange} className="form-input" />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="image_url">Image URL</label>
              <input id="image_url" type="url" name="image_url" value={form.image_url}
                onChange={handleChange} className="form-input"
                placeholder="https://example.com/photo.jpg" />
            </div>

            <div className="form-group">
              <label className="checkbox-option" style={{ width: 'auto' }}>
                <input
                  type="checkbox"
                  name="available"
                  checked={form.available}
                  onChange={handleChange}
                />
                List as Available
              </label>
            </div>

            <div className="form-actions">
              <Link to="/dashboard" className="btn btn-outline">Cancel</Link>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
