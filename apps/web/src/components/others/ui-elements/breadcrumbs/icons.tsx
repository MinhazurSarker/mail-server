import { IconProps } from "@/icons";

export function HomeIcon(props: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={16}
      height={16}
      viewBox="0 0 16 16"
      fill="none"
      {...props}
    >
      <path
        d="M8 10.832v2.5M7.4 2.868l-4.333 3.25a1 1 0 00-.4.8v5.414a1 1 0 001 1h8.666a1 1 0 001-1V6.918a1 1 0 00-.4-.8L8.6 2.868a1 1 0 00-1.2 0z"
        stroke="currentColor"
        strokeWidth={1.2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function DotIcon(props: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={4}
      height={4}
      viewBox="0 0 4 4"
      fill="none"
      {...props}
    >
      <circle cx={2} cy={2} r={2} fill="currentColor" />
    </svg>
  );
}
