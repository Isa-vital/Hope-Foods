import React, { useEffect, useState } from 'react';
import { RefreshCw, Filter, User, Clock, Globe } from 'lucide-react';
import { activityLogsApi } from '@/lib/api';
import { Button } from '@/components/ui/button';

const actionColor = (action) => {
  if (action.includes('login')) return 'bg-blue-100 text-blue-800';
  if (action.includes('create')) return 'bg-green-100 text-green-800';
  if (action.includes('update')) return 'bg-amber-100 text-amber-800';
  if (action.includes('delete') || action.includes('cancel')) return 'bg-red-100 text-red-800';
  return 'bg-stone-100 text-stone-700';
};

const AdminActivityLogPage = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ action: '', entity_type: '', from: '', to: '' });
  const [expanded, setExpanded] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const params = Object.fromEntries(Object.entries(filters).filter(([, v]) => v));
      const res = await activityLogsApi.list(params);
      setLogs(res.data || []);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { load(); }, []);

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-3xl font-serif font-bold text-stone-900">Activity Log</h1>
          <p className="text-stone-600 text-sm">{logs.length} recent event(s)</p>
        </div>
        <Button variant="outline" size="sm" onClick={load}><RefreshCw size={16} className="mr-1" />Refresh</Button>
      </div>

      <div className="bg-white rounded-2xl shadow-md p-4 mb-4">
        <div className="flex items-center gap-2 mb-3">
          <Filter size={16} className="text-stone-500" />
          <span className="text-sm font-semibold text-stone-700">Filters</span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <input type="text" placeholder="Action contains..." value={filters.action}
            onChange={(e) => setFilters({ ...filters, action: e.target.value })}
            className="px-3 py-2 border border-stone-300 rounded-lg text-sm" />
          <select value={filters.entity_type} onChange={(e) => setFilters({ ...filters, entity_type: e.target.value })}
            className="px-3 py-2 border border-stone-300 rounded-lg text-sm">
            <option value="">All entities</option>
            <option value="user">User</option>
            <option value="order">Order</option>
            <option value="booking">Booking</option>
            <option value="menu_item">Menu Item</option>
            <option value="inventory_item">Inventory Item</option>
          </select>
          <input type="date" value={filters.from} onChange={(e) => setFilters({ ...filters, from: e.target.value })}
            className="px-3 py-2 border border-stone-300 rounded-lg text-sm" />
          <input type="date" value={filters.to} onChange={(e) => setFilters({ ...filters, to: e.target.value })}
            className="px-3 py-2 border border-stone-300 rounded-lg text-sm" />
          <Button onClick={load} className="bg-orange-600 hover:bg-orange-700 text-white">Apply</Button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-10 w-10 border-4 border-orange-600 border-t-transparent" />
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-stone-50 text-stone-600 uppercase text-xs">
                <tr>
                  <th className="text-left p-3">When</th>
                  <th className="text-left p-3">User</th>
                  <th className="text-left p-3">Action</th>
                  <th className="text-left p-3 hidden md:table-cell">Entity</th>
                  <th className="text-left p-3 hidden lg:table-cell">Description</th>
                  <th className="text-left p-3 hidden lg:table-cell">IP</th>
                </tr>
              </thead>
              <tbody>
                {logs.length === 0 ? (
                  <tr><td colSpan="6" className="p-8 text-center text-stone-500">No activity recorded yet.</td></tr>
                ) : logs.map((log) => (
                  <React.Fragment key={log.id}>
                    <tr onClick={() => setExpanded(expanded === log.id ? null : log.id)}
                      className="border-t border-stone-100 hover:bg-stone-50 cursor-pointer">
                      <td className="p-3 text-stone-600 whitespace-nowrap">
                        <Clock size={12} className="inline mr-1 text-stone-400" />
                        {new Date(log.created_at).toLocaleString()}
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-1.5">
                          <User size={12} className="text-stone-400" />
                          <span className="font-medium">{log.user_name || 'System'}</span>
                          {log.user_role && <span className="text-xs text-stone-500">({log.user_role})</span>}
                        </div>
                      </td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${actionColor(log.action)}`}>
                          {log.action}
                        </span>
                      </td>
                      <td className="p-3 hidden md:table-cell text-stone-600">
                        {log.entity_type ? `${log.entity_type}#${log.entity_id || '—'}` : '—'}
                      </td>
                      <td className="p-3 hidden lg:table-cell text-stone-700 max-w-xs truncate">{log.description || '—'}</td>
                      <td className="p-3 hidden lg:table-cell text-stone-500 text-xs">
                        <Globe size={11} className="inline mr-1" />{log.ip_address || '—'}
                      </td>
                    </tr>
                    {expanded === log.id && (
                      <tr className="bg-stone-50 border-t border-stone-100">
                        <td colSpan="6" className="p-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                            <div><span className="font-semibold">Description:</span> {log.description || '—'}</div>
                            <div><span className="font-semibold">User agent:</span> <span className="text-stone-600 break-all">{log.user_agent || '—'}</span></div>
                            {log.metadata && (
                              <div className="md:col-span-2">
                                <div className="font-semibold mb-1">Metadata:</div>
                                <pre className="bg-white border border-stone-200 rounded-lg p-2 overflow-x-auto text-xs">
                                  {typeof log.metadata === 'string' ? log.metadata : JSON.stringify(log.metadata, null, 2)}
                                </pre>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminActivityLogPage;
