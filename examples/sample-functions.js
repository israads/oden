/**
 * Sample functions for testing the Oden Testing Framework
 * These represent typical patterns found in real applications
 */

/**
 * Validates user email format
 * @param {string} email - Email to validate
 * @returns {boolean} True if valid email format
 */
function validateEmail(email) {
  if (!email || typeof email !== 'string') {
    return false;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Calculates user account balance after transaction
 * @param {number} currentBalance - Current account balance
 * @param {number} transactionAmount - Transaction amount (positive for deposit, negative for withdrawal)
 * @returns {number} New balance after transaction
 */
function calculateBalance(currentBalance, transactionAmount) {
  if (typeof currentBalance !== 'number' || typeof transactionAmount !== 'number') {
    throw new Error('Both parameters must be numbers');
  }

  const newBalance = currentBalance + transactionAmount;

  if (newBalance < 0) {
    throw new Error('Insufficient funds');
  }

  return newBalance;
}

/**
 * Processes user registration data
 * @param {Object} userData - User data object
 * @param {string} userData.email - User email
 * @param {string} userData.password - User password
 * @param {string} userData.name - User full name
 * @returns {Promise<Object>} Processed user data with ID
 */
async function processUserRegistration(userData) {
  if (!userData || typeof userData !== 'object') {
    throw new Error('User data is required');
  }

  const { email, password, name } = userData;

  // Validate required fields
  if (!email || !password || !name) {
    throw new Error('Email, password, and name are required');
  }

  // Validate email format
  if (!validateEmail(email)) {
    throw new Error('Invalid email format');
  }

  // Validate password strength
  if (password.length < 8) {
    throw new Error('Password must be at least 8 characters long');
  }

  // Simulate async processing (database save, etc.)
  await new Promise(resolve => setTimeout(resolve, 100));

  // Return processed user data with generated ID
  return {
    id: Date.now(), // Simple ID generation
    email: email.toLowerCase(),
    name: name.trim(),
    createdAt: new Date().toISOString(),
    isActive: true
  };
}

/**
 * Utility function to format currency
 * @param {number} amount - Amount to format
 * @param {string} currency - Currency code (default: 'USD')
 * @returns {string} Formatted currency string
 */
function formatCurrency(amount = 0, currency = 'USD') {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency
  }).format(amount);
}

/**
 * Simple logger utility
 * @param {string} level - Log level
 * @param {string} message - Log message
 */
function log(level, message) {
  console.log(`[${level.toUpperCase()}] ${message}`);
}

/**
 * API endpoint simulation - Express-style handler
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
async function getUserProfile(req, res) {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    // Simulate database lookup
    const user = await findUserById(userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Return user profile
    res.status(200).json({
      id: user.id,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt
    });

  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * Mock database function
 * @param {string} userId - User ID to find
 * @returns {Promise<Object|null>} User object or null
 */
async function findUserById(userId) {
  // Simulate database query
  await new Promise(resolve => setTimeout(resolve, 50));

  // Mock user data
  if (userId === '123') {
    return {
      id: '123',
      name: 'John Doe',
      email: 'john@example.com',
      createdAt: '2024-01-01T00:00:00.000Z'
    };
  }

  return null;
}

/**
 * Complex business logic function
 * @param {Array} orders - Array of order objects
 * @param {Object} discountRules - Discount rules object
 * @returns {Object} Order summary with totals and discounts
 */
function calculateOrderSummary(orders, discountRules = {}) {
  if (!Array.isArray(orders)) {
    throw new Error('Orders must be an array');
  }

  let subtotal = 0;
  let totalItems = 0;

  // Calculate subtotal and item count
  for (const order of orders) {
    if (!order.price || !order.quantity) {
      throw new Error('Each order must have price and quantity');
    }

    subtotal += order.price * order.quantity;
    totalItems += order.quantity;
  }

  // Apply discounts
  let discount = 0;

  if (discountRules.bulkDiscount && totalItems >= discountRules.bulkDiscount.minItems) {
    discount = subtotal * (discountRules.bulkDiscount.percentage / 100);
  }

  if (discountRules.couponCode && discountRules.couponValue) {
    discount += discountRules.couponValue;
  }

  const tax = (subtotal - discount) * 0.08; // 8% tax
  const total = subtotal - discount + tax;

  return {
    subtotal,
    discount,
    tax,
    total,
    totalItems,
    appliedDiscounts: discount > 0 ? ['bulk', 'coupon'].filter(Boolean) : []
  };
}

module.exports = {
  validateEmail,
  calculateBalance,
  processUserRegistration,
  formatCurrency,
  log,
  getUserProfile,
  findUserById,
  calculateOrderSummary
};