interface FloatingChatbotProps {
  onClick: () => void;
}

export default function FloatingChatbot({ onClick }: FloatingChatbotProps) {
  return (
    <div className="fixed bottom-6 right-6 z-50">
      <button 
        onClick={onClick}
        className="bg-dr-light-blue text-white w-14 h-14 rounded-full shadow-lg hover:bg-dr-blue transition-colors flex items-center justify-center hover:scale-105 transform"
        title="Asistente COSO"
      >
        <i className="fas fa-comments text-lg"></i>
      </button>
    </div>
  );
}
