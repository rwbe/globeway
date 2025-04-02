import { useState } from 'react';

interface TooltipProps {
  content: string | React.ReactNode; // Conteúdo do tooltip (pode ser texto ou JSX)
  position?: 'top' | 'bottom' | 'left' | 'right'; // Posição do tooltip
  children: React.ReactNode; // Elemento que aciona o tooltip
  className?: string; // Classes adicionais para estilização
  isDarkMode?: boolean; // Prop para alternância de temas
}

function Tooltip({ content, position = 'top', children, className, isDarkMode = false }: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);

  // Estilo base do tooltip
  const tooltipStyle = {
    top: position === 'bottom' ? '100%' : 'auto',
    bottom: position === 'top' ? '100%' : 'auto',
    left: position === 'right' ? '100%' : 'auto',
    right: position === 'left' ? '100%' : 'auto',
  };

  return (
    <div
      className={`relative inline-block ${className}`}
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      {isVisible && (
        <div
          className={`absolute z-50 px-3 py-2 text-sm rounded-lg shadow-lg whitespace-nowrap transform transition-all duration-200 ${
            position === 'top' ? '-translate-y-2' :
            position === 'bottom' ? 'translate-y-2' :
            position === 'left' ? '-translate-x-2' :
            position === 'right' ? 'translate-x-2' : ''
          } ${
            isDarkMode ? "bg-neutral-700 text-neutral-100" : "bg-white text-gray-800"
          }`}
          style={tooltipStyle}
        >
          {content}
          {/* Seta do tooltip */}
          <div
            className={`absolute w-2 h-2 transform rotate-45 ${
              isDarkMode ? "bg-neutral-700" : "bg-white"
            } ${
              position === 'top' ? 'bottom-[-4px] left-1/2 -translate-x-1/2' :
              position === 'bottom' ? 'top-[-4px] left-1/2 -translate-x-1/2' :
              position === 'left' ? 'right-[-4px] top-1/2 -translate-y-1/2' :
              position === 'right' ? 'left-[-4px] top-1/2 -translate-y-1/2' : ''
            }`}
          />
        </div>
      )}
    </div>
  );
}

export default Tooltip;