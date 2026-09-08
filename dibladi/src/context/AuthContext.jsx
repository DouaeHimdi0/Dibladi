import { createContext, useCallback, useEffect, useMemo, useState } from 'react'
import { AUTH_STORAGE_KEY } from '../utils/api'

const AuthContext = createContext(undefined)

export const USER_ROLES = {
  ADMIN: 'ADMIN',
  VENDOR: 'VENDOR',
  CLIENT: 'CLIENT',
}

const VALID_ROLES = new Set(Object.values(USER_ROLES))

function normalizeRole(role) {
  if (!role) {
    return null
  }

  const normalizedRole = String(role).toUpperCase()

  return VALID_ROLES.has(normalizedRole) ? normalizedRole : null
}

function isValidStoredSession(storedSession) {
  const role = normalizeRole(storedSession?.role)

  return Boolean(storedSession?.email && role && storedSession?.token)
}

function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null)

  useEffect(() => {
    try {
      const raw = localStorage.getItem(AUTH_STORAGE_KEY)
      if (!raw) {
        return
      }

      const stored = JSON.parse(raw)
      if (!isValidStoredSession(stored)) {
        localStorage.removeItem(AUTH_STORAGE_KEY)
        localStorage.removeItem('dibladi_token')
        return
      }

      if (stored.token) {
        localStorage.setItem('dibladi_token', stored.token)
      }

      setCurrentUser({
        email: stored.email,
        name: stored.name ?? stored.email.split('@')[0],
        picture: stored.picture ?? '',
        role: normalizeRole(stored.role),
        token: stored.token ?? null,
      })
    } catch {
      localStorage.removeItem(AUTH_STORAGE_KEY)
      localStorage.removeItem('dibladi_token')
    }
  }, [])

  const login = useCallback(function login(userData, role, token) {
    const normalizedRole = normalizeRole(role)
    const payload = {
      email: userData.email,
      name: userData.name ?? userData.email.split('@')[0],
      picture: userData.picture ?? '',
      role: normalizedRole,
      token: token ?? null,
    }

    if (payload.token) {
      localStorage.setItem('dibladi_token', payload.token)
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(payload))
    } else {
      localStorage.removeItem('dibladi_token')
      localStorage.removeItem(AUTH_STORAGE_KEY)
    }

    setCurrentUser(payload)
  }, [])

  const logout = useCallback(function logout() {
    localStorage.removeItem('dibladi_token')
    localStorage.removeItem(AUTH_STORAGE_KEY)
    setCurrentUser(null)
  }, [])


  const isAuthenticated = currentUser !== null
  const isAdmin = currentUser?.role === USER_ROLES.ADMIN
  const isClient = currentUser?.role === USER_ROLES.CLIENT
  const isVendor = currentUser?.role === USER_ROLES.VENDOR

  const value = useMemo(
    () => ({
      currentUser,
      login,
      logout,
      isAuthenticated,
      isAdmin,
      isClient,
      isVendor,
    }),
    [currentUser, login, logout, isAuthenticated, isAdmin, isClient, isVendor],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export { AuthContext, AuthProvider }
