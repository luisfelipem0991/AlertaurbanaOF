export default function ProgressTracker({ estado, prioridad }) {
  const steps = [
    { id: "pendiente", label: "Reportado" },
    { id: "priorizado", label: "Priorizado JAC" },
    { id: "en_proceso", label: "En Obras" },
    { id: "resuelto", label: "Finalizado" }
  ];
  
  let activeIndex = 0;
  if (estado === "resuelto") activeIndex = 3;
  else if (estado === "en_proceso") activeIndex = 2;
  else if (estado === "pendiente" && prioridad && prioridad !== "descartado") activeIndex = 1;


  return (
    <div className="mt-8 mb-6 px-2">
      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Estado del Reporte</p>
      <div className="flex items-center justify-between relative">
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full"></div>
        <div className="absolute left-0 top-1/2 -translate-y-1/2 h-1.5 bg-indigo-500 rounded-full transition-all duration-700 ease-out" style={{ width: `${(activeIndex / (steps.length - 1)) * 100}%` }}></div>
        
        {steps.map((step, idx) => {
          const isCompleted = idx <= activeIndex;
          const isActive = idx === activeIndex;
          return (
            <div key={step.id} className="relative z-10 flex flex-col items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center border-4 border-white dark:border-slate-800 transition-colors duration-500 shadow-sm ${isCompleted ? "bg-indigo-500 text-white" : "bg-slate-200 dark:bg-slate-700 text-slate-400"}`}>
                {isCompleted ? (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                ) : (
                  <div className="w-2 h-2 rounded-full bg-slate-400 dark:bg-slate-500"></div>
                )}
              </div>
              <span className={`absolute top-10 text-[10px] sm:text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-colors duration-300 ${isActive ? "text-indigo-600 dark:text-indigo-400" : isCompleted ? "text-slate-600 dark:text-slate-300" : "text-slate-400 dark:text-slate-500"}`}>
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
