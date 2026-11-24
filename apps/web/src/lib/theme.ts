/**
 * Dynamic theming engine adopted from CellsCommerce.
 * Computes Tailwind / Shadcn CSS variables from a tenant's brand hex color
 * and injects them seamlessly with zero FOUC and zero runtime overhead.
 */

export function hexToHSL(hex: string): { h: number; s: number; l: number } {
  hex = hex.replace(/^#/, "");
  if (hex.length === 3) {
    hex = hex.split("").map((c) => c + c).join("");
  }
  const r = parseInt(hex.slice(0, 2), 16) / 255 || 0;
  const g = parseInt(hex.slice(2, 4), 16) / 255 || 0;
  const b = parseInt(hex.slice(4, 6), 16) / 255 || 0;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }

  return {
    h: +(h * 360).toFixed(1),
    s: +(s * 100).toFixed(1),
    l: +(l * 100).toFixed(1),
  };
}

export function generateTailwindShades(baseHex: string, name: string): Record<string, string> {
  if (!baseHex || !baseHex.startsWith("#")) {
    baseHex = "#0ea5e9"; // Default sovereign cyan/sky
  }
  const hsl = hexToHSL(baseHex);
  const { h, s, l } = hsl;

  const shades: Record<string, string> = {};
  const keys = [25, 50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950];

  const top = 96;
  const bottom = 10;

  // Upper half: 25 -> 500
  const upperKeys = keys.slice(0, 6);
  const upperStep = (top - l) / (upperKeys.length - 1 || 1);

  upperKeys.forEach((key, index) => {
    const light = +(top - index * upperStep).toFixed(1);
    shades[`--${name}-${key}`] = `hsl(${h}, ${s}%, ${light}%)`;
  });

  // Lower half: 600 -> 950
  const lowerKeys = keys.slice(6);
  const lowerStep = (l - bottom) / (lowerKeys.length - 1 || 1);

  lowerKeys.forEach((key, index) => {
    const light = +(l - index * lowerStep).toFixed(1);
    shades[`--${name}-${key}`] = `hsl(${h}, ${s}%, ${light}%)`;
  });

  return shades;
}

export function generateThemeCss(options: {
  primaryColor?: string;
  roundness?: "rounded" | "circular" | "sharp";
}): string {
  const primary = options.primaryColor || "#0ea5e9";
  const shades = generateTailwindShades(primary, "brand");
  const shadeEntries = Object.entries(shades)
    .map(([key, val]) => `${key}: ${val};`)
    .join("\n  ");

  const radius =
    options.roundness === "circular"
      ? "1.25rem"
      : options.roundness === "sharp"
        ? "0px"
        : "0.625rem";

  return `
:root {
  ${shadeEntries}
  --primary: ${shades["--brand-500"] || primary};
  --primary-foreground: hsl(0, 0%, 100%);
  --ring: ${shades["--brand-400"] || primary};
  --radius: ${radius};
  --sidebar-primary: ${shades["--brand-500"] || primary};
}
.dark {
  ${shadeEntries}
  --primary: ${shades["--brand-500"] || primary};
  --primary-foreground: hsl(0, 0%, 100%);
  --ring: ${shades["--brand-400"] || primary};
  --sidebar-primary: ${shades["--brand-400"] || primary};
}
`;
}

export function applyDynamicTheme(branding: {
  primaryColor?: string;
  faviconUrl?: string;
}) {
  if (typeof document === "undefined") return;

  if (branding.primaryColor) {
    const css = generateThemeCss({
      primaryColor: branding.primaryColor,
      roundness: "rounded",
    });
    let styleEl = document.getElementById("cellsinbox-dynamic-theme") as HTMLStyleElement | null;
    if (!styleEl) {
      styleEl = document.createElement("style");
      styleEl.id = "cellsinbox-dynamic-theme";
      document.head.appendChild(styleEl);
    }
    styleEl.innerHTML = css;
  }

  if (branding.faviconUrl) {
    let linkEl = document.getElementById("cellsinbox-favicon") as HTMLLinkElement | null;
    if (!linkEl) {
      linkEl = document.querySelector("link[rel*='icon']") as HTMLLinkElement | null;
    }
    if (!linkEl) {
      linkEl = document.createElement("link");
      linkEl.rel = "icon";
      linkEl.id = "cellsinbox-favicon";
      document.head.appendChild(linkEl);
    }
    linkEl.href = branding.faviconUrl;
    if (branding.faviconUrl.includes(".svg")) {
      linkEl.type = "image/svg+xml";
    } else if (branding.faviconUrl.includes(".ico")) {
      linkEl.type = "image/x-icon";
    } else {
      linkEl.type = "image/png";
    }
  }
}
