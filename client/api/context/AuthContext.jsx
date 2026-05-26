import { createContext, useContext, useState, useEffect } from "react"
import Loading from "../../src/components/Loading"
import api from "../axios"

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const token = localStorage.getItem("token")
        if (!token) {
            setLoading(false)
            return
        }

        // Verify token and restore session
        api.get("/auth/session")
            .then((res) => setUser(res.data.user))
            .catch(() => localStorage.removeItem("token"))
            .finally(() => setLoading(false))
    }, [])

    const login = (userData, token) => {
        localStorage.setItem("token", token)
        setUser(userData)
    }

    const logout = () => {
        localStorage.removeItem("token")
        setUser(null)
    }

    if (loading) return <Loading />

    return (
        <AuthContext.Provider value={{ user, login, logout }}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => useContext(AuthContext)

export default AuthContext
