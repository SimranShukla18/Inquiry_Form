const Customer = require('../models/Customer');

// Create new customer inquiry
exports.createInquiry = async (req, res) => {
  try {
    const { name, phone, email, address } = req.body;

    console.log('Received inquiry data:', { name, phone, email, address });

    // Validation
    if (!name || !phone || !email || !address) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required'
      });
    }

    // Create new customer
    const customer = new Customer({
      name,
      phone,
      email,
      address
    });

    console.log('Customer object created:', customer);

    await customer.save();

    console.log('Customer saved successfully:', customer);

    res.status(201).json({
      success: true,
      message: 'Inquiry submitted successfully',
      data: customer
    });
  } catch (error) {
    console.error('Error creating inquiry:', error);
    
    // Handle duplicate key error
    if (error.code === 11000) {
      // If duplicate inquiry number, retry with a new number
      try {
        console.log('Duplicate inquiry number detected, retrying...');
        const customer = new Customer({
          name: req.body.name,
          phone: req.body.phone,
          email: req.body.email,
          address: req.body.address
        });
        await customer.save();
        
        return res.status(201).json({
          success: true,
          message: 'Inquiry submitted successfully',
          data: customer
        });
      } catch (retryError) {
        console.error('Retry failed:', retryError);
      }
    }
    
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Get all customer inquiries
exports.getAllInquiries = async (req, res) => {
  try {
    const { status, search, page = 1, limit = 10 } = req.query;

    // Build filter object
    const filter = {};
    
    if (status && status !== 'All Status') {
      filter.status = status;
    }

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { inquiryNo: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    // Pagination
    const skip = (page - 1) * limit;
    
    const customers = await Customer.find(filter)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(skip);

    const total = await Customer.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: customers,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalRecords: total,
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Error fetching inquiries:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Get single customer inquiry
exports.getInquiryById = async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Inquiry not found'
      });
    }

    res.status(200).json({
      success: true,
      data: customer
    });
  } catch (error) {
    console.error('Error fetching inquiry:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Update customer inquiry status
exports.updateInquiryStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!['Placed', 'Ready', 'Delivered', 'Cancelled'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }

    const customer = await Customer.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Inquiry not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Status updated successfully',
      data: customer
    });
  } catch (error) {
    console.error('Error updating status:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Delete customer inquiry
exports.deleteInquiry = async (req, res) => {
  try {
    const customer = await Customer.findByIdAndDelete(req.params.id);

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Inquiry not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Inquiry deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting inquiry:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};