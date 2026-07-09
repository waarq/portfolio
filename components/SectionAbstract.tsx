export default function SectionAbstract({
  variant = "top-right",
}: {
  variant?: "top-right" | "bottom-left" | "top-left";
}) {
  const positions: Record<string, string> = {
    "top-right": "-right-24 -top-24",
    "bottom-left": "-left-24 -bottom-24",
    "top-left": "-left-24 -top-24",
  };

  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
    >
      {/* soft ambient glow */}
      <div
        className={`absolute h-72 w-72 rounded-full bg-accent-dusty/[0.06] blur-[100px] dark:bg-accent-dusty/[0.08] ${positions[variant]}`}
      />

      {/* faint geometric outline, purely textural */}
      <svg
        className={`absolute h-[26rem] w-[26rem] text-ink/[0.04] dark:text-dark-text/[0.05] ${
          variant === "top-right"
            ? "-right-32 -top-32"
            : variant === "bottom-left"
              ? "-left-32 -bottom-32"
              : "-left-32 -top-32"
        }`}
        viewBox="0 0 200 200"
        fill="none"
      >
        <circle cx="100" cy="100" r="99" stroke="currentColor" strokeWidth="0.5" />
        <circle cx="100" cy="100" r="70" stroke="currentColor" strokeWidth="0.5" />
      </svg>
    </div>
  );
}
