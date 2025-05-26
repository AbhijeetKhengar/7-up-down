declare module './config' {
  interface Config {
    [key: string]: any;
  }

  const config: Config;
  export default config;
}
