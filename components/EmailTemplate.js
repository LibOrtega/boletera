import getCloudinary from "@/utils/getCloudinary";
const cloudinary = getCloudinary(); // gets configuration from utils/getcloudinary.js

export async function EmailTemplate({ firstName, qrCode }) {
    console.log(cloudinary)
    try {
        console.log("Log del email template", firstName, qrCode);
        const qrResult = await cloudinary.uploader.upload(qrCode, {
            folder: `tickets_${process.env.NODE_ENV}`,
            public_id: `qrs/123`,
            overwrite: true,
            width: 500,
            height: 500,
            crop: "fill",
            format: "jpg",
        });

        console.log(qrResult);

        return (
            <div className="flex flex-col items-center justify-center">
                <h1>Gracias por tu compra!</h1>
                <img src={qrResult.secure_url} alt="QRCode" width={200} height={200} />
            </div>
        );
    } catch (error) {
        console.error("Error uploading QR code:", error);
        return (
            <div>
                <h1>Error</h1>
                <p>Error generating QR code</p>
            </div>
        );
    }
}