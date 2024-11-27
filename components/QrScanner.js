"use client";

import React, { useEffect, useState } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import { decode } from "js-base64";

const QrReader = () => {
  const [scanResult, setScanResult] = useState(null);
  const [scanStatus, setScanStatus] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [scannedData, setScannedData] = useState(null);
  const [scannerInstance, setScannerInstance] = useState(null);

  const resetScanner = () => {
    if (scannerInstance) {
      scannerInstance.clear();
    }

    const newScanner = new Html5QrcodeScanner("reader", {
      qrbox: {
        width: 250,
        height: 250,
      },
      fps: 1,
    });

    newScanner.render(success, error);
    setScannerInstance(newScanner);
    setScanResult(null);
  };

  const onScanSuccess = async (result) => {
    try {
      const decodedData = decode(result);
      const parsedData = JSON.parse(decodedData);

      if (!parsedData.stripeSessionId) {
        setScanStatus("El código QR no contiene la información necesaria");
        setScannedData(null);
        setIsModalOpen(true);
        return;
      }

      if (scanStatus) {
        return;
      }

      const response = await fetch("/api/scan", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ stripeSessionId: parsedData.stripeSessionId }),
      });

      const data = await response.json();
      setScannedData(parsedData);

      if (data.status === "success") {
        setScanStatus("Orden escaneada exitosamente");
      } else if (data.status === "already_scanned") {
        setScanStatus("Esta orden ya ha sido escaneada anteriormente");
      } else {
        setScanStatus("Error al escanear la orden");
      }

      setIsModalOpen(true);
    } catch (error) {
      console.error("Error processing QR code:", error);
      setScanStatus("Error al procesar el código QR");
      setIsModalOpen(true);
    }
  };

  useEffect(() => {
    resetScanner();

    return () => {
      if (scannerInstance) {
        scannerInstance.clear();
      }
    };
  }, []);

  function success(result) {
    if (scannerInstance) {
      scannerInstance.clear();
    }
    setScanResult(result);
    onScanSuccess(result);
  }

  function error(err) {
    console.warn(err);
  }

  const closeModal = () => {
    setIsModalOpen(false);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md mx-4 text-center">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">
              Resultado del Escaneo
            </h2>
            <p className="text-gray-600 mb-4">{scanStatus}</p>

            {/* Display scanned data if available */}
            {scannedData && (
              <div className="bg-gray-100 rounded p-4 mb-4 text-black">
                <h3 className="font-medium mb-2">Datos del QR:</h3>
                <pre className="text-sm text-left overflow-x-auto">
                  {JSON.stringify(scannedData, null, 2)}
                </pre>
              </div>
            )}

            <button
              onClick={closeModal}
              className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}

      {/* QR Scanner Container */}
      <div className="w-full max-w-md">
        <div
          id="reader"
          className="bg-white rounded-lg shadow-md w-full flex flex-col items-center justify-center text-black"
        ></div>

        {scanResult && (
          <div className="mt-4 text-center">
            <button
              onClick={resetScanner}
              className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
            >
              Escanear Otro Código QR
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default QrReader;
