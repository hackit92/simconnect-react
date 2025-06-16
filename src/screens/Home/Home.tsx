import React from "react";
import { Button } from "../../components/ui/button";
import { CardContent } from "../../components/ui/card";

export const Home = () => (
  <CardContent className="flex flex-col h-[730px] items-center p-0 relative self-stretch w-full overflow-hidden">
    <div className="relative w-full h-full flex flex-col items-center">
      <div className="relative z-10 flex flex-col items-center px-6 pt-12 pb-16 text-center">
        <h1 className="text-[40px] leading-[1.1] font-normal text-text-heading mb-6">
          te conectamos en <span className="font-bold">+ 200 países</span>
        </h1>

        <p className="text-base font-light text-text-body uppercase tracking-wide mb-10 max-w-[361px]">
          Con nuestros servicios de datos móviles internacionales
        </p>

        <p className="text-xl text-text-body mb-12 max-w-[361px] leading-relaxed">
          <span className="font-light">ya sea por </span>
          <span className="font-bold">turismo</span>
          <span className="font-light"> o </span>
          <span className="font-bold">negocios</span>
        </p>

        <Button
          variant="outline"
          className="w-[278px] h-12 border-2 border-primary rounded-lg bg-transparent hover:bg-primary hover:text-white transition-all duration-300 shadow-premium hover:shadow-premium-hover"
        >
          <span className="font-semibold text-primary hover:text-white text-lg text-center tracking-wide">
            EXPLORA NUESTROS PLANES
          </span>
        </Button>
      </div>

      <div className="relative w-full flex-1 mt-8">
        <img
          className="w-full h-full object-cover"
          alt="People using mobile phones internationally"
          src="/image-2.png"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-white/60 to-transparent" />
      </div>
    </div>
  </CardContent>
);