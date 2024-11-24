import { Dispatch, SetStateAction } from 'react';

interface EditButtonProps {
  isUserAdmin: boolean;
  isEditActive: boolean;
  setIsEditActive: Dispatch<SetStateAction<boolean>>;
  confirmSetterFunc: Dispatch<SetStateAction<boolean>>;
}

export default function EditButton({
  isUserAdmin,
  isEditActive,
  setIsEditActive,
  confirmSetterFunc,
}: EditButtonProps) {
  return (
    isUserAdmin && (
      <button
        className="relative h-5 w-5 cursor-default"
        aria-label={isEditActive ? 'Save chat name' : 'Edit chat name'}
      >
        <img
          src="./pencil-outline.svg"
          alt="Edit group chat name"
          className={`absolute left-0 top-0 h-5 w-5 cursor-pointer transition-all duration-200
            ease-in-out hover:scale-[115%] active:scale-95
            ${isEditActive ? 'z-0 scale-75 opacity-0' : 'z-10 scale-100 opacity-100'}`}
          onClick={() => setIsEditActive(true)}
        />

        <img
          src="./pencil.svg"
          alt="Edit group chat name"
          className={`absolute left-0 top-0 h-5 w-5 cursor-pointer transition-all duration-200
            ease-in-out hover:scale-[115%] active:scale-95
            ${isEditActive ? 'scale-100 opacity-100' : 'scale-75 opacity-0'}`}
          onClick={() => setIsEditActive(false)}
        />

        <img
          src="./singleTick.svg"
          alt="Change group name submit"
          className={`absolute left-0 top-0 transition-all duration-200 ease-in-out ${
            isEditActive
              ? `translate-x-5 scale-100 cursor-pointer opacity-100 hover:scale-[115%]
                active:scale-95`
              : 'translate-x-5 scale-75 opacity-0'
          }`}
          onClick={() => {
            if (isEditActive) {
              setIsEditActive(false);
              confirmSetterFunc(true);
            }
          }}
        />
      </button>
    )
  );
}
