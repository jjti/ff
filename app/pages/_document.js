import { Html, Head, Main, NextScript, Meta } from 'next/document';

export default function Document() {
  return (
    <Html>
      <Head>
        <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
        <meta name="theme-color" content="#000000" />
        <meta
          name="description"
          content="A free Fantasy Football Draft Assistant with rankings and pick recommendations"
        />
        <meta
          name="keywords"
          content="fantasy,football,ranking,picks,rosters,scoring,projections,assistant,wizard,help"
        />

        <link rel="shortcut icon" href="fb.ico" />
        <link
          href="https://fonts.googleapis.com/css?family=Lato:100,300,400,700,900"
          rel="stylesheet"
        />

        <script
          async
          src="https://www.googletagmanager.com/gtag/js?id=UA-108371876-3"
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `window.dataLayer = window.dataLayer || [];
                     function gtag() { dataLayer.push(arguments); }
                     gtag('js', new Date());
                     gtag('config', 'UA-108371876-3');`,
          }}
        />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
