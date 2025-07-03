import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./i18n";
import { Frame } from "./screens/Frame";
import { LoginForm } from "./components/auth/LoginForm";
import { SignupForm } from "./components/auth/SignupForm";
import { CheckoutForm } from "./screens/CheckoutForm";
import { Success } from "./screens/Success";

createRoot(document.getElementById("app") as HTMLElement).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginForm />} />
        <Route path="/signup" element={<SignupForm />} />
        <Route path="/checkout" element={<CheckoutForm />} />
        <Route path="/success" element={<Success />} />
        <Route path="/*" element={<Frame />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
);
