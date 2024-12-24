import { Dispatch, SetStateAction, useEffect, useRef } from 'react';

interface SearchChatProps {
  showSearchBar: boolean;
  query: string;
  setQuery: Dispatch<SetStateAction<string>>;
}

export default function SearchChat({
  showSearchBar,
  query,
  setQuery,
}: SearchChatProps) {
  const input = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (showSearchBar && input.current) {
      input.current.focus();
    }
  }, [showSearchBar]);

  return (
    <div className="">
      <input
        className="new-chat-input pl-2 outline-none focus:ring-2 focus:ring-blue-400"
        type="text"
        placeholder="Enter Chat Name..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        ref={input}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            input.current?.blur();
          }
        }}
      />
    </div>
  );
}
