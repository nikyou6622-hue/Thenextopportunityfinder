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
  Save,
  FolderGit2,
  Trash2,
  ExternalLink,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

export default function ResumeUploader({ profile, onUpload, onUpdateProfile, onSeed, loading }) {
  const [newSkill, setNewSkill] = useState('');
  const [editingProfile, setEditingProfile] = useState(profile ? { ...profile } : null);
  const [activeView, setActiveView] = useState('structured'); // structured | raw

  // New item draft states
  const [showAddExperience, setShowAddExperience] = useState(false);
  const [expDraft, setExpDraft] = useState({ title: '', company: '', dates: '2023 - Present', description: '' });

  const [showAddProject, setShowAddProject] = useState(false);
  const [projDraft, setProjDraft] = useState({ title: '', description: '', technologies: '', link: '' });

  const [showAddEdu, setShowAddEdu] = useState(false);
  const [eduDraft, setEduDraft] = useState({ degree: '', institution: '', field: '', year: '2023', score: '' });

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

  // Experience Handlers
  const handleAddExperience = () => {
    if (expDraft.title.trim() && expDraft.company.trim() && editingProfile) {
      const currentList = editingProfile.experience_list || editingProfile.past_roles || [];
      const updatedList = [
        ...currentList,
        {
          title: expDraft.title.trim(),
          role: expDraft.title.trim(),
          company: expDraft.company.trim(),
          dates: expDraft.dates.trim() || '2023 - Present',
          description: expDraft.description.trim()
        }
      ];
      setEditingProfile({
        ...editingProfile,
        experience_list: updatedList,
        past_roles: updatedList
      });
      setExpDraft({ title: '', company: '', dates: '2023 - Present', description: '' });
      setShowAddExperience(false);
    }
  };

  const handleRemoveExperience = (idx) => {
    if (editingProfile) {
      const currentList = editingProfile.experience_list || editingProfile.past_roles || [];
      const updatedList = currentList.filter((_, i) => i !== idx);
      setEditingProfile({
        ...editingProfile,
        experience_list: updatedList,
        past_roles: updatedList
      });
    }
  };

  // Project Handlers
  const handleAddProject = () => {
    if (projDraft.title.trim() && editingProfile) {
      const currentProjects = editingProfile.projects || [];
      const techArray = projDraft.technologies.split(',').map(t => t.trim()).filter(Boolean);
      const updatedProjects = [
        ...currentProjects,
        {
          title: projDraft.title.trim(),
          name: projDraft.title.trim(),
          description: projDraft.description.trim(),
          technologies: techArray,
          link: projDraft.link.trim() || null,
          github_url: projDraft.link.trim() || null
        }
      ];
      setEditingProfile({
        ...editingProfile,
        projects: updatedProjects
      });
      setProjDraft({ title: '', description: '', technologies: '', link: '' });
      setShowAddProject(false);
    }
  };

  const handleRemoveProject = (idx) => {
    if (editingProfile) {
      const currentProjects = editingProfile.projects || [];
      const updatedProjects = currentProjects.filter((_, i) => i !== idx);
      setEditingProfile({
        ...editingProfile,
        projects: updatedProjects
      });
    }
  };

  // Education Handlers
  const handleAddEducation = () => {
    if (eduDraft.degree.trim() && editingProfile) {
      const currentEdu = editingProfile.education_list || editingProfile.education || [];
      const updatedEdu = [
        ...currentEdu,
        {
          degree: eduDraft.degree.trim(),
          institution: eduDraft.institution.trim() || 'University / College',
          field: eduDraft.field.trim() || 'Computer Science',
          year: eduDraft.year.trim() || '2023',
          score: eduDraft.score.trim() || null
        }
      ];
      setEditingProfile({
        ...editingProfile,
        education_list: updatedEdu,
        education: updatedEdu
      });
      setEduDraft({ degree: '', institution: '', field: '', year: '2023', score: '' });
      setShowAddEdu(false);
    }
  };

  const handleRemoveEducation = (idx) => {
    if (editingProfile) {
      const currentEdu = editingProfile.education_list || editingProfile.education || [];
      const updatedEdu = currentEdu.filter((_, i) => i !== idx);
      setEditingProfile({
        ...editingProfile,
        education_list: updatedEdu,
        education: updatedEdu
      });
    }
  };

  const handleSaveProfile = () => {
    if (editingProfile) {
      onUpdateProfile(editingProfile);
    }
  };

  const expList = editingProfile?.experience_list?.length ? editingProfile.experience_list : (editingProfile?.past_roles || []);
  const eduList = editingProfile?.education_list?.length ? editingProfile.education_list : (editingProfile?.education || []);
  const projList = editingProfile?.projects || [];

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
            Upload your existing resume to extract structured profile JSON schema (skills, roles, experience, projects, and education).
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
                  <MapPin size={14} /> {editingProfile.location?.city || editingProfile.city || 'Remote'}, {editingProfile.location?.country || editingProfile.country || 'Global'}
                </span>
              </div>
              <div className="badge badge-emerald" style={{ padding: '6px 12px' }}>
                <CheckCircle2 size={14} style={{ marginRight: '4px' }} /> {editingProfile.experience_years || 1} Yrs Exp
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
          <div style={{ marginBottom: '28px' }}>
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

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
            
            {/* Professional Experience Section */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Briefcase size={16} color="#6366f1" /> Professional Experience ({expList.length})
                </h4>
                <button 
                  className="btn-secondary" 
                  onClick={() => setShowAddExperience(!showAddExperience)}
                  style={{ fontSize: '0.75rem', padding: '4px 10px' }}
                >
                  <Plus size={14} /> Add Role
                </button>
              </div>

              {/* Add Experience Form */}
              {showAddExperience && (
                <div style={{ padding: '14px', background: 'rgba(99, 102, 241, 0.08)', borderRadius: '10px', border: '1px solid rgba(99, 102, 241, 0.2)', marginBottom: '14px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <input 
                    type="text" 
                    placeholder="Role Title (e.g. Full Stack Engineer)" 
                    value={expDraft.title}
                    onChange={(e) => setExpDraft({ ...expDraft, title: e.target.value })}
                    style={{ padding: '8px 10px', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', color: '#fff', fontSize: '0.82rem' }}
                  />
                  <input 
                    type="text" 
                    placeholder="Company Name (e.g. Acme Corp)" 
                    value={expDraft.company}
                    onChange={(e) => setExpDraft({ ...expDraft, company: e.target.value })}
                    style={{ padding: '8px 10px', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', color: '#fff', fontSize: '0.82rem' }}
                  />
                  <input 
                    type="text" 
                    placeholder="Date Range (e.g. Jan 2023 - Present)" 
                    value={expDraft.dates}
                    onChange={(e) => setExpDraft({ ...expDraft, dates: e.target.value })}
                    style={{ padding: '8px 10px', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', color: '#fff', fontSize: '0.82rem' }}
                  />
                  <textarea 
                    placeholder="Role description or key bullet achievements..." 
                    rows={2}
                    value={expDraft.description}
                    onChange={(e) => setExpDraft({ ...expDraft, description: e.target.value })}
                    style={{ padding: '8px 10px', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', color: '#fff', fontSize: '0.82rem' }}
                  />
                  <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                    <button className="btn-secondary" onClick={() => setShowAddExperience(false)} style={{ fontSize: '0.75rem', padding: '4px 10px' }}>Cancel</button>
                    <button className="btn-primary" onClick={handleAddExperience} style={{ fontSize: '0.75rem', padding: '4px 12px' }}>Save Experience</button>
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {expList.map((role, idx) => (
                  <div key={idx} style={{ padding: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)', position: 'relative' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div style={{ fontWeight: 700, fontSize: '0.88rem', color: '#f8fafc' }}>{role.title || role.role}</div>
                      <Trash2 size={14} style={{ cursor: 'pointer', color: '#ef4444', opacity: 0.8 }} onClick={() => handleRemoveExperience(idx)} />
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#a5b4fc', marginTop: '2px' }}>{role.company} • {role.dates || '2023 - Present'}</div>
                    {role.description && (
                      <div style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: '6px', lineHeight: 1.4 }}>
                        {role.description}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Key Projects & Portfolio Section */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <FolderGit2 size={16} color="#34d399" /> Key Projects & Portfolio ({projList.length})
                </h4>
                <button 
                  className="btn-secondary" 
                  onClick={() => setShowAddProject(!showAddProject)}
                  style={{ fontSize: '0.75rem', padding: '4px 10px' }}
                >
                  <Plus size={14} /> Add Project
                </button>
              </div>

              {/* Add Project Form */}
              {showAddProject && (
                <div style={{ padding: '14px', background: 'rgba(52, 211, 153, 0.08)', borderRadius: '10px', border: '1px solid rgba(52, 211, 153, 0.2)', marginBottom: '14px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <input 
                    type="text" 
                    placeholder="Project Title (e.g. AI Career Finder)" 
                    value={projDraft.title}
                    onChange={(e) => setProjDraft({ ...projDraft, title: e.target.value })}
                    style={{ padding: '8px 10px', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', color: '#fff', fontSize: '0.82rem' }}
                  />
                  <input 
                    type="text" 
                    placeholder="Technologies (comma separated e.g. React, Python, Docker)" 
                    value={projDraft.technologies}
                    onChange={(e) => setProjDraft({ ...projDraft, technologies: e.target.value })}
                    style={{ padding: '8px 10px', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', color: '#fff', fontSize: '0.82rem' }}
                  />
                  <input 
                    type="text" 
                    placeholder="GitHub or Live URL (optional)" 
                    value={projDraft.link}
                    onChange={(e) => setProjDraft({ ...projDraft, link: e.target.value })}
                    style={{ padding: '8px 10px', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', color: '#fff', fontSize: '0.82rem' }}
                  />
                  <textarea 
                    placeholder="Short description / highlights..." 
                    rows={2}
                    value={projDraft.description}
                    onChange={(e) => setProjDraft({ ...projDraft, description: e.target.value })}
                    style={{ padding: '8px 10px', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', color: '#fff', fontSize: '0.82rem' }}
                  />
                  <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                    <button className="btn-secondary" onClick={() => setShowAddProject(false)} style={{ fontSize: '0.75rem', padding: '4px 10px' }}>Cancel</button>
                    <button className="btn-primary" onClick={handleAddProject} style={{ fontSize: '0.75rem', padding: '4px 12px' }}>Save Project</button>
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {projList.map((proj, idx) => (
                  <div key={idx} style={{ padding: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div style={{ fontWeight: 700, fontSize: '0.88rem', color: '#f8fafc' }}>
                        {proj.title || proj.name}
                      </div>
                      <Trash2 size={14} style={{ cursor: 'pointer', color: '#ef4444', opacity: 0.8 }} onClick={() => handleRemoveProject(idx)} />
                    </div>
                    {proj.description && (
                      <div style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: '4px', lineHeight: 1.4 }}>
                        {proj.description}
                      </div>
                    )}
                    {proj.technologies && proj.technologies.length > 0 && (
                      <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginTop: '6px' }}>
                        {(Array.isArray(proj.technologies) ? proj.technologies : [proj.technologies]).map((t, i) => (
                          <span key={i} className="badge badge-indigo" style={{ fontSize: '0.68rem', padding: '2px 6px' }}>{t}</span>
                        ))}
                      </div>
                    )}
                    {(proj.link || proj.github_url) && (
                      <a 
                        href={proj.link || proj.github_url} 
                        target="_blank" 
                        rel="noreferrer" 
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', color: '#34d399', marginTop: '6px', textDecoration: 'none' }}
                      >
                        <ExternalLink size={12} /> {proj.link || proj.github_url}
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Education & Credentials Section */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <GraduationCap size={16} color="#8b5cf6" /> Education & Credentials ({eduList.length})
                </h4>
                <button 
                  className="btn-secondary" 
                  onClick={() => setShowAddEdu(!showAddEdu)}
                  style={{ fontSize: '0.75rem', padding: '4px 10px' }}
                >
                  <Plus size={14} /> Add Education
                </button>
              </div>

              {/* Add Education Form */}
              {showAddEdu && (
                <div style={{ padding: '14px', background: 'rgba(139, 92, 246, 0.08)', borderRadius: '10px', border: '1px solid rgba(139, 92, 246, 0.2)', marginBottom: '14px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <input 
                    type="text" 
                    placeholder="Degree (e.g. B.Tech in Computer Science)" 
                    value={eduDraft.degree}
                    onChange={(e) => setEduDraft({ ...eduDraft, degree: e.target.value })}
                    style={{ padding: '8px 10px', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', color: '#fff', fontSize: '0.82rem' }}
                  />
                  <input 
                    type="text" 
                    placeholder="Institution / University Name" 
                    value={eduDraft.institution}
                    onChange={(e) => setEduDraft({ ...eduDraft, institution: e.target.value })}
                    style={{ padding: '8px 10px', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', color: '#fff', fontSize: '0.82rem' }}
                  />
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                    <input 
                      type="text" 
                      placeholder="Graduation Year (e.g. 2023)" 
                      value={eduDraft.year}
                      onChange={(e) => setEduDraft({ ...eduDraft, year: e.target.value })}
                      style={{ padding: '8px 10px', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', color: '#fff', fontSize: '0.82rem' }}
                    />
                    <input 
                      type="text" 
                      placeholder="CGPA / Score (e.g. 8.5/10)" 
                      value={eduDraft.score}
                      onChange={(e) => setEduDraft({ ...eduDraft, score: e.target.value })}
                      style={{ padding: '8px 10px', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', color: '#fff', fontSize: '0.82rem' }}
                    />
                  </div>
                  <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                    <button className="btn-secondary" onClick={() => setShowAddEdu(false)} style={{ fontSize: '0.75rem', padding: '4px 10px' }}>Cancel</button>
                    <button className="btn-primary" onClick={handleAddEducation} style={{ fontSize: '0.75rem', padding: '4px 12px' }}>Save Education</button>
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {eduList.map((edu, idx) => (
                  <div key={idx} style={{ padding: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div style={{ fontWeight: 700, fontSize: '0.88rem', color: '#e5e7eb' }}>{edu.degree}</div>
                      <Trash2 size={14} style={{ cursor: 'pointer', color: '#ef4444', opacity: 0.8 }} onClick={() => handleRemoveEducation(idx)} />
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#9ca3af', marginTop: '2px' }}>
                      {edu.institution || 'University'} {edu.year ? `• Class of ${edu.year}` : ''}
                    </div>
                    {edu.score && (
                      <div style={{ fontSize: '0.75rem', color: '#c7d2fe', marginTop: '4px', fontWeight: 600 }}>
                        Score: {edu.score}
                      </div>
                    )}
                  </div>
                ))}
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
