import { CreditCard, Shield } from "lucide-react";

export function PaymentSection() {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 p-4 border rounded-lg bg-green-50 border-green-200">
        <CreditCard className="h-5 w-5 text-green-700" />
        <div>
          <p className="font-medium text-sm">Pago seguro con Stripe</p>
          <p className="text-xs text-gray-600">
            Serás redirigido a Stripe para completar el pago
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3 p-4 border rounded-lg">
        <Shield className="h-5 w-5 text-gray-400" />
        <div>
          <p className="font-medium text-sm">Compra segura</p>
          <p className="text-xs text-gray-600">
            Tus datos están protegidos con encriptación SSL
          </p>
        </div>
      </div>

      <p className="text-xs text-gray-400 text-center mt-4">
        Al hacer clic en &quot;Pagar Ahora&quot; serás redirigido a la página de pago
        seguro de Stripe. Aceptamos Visa, Mastercard y más.
      </p>
    </div>
  );
}
