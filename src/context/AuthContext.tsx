import {
    createContext,
    useContext,
    useEffect,
    useState,
    type ReactNode,
} from "react";

interface AuthContextType {
    token: string | null;
    login: (token: string, user: any) => void;
    logout: () => Promise<void>;
    isAuthenticated: boolean;
    loading: boolean;
    setDriverID: (driverID: string) => void;
    driverID: string | null;
    setUser: (user: any) => void;
    user: any;
    conversationId: number | null;
    setConversationId: (conversationId: number) => void;
    setUnreadCount: React.Dispatch<React.SetStateAction<ResponseData | null>>;
     unreadCount: ResponseData | null;
}
interface ResponseData {
    total: number;
    unread_count: {
        [key: number]: number;
    };
}


const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [token, setToken] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [driverID, setDriverID] = useState<string | null>(null);
    const [user, setUser] = useState<any>(null);
    const [conversationId, setConversationId] = useState<number | null>(null);
    const [unreadCount, setUnreadCount] = useState<ResponseData | null>({
        total: 0,
        unread_count: {}
    });

    useEffect(() => {
        const storedToken = localStorage.getItem("token");
        if (storedToken) {
            setToken(storedToken);
        }
        setLoading(false);
    }, []);

    const login = (newToken: string, user: any) => {
        localStorage.setItem("token", newToken);
        setToken(newToken);
        setUser(user)

    };

    const logout = async () => {
        setLoading(true);
        try {
            await fetch("https://mobile-test.izisol.uz/api/logout", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                    Authorization: `Bearer ${token}`,
                },
            });
        } catch (error) {
            console.error("Logout error:", error);
        } finally {
            localStorage.removeItem("token");
            setToken(null);
            setLoading(false);
        }
    };

    return (
        <AuthContext.Provider
            value={{
                token,
                login,
                logout,
                isAuthenticated: !!token,
                loading,
                setDriverID,
                driverID,
                user,
                setUser,
                conversationId,
                setConversationId,
                setUnreadCount,
                unreadCount

            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};