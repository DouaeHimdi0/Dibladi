const FONT_STYLE_CLASSES = {
  'sans-bold': 'font-sans text-base font-extrabold tracking-tight text-black-text',
  'serif-italic': 'font-serif text-lg italic text-black-text',
  'condensed-upper': 'font-sans text-sm uppercase tracking-[0.18em] font-bold text-black-text',
  script: 'font-[cursive] text-xl text-black-text',
}

export function slugifyBrandName(name) {
  return String(name)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

export function getClassNameFromFontStyle(fontStyle) {
  return FONT_STYLE_CLASSES[fontStyle] ?? FONT_STYLE_CLASSES['sans-bold']
}

export function mapBrandFromApi(brand) {
  if (!brand) {
    return null
  }

  const fontStyle = brand.fontStyle ?? brand.font_style ?? 'sans-bold'

  return {
    id: brand.id,
    name: brand.name,
    slug: brand.slug ?? slugifyBrandName(brand.name),
    fontStyle,
    className: getClassNameFromFontStyle(fontStyle),
  }
}

export function getBrandStyleFromShopName(shopName) {
  return {
    name: shopName,
    slug: slugifyBrandName(shopName),
    fontStyle: 'sans-bold',
    className: getClassNameFromFontStyle('sans-bold'),
  }
}

export function getBrandTypography(slug) {
  return {
    display: String(slug).replace(/-/g, ' '),
    className: getClassNameFromFontStyle('sans-bold'),
  }
}
