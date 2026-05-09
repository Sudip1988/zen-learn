export function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      {Icon && (
        <div className="w-16 h-16 bg-zen-surface rounded-full flex items-center justify-center mb-4">
          <Icon className="w-8 h-8 text-zen-muted" />
        </div>
      )}
      <h3 className="text-lg font-semibold text-zen-text mb-2">{title}</h3>
      {description && (
        <p className="text-zen-text-secondary text-sm max-w-xs mb-6">{description}</p>
      )}
      {action && action}
    </div>
  );
}
