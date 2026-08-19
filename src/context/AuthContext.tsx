import {
  createContext,
  useContext,
  useState,
  type ReactNode,
} from "react";

import type { User } from "../types";

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;

  loginUser: (
    user: User,
    token: string,
  ) => void;

  logoutUser: () => void;
}

const AuthContext =
  createContext<AuthContextType | undefined>(
    undefined,
  );

/* =========================================================
   GET INITIAL USER
========================================================= */

const getInitialUser = (): User | null => {
  try {
    const storedUser =
      localStorage.getItem("user");

    if (!storedUser) {
      return null;
    }

    return JSON.parse(storedUser);
  } catch {
    localStorage.removeItem("user");

    return null;
  }
};

/* =========================================================
   PROVIDER
========================================================= */

export const AuthProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  /*
    Load authentication immediately from storage.

    This means refreshing the browser will NOT
    log the user out.
  */

  const [user, setUser] =
    useState<User | null>(() =>
      getInitialUser(),
    );

  const [token, setToken] =
    useState<string | null>(() =>
      localStorage.getItem("token"),
    );

  /*
    Because localStorage is read synchronously,
    there is no session-loading request anymore.
  */

  const isLoading = false;

  /* =========================================================
     LOGIN
  ========================================================= */

  const loginUser = (
    user: User,
    token: string,
  ) => {
    setUser(user);

    setToken(token);

    localStorage.setItem(
      "token",
      token,
    );

    localStorage.setItem(
      "user",
      JSON.stringify(user),
    );
  };

  /* =========================================================
     LOGOUT
  ========================================================= */

  const logoutUser = () => {
    setUser(null);

    setToken(null);

    localStorage.removeItem("token");

    localStorage.removeItem("user");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        loginUser,
        logoutUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

/* =========================================================
   HOOK
========================================================= */

export const useAuth =
  (): AuthContextType => {
    const context =
      useContext(AuthContext);

    if (!context) {
      throw new Error(
        "useAuth must be used within an AuthProvider",
      );
    }

    return context;
  };