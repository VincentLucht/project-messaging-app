interface CheckboxProps {
  labelValue: string;
  accessibilityValue: string;
  value: boolean;
  setValue: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function Checkbox({
  labelValue,
  accessibilityValue,
  value,
  setValue,
}: CheckboxProps) {
  return (
    <div className="gap-4 df">
      <label htmlFor={`${accessibilityValue}`} className="font-bold">
        {labelValue}
      </label>
      <div className="flex items-center gap-2">
        <span>{value ? 'Yes' : 'No'}</span>
        <input
          type="checkbox"
          className="h-6 w-6"
          id={`${accessibilityValue}`}
          checked={value}
          onChange={(e) => setValue(e.target.checked)}
        />
      </div>
    </div>
  );
}
