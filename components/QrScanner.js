"use client";

import { useEffect, useRef, useState } from "react";
import "@/components/QrStyles.css";

// Qr Scanner
import QrScanner from "qr-scanner";
import QrFrame from "@/public/qr-frame.svg";
import Image from "next/image";
import { decode } from "js-base64";

const QrReader = () => {
  const scanner = useRef();
  const videoEl = useRef();
  const qrBoxEl = useRef();
  const [qrOn, setQrOn] = useState(true);

  const [scanResult, setScanResult] = useState({
    status: "",
    error: "",
    showModal: false,
  });

  const onScanSuccess = async (result) => {
    try {
      const rawResult = result?.data;
      const decodedData = decode(rawResult);
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

      if (response.ok) {
        setScanResult({
          status: "Orden escaneada correctamente",
          error: "",
          showModal: true,
        });

        // Stop scanning after successful scan
        scanner.current?.stop();
      } else if (data.message === "El código ya fue escaneado") {
        setScanResult({
          status: "",
          error: "Este código ya fue escaneado.",
          showModal: true,
        });

        // Stop scanning after error
        scanner.current?.stop();
      } else {
        setScanResult({
          status: "",
          error: data.message || "Error al escanear la orden.",
          showModal: true,
        });

        // Stop scanning after error
        scanner.current?.stop();
      }
    } catch (error) {
      setScanResult({
        status: "",
        error: "Error de conexión al escanear.",
        showModal: true,
      });

      // Stop scanning after error
      scanner.current?.stop();
      console.error("Error en el escaneo:", error);
    }
  };

  const onScanFail = (err) => {
    console.log(err);
    setScanResult({
      status: "",
      error: "Escaneo fallido.",
      showModal: false,
    });
  };

  const handleCloseModal = () => {
    setScanResult({
      status: "",
      error: "",
      showModal: false,
    });

    // Restart scanning
    scanner.current?.start();
  };

  useEffect(() => {
    if (videoEl?.current && !scanner.current) {
      scanner.current = new QrScanner(videoEl?.current, onScanSuccess, {
        onDecodeError: onScanFail,
        preferredCamera: "environment",
        highlightScanRegion: true,
        highlightCodeOutline: true,
        overlay: qrBoxEl?.current || undefined,
      });

      scanner?.current
        ?.start()
        .then(() => setQrOn(true))
        .catch((err) => {
          if (err) setQrOn(false);
        });
    }

    return () => {
      if (!videoEl?.current) {
        scanner?.current?.stop();
      }
    };
  }, []);

  return (
    <div className="qr-reader relative">
      <video ref={videoEl}></video>
      <div ref={qrBoxEl} className="qr-box">
        <Image
          src={QrFrame}
          alt="Qr Frame"
          width={256}
          height={256}
          className="qr-frame"
        />
      </div>

      {/* Modal for scan results */}
      {scanResult.showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-[100]">
          <div className="bg-white rounded-md p-6 max-w-sm w-full">
            <h2 className="text-xl font-bold mb-4">Resultado del Escaneo</h2>
            {scanResult.status && (
              <p className="text-green-600 mb-4">{scanResult.status}</p>
            )}
            {scanResult.error && (
              <p className="text-red-600 mb-4">{scanResult.error}</p>
            )}
            <button
              className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 w-full"
              onClick={handleCloseModal}
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default QrReader;
