import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchAnalytics, fetchHealth, resetAnalytics } from '../services/analytics';
import './AdminDashboard.css';

const SERVER = import.meta.env.VITE_API_URL || 'http://localhost:3001';

// ── Helpers ──────────────────────────────────────────────────────────────────

function fmtTime(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  return d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

function fmtDate(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  return d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
}

function fmtUptime(secs) {
  if (!secs) return '—';
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  const s = secs % 60;
  if (h > 0) return `${h}j ${m}m`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}

// ── Sub-components ───────────────────────────────────────────────────────────

function StatCard({ label, value, sub, accent = '#00D9FF', icon }) {
  return (
    <div className="stat-card" style={{ '--card-accent': accent }}>
      <div className="stat-card__icon">{icon}</div>
      <div className="stat-card__body">
        <div className="stat-card__value">{value ?? '—'}</div>
        <div className="stat-card__label">{label}</div>
        {sub && <div className="stat-card__sub">{sub}</div>}
      </div>
    </div>
  );
}

function BarChart({ data, maxVal, accent = '#00D9FF', label }) {
  const max = maxVal || Math.max(...data.map(d => d.count), 1);
  return (
    <div className="bar-chart">
      <div className="bar-chart__label">{label}</div>
      <div className="bar-chart__bars">
        {data.map((d, i) => (
          <div key={i} className="bar-chart__col">
            <div
              className="bar-chart__bar"
              style={{
                height:     `${Math.round((d.count / max) * 100)}%`,
                background: accent,
                opacity:    d.count === 0 ? 0.12 : 0.9,
                boxShadow:  d.count > 0 ? `0 0 8px ${accent}80` : 'none',
              }}
              title={`${d.label ?? d.hour ?? i}: ${d.count}`}
            />
            <span className="bar-chart__x">{d.label ?? d.hour ?? i}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function ActionPill({ label, count, color }) {
  return (
    <div className="action-pill" style={{ '--pill-color': color }}>
      <span className="action-pill__count">{count}</span>
      <span className="action-pill__label">{label}</span>
    </div>
  );
}

function DonutChart({ data }) {
  if (!data || data.length === 0) return <div className="empty-state">Belum ada data</div>;
  const total = data.reduce((sum, d) => sum + d.count, 0);
  if (total === 0) return <div className="empty-state">Belum ada data</div>;

  const colors = ['#00D9FF', '#7C5CFF', '#00FFB3', '#00A8FF', '#FF3B6B'];
  const size = 160;
  const center = size / 2;
  const radius = size * 0.35;
  const circumference = 2 * Math.PI * radius;
  
  let currentOffset = 0;

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '24px', flexWrap: 'wrap', justifyContent: 'center' }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: 'rotate(-90deg)', overflow: 'visible' }}>
        {data.map((d, i) => {
          if (d.count === 0) return null;
          const strokeLength = (d.count / total) * circumference;
          const circle = (
            <circle
              key={i}
              cx={center}
              cy={center}
              r={radius}
              fill="transparent"
              stroke={colors[i % colors.length]}
              strokeWidth={size * 0.15}
              strokeDasharray={`${strokeLength} ${circumference}`}
              strokeDashoffset={-currentOffset}
              style={{ transition: 'all 0.5s ease', filter: `drop-shadow(0 0 4px ${colors[i % colors.length]}80)` }}
            />
          );
          currentOffset += strokeLength;
          return circle;
        })}
      </svg>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', minWidth: '120px' }}>
        {data.map((d, i) => d.count > 0 && (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem' }}>
            <span style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: colors[i % colors.length], boxShadow: `0 0 8px ${colors[i % colors.length]}` }} />
            <span>{d.label}: <strong>{d.count}</strong></span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Main Component ───────────────────────────────────────────────────────────

const REFRESH_MS = 10_000; // auto-refresh every 10 s

function AdminDashboard() {
  const navigate = useNavigate();

  const [data,        setData]        = useState(null);
  const [health,      setHealth]      = useState(null);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState('');
  const [lastRefresh, setLastRefresh] = useState(null);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [filterAction, setFilterAction] = useState('all');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    const [stats, serverHealth] = await Promise.all([fetchAnalytics(), fetchHealth()]);
    if (!stats) {
      setError('Tidak dapat terhubung ke server (port 3001). Pastikan server berjalan.');
    } else {
      setData(stats);
    }
    setHealth(serverHealth);
    setLastRefresh(new Date());
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  // Auto-refresh interval
  useEffect(() => {
    if (!autoRefresh) return;
    const id = setInterval(load, REFRESH_MS);
    return () => clearInterval(id);
  }, [autoRefresh, load]);

  const handleExportCSV = () => {
    window.open(`${SERVER}/api/analytics/export/csv`, '_blank');
  };

  const handleReset = async () => {
    if (window.confirm('Yakin ingin mereset SEMUA data analytics? Data yang dihapus tidak bisa dikembalikan.')) {
      setLoading(true);
      const ok = await resetAnalytics();
      if (ok) {
        alert('Data berhasil di-reset.');
        await load();
      } else {
        alert('Gagal mereset data.');
        setLoading(false);
      }
    }
  };

  // ── Derived data ──
  const frameBarData = (data?.byFrame || []).map(f => ({
    label: f.name?.split(' ')[0] ?? f.id,
    count: f.count,
  }));

  const photoCountData = [1, 2, 3, 4].map(n => ({
    label: `${n}F`,
    count: data?.byPhotoCount?.[n] ?? 0,
  }));

  const hourData = (data?.byHour || []).map(h => ({
    label: `${h.hour}`,
    count: h.count,
  }));

  const topFrame = data?.byFrame?.find(f => f.id === data?.topFrame?.id);

  return (
    <div className="admin-page">
      {/* ── Background ── */}
      <div className="admin-bg" aria-hidden="true" />

      {/* ── Header ── */}
      <header className="admin-header">
        <div className="admin-header__left">
          <button className="admin-back-btn" onClick={() => navigate('/')} title="Kembali ke Booth">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
          </button>
          <div>
            <div className="admin-header__title">
              <span className="admin-header__logo">⚡</span> ADMIN DASHBOARD
            </div>
            <div className="admin-header__sub">COMIT Booth — Analytics &amp; Monitoring</div>
          </div>
        </div>

        <div className="admin-header__right">
          {/* Server status pill */}
          <div className={`server-status ${health ? 'server-status--online' : 'server-status--offline'}`}>
            <span className="server-status__dot" />
            {health ? 'Server Online' : 'Server Offline'}
          </div>

          <div className="admin-header__meta">
            {lastRefresh && <span>Update: {fmtTime(lastRefresh.toISOString())}</span>}
            <label className="auto-refresh-toggle">
              <input
                type="checkbox"
                checked={autoRefresh}
                onChange={e => setAutoRefresh(e.target.checked)}
              />
              Auto-refresh
            </label>
            <button className="btn-header btn-export" onClick={handleExportCSV} title="Export CSV">
              CSV
            </button>
            <button className="btn-header btn-reset" onClick={handleReset} title="Reset Data">
              Reset
            </button>
          </div>

          <button
            className="btn-refresh"
            onClick={load}
            disabled={loading}
            id="btn-admin-refresh"
            title="Refresh data"
          >
            <svg
              width="16" height="16" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2.5"
              style={{ animation: loading ? 'admin-spin 0.6s linear infinite' : 'none' }}
            >
              <polyline points="23 4 23 10 17 10"/>
              <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
            </svg>
            {loading ? 'Loading…' : 'Refresh'}
          </button>
        </div>
      </header>

      {/* ── Content ── */}
      <main className="admin-main">
        {/* Error banner */}
        {error && (
          <div className="admin-error">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            {error}
          </div>
        )}

        {/* Server info row */}
        {health && (
          <div className="server-info-row">
            <span>🖥️ Server: <strong>{health.service}</strong></span>
            <span>v{health.version}</span>
            <span>⏱ Uptime: <strong>{fmtUptime(health.uptime)}</strong></span>
            <span>🕐 {fmtTime(health.time)}</span>
          </div>
        )}

        {/* ── Stats cards ── */}
        <section className="stats-grid">
          <StatCard
            label="Total Sesi"
            value={data?.total ?? 0}
            sub="foto berhasil dikomposisikan"
            accent="#00D9FF"
            icon="📸"
          />
          <StatCard
            label="Download"
            value={data?.actions?.download ?? 0}
            sub="file JPG diunduh"
            accent="#00A8FF"
            icon="⬇️"
          />
          <StatCard
            label="Print"
            value={data?.actions?.print ?? 0}
            sub="foto dicetak"
            accent="#7C5CFF"
            icon="🖨️"
          />
          <StatCard
            label="Frame Terpopuler"
            value={topFrame?.name?.split(' ').slice(0, 2).join(' ') ?? '—'}
            sub={topFrame ? `${topFrame.count} sesi` : 'belum ada data'}
            accent="#00FFB3"
            icon="🖼️"
          />
        </section>

        {/* ── Action breakdown ── */}
        {data && (
          <section className="section-card">
            <div className="section-card__header">
              <h3 className="section-card__title">Aksi Pengguna</h3>
            </div>
            <div className="action-pills">
              <ActionPill label="Selesai Foto" count={data.actions.complete} color="#00D9FF" />
              <ActionPill label="Download" count={data.actions.download} color="#00A8FF" />
              <ActionPill label="Print" count={data.actions.print} color="#7C5CFF" />
              {data.actions.complete > 0 && (
                <ActionPill
                  label="Download Rate"
                  count={`${Math.round((data.actions.download / data.actions.complete) * 100)}%`}
                  color="#00FFB3"
                />
              )}
            </div>
          </section>
        )}

        {/* ── Charts row ── */}
        <div className="charts-row">
          {/* Frame chart (Donut) */}
          <section className="section-card">
            <div className="section-card__header">
              <h3 className="section-card__title">Distribusi Frame</h3>
              <span className="section-card__sub">sesi per frame</span>
            </div>
            {frameBarData.length > 0
              ? <DonutChart data={frameBarData} />
              : <div className="empty-state">Belum ada data</div>
            }
          </section>

          {/* Photo count chart */}
          <section className="section-card">
            <div className="section-card__header">
              <h3 className="section-card__title">Jumlah Foto</h3>
              <span className="section-card__sub">pilihan jumlah foto per sesi</span>
            </div>
            {data
              ? <BarChart data={photoCountData} accent="#7C5CFF" label="" />
              : <div className="empty-state">Belum ada data</div>
            }
          </section>
        </div>

        {/* ── Hourly activity ── */}
        <section className="section-card">
          <div className="section-card__header">
            <h3 className="section-card__title">Aktivitas Per Jam (24 Jam Terakhir)</h3>
            <span className="section-card__sub">jumlah sesi per jam</span>
          </div>
          {data
            ? <BarChart data={hourData} accent="#00A8FF" label="" />
            : <div className="empty-state">Belum ada data</div>
          }
        </section>

        {/* ── Session log ── */}
        <section className="section-card">
          <div className="section-card__header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 className="section-card__title">Log Sesi Terbaru</h3>
              <span className="section-card__sub">{data ? `${Math.min(data.log?.length ?? 0, 50)} entri terakhir` : ''}</span>
            </div>
            <div className="log-filters">
              <select 
                value={filterAction} 
                onChange={e => setFilterAction(e.target.value)}
                className="filter-select"
              >
                <option value="all">Semua Aksi</option>
                <option value="complete">Selesai (📸)</option>
                <option value="download">Download (⬇️)</option>
                <option value="print">Print (🖨️)</option>
              </select>
            </div>
          </div>
          {data?.log?.length > 0 ? (
            <div className="log-table-wrap">
              <table className="log-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Waktu</th>
                    <th>Tanggal</th>
                    <th>Frame</th>
                    <th>Foto</th>
                    <th>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {[...(data.log)].reverse().filter(entry => filterAction === 'all' || entry.action === filterAction).slice(0, 50).map((entry, i) => (
                    <tr key={i} className={`log-row log-row--${entry.action}`}>
                      <td className="log-num">{data.log.length - i}</td>
                      <td>{fmtTime(entry.timestamp)}</td>
                      <td>{fmtDate(entry.timestamp)}</td>
                      <td>
                        <span className="log-frame-badge">
                          {data.byFrame?.find(f => f.id === entry.frameId)?.name ?? entry.frameId ?? '—'}
                        </span>
                      </td>
                      <td className="log-photos">{entry.photoCount}x</td>
                      <td>
                        <span className={`log-action log-action--${entry.action}`}>
                          {entry.action === 'complete' ? '📸 Selesai'
                            : entry.action === 'download' ? '⬇️ Download'
                            : entry.action === 'print'    ? '🖨️ Print'
                            : entry.action}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-state__icon">📊</div>
              <p>Belum ada sesi yang tercatat.</p>
              <p className="empty-state__sub">Mulai foto untuk memunculkan data di sini.</p>
            </div>
          )}
        </section>
      </main>

      {/* ── Footer ── */}
      <footer className="admin-footer">
        <span>COMIT Booth Admin &nbsp;·&nbsp; Data disimpan di memory (reset saat server restart)</span>
      </footer>
    </div>
  );
}

export default AdminDashboard;
