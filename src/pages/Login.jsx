import React from "react";
import { useAuth } from "../firebase/AuthContext";

const Login = () => {
    const {signInWithGoogle} = useAuth();
    const handleLogin = async () => {
        try {
            await signInWithGoogle();
        } catch (error) {
            console.error("Error signing in with Google", error);
        }
    }
    return (
        <>
            <h1>Login</h1>
            <button style={{backgroundColor: "blue"}} onClick={handleLogin}>Login with Google</button>
        </>
    );
}

export default Login;