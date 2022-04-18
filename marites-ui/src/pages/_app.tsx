import "styles/globals.css";
import "swiper/css";
import "react-loading-skeleton/dist/skeleton.css";
import type { AppProps } from "next/app";
import AppProvider from "components/common/AppProvider";
import NoSSR from "components/common/NoSSR";

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <NoSSR>
      <AppProvider>
        <Component {...pageProps} />
      </AppProvider>
    </NoSSR>
  );
}

export default MyApp;
