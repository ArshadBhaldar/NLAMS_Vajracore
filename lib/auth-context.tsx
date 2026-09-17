"use client"

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react"
import { useRouter, usePathname } from "next/navigation"
import { api, ApiError } from "@/lib/api"
import type { User, LoginResponse, UserRole } from "@/lib/types"
import { ROLE_HOME } from "@/lib/types"

interface AuthContextValue {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

/** Routes that don't require authentication */
const PUBLIC_ROUTES = ["/login"]

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()

  // On mount, check for an existing token and validate it
  useEffect(() => {
    const stored = localStorage.getItem("nlams_token")
    if (stored) {
      setToken(stored)
      api
        .get<{ user: User }>("/auth/me")
        .then((res) => {
          setUser(res.user)
        })
        .catch(() => {
          // Token expired or invalid — clear and redirect
          localStorage.removeItem("nlams_token")
          setToken(null)
          setUser(null)
        })
        .finally(() => setIsLoading(false))
    } else {
      setIsLoading(false)
    }
  }, [])

  // Redirect unauthenticated users away from protected routes
  useEffect(() => {
    if (!isLoading && !user && !PUBLIC_ROUTES.includes(pathname)) {
      router.replace("/login")
    }
  }, [isLoading, user, pathname, router])

  const login = useCallback(
    async (email: string, password: string) => {
      const res = await api.post<LoginResponse>("/auth/login", {
        email,
        password,
      })
      localStorage.setItem("nlams_token", res.token)
      setToken(res.token)
      setUser(res.user)

      // Redirect to role-specific dashboard
      const home = ROLE_HOME[res.user.role as UserRole] || "/dashboard"
      router.push(home)
    },
    [router]
  )

  const logout = useCallback(() => {
    localStorage.removeItem("nlams_token")
    setToken(null)
    setUser(null)
    router.push("/login")
  }, [router])

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>")
  return ctx
}
