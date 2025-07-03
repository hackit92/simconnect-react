import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./i18n";
import { CurrencyProvider } from "./contexts/CurrencyContext";
import { CartProvider } from "./contexts/CartContext";
import { LanguageProvider } from "./contexts/LanguageContext";
import { Frame } from "./screens/Frame";
import { LoginForm } from "./components/auth/LoginForm";
import { SignupForm } from "./components/auth/SignupForm";
import { CheckoutForm } from "./screens/CheckoutForm";
import { Success } from "./screens/Success";

createRoot(document.getElementById("app") as HTMLElement).render(
  <StrictMode>
    <CurrencyProvider>
      <LanguageProvider>
        <CartProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/login" element={<LoginForm />} />
              <Route path="/signup" element={<SignupForm />} />
              <Route path="/checkout" element={<CheckoutForm />} />
              <Route path="/success" element={<Success />} />
              <Route path="/*" element={<Frame />} />
            </Routes>
          </BrowserRouter>
        </CartProvider>
      </LanguageProvider>
    </CurrencyProvider>
  </StrictMode>,
);
