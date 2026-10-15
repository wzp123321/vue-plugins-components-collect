const Depth = 6

export const mapConfig = {
  mapDepth: Depth,
  mapTransparent: true,
  mapOpacity: 0.9,
  mapColor: '#132354',
  mapHoverColor: '#66FFFF',
  mapColorGradient: ['#42A0F9', '#1E6BF8', '#0B388A', '#132354'],
  mapSideColor1: '#1A5FCC',
  mapSideColor2: '#004099',
  topLineColor: 0x2FC0FF,
  topLineWidth: 3,
  selectedLineColor: 0x66FFFF,
  selectedLineWidth: 5,
  topLineZIndex: Depth + 1.5,
  label2dZIndex: Depth + 2,
  spotZIndex: Depth + 0.8,
} as const
