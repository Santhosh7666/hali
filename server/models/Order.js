import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
  // Customer info (used by admin Create Order flow)
  firstName: { type: String, default: '' },
  lastName:  { type: String, default: '' },
  email:     { type: String, default: '' },
  phoneNumber:   { type: String, default: '' },
  streetAddress: { type: String, default: '' },
  city:    { type: String, default: '' },
  state:   { type: String, default: '' },
  postalCode: { type: String, default: '' },
  country: { type: String, default: '' },

  // Product info — top-level string for backward compat
  product:  { type: String, default: '' },
  quantity: { type: Number, default: 1 },
  unitPrice: { type: Number, default: 0 },
  totalAmount: { type: Number, default: 0 },

  // Structured product reference (used by store purchase flow)
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', default: null },

  status: {
    type: String,
    enum: ['Pending', 'In Progress', 'Completed', 'Cancelled'],
    default: 'Pending'
  },
  orderDate: { type: Date, default: Date.now },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

orderSchema.pre('save', function (next) {
  this.totalAmount = (this.quantity || 1) * (this.unitPrice || 0);
  next();
});

const Order = mongoose.model('Order', orderSchema);
export default Order;
