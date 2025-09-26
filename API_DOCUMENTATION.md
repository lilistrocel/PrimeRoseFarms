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

## Plant Data Management APIs

Complete plant specifications and requirements management.

### GET /plant-data
Get all plant data with optional filtering and search.

**Query Parameters:**
- `category` - Filter by plant category (vegetable, fruit, herb, flower, grain, legume, other)
- `search` - Search by plant name or scientific name
- `active` - Filter by active status (true/false)

**Response:**
```json
{
  "success": true,
  "data": {
    "plants": [{
      "_id": "plant_id",
      "name": "Cherry Tomatoes",
      "scientificName": "Solanum lycopersicum",
      "variety": "Cerasiforme",
      "category": "fruit",
      "growingRequirements": {
        "temperature": { "min": 18, "max": 30, "optimal": 24 },
        "humidity": { "min": 40, "max": 70, "optimal": 60 }
      },
      "growthTimeline": {
        "germinationDays": 7,
        "totalDays": 115
      },
      "yieldInfo": {
        "expectedYieldPerPlant": 3.5,
        "yieldUnit": "kg"
      }
    }]
  }
}
```

### GET /plant-data/:id
Get specific plant data by ID.

### POST /plant-data
Create new plant data with comprehensive specifications.

**Request Body:**
```json
{
  "name": "Cherry Tomatoes",
  "scientificName": "Solanum lycopersicum",
  "variety": "Cerasiforme",
  "category": "fruit",
  "growingRequirements": {
    "temperature": { "min": 18, "max": 30, "optimal": 24 },
    "humidity": { "min": 40, "max": 70, "optimal": 60 },
    "lightHours": { "min": 6, "max": 8, "optimal": 7 },
    "soilPh": { "min": 6.0, "max": 6.8, "optimal": 6.5 },
    "waterRequirements": { "daily": 2.5, "frequency": "daily" }
  },
  "growthTimeline": {
    "germinationDays": 7,
    "seedlingDays": 14,
    "vegetativeDays": 35,
    "floweringDays": 14,
    "fruitingDays": 45,
    "totalDays": 115
  },
  "yieldInfo": {
    "expectedYieldPerPlant": 3.5,
    "yieldUnit": "kg",
    "harvestWindow": 30,
    "shelfLife": 14
  },
  "resourceRequirements": {
    "seedsPerUnit": 1,
    "fertilizerType": ["NPK 10-10-10"],
    "fertilizerAmount": 0.5,
    "pesticideType": ["Neem Oil"],
    "pesticideAmount": 10,
    "spaceRequirement": { "width": 60, "length": 60, "height": 150 }
  },
  "marketInfo": {
    "basePrice": 2.50,
    "priceUnit": "kg",
    "seasonality": { "peakSeason": ["summer"], "offSeason": ["winter"] },
    "demandLevel": "high"
  }
}
```

### PUT /plant-data/:id
Update existing plant data.

### DELETE /plant-data/:id
Soft delete plant data (sets isActive to false).

### GET /plant-data/:id/fertilizer-schedule
Get fertilizer schedule for a specific plant.

**Response:**
```json
{
  "success": true,
  "data": {
    "plantName": "Cherry Tomatoes",
    "fertilizerSchedule": [
      {
        "day": 0,
        "fertilizerType": "NPK 15-15-15",
        "applicationRate": 5,
        "frequency": "weekly",
        "growthStage": "seedling",
        "applicationMethod": "soil_drench",
        "notes": "Initial fertilization after transplanting"
      }
    ]
  }
}
```

### GET /plant-data/:id/pesticide-schedule
Get pesticide schedule for a specific plant.

**Response:**
```json
{
  "success": true,
  "data": {
    "plantName": "Cherry Tomatoes",
    "pesticideSchedule": [
      {
        "day": 7,
        "chemicalType": "Neem Oil",
        "applicationRate": 15,
        "frequency": "preventive",
        "growthStage": "seedling",
        "applicationMethod": "foliar_spray",
        "safetyRequirements": "Gloves, mask, long sleeves",
        "reEntryInterval": 12,
        "harvestRestriction": 0,
        "notes": "Preventive pest control"
      }
    ]
  }
}
```

