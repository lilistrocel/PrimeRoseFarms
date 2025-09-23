# Business Process-Driven API Documentation

The PrimeRoseFarms API is designed around actual business processes rather than generic CRUD operations. Each endpoint serves a specific workflow in the farm management system.

## Base URL
```
Development: http://localhost:3000/api/v1
```

## Authentication
All endpoints require JWT authentication except `/health` and `/api`.

### Login
```http
POST /auth/login
{
  "email": "user@example.com",
  "password": "password123"
}
```

## Manager APIs

Strategic planning and farm management operations.

### GET /manager/profitability-analysis
Get profitability analysis for plant/block combinations.

**Query Parameters:**
- `farmId`, `plantDataId`, `blockType`, `harvestMonth`

**Response:**
```json
{
  "success": true,
  "data": {
    "analysis": [{
      "plantName": "Tomatoes",
      "blockName": "Greenhouse A",
      "profitability": {
        "profit": 2725.00,
        "margin": 87.2,
        "roi": 681.25
      }
    }]
  }
}
```

### POST /manager/assign-plant-to-block
Assign plants to blocks with preview and commitment options.

### GET /manager/performance-dashboard
Comprehensive farm performance metrics.

### GET /manager/block-optimization
Block optimization recommendations.

## Worker APIs

Task management and operational execution.

### GET /worker/daily-tasks
Get personalized daily task list based on assigned blocks.

### POST /worker/start-task
Start a specific task and update status.

### POST /worker/complete-task
Complete task and record results.

### POST /worker/record-harvest
Record detailed harvest data with quality assessment.

## Sales APIs

Customer order management and sales intelligence.

### GET /sales/predicted-stock
Get predicted stock levels combining inventory and expected harvests.

### POST /sales/create-order
Create customer order with stock verification.

### POST /sales/confirm-order
Confirm payment and finalize stock allocation.

### GET /sales/available-deliveries
Get delivery orders available for driver assignment.

## Sensor APIs

Real-time monitoring and automated control.

### POST /sensor/data-reading
Receive IoT sensor data and trigger automation.

### GET /sensor/real-time-data
Get real-time sensor data for monitoring.

### POST /sensor/manual-override
Override automated controls for maintenance/emergency.

### GET /sensor/alerts
Get sensor alerts and notifications.

## Error Handling

Consistent error format:
```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error information"
}
```

**Status Codes:**
- `400` Bad Request
- `401` Unauthorized  
- `403` Forbidden
- `404` Not Found
- `500` Internal Server Error

## Key Features

- **Business-Focused**: Each endpoint serves a real workflow
- **Type-Safe**: Full TypeScript integration
- **Process-Integrated**: APIs work together across business flows
- **Performance-Optimized**: Designed for specific data access patterns

This API design directly supports the workflows documented in ProcessFlow.md, ensuring efficient and meaningful farm management operations.
