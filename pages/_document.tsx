import Document, { Html, Head, Main, NextScript, DocumentContext } from 'next/document';

class MyDocument extends Document {
  static async getInitialProps(ctx: DocumentContext) {
    const initialProps = await Document.getInitialProps(ctx);
    return { ...initialProps };
  }

  render() {
    return (
      <Html>
        <Head>
          {/* Simplified viewport meta tags */}
          <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
          <meta name="apple-mobile-web-app-capable" content="yes" />
          <meta name="apple-mobile-web-app-status-bar-style" content="default" />
          <meta name="format-detection" content="telephone=no" />
          
          {/* Essential iOS fixes */}
          <style>{`
            html, body, #__next {
              height: 100%;
              width: 100%;
              overflow: hidden;
              position: relative;
            }
            
            input, textarea {
              font-size: 16px;
            }
          `}</style>
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

export default MyDocument; 