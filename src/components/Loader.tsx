import { Loader2 } from "lucide-react";

type Props = {
  size?: "sm" | "md" | "lg";
  label?: string;
  fullScreen?: boolean;
  className?: string;
};

const sizeMap = {
  sm: "w-4 h-4",
  md: "w-6 h-6",
  lg: "w-10 h-10",
};

export function Loader({ size = "md", label, fullScreen, className = "" }: Props) {
  const spinner = (
    <div className={`flex flex-col items-center gap-3 ${className}`}>
      <Loader2 className={`${sizeMap[size]} text-amber-600 animate-spin`} />
      {label && <p className="text-sm text-stone-500">{label}</p>}
    </div>
  );
  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-50/80 backdrop-blur-sm">
        {spinner}
      </div>
    );
  }
  return spinner;
}
