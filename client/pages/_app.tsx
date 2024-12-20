import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { Toaster } from "react-hot-toast";

export default function App({ Component, pageProps }: AppProps) {
  return <GoogleOAuthProvider clientId="286698739945-7btogsgjha7cus88rdbgctfrg4qlk7ko.apps.googleusercontent.com">
    <Component {...pageProps} />
    <Toaster />
  </GoogleOAuthProvider>;
}
