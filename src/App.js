import React, { useState, useEffect } from 'react';

const STATUSES = ["Applied", "OA", "Phone Screen", "Interview", "Offer", "Rejected"];
const STATUS_COLORS = {
  Applied: "#4E9FE5", OA: "#A78BFA", "Phone Screen": "#34D399",
  Interview: "#FBBF24", Offer: "#10B981", Rejected: "#F87171"
};
const API = "http://localhost:8080/api/applications";

export default function App() {
  const [jobs, setJobs] = useState([]);
  const [form, setForm] = useState({ company:'', role:'', status:'Applied', applyDate:'', link:'', notes:'' });
  const [editing, setEditing] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [activeTab, setActiveTab] = useState('list'); // list | dashboard

  useEffect(() => {
    fetch(API).then(r => r.json()).then(setJobs).catch(() => setJobs([]));
  }, []);

  const filtered = jobs
    .filter(j => filterStatus === 'All' || j.status === filterStatus)
    .filter(j =>
      j.company.toLowerCase().includes(search.toLowerCase()) ||
      j.role.toLowerCase().includes(search.toLowerCase())
    );

  const counts = STATUSES.reduce((acc, s) => ({ ...acc, [s]: jobs.filter(j => j.status === s).length }), {});

  function saveJob() {
    if (!form.company || !form.role) return alert("Company aur Role bharo!");
    const method = editing ? "PUT" : "POST";
    const url = editing ? `${API}/${editing}` : API;
    fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) })
      .then(r => r.json())
      .then(() => {
        fetch(API).then(r => r.json()).then(setJobs);
        setForm({ company:'', role:'', status:'Applied', applyDate:'', link:'', notes:'' });
        setEditing(null); setShowForm(false);
      });
  }

  function deleteJob(id) {
    fetch(`${API}/${id}`, { method: "DELETE" }).then(() => setJobs(jobs.filter(j => j.id !== id)));
  }

  function editJob(job) {
    setForm({ company: job.company, role: job.role, status: job.status,
      applyDate: job.applyDate || '', link: job.link || '', notes: job.notes || '' });
    setEditing(job.id); setShowForm(true);
  }

  return (
    <div style={s.root}>
      {/* Header */}
      <div style={s.header}>
        <div style={s.headerLeft}>
          <span style={s.logo}>◎ Trackr</span>
          <span style={s.badge}>BETA</span>
        </div>
        <button style={s.addBtn} onClick={() => { setShowForm(!showForm); setEditing(null);
          setForm({ company:'', role:'', status:'Applied', applyDate:'', link:'', notes:'' }); }}>
          {showForm ? '✕ Cancel' : '+ Add Application'}
        </button>
      </div>

      {/* Stats */}
      <div style={s.statsRow}>
        {[
          { label: 'Total', val: jobs.length, color: '#e2e8f0' },
          { label: 'Active', val: jobs.filter(j => !['Rejected','Offer'].includes(j.status)).length, color: '#4E9FE5' },
          { label: 'Offers', val: counts['Offer'], color: '#10B981' },
          { label: 'Rejected', val: counts['Rejected'], color: '#F87171' },
        ].map(st => (
          <div key={st.label} style={s.statCard}>
            <span style={{ ...s.statNum, color: st.color }}>{st.val}</span>
            <span style={s.statLabel}>{st.label}</span>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={s.tabs}>
        {['list','dashboard'].map(t => (
          <button key={t} style={{ ...s.tab, ...(activeTab === t ? s.tabActive : {}) }}
            onClick={() => setActiveTab(t)}>
            {t === 'list' ? '☰ Applications' : '📊 Dashboard'}
          </button>
        ))}
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <div style={s.formBox}>
          <h3 style={s.formTitle}>{editing ? '✎ Edit Application' : '+ New Application'}</h3>
          <div style={s.formGrid}>
            {[
              { label: 'Company *', key: 'company', type: 'text', placeholder: 'e.g. Google' },
              { label: 'Role *', key: 'role', type: 'text', placeholder: 'e.g. Software Engineer' },
              { label: 'Apply Date', key: 'applyDate', type: 'date' },
              { label: 'Job Link', key: 'link', type: 'text', placeholder: 'https://...' },
            ].map(f => (
              <div key={f.key}>
                <label style={s.label}>{f.label}</label>
                <input type={f.type} placeholder={f.placeholder} value={form[f.key]}
                  onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                  style={s.input} />
              </div>
            ))}
          </div>
          <div style={{ marginBottom: 12 }}>
            <label style={s.label}>Status</label>
            <div style={s.statusGrid}>
              {STATUSES.map(st => (
                <button key={st} onClick={() => setForm({ ...form, status: st })}
                  style={{ ...s.statusBtn, ...(form.status === st ? {
                    background: STATUS_COLORS[st] + '22',
                    borderColor: STATUS_COLORS[st], color: STATUS_COLORS[st]
                  } : {}) }}>
                  <span style={{ ...s.dot, background: STATUS_COLORS[st] }} />{st}
                </button>
              ))}
            </div>
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={s.label}>Notes</label>
            <textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })}
              placeholder="Koi notes..." style={{ ...s.input, height: 70, resize: 'vertical' }} />
          </div>
          <button onClick={saveJob} style={s.saveBtn}>{editing ? 'Update' : 'Save Application'}</button>
        </div>
      )}

      {/* List Tab */}
      {activeTab === 'list' && (
        <div>
          {/* Search + Filter */}
          <div style={s.controls}>
            <input placeholder="🔍  Search company or role..."
              value={search} onChange={e => setSearch(e.target.value)} style={s.search} />
            <div style={s.filterRow}>
              {['All', ...STATUSES].map(st => (
                <button key={st} onClick={() => setFilterStatus(st)}
                  style={{ ...s.filterBtn, ...(filterStatus === st ? {
                    background: st === 'All' ? '#1e2d45' : STATUS_COLORS[st] + '22',
                    borderColor: st === 'All' ? '#4E9FE5' : STATUS_COLORS[st],
                    color: st === 'All' ? '#e2e8f0' : STATUS_COLORS[st],
                  } : {}) }}>
                  {st !== 'All' && <span style={{ ...s.dot, background: STATUS_COLORS[st] }} />}
                  {st}
                  {st !== 'All' && counts[st] > 0 && <span style={s.pill}>{counts[st]}</span>}
                </button>
              ))}
            </div>
          </div>

          {/* Table */}
          <div style={s.tableWrap}>
            <table style={s.table}>
              <thead>
                <tr>
                  {['Company', 'Role', 'Status', 'Date', 'Notes', 'Actions'].map(h => (
                    <th key={h} style={s.th}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(job => (
                  <tr key={job.id} style={s.tr}>
                    <td style={s.td}>
                      <div style={s.companyCell}>
                        <div style={s.avatar}>{job.company[0]}</div>
                        <b style={{ color: '#f1f5f9' }}>{job.company}</b>
                      </div>
                    </td>
                    <td style={{ ...s.td, color: '#cbd5e1' }}>{job.role}</td>
                    <td style={s.td}>
                      <span style={{ ...s.statusBadge, background: STATUS_COLORS[job.status] + '22',
                        color: STATUS_COLORS[job.status], borderColor: STATUS_COLORS[job.status] }}>
                        <span style={{ ...s.dot, background: STATUS_COLORS[job.status] }} />{job.status}
                      </span>
                    </td>
                    <td style={{ ...s.td, color: '#64748b', fontSize: 13 }}>{job.applyDate || '—'}</td>
                    <td style={{ ...s.td, color: '#64748b', fontSize: 13, maxWidth: 150 }}>
                      <span style={s.noteClamp}>{job.notes || '—'}</span>
                    </td>
                    <td style={s.td}>
                      <button onClick={() => editJob(job)} style={s.editBtn}>✎ Edit</button>
                      <button onClick={() => deleteJob(job.id)} style={s.delBtn}>✕</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && (
              <p style={{ textAlign: 'center', color: '#475569', padding: 40 }}>
                Koi application nahi mili 📭
              </p>
            )}
          </div>
        </div>
      )}

      {/* Dashboard Tab */}
      {activeTab === 'dashboard' && (
        <div style={s.dashboard}>
          <h3 style={{ color: '#e2e8f0', marginBottom: 20 }}>📊 Application Overview</h3>

          {/* Bar Chart */}
          <div style={s.chartBox}>
            <h4 style={s.chartTitle}>Status Breakdown</h4>
            {STATUSES.map(st => {
              const count = counts[st];
              const pct = jobs.length > 0 ? (count / jobs.length) * 100 : 0;
              return (
                <div key={st} style={s.barRow}>
                  <span style={{ ...s.barLabel, color: STATUS_COLORS[st] }}>{st}</span>
                  <div style={s.barBg}>
                    <div style={{ ...s.barFill, width: `${pct}%`, background: STATUS_COLORS[st] }} />
                  </div>
                  <span style={s.barCount}>{count}</span>
                </div>
              );
            })}
          </div>

          {/* Pie Chart (CSS) */}
          <div style={s.chartBox}>
            <h4 style={s.chartTitle}>Quick Stats</h4>
            <div style={s.statsGrid}>
              {STATUSES.map(st => (
                <div key={st} style={{ ...s.statTile, borderColor: STATUS_COLORS[st] }}>
                  <span style={{ fontSize: 28, fontWeight: 700, color: STATUS_COLORS[st] }}>{counts[st]}</span>
                  <span style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>{st}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Success Rate */}
          <div style={s.chartBox}>
            <h4 style={s.chartTitle}>Success Rate</h4>
            <div style={s.rateRow}>
              <div style={s.rateCard}>
                <span style={{ fontSize: 32, fontWeight: 700, color: '#10B981' }}>
                  {jobs.length > 0 ? Math.round((counts['Offer'] / jobs.length) * 100) : 0}%
                </span>
                <span style={{ color: '#64748b', fontSize: 13 }}>Offer Rate</span>
              </div>
              <div style={s.rateCard}>
                <span style={{ fontSize: 32, fontWeight: 700, color: '#FBBF24' }}>
                  {jobs.length > 0 ? Math.round((counts['Interview'] / jobs.length) * 100) : 0}%
                </span>
                <span style={{ color: '#64748b', fontSize: 13 }}>Interview Rate</span>
              </div>
              <div style={s.rateCard}>
                <span style={{ fontSize: 32, fontWeight: 700, color: '#F87171' }}>
                  {jobs.length > 0 ? Math.round((counts['Rejected'] / jobs.length) * 100) : 0}%
                </span>
                <span style={{ color: '#64748b', fontSize: 13 }}>Rejection Rate</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const s = {
  root: { minHeight: '100vh', background: '#080f1a', color: '#e2e8f0',
    fontFamily: "'Segoe UI', sans-serif", padding: 0 },
  header: { background: '#0d1b2e', borderBottom: '1px solid #1e2d45',
    padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  headerLeft: { display: 'flex', alignItems: 'center', gap: 10 },
  logo: { fontSize: 20, fontWeight: 700, color: '#f1f5f9' },
  badge: { background: '#1e3a5f', color: '#4E9FE5', fontSize: 9,
    padding: '2px 6px', borderRadius: 4, letterSpacing: 1 },
  addBtn: { background: '#4E9FE5', color: '#fff', border: 'none',
    borderRadius: 8, padding: '9px 18px', fontSize: 13, fontWeight: 600, cursor: 'pointer' },
  statsRow: { display: 'flex', borderBottom: '1px solid #1e2d45' },
  statCard: { flex: 1, padding: '16px', display: 'flex', flexDirection: 'column',
    alignItems: 'center', borderRight: '1px solid #1e2d45' },
  statNum: { fontSize: 24, fontWeight: 700 },
  statLabel: { fontSize: 11, color: '#475569', textTransform: 'uppercase', letterSpacing: 1 },
  tabs: { display: 'flex', borderBottom: '1px solid #1e2d45', background: '#0a1628' },
  tab: { background: 'transparent', border: 'none', borderBottom: '2px solid transparent',
    color: '#475569', padding: '12px 24px', fontSize: 13, cursor: 'pointer', fontFamily: 'inherit' },
  tabActive: { color: '#4E9FE5', borderBottomColor: '#4E9FE5' },
  formBox: { background: '#0d1b2e', border: '1px solid #1e2d45', borderRadius: 12,
    margin: '20px 24px', padding: 24 },
  formTitle: { color: '#f1f5f9', margin: '0 0 16px', fontSize: 16 },
  formGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 },
  label: { display: 'block', color: '#64748b', fontSize: 11, textTransform: 'uppercase',
    letterSpacing: 0.5, marginBottom: 5, fontWeight: 600 },
  input: { width: '100%', background: '#080f1a', border: '1px solid #1e2d45',
    borderRadius: 8, padding: '9px 12px', color: '#e2e8f0', fontSize: 13,
    fontFamily: 'inherit', boxSizing: 'border-box', outline: 'none' },
  statusGrid: { display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8 },
  statusBtn: { background: 'transparent', border: '1px solid #334155',
    borderRadius: 8, padding: '7px 10px', color: '#64748b', cursor: 'pointer',
    fontFamily: 'inherit', fontSize: 12, display: 'flex', alignItems: 'center', gap: 6 },
  saveBtn: { background: '#10B981', color: '#fff', border: 'none',
    borderRadius: 8, padding: '10px 24px', fontSize: 13, fontWeight: 600, cursor: 'pointer' },
  controls: { padding: '16px 24px', display: 'flex', flexDirection: 'column', gap: 10 },
  search: { background: '#0d1b2e', border: '1px solid #1e2d45', borderRadius: 8,
    padding: '9px 14px', color: '#e2e8f0', fontSize: 13, fontFamily: 'inherit',
    outline: 'none', width: '100%', boxSizing: 'border-box' },
  filterRow: { display: 'flex', flexWrap: 'wrap', gap: 6 },
  filterBtn: { background: 'transparent', border: '1px solid #1e2d45',
    borderRadius: 20, padding: '5px 12px', color: '#64748b', fontSize: 12,
    cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 5 },
  pill: { background: '#1e2d45', color: '#64748b', borderRadius: 10, padding: '1px 6px', fontSize: 11 },
  dot: { width: 6, height: 6, borderRadius: '50%', display: 'inline-block', flexShrink: 0 },
  tableWrap: { margin: '0 24px 24px', border: '1px solid #1e2d45', borderRadius: 12, overflow: 'auto' },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { padding: '11px 16px', textAlign: 'left', color: '#475569', fontSize: 11,
    textTransform: 'uppercase', letterSpacing: 1, background: '#0a1628',
    borderBottom: '1px solid #1e2d45' },
  tr: { borderBottom: '1px solid #111c2d' },
  td: { padding: '13px 16px', fontSize: 14, verticalAlign: 'middle' },
  companyCell: { display: 'flex', alignItems: 'center', gap: 10 },
  avatar: { width: 30, height: 30, borderRadius: 8, background: '#1e3a5f',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 13, fontWeight: 700, color: '#4E9FE5', flexShrink: 0 },
  statusBadge: { display: 'inline-flex', alignItems: 'center', gap: 5,
    padding: '3px 10px', borderRadius: 20, fontSize: 12, border: '1px solid' },
  noteClamp: { display: '-webkit-box', WebkitLineClamp: 1,
    WebkitBoxOrient: 'vertical', overflow: 'hidden' },
  editBtn: { background: '#1e3a5f', color: '#4E9FE5', border: 'none',
    borderRadius: 6, padding: '5px 10px', cursor: 'pointer', fontSize: 12,
    marginRight: 6, fontFamily: 'inherit' },
  delBtn: { background: 'transparent', color: '#F87171', border: '1px solid #F87171',
    borderRadius: 6, padding: '5px 8px', cursor: 'pointer', fontSize: 12, fontFamily: 'inherit' },
  dashboard: { padding: '20px 24px' },
  chartBox: { background: '#0d1b2e', border: '1px solid #1e2d45',
    borderRadius: 12, padding: 20, marginBottom: 16 },
  chartTitle: { color: '#94a3b8', fontSize: 13, textTransform: 'uppercase',
    letterSpacing: 1, margin: '0 0 16px' },
  barRow: { display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 },
  barLabel: { width: 100, fontSize: 13, flexShrink: 0 },
  barBg: { flex: 1, height: 8, background: '#1e2d45', borderRadius: 4, overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: 4, transition: 'width 0.5s ease' },
  barCount: { color: '#64748b', fontSize: 13, width: 24, textAlign: 'right' },
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12 },
  statTile: { background: '#080f1a', border: '1px solid', borderRadius: 10,
    padding: 16, display: 'flex', flexDirection: 'column', alignItems: 'center' },
  rateRow: { display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12 },
  rateCard: { background: '#080f1a', borderRadius: 10, padding: 16,
    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 },
};