import User from '../models/User.js';
import Order from '../models/Order.js';
import Product from '../models/Product.js';

// @desc  Get summary overview KPIs (admin only — no charts)
// @route GET /api/analytics/overview
export const getOverview = async (req, res) => {
  try {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const [
      totalUsers,
      totalOrders,
      pendingOrders,
      completedOrders,
      allOrders,
      newUsersToday,
    ] = await Promise.all([
      User.countDocuments(),
      Order.countDocuments(),
      Order.countDocuments({ status: 'Pending' }),
      Order.countDocuments({ status: 'Completed' }),
      Order.find({}),
      User.countDocuments({ createdAt: { $gte: todayStart } }),
    ]);

    const totalSales = allOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
    const revenueToday = allOrders
      .filter(o => new Date(o.createdAt) >= todayStart)
      .reduce((sum, o) => sum + (o.totalAmount || 0), 0);

    res.status(200).json({
      success: true,
      data: {
        totalSales,
        totalUsers,
        totalOrders,
        pendingOrders,
        completedOrders,
        revenueToday,
        newUsersToday,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc  Get full analytics data with charts (admin only)
// @route GET /api/analytics
export const getAnalytics = async (req, res) => {
  try {
    const [totalUsers, totalOrders, totalProducts, orders, users] = await Promise.all([
      User.countDocuments(),
      Order.countDocuments(),
      Product.countDocuments(),
      Order.find({}).sort({ createdAt: 1 }),
      User.find({}).sort({ createdAt: 1 }),
    ]);

    const totalRevenue = orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);

    const now = new Date();
    const monthlySales = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthName = d.toLocaleString('en-US', { month: 'short' });
      const monthOrders = orders.filter(o => {
        const od = new Date(o.createdAt);
        return od.getMonth() === d.getMonth() && od.getFullYear() === d.getFullYear();
      });
      monthlySales.push({
        month: monthName,
        revenue: monthOrders.reduce((s, o) => s + (o.totalAmount || 0), 0),
        orders: monthOrders.length,
      });
    }

    const statusCounts = orders.reduce((acc, o) => {
      const s = o.status || 'Unknown';
      acc[s] = (acc[s] || 0) + 1;
      return acc;
    }, {});
    const orderStatusData = Object.entries(statusCounts).map(([name, value]) => ({ name, value }));

    const monthlyUsers = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthName = d.toLocaleString('en-US', { month: 'short' });
      const count = users.filter(u => {
        const ud = new Date(u.createdAt);
        return ud.getMonth() === d.getMonth() && ud.getFullYear() === d.getFullYear();
      }).length;
      monthlyUsers.push({ month: monthName, users: count });
    }

    res.status(200).json({
      success: true,
      data: {
        kpis: { totalUsers, totalOrders, totalProducts, totalRevenue },
        monthlySales,
        orderStatusData,
        monthlyUsers,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
