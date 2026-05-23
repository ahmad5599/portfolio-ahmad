import ResumeClient from "./_components/resume-client";

export default function AdminResumePage() {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold">Resume &amp; CV Downloads</h1>
        <p className="text-slate-600">
          Download your dynamically generated CV or a role-specific tailored resume. All PDFs are generated on-demand from your current portfolio data.
        </p>
      </div>
      <ResumeClient />
    </div>
  );
}
