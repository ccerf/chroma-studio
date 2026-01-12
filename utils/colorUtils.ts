export const generateRandomHex = (): string => {
  return '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0').toUpperCase();
};

export const hexToRgb = (hex: string): { r: number; g: number; b: number } | null => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
};

export const hexToHsl = (hex: string): string => {
  const rgb = hexToRgb(hex);
  if (!rgb) return "0, 0%, 0%";
  let r = rgb.r / 255, g = rgb.g / 255, b = rgb.b / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s, l = (max + min) / 2;
  if (max === min) h = s = 0;
  else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }
  return `${Math.round(h * 360)}°, ${Math.round(s * 100)}%, ${Math.round(l * 100)}%`;
};

export const rgbToHex = (r: number, g: number, b: number): string => {
  return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase();
};

export const mixColors = (hex1: string, hex2: string): string => {
  const rgb1 = hexToRgb(hex1);
  const rgb2 = hexToRgb(hex2);
  if (!rgb1 || !rgb2) return generateRandomHex();
  return rgbToHex(Math.round((rgb1.r + rgb2.r) / 2), Math.round((rgb1.g + rgb2.g) / 2), Math.round((rgb1.b + rgb2.b) / 2));
};

export const getLuminance = (hex: string): number => {
  const rgb = hexToRgb(hex);
  if (!rgb) return 0;
  const a = [rgb.r, rgb.g, rgb.b].map((v) => {
    v /= 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
};

export const getContrastRatio = (l1: number, l2: number): number => {
  const brightest = Math.max(l1, l2);
  const darkest = Math.min(l1, l2);
  return (brightest + 0.05) / (darkest + 0.05);
};

export const getTextColor = (bgColor: string): string => {
  return getLuminance(bgColor) > 0.48 ? '#0f172a' : '#ffffff';
};

export const getContrastStatus = (bgColor: string): string => {
  const lum = getLuminance(bgColor);
  const whiteContrast = getContrastRatio(lum, 1);
  const blackContrast = getContrastRatio(lum, 0);
  const ratio = Math.max(whiteContrast, blackContrast);
  if (ratio >= 7) return 'AAA';
  if (ratio >= 4.5) return 'AA';
  return 'LOW';
};

export const getColorName = (hex: string): string => {
  const rgb = hexToRgb(hex);
  if (!rgb) return "Neutral";
  const r = rgb.r / 255, g = rgb.g / 255, b = rgb.b / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s, l = (max + min) / 2;
  if (max === min) h = s = 0;
  else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }
  h *= 360; s *= 100; l *= 100;

  const dictionary = [
    { name: 'Red', h: 10 }, { name: 'Amber', h: 45 }, { name: 'Yellow', h: 70 },
    { name: 'Lime', h: 100 }, { name: 'Green', h: 150 }, { name: 'Cyan', h: 190 },
    { name: 'Blue', h: 240 }, { name: 'Violet', h: 290 }, { name: 'Pink', h: 340 }, { name: 'Crimson', h: 360 }
  ];
  let base = dictionary.find(p => h <= p.h)?.name || 'Grey';
  
  if (l < 5) return "Obsidian";
  if (l > 96) return "Ethereal White";
  if (s < 5) return l < 50 ? "Phantom" : "Ghost";
  
  let adjective = "";
  if (s > 90) adjective = l > 50 ? "Electric" : "Deep";
  else if (s > 75) adjective = l > 50 ? "Vivid" : "Rich";
  else if (s < 15) adjective = l > 60 ? "Muted" : "Stone";
  else if (l > 85) adjective = "Pastel";
  else if (l > 70) adjective = "Soft";
  else if (l < 25) adjective = "Noble";
  else if (l < 40) adjective = "Dusk";
  else adjective = "Pure";

  return `${adjective} ${base}`.trim();
};

export const ensureUniqueNames = (colors: { hex: string, name: string }[]): string[] => {
  const used = new Map<string, number>();
  return colors.map(c => {
    let baseName = getColorName(c.hex);
    const count = used.get(baseName) || 0;
    if (count > 0) {
      used.set(baseName, count + 1);
      return `${baseName} ${count + 1}`;
    }
    used.set(baseName, 1);
    return baseName;
  });
};

export const generateHarmoniousPalette = (count: number): string[] => {
  const baseHue = Math.random() * 360;
  return Array.from({ length: count }, (_, i) => {
    const h = (baseHue + (i * (360 / count))) % 360;
    const s = 40 + Math.random() * 40;
    const l = 30 + Math.random() * 40;
    return hslToHex(h, s, l);
  });
};

const hslToHex = (h: number, s: number, l: number): string => {
  l /= 100;
  const a = s * Math.min(l, 1 - l) / 100;
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color).toString(16).padStart(2, '0');
  };
  return `#${f(0)}${f(8)}${f(4)}`.toUpperCase();
};

/**
 * Local Semantic Synthesis Engine
 * Replaces the need for Gemini API by mapping keywords to hue ranges.
 */
export const generateThemePalette = (prompt: string, count: number): string[] => {
  const p = prompt.toLowerCase();
  let baseHue = Math.random() * 360;
  let saturationRange = [40, 80];
  let lightnessRange = [30, 70];
  let variance = 60;

  if (p.includes('ocean') || p.includes('sea') || p.includes('water')) {
    baseHue = 200; variance = 40;
  } else if (p.includes('forest') || p.includes('nature') || p.includes('leaf')) {
    baseHue = 120; variance = 50;
  } else if (p.includes('sunset') || p.includes('fire') || p.includes('warm')) {
    baseHue = 15; variance = 40; lightnessRange = [40, 60];
  } else if (p.includes('cyberpunk') || p.includes('neon') || p.includes('night')) {
    baseHue = 280; variance = 100; saturationRange = [80, 100]; lightnessRange = [20, 50];
  } else if (p.includes('pastel') || p.includes('soft') || p.includes('candy')) {
    saturationRange = [20, 40]; lightnessRange = [80, 95]; variance = 360;
  } else if (p.includes('minimal') || p.includes('grey') || p.includes('stone')) {
    saturationRange = [0, 10]; lightnessRange = [20, 90]; variance = 0;
  } else if (p.includes('desert') || p.includes('sand')) {
    baseHue = 35; variance = 25; saturationRange = [30, 60];
  }

  return Array.from({ length: count }, (_, i) => {
    const h = (baseHue + (Math.random() - 0.5) * variance + (i * (360 / count) * (variance === 360 ? 1 : 0))) % 360;
    const s = saturationRange[0] + Math.random() * (saturationRange[1] - saturationRange[0]);
    const l = lightnessRange[0] + Math.random() * (lightnessRange[1] - lightnessRange[0]);
    return hslToHex(h < 0 ? h + 360 : h, s, l);
  });
};