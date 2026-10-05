import type {
  AuthenticatedUser,
  UserAdmin,
  UserCompany,
  UserPatient,
  UserProfessional,
} from "@/types";

import {apiClient} from "@/lib/axios";

export type User = UserAdmin | UserCompany | UserPatient | UserProfessional;

interface LoginCredentials {
  email: string;
  password: string;
}

interface LoginResponse {
  access_token: string;
  token_type: string;
  user: User;
}

interface RegisterPatientFormData {
  first_name?: string;
  last_name?: string;
  dni?: string;
  date_of_birth?: string;
  email: string;
  password: string;
  confirmPassword: string;
  phone?: string;
  insurance?: string;
}

interface RegisterCompanyFormData {
  email: string;
  password: string;
  confirmPassword: string;
  company_name?: string;
  responsable_name?: string;
  cuit?: string;
  phone?: string;
  company_address?: string;
}

export const authService = {
  /**
   * Login de usuario
   */
  async login(credentials: LoginCredentials): Promise<{token: string; user: AuthenticatedUser}> {
    const formData = new URLSearchParams();

    formData.append("email", credentials.email);
    formData.append("password", credentials.password);

    const response = await apiClient.post<LoginResponse>("/login", formData, {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      withCredentials: true,
    });

    // El backend establece la cookie Authorization automáticamente
    // Obtener datos completos del usuario desde /me
    const user = await this.getCurrentUser();

    return {token: response.data.access_token, user};
  },

  /**
   * Register de pacientes particulares
   */
  async register(userData: RegisterPatientFormData): Promise<any> {
    const formData = new URLSearchParams();

    formData.append("first_name", userData.first_name ?? "");
    formData.append("last_name", userData.last_name ?? "");
    formData.append("dni", userData.dni ?? "");
    formData.append("date_of_birth", userData.date_of_birth ?? "");
    formData.append("email", userData.email);
    formData.append("password", userData.password);
    formData.append("phone", userData.phone ?? "");
    if (userData.insurance) {
      formData.append("insurance", userData.insurance);
    }

    const response = await apiClient.post("/auth/register/patient", formData, {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      withCredentials: true,
    });

    return response as any;
  },

  /**
   * Registar para empresas
   */
  async registerCompany(userData: RegisterCompanyFormData): Promise<any> {
    const formData = new URLSearchParams();

    formData.append("email", userData.email);
    formData.append("password", userData.password);
    formData.append("confirmPassword", userData.confirmPassword);
    formData.append("company_name", userData.company_name ?? "");
    formData.append("responsable_name", userData.responsable_name ?? "");
    formData.append("cuit", userData.cuit ?? "");
    formData.append("phone", userData.phone);
    if (userData.company_address) {
      formData.append("company_address", userData.company_address);
    }

    const response = await apiClient.post("/auth/register/company", formData, {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      withCredentials: true,
    });

    return response as any;
  },

  /**
   * Logout de usuario
   */
  async logout(): Promise<void> {
    try {
      await apiClient.post("/logout", null, {
        withCredentials: true,
      });
    } catch (_error: unknown) {
      console.error("Error during logout:", _error);
    }
    // El backend elimina la cookie Authorization automáticamente
  },

  /**
   * Obtener usuario actual
   */
  async getCurrentUser(): Promise<AuthenticatedUser> {
    const response = await apiClient.get("/me", {
      withCredentials: true,
    });

    return response.data as AuthenticatedUser;
  },

  /**
   * Verificar token actual
   */
  async verifyToken(): Promise<boolean> {
    try {
      await apiClient.get("/verify-token", {
        withCredentials: true,
      });

      return true;
    } catch (_error) {
      return false;
    }
  },
};
