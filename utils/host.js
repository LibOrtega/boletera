const dev = process.env.NODE_ENV !== "production";

export const HOST = dev ? "http://localhost:3000" : "https://patitorosa.com";
