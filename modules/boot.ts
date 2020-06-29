import {ApplicationConfig} from '@loopback/core';
import fs from 'fs';
import path from 'path';
import * as tsconfigPaths from 'tsconfig-paths';

export async function main(options: ApplicationConfig = {}) {
  const tsconfig = JSON.parse(
    fs.readFileSync(
      path.resolve(__dirname, '../tsconfig.json')
    ).toString()
  );
  tsconfigPaths.register({
    paths: tsconfig.compilerOptions.paths,
    baseUrl: path.resolve(__dirname, '..')
  });

  const {DeguApplication} = await import('degu/core');

  const app = new DeguApplication(options);
  await app.boot();
  await app.start();

  const url = app.restServer.url;
  console.log(`Server is running at ${url}`);
  console.log(`Try ${url}/ping`);

  return app;
}

if (require.main === module) {
  // Run the application
  const config = {
    rest: {
      port: +(process.env.PORT ?? 3000),
      host: process.env.HOST,
      // The `gracePeriodForClose` provides a graceful close for http/https
      // servers with keep-alive clients. The default value is `Infinity`
      // (don't force-close). If you want to immediately destroy all sockets
      // upon stop, set its value to `0`.
      // See https://www.npmjs.com/package/stoppable
      gracePeriodForClose: 5000, // 5 seconds
      openApiSpec: {
        // useful when used with OpenAPI-to-GraphQL to locate your application
        setServersFromRequest: true,
      },
    },
  };
  main(config).catch(err => {
    console.error('Cannot start the application.', err);
    process.exit(1);
  });
}
