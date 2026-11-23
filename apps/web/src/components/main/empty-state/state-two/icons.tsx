import { IconProps } from "@/icons";

export function FolderEmptyIcon(props: IconProps) {
  return (
    <svg
      width={100}
      height={100}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <g filter="url(#filter0_n_7587_42022)">
        <mask id="mask_empty_state_two_folder" fill="#fff">
          <path d="M33.372 12.512a11.81 11.81 0 018.886 4.033l3.53 4.033a4.862 4.862 0 003.659 1.66h30.295a9.03 9.03 0 019.03 9.03v45.846a8.336 8.336 0 01-8.336 8.336H19.642a8.336 8.336 0 01-8.336-8.336v-59.74a4.862 4.862 0 014.863-4.862h17.203z" />
        </mask>
        <path
          d="M33.372 12.512a11.81 11.81 0 018.886 4.033l3.53 4.033a4.862 4.862 0 003.659 1.66h30.295a9.03 9.03 0 019.03 9.03v45.846a8.336 8.336 0 01-8.336 8.336H19.642a8.336 8.336 0 01-8.336-8.336v-59.74a4.862 4.862 0 014.863-4.862h17.203z"
          fill="#9CB9FF"
        />
        <path
          d="M42.258 16.545l-.749.655.75-.655zm3.53 4.033l.749-.656-.75.656zm-12.416-8.066v.996c3.118 0 6.084 1.346 8.137 3.692l.75-.655.748-.656a12.805 12.805 0 00-9.635-4.372v.995zm8.886 4.033l-.749.655 3.53 4.033.749-.655.749-.656-3.53-4.033-.749.656zm7.189 5.693v.995h30.295v-1.99H49.447v.995zm30.295 0v.995a8.035 8.035 0 018.035 8.035h1.99c0-5.537-4.488-10.025-10.025-10.025v.995zm9.03 9.03h-.995v45.846h1.99V31.268h-.995zm0 45.846h-.995a7.34 7.34 0 01-7.341 7.34v1.991a9.331 9.331 0 009.331-9.331h-.995zm-8.336 8.336v-.995H19.642v1.99h60.794v-.995zm-60.794 0v-.995a7.34 7.34 0 01-7.34-7.341H10.31a9.331 9.331 0 009.331 9.331v-.995zm-8.336-8.336h.995v-59.74h-1.99v59.74h.995zm4.863-64.602v.996h17.203v-1.991H16.169v.995zm-4.863 4.863h.995a3.867 3.867 0 013.868-3.867v-1.991a5.858 5.858 0 00-5.858 5.858h.995zm34.482 3.203l-.75.655a5.858 5.858 0 004.409 2v-1.99a3.867 3.867 0 01-2.91-1.32l-.75.655z"
          fill="#7592FF"
          mask="url(#mask_empty_state_two_folder)"
        />
      </g>
      <g filter="url(#filter1_i_7587_42022)">
        <path
          d="M6.012 44.92c-.695-7.056 4.849-13.173 11.939-13.173h64.208c7.09 0 12.633 6.117 11.938 13.172l-3.05 30.966a11.996 11.996 0 01-11.938 10.82H21c-6.17 0-11.333-4.68-11.938-10.82l-3.05-30.966z"
          fill="url(#paint0_linear_7587_42022)"
        />
      </g>
      <path
        d="M17.95 32.347h64.21c6.735 0 12 5.81 11.34 12.514l-3.05 30.965a11.396 11.396 0 01-11.342 10.279H21.001A11.396 11.396 0 019.659 75.826L6.61 44.861c-.66-6.703 4.606-12.514 11.341-12.514z"
        stroke="#9CB9FF"
        strokeWidth={1.1996}
      />
      <defs>
        <filter
          id="filter0_n_7587_42022"
          x={11.3062}
          y={12.5124}
          width={77.4658}
          height={72.9376}
          filterUnits="userSpaceOnUse"
          colorInterpolationFilters="sRGB"
        >
          <feFlood floodOpacity={0} result="BackgroundImageFix" />
          <feBlend in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
          <feTurbulence
            type="fractalNoise"
            baseFrequency="3.6391680240631104 3.6391680240631104"
            stitchTiles="stitch"
            numOctaves={3}
            result="noise"
            seed={7560}
          />
          <feColorMatrix
            in="noise"
            type="luminanceToAlpha"
            result="alphaNoise"
          />
          <feComponentTransfer in="alphaNoise" result="coloredNoise1">
            <feFuncA
              type="discrete"
              tableValues="1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0"
            />
          </feComponentTransfer>
          <feComposite
            operator="in"
            in2="shape"
            in="coloredNoise1"
            result="noise1Clipped"
          />
          <feFlood floodColor="rgba(0, 0, 0, 0.25)" result="color1Flood" />
          <feComposite
            operator="in"
            in2="noise1Clipped"
            in="color1Flood"
            result="color1"
          />
          <feMerge result="effect1_noise_7587_42022">
            <feMergeNode in="shape" />
            <feMergeNode in="color1" />
          </feMerge>
        </filter>
        <filter
          id="filter1_i_7587_42022"
          x={5.95361}
          y={31.7474}
          width={88.2026}
          height={54.9576}
          filterUnits="userSpaceOnUse"
          colorInterpolationFilters="sRGB"
        >
          <feFlood floodOpacity={0} result="BackgroundImageFix" />
          <feBlend in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
          <feColorMatrix
            in="SourceAlpha"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset dy={2.47309} />
          <feComposite in2="hardAlpha" operator="arithmetic" k2={-1} k3={1} />
          <feColorMatrix values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.25 0" />
          <feBlend in2="shape" result="effect1_innerShadow_7587_42022" />
        </filter>
        <linearGradient
          id="paint0_linear_7587_42022"
          x1={50.0549}
          y1={31.7474}
          x2={50.0549}
          y2={86.7051}
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#C2D6FF" />
          <stop offset={1} stopColor="#9CB9FF" />
        </linearGradient>
      </defs>
    </svg>
  );
}
