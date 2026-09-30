import React, { useRef } from 'react';
import { IssuedCertificate, CertificateTemplate } from '../../../../shared/types/learning-engine';
import { Award, CheckCircle2, Download, Printer, ShieldCheck, X } from 'lucide-react';

interface CertificatePreviewProps {
  certificate: IssuedCertificate;
  template?: CertificateTemplate;
  onClose: () => void;
}

export const CertificatePreview: React.FC<CertificatePreviewProps> = ({
  certificate,
  template,
  onClose,
}) => {
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    window.print();
  };

  const themeStyles = {
    ROYAL_BLUE: {
      border: 'border-blue-700',
      accent: 'text-blue-700',
      badge: 'bg-blue-50 text-blue-800 border-blue-200',
      bgGlow: 'from-blue-50 via-white to-slate-50',
    },
    EMERALD_GOLD: {
      border: 'border-emerald-700',
      accent: 'text-emerald-700',
      badge: 'bg-amber-50 text-amber-800 border-amber-300',
      bgGlow: 'from-amber-50/40 via-white to-emerald-50/40',
    },
    CLASSIC_SLATE: {
      border: 'border-slate-700',
      accent: 'text-slate-800',
      badge: 'bg-slate-100 text-slate-800 border-slate-300',
      bgGlow: 'from-slate-50 via-white to-zinc-50',
    },
    CORPORATE_PURPLE: {
      border: 'border-purple-700',
      accent: 'text-purple-700',
      badge: 'bg-purple-50 text-purple-800 border-purple-200',
      bgGlow: 'from-purple-50 via-white to-indigo-50',
    },
  };

  const activeTheme = themeStyles[template?.styleTheme || 'ROYAL_BLUE'];

  // Replace placeholders in template body
  const bodyText = template?.bodyTemplate
    ? template.bodyTemplate
        .replace(/{{recipientName}}/g, certificate.recipientName)
        .replace(/{{courseTitle}}/g, certificate.courseTitle)
        .replace(/{{recipientDepartment}}/g, certificate.recipientDepartment)
        .replace(/{{date}}/g, certificate.issueDate)
        .replace(/{{referenceNumber}}/g, certificate.referenceNumber)
    : `This certificate is proudly conferred upon ${certificate.recipientName} for exemplary completion and fulfilled standards in ${certificate.courseTitle}.`;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full flex flex-col max-h-[92vh] overflow-hidden border border-slate-200">
        {/* Top Control Bar */}
        <div className="px-6 py-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-blue-600" />
            <span className="font-semibold text-slate-900 text-sm">
              Official Credential: {certificate.referenceNumber}
            </span>
            <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-emerald-100 text-emerald-800 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" />
              Verified & Issued
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow-sm"
            >
              <Printer className="w-3.5 h-3.5" />
              Print / Save PDF
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Certificate Display Area */}
        <div className="p-6 overflow-y-auto bg-slate-100 flex justify-center">
          <div
            ref={printRef}
            className={`w-full max-w-3xl bg-gradient-to-br ${activeTheme.bgGlow} p-8 sm:p-12 rounded-xl shadow-lg border-8 ${activeTheme.border} relative flex flex-col justify-between text-center min-h-[520px]`}
            style={{
              boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
            }}
          >
            {/* Corner Ornaments */}
            <div className="absolute top-2 left-2 w-8 h-8 border-t-2 border-l-2 border-slate-400" />
            <div className="absolute top-2 right-2 w-8 h-8 border-t-2 border-r-2 border-slate-400" />
            <div className="absolute bottom-2 left-2 w-8 h-8 border-b-2 border-l-2 border-slate-400" />
            <div className="absolute bottom-2 right-2 w-8 h-8 border-b-2 border-r-2 border-slate-400" />

            {/* Header */}
            <div>
              <p className="text-xs uppercase tracking-widest font-bold text-slate-500 mb-1">
                {template?.headerText || 'TASKNERA ENTERPRISE ACADEMY'}
              </p>
              <h1 className={`text-2xl sm:text-3xl font-extrabold tracking-wide uppercase ${activeTheme.accent} font-serif`}>
                {template?.subHeaderText || 'CERTIFICATE OF ACCOMPLISHMENT'}
              </h1>
              <div className="w-24 h-0.5 bg-slate-300 mx-auto mt-2 mb-4" />
            </div>

            {/* Recipient Section */}
            <div className="my-4">
              <p className="text-xs italic text-slate-500">This credential is conferred upon</p>
              <h2 className="text-3xl sm:text-4xl font-serif font-bold text-slate-900 tracking-tight my-2">
                {certificate.recipientName}
              </h2>
              <p className="text-xs font-medium text-slate-600">
                Department of {certificate.recipientDepartment} &bull; TaskNera Global
              </p>
            </div>

            {/* Body */}
            <div className="max-w-xl mx-auto my-2">
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-sans">
                {bodyText}
              </p>
              {certificate.achievementDescription && (
                <p className="text-xs text-slate-500 mt-2 italic font-mono">
                  "{certificate.achievementDescription}"
                </p>
              )}
            </div>

            {/* Signatures & Seal */}
            <div className="mt-8 pt-6 border-t border-slate-200 grid grid-cols-3 items-end text-center">
              {/* Primary Signature */}
              <div className="flex flex-col items-center">
                <div className="w-36 border-b border-slate-400 pb-1 font-serif italic text-sm text-slate-800">
                  {certificate.signatoryName}
                </div>
                <span className="text-[11px] font-semibold text-slate-700 mt-1">
                  {certificate.signatoryName}
                </span>
                <span className="text-[10px] text-slate-500">
                  {certificate.signatoryTitle}
                </span>
              </div>

              {/* Central Seal Badge */}
              <div className="flex flex-col items-center justify-center">
                <div className={`w-14 h-14 rounded-full border-2 flex flex-col items-center justify-center shadow-inner ${activeTheme.badge}`}>
                  <ShieldCheck className="w-6 h-6 text-current" />
                  <span className="text-[8px] font-bold tracking-tighter uppercase mt-0.5">
                    {template?.badgeTitle || 'VERIFIED'}
                  </span>
                </div>
                <span className="text-[9px] font-mono text-slate-400 mt-1">
                  ISSUED: {certificate.issueDate}
                </span>
              </div>

              {/* Secondary Signature */}
              <div className="flex flex-col items-center">
                <div className="w-36 border-b border-slate-400 pb-1 font-serif italic text-sm text-slate-800">
                  {certificate.secondarySignatoryName || 'Alex Vance'}
                </div>
                <span className="text-[11px] font-semibold text-slate-700 mt-1">
                  {certificate.secondarySignatoryName || 'Alex Vance'}
                </span>
                <span className="text-[10px] text-slate-500">
                  {certificate.secondarySignatoryTitle || 'Chief Technology Officer'}
                </span>
              </div>
            </div>

            {/* Bottom Verification Footer */}
            <div className="mt-6 pt-3 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400 font-mono">
              <span>REFERENCE: {certificate.referenceNumber}</span>
              <span className="truncate max-w-[280px]" title={certificate.verificationHash}>
                SHA-256: {certificate.verificationHash.slice(0, 16)}...
              </span>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Cryptographically sealed under TaskNera HRMS Certificate Authority</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg border border-slate-300 text-slate-700 font-medium hover:bg-slate-100 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
