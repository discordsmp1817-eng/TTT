export function TermiCoreLogo({ className = 'h-8 w-8' }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 36 36"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <rect width="36" height="36" rx="8" fill="#0F766E" />
      <path d="M10 11H26V13.5H10V11Z" fill="white" />
      <path d="M10 16.75H26V19.25H10V16.75Z" fill="#99F6E4" />
      <path d="M10 22.5H21V25H10V22.5Z" fill="white" />
      <circle cx="23.5" cy="23.75" r="2" fill="#2DD4BF" />
    </svg>
  );
}
