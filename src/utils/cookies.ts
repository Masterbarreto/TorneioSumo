// filepath: src/utils/cookies.ts

export function setCookie(name: string, value: string, days = 30) {
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax${secure}`;
}

export function setSessionCookie(name: string, value: string) {
  // Sem expires: o navegador exclui o cookie assim que a sessão/navegador é encerrado
  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; SameSite=Lax${secure}`;
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
  remember?: boolean;
}

const SESSION_COOKIE_KEY = "sumo_user_session";

export function saveUserSession(user: UserSession, remember = true) {
  try {
    user.remember = remember;
    if (remember) {
      // Sessão persistente: salva em cookie por 30 dias e no localStorage
      setCookie(SESSION_COOKIE_KEY, JSON.stringify(user), 30);
      localStorage.setItem("user", JSON.stringify(user));
      sessionStorage.removeItem("user");
    } else {
      // Sessão temporária: salva apenas como cookie de sessão e sessionStorage
      // (ao fechar o navegador, a sessão é destruída)
      deleteCookie(SESSION_COOKIE_KEY);
      setSessionCookie(SESSION_COOKIE_KEY, JSON.stringify(user));
      sessionStorage.setItem("user", JSON.stringify(user));
      localStorage.removeItem("user");
    }
  } catch (e) {
    console.error("Erro ao salvar sessão em cookie:", e);
  }
}

export function getUserSession(): UserSession | null {
  try {
    // 1. Tenta primeiro pelo Cookie da aplicação
    const fromCookie = getCookie(SESSION_COOKIE_KEY);
    if (fromCookie) {
      return JSON.parse(fromCookie);
    }
    // 2. Tenta pelo sessionStorage (sessão da aba atual)
    const fromSession = sessionStorage.getItem("user");
    if (fromSession) {
      return JSON.parse(fromSession);
    }
    // 3. Fallback para localStorage apenas se remember estiver ativo
    const fromLocal = localStorage.getItem("user");
    if (fromLocal) {
      const parsed = JSON.parse(fromLocal);
      if (parsed.remember !== false) {
        setCookie(SESSION_COOKIE_KEY, fromLocal, 30);
        return parsed;
      } else {
        localStorage.removeItem("user");
      }
    }
  } catch (e) {
    console.error("Erro ao recuperar sessão:", e);
  }
  return null;
}

export function clearUserSession() {
  deleteCookie(SESSION_COOKIE_KEY);
  localStorage.removeItem("user");
  sessionStorage.removeItem("user");
}
