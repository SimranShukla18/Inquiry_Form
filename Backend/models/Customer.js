const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
  inquiryNo: {
    type: String,
    unique: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  phone: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },
  address: {
    type: String,
    required: true
  },
  comment: {
    type: String,
    default: ""
  },
  status: {
    type: String,
    enum: ['Placed', 'Ready', 'Delivered', 'Cancelled'],
    default: 'Placed'
  }
}, {
  timestamps: true
});

// Generate inquiry number before saving
customerSchema.pre('save', async function() {
  if (!this.isNew || this.inquiryNo) {
    return;
  }
  
  try {
    const date = new Date();
    const dateStr = date.toISOString().split('T')[0].replace(/-/g, '');
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    
    // Find count of inquiries for this month
    const startOfMonth = new Date(year, date.getMonth(), 1);
    const endOfMonth = new Date(year, date.getMonth() + 1, 0);
    
    const count = await mongoose.model('Customer').countDocuments({
      createdAt: {
        $gte: startOfMonth,
        $lte: endOfMonth
      }
    });
    
    this.inquiryNo = `INQ-${dateStr}-${String(count + 1).padStart(4, '0')}`;
  } catch (error) {
    throw error;
  }
});

module.exports = mongoose.model('Customer', customerSchema);