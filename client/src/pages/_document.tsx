import { Head, Html, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html>
      <Head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin=""
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Merriweather:wght@300;400;700;900&family=Rubik:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,400;1,500&display=swap"
          rel="stylesheet"
        />
      </Head>
      <body className="debug-screens font-rubik">
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
