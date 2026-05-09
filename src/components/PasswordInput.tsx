import { useState, type InputHTMLAttributes } from "react";
import { Eye, EyeOff } from "lucide-react";

type Props = Omit<InputHTMLAttributes<HTMLInputElement>, "type">;

export function PasswordInput(props: Props) {
  const [visible, setVisible] = useState(false);
  return (
    <div className="relative">
      <input
        {...props}
        type={visible ? "text" : "password"}
        className={
          "w-full rounded-xl border bg-[#0d0d0f] px-4 py-3 pr-11 text-sm text-foreground placeholder:text-weak outline-none transition-all focus:border-[rgba(255,45,45,0.6)] focus:shadow-[0_0_22px_rgba(255,45,45,0.18)] " +
          (props.className ?? "")
        }
        style={{ borderColor: "#2A2A2A" }}
      />
      <button
        type="button"
        aria-label={visible ? "Hide password" : "Show password"}
        onClick={() => setVisible((v) => !v)}
        className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-muted-foreground transition-colors hover:text-primary"
      >
        {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </button>
    </div>
  );
}
