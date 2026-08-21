import React, { useState } from 'react';
import { GripVertical, Zap, ArrowUp, ArrowDown, Check, Sparkles, AlertCircle, FileText, Download } from 'lucide-react';

export default function DragDropResumeEditor({ profile, onUpdateProfile }) {
  const [sections, setSections] = useState(
    profile?.section_order || ["summary", "skills", "experience", "projects", "education"]
  );
  const [skills, setSkills] = useState(profile?.skills || ["Python", "FastAPI", "React", "Postgres"]);
  const [experiences, setExperiences] = useState(
    profile?.experience_list || profile?.past_roles || [
      { title: "Software Engineer", company: "Tech Start", description: "Engineered scalable backend APIs and database infrastructure." }
    ]
  );
  const [atsScore, setAtsScore] = useState(profile?.ats_score || 85);
  const [saving, setSaving] = useState(false);
  const [scoreDiff, setScoreDiff] = useState(0);

  const triggerLiveRescore = async (newSections, newSkills, newExp) => {
    setSaving(true);
    try {
      const payload = {
        section_order: newSections,
        skills: newSkills,
        experience_list: newExp
      };
      const res = await fetch('/api/profile/reorder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        const data = await res.json();
        const oldScore = atsScore;
        const newScore = data.new_ats_score || 88;
        setAtsScore(newScore);
        setScoreDiff(newScore - oldScore);
      }
    } catch (e) {
      console.error("Error triggering live re-score:", e);
    } finally {
      setSaving(false);
    }
  };

  const moveSection = (index, direction) => {
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= sections.length) return;
    const newSec = [...sections];
    const [moved] = newSec.splice(index, 1);
    newSec.splice(targetIdx, 0, moved);
    setSections(newSec);
    triggerLiveRescore(newSec, skills, experiences);
  };

  const moveSkill = (index, direction) => {
    const targetIdx = direction === 'left' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= skills.length) return;
    const newSk = [...skills];
    const [moved] = newSk.splice(index, 1);
    newSk.splice(targetIdx, 0, moved);
    setSkills(newSk);
    triggerLiveRescore(sections, newSk, experiences);
  };

  return (
    <div style={{
      background: 'rgba(15, 23, 42, 0.8)',
      border: '1px solid rgba(99, 102, 241, 0.3)',
      borderRadius: '20px',
      padding: '28px',
      marginBottom: '28px',
      boxShadow: '0 10px 30px rgba(0,0,0,0.3)'
    }}>
      {/* Editor Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <Zap size={20} color="#818cf8" />
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#f8fafc', margin: 0 }}>
              Live Reordering & ATS Impact Studio
            </h3>
          </div>
          <p style={{ fontSize: '0.82rem', color: '#94a3b8', margin: 0 }}>
            Re-order resume sections or top skills to inspect real-time ATS score optimization impact.
          </p>
        </div>

        {/* Live ATS Score Counter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', background: 'rgba(0,0,0,0.4)', padding: '10px 18px', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.08)' }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.7rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700 }}>
              Real-Time ATS Score
            </div>
            <div style={{ fontSize: '1.3rem', fontWeight: 900, color: atsScore >= 80 ? '#34d399' : '#fbbf24' }}>
              {atsScore} / 100
            </div>
          </div>

          {scoreDiff !== 0 && (
            <span style={{
              fontSize: '0.78rem', fontWeight: 700, padding: '3px 8px', borderRadius: '10px',
              background: scoreDiff > 0 ? 'rgba(52, 211, 153, 0.2)' : 'rgba(239, 68, 68, 0.2)',
              color: scoreDiff > 0 ? '#34d399' : '#f87171'
            }}>
              {scoreDiff > 0 ? `+${scoreDiff} pts` : `${scoreDiff} pts`}
            </span>
          )}
        </div>
      </div>

      {/* Section Reordering Controls */}
      <div style={{ marginBottom: '24px' }}>
        <h4 style={{ fontSize: '0.9rem', fontWeight: 800, color: '#a5b4fc', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Drag / Reorder Resume Sections
        </h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {sections.map((sec, idx) => (
            <div
              key={sec}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: 'rgba(0,0,0,0.3)',
                border: '1px solid rgba(255,255,255,0.08)',
                padding: '12px 16px',
                borderRadius: '12px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <GripVertical size={16} color="#64748b" style={{ cursor: 'grab' }} />
                <span style={{ fontSize: '0.88rem', fontWeight: 700, color: '#f8fafc', textTransform: 'capitalize' }}>
                  {idx + 1}. {sec.replace('_', ' ')}
                </span>
                {idx === 0 && (
                  <span style={{ fontSize: '0.68rem', background: 'rgba(99, 102, 241, 0.2)', color: '#a5b4fc', padding: '2px 8px', borderRadius: '10px' }}>
                    Top Priority Section
                  </span>
                )}
              </div>

              <div style={{ display: 'flex', gap: '6px' }}>
                <button
                  disabled={idx === 0 || saving}
                  onClick={() => moveSection(idx, 'up')}
                  style={{
                    background: 'rgba(255,255,255,0.05)', border: 'none', color: '#cbd5e1',
                    padding: '4px 8px', borderRadius: '6px', cursor: idx === 0 ? 'not-allowed' : 'pointer'
                  }}
                >
                  <ArrowUp size={14} />
                </button>
                <button
                  disabled={idx === sections.length - 1 || saving}
                  onClick={() => moveSection(idx, 'down')}
                  style={{
                    background: 'rgba(255,255,255,0.05)', border: 'none', color: '#cbd5e1',
                    padding: '4px 8px', borderRadius: '6px', cursor: idx === sections.length - 1 ? 'not-allowed' : 'pointer'
                  }}
                >
                  <ArrowDown size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Top Skills Reordering */}
      <div>
        <h4 style={{ fontSize: '0.9rem', fontWeight: 800, color: '#a5b4fc', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Reorder Technical Skills Priority
        </h4>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {skills.map((sk, idx) => (
            <div
              key={sk}
              style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                background: 'rgba(99, 102, 241, 0.15)', border: '1px solid rgba(99, 102, 241, 0.3)',
                color: '#e2e8f0', padding: '6px 12px', borderRadius: '10px', fontSize: '0.82rem', fontWeight: 600
              }}
            >
              <span>{sk}</span>
              {idx > 0 && (
                <button onClick={() => moveSkill(idx, 'left')} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: 0 }}>
                  ←
                </button>
              )}
              {idx < skills.length - 1 && (
                <button onClick={() => moveSkill(idx, 'right')} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: 0 }}>
                  →
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
