import { useState } from "react";
import API from "../services/api";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    try {
      const res = await API.post("/hospital/login", {
        email,
        password,
      });

      // 🔥 THIS FIXES YOUR ENTIRE PROBLEM
      localStorage.setItem("token", res.data.token);

      console.log("Login success");
      alert("Login successful");

      // optional redirect
      window.location.reload();
    } catch (err) {
      console.error(err.response?.data || err.message);
      alert("Login failed");
    }
  };

  return (
    <div>
      <h2>Hospital Login</h2>

      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <br />

      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <br />

      <button onClick={handleLogin}>Login</button>
    </div>
  );
}

export default Login;
