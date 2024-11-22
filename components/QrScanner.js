"use client";

import { useEffect, useRef, useState } from "react";

import "@/components/QrStyles.css";

// Qr Scanner
import QrScanner from "qr-scanner";
import QrFrame from "@/public/qr-frame.svg";
import Image from "next/image";
import { decode } from "js-base64";

const QrReader = () => {
  // QR States
  const scanner = useRef();
  const videoEl = useRef();
  const qrBoxEl = useRef();
  const [qrOn, setQrOn] = useState(true);

  // Result
  const [scannedResult, setScannedResult] = useState("");
  const scannedData = decode(scannedResult);
  console.log(scannedData);
  const parsedData = JSON.parse(scannedData); // Analiza el JSON
  console.log(parsedData.orderId); // Imprime el orderId
  console.log(parsedData.eventId); // Imprime el eventId
  console.log(parsedData.user.email); // Imprime el email del usuario
  console.log(parsedData.user.name); // Imprime el nombre del usuario
  // {{ edit_2 }}

  // Success
  const onScanSuccess = (result) => {
    // 🖨 Print the "result" to browser console.
    console.log(result);
    // ✅ Handle success.
    // 😎 Save the scanned result in a variable before decoding.
    const rawResult = result?.data;
    setScannedResult(rawResult);
    // const decodedData = decode(rawResult);
    // console.log(decodedData); // Log the decoded data
    // const parsedData = JSON.parse(decodedData);
    // console.log(parsedData); // Log the parsed data
  };

  // Fail
  const onScanFail = (err) => {
    // 🖨 Print the "err" to browser console.
    console.log(err);
  };

  useEffect(() => {
    if (videoEl?.current && !scanner.current) {
      // 👉 Instantiate the QR Scanner
      scanner.current = new QrScanner(videoEl?.current, onScanSuccess, {
        onDecodeError: onScanFail,
        // 📷 This is the camera facing mode. In mobile devices, "environment" means back camera and "user" means front camera.
        preferredCamera: "environment",
        // 🖼 This will help us position our "QrFrame.svg" so that user can only scan when qr code is put in between our QrFrame.svg.
        highlightScanRegion: true,
        // 🔥 This will produce a yellow (default color) outline around the qr code that we scan, showing a proof that our qr-scanner is scanning that qr code.
        highlightCodeOutline: true,
        // 📦 A custom div which will pair with "highlightScanRegion" option above 👆. This gives us full control over our scan region.
        overlay: qrBoxEl?.current || undefined,
      });

      // 🚀 Start QR Scanner
      scanner?.current
        ?.start()
        .then(() => setQrOn(true))
        .catch((err) => {
          if (err) setQrOn(false);
        });
    }

    // 🧹 Clean up on unmount.
    // 🚨 This removes the QR Scanner from rendering and using camera when it is closed or removed from the UI.
    return () => {
      if (!videoEl?.current) {
        scanner?.current?.stop();
      }
    };
  }, []);

  return (
    <div className="qr-reader">
      {/* QR */}
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

      {/* Show Data Result if scan is success */}
      {scannedResult && (
        <p
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            zIndex: 99999,
            color: "white",
          }}
        >
          Scanned Result: {scannedResult}
        </p>
      )}
    </div>
  );
};

export default QrReader;
