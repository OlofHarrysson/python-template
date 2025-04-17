interface PageContainerProps {
  children: React.ReactNode;
}

export function PageContainer({ children }: PageContainerProps) {
  return (
    <div className="min-h-[80vh] flex items-start justify-center px-2 py-2 md:px-4 md:py-8">
      <div className="bg-white/80 backdrop-blur-sm rounded-lg md:rounded-2xl shadow-xl p-3 md:p-8 w-full max-w-6xl">
        {children}
      </div>
    </div>
  );
}
