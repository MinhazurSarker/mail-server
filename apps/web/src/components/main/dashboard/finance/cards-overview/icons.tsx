import { SVGProps } from "react";

export type IconProps = SVGProps<SVGSVGElement>;

export function ContactlessIcon(props: IconProps) {
  return (
    <svg
      width="12"
      height="18"
      viewBox="0 0 12 18"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M6.27887 16.1701C10.2976 12.1513 10.2976 5.63571 6.27887 1.61701L7.89586 0C12.8075 4.91175 12.8075 12.8753 7.89586 17.7871L6.27887 16.1701ZM3.04479 12.9359C5.27749 10.7033 5.27749 7.08352 3.04479 4.85088L4.66177 3.23388C7.78747 6.35954 7.78747 11.4273 4.66177 14.5528L3.04479 12.9359Z"
        fill="currentColor"
      />
      <path
        d="M0 7.49219C0.681044 8.04224 0.788117 9.70961 0 10.3699L1.57669 11.5741C3.05722 10.0936 3.05722 7.69324 1.57669 6.21274L0 7.49219Z"
        fill="currentColor"
      />
    </svg>
  );
}
