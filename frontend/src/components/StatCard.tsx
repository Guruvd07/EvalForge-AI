interface StatCardProps {
    label: string;
    value: string | number;
    description?: string;
  }
  
  const StatCard = ({
    label,
    value,
    description,
  }: StatCardProps) => {
    return (
      <div className="rounded-xl border border-slate-800 bg-slate-900 p-5">
        <p className="text-sm text-slate-400">{label}</p>
  
        <p className="mt-2 text-2xl font-semibold tracking-tight">
          {value}
        </p>
  
        {description && (
          <p className="mt-2 text-xs text-slate-500">
            {description}
          </p>
        )}
      </div>
    );
  };
  
  export default StatCard;