const express = require('express');
const router = express.Router();
const customerController = require('../controllers/customerController');

// Create new inquiry
router.post('/inquiries', customerController.createInquiry);

// Get all inquiries (with filters)
router.get('/inquiries', customerController.getAllInquiries);

// Get single inquiry by ID
router.get('/inquiries/:id', customerController.getInquiryById);

// Update inquiry status
router.patch('/inquiries/:id/status', customerController.updateInquiryStatus);

// Delete inquiry
router.delete('/inquiries/:id', customerController.deleteInquiry);

module.exports = router;