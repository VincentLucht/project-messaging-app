import { ForwardedRef, forwardRef } from 'react';

interface InputProps {
  labelValue: string;
  accessibilityValue: string;
  isRequired?: boolean;
  value: string;
  setValue: (newValue: string) => void;
  className?: string;
  classNameWrapper?: string;
}

const Input = forwardRef(
  (
    {
      labelValue,
      accessibilityValue,
      isRequired = true,
      value,
      setValue,
      className,
      classNameWrapper,
    }: InputProps,
    ref: ForwardedRef<HTMLInputElement>,
  ) => {
    return (
      <div className={classNameWrapper}>
        <label htmlFor={`${accessibilityValue}`}>{labelValue}</label>
        <input
          type="text"
          id={`${accessibilityValue}`}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          required={isRequired}
          className={`${className} outline-none focus:ring-2 focus:ring-blue-400`}
          ref={ref}
        />
      </div>
    );
  },
);

Input.displayName = 'Input';

export default Input;
