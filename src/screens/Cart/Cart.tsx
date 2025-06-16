import React from "react";
import { CardContent } from "../../components/ui/card";

export const Cart = () => (
  <CardContent className="flex flex-col items-center px-4 py-[18px] relative self-stretch w-full">
    <h1 className="text-3xl font-bold mb-6">Carrito</h1>
    <p className="text-gray-600">Tu carrito está vacío</p>
  </CardContent>
);