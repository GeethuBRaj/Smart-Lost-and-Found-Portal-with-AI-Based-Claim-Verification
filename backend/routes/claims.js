const express = require('express');
const router = express.Router();
const Claim = require('../models/Claim');
const Item = require('../models/Item');
const { protect, adminOnly } = require('../middleware/auth');
const { evaluateClaimAnswers } = require('../controllers/aiController');

router.post('/', protect, async (req, res) => {
  try {
    const { itemId, verificationAnswers, additionalNote } = req.body;
    const item = await Item.findById(itemId);
    if (!item) return res.status(404).json({ message: 'Item not found' });
    if (item.status !== 'active') return res.status(400).json({ message: 'Item no longer available' });
    if (item.postedBy.toString() === req.user._id.toString())
      return res.status(400).json({ message: 'Cannot claim your own post' });
    const existing = await Claim.findOne({ item: itemId, claimant: req.user._id });
    if (existing) return res.status(400).json({ message: 'You already submitted a claim for this item' });

    const aiVerdict = evaluateClaimAnswers({ item, answers: verificationAnswers });

    const claim = await Claim.create({
      item: itemId,
      claimant: req.user._id,
      verificationAnswers,
      aiVerdict,
      additionalNote,
      status: aiVerdict.passed ? 'ai_approved' : 'ai_rejected'
    });

    if (aiVerdict.score >= 80 && !aiVerdict.flagged) {
      item.status = 'claimed';
      await item.save();
    }

    await claim.populate('item', 'name category description location');
    res.status(201).json({ claim, aiVerdict });
  } catch (err) {
    console.error('Claim error:', err.message);
    res.status(500).json({ message: err.message });
  }
});

router.get('/my', protect, async (req, res) => {
  try {
    const claims = await Claim.find({ claimant: req.user._id })
      .populate('item', 'name category location status image')
      .sort({ createdAt: -1 });
    res.json(claims);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.get('/item/:itemId', protect, async (req, res) => {
  try {
    const item = await Item.findById(req.params.itemId);
    if (!item) return res.status(404).json({ message: 'Item not found' });
    const isOwner = item.postedBy.toString() === req.user._id.toString();
    if (!isOwner && req.user.role !== 'admin')
      return res.status(403).json({ message: 'Not authorized' });
    const claims = await Claim.find({ item: req.params.itemId })
      .populate('claimant', 'name email rollNo department phone')
      .sort({ createdAt: -1 });
    res.json(claims);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.patch('/:id/admin', protect, adminOnly, async (req, res) => {
  try {
    const { decision, adminNote } = req.body;
    const claim = await Claim.findById(req.params.id).populate('item');
    if (!claim) return res.status(404).json({ message: 'Claim not found' });
    claim.status = decision === 'approve' ? 'admin_approved' : 'admin_rejected';
    claim.adminNote = adminNote;
    await claim.save();
    if (decision === 'approve') { claim.item.status = 'claimed'; await claim.item.save(); }
    res.json(claim);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.get('/', protect, adminOnly, async (req, res) => {
  try {
    const claims = await Claim.find()
      .populate('item', 'name category location')
      .populate('claimant', 'name email rollNo')
      .sort({ createdAt: -1 });
    res.json(claims);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;