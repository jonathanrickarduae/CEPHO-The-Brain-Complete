// Stub auth hook — returns a static user for the static prototype
// In production this would connect to Manus OAuth

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

export function useAuth(): {
  user: AuthUser | null;
  isLoading: boolean;
  loading: boolean;
  logout: () => void;
} {
  return {
    user: {
      id: "jonathan",
      name: "Jonathan Rickard",
      email: "jonathan@cepho.ai",
    },
    isLoading: false,
    loading: false,
    logout: () => {
      console.log("Logout triggered (stub)");
    },
  };
}
