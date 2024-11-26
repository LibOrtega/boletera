"use client";

import { useEffect, useState } from "react";

// Qr Scanner
import { Html5QrcodeScanner } from "html5-qrcode";
import { decode } from "js-base64";

const QrReader = () => {
  const [scanResult, setScanResult] = useState(null);
  const [scanStatus, setScanStatus] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const onScanSuccess = async (result) => {
    // const rawResult = result;
    const decodedData = decode(result);
    console.log(decodedData);
    const parsedData = JSON.parse(decodedData);

    const stripeSessionId = parsedData.stripeSessionId;

    const response = await fetch("/api/scan", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ stripeSessionId }),
    });

    const data = await response.json();
    console.log(data);
    if (data.status === "success") {
      setScanStatus("Orden escaneada exitosamente");
    } else if (data.status === "already_scanned") {
      setScanStatus("Esta orden ya ha sido escaneada anteriormente");
    } else if (data.status === "error") {
      setScanStatus("Error al escanear la orden");
    }
    setIsModalOpen(true);
  };

  useEffect(() => {
    const scannerHtml = new Html5QrcodeScanner("reader", {
      qrbox: {
        width: 250,
        height: 250,
      },
      fps: 5,
    });

    scannerHtml.render(success, error);

    function success(result) {
      scannerHtml.clear();
      setScanResult(result);
      onScanSuccess(result);
      // Si quieres que siga escaneando después de encontrar un resultado
    }
    function error(err) {
      console.warn(err);
    }
  }, []);
  const closeModal = () => {
    setIsModalOpen(false);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 text-black">
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-80 text-center">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">
              Estado del Escaneo
            </h2>
            <p className="text-gray-600 mb-6">{scanStatus}</p>
            <button
              onClick={closeModal}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}

      {scanResult ? (
        <div className="w-full h-full bg-black text-white font-medium">
          <p>Si desea escanear otro código QR, pulse aqui.</p>
        </div>
      ) : (
        <div
          id="reader"
          className="bg-white rounded shadow p-4 text-black flex flex-col items-center justify-center"
        ></div>
      )}
    </div>
  );
};

export default QrReader;
