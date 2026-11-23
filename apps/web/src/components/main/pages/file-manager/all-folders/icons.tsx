import { IconProps } from "@/icons";

export function GradientFolderIcon(props: IconProps) {
  return (
    <svg
      width={36}
      height={36}
      viewBox="0 0 36 36"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M13.399 4.407C12.927 3.777 12.186 3.407 11.399 3.407H2.5C1.119 3.407 0 4.526 0 5.907v24.189C0 31.477 1.119 32.596 2.5 32.596h31c1.381 0 2.5-1.119 2.5-2.5V11.745c0-1.38-1.119-2.5-2.5-2.5H18.277c-.787 0-1.528-.37-2-1l-2.878-3.838z"
        fill="url(#folder_linear_gradient)"
      />
      <defs>
        <linearGradient
          id="folder_linear_gradient"
          x1="18"
          y1="3.407"
          x2="18"
          y2="32.596"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#FFDC78" />
          <stop offset="1" stopColor="#FBBC1A" />
        </linearGradient>
      </defs>
    </svg>
  );
}
