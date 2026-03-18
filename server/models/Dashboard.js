import mongoose from 'mongoose';

const dashboardSchema = new mongoose.Schema({
  name: { type: String, required: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  widgets: [
    {
      id: { type: String, required: true },
      type: { type: String, required: true },
      title: { type: String, required: true },
      dataSource: { type: String, default: 'sales' },
      x: { type: Number, required: true },
      y: { type: Number, required: true },
      w: { type: Number, required: true },
      h: { type: Number, required: true },
      config: { type: Object, default: {} },
    },
  ],
  layout: [
    {
      i: { type: String, required: true },
      x: { type: Number, required: true },
      y: { type: Number, required: true },
      w: { type: Number, required: true },
      h: { type: Number, required: true },
    },
  ],
  isDefault: { type: Boolean, default: false },
}, {
  timestamps: true,
});

const Dashboard = mongoose.model('Dashboard', dashboardSchema);

export default Dashboard;