### PUT /plant-data/:id/fertilizer-schedule
Update fertilizer schedule for a specific plant.

**Request Body:**
```json
{
  "fertilizerSchedule": [
    {
      "day": 0,
      "fertilizerType": "NPK 15-15-15",
      "applicationRate": 5,
      "frequency": "weekly",
      "growthStage": "seedling",
      "applicationMethod": "soil_drench",
      "notes": "Initial fertilization after transplanting"
    }
  ]
}
```

### PUT /plant-data/:id/pesticide-schedule
Update pesticide schedule for a specific plant.

**Request Body:**
```json
{
  "pesticideSchedule": [
    {
      "day": 7,
      "chemicalType": "Neem Oil",
      "applicationRate": 15,
      "frequency": "preventive",
      "growthStage": "seedling",
      "applicationMethod": "foliar_spray",
      "safetyRequirements": "Gloves, mask, long sleeves",
      "reEntryInterval": 12,
      "harvestRestriction": 0,
      "notes": "Preventive pest control"
    }
  ]
}
```

## Advanced Plant Data Features

### Enhanced Plant Data Structure
The plant data now includes comprehensive advanced fields:

- **Growth Characteristics:** Height, spread, root depth, lifecycle
- **Advanced Growing Requirements:** Soil type, light requirements, detailed environmental specs
- **Fertilizer Schedules:** Day-by-day application planning with growth stage targeting
- **Pesticide Schedules:** Chemical application with safety protocols and restrictions
- **Quality Standards:** Size, color, texture, and defect specifications
- **Environmental Impact:** Water footprint, carbon footprint, sustainability scoring
- **Enhanced Yield Information:** Quality metrics including Brix levels and yield per square meter

### Data Validation & Error Prevention
- **Enum Validation:** Automatic validation of application methods and month names
- **Error Correction:** Invalid enum values are automatically corrected to valid defaults
- **Type Safety:** Full TypeScript support with comprehensive type checking
- **JSON Import Validation:** Bulk import with automatic validation and error correction
- **Form Validation:** Real-time validation during data entry with immediate feedback

**Valid Enum Values:**
- **Application Methods:** `foliar_spray`, `soil_drench`, `injection`, `broadcast`
- **Pesticide Methods:** `foliar_spray`, `dust`, `injection`, `soil_drench`
- **Month Abbreviations:** `Jan`, `Feb`, `Mar`, `Apr`, `May`, `Jun`, `Jul`, `Aug`, `Sep`, `Oct`, `Nov`, `Dec`
- **Growth Stages:** `seedling`, `vegetative`, `flowering`, `fruiting`, `harvest`
- **Frequency Types:** `daily`, `weekly`, `bi_weekly`, `monthly`, `preventive`, `curative`, `as_needed`

### Business Process Integration
- **Agronomist Workflow:** Complete alignment with ProcessFlow.md requirements
- **Safety Protocols:** Integrated safety requirements and restriction tracking
- **Quality Assurance:** Comprehensive quality standards tracking
- **Environmental Compliance:** Sustainability tracking and impact assessment
- **Operational Efficiency:** Detailed scheduling and planning tools
- **Error Prevention:** Eliminates 500 errors from invalid enum values
- **Data Integrity:** Ensures all plant data conforms to schema requirements

## Key Features

- **Business-Focused**: Each endpoint serves a real workflow
- **Type-Safe**: Full TypeScript integration
- **Process-Integrated**: APIs work together across business flows
- **Performance-Optimized**: Designed for specific data access patterns
- **Comprehensive Validation**: All required nested fields validated on creation/update

This API design directly supports the workflows documented in ProcessFlow.md, ensuring efficient and meaningful farm management operations.
