import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, UserCheck, UserX } from 'lucide-react';
import { Navigate } from 'react-router-dom';

const AdminDashboard = () => {
  const { user, token } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  if (!user || user.role !== 'admin') {
    return <Navigate to="/" />;
  }

  const fetchUsers = async () => {
    try {
      const res = await fetch("/admin/users", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      const data = await res.json();
      setUsers(data);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [token]);

  const approveDoctor = async (id) => {
    try {
      await fetch(`/admin/approve_doctor/${id}`, {
        method: "PUT",
        headers: { "Authorization": `Bearer ${token}` }
      });
      fetchUsers();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="container" style={{ paddingTop: '20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
        <div style={{ background: 'var(--teal)', padding: '10px', borderRadius: '12px', color: 'white', display: 'flex' }}>
          <ShieldCheck size={28} />
        </div>
        <div>
          <h1 style={{ fontFamily: '"Syne", sans-serif', fontSize: '24px', letterSpacing: '-0.5px' }}>Admin Portal</h1>
          <p style={{ color: 'var(--muted)', fontSize: '14px' }}>Manage platform users and doctor approvals</p>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h2>Registered Users</h2>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: 'var(--bg)', borderBottom: '1px solid var(--border)' }}>
                <th style={{ padding: '16px 24px', color: 'var(--muted)', fontWeight: '600' }}>Name</th>
                <th style={{ padding: '16px 24px', color: 'var(--muted)', fontWeight: '600' }}>Email</th>
                <th style={{ padding: '16px 24px', color: 'var(--muted)', fontWeight: '600' }}>Role</th>
                <th style={{ padding: '16px 24px', color: 'var(--muted)', fontWeight: '600' }}>Status</th>
                <th style={{ padding: '16px 24px', color: 'var(--muted)', fontWeight: '600' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="5" style={{ padding: '24px', textAlign: 'center' }}>Loading...</td></tr>
              ) : users.map(u => (
                <tr key={u._id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '16px 24px', fontWeight: '500' }}>{u.name}</td>
                  <td style={{ padding: '16px 24px', color: 'var(--ink-soft)' }}>{u.email}</td>
                  <td style={{ padding: '16px 24px' }}>
                    <span style={{ 
                      background: u.role === 'admin' ? '#f5f3ff' : u.role === 'doctor' ? '#e0f2fe' : '#f1f5f9',
                      color: u.role === 'admin' ? '#7c3aed' : u.role === 'doctor' ? '#0284c7' : '#475569',
                      padding: '4px 10px', borderRadius: '100px', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase'
                    }}>{u.role}</span>
                  </td>
                  <td style={{ padding: '16px 24px' }}>
                    {u.approved ? 
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#059669', fontSize: '13px', fontWeight: '500' }}><UserCheck size={16} /> Approved</span> :
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#d97706', fontSize: '13px', fontWeight: '500' }}><UserX size={16} /> Pending</span>
                    }
                  </td>
                  <td style={{ padding: '16px 24px' }}>
                    {u.role === 'doctor' && !u.approved && (
                      <button 
                        onClick={() => approveDoctor(u._id)}
                        style={{ background: 'white', border: '1px solid var(--border)', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: '600', color: 'var(--teal)' }}
                      >
                        Approve Doctor
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
