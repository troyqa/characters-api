import { Express } from "express-serve-static-core";
import swaggerJSDoc from "swagger-jsdoc";
import swagger from "swagger-ui-express";

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Characters API',
      version: '1.0.0',
    },
  },
  apis: ['./*.ts'], // files containing annotations as above
};

function swaggerDocs(app: Express) {
  app.use('/docs', swagger.serve, swagger.setup(swaggerJSDoc(options as Parameters<typeof swaggerJSDoc>[0])));
}

export default swaggerDocs;