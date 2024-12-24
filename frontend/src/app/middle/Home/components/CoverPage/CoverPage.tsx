import { Dispatch, SetStateAction } from 'react';

interface CoverPageProps {
  setterFunc: Dispatch<SetStateAction<boolean>>;
}

export default function CoverPage({ setterFunc }: CoverPageProps) {
  return (
    <div className="flex-col gap-3 df">
      <div className="text-2xl font-bold">Pick a Chat to start talking!</div>

      <button
        className="rounded-md border-2 border-white px-4 py-2 text-lg font-bold transition-colors
          duration-200 ease-in-out hover:bg-white hover:text-blue-500
          active:border-slate-200 active:bg-slate-200"
        onClick={() => setterFunc(true)}
      >
        Start a Conversation
      </button>
    </div>
  );
}
