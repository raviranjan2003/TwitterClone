import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { Toaster } from "react-hot-toast";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

//Creating client 
const queryClient = new QueryClient();

export default function App({ Component, pageProps }: AppProps) {
  return <QueryClientProvider client={queryClient}>
    <GoogleOAuthProvider clientId="286698739945-7btogsgjha7cus88rdbgctfrg4qlk7ko.apps.googleusercontent.com">
      <Component {...pageProps} />
      <Toaster />
      <ReactQueryDevtools initialIsOpen={false} />
    </GoogleOAuthProvider>
  </QueryClientProvider>;
}
