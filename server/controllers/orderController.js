import Order from '../models/Order.js';
import Product from '../models/Product.js';
import ActivityLog from '../models/ActivityLog.js';
import Notification from '../models/Notification.js';

export const getOrders = async (req, res) => {
  try {
    let query;
    if (req.user.role === 'admin') {
      query = Order.find()
        .populate('createdBy', 'name email')
        .populate({
          path: 'productId',
          select: 'name price category createdBy',
          populate: { path: 'createdBy', select: 'name email' }
        });
    } else {
      query = Order.find({ createdBy: req.user.id })
        .populate({
          path: 'productId',
          select: 'name price category createdBy',
          populate: { path: 'createdBy', select: 'name email' }
        });
    }
    const orders = await query.sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: orders.length, data: orders });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

export const createOrder = async (req, res) => {
  try {
    const { productId, quantity, ...otherData } = req.body;

    if (!productId) {
      return res.status(400).json({ success: false, message: 'Product selection is required (productId missing)' });
    }

    const productRecord = await Product.findById(productId);
    if (!productRecord) {
      return res.status(404).json({ success: false, message: 'Selected product not found' });
    }

    const qty = quantity ? Number(quantity) : 1;
    if (productRecord.stock < qty) {
      return res.status(400).json({ success: false, message: `Only ${productRecord.stock} units in stock` });
    }

    const unitPrice = productRecord.price;
    const totalAmount = unitPrice * qty;

    const orderData = {
      ...otherData,
      productId: productRecord._id,
      product: productRecord.name, // keep for backward compatibility initially
      quantity: qty,
      unitPrice,
      totalAmount,
      createdBy: req.user.id,
    };

    const order = await Order.create(orderData);

    // Reduce stock
    productRecord.stock -= qty;
    await productRecord.save();

    await ActivityLog.create({
      user: req.user.id,
      action: 'ORDER_CREATED',
      details: `Admin created order for ${qty}x ${productRecord.name}, total: $${order.totalAmount}`
    });

    const notification = await Notification.create({
      user: req.user.id,
      title: 'New Order Created',
      message: `Your order for ${qty}x ${productRecord.name} has been placed successfully.`,
      type: 'success'
    });

    const io = req.app.get('io');
    if (io) io.to(req.user.id).emit('notification', notification);

    res.status(201).json({ success: true, data: order });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// User: Purchase a product from the store (one-click with quantity)
export const purchaseOrder = async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;

    if (!productId) {
      return res.status(400).json({ success: false, message: 'productId is required' });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    if (product.stock < quantity) {
      return res.status(400).json({ success: false, message: `Only ${product.stock} units in stock` });
    }

    const unitPrice = product.price;
    const order = await Order.create({
      product: product.name,
      productId: product._id,
      quantity,
      unitPrice,
      totalAmount: unitPrice * quantity,
      status: 'Pending',
      createdBy: req.user.id,
    });

    // Reduce stock
    await Product.findByIdAndUpdate(productId, { $inc: { stock: -quantity } });

    await ActivityLog.create({
      user: req.user.id,
      action: 'ORDER_CREATED',
      details: `Purchased ${quantity}x ${product.name} for $${order.totalAmount}`
    });

    const notification = await Notification.create({
      user: req.user.id,
      title: 'Order Placed!',
      message: `You ordered ${quantity}x "${product.name}" for $${order.totalAmount.toFixed(2)}.`,
      type: 'success'
    });

    const io = req.app.get('io');
    if (io) io.to(req.user.id).emit('notification', notification);

    res.status(201).json({ success: true, data: order });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

export const updateOrder = async (req, res) => {
  try {
    let order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    if (order.createdBy?.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }
    order = await Order.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });

    await ActivityLog.create({
      user: req.user.id,
      action: 'ORDER_UPDATED',
      details: `Order ${req.params.id} updated`
    });
    res.status(200).json({ success: true, data: order });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

export const deleteOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    if (order.createdBy?.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }
    await order.deleteOne();

    await ActivityLog.create({
      user: req.user.id,
      action: 'ORDER_DELETED',
      details: `Order ${req.params.id} deleted`
    });
    res.status(200).json({ success: true, data: {} });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};
