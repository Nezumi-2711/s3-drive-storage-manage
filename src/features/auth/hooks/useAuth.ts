import { useAuthToken } from "@/lib/auth-storage"
import { useSession } from "./useSession"
import { useLogin } from "./useLogin"
import { useLogout } from "./useLogout"

/**
 * Facade hook providing authentication status and actions.
 */
export function useAuth() {
  const token = useAuthToken()
  const session = useSession()
  const loginMutation = useLogin()
  const logoutMutation = useLogout()

  return {
    token,
    isAuthenticated: session.data?.valid === true,
    isLoading: session.isLoading,
    signIn: loginMutation.mutateAsync,
    signOut: logoutMutation.mutateAsync,
    isSigningIn: loginMutation.isPending,
    signInError: loginMutation.error,
    resetSignInError: loginMutation.reset,
  }
}
