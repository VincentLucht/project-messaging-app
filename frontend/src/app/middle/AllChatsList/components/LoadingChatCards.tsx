export default function ChatCardSkeleton() {
  return (
    <div
      className={`grid h-[86px] animate-pulse cursor-pointer grid-cols-[1.5fr_8fr_1fr] gap-4 p-4
        transition-colors duration-150`}
    >
      {/* PFP */}
      <div className="h-[50px] w-[50px] rounded-full bg-gray-300"></div>

      {/* Chat name */}
      <div className="flex flex-col justify-between overflow-hidden">
        <div className="mt-[4px] h-[18px] w-1/2 rounded bg-gray-300"></div>

        {/* Typing Users / Last message */}
        <div className="mb-[6px] h-4 w-3/4 rounded bg-gray-300"></div>
      </div>

      <div>
        {/* Time sent */}
        <div className="h-5 w-10 rounded bg-gray-300"></div>
      </div>
    </div>
  );
}
