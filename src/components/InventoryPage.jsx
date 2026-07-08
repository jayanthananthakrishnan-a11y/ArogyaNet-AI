import React, { useState, useEffect } from 'react';
import { Package, AlertTriangle, CheckCircle2, TrendingDown, RefreshCcw, Stethoscope, Truck, Bed, ArrowRightLeft, Sparkles, ClipboardList, Plus, Trash2, Edit2, Activity, Hospital } from 'lucide-react';
import GlowCard from './ui/GlowCard';
import { useAuth } from '../AuthContext';
import { useLanguage } from '../LanguageContext';
import { useLocation, useNavigate } from 'react-router-dom';

const InventoryPage = () => {
    const { user } = useAuth();
    const { t, language } = useLanguage();
    const isObserver = user?.role === 'admin' || user?.role === 'mla';
    const location = useLocation();
    const navigate = useNavigate();
    const queryParams = new URLSearchParams(location.search);

    // Admin views the center in the URL, Staff views their own center
    const targetCenterId = user?.center_id;

    const [data, setData] = useState(null);
    const [facilitiesList, setFacilitiesList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('consumables');
    const [submittingLogId, setSubmittingLogId] = useState(null);

    // Form State
    const [showAddForm, setShowAddForm] = useState(false);
    const [formData, setFormData] = useState({});

    // Filtering State (Phase 3)
    const [filterFacility, setFilterFacility] = useState('ALL');
    const [filterStatus, setFilterStatus] = useState('ALL');
    const [filterShortage, setFilterShortage] = useState('ALL');

    const [referralMsg, setReferralMsg] = useState(null);

    const fetchLogistics = async () => {
        setLoading(true);
        try {
            if (isObserver) {
                const res = await fetch(`/api/district/facilities?lang=${language}`);
                const json = await res.json();
                setFacilitiesList(json);
            } else {
                const res = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/inventory/${targetCenterId}`);
                const json = await res.json();
                setData(json);
            }
        } catch (err) {
            console.error("Failed to fetch", err);
    } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLogistics();
    }, [targetCenterId, filterFacility, language]);

    const handleLogConsumption = async (item, e) => {
        e.preventDefault();
        const qtyUsed = parseInt(e.target.quantity_used.value);
        if (isNaN(qtyUsed) || qtyUsed <= 0) return;

        setSubmittingLogId(item.id);
        try {
            await fetch(`/api/logs/add`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ center_id: targetCenterId, type: 'consumption', item_name: item.name, qty_or_notes: qtyUsed, inventory_id: item.id })
            });
            e.target.reset();
            await fetchLogistics();
        } catch (err) { console.error(err); } finally { setSubmittingLogId(null); }
    };

    const handleLogDefect = async (item, e) => {
        e.preventDefault();
        const notes = e.target.notes.value;
        if (!notes) return;

        setSubmittingLogId(item.id);
        try {
            await fetch(`/api/logs/add`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ center_id: targetCenterId, type: 'defect', item_name: item.name, qty_or_notes: notes, inventory_id: item.id })
            });
            e.target.reset();
            await fetchLogistics();
        } catch (err) { console.error(err); } finally { setSubmittingLogId(null); }
    };

    const handleEquipmentStatusToggle = async (item, newStatus) => {
        try {
            const res = await fetch(`/api/equipment/status`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ center_id: targetCenterId, equipment_id: item.id, new_status: newStatus })
            });
            const data = await res.json();
            if (data.referral) {
                setReferralMsg(`${item.name} marked Unavailable. ${data.referral}`);
                setTimeout(() => setReferralMsg(null), 8000);
            }
            await fetchLogistics();
        } catch (err) { console.error(err); }
    };

    const handleAddItem = async (e) => {
        e.preventDefault();
        try {
            await fetch(`/api/inventory/add`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ center_id: targetCenterId, category: activeTab, itemData: formData })
            });
            setShowAddForm(false);
            setFormData({});
            await fetchLogistics();
        } catch (err) { console.error(err); }
    };

    const handleDeleteItem = async (id) => {
        if (!window.confirm('Delete this item completely?')) return;
        try {
            await fetch(`/api/inventory/delete`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ center_id: targetCenterId, category: activeTab, id })
            });
            await fetchLogistics();
        } catch (err) { console.error(err); }
    };

    const getStatus = (quantity, threshold) => {
        if (quantity <= threshold * 0.2) return { text: 'CRITICAL', color: 'text-neon-rose', bg: 'bg-neon-rose/20', border: 'border-neon-rose/30', icon: AlertTriangle };
        if (quantity <= threshold) return { text: 'LOW STOCK', color: 'text-amber-400', bg: 'bg-amber-400/20', border: 'border-amber-400/30', icon: TrendingDown };
        return { text: 'OPTIMAL', color: 'text-neon-teal', bg: 'bg-neon-teal/20', border: 'border-neon-teal/30', icon: CheckCircle2 };
    };

    const tabs = [
        { id: 'consumables', label: 'Consumables', icon: Package },
        { id: 'equipment', label: 'Medical Equipment', icon: Stethoscope },
        { id: 'transport', label: 'Ambulances', icon: Truck },
        { id: 'beds', label: 'Bed Capacity', icon: Bed },
    ];

    return (
        <div className="space-y-6 max-w-7xl mx-auto pb-10 font-sans">
<div className="flex justify-between items-end mb-8">
         <div>
             <h2 className="text-2xl font-black text-white uppercase tracking-widest flex items-center gap-3">
                 <Package className="text-neon-cyan drop-shadow-glow-cyan" />
                 {isObserver ? `${ t('logistics') }: ${ targetCenterId || 'ALL' } ` : t('daily_ops')}
             </h2>
             <p className="text-slate-400 text-xs font-mono uppercase tracking-widest mt-1">Real-time Stock, Assets & Beds</p>
         </div>
        {/* Show Action controls only if Staff */}
        {!isObserver && (
            <button onClick={() => setShowAddForm(!showAddForm)} className="bg-neon-cyan/20 text-neon-cyan px-4 py-2 rounded-lg font-bold uppercase tracking-widest text-xs border border-neon-cyan/40 hover:bg-neon-cyan/30 transition-colors shadow-glow-cyan flex items-center gap-2">
                <Plus size={16} />
                Add Item
            </button>
        )}
      </div>

      {isObserver && (
          <div className="bg-black/60 border border-white/10 p-4 rounded-xl mb-6 flex flex-wrap gap-4 items-center shadow-lg">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <Activity size={14} className="text-neon-cyan" /> Filters:
              </span>
              <select value={filterFacility} onChange={e => setFilterFacility(e.target.value)} className="bg-black/40 border border-white/20 rounded-lg px-3 py-2 text-xs font-bold text-white uppercase focus:border-neon-cyan outline-none">
                  <option value="ALL">All Facilities</option>
                  <option value="PHC-NORTH">PHC-NORTH</option>
                  <option value="CHC-CENTRAL">CHC-CENTRAL</option>
                  <option value="PHC-EAST">PHC-EAST</option>
              </select>
              <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="bg-black/40 border border-white/20 rounded-lg px-3 py-2 text-xs font-bold text-white uppercase focus:border-neon-cyan outline-none">
                  <option value="ALL">All Statuses</option>
                  <option value="CRITICAL">Critical Only</option>
                  <option value="NORMAL">Normal Only</option>
              </select>
              <select value={filterShortage} onChange={e => setFilterShortage(e.target.value)} className="bg-black/40 border border-white/20 rounded-lg px-3 py-2 text-xs font-bold text-white uppercase focus:border-neon-cyan outline-none">
                  <option value="ALL">Staff: All</option>
                  <option value="SHORTAGE">Staff: Shortage</option>
              </select>
          </div>
      )}

      {referralMsg && (
          <div className="bg-amber-500/10 border border-amber-500/50 p-4 rounded-xl mb-6 shadow-[0_0_15px_rgba(245,158,11,0.2)] flex items-start gap-3 animate-in fade-in slide-in-from-top-4">
              <AlertTriangle className="text-amber-400 shrink-0 mt-0.5" size={20} />
              <div>
                  <h4 className="text-amber-400 text-sm font-black uppercase tracking-widest">AI Referral Triggered</h4>
                  <p className="text-slate-300 text-sm mt-1">{referralMsg}</p>
              </div>
          </div>
      )}

      {/* Tabs (Staff Only) */}
      {!isObserver && (
      <div className="flex space-x-2 border-b border-white/10 pb-4">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => { setActiveTab(tab.id); setShowAddForm(false); }}
            className={`flex items - center gap - 2 px - 6 py - 3 rounded - lg text - sm font - bold uppercase tracking - widest transition - all ${
        activeTab === tab.id
            ? 'bg-neon-cyan/20 text-neon-cyan border border-neon-cyan/50 shadow-glow-cyan'
            : 'text-slate-400 hover:bg-white/5 hover:text-white border border-transparent'
    } `}
          >
            <tab.icon size={18} />
            {tab.label}
          </button>
        ))}
      </div>
      )}

      <GlowCard accent="default" className="overflow-hidden p-0 border-white/10">
         <div className="overflow-x-auto custom-scrollbar">
             <table className="w-full text-left border-collapse min-w-[800px]">
                 
                 {/* Admin Facility Grid */}
                 {isObserver && (
                   <>
                     <thead>
                         <tr className="border-b border-white/10 bg-black/40">
                             <th className="p-4 pl-6 text-xs font-bold text-slate-400 uppercase tracking-widest">Facility Name</th>
                             <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Type</th>
                             <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-widest">{t('staff_shortage')} %</th>
                             <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-widest">{t('status')}</th>
                         </tr>
                     </thead>
                     <tbody className="divide-y divide-white/5">
                         {facilitiesList
                            .filter(f => filterFacility === 'ALL' || f.id === filterFacility)
                            .filter(f => {
                                if (filterStatus === 'ALL') return true;
                                const status = f.critical_alerts > 0 ? 'CRITICAL' : 'NORMAL';
                                return status === filterStatus;
                            })
                            .filter(f => filterShortage === 'ALL' || (filterShortage === 'SHORTAGE' && (f.staff_shortage || 0) > 0))
                            .map((fac) => (
                             <tr key={fac.id} onClick={() => navigate(`/ facility / ${ fac.id } `)} className="border-b border-white/5 hover:bg-white/5 transition-colors cursor-pointer group">
                                 <td className="p-4 pl-6 flex items-center gap-3">
                                     <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-400">
                                         <Hospital size={16} />
                                     </div>
                                     <span className="font-bold text-slate-200 group-hover:text-neon-cyan transition-colors">{fac.id}</span>
                                 </td>
                                 <td className="p-4 text-xs text-slate-400">{fac.type}</td>
                                 <td className="p-4">
                                     <span className={`px - 2 py - 1 rounded text - xs font - mono font - bold ${ (fac.staff_shortage || 0) > 15 ? 'text-rose-400 bg-rose-400/20' : 'text-neon-teal bg-neon-teal/20' } `}>
                                         {fac.staff_shortage || 0}%
                                     </span>
                                 </td>
                                 <td className="p-4">
                                     <span className={`flex items - center gap - 2 text - xs font - bold font - mono ${ fac.critical_alerts > 0 ? 'text-rose-400' : 'text-neon-teal' } `}>
                                         {fac.critical_alerts > 0 ? <AlertTriangle size={14}/> : <CheckCircle2 size={14}/>}
                                         {fac.critical_alerts > 0 ? t('critical') : t('normal')}
                                     </span>
                                 </td>
                             </tr>
                         ))}
                     </tbody>
                   </>
                 )}

                 {/* Consumables Table */}
                 {activeTab === 'consumables' && !isObserver && data && (
                   <>
                     <thead>
                         <tr className="border-b border-white/10 bg-black/40">
                             <th className="p-4 pl-6 text-xs font-bold text-slate-400 uppercase tracking-widest">Item Name & Details</th>
                             <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-widest">AI Forecast</th>
                             <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Status & Expiry</th>
                             <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Stock Level</th>
                             {!isObserver && <th className="p-4 pr-6 text-xs font-bold text-slate-400 uppercase tracking-widest text-right">Actions</th>}
                         </tr>
                     </thead>
                     <tbody className="divide-y divide-white/5">
                         {showAddForm && !isObserver && (
                             <tr className="bg-neon-purple/5">
                                 <td colSpan="5" className="p-4">
                                     <form onSubmit={handleAddItem} className="grid grid-cols-5 gap-4 items-center">
                                         <div className="col-span-5 flex flex-wrap gap-4">
                                             <input type="text" placeholder="Name (e.g. Zincovit)" required className="bg-black/50 border border-white/10 p-2 text-sm text-white rounded" onChange={e => setFormData({...formData, name: e.target.value, category: 'Medicine', ai_trend: 'Stable'})} />
                                             <input type="number" placeholder="Qty" required className="w-20 bg-black/50 border border-white/10 p-2 text-sm text-white rounded" onChange={e => setFormData({...formData, quantity: parseInt(e.target.value)})} />
                                             <input type="text" placeholder="Unit (e.g. bottles)" required className="w-32 bg-black/50 border border-white/10 p-2 text-sm text-white rounded" onChange={e => setFormData({...formData, unit: e.target.value})} />
                                             <input type="number" placeholder="Min Threshold" required className="w-32 bg-black/50 border border-white/10 p-2 text-sm text-white rounded" onChange={e => setFormData({...formData, threshold: parseInt(e.target.value)})} />
                                         </div>
                                         <div className="col-span-5 flex flex-wrap gap-4 mt-2">
                                             <input type="text" placeholder="Batch No" required className="w-32 bg-black/50 border border-white/10 p-2 text-sm text-white rounded" onChange={e => setFormData({...formData, batch_number: e.target.value})} />
                                             <input type="date" placeholder="Expiry Date" required className="bg-black/50 border border-white/10 p-2 text-sm text-white rounded" onChange={e => setFormData({...formData, expiry_date: e.target.value})} />
                                             <input type="text" placeholder="Supplier" required className="bg-black/50 border border-white/10 p-2 text-sm text-white rounded" onChange={e => setFormData({...formData, supplier: e.target.value})} />
                                             <input type="text" placeholder="Storage (e.g. Cold)" required className="bg-black/50 border border-white/10 p-2 text-sm text-white rounded" onChange={e => setFormData({...formData, storage_conditions: e.target.value})} />
                                             <button type="submit" className="bg-neon-cyan text-black px-6 py-2 rounded text-xs font-bold uppercase ml-auto">Save Item</button>
                                         </div>
                                     </form>
                                 </td>
                             </tr>
                         )}
                         {loading || !data ? (
                             <tr><td colSpan="5" className="p-12 text-center text-slate-500 font-mono text-xs uppercase animate-pulse">Loading live logistics stream...</td></tr>
                         ) : data.consumables.filter(item => {
                              if (filterStatus === 'ALL') return true;
                              const isCrit = item.quantity <= item.threshold;
                              if (filterStatus === 'CRITICAL' && isCrit) return true;
                              if (filterStatus === 'NORMAL' && !isCrit) return true;
                              return false;
                          }).map(item => {
                             const status = getStatus(item.quantity, item.threshold);
                             const StatusIcon = status.icon;
                             
                             return (
                                 <tr key={item.id} className="hover:bg-white/5 transition-colors group">
                                     <td className="p-4 pl-6 font-semibold text-slate-200">
                                        <div className="flex flex-col">
                                            <span>{item.name}</span>
                                            <span className="text-[10px] text-slate-500 uppercase mt-1 tracking-widest">{item.category} • Supplier: {item.supplier || 'N/A'}</span>
                                            <span className="text-[10px] text-slate-500 font-mono mt-0.5">Batch: {item.batch_number || 'N/A'} • Storage: {item.storage_conditions || 'Standard'}</span>
                                        </div>
                                     </td>
                                     <td className="p-4">
                                         <span className="flex items-center gap-1.5 text-xs text-neon-cyan font-mono">
                                            <Sparkles size={12} />
                                            {item.ai_trend}
                                         </span>
                                     </td>
                                     <td className="p-4 flex flex-col items-start gap-1">
                                         <span className={`inline - flex items - center gap - 1.5 px - 2.5 py - 1 rounded border text - [10px] font - bold uppercase tracking - wider ${ status.bg } ${ status.color } ${ status.border } `}>
                                             <StatusIcon size={12} />
                                             {status.text}
                                         </span>
                                         {item.expiry_date && (
                                             <span className={`text - [10px] font - mono mt - 1 ${ new Date(item.expiry_date) < new Date(Date.now() + 90 * 24 * 60 * 60 * 1000) ? 'text-amber-400' : 'text-slate-500' } `}>
                                                 EXP: {new Date(item.expiry_date).toLocaleDateString()}
                                             </span>
                                         )}
                                     </td>
                                     <td className="p-4">
                                         <div className="flex items-end gap-2">
                                             <span className="text-xl font-black text-white">{item.quantity}</span>
                                             <span className="text-xs text-slate-500 font-mono mb-1">{item.unit} / {item.threshold} (min)</span>
                                         </div>
                                     </td>
                                     {!isObserver && (
                                     <td className="p-4 pr-6 flex justify-end gap-4 items-center">
                                         <form onSubmit={(e) => handleLogConsumption(item, e)} className="flex items-center gap-2 border-r border-white/10 pr-4">
                                             <input type="number" name="quantity_used" placeholder={`Qty(${ item.unit })`} className="w-24 bg-black/40 border border-white/10 rounded-lg px-3 py-1.5 text-white text-sm focus:outline-none focus:border-neon-purple/50 font-mono text-right" required />
                                             <button type="submit" disabled={submittingLogId === item.id} className="bg-neon-purple/20 hover:bg-neon-purple/30 border border-neon-purple/50 text-neon-purple px-4 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-colors disabled:opacity-50 shadow-glow-purple">Log</button>
                                         </form>
                                         <button onClick={() => handleDeleteItem(item.id)} className="text-rose-500/50 hover:text-rose-400 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={16} /></button>
                                     </td>
                                     )}
                                 </tr>
                             );
                         })}
                     </tbody>
                   </>
                 )}

                 {/* Equipment Table */}
                 {activeTab === 'equipment' && !isObserver && data && (
                   <>
                     <thead>
                         <tr className="border-b border-white/10 bg-black/40">
                             <th className="p-4 pl-6 text-xs font-bold text-slate-400 uppercase tracking-widest">Equipment Name</th>
                             <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Status</th>
                             <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Last Serviced</th>
                             {!isObserver && <th className="p-4 pr-6 text-xs font-bold text-slate-400 uppercase tracking-widest text-right">Actions</th>}
                         </tr>
                     </thead>
                     <tbody className="divide-y divide-white/5">
                         {showAddForm && !isObserver && (
                             <tr className="bg-neon-purple/5">
                                 <td colSpan="4" className="p-4">
                                     <form onSubmit={handleAddItem} className="flex gap-4 items-center">
                                         <input type="text" placeholder="Name (e.g. MRI Scanner)" required className="bg-black/50 border border-white/10 p-2 text-sm text-white rounded" onChange={e => setFormData({...formData, name: e.target.value})} />
                                         <select className="bg-black/50 border border-white/10 p-2 text-sm text-white rounded" onChange={e => setFormData({...formData, status: e.target.value})}>
                                            <option>Functional</option><option>Maintenance</option>
                                         </select>
                                         <input type="date" required className="bg-black/50 border border-white/10 p-2 text-sm text-white rounded" onChange={e => setFormData({...formData, last_serviced_date: e.target.value})} />
                                         <button type="submit" className="bg-neon-cyan text-black px-4 py-2 rounded text-xs font-bold uppercase">Save</button>
                                     </form>
                                 </td>
                             </tr>
                         )}
                         {data?.equipment.filter(item => {
                              if (filterStatus === 'ALL') return true;
                              if (filterStatus === 'CRITICAL' && item.status !== 'Functional') return true;
                              if (filterStatus === 'NORMAL' && item.status === 'Functional') return true;
                              return false;
                          }).map(item => (
                             <tr key={item.id} className="hover:bg-white/5 transition-colors group">
                                 <td className="p-4 pl-6 font-semibold text-slate-200">{item.name}</td>
                                 <td className="p-4">
                                     <span className={`inline - flex items - center gap - 1.5 px - 2.5 py - 1 rounded border text - [10px] font - bold uppercase tracking - wider ${
        item.status === 'Functional' ? 'bg-neon-teal/20 text-neon-teal border-neon-teal/30' :
            item.status === 'Unavailable' ? 'bg-rose-500/20 text-rose-400 border-rose-500/30' :
                'bg-amber-400/20 text-amber-400 border-amber-400/30'
    } `}>
                                         {item.status}
                                     </span>
                                 </td>
                                 <td className="p-4 text-sm text-slate-400 font-mono">{item.last_serviced_date}</td>
                                 {!isObserver && (
                                     <td className="p-4 pr-6 flex justify-end gap-3 items-center">
                                         <select 
                                            value={item.status}
                                            onChange={(e) => handleEquipmentStatusToggle(item, e.target.value)}
                                            className="bg-black/40 border border-white/10 rounded-lg px-2 py-1.5 text-xs text-slate-300 font-bold uppercase focus:border-neon-cyan outline-none"
                                         >
                                             <option value="Functional">Functional</option>
                                             <option value="Maintenance">Maintenance</option>
                                             <option value="Unavailable">Unavailable</option>
                                         </select>
                                         <form onSubmit={(e) => handleLogDefect(item, e)} className="flex items-center gap-2 border-l border-white/10 pl-3">
                                             <input type="text" name="notes" placeholder="Notes..." className="w-32 bg-black/40 border border-white/10 rounded-lg px-3 py-1.5 text-white text-xs focus:outline-none focus:border-rose-500/50" required />
                                             <button type="submit" disabled={submittingLogId === item.id} className="bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/50 text-rose-400 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-colors disabled:opacity-50">Log</button>
                                         </form>
                                         <button onClick={() => handleDeleteItem(item.id)} className="text-rose-500/50 hover:text-rose-400 opacity-0 group-hover:opacity-100 transition-opacity ml-2"><Trash2 size={16} /></button>
                                     </td>
                                 )}
                             </tr>
                         ))}
                     </tbody>
                   </>
                 )}

                 {/* Transport Table */}
                 {activeTab === 'transport' && !isObserver && data && (
                   <>
                     <thead>
                         <tr className="border-b border-white/10 bg-black/40">
                             <th className="p-4 pl-6 text-xs font-bold text-slate-400 uppercase tracking-widest">Vehicle Identifier</th>
                             <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Operational Status</th>
                             <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Fuel Level</th>
                             <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Driver Contact</th>
                             {!isObserver && <th className="p-4 pr-6 text-xs font-bold text-slate-400 uppercase tracking-widest text-right">Actions</th>}
                         </tr>
                     </thead>
                     <tbody className="divide-y divide-white/5">
                         {showAddForm && !isObserver && (
                             <tr className="bg-neon-purple/5">
                                 <td colSpan="5" className="p-4">
                                     <form onSubmit={handleAddItem} className="flex gap-4 items-center">
                                         <input type="text" placeholder="Name (e.g. Ambulance A4)" required className="bg-black/50 border border-white/10 p-2 text-sm text-white rounded" onChange={e => setFormData({...formData, name: e.target.value})} />
                                         <select className="bg-black/50 border border-white/10 p-2 text-sm text-white rounded" onChange={e => setFormData({...formData, status: e.target.value})}>
                                            <option>Available</option><option>In-Transit</option><option>Maintenance</option>
                                         </select>
                                         <input type="text" placeholder="Fuel %" required className="w-20 bg-black/50 border border-white/10 p-2 text-sm text-white rounded" onChange={e => setFormData({...formData, fuel_level: e.target.value})} />
                                         <input type="text" placeholder="Contact" required className="w-32 bg-black/50 border border-white/10 p-2 text-sm text-white rounded" onChange={e => setFormData({...formData, driver_contact: e.target.value})} />
                                         <button type="submit" className="bg-neon-cyan text-black px-4 py-2 rounded text-xs font-bold uppercase">Save</button>
                                     </form>
                                 </td>
                             </tr>
                         )}
                         {data?.transport.filter(item => {
                              if (filterStatus === 'ALL') return true;
                              if (filterStatus === 'CRITICAL' && item.status !== 'Available') return true;
                              if (filterStatus === 'NORMAL' && item.status === 'Available') return true;
                              return false;
                          }).map(item => (
                             <tr key={item.id} className="hover:bg-white/5 transition-colors group">
                                 <td className="p-4 pl-6 font-semibold text-slate-200">{item.name}</td>
                                 <td className="p-4">
                                     <span className={`inline - flex items - center gap - 1.5 px - 2.5 py - 1 rounded border text - [10px] font - bold uppercase tracking - wider ${
        item.status === 'Available' ? 'bg-neon-teal/20 text-neon-teal border-neon-teal/30' :
            item.status === 'In-Transit' ? 'bg-neon-cyan/20 text-neon-cyan border-neon-cyan/30' :
                'bg-rose-500/20 text-rose-400 border-rose-500/30'
    } `}>
                                         {item.status}
                                     </span>
                                 </td>
                                 <td className="p-4 text-sm text-slate-300 font-mono">{item.fuel_level}</td>
                                 <td className="p-4 text-sm text-slate-400 font-mono">{item.driver_contact}</td>
                                 {!isObserver && (
                                     <td className="p-4 pr-6 text-right">
                                        <button onClick={() => handleDeleteItem(item.id)} className="text-rose-500/50 hover:text-rose-400 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={16} /></button>
                                     </td>
                                 )}
                             </tr>
                         ))}
                     </tbody>
                   </>
                 )}

                 {/* Beds Table */}
                 {activeTab === 'beds' && !isObserver && data && (
                   <>
                     <thead>
                         <tr className="border-b border-white/10 bg-black/40">
                             <th className="p-4 pl-6 text-xs font-bold text-slate-400 uppercase tracking-widest">Ward Type</th>
                             <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Total Capacity</th>
                             <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Occupancy</th>
                             <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Availability</th>
                             {!isObserver && <th className="p-4 pr-6 text-xs font-bold text-slate-400 uppercase tracking-widest text-right">Actions</th>}
                         </tr>
                     </thead>
                     <tbody className="divide-y divide-white/5">
                         {showAddForm && !isObserver && (
                             <tr className="bg-neon-purple/5">
                                 <td colSpan="5" className="p-4">
                                     <form onSubmit={handleAddItem} className="flex gap-4 items-center">
                                         <input type="text" placeholder="Ward Name" required className="bg-black/50 border border-white/10 p-2 text-sm text-white rounded" onChange={e => setFormData({...formData, ward_type: e.target.value})} />
                                         <input type="number" placeholder="Total" required className="w-24 bg-black/50 border border-white/10 p-2 text-sm text-white rounded" onChange={e => setFormData({...formData, total_beds: parseInt(e.target.value)})} />
                                         <input type="number" placeholder="Occupied" required className="w-24 bg-black/50 border border-white/10 p-2 text-sm text-white rounded" onChange={e => setFormData({...formData, occupied_beds: parseInt(e.target.value)})} />
                                         <button type="submit" className="bg-neon-cyan text-black px-4 py-2 rounded text-xs font-bold uppercase">Save</button>
                                     </form>
                                 </td>
                             </tr>
                         )}
                         {data?.beds.filter(item => {
                              const isFull = item.occupied_beds >= item.total_beds;
                              if (filterStatus === 'ALL') return true;
                              if (filterStatus === 'CRITICAL' && isFull) return true;
                              if (filterStatus === 'NORMAL' && !isFull) return true;
                              return false;
                          }).map(item => {
                             const isFull = item.occupied_beds >= item.total_beds;
                             return (
                             <tr key={item.id} className="hover:bg-white/5 transition-colors group">
                                 <td className="p-4 pl-6 font-semibold text-slate-200">{item.ward_type}</td>
                                 <td className="p-4 text-sm text-slate-300 font-mono">{item.total_beds}</td>
                                 <td className="p-4 text-sm text-slate-300 font-mono">{item.occupied_beds}</td>
                                 <td className="p-4">
                                     <span className={`inline - flex items - center gap - 1.5 px - 2.5 py - 1 rounded border text - [10px] font - bold uppercase tracking - wider ${
        isFull ? 'bg-rose-500/20 text-rose-400 border-rose-500/30' : 'bg-neon-teal/20 text-neon-teal border-neon-teal/30'
    } `}>
                                         {isFull ? 'AT CAPACITY' : `${ item.total_beds - item.occupied_beds } AVAILABLE`}
                                     </span>
                                 </td>
                                 {!isObserver && (
                                     <td className="p-4 pr-6 text-right">
                                        <button onClick={() => handleDeleteItem(item.id)} className="text-rose-500/50 hover:text-rose-400 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={16} /></button>
                                     </td>
                                 )}
                             </tr>
                         )})}
                     </tbody>
                   </>
                 )}

             </table>
         </div>
      </GlowCard>
    </div>
  );
};

export default InventoryPage;
