require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const jwt = require('jsonwebtoken');

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' }));

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

// Middleware للتحقق من صلاحية الأدمن
function verifyAdmin(req, res, next) {
  const auth = req.headers.authorization || '';
  const token = auth.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  try {
    jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

// تحويل أعمدة الداتابيس لشكل camelCase المطلوب في الفرونت إند
const mapProduct = (r) => ({
  id: r.id,
  title: r.title,
  category: r.category,
  price: Number(r.price),
  oldPrice: r.old_price ? Number(r.old_price) : undefined,
  description: r.description || '',
  sizes: r.sizes || [],
  colors: r.colors || [],
  featured: r.featured,
  createdAt: r.created_at,
});

const mapOrder = (r) => ({
  id: r.id,
  orderNumber: r.order_number,
  customerName: r.customer_name,
  phone: r.phone,
  governorate: r.governorate,
  address: r.address,
  items: r.items || [],
  subtotal: Number(r.subtotal),
  shippingCost: Number(r.shipping_cost),
  promoCode: r.promo_code || undefined,
  discountAmount: Number(r.discount_amount || 0),
  total: Number(r.total),
  status: r.status,
  createdAt: r.created_at,
});

// دالة مساعدة لحساب الخصم من قاعدة البيانات
async function calculatePromoDiscount(code, subtotal) {
  if (!code || !String(code).trim()) return null;
  const cleanCode = String(code).trim().toUpperCase();
  const { rows } = await pool.query(
    'SELECT * FROM promo_codes WHERE UPPER(code) = $1 AND active = TRUE',
    [cleanCode]
  );
  if (rows.length === 0) return null;

  const promo = rows[0];
  const orderSubtotal = Number(subtotal) || 0;
  let discountAmount =
    promo.discount_type === 'percent'
      ? Math.round((orderSubtotal * Number(promo.discount_value)) / 100)
      : Number(promo.discount_value);

  if (discountAmount > orderSubtotal) discountAmount = orderSubtotal;

  return {
    code: promo.code,
    discountType: promo.discount_type,
    discountValue: Number(promo.discount_value),
    discountAmount,
  };
}

/* ---------------- 1. AUTH ---------------- */
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;
  if (username === process.env.ADMIN_USER && password === process.env.ADMIN_PASS) {
    const token = jwt.sign({ role: 'admin' }, process.env.JWT_SECRET, { expiresIn: '7d' });
    return res.json({ token });
  }
  return res.status(401).json({ error: 'بيانات الدخول غير صحيحة' });
});

