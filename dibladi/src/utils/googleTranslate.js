const LANGUAGE_STORAGE_KEY = 'dibladi_language'

function setCookie(name, value, days = 1) {
  const date = new Date()
  date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000)
  const expires = `expires=${date.toUTCString()}`
  document.cookie = `${name}=${value};${expires};path=/`
}

function deleteCookie(name) {
  // Il faut supprimer le cookie sur TOUS les domaines possibles
  // (localhost, avec et sans le point devant le domaine)
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;domain=${window.location.hostname};`
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;domain=.${window.location.hostname};`
}

export function getSavedLanguage() {
  return localStorage.getItem(LANGUAGE_STORAGE_KEY) || 'fr'
}

function applyGoogleTranslate(code) {
  const trySetLanguage = (attempts = 0) => {
    const combo = document.querySelector('.goog-te-combo')

    if (combo) {
      if (code === 'fr') {
        // Revenir au français = langue d'origine du site
        // => on supprime le cookie plutôt que de "traduire vers fr"
        deleteCookie('googtrans')
      } else {
        setCookie('googtrans', `/fr/${code}`)
        combo.value = code
        combo.dispatchEvent(new Event('change'))
      }
      return
    }

    if (attempts < 15) {
      window.setTimeout(() => trySetLanguage(attempts + 1), 300)
    }
  }

  trySetLanguage()
}

export function changeLanguage(code) {
  const normalizedCode = code.toLowerCase()

  localStorage.setItem(LANGUAGE_STORAGE_KEY, normalizedCode)

  document.documentElement.dir = normalizedCode === 'ar' ? 'rtl' : 'ltr'
  document.documentElement.lang = normalizedCode

  applyGoogleTranslate(normalizedCode)
}

export function initSavedLanguage() {
  const savedCode = getSavedLanguage()

  document.documentElement.dir = savedCode === 'ar' ? 'rtl' : 'ltr'
  document.documentElement.lang = savedCode

  if (savedCode !== 'fr') {
    applyGoogleTranslate(savedCode)
  }
}