let mockFacilities = [
    { id: 'PHC-NORTH', name: 'Primary Health Center (North)', type: 'PHC', location: 'Surya Nagar', total_beds: 50, critical_alerts: 1, footfall_avg: 450 },
    { id: 'CHC-CENTRAL', name: 'Community Health Center (Central)', type: 'CHC', location: 'Kaveri District', total_beds: 150, critical_alerts: 0, footfall_avg: 1200 },
    { id: 'PHC-EAST', name: 'Primary Health Center (East)', type: 'PHC', location: 'Indira Nagar', total_beds: 30, critical_alerts: 3, footfall_avg: 210 },
    { id: 'PHC-WEST', name: 'Primary Health Center (West)', type: 'PHC', location: 'Surya Nagra', total_beds: 45, critical_alerts: 0, footfall_avg: 300 },
    { id: 'PHC-SOUTH-PHC-Outskirts', name: 'Primary Health Center (South)', type: 'PHC', location: 'Outskirts', total_beds: 60, critical_alerts: 1, footfall_avg: 400 }
];

let mockUsers = [
    { username: 'admin', password: 'password', role: 'admin', center_id: null },
    { username: 'phc-north', password: 'password', role: 'staff', center_id: 'PHC-NORTH' },
    { username: 'chc-central', password: 'password', role: 'staff', center_id: 'CHC-CENTRAL' },
    { username: 'mla_user', password: 'password', role: 'mla', center_id: null },
    { username: 'phc-west', password: 'password', role: 'staff', center_id: 'PHC-WEST' }
];

let mockLogistics = [
    { id: 'bed-1', center_id: 'PHC-NORTH', category: 'bed_capacity', itempayload: { type: 'ICU Beds', total: 10, occupied: 8, available: 2 } },
    { id: 'bed-2', center_id: 'PHC-NORTH', category: 'bed_capacity', itempayload: { type: 'General Wards', total: 40, occupied: 30, available: 10 } },
    { id: 'med-1', center_id: 'PHC-NORTH', category: 'consumables', itempayload: { type: 'Paracetamol 500mg', quantity: 500, unit: 'strips', status: 'Optimal' } },
    { id: 'eq-1', center_id: 'PHC-NORTH', category: 'equipment', itempayload: { type: 'Ventilators', total: 2, functional: 2, maintenance: 0 } }
];

let mockLogs = [];
let mockMessages = [];
let mockAlerts = [];

export const query = async (text, params = []) => {
    let q = text.toLowerCase();

    // -- DASHBOARD --
    if (q.includes('dashboard_overview')) {
        return { rows: [{ total_facilities: mockFacilities.length, total_beds: 285, overall_occupancy: 65, active_alerts: 5, pending_transfers: 2 }] };
    }

    // -- FACILITIES --
    if (q.includes('select * from facilities')) {
        return { rows: mockFacilities };
    }
    if (q.includes('insert into facilities')) {
        const [id, name, type, location, total_beds, critical_alerts, footfall_avg] = params;
        const newFac = { id, name, type, location, total_beds, critical_alerts, footfall_avg };
        mockFacilities.push(newFac);
        return { rows: [newFac] };
    }

    // -- USERS / LOGIN --
    if (q.includes('select * from users')) {
        if (q.includes('where username = $1')) {
            const user = mockUsers.find(u => u.username === params[0]);
            return { rows: user ? [user] : [] };
        }
        return { rows: mockUsers };
    }
    if (q.includes('insert into users')) {
        const [username, password, role, center_id] = params;
        const newUser = { username, password, role, center_id };
        mockUsers.push(newUser);
        return { rows: [newUser] };
    }

    // -- INVENTORY / LOGISTICS --
    if (q.includes('select * from inventory where center_id')) {
        const items = mockLogistics.filter(l => l.center_id === params[0]);
        return { rows: items };
    }
    if (q.includes('select * from all_logistics')) {
        const all = mockLogistics.map(l => ({ ...l, itempayload: typeof l.itempayload === 'string' ? JSON.parse(l.itempayload) : l.itempayload }));
        return { rows: [{ data: all }] };
    }
    if (q.includes('insert into logistics')) {
        const [center_id, category, itemPayload] = params;
        const newItem = { id: 'item-' + Date.now(), center_id, category, itempayload: typeof itemPayload === 'string' ? JSON.parse(itemPayload) : itemPayload };
        mockLogistics.push(newItem);
        return { rows: [newItem] };
    }
    if (q.includes('update logistics')) {
        let payload = params[0];
        let id = params[1];
        if (typeof payload === 'string' && payload.startsWith('PHC')) {
            // It's the old bug parameter order! We handle both!
            payload = params[3];
            id = params[2];
        }
        const parsed = typeof payload === 'string' ? JSON.parse(payload) : payload;
        const idx = mockLogistics.findIndex(l => l.id === id);
        if (idx >= 0) {
            mockLogistics[idx].itempayload = parsed;
            return { rows: [mockLogistics[idx]] };
        }
        return { rows: [] };
    }
    if (q.includes('delete from logistics')) {
        let id = params[0];
        if (typeof id === 'string' && id.startsWith('PHC')) {
            id = params[2]; // handle bug order
        }
        const idx = mockLogistics.findIndex(l => l.id === id);
        if (idx >= 0) {
            const del = mockLogistics.splice(idx, 1);
            return { rows: [del[0]] };
        }
        return { rows: [] };
    }

    // -- LOGS --
    if (q.includes('select * from daily_logs')) {
        return { rows: mockLogs };
    }
    if (q.includes('insert into daily_logs')) {
        const [center_id, type, item_name, qty_or_notes] = params;
        const newLog = { id: Date.now(), center_id, type, item_name, qty_or_notes, created_at: new Date() };
        mockLogs.push(newLog);
        return { rows: [newLog] };
    }

    // -- MESSAGES --
    if (q.includes('select * from messages')) {
        return { rows: mockMessages };
    }
    if (q.includes('insert into messages')) {
        const [sender_id, receiver_id, content] = params;
        const newMsg = { id: Date.now(), sender_id, receiver_id, content, timestamp: new Date() };
        mockMessages.push(newMsg);
        return { rows: [newMsg] };
    }
    
    // -- ALERTS --
    if (q.includes('insert into alerts')) {
        const [center_id, type, priority, message, action] = params;
        mockAlerts.push({ center_id, type, priority, message, action });
        return { rows: [] };
    }

    // If it's something else, return empty
    console.log('[MOCK DB] Unhandled Query:', text);
    return { rows: [] };
};

export const pool = { query };
export default pool;
