interface PageHeaderProps {
    title: string;
    description?: string;
  }
  
  const PageHeader = ({
    title,
    description,
  }: PageHeaderProps) => {
    return (
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">
          {title}
        </h1>
  
        {description && (
          <p className="mt-2 text-slate-400">
            {description}
          </p>
        )}
      </div>
    );
  };
  
  export default PageHeader;