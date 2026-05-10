export default function SectionCard({ title, description, children, className = '' }) {
  return (
    <section className={`panel overflow-hidden ${className}`}>
      {(title || description) && (
        <div className="border-b border-slate-200 px-3 py-4 dark:border-slate-800 min-[360px]:px-5">
          {title && <h2 className="text-lg font-black">{title}</h2>}
          {description && <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{description}</p>}
        </div>
      )}
      <div className="p-3 min-[360px]:p-5">{children}</div>
    </section>
  );
}
