import React, { useState } from 'react';
import { 
  UploadCloud, 
  FileText, 
  CheckCircle2, 
  Code, 
  Plus, 
  X, 
  Sparkles,
  MapPin,
  Briefcase,
  GraduationCap,
  Save
} from 'lucide-react';

export default function ResumeUploader({ profile, onUpload, onUpdateProfile, onSeed, loading }) {
  const [newSkill, setNewSkill] = useState('');
  const [editingProfile, setEditingProfile] = useState(profile ? { ...profile } : null);
  const [activeView, setActiveView] = useState('structured'); // structured | raw

  React.useEffect(() => {
    setEditingProfile(profile ? { ...profile } : null);
  }, [profile]);

  const handleFileDrop = (e) => {
    e.preventDefault();
    const files = e.dataTransfer ? e.dataTransfer.files : e.target.files;
    if (files && files[0]) {
      onUpload(files[0]);
    }
  };

  const handleAddSkill = () => {
    if (newSkill.trim() && editingProfile) {
      const updatedSkills = Array.from(new Set([...(editingProfile.skills || []), newSkill.trim()]));
      const updated = { ...editingProfile, skills: updatedSkills };
      setEditingProfile(updated);
      setNewSkill('');
    }
  };

  const handleRemoveSkill = (skillToRemove) => {
    if (editingProfile) {
      const updated = {
        ...editingProfile,
        skills: editingProfile.skills.filter(s => s !== skillToRemove)
      };
      setEditingProfile(updated);
    }
  };

  const handleSaveProfile = () => {
    if (editingProfile) {
      onUpdateProfile(editingProfile);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Top Banner / Upload Zone */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '24px' }}>
        
        {/* Upload Card */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <UploadCloud size={20} color="#6366f1" /> Agent 1 — Upload Resume (PDF / DOCX)
          </h3>
          <p style={{ fontSize: '0.85rem', color: '#9ca3af', marginBottom: '18px' }}>
            Upload your existing resume to extract structured profile JSON schema (skills, roles, experience, and domains).
          </p>

          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleFileDrop}
            style={{
              border: '2px dashed rgba(99, 102, 241, 0.4)',
              borderRadius: '12px',
              padding: '36px 20px',
              textAlign: 'center',
              background: 'rgba(99, 102, 241, 0.04)',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            <input 
              type="file" 
              accept=".pdf,.docx,.txt" 
              onChange={handleFileDrop} 
              id="resume-file-input" 
              style={{ display: 'none' }} 
            />
            <label htmlFor="resume-file-input" style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
              <div style={{ background: 'rgba(99, 102, 241, 0.15)', padding: '12px', borderRadius: '50%', color: '#a5b4fc' }}>
                <FileText size={28} />
              </div>
              <span style={{ fontWeight: 600, fontSize: '0.95rem' }}>
                {loading ? "Parsing Resume..." : "Click or drag resume file here"}
              </span>
              <span style={{ fontSize: '0.78rem', color: '#6b7280' }}>
                Supports PDF, DOCX, TXT (Max 10MB)
              </span>
            </label>
          </div>

          <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8rem', color: '#6b7280' }}>No resume file handy?</span>
            <button className="btn-secondary" onClick={onSeed} style={{ fontSize: '0.8rem', padding: '6px 12px' }}>
              <Sparkles size={14} color="#f59e0b" /> Load Demo Profile
            </button>
          </div>
        </div>

        {/* Profile Card Summary */}
        {editingProfile && (
          <div className="glass-panel" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>{editingProfile.name}</h3>
                <span style={{ fontSize: '0.8rem', color: '#9ca3af', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                  <MapPin size={14} /> {editingProfile.location?.city || 'Remote'}, {editingProfile.location?.country || 'Global'}
                </span>
              </div>
              <div className="badge badge-emerald" style={{ padding: '6px 12px' }}>
                <CheckCircle2 size={14} style={{ marginRight: '4px' }} /> {editingProfile.experience_years} Yrs Exp
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '0.75rem', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Email</label>
                <input 
                  type="text" 
                  value={editingProfile.email || ''} 
                  onChange={(e) => setEditingProfile({ ...editingProfile, email: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff', fontSize: '0.88rem' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px' }}>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button 
                    onClick={() => setActiveView('structured')}
                    className={activeView === 'structured' ? 'btn-primary' : 'btn-secondary'}
                    style={{ fontSize: '0.78rem', padding: '6px 12px' }}
                  >
                    Structured View
                  </button>
                  <button 
                    onClick={() => setActiveView('raw')}
                    className={activeView === 'raw' ? 'btn-primary' : 'btn-secondary'}
                    style={{ fontSize: '0.78rem', padding: '6px 12px' }}
                  >
                    <Code size={14} /> Raw JSON
                  </button>
                </div>

                <button className="btn-primary" onClick={handleSaveProfile} style={{ fontSize: '0.8rem', padding: '6px 14px' }}>
                  <Save size={14} /> Save Profile
                </button>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* Main Profile Details View */}
      {editingProfile && activeView === 'structured' && (
        <div className="glass-panel" style={{ padding: '24px' }}>
          
          {/* Skills Management */}
          <div style={{ marginBottom: '24px' }}>
            <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              Detected Skill Profile ({editingProfile.skills?.length || 0})
            </h4>

            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '14px' }}>
              {editingProfile.skills?.map((skill) => (
                <span key={skill} className="skill-chip" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 10px', fontSize: '0.85rem' }}>
                  {skill}
                  <X 
                    size={14} 
                    style={{ cursor: 'pointer', opacity: 0.7 }} 
                    onClick={() => handleRemoveSkill(skill)} 
                  />
                </span>
              ))}
            </div>

            <div style={{ display: 'flex', gap: '8px', maxWidth: '350px' }}>
              <input 
                type="text" 
                placeholder="Add skill (e.g. Docker, Python)..." 
                value={newSkill} 
                onChange={(e) => setNewSkill(e.target.value)} 
                onKeyDown={(e) => e.key === 'Enter' && handleAddSkill()}
                style={{ flex: 1, padding: '8px 12px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff', fontSize: '0.85rem' }}
              />
              <button className="btn-secondary" onClick={handleAddSkill} style={{ padding: '8px 12px' }}>
                <Plus size={16} /> Add
              </button>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
            
            {/* Past Roles */}
            <div>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Briefcase size={16} color="#6366f1" /> Experience History
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {editingProfile.past_roles?.map((role, idx) => (
                  <div key={idx} style={{ padding: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{role.title}</div>
                    <div style={{ fontSize: '0.8rem', color: '#9ca3af' }}>{role.company} • {role.duration_months || 12} mos</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Target Domains & Education */}
            <div>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <GraduationCap size={16} color="#8b5cf6" /> Domains & Education
              </h4>
              <div style={{ marginBottom: '14px' }}>
                <label style={{ fontSize: '0.75rem', color: '#6b7280', textTransform: 'uppercase' }}>Preferred Domains</label>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '6px' }}>
                  {editingProfile.domains?.map((d) => (
                    <span key={d} className="badge badge-indigo">{d}</span>
                  ))}
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', color: '#6b7280', textTransform: 'uppercase' }}>Education</label>
                <div style={{ marginTop: '6px' }}>
                  {editingProfile.education?.map((edu, idx) => (
                    <div key={idx} style={{ fontSize: '0.85rem', color: '#e5e7eb' }}>
                      <strong>{edu.degree}</strong> in {edu.field}
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>

        </div>
      )}

      {/* Raw JSON View */}
      {editingProfile && activeView === 'raw' && (
        <div className="glass-panel" style={{ padding: '24px' }}>
          <pre style={{ 
            background: 'rgba(0,0,0,0.5)', 
            padding: '16px', 
            borderRadius: '8px', 
            fontFamily: 'var(--font-mono)', 
            fontSize: '0.85rem', 
            color: '#34d399', 
            overflowX: 'auto' 
          }}>
            {JSON.stringify(editingProfile, null, 2)}
          </pre>
        </div>
      )}

    </div>
  );
}
