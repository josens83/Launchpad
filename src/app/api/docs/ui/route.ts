/**
 * Swagger UI Endpoint
 * Serves interactive API documentation
 */

import { NextResponse } from 'next/server';

export const dynamic = 'force-static';

const swaggerUIHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>CreatorHub API Documentation</title>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/swagger-ui-dist@5/swagger-ui.css">
  <style>
    body {
      margin: 0;
      padding: 0;
    }
    .swagger-ui .topbar {
      display: none;
    }
    .swagger-ui .info .title {
      font-size: 2rem;
    }
    .custom-header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 1rem 2rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .custom-header h1 {
      margin: 0;
      font-size: 1.5rem;
      font-weight: 600;
    }
    .custom-header a {
      color: white;
      text-decoration: none;
      opacity: 0.9;
    }
    .custom-header a:hover {
      opacity: 1;
    }
  </style>
</head>
<body>
  <div class="custom-header">
    <h1>CreatorHub API</h1>
    <a href="/api/docs" target="_blank">Download OpenAPI Spec (JSON)</a>
  </div>
  <div id="swagger-ui"></div>
  <script src="https://cdn.jsdelivr.net/npm/swagger-ui-dist@5/swagger-ui-bundle.js"></script>
  <script>
    window.onload = function() {
      SwaggerUIBundle({
        url: '/api/docs',
        dom_id: '#swagger-ui',
        deepLinking: true,
        presets: [
          SwaggerUIBundle.presets.apis,
          SwaggerUIBundle.SwaggerUIStandalonePreset
        ],
        layout: "BaseLayout",
        defaultModelsExpandDepth: 1,
        defaultModelExpandDepth: 1,
        docExpansion: 'list',
        filter: true,
        showExtensions: true,
        showCommonExtensions: true,
        supportedSubmitMethods: ['get', 'post', 'put', 'delete', 'patch'],
      });
    };
  </script>
</body>
</html>
`;

export async function GET() {
  return new NextResponse(swaggerUIHtml, {
    headers: {
      'Content-Type': 'text/html',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}
