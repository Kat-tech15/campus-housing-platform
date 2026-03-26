const express = require('express');
const db = require('../db');
const { authenticateToken, requireLandlord } = require('../middleware/auth');

const router = express.Router();

// GET /api/houses - public, supports ?location=&min_price=&max_price=
router.get('/', (req, res) => {
  const { location, min_price, max_price } = req.query;

  let query = 'SELECT h.*, u.name as landlord_name FROM houses h JOIN users u ON h.landlord_id = u.id WHERE 1=1';
  const params = [];

  if (location && location.trim()) {
    query += ' AND LOWER(h.location) LIKE LOWER(?)';
    params.push(`%${location.trim()}%`);
  }

  if (min_price !== undefined && min_price !== '') {
    const min = parseFloat(min_price);
    if (!isNaN(min)) {
      query += ' AND h.price >= ?';
      params.push(min);
    }
  }

  if (max_price !== undefined && max_price !== '') {
    const max = parseFloat(max_price);
    if (!isNaN(max)) {
      query += ' AND h.price <= ?';
      params.push(max);
    }
  }

  query += ' ORDER BY h.created_at DESC';

  try {
    const houses = db.prepare(query).all(...params);
    const parsed = houses.map(h => ({
      ...h,
      amenities: safeParseJSON(h.amenities, []),
      available: h.available === 1,
    }));
    res.json(parsed);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch listings' });
  }
});

// GET /api/houses/my/listings - landlord only
router.get('/my/listings', authenticateToken, requireLandlord, (req, res) => {
  try {
    const houses = db.prepare(
      'SELECT * FROM houses WHERE landlord_id = ? ORDER BY created_at DESC'
    ).all(req.user.id);
    const parsed = houses.map(h => ({
      ...h,
      amenities: safeParseJSON(h.amenities, []),
      available: h.available === 1,
    }));
    res.json(parsed);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch your listings' });
  }
});

// GET /api/houses/:id - public
router.get('/:id', (req, res) => {
  try {
    const house = db.prepare(
      'SELECT h.*, u.name as landlord_name FROM houses h JOIN users u ON h.landlord_id = u.id WHERE h.id = ?'
    ).get(req.params.id);

    if (!house) {
      return res.status(404).json({ error: 'Listing not found' });
    }

    res.json({
      ...house,
      amenities: safeParseJSON(house.amenities, []),
      available: house.available === 1,
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch listing' });
  }
});

// POST /api/houses - landlord only
router.post('/', authenticateToken, requireLandlord, (req, res) => {
  const {
    title, description, location, price, bedrooms, bathrooms,
    amenities, contact_phone, contact_email, image_url, available,
  } = req.body;

  if (!title || !location || price === undefined) {
    return res.status(400).json({ error: 'Title, location, and price are required' });
  }

  const priceNum = parseFloat(price);
  if (isNaN(priceNum) || priceNum < 0) {
    return res.status(400).json({ error: 'Price must be a non-negative number' });
  }

  try {
    const result = db.prepare(`
      INSERT INTO houses (landlord_id, title, description, location, price, bedrooms, bathrooms,
        amenities, contact_phone, contact_email, image_url, available)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      req.user.id,
      title,
      description || '',
      location,
      priceNum,
      parseInt(bedrooms) || 1,
      parseInt(bathrooms) || 1,
      JSON.stringify(Array.isArray(amenities) ? amenities : []),
      contact_phone || '',
      contact_email || '',
      image_url || '',
      available === false || available === 0 ? 0 : 1,
    );

    const house = db.prepare('SELECT * FROM houses WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json({
      ...house,
      amenities: safeParseJSON(house.amenities, []),
      available: house.available === 1,
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create listing' });
  }
});

// PUT /api/houses/:id - landlord only, own listing
router.put('/:id', authenticateToken, requireLandlord, (req, res) => {
  const house = db.prepare('SELECT * FROM houses WHERE id = ?').get(req.params.id);
  if (!house) return res.status(404).json({ error: 'Listing not found' });
  if (house.landlord_id !== req.user.id) return res.status(403).json({ error: 'Not authorized' });

  const {
    title, description, location, price, bedrooms, bathrooms,
    amenities, contact_phone, contact_email, image_url, available,
  } = req.body;

  try {
    db.prepare(`
      UPDATE houses SET
        title = ?, description = ?, location = ?, price = ?, bedrooms = ?, bathrooms = ?,
        amenities = ?, contact_phone = ?, contact_email = ?, image_url = ?, available = ?
      WHERE id = ?
    `).run(
      title ?? house.title,
      description ?? house.description,
      location ?? house.location,
      price !== undefined ? parseFloat(price) : house.price,
      bedrooms !== undefined ? parseInt(bedrooms) : house.bedrooms,
      bathrooms !== undefined ? parseInt(bathrooms) : house.bathrooms,
      amenities !== undefined ? JSON.stringify(Array.isArray(amenities) ? amenities : []) : house.amenities,
      contact_phone ?? house.contact_phone,
      contact_email ?? house.contact_email,
      image_url ?? house.image_url,
      available === undefined ? house.available : (available === false || available === 0 ? 0 : 1),
      req.params.id,
    );

    const updated = db.prepare('SELECT * FROM houses WHERE id = ?').get(req.params.id);
    res.json({
      ...updated,
      amenities: safeParseJSON(updated.amenities, []),
      available: updated.available === 1,
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update listing' });
  }
});

// DELETE /api/houses/:id - landlord only, own listing
router.delete('/:id', authenticateToken, requireLandlord, (req, res) => {
  const house = db.prepare('SELECT * FROM houses WHERE id = ?').get(req.params.id);
  if (!house) return res.status(404).json({ error: 'Listing not found' });
  if (house.landlord_id !== req.user.id) return res.status(403).json({ error: 'Not authorized' });

  try {
    db.prepare('DELETE FROM houses WHERE id = ?').run(req.params.id);
    res.json({ message: 'Listing deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete listing' });
  }
});

function safeParseJSON(str, fallback) {
  try {
    return JSON.parse(str);
  } catch {
    return fallback;
  }
}

module.exports = router;