/* ---------------- 2. PRODUCTS ---------------- */
app.get('/api/products', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM products ORDER BY created_at DESC');
    res.json(rows.map(mapProduct));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/products', verifyAdmin, async (req, res) => {
  try {
    const { title, category, price, oldPrice, description, sizes, colors, featured } = req.body;
    const { rows } = await pool.query(
      `INSERT INTO products (title, category, price, old_price, description, sizes, colors, featured)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [title, category, price, oldPrice || null, description, JSON.stringify(sizes || []), JSON.stringify(colors || []), Boolean(featured)]
    );
    res.status(201).json(mapProduct(rows[0]));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.patch('/api/products/:id', verifyAdmin, async (req, res) => {
  try {
    const { title, category, price, oldPrice, description, sizes, colors, featured } = req.body;
    const { rows } = await pool.query(
      `UPDATE products SET
        title = COALESCE($1, title),
        category = COALESCE($2, category),
        price = COALESCE($3, price),
        old_price = $4,
        description = COALESCE($5, description),
        sizes = COALESCE($6, sizes),
        colors = COALESCE($7, colors),
        featured = COALESCE($8, featured)
       WHERE id = $9 RETURNING *`,
      [
        title,
        category,
        price,
        oldPrice ?? null,
        description,
        sizes ? JSON.stringify(sizes) : null,
        colors ? JSON.stringify(colors) : null,
        featured,
        req.params.id,
      ]
    );
    res.json(mapProduct(rows[0]));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/products/:id', verifyAdmin, async (req, res) => {
  try {
    await pool.query('DELETE FROM products WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ---------------- 3. SHIPPING ---------------- */
app.get('/api/shipping/governorates', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM governorates ORDER BY id ASC');
    res.json(rows.map((r) => ({ id: String(r.id), name: r.name, shippingCost: Number(r.shipping_cost) })));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.patch('/api/shipping/governorates/:id', verifyAdmin, async (req, res) => {
  try {
    const { shippingCost } = req.body;
    const { rows } = await pool.query(
      'UPDATE governorates SET shipping_cost = $1 WHERE id = $2 RETURNING *',
      [shippingCost, req.params.id]
    );
    res.json({ id: String(rows[0].id), name: rows[0].name, shippingCost: Number(rows[0].shipping_cost) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ---------------- 4. ORDERS ---------------- */
app.get('/api/orders', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM orders ORDER BY created_at DESC');
    res.json(rows.map(mapOrder));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/orders', async (req, res) => {
  try {
    const { customerName, phone, governorate, address, items, subtotal, shippingCost, promoCode } = req.body;
    const validPromo = await calculatePromoDiscount(promoCode, subtotal);
    const appliedCode = validPromo ? validPromo.code : null;
    const discountAmount = validPromo ? validPromo.discountAmount : 0;
    const finalTotal = Math.max(0, Number(subtotal) - discountAmount) + Number(shippingCost || 0);

    const orderNumber = `MAI-${Math.floor(1000 + Math.random() * 9000)}`;
    const { rows } = await pool.query(
      `INSERT INTO orders (order_number, customer_name, phone, governorate, address, items, subtotal, shipping_cost, promo_code, discount_amount, total)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *`,
      [orderNumber, customerName, phone, governorate, address, JSON.stringify(items), subtotal, shippingCost, appliedCode, discountAmount, finalTotal]
    );
    res.status(201).json(mapOrder(rows[0]));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/orders/track', async (req, res) => {
  try {
    const q = (req.query.q || '').trim();
    const { rows } = await pool.query(
      'SELECT * FROM orders WHERE order_number ILIKE $1 OR phone = $2 ORDER BY created_at DESC',
      [q, q]
    );
    res.json(rows.map(mapOrder));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.patch('/api/orders/:id/status', verifyAdmin, async (req, res) => {
  try {
    const { status } = req.body;
    const { rows } = await pool.query(
      'UPDATE orders SET status = $1 WHERE id = $2 RETURNING *',
      [status, req.params.id]
    );
    res.json(mapOrder(rows[0]));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ---------------- 5. PROMO CODES ---------------- */
app.post('/api/promo-codes/validate', async (req, res) => {
  try {
    const { code, subtotal } = req.body;
    if (!code || !String(code).trim()) {
      return res.status(400).json({ error: 'يرجى إدخال كود الخصم' });
    }
    const validPromo = await calculatePromoDiscount(code, subtotal);
    if (!validPromo) {
      return res.status(404).json({ error: 'كود الخصم غير صحيح أو منتهي الصلاحية' });
    }
    res.json(validPromo);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/promo-codes', verifyAdmin, async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM promo_codes ORDER BY created_at DESC');
    res.json(
      rows.map((r) => ({
        id: r.id,
        code: r.code,
        discountType: r.discount_type,
        discountValue: Number(r.discount_value),
        active: r.active,
        createdAt: r.created_at,
      }))
    );
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/promo-codes', verifyAdmin, async (req, res) => {
  try {
    const { code, discountType, discountValue } = req.body;
    if (!code || !discountType || !discountValue || Number(discountValue) <= 0) {
      return res.status(400).json({ error: 'بيانات كود الخصم غير مكتملة' });
    }
    const cleanCode = String(code).trim().toUpperCase();
    const { rows } = await pool.query(
      `INSERT INTO promo_codes (code, discount_type, discount_value, active)
       VALUES ($1, $2, $3, TRUE) RETURNING *`,
      [cleanCode, discountType, Number(discountValue)]
    );
    const r = rows[0];
    res.status(201).json({
      id: r.id,
      code: r.code,
      discountType: r.discount_type,
      discountValue: Number(r.discount_value),
      active: r.active,
      createdAt: r.created_at,
    });
  } catch (err) {
    if (err.code === '23505') {
      return res.status(400).json({ error: 'هذا الكود موجود بالفعل' });
    }
    res.status(500).json({ error: err.message });
  }
});

app.patch('/api/promo-codes/:id', verifyAdmin, async (req, res) => {
  try {
    const { active } = req.body;
    const { rows } = await pool.query(
      'UPDATE promo_codes SET active = $1 WHERE id = $2 RETURNING *',
      [Boolean(active), req.params.id]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'Promo code not found' });
    res.json({ success: true, active: rows[0].active });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/promo-codes/:id', verifyAdmin, async (req, res) => {
  try {
    await pool.query('DELETE FROM promo_codes WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

if (!process.env.VERCEL) {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => console.log(`MAI Store Backend running on http://localhost:${PORT}`));
}

module.exports = app;