import React, { useState } from 'react';
import { Sparkles, Wand2, FileSpreadsheet, CheckCircle2 } from 'lucide-react';
import { Button } from '../common/Button.js';
import { Modal } from '../common/Modal.js';
import { useToast } from '../../context/ToastContext.js';
import { AiCandidateExtractionData } from '../../types/index.js';

interface GenerateWithAiProps {
  onGenerated: (data: AiCandidateExtractionData) => void;
  triggerText?: string;
}

export const GenerateWithAi: React.FC<GenerateWithAiProps> = ({
  onGenerated,
  triggerText = 'Generate with AI',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [roleTitle, setRoleTitle] = useState('Senior Product Designer');
  const [department, setDepartment] = useState('Product Design');
  const [candidateName, setCandidateName] = useState('Maya Lin');
  const [candidateEmail, setCandidateEmail] = useState('maya.design@example.com');
  const [seniority, setSeniority] = useState('Senior');
  const [isGenerating, setIsGenerating] = useState(false);
  const { success } = useToast();

  const handleGenerate = async () => {
    setIsGenerating(true);
    await new Promise((r) => setTimeout(r, 900));

    const generated: AiCandidateExtractionData = {
      candidateName: { value: candidateName, confidenceScore: 0.95, sourceSnippet: 'User generation prompt' },
      email: { value: candidateEmail, confidenceScore: 0.95, sourceSnippet: 'User generation prompt' },
      phone: { value: '+1 (555) 482-1920', confidenceScore: 0.8, sourceSnippet: 'Default phone placeholder' },
      currentEmployer: { value: 'Independent Consultant', confidenceScore: 0.85, sourceSnippet: 'Inferred profile' },
      currentTitle: { value: 'Product Designer', confidenceScore: 0.9, sourceSnippet: 'Inferred title' },
      offeredRole: { value: roleTitle, confidenceScore: 0.98, sourceSnippet: roleTitle },
      department: { value: department, confidenceScore: 0.95, sourceSnippet: department },
      experienceYears: { value: 6, confidenceScore: 0.85, sourceSnippet: `${seniority} level expectation` },
      proposedJoiningDate: { value: '2026-11-15', confidenceScore: 0.9, sourceSnippet: 'Two weeks notice standard' },
      currency: { value: 'USD', confidenceScore: 0.99, sourceSnippet: 'USD standard' },
      baseSalary: { value: 140000, confidenceScore: 0.9, sourceSnippet: 'Market 50th percentile for Senior Designer' },
      hraAllowance: { value: 0, confidenceScore: 0.9, sourceSnippet: 'Not applicable' },
      specialAllowances: { value: 6000, confidenceScore: 0.85, sourceSnippet: 'Home office & wellness allowance' },
      performanceBonus: { value: 15000, confidenceScore: 0.88, sourceSnippet: '10% target performance bonus' },
      joiningBonus: { value: 8000, confidenceScore: 0.85, sourceSnippet: 'Sign-on incentive' },
      totalCtc: { value: 169000, confidenceScore: 0.92, sourceSnippet: 'Comprehensive compensation' },
      overallConfidenceScore: 0.92,
      warnings: [],
    };

    setIsGenerating(false);
    success(`AI generated draft terms for ${candidateName} as ${roleTitle}!`);
    onGenerated(generated);
    setIsOpen(false);
  };

  return (
    <>
      <Button variant="secondary" icon={<Wand2 size={16} />} onClick={() => setIsOpen(true)}>
        {triggerText}
      </Button>

      <Modal
        isOpen={isOpen}
        onClose={() => !isGenerating && setIsOpen(false)}
        title="Generate Offer Draft with AI"
        subtitle="Prompt the AI to construct an initial compensation structure based on role benchmarks."
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsOpen(false)} disabled={isGenerating}>
              Cancel
            </Button>
            <Button variant="ai" icon={<Sparkles size={16} />} isLoading={isGenerating} onClick={handleGenerate}>
              Generate Offer Draft
            </Button>
          </>
        }
      >
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div className="form-group">
            <label className="form-label">Candidate Full Name:</label>
            <input
              type="text"
              className="form-input"
              value={candidateName}
              onChange={(e) => setCandidateName(e.target.value)}
              disabled={isGenerating}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Candidate Email:</label>
            <input
              type="email"
              className="form-input"
              value={candidateEmail}
              onChange={(e) => setCandidateEmail(e.target.value)}
              disabled={isGenerating}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Target Role Title:</label>
            <input
              type="text"
              className="form-input"
              value={roleTitle}
              onChange={(e) => setRoleTitle(e.target.value)}
              disabled={isGenerating}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Department:</label>
            <select
              className="form-select"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              disabled={isGenerating}
            >
              <option value="Engineering">Engineering</option>
              <option value="Product Design">Product Design</option>
              <option value="Product Management">Product Management</option>
              <option value="Marketing & Growth">Marketing & Growth</option>
              <option value="Finance & Ops">Finance & Ops</option>
            </select>
          </div>
          <div className="form-group" style={{ gridColumn: 'span 2' }}>
            <label className="form-label">Seniority Level:</label>
            <div style={{ display: 'flex', gap: 8 }}>
              {['Entry / Junior', 'Mid-Level', 'Senior', 'Staff / Lead', 'Director'].map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSeniority(s)}
                  className={`btn ${seniority === s ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ flex: 1, padding: '8px 10px', fontSize: '0.75rem' }}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
};
