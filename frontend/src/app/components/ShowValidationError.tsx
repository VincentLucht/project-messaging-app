interface ShowValidationErrorsProps {
  error: string;
  className?: string;
}

export default function ShowValidationErrors({
  error,
  className,
}: ShowValidationErrorsProps) {
  return (
    <div
      className={`${className} ml-12 mt-[-20px] text-left text-sm text-red-500 transition-all
        duration-300 ease-in-out clamp-sm
        ${error ? 'max-h-20 opacity-100' : 'max-h-0 opacity-0'}`}
    >
      {error}
    </div>
  );
}
