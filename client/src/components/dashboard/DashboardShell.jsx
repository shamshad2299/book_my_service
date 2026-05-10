import PageHeader from '../ui/PageHeader.jsx';

export default function DashboardShell({ eyebrow, title, description, action, children }) {
  return (
    <main className="min-h-[calc(100vh-65px)] bg-slate-50 dark:bg-slate-950">
      <div className="mx-auto max-w-7xl px-2 py-6 min-[360px]:px-4 min-[360px]:py-8">
        <PageHeader eyebrow={eyebrow} title={title} description={description} action={action} />
        {children}
      </div>
    </main>
  );
}
