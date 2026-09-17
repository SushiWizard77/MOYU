/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useEffect, useState } from "react";
import { authService } from "../services/auth.service";

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);

  const clearSession = useCallback(() => {
    localStorage.removeItem("moyuToken");
    localStorage.removeItem("moyuUser");
    setUser(null);
  }, []);

  const refreshUser = useCallback(async () => {
    const token = localStorage.getItem("moyuToken");
    if (!token) {
      setUser(null);
      setLoading(false);
      setInitialized(true);
      return;
    }

    try {
      const response = await authService.getMe();
      if (response.success) {
        setUser(response.user);
        localStorage.setItem("moyuUser", JSON.stringify(response.user));
      }
    } catch {
      clearSession();
    } finally {
      setLoading(false);
      setInitialized(true);
    }
  }, [clearSession]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    refreshUser();
  }, [refreshUser]);

  useEffect(() => {
    if (user?.theme) {
      document.documentElement.setAttribute("data-theme", user.theme);
      localStorage.setItem("moyuTheme", user.theme);
    }
  }, [user?.theme]);

  const login = async (email, password) => {
    const response = await authService.login(email, password);
    if (response.success) {
      localStorage.setItem("moyuToken", response.token);
      localStorage.setItem("moyuUser", JSON.stringify(response.user));
      setUser(response.user);
    }
    return response;
  };

  const register = async (name, email, password) => {
    const response = await authService.register(name, email, password);
    if (response.success) {
      localStorage.setItem("moyuToken", response.token);
      localStorage.setItem("moyuUser", JSON.stringify(response.user));
      setUser(response.user);
    }
    return response;
  };

  const forgotPassword = async (email) => {
    const response = await authService.forgotPassword(email);
    return response;
  };

  const resetPassword = async (token, newPassword) => {
    const response = await authService.resetPassword(token, newPassword);
    return response;
  };

  const logout = () => {
    clearSession();
  };

  // Google sign-in: exchange happens in authService; here we persist the MOYU session
  const googleLogin = async (credential) => {
    const response = await authService.googleLogin(credential);
    if (response.success) {
      localStorage.setItem("moyuToken", response.token);
      localStorage.setItem("moyuUser", JSON.stringify(response.user));
      setUser(response.user);
    }
    return response;
  };

  const changePassword = async (currentPassword, newPassword) => {
    const response = await authService.changePassword(currentPassword, newPassword);
    return response;
  };

  // Permanently deletes the account server-side and clears the local session
  const deleteAccount = async () => {
    const response = await authService.deleteAccount();
    clearSession();
    return response;
  };

  const updateUser = async (updates) => {
    const response = await authService.updateMe(updates);
    if (response.success) {
      setUser(response.user);
      localStorage.setItem("moyuUser", JSON.stringify(response.user));
    }
    return response;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        initialized,
        login,
        register,
        forgotPassword,
        resetPassword,
        googleLogin,
        changePassword,
        deleteAccount,
        logout,
        updateUser,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
