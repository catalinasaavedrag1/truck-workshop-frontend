export function cleanRut(value: string | null | undefined) {
  return String(value ?? '')
    .replace(/[^0-9kK]/g, '')
    .toUpperCase()
    .slice(0, 9)
}

export function formatRut(value: string | null | undefined) {
  const cleanValue = cleanRut(value)

  if (!cleanValue) {
    return ''
  }

  if (cleanValue.length < 8) {
    return formatRutBody(cleanValue)
  }

  const body = cleanValue.slice(0, -1)
  const verifier = cleanValue.slice(-1)

  return `${formatRutBody(body)}-${verifier}`
}

export function getRutSearchText(value: string | null | undefined) {
  const cleanValue = cleanRut(value)
  const formattedValue = formatRut(value)

  return [value, formattedValue, cleanValue].filter(Boolean).join(' ')
}

function formatRutBody(value: string) {
  return value.replace(/\B(?=(\d{3})+(?!\d))/g, '.')
}
