/**
 * OpenAPI Schema Definition
 * Auto-generated documentation for API endpoints
 */

export const openApiDocument = {
  openapi: '3.0.3',
  info: {
    title: 'YouTube Creator Platform API',
    description: `
API for YouTube Creator Platform - AI-powered content creation tools.

## Authentication
All API endpoints require authentication via Supabase Auth.
Include the access token in the Authorization header:
\`\`\`
Authorization: Bearer <your-access-token>
\`\`\`

## Rate Limiting
- Free plan: 5 scripts/month, 3 thumbnails/month
- Pro plan: 50 scripts/month, 30 thumbnails/month
- Enterprise: Unlimited

## Error Responses
All errors follow a consistent format:
\`\`\`json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable message",
    "statusCode": 400
  },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
\`\`\`
    `,
    version: '1.0.0',
    contact: {
      name: 'API Support',
      email: 'support@example.com',
    },
    license: {
      name: 'MIT',
      url: 'https://opensource.org/licenses/MIT',
    },
  },
  servers: [
    {
      url: 'https://api.yourdomain.com',
      description: 'Production server',
    },
    {
      url: 'http://localhost:3000',
      description: 'Development server',
    },
  ],
  tags: [
    { name: 'Health', description: 'Health check endpoints' },
    { name: 'AI', description: 'AI content generation endpoints' },
    { name: 'Projects', description: 'Project management endpoints' },
    { name: 'User', description: 'User management endpoints' },
  ],
  paths: {
    // Health endpoints
    '/api/health': {
      get: {
        tags: ['Health'],
        summary: 'Health check',
        description: 'Returns the health status of all services',
        operationId: 'getHealth',
        responses: {
          200: {
            description: 'Service is healthy',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/HealthResponse' },
              },
            },
          },
          503: {
            description: 'Service is unhealthy',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/HealthResponse' },
              },
            },
          },
        },
      },
    },
    '/api/health/live': {
      get: {
        tags: ['Health'],
        summary: 'Liveness probe',
        description: 'Kubernetes liveness check - returns if process is alive',
        operationId: 'getLiveness',
        responses: {
          200: {
            description: 'Process is alive',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/LivenessResponse' },
              },
            },
          },
        },
      },
    },
    '/api/health/ready': {
      get: {
        tags: ['Health'],
        summary: 'Readiness probe',
        description: 'Kubernetes readiness check - returns if service is ready',
        operationId: 'getReadiness',
        responses: {
          200: {
            description: 'Service is ready',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ReadinessResponse' },
              },
            },
          },
          503: {
            description: 'Service is not ready',
          },
        },
      },
    },

    // AI endpoints
    '/api/ai/script': {
      post: {
        tags: ['AI'],
        summary: 'Generate script',
        description: 'Generate a YouTube video script using AI',
        operationId: 'generateScript',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ScriptRequest' },
            },
          },
        },
        responses: {
          200: {
            description: 'Script generated successfully',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ScriptResponse' },
              },
            },
          },
          400: { $ref: '#/components/responses/BadRequest' },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
          429: { $ref: '#/components/responses/RateLimited' },
          500: { $ref: '#/components/responses/InternalError' },
        },
      },
    },
    '/api/ai/thumbnail': {
      post: {
        tags: ['AI'],
        summary: 'Generate thumbnail',
        description: 'Generate a YouTube thumbnail using AI',
        operationId: 'generateThumbnail',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ThumbnailRequest' },
            },
          },
        },
        responses: {
          200: {
            description: 'Thumbnail generated successfully',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ThumbnailResponse' },
              },
            },
          },
          400: { $ref: '#/components/responses/BadRequest' },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
          429: { $ref: '#/components/responses/RateLimited' },
          500: { $ref: '#/components/responses/InternalError' },
        },
      },
    },
    '/api/ai/title': {
      post: {
        tags: ['AI'],
        summary: 'Generate title suggestions',
        description: 'Generate SEO-optimized title suggestions',
        operationId: 'generateTitles',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/TitleRequest' },
            },
          },
        },
        responses: {
          200: {
            description: 'Titles generated successfully',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/TitleResponse' },
              },
            },
          },
          400: { $ref: '#/components/responses/BadRequest' },
          401: { $ref: '#/components/responses/Unauthorized' },
          500: { $ref: '#/components/responses/InternalError' },
        },
      },
    },
    '/api/ai/description': {
      post: {
        tags: ['AI'],
        summary: 'Generate description',
        description: 'Generate SEO-optimized video description',
        operationId: 'generateDescription',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/DescriptionRequest' },
            },
          },
        },
        responses: {
          200: {
            description: 'Description generated successfully',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/DescriptionResponse' },
              },
            },
          },
          400: { $ref: '#/components/responses/BadRequest' },
          401: { $ref: '#/components/responses/Unauthorized' },
          500: { $ref: '#/components/responses/InternalError' },
        },
      },
    },

    // Project endpoints
    '/api/projects': {
      get: {
        tags: ['Projects'],
        summary: 'List projects',
        description: 'Get all projects for the authenticated user',
        operationId: 'listProjects',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'status',
            in: 'query',
            schema: { type: 'string', enum: ['draft', 'published', 'archived'] },
          },
          {
            name: 'page',
            in: 'query',
            schema: { type: 'integer', default: 1 },
          },
          {
            name: 'pageSize',
            in: 'query',
            schema: { type: 'integer', default: 20, maximum: 100 },
          },
        ],
        responses: {
          200: {
            description: 'Projects retrieved successfully',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ProjectListResponse' },
              },
            },
          },
          401: { $ref: '#/components/responses/Unauthorized' },
        },
      },
      post: {
        tags: ['Projects'],
        summary: 'Create project',
        description: 'Create a new project',
        operationId: 'createProject',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/CreateProjectRequest' },
            },
          },
        },
        responses: {
          201: {
            description: 'Project created successfully',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Project' },
              },
            },
          },
          400: { $ref: '#/components/responses/BadRequest' },
          401: { $ref: '#/components/responses/Unauthorized' },
        },
      },
    },
    '/api/projects/{id}': {
      get: {
        tags: ['Projects'],
        summary: 'Get project',
        description: 'Get a specific project by ID',
        operationId: 'getProject',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string', format: 'uuid' },
          },
        ],
        responses: {
          200: {
            description: 'Project retrieved successfully',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Project' },
              },
            },
          },
          401: { $ref: '#/components/responses/Unauthorized' },
          404: { $ref: '#/components/responses/NotFound' },
        },
      },
      patch: {
        tags: ['Projects'],
        summary: 'Update project',
        description: 'Update a project',
        operationId: 'updateProject',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string', format: 'uuid' },
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/UpdateProjectRequest' },
            },
          },
        },
        responses: {
          200: {
            description: 'Project updated successfully',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Project' },
              },
            },
          },
          400: { $ref: '#/components/responses/BadRequest' },
          401: { $ref: '#/components/responses/Unauthorized' },
          404: { $ref: '#/components/responses/NotFound' },
        },
      },
      delete: {
        tags: ['Projects'],
        summary: 'Delete project',
        description: 'Delete a project',
        operationId: 'deleteProject',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string', format: 'uuid' },
          },
        ],
        responses: {
          204: { description: 'Project deleted successfully' },
          401: { $ref: '#/components/responses/Unauthorized' },
          404: { $ref: '#/components/responses/NotFound' },
        },
      },
    },
  },
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
    schemas: {
      // Health schemas
      HealthResponse: {
        type: 'object',
        properties: {
          status: { type: 'string', enum: ['healthy', 'unhealthy'] },
          timestamp: { type: 'string', format: 'date-time' },
          checks: {
            type: 'object',
            properties: {
              database: { type: 'string', enum: ['healthy', 'unhealthy'] },
              redis: { type: 'string', enum: ['healthy', 'unhealthy'] },
            },
          },
        },
      },
      LivenessResponse: {
        type: 'object',
        properties: {
          alive: { type: 'boolean' },
          timestamp: { type: 'string', format: 'date-time' },
          pid: { type: 'integer' },
        },
      },
      ReadinessResponse: {
        type: 'object',
        properties: {
          ready: { type: 'boolean' },
          checks: { type: 'object' },
        },
      },

      // AI Request/Response schemas
      ScriptRequest: {
        type: 'object',
        required: ['topic'],
        properties: {
          topic: { type: 'string', minLength: 3, maxLength: 200 },
          niche: { type: 'string', maxLength: 50 },
          tone: { type: 'string', enum: ['casual', 'professional', 'humorous', 'educational', 'inspirational'] },
          target_duration: { type: 'integer', minimum: 1, maximum: 180, default: 10 },
          include_hook: { type: 'boolean', default: true },
          include_cta: { type: 'boolean', default: true },
          language: { type: 'string', default: 'en' },
        },
      },
      ScriptResponse: {
        type: 'object',
        properties: {
          content: { type: 'string' },
          metadata: {
            type: 'object',
            properties: {
              word_count: { type: 'integer' },
              estimated_duration: { type: 'string' },
              sections: { type: 'array', items: { type: 'string' } },
            },
          },
        },
      },
      ThumbnailRequest: {
        type: 'object',
        required: ['prompt'],
        properties: {
          prompt: { type: 'string', maxLength: 500 },
          style: { type: 'string', enum: ['realistic', 'cartoon', 'minimalist', 'bold'] },
          color_scheme: { type: 'string' },
        },
      },
      ThumbnailResponse: {
        type: 'object',
        properties: {
          url: { type: 'string', format: 'uri' },
          prompt: { type: 'string' },
        },
      },
      TitleRequest: {
        type: 'object',
        required: ['topic'],
        properties: {
          topic: { type: 'string' },
          keywords: { type: 'array', items: { type: 'string' } },
          count: { type: 'integer', default: 5 },
        },
      },
      TitleResponse: {
        type: 'object',
        properties: {
          titles: { type: 'array', items: { type: 'string' } },
        },
      },
      DescriptionRequest: {
        type: 'object',
        required: ['topic'],
        properties: {
          topic: { type: 'string' },
          keywords: { type: 'array', items: { type: 'string' } },
        },
      },
      DescriptionResponse: {
        type: 'object',
        properties: {
          description: { type: 'string' },
        },
      },

      // Project schemas
      Project: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          user_id: { type: 'string', format: 'uuid' },
          title: { type: 'string' },
          description: { type: 'string' },
          status: { type: 'string', enum: ['draft', 'published', 'archived'] },
          created_at: { type: 'string', format: 'date-time' },
          updated_at: { type: 'string', format: 'date-time' },
        },
      },
      CreateProjectRequest: {
        type: 'object',
        required: ['title'],
        properties: {
          title: { type: 'string', minLength: 1, maxLength: 200 },
          description: { type: 'string', maxLength: 1000 },
        },
      },
      UpdateProjectRequest: {
        type: 'object',
        properties: {
          title: { type: 'string', minLength: 1, maxLength: 200 },
          description: { type: 'string', maxLength: 1000 },
          status: { type: 'string', enum: ['draft', 'published', 'archived'] },
        },
      },
      ProjectListResponse: {
        type: 'object',
        properties: {
          data: { type: 'array', items: { $ref: '#/components/schemas/Project' } },
          total: { type: 'integer' },
          page: { type: 'integer' },
          pageSize: { type: 'integer' },
          totalPages: { type: 'integer' },
        },
      },

      // Error schemas
      Error: {
        type: 'object',
        properties: {
          success: { type: 'boolean', enum: [false] },
          error: {
            type: 'object',
            properties: {
              code: { type: 'string' },
              message: { type: 'string' },
              statusCode: { type: 'integer' },
            },
          },
          timestamp: { type: 'string', format: 'date-time' },
        },
      },
    },
    responses: {
      BadRequest: {
        description: 'Bad request - validation error',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/Error' },
          },
        },
      },
      Unauthorized: {
        description: 'Unauthorized - authentication required',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/Error' },
          },
        },
      },
      Forbidden: {
        description: 'Forbidden - insufficient permissions or quota exceeded',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/Error' },
          },
        },
      },
      NotFound: {
        description: 'Resource not found',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/Error' },
          },
        },
      },
      RateLimited: {
        description: 'Too many requests',
        headers: {
          'Retry-After': {
            schema: { type: 'integer' },
            description: 'Seconds to wait before retrying',
          },
        },
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/Error' },
          },
        },
      },
      InternalError: {
        description: 'Internal server error',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/Error' },
          },
        },
      },
    },
  },
};

export type OpenApiDocument = typeof openApiDocument;
