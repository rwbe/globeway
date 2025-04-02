import { useEffect, useState } from 'react';

interface ProgressBarProps {
  progress?: number; // Progresso atual (0 a 100)
  indeterminate?: boolean; // Modo indeterminado (animação contínua)
  color?: string; // Cor da barra de progresso
  className?: string; // Classes adicionais para estilização
}

export default function ProgressBar({ progress = 0, indeterminate = false, color = '#3b82f6', className }: ProgressBarProps) {
  const [width, setWidth] = useState(0);

  // Atualiza a largura da barra de progresso
  useEffect(() => {
    if (!indeterminate) {
      setWidth(Math.min(100, Math.max(0, progress))); // Garante que o progresso esteja entre 0 e 100
    }
  }, [progress, indeterminate]);

  return (
    <div className={`w-full h-2 bg-gray-200 rounded-full overflow-hidden ${className}`}>
      <div
        className={`h-full rounded-full transition-all duration-300 ease-in-out ${
          indeterminate ? 'animate-indeterminate-progress' : ''
        }`}
        style={{
          width: indeterminate ? '50%' : `${width}%`,
          backgroundColor: color,
        }}
      />
      {/* Estilos para a animação indeterminada */}
      <style>
        {`
          @keyframes indeterminate-progress {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(200%); }
          }
          .animate-indeterminate-progress {
            animation: indeterminate-progress 1.5s infinite linear;
          }
        `}
      </style>
    </div>
  );
}