import type {
  FieldError,
  FieldValues,
  Path,
  UseFormRegister,
} from "react-hook-form";

interface FormInputProps<TFieldValues extends FieldValues> {
  label: string;
  name: Path<TFieldValues>;
  type?: string;
  placeholder?: string;
  register: UseFormRegister<TFieldValues>;
  error?: FieldError;
}

export function FormInput<TFieldValues extends FieldValues>({
  label,
  name,
  type = "text",
  placeholder,
  register,
  error,
}: FormInputProps<TFieldValues>) {
  return (
    <div className="space-y-2">
      <label
        htmlFor={name}
        className="block text-sm font-medium text-slate-700 dark:text-slate-300"
      >
        {label}
      </label>
      <input
        id={name}
        type={type}
        placeholder={placeholder}
        {...register(name)}
        className={`w-full rounded-lg border bg-white px-4 py-2 text-slate-900 placeholder-slate-500 transition-colors focus:outline-none focus:ring-2 dark:bg-slate-700 dark:text-white dark:placeholder-slate-400 ${
          error
            ? "border-red-500 focus:border-red-500 focus:ring-red-500"
            : "border-slate-300 focus:border-blue-500 focus:ring-blue-500 dark:border-slate-600"
        }`}
      />
      {error && (
        <p className="text-sm font-medium text-red-600 dark:text-red-400">
          {error.message}
        </p>
      )}
    </div>
  );
}
