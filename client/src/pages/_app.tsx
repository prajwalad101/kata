import { NextPage } from 'next';
import type { AppProps } from 'next/app';
import { QueryProvider } from 'src/components/context-provider';
import LocationProvider from 'src/layouts/LocationProvider';
import ToastProvider from 'src/layouts/ToastProvider/ToastProvider';
import UserProvider from 'src/layouts/UserProvider';
import '../styles/globals.css';

export type NextPageWithLayout = NextPage & {
  getLayout?: (
    _page: React.ReactElement,
    _pageProps: unknown
  ) => React.ReactNode;
};

interface AppPropsWithLayout extends AppProps {
  Component: NextPageWithLayout;
}

function MyApp({ Component, pageProps }: AppPropsWithLayout) {
  const getLayout = Component.getLayout || ((page) => page);

  return (
    <QueryProvider>
      <ToastProvider>
        <LocationProvider>
          <UserProvider>
            {getLayout(<Component {...pageProps} />, pageProps)}
          </UserProvider>
        </LocationProvider>
      </ToastProvider>
    </QueryProvider>
  );
}

export default MyApp;
