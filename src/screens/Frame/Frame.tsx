import React from "react";
import { CurrencyProvider } from "../../contexts/CurrencyContext";
import { CartProvider } from "../../contexts/CartContext";
import { LanguageProvider } from "../../contexts/LanguageContext";
import { useIsDesktop } from "../../hooks/useIsDesktop";
import { MobileAppLayout } from "../../layouts/MobileAppLayout";
import { DesktopAppLayout } from "../../layouts/DesktopAppLayout";

const FrameContent = (): JSX.Element => {
  const isDesktop = useIsDesktop();

  if (isDesktop) {
    return <DesktopAppLayout />;
  }

  return (
    <div className="bg-transparent flex flex-row justify-center w-full">
      <div className="w-[390px] min-h-[853px]">
        <div className="flex flex-col w-full h-full items-start bg-white">
          <MobileAppLayout />
        </div>
      </div>
    </div>
  );
};

export const Frame = (): JSX.Element => {
  return (
    <CurrencyProvider>
      <LanguageProvider>
        <CartProvider>
          <FrameContent />
        </CartProvider>
      </LanguageProvider>
    </CurrencyProvider>
  );
};