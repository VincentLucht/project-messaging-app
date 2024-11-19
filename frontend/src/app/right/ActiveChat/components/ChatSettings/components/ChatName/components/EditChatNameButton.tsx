import { Dispatch, SetStateAction } from 'react';

interface EditChatNameButton {
  isUserAdmin: boolean;
  isEditActive: boolean;
  setIsEditActive: Dispatch<SetStateAction<boolean>>;
  setChangeChatName: Dispatch<SetStateAction<boolean>>;
}

export default function EditChatNameButton({
  isUserAdmin,
  isEditActive,
  setIsEditActive,
  setChangeChatName,
}: EditChatNameButton) {
  return (
    isUserAdmin && (
      <button
        onClick={() => setIsEditActive(!isEditActive)}
        className="relative h-5 w-5"
        aria-label={isEditActive ? 'Save chat name' : 'Edit chat name'}
      >
        <img
          src="./pencil-outline.svg"
          alt="Edit group chat name"
          className={`absolute left-0 top-0 h-5 w-5 transition-all duration-200 ease-in-out
            hover:scale-[115%] active:scale-95
            ${isEditActive ? 'z-0 scale-75 opacity-0' : 'z-10 scale-100 opacity-100'}`}
        />

        <img
          src="./pencil.svg"
          alt="Edit group chat name"
          className={`absolute left-0 top-0 h-5 w-5 transition-all duration-200 ease-in-out
            hover:scale-[115%] active:scale-95
            ${isEditActive ? 'scale-100 opacity-100' : 'scale-75 opacity-0'}`}
        />

        <img
          src="./singleTick.svg"
          alt="Change group name submit"
          className={`absolute left-0 top-0 transition-all duration-200 ease-in-out hover:scale-[115%]
            active:scale-95
            ${isEditActive ? 'translate-x-5 scale-100 opacity-100' : 'translate-x-5 scale-75 opacity-0'}`}
          onClick={() => setChangeChatName(true)}
        />
      </button>
    )
  );
}
