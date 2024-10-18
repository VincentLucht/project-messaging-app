interface InputProps {
  labelValue: string;
  accessibilityValue: string;
  isRequired?: boolean;
  value: string;
  setValue: (newValue: string) => void;
}

export default function Input({
  labelValue,
  accessibilityValue,
  isRequired = true,
  value,
  setValue,
}: InputProps) {
  return (
    <div>
      <label htmlFor={`${accessibilityValue}`}>{labelValue}</label>
      <input
        type="text"
        id={`${accessibilityValue}`}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        required={isRequired}
      />
    </div>
  );
}
