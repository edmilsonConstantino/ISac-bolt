// src/store/authStore.ts
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import authService, { User } from '@/services/authService';

// Tipos de perfil do frontend
export type UserProfile = 'admin' | 'academic_admin' | 'docente' | 'aluno';

// Mapeamento de roles do backend para o frontend
const backendRoleMap: Record<string, UserProfile> = {
  'admin': 'admin',
  'academic_admin': 'academic_admin',
  'student': 'aluno',
  'teacher': 'docente',
  'aluno': 'aluno',
  'docente': 'docente',
};

function mapRole(role: string): UserProfile | null {
  return backendRoleMap[role] ?? null;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  login: (credentials: { identifier: string; senha: string }) => Promise<UserProfile | null>;
  logout: () => Promise<void>;
  checkAuth: () => void;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>()(
  devtools(
    persist(
      (set, get) => ({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,

        login: async (credentials): Promise<UserProfile | null> => {
          set({ isLoading: true, error: null });

          try {
            const response = await authService.login(credentials);

            if (!response.success) {
              throw new Error(response.message || 'Erro ao fazer login');
            }

            const userData = response.data.user;
            const accessToken = response.data.access_token;

            if (!userData || !accessToken) {
              throw new Error('Dados incompletos na resposta do servidor');
            }

            // Mapear role do backend para o frontend
            const mappedRole = mapRole(userData.role);
            if (!mappedRole) {
              throw new Error(`Role inválido: ${userData.role}`);
            }

            // Garantir que o token está no localStorage
            if (!localStorage.getItem('access_token')) {
              localStorage.setItem('access_token', accessToken);
            }

            // Normalizar role para o frontend
            const userWithProfile = {
              ...userData,
              role: mappedRole,
              profile: mappedRole,
            };

            set({
              user: userWithProfile,
              isAuthenticated: true,
              isLoading: false,
              error: null
            });

            // Guardar user com role normalizado
            localStorage.setItem('user', JSON.stringify(userWithProfile));

            return mappedRole;

          } catch (error: any) {
            set({
              isLoading: false,
              error: error.message || 'Erro ao conectar com o servidor',
              isAuthenticated: false,
              user: null
            });

            throw error;
          }
        },

        logout: async () => {
          // Revogar tokens no backend antes de limpar
          await authService.logout();

          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: null
          });
        },

        checkAuth: () => {
          const isAuth = authService.isAuthenticated();
          const user = authService.getCurrentUser();
          const token = authService.getAccessToken();

          if (isAuth && user && token) {
            // Validar role (aceita tanto formato backend como frontend)
            const mappedRole = mapRole(user.role);
            if (!mappedRole) {
              authService.logout();
              set({ isAuthenticated: false, user: null });
              return;
            }

            set({
              user: {
                ...user,
                role: mappedRole,
                profile: mappedRole,
              },
              isAuthenticated: true
            });
          } else {
            if (!token) {
              authService.logout();
            }

            set({
              isAuthenticated: false,
              user: null
            });
          }
        },

        clearError: () => set({ error: null })
      }),
      {
        name: 'auth-storage',
        partialize: (state) => ({
          user: state.user,
          isAuthenticated: state.isAuthenticated
        })
      }
    ),
    { name: 'auth-store' }
  )
);
