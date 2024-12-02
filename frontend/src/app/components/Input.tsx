interface InputProps {
  labelValue: string;
  accessibilityValue: string;
  isRequired?: boolean;
  value: string;
  setValue: (newValue: string) => void;
  className?: string;
  classNameWrapper?: string;
}

export default function Input({
  labelValue,
  accessibilityValue,
  isRequired = true,
  value,
  setValue,
  className,
  classNameWrapper,
}: InputProps) {
  return (
    <div className={classNameWrapper}>
      <label htmlFor={`${accessibilityValue}`}>{labelValue}</label>
      <input
        type="text"
        id={`${accessibilityValue}`}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        required={isRequired}
        className={className}
      />
    </div>
  );
}
