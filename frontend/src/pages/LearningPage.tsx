import React, { useState, useEffect } from 'react';
import {
  CourseItem,
  CourseCategory,
  CourseEnrollment,
  CertificateTemplate,
  IssuedCertificate,
} from '../../../shared/types/learning-engine';
import { learningService, CreateCoursePayload } from '../services/learningService';
import { CourseCreationModal } from '../components/learning/CourseCreationModal';
import { CertificateGeneratorModal } from '../components/learning/CertificateGeneratorModal';
import { CertificatePreview } from '../components/learning/CertificatePreview';
import { useToast } from '../context/ToastContext';
import {
  Award,
  BookOpen,
  Calendar,
  CheckCircle2,
  Clock,
  ExternalLink,
  GraduationCap,
  History,
  Layers,
  Plus,
  Search,
  Shield,
  ShieldCheck,
  User,
  AlertCircle,
  FileText,
  Filter,
} from 'lucide-react';

export const LearningPage: React.FC = () => {
  const { error, success } = useToast();
  const [activeTab, setActiveTab] = useState<'catalog' | 'my_learning' | 'certificates' | 'verify'>('catalog');
  const [courses, setCourses] = useState<CourseItem[]>([]);
  const [enrollments, setEnrollments] = useState<CourseEnrollment[]>([]);
  const [certificates, setCertificates] = useState<IssuedCertificate[]>([]);
  const [templates, setTemplates] = useState<CertificateTemplate[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters & Search
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [mandatoryOnly, setMandatoryOnly] = useState(false);

  // Modals state
  const [isCourseModalOpen, setIsCourseModalOpen] = useState(false);
  const [isCertGenModalOpen, setIsCertGenModalOpen] = useState(false);
  const [previewCert, setPreviewCert] = useState<IssuedCertificate | null>(null);
  const [historyDrawerCert, setHistoryDrawerCert] = useState<IssuedCertificate | null>(null);

  // Verification tab state
  const [verifyRefInput, setVerifyRefInput] = useState('CERT-2026-8812');
  const [verifyResult, setVerifyResult] = useState<{
    isValid: boolean;
    certificate?: IssuedCertificate;
    template?: CertificateTemplate;
    verificationMessage: string;
  } | null>(null);
  const [verifying, setVerifying] = useState(false);

  // Active Current User
  const currentUser = {
    id: 'usr_sakshi_1048',
    name: 'Sakshi Koparde',
    email: 'sakshi@tasknera.com',
    department: 'Engineering',
    role: 'HR_MANAGER', // Super Admin / HR Manager capability
  };

  const loadAllData = async () => {
    try {
      setLoading(true);
      const [fetchedCourses, fetchedEnrollments, fetchedCerts, fetchedTemplates] = await Promise.all([
        learningService.listCourses(),
        learningService.listUserEnrollments(currentUser.id),
        learningService.listCertificates(),
        learningService.listCertificateTemplates(),
      ]);

      setCourses(fetchedCourses);
      setEnrollments(fetchedEnrollments);
      setCertificates(fetchedCerts);
      setTemplates(fetchedTemplates);
    } catch (err) {
      console.error('Failed to load learning data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  const handleCreateCourse = async (payload: CreateCoursePayload) => {
    await learningService.createCourse(payload);
    await loadAllData();
  };

  const handleEnroll = async (courseId: string) => {
    try {
      await learningService.enrollUser(courseId, {
        id: currentUser.id,
        name: currentUser.name,
        email: currentUser.email,
        department: currentUser.department,
      });
      await loadAllData();
      success('Successfully enrolled in course!');
      setActiveTab('my_learning');
    } catch (err: any) {
      error(err.message || 'Enrollment failed');
    }
  };

  const handleUpdateProgress = async (enrollmentId: string, newProgress: number) => {
    try {
      await learningService.updateProgress(enrollmentId, newProgress);
      await loadAllData();
      success(`Course progress updated to ${newProgress}%`);
    } catch (err: any) {
      error(err.message || 'Failed to update progress');
    }
  };

  const handleSubmitAssignment = async (enrollmentId: string) => {
    const text = prompt('Enter submission URL or details:');
    if (!text) return;
    try {
      await learningService.submitAssignment(enrollmentId, text);
      await loadAllData();
      success('Assignment submitted and automatically evaluated with passing honors!');
    } catch (err: any) {
      error(err.message || 'Submission failed');
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!verifyRefInput.trim()) return;
    try {
      setVerifying(true);
      const res = await learningService.verifyCertificate(verifyRefInput.trim());
      setVerifyResult(res);
    } catch (err: any) {
      setVerifyResult({
        isValid: false,
        verificationMessage: err.message || 'Verification lookup failed',
      });
    } finally {
      setVerifying(false);
    }
  };

  // Filtered courses
  const filteredCourses = courses.filter((c) => {
    if (selectedCategory !== 'ALL' && c.category !== selectedCategory) return false;
    if (mandatoryOnly && !c.isMandatory) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        c.title.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q) ||
        c.instructorName.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const categories: { label: string; value: string }[] = [
    { label: 'All Courses', value: 'ALL' },
    { label: 'Security', value: 'SECURITY' },
    { label: 'Technical', value: 'TECHNICAL' },
    { label: 'Compliance', value: 'COMPLIANCE' },
    { label: 'Leadership', value: 'LEADERSHIP' },
    { label: 'Onboarding', value: 'ONBOARDING' },
    { label: 'Soft Skills', value: 'SOFT_SKILLS' },
    { label: 'Product', value: 'PRODUCT' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
              TaskNera Enterprise Academy
            </span>
            <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-emerald-100 text-emerald-800 flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" /> Step 8 & 9 Integrated
            </span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Learning & Development & Certificates
          </h1>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl">
            Author and assign courses, evaluate capstones, track corporate compliance, and issue
            reusable, cryptographically verified certificates.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsCourseModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl border border-slate-300 text-slate-700 bg-white hover:bg-slate-50 shadow-sm transition-colors"
          >
            <Plus className="w-4 h-4 text-slate-500" />
            Create Course
          </button>
          <button
            onClick={() => setIsCertGenModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl bg-blue-600 text-white hover:bg-blue-700 shadow-sm transition-colors"
          >
            <Award className="w-4 h-4" />
            Generate Certificate
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Total Courses</span>
            <BookOpen className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-1">{courses.length}</p>
          <p className="text-[11px] text-slate-500 mt-0.5">
            {courses.filter((c) => c.isMandatory).length} Mandatory Tracks
          </p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">My Enrollments</span>
            <GraduationCap className="w-4 h-4 text-indigo-600" />
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-1">{enrollments.length}</p>
          <p className="text-[11px] text-emerald-600 mt-0.5 font-medium">
            {enrollments.filter((e) => e.completionStatus === 'COMPLETED').length} Completed
          </p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Issued Certificates</span>
            <Award className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-1">{certificates.length}</p>
          <p className="text-[11px] text-slate-500 mt-0.5">Cryptographically Sealed</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Reusable Templates</span>
            <Layers className="w-4 h-4 text-purple-600" />
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-1">{templates.length}</p>
          <p className="text-[11px] text-purple-700 mt-0.5 font-medium">6 Core Categories</p>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center border-b border-slate-200 gap-6">
        <button
          onClick={() => setActiveTab('catalog')}
          className={`pb-3 text-xs font-semibold border-b-2 flex items-center gap-1.5 transition-colors ${
            activeTab === 'catalog'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          Course Catalog ({courses.length})
        </button>

        <button
          onClick={() => setActiveTab('my_learning')}
          className={`pb-3 text-xs font-semibold border-b-2 flex items-center gap-1.5 transition-colors ${
            activeTab === 'my_learning'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <GraduationCap className="w-4 h-4" />
          My Enrollments & Assignments ({enrollments.length})
        </button>

        <button
          onClick={() => setActiveTab('certificates')}
          className={`pb-3 text-xs font-semibold border-b-2 flex items-center gap-1.5 transition-colors ${
            activeTab === 'certificates'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Award className="w-4 h-4" />
          Certificates Registry ({certificates.length})
        </button>

        <button
          onClick={() => setActiveTab('verify')}
          className={`pb-3 text-xs font-semibold border-b-2 flex items-center gap-1.5 transition-colors ${
            activeTab === 'verify'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          Public Credential Verification
        </button>
      </div>

      {/* ===================================================================== */}
      {/* TAB 1: COURSE CATALOG */}
      {/* ===================================================================== */}
      {activeTab === 'catalog' && (
        <div className="space-y-4">
          {/* Controls Bar */}
          <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search courses by title, instructor, or syllabus..."
                className="w-full text-xs pl-9 pr-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Mandatory Toggle */}
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-700">
                <input
                  type="checkbox"
                  checked={mandatoryOnly}
                  onChange={(e) => setMandatoryOnly(e.target.checked)}
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-4 h-4"
                />
                Mandatory Tracks Only
              </label>
            </div>
          </div>

          {/* Categories Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            {categories.map((cat) => (
              <button
                key={cat.value}
                onClick={() => setSelectedCategory(cat.value)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
                  selectedCategory === cat.value
                    ? 'bg-slate-900 text-white'
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Courses Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCourses.map((course) => {
              const isEnrolled = enrollments.some((e) => e.courseId === course.id);
              return (
                <div
                  key={course.id}
                  className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 flex flex-col justify-between hover:border-slate-300 transition-all hover:shadow-md"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700 uppercase tracking-wide">
                        {course.category}
                      </span>
                      {course.isMandatory && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1">
                          <Shield className="w-3 h-3" /> Mandatory
                        </span>
                      )}
                    </div>

                    <h3 className="text-sm font-bold text-slate-900 leading-snug line-clamp-2">
                      {course.title}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1.5 line-clamp-2">
                      {course.description}
                    </p>

                    <div className="mt-4 pt-3 border-t border-slate-100 space-y-1.5 text-[11px] text-slate-600">
                      <div className="flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-slate-400" />
                        <span>Instructor: {course.instructorName}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>Duration: {course.duration}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>
                          {course.startDate} to {course.endDate}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-1 text-[11px] text-slate-500">
                      <Award className="w-3.5 h-3.5 text-amber-600" />
                      <span>{course.isCertificateEligible ? 'Certificate Eligible' : 'Audit Only'}</span>
                    </div>

                    {isEnrolled ? (
                      <span className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Enrolled
                      </span>
                    ) : (
                      <button
                        onClick={() => handleEnroll(course.id)}
                        className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow-sm"
                      >
                        Enroll Now
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* TAB 2: MY ENROLLMENTS & ASSIGNMENTS */}
      {/* ===================================================================== */}
      {activeTab === 'my_learning' && (
        <div className="space-y-4">
          {enrollments.length === 0 ? (
            <div className="bg-white p-12 text-center rounded-2xl border border-slate-200 shadow-sm">
              <GraduationCap className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-800">No active course enrollments yet</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                Explore the Course Catalog tab to enroll in corporate security training, engineering
                curricula, or leadership modules.
              </p>
              <button
                onClick={() => setActiveTab('catalog')}
                className="mt-4 px-4 py-2 text-xs font-semibold rounded-lg bg-blue-600 text-white hover:bg-blue-700"
              >
                Browse Course Catalog
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {enrollments.map((enr) => {
                const isCompleted = enr.completionStatus === 'COMPLETED';
                const hasPassedAssignment = Boolean(enr.assignmentSubmission?.isPassed);

                return (
                  <div
                    key={enr.id}
                    className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 hover:border-slate-300 transition-all"
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-bold text-slate-900">{enr.courseTitle}</h3>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              isCompleted
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-blue-100 text-blue-800'
                            }`}
                          >
                            {enr.completionStatus}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Enrolled on {new Date(enr.enrolledAt).toLocaleDateString()} &bull; Learner:{' '}
                          {enr.userName} ({enr.department})
                        </p>
                      </div>

                      {/* Progress Bar & Actions */}
                      <div className="flex items-center gap-4">
                        <div className="w-36">
                          <div className="flex justify-between text-[11px] font-medium text-slate-600 mb-1">
                            <span>Progress</span>
                            <span>{enr.progressPercent}%</span>
                          </div>
                          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                            <div
                              className="bg-blue-600 h-full rounded-full transition-all duration-300"
                              style={{ width: `${enr.progressPercent}%` }}
                            />
                          </div>
                        </div>

                        {!isCompleted && (
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => handleUpdateProgress(enr.id, Math.min(100, enr.progressPercent + 25))}
                              className="px-2.5 py-1 text-xs font-semibold rounded-md border border-slate-300 text-slate-700 hover:bg-slate-100"
                            >
                              +25% Progress
                            </button>
                            <button
                              onClick={() => handleSubmitAssignment(enr.id)}
                              className="px-3 py-1 text-xs font-semibold rounded-md bg-indigo-600 text-white hover:bg-indigo-700"
                            >
                              Submit Assignment
                            </button>
                          </div>
                        )}

                        {isCompleted && (
                          <button
                            onClick={() => {
                              setIsCertGenModalOpen(true);
                            }}
                            className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 flex items-center gap-1.5 shadow-sm"
                          >
                            <Award className="w-3.5 h-3.5" />
                            Claim Certificate
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Assignment Evaluation Sub-card */}
                    {enr.assignmentSubmission && (
                      <div className="mt-4 pt-3 border-t border-slate-100 bg-slate-50 p-3 rounded-lg flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          <span className="font-semibold text-slate-800">
                            Assessment Passed (Score: {enr.assignmentSubmission.scorePercent}%)
                          </span>
                          <span className="text-slate-500 italic">
                            &ldquo;{enr.assignmentSubmission.submissionTextOrUrl}&rdquo;
                          </span>
                        </div>
                        <span className="text-[11px] font-medium text-slate-500">
                          Submitted on {new Date(enr.assignmentSubmission.submittedAt).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ===================================================================== */}
      {/* TAB 3: CERTIFICATES REGISTRY & HISTORY */}
      {/* ===================================================================== */}
      {activeTab === 'certificates' && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Official Certificate Registry</h3>
                <p className="text-xs text-slate-500">
                  Verifiable credentials with tamper-proof reference numbers and immutable audit trails
                </p>
              </div>
              <button
                onClick={() => setIsCertGenModalOpen(true)}
                className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-blue-600 text-white hover:bg-blue-700 flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" /> Issue New Certificate
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-semibold uppercase text-[10px]">
                  <tr>
                    <th className="px-6 py-3">Reference No.</th>
                    <th className="px-6 py-3">Recipient</th>
                    <th className="px-6 py-3">Type</th>
                    <th className="px-6 py-3">Course / Milestone</th>
                    <th className="px-6 py-3">Issue Date</th>
                    <th className="px-6 py-3">Status</th>
                    <th className="px-6 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {certificates.map((cert) => (
                    <tr key={cert.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-3.5 font-mono font-bold text-blue-700">
                        {cert.referenceNumber}
                      </td>
                      <td className="px-6 py-3.5">
                        <div className="font-semibold text-slate-900">{cert.recipientName}</div>
                        <div className="text-[11px] text-slate-400">{cert.recipientEmail}</div>
                      </td>
                      <td className="px-6 py-3.5">
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                          {cert.certificateTypeCode}
                        </span>
                      </td>
                      <td className="px-6 py-3.5 font-medium text-slate-800">{cert.courseTitle}</td>
                      <td className="px-6 py-3.5 font-mono text-slate-500">{cert.issueDate}</td>
                      <td className="px-6 py-3.5">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 flex items-center gap-1 w-fit">
                          <CheckCircle2 className="w-3 h-3" />
                          {cert.status}
                        </span>
                      </td>
                      <td className="px-6 py-3.5 text-right space-x-2">
                        <button
                          onClick={() => setPreviewCert(cert)}
                          className="px-2.5 py-1 text-xs font-semibold rounded bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors"
                        >
                          View / Print PDF
                        </button>
                        <button
                          onClick={() => setHistoryDrawerCert(cert)}
                          className="px-2.5 py-1 text-xs font-semibold rounded border border-slate-300 text-slate-700 hover:bg-slate-100 transition-colors"
                        >
                          History
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* TAB 4: PUBLIC CREDENTIAL VERIFICATION */}
      {/* ===================================================================== */}
      {activeTab === 'verify' && (
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm text-center">
            <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mx-auto mb-3">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h2 className="text-lg font-bold text-slate-900">TaskNera Credential Verification</h2>
            <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
              Authenticate official course completion, internship, training, or appreciation
              certificates using their permanent reference number.
            </p>

            <form onSubmit={handleVerify} className="mt-5 flex gap-2">
              <input
                type="text"
                value={verifyRefInput}
                onChange={(e) => setVerifyRefInput(e.target.value)}
                placeholder="Enter Reference Number (e.g. CERT-2026-8812)"
                className="flex-1 text-xs px-3.5 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
              />
              <button
                type="submit"
                disabled={verifying}
                className="px-5 py-2.5 text-xs font-semibold rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow-sm"
              >
                {verifying ? 'Verifying...' : 'Verify Credential'}
              </button>
            </form>
          </div>

          {verifyResult && (
            <div
              className={`p-6 rounded-2xl border shadow-sm ${
                verifyResult.isValid
                  ? 'bg-emerald-50/50 border-emerald-200'
                  : 'bg-rose-50/50 border-rose-200'
              }`}
            >
              <div className="flex items-start gap-3">
                {verifyResult.isValid ? (
                  <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-6 h-6 text-rose-600 shrink-0 mt-0.5" />
                )}
                <div className="flex-1">
                  <h3
                    className={`text-sm font-bold ${
                      verifyResult.isValid ? 'text-emerald-900' : 'text-rose-900'
                    }`}
                  >
                    {verifyResult.isValid
                      ? 'Authentic Verified Credential'
                      : 'Verification Unsuccessful'}
                  </h3>
                  <p className="text-xs text-slate-600 mt-0.5">
                    {verifyResult.verificationMessage}
                  </p>

                  {verifyResult.certificate && (
                    <div className="mt-4 pt-3 border-t border-emerald-200 grid grid-cols-2 gap-3 text-xs">
                      <div>
                        <span className="text-slate-500 block">Recipient:</span>
                        <span className="font-bold text-slate-900">
                          {verifyResult.certificate.recipientName}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-500 block">Department:</span>
                        <span className="font-medium text-slate-800">
                          {verifyResult.certificate.recipientDepartment}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-500 block">Course / Accreditation:</span>
                        <span className="font-bold text-blue-700">
                          {verifyResult.certificate.courseTitle}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-500 block">Date of Issuance:</span>
                        <span className="font-mono text-slate-700">
                          {verifyResult.certificate.issueDate}
                        </span>
                      </div>
                      <div className="col-span-2 pt-2 border-t border-emerald-100">
                        <span className="text-[10px] font-mono text-slate-500 block">
                          Cryptographic SHA-256 Digest:
                        </span>
                        <span className="font-mono text-[11px] text-slate-700 break-all">
                          {verifyResult.certificate.verificationHash}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODALS & DRAWERS */}
      {/* ===================================================================== */}
      {/* 1. Course Creation Modal */}
      <CourseCreationModal
        isOpen={isCourseModalOpen}
        onClose={() => setIsCourseModalOpen(false)}
        onSubmit={handleCreateCourse}
        userRole={currentUser.role}
      />

      {/* 2. Certificate Generator Modal */}
      <CertificateGeneratorModal
        isOpen={isCertGenModalOpen}
        onClose={() => setIsCertGenModalOpen(false)}
        onCertificateIssued={(cert) => {
          loadAllData();
          setPreviewCert(cert);
        }}
        templates={templates}
        userRole={currentUser.role}
      />

      {/* 3. Certificate Preview (Print / PDF) */}
      {previewCert && (
        <CertificatePreview
          certificate={previewCert}
          template={templates.find((t) => t.id === previewCert.templateId)}
          onClose={() => setPreviewCert(null)}
        />
      )}

      {/* 4. Certificate History Timeline Modal */}
      {historyDrawerCert && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <History className="w-5 h-5 text-blue-600" />
                <h3 className="text-sm font-bold text-slate-900">Certificate Audit History</h3>
              </div>
              <button
                onClick={() => setHistoryDrawerCert(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                &times;
              </button>
            </div>
            <div className="p-6 space-y-4 max-h-96 overflow-y-auto">
              <p className="text-xs font-mono font-bold text-blue-700">
                {historyDrawerCert.referenceNumber} &bull; {historyDrawerCert.recipientName}
              </p>
              <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                {historyDrawerCert.history.map((h, idx) => (
                  <div key={idx} className="relative">
                    <div className="absolute -left-6 top-1 w-2.5 h-2.5 rounded-full bg-blue-600 ring-4 ring-white" />
                    <div className="text-xs font-bold text-slate-800">{h.action}</div>
                    <div className="text-[11px] text-slate-500">{h.notes}</div>
                    <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                      {new Date(h.timestamp).toLocaleString()} &bull; Actor: {h.performedBy}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 text-right">
              <button
                onClick={() => setHistoryDrawerCert(null)}
                className="px-4 py-1.5 text-xs font-semibold rounded-lg bg-slate-200 text-slate-700 hover:bg-slate-300"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
