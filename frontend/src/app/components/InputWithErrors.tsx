import { Dispatch, SetStateAction } from 'react';

interface LoginInputProps {
  value: string;
  placeholder: string;
  type?: string;
  imgPath?: string;
  setValue: Dispatch<SetStateAction<string>>;
  errors?: {
    [key: string]: string | undefined;
  };
  otherFunc?: (value: string) => void; // ? additional function f.e. for sending activity
  containerClassName?: string;
  className?: string;
  skipPlaceHolder?: string;
}

export function InputWithErrors({
  value,
  placeholder,
  imgPath,
  type = 'text',
  setValue,
  errors,
  otherFunc,
  containerClassName,
  className,
  skipPlaceHolder,
}: LoginInputProps) {
  let fieldName = '';
  if (skipPlaceHolder) {
    fieldName = skipPlaceHolder.toLowerCase();
  } else {
    fieldName = placeholder.toLowerCase();
  }

  let hasError;
  if (errors) {
    hasError = errors[fieldName] !== undefined;
  }

  return (
    <div className={`relative ${containerClassName ? containerClassName : ''}`}>
      <input
        type={type}
        value={value}
        onChange={(e) => {
          setValue(e.target.value);
          otherFunc ? otherFunc(e.target.value) : null;
        }}
        placeholder={placeholder}
        className={`${className ? className : 'rounded-3xl border-2 px-5 py-3 pr-11 clamp-sm'} ${
          hasError
            ? 'border-red-500'
            : 'border-transparent hover:border-white focus:border-transparent'
          }`}
      />

      {imgPath && (
        <img
          src={`${imgPath}.svg`}
          alt={`${imgPath} logo`}
          className="pointer-events-none right-5 w-6 center-vertical"
        />
      )}
    </div>
  );
}
