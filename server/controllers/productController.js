import Product from '../models/Product.js';
import ActivityLog from '../models/ActivityLog.js';

// @desc    Get all products (accessible to all authenticated users)
// @route   GET /api/products
// @access  Private
export const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find({})
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: products.length, data: products });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// @desc    Create a new product
// @route   POST /api/products
// @access  Private/Admin
export const createProduct = async (req, res) => {
  try {
    const { name, price, description, image, category, stock } = req.body;
    const product = await Product.create({
      name,
      price,
      description,
      image: image || null,
      category: category || 'General',
      stock: stock !== undefined ? stock : 100,
      createdBy: req.user.id,
    });

    await ActivityLog.create({
      user: req.user.id,
      action: 'PRODUCT_CREATED',
      details: `Product created: ${name} ($${price})`,
    });

    res.status(201).json({ success: true, data: product });
  } catch (err) {
    console.error('Create product error:', err);
    res.status(400).json({ success: false, message: err.message });
  }
};

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private/Admin
export const updateProduct = async (req, res) => {
  try {
    let product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    await ActivityLog.create({
      user: req.user.id,
      action: 'PRODUCT_UPDATED',
      details: `Product updated: ${product.name}`,
    });

    res.status(200).json({ success: true, data: product });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private/Admin
export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    await product.deleteOne();

    await ActivityLog.create({
      user: req.user.id,
      action: 'PRODUCT_DELETED',
      details: `Product deleted: ${product.name}`,
    });

    res.status(200).json({ success: true, data: {} });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// @desc    Purchase a product (user action)
// @route   POST /api/products/:id/purchase
// @access  Private
export const purchaseProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    if (product.stock <= 0) {
      return res.status(400).json({ success: false, message: 'Product out of stock' });
    }

    product.stock -= 1;
    await product.save();

    await ActivityLog.create({
      user: req.user.id,
      action: 'PRODUCT_PURCHASED',
      details: `User purchased: ${product.name} ($${product.price})`,
    });

    res.status(200).json({ success: true, message: `Successfully purchased ${product.name}`, data: product });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};
