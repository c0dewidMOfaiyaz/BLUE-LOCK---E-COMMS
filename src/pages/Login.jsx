import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useStore } from "../store/store.jsx";

export default function Login() {
  const { user, login, logout } = useStore();
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");

  return (
    <section className="view">
      <div className="panel narrow">
        <div className="panelHead">
          <h2>Login</h2>
          <div className="muted">Demo authentication (local)</div>
        </div>

        {user ? (
          <div style={{ padding: 14 }}>
            <div className="muted">Logged in as</div>
            <b>{user.email}</b>
            <div className="mt8 rowGap">
              <button className="outline" onClick={() => { logout(); }}>Logout</button>
              <button className="primary" onClick={() => nav("/")}>Go Home</button>
            </div>
          </div>
        ) : (
          <form
            className="form"
            onSubmit={(e) => {
              e.preventDefault();
              if (!email || !pass) return;
              login(email);
              nav("/");
            }}
          >
            <label>Email</label>
            <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required />

            <label>Password</label>
            <input value={pass} onChange={(e) => setPass(e.target.value)} type="password" required />

            <button className="primary" type="submit">Login</button>
            <div className="muted small">Any email/password works (demo).</div>
          </form>
        )}
      </div>
    </section>
  );
}
