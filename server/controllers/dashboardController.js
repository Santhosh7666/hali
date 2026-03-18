import Dashboard from '../models/Dashboard.js';
import ActivityLog from '../models/ActivityLog.js';

export const getDashboards = async (req, res) => {
  try {
    let query;
    if (req.user.role === 'admin') {
      query = Dashboard.find().populate('createdBy', 'name email');
    } else {
      query = Dashboard.find({ createdBy: req.user.id });
    }

    const dashboards = await query;
    res.status(200).json({ success: true, count: dashboards.length, data: dashboards });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

export const createDashboard = async (req, res) => {
  try {
    req.body.createdBy = req.user.id;
    const dashboard = await Dashboard.create(req.body);

    await ActivityLog.create({
      user: req.user.id,
      action: 'DASHBOARD_CREATED',
      details: `Dashboard created: ${dashboard.name}`
    });

    res.status(201).json({ success: true, data: dashboard });
  } catch (err) {
    console.error('Create dashboard error:', err);
    res.status(400).json({ success: false, message: err.message });
  }
};

export const updateDashboard = async (req, res) => {
  try {
    let dashboard = await Dashboard.findById(req.params.id);

    if (!dashboard) {
      return res.status(404).json({ success: false, message: 'Dashboard not found' });
    }

    console.log(`Update check: UserID(${req.user.id}) vs CreatedBy(${dashboard.createdBy})`);

    if (dashboard.createdBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({ success: false, message: 'Not authorized to update this dashboard' });
    }

    dashboard = await Dashboard.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    await ActivityLog.create({
      user: req.user.id,
      action: 'DASHBOARD_UPDATED',
      details: `Dashboard ${req.params.id} updated`
    });

    res.status(200).json({ success: true, data: dashboard });
  } catch (err) {
    console.error('Update dashboard error:', err);
    res.status(400).json({ success: false, message: err.message });
  }
};

export const deleteDashboard = async (req, res) => {
  try {
    const dashboard = await Dashboard.findById(req.params.id);

    if (!dashboard) {
      return res.status(404).json({ success: false, message: 'Dashboard not found' });
    }

    if (dashboard.createdBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({ success: false, message: 'Not authorized to delete this dashboard' });
    }

    await dashboard.deleteOne();

    await ActivityLog.create({
      user: req.user.id,
      action: 'DASHBOARD_DELETED',
      details: `Dashboard ${req.params.id} deleted`
    });

    res.status(200).json({ success: true, data: {} });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};
