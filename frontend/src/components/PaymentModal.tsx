import { useState } from "react";

interface PaymentModalProps {
  open: boolean;
  onClose: () => void;
  planName: string;
  planPrice: number;
}

export function PaymentModal({
  open,
  onClose,
  planName,
  planPrice,
}: PaymentModalProps) {
  const [selectedMethod, setSelectedMethod] = useState("card");

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-md relative">
        <button
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 text-2xl font-bold"
          onClick={onClose}
          aria-label="Close"
        >
          ×
        </button>
        <h2 className="text-2xl font-bold text-violet-700 mb-2">
          Payment for {planName}
        </h2>
        <p className="mb-6 text-gray-600">
          Amount: <span className="font-semibold">${planPrice}</span>
        </p>
        <div className="mb-4">
          <label className="block mb-2 font-semibold">
            Select Payment Method:
          </label>
          <div className="flex space-x-4">
            <button
              className={`px-4 py-2 rounded-lg border-2 font-medium transition-all ${selectedMethod === "card" ? "border-violet-600 bg-violet-50" : "border-gray-200 bg-gray-50"}`}
              onClick={() => setSelectedMethod("card")}
              type="button"
            >
              Card
            </button>
            <button
              className={`px-4 py-2 rounded-lg border-2 font-medium transition-all ${selectedMethod === "upi" ? "border-violet-600 bg-violet-50" : "border-gray-200 bg-gray-50"}`}
              onClick={() => setSelectedMethod("upi")}
              type="button"
            >
              UPI
            </button>
            <button
              className={`px-4 py-2 rounded-lg border-2 font-medium transition-all ${selectedMethod === "paypal" ? "border-violet-600 bg-violet-50" : "border-gray-200 bg-gray-50"}`}
              onClick={() => setSelectedMethod("paypal")}
              type="button"
            >
              PayPal
            </button>
          </div>
        </div>
        {/* Demo payment form (no real payment integration) */}
        <div className="mb-6">
          {selectedMethod === "card" && (
            <div>
              <input
                className="w-full mb-2 px-4 py-2 border rounded-lg"
                placeholder="Card Number"
              />
              <div className="flex space-x-2">
                <input
                  className="w-1/2 px-4 py-2 border rounded-lg"
                  placeholder="MM/YY"
                />
                <input
                  className="w-1/2 px-4 py-2 border rounded-lg"
                  placeholder="CVV"
                />
              </div>
            </div>
          )}
          {selectedMethod === "upi" && (
            <input
              className="w-full px-4 py-2 border rounded-lg"
              placeholder="UPI ID (e.g. name@bank)"
            />
          )}
          {selectedMethod === "paypal" && (
            <input
              className="w-full px-4 py-2 border rounded-lg"
              placeholder="PayPal Email"
            />
          )}
        </div>
        <button className="w-full bg-violet-600 text-white py-3 rounded-lg font-semibold hover:bg-violet-700 transition-colors">
          Pay Now
        </button>
      </div>
    </div>
  );
}
