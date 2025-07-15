declare module 'httpolyglot' {
  import { Server as HTTPServer } from 'https';
  import { RequestListener } from 'http';

  interface Options {
    key: string;
    cert: string;
  }

  function httpolyglot(options: Options, requestListener?: RequestListener): HTTPServer;
  export = httpolyglot;
} 