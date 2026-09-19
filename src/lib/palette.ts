/** Paleta alegre compartida por las tarjetas del panel. */
export interface Swatch {
  color: string; // relleno principal (chips, cintas)
  soft: string; // fondo suave (píldoras, sombras sólidas)
  text: string; // texto legible sobre `soft`
}

export const SWATCHES: Swatch[] = [
  { color: '#FF6B35', soft: '#FFE6DA', text: '#B93C10' }, // naranja
  { color: '#4CC9F0', soft: '#DDF5FD', text: '#0C6E8E' }, // celeste
  { color: '#2FD6A0', soft: '#D9F8EC', text: '#0B7A57' }, // menta
  { color: '#7C4DFF', soft: '#EDE5FF', text: '#5B32D6' }, // morado
  { color: '#FF6FA8', soft: '#FFE3EE', text: '#B03068' }, // rosa
  { color: '#FFB703', soft: '#FFF0C2', text: '#7A5200' }, // amarillo
];

export const swatchAt = (i: number): Swatch => SWATCHES[i % SWATCHES.length];

/** Colores fijos por categoría de patrón háptico. */
export const CATEGORY_SWATCH: Record<string, Swatch> = {
  braille: SWATCHES[3],
  learning: SWATCHES[5],
  feedback: SWATCHES[2],
  navigation: SWATCHES[1],
  system: SWATCHES[4],
};

export const categorySwatch = (cat: string, fallbackIndex = 0): Swatch =>
  CATEGORY_SWATCH[cat] ?? swatchAt(fallbackIndex);
