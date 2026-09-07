// filepath: src/utils/cookies.ts

export function setCookie(name: string, value: string, days = 7) {
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax${secure}`;
}

export function getCookie(name: string): string | null {
  const cookies = document.cookie ? document.cookie.split("; ") : [];
  for (const c of cookies) {
    const [key, ...rest] = c.split("=");
    if (key === name) {
      try {
        return decodeURIComponent(rest.join("="));
      } catch {
        return rest.join("=");
      }
    }
  }
  return null;
}

export function deleteCookie(name: string) {
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; SameSite=Lax`;
}

export interface UserSession {
  userId: string;
  name: string;
  email?: string;
  cargo: "ADMIN" | "PROFESSOR" | "ALUNO" | "COMPETIDOR" | string;
  teamId?: string;
  teamName?: string;
  robotName?: string;
}

const SESSION_COOKIE_KEY = "sumo_user_session";

export function saveUserSession(user: UserSession) {
  try {
    setCookie(SESSION_COOKIE_KEY, JSON.stringify(user), 7);
    // Também mantém espelho no localStorage para compatibilidade imediata
    localStorage.setItem("user", JSON.stringify(user));
  } catch (e) {
    console.error("Erro ao salvar sessão em cookie:", e);
  }
}

export function getUserSession(): UserSession | null {
  try {
    // Tenta primeiro pelo Cookie seguro
    const fromCookie = getCookie(SESSION_COOKIE_KEY);
    if (fromCookie) {
      return JSON.parse(fromCookie);
    }
    // Fallback para localStorage
    const fromLocal = localStorage.getItem("user");
    if (fromLocal) {
      const parsed = JSON.parse(fromLocal);
      // Re-sincroniza cookie
      setCookie(SESSION_COOKIE_KEY, fromLocal, 7);
      return parsed;
    }
  } catch (e) {
    console.error("Erro ao recuperar sessão:", e);
  }
  return null;
}

export function clearUserSession() {
  deleteCookie(SESSION_COOKIE_KEY);
  localStorage.removeItem("user");
}
