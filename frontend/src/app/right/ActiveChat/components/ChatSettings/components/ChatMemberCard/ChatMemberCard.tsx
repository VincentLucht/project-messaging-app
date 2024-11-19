import LazyLoadImage from '@/app/components/LazyLoadImage';

interface ChatMemberCard {
  chatMember: {
    user: {
      id: string;
      name: string;
      username: string;
      profile_picture_url?: string;
      user_description: string;
    };
  };
  isUserSelf: boolean;
  isAdmin: boolean;
  isOwner: boolean;
  isUserAdmin: boolean;
}

export default function ChatMemberCard({
  chatMember,
  isUserSelf,
  isAdmin,
  isOwner,
  isUserAdmin,
}: ChatMemberCard) {
  const { user } = chatMember;

  return (
    <div
      className="-mx-2 flex min-h-[50px] cursor-pointer items-center justify-between px-2 py-3
        text-left transition-colors hover:rounded-md hover:bg-gray-strong"
    >
      <div className="flex items-center gap-4">
        {/* Member PFP */}
        <div className="min-h-11 min-w-11">
          <LazyLoadImage
            src={user.profile_picture_url}
            alt={user.profile_picture_url}
            className="aspect-square max-h-11 max-w-11 rounded-full object-cover"
          />
        </div>

        <div>
          <div className="flex items-baseline gap-1">
            {/* Member name */}
            <span className="flex font-semibold">{user.name}</span>

            {/* Member username */}
            <span className="align-baseline text-sm text-secondary-gray">
              @{user.username}
            </span>
          </div>

          {/* Member user description */}
          <div className="text-sm">{user.user_description}</div>
        </div>
      </div>

      <div className="flex h-[44px] content-start items-start">
        <div className="flex cursor-default gap-2">
          {/* Member is user */}
          {isUserSelf && (
            <div className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-800">
              You
            </div>
          )}

          {/* Member is owner */}
          {isOwner && (
            <div className="rounded-full bg-purple-100 px-3 py-1 text-xs font-medium text-purple-800">
              Owner
            </div>
          )}

          {/* Member role */}
          {isAdmin && (
            <div className="rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-800">
              Admin
            </div>
          )}
        </div>

        {/* User Admin options */}
        {isUserAdmin && (
          <div className="p-[6px] pt-1 transition-transform hover:scale-[115%] active:scale-95">
            <img
              className="h-4 min-h-4 w-4 min-w-4"
              src="./kebabMenu.svg"
              alt="kebab menu for admin actions"
            />
          </div>
        )}
      </div>
    </div>
  );
}
