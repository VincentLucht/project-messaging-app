import { Dispatch, SetStateAction } from 'react';

interface CloseButtonProps {
  className?: string;
  setterFunction?: Dispatch<SetStateAction<boolean>>;
}

export default function CloseButton({
  className,
  setterFunction,
}: CloseButtonProps) {
  return (
    <button
      className={`cursor-pointer text-2xl font-medium transition-all hover:scale-110
        hover:text-red-600 active:scale-90 ${className}`}
      onClick={() => {
        if (setterFunction) setterFunction(false);
      }}
      aria-label="Close Group Info"
    >
      &times;
    </button>
  );
}
