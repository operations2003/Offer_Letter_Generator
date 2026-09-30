import React, { useState } from 'react';
import { CourseCategory, CourseItem } from '../../../../shared/types/learning-engine';
import { CreateCoursePayload } from '../../services/learningService';
import { BookOpen, Calendar, Clock, Link2, Shield, User, X } from 'lucide-react';

interface CourseCreationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (payload: CreateCoursePayload) => Promise<void>;
  userRole?: string;
}

export const CourseCreationModal: React.FC<CourseCreationModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  userRole = 'HR_MANAGER',
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    title: '',
    category: 'TECHNICAL' as CourseCategory,
    description: '',
    instructorName: 'Sakshi Koparde',
    instructorEmail: 'sakshi@tasknera.com',
    materialUrl: '',
    duration: '4 Hours',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 45 * 86400000).toISOString().split('T')[0],
    isMandatory: false,
    isCertificateEligible: true,
    hasAssignment: true,
    assignmentTitle: 'Course Capstone Project',
    assignmentDescription: 'Complete and submit hands-on deliverable fulfilling curriculum requirements.',
    passingScorePercent: 80,
  });

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!form.title.trim()) {
      setError('Course Title is required');
      return;
    }
    if (!form.instructorName.trim()) {
      setError('Instructor Name is required');
      return;
    }

    try {
      setLoading(true);
      const payload: CreateCoursePayload = {
        title: form.title,
        category: form.category,
        description: form.description,
        instructorName: form.instructorName,
        instructorEmail: form.instructorEmail,
        materialUrl: form.materialUrl,
        duration: form.duration,
        startDate: form.startDate,
        endDate: form.endDate,
        isMandatory: form.isMandatory,
        isCertificateEligible: form.isCertificateEligible,
        creatorRole: userRole,
        creatorId: 'usr_admin_001',
        assignment: form.hasAssignment
          ? {
              title: form.assignmentTitle,
              description: form.assignmentDescription,
              passingScorePercent: Number(form.passingScorePercent),
            }
          : undefined,
      };

      await onSubmit(payload);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to create course');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Create L&D Academy Course</h2>
              <p className="text-xs text-slate-500">
                Author and publish structured curriculum with assignments & certification
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 text-xs font-medium">
              {error}
            </div>
          )}

          {/* Title & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Course Title <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="e.g. Advanced AI Systems Engineering 2026"
                className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Category</label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value as CourseCategory })}
                className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
              >
                <option value="COMPLIANCE">Compliance</option>
                <option value="TECHNICAL">Technical</option>
                <option value="LEADERSHIP">Leadership</option>
                <option value="SECURITY">Security</option>
                <option value="ONBOARDING">Onboarding</option>
                <option value="SOFT_SKILLS">Soft Skills</option>
                <option value="PRODUCT">Product</option>
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Course Description</label>
            <textarea
              rows={2}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Outline objectives, key syllabus milestones, and learning outcomes..."
              className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          {/* Instructor & Contact */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Instructor Name <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <User className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  required
                  value={form.instructorName}
                  onChange={(e) => setForm({ ...form, instructorName: e.target.value })}
                  placeholder="e.g. Vikram Joshi"
                  className="w-full text-xs pl-8 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Instructor Email</label>
              <input
                type="email"
                value={form.instructorEmail}
                onChange={(e) => setForm({ ...form, instructorEmail: e.target.value })}
                placeholder="instructor@tasknera.com"
                className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Material Link & Duration */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Course Material / LMS Link</label>
              <div className="relative">
                <Link2 className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="url"
                  value={form.materialUrl}
                  onChange={(e) => setForm({ ...form, materialUrl: e.target.value })}
                  placeholder="https://learning.tasknera.com/..."
                  className="w-full text-xs pl-8 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Duration</label>
              <div className="relative">
                <Clock className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={form.duration}
                  onChange={(e) => setForm({ ...form, duration: e.target.value })}
                  placeholder="e.g. 4 Hours, 2 Weeks"
                  className="w-full text-xs pl-8 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Start Date</label>
              <div className="relative">
                <Calendar className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="date"
                  value={form.startDate}
                  onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                  className="w-full text-xs pl-8 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">End Date</label>
              <div className="relative">
                <Calendar className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="date"
                  value={form.endDate}
                  onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                  className="w-full text-xs pl-8 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Toggles: Mandatory & Certificate Eligibility */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.isMandatory}
                onChange={(e) => setForm({ ...form, isMandatory: e.target.checked })}
                className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-4 h-4"
              />
              <span className="text-xs font-semibold text-slate-800">
                Mandatory Course (Required for all department personnel)
              </span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.isCertificateEligible}
                onChange={(e) => setForm({ ...form, isCertificateEligible: e.target.checked })}
                className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-4 h-4"
              />
              <span className="text-xs font-semibold text-slate-800">
                Certificate Eligible (Generates verifiable credential upon completion)
              </span>
            </label>
          </div>

          {/* Assignment Block */}
          <div className="p-3.5 border border-slate-200 rounded-xl space-y-3 bg-slate-50/50">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.hasAssignment}
                onChange={(e) => setForm({ ...form, hasAssignment: e.target.checked })}
                className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-4 h-4"
              />
              <span className="text-xs font-bold text-slate-800">
                Attach Evaluated Assignment / Assessment
              </span>
            </label>

            {form.hasAssignment && (
              <div className="space-y-3 pt-2">
                <div className="grid grid-cols-3 gap-3">
                  <div className="col-span-2">
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Assignment Title
                    </label>
                    <input
                      type="text"
                      value={form.assignmentTitle}
                      onChange={(e) => setForm({ ...form, assignmentTitle: e.target.value })}
                      className="w-full text-xs px-2.5 py-1.5 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Passing Score (%)
                    </label>
                    <input
                      type="number"
                      min={50}
                      max={100}
                      value={form.passingScorePercent}
                      onChange={(e) => setForm({ ...form, passingScorePercent: Number(e.target.value) })}
                      className="w-full text-xs px-2.5 py-1.5 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Evaluation Criteria & Submission Directions
                  </label>
                  <textarea
                    rows={2}
                    value={form.assignmentDescription}
                    onChange={(e) => setForm({ ...form, assignmentDescription: e.target.value })}
                    className="w-full text-xs px-2.5 py-1.5 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  />
                </div>
              </div>
            )}
          </div>

          {/* RBAC Notice */}
          <div className="flex items-center gap-2 text-[11px] text-slate-500 pt-1">
            <Shield className="w-3.5 h-3.5 text-blue-600" />
            <span>Publishing as {userRole} (Authorized for Curriculum Management)</span>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 text-xs font-semibold rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-xs font-semibold rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow-sm"
            >
              {loading ? 'Publishing Course...' : 'Publish Course'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
