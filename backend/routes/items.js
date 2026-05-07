const express = require('express');
const router = express.Router();
const multer = require('multer');
const Item = require('../models/Item');
const { protect } = require('../middleware/auth');
const { generateVerificationQuestions } = require('../controllers/aiController');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
});
const upload = multer({ storage });

// GET all items
router.get('/', async (req, res) => {
  try {
    const { type, category, search, status } = req.query;
    const query = {};
    if (type) query.type = type;
    if (category) query.category = category;
    if (status) query.status = status;
    if (search) query.name = new RegExp(search, 'i');
    const items = await Item.find(query)
      .populate('postedBy', 'name email rollNo department')
      .sort({ createdAt: -1 });
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET single item
router.get('/:id', async (req, res) => {
  try {
    const item = await Item.findById(req.params.id)
      .populate('postedBy', 'name email rollNo department phone');
    if (!item) return res.status(404).json({ message: 'Item not found' });
    res.json(item);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST — finder posts item
// Questions generated from finder's description and saved to DB
router.post('/', protect, upload.single('image'), async (req, res) => {
  try {
    const { type, name, category, description, location, date } = req.body;

    console.log('📦 New item posted:', { type, name, category });

    let verificationQuestions = [];

    if (type === 'found') {
      // Generate questions from what the finder actually wrote
      verificationQuestions = generateVerificationQuestions({
        name,
        category,
        description,
        location
      });
      console.log('🧠 Generated questions:', verificationQuestions);
    }

    const item = await Item.create({
      type,
      name,
      category,
      description,
      location,
      date,
      image: req.file ? `/uploads/${req.file.filename}` : null,
      verificationQuestions,
      postedBy: req.user._id
    });

    await item.populate('postedBy', 'name email rollNo department');
    res.status(201).json(item);
  } catch (err) {
    console.error('❌ Post item error:', err.message);
    res.status(500).json({ message: err.message });
  }
});

// DELETE item
router.delete('/:id', protect, async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) return res.status(404).json({ message: 'Item not found' });
    if (
      item.postedBy.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    await item.deleteOne();
    res.json({ message: 'Item deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;