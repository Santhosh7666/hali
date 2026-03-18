import React, { useState, useEffect } from 'react';
import Modal from './Modal.jsx';
import { Check } from 'lucide-react';

const WidgetSettingsModal = ({ isOpen, onClose, widget, onSave }) => {
  const [formData, setFormData] = useState(null);

  useEffect(() => {
    if (widget) {
      setFormData({
        title: widget.title,
        config: { ...widget.config }
      });
    }
  }, [widget]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ ...widget, ...formData });
    onClose();
  };

  if (!formData) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Widget Settings">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-1">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Widget Title</label>
          <input 
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl text-sm font-bold text-slate-900 focus:ring-2 focus:ring-indigo-500 transition-all"
            required
          />
        </div>

        <div className="space-y-1">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Metric</label>
          <select 
            value={formData.config.metric}
            onChange={(e) => setFormData({ ...formData, config: { ...formData.config, metric: e.target.value } })}
            className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl text-sm font-bold text-slate-900 focus:ring-2 focus:ring-indigo-500 transition-all"
          >
            <option value="Total Revenue">Total Revenue</option>
            <option value="Order Count">Order Count</option>
            <option value="Average Order Value">Average Order Value</option>
          </select>
        </div>

        <div className="space-y-1">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Theme Color</label>
          <div className="flex gap-2">
            {['#4F46E5', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'].map((color) => (
              <button
                key={color}
                type="button"
                onClick={() => setFormData({ ...formData, config: { ...formData.config, color } })}
                className={`w-8 h-8 rounded-full border-2 transition-all ${formData.config.color === color ? 'border-slate-900 scale-110' : 'border-transparent'}`}
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
        </div>

        <button 
          type="submit"
          className="w-full py-4 bg-slate-900 text-white rounded-2xl text-sm font-bold hover:bg-slate-800 transition-all flex items-center justify-center gap-2"
        >
          <Check className="w-5 h-5" />
          Apply Settings
        </button>
      </form>
    </Modal>
  );
};

export default WidgetSettingsModal;
