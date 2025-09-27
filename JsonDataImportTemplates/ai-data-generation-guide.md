# AI Data Generation Guide for PrimeRoseFarms

## Overview
This guide provides a comprehensive approach to generating plant data using AI models and directly uploading to the database, bypassing JSON format dependencies.

## Method 1: Direct Database Insertion Script

### Step 1: Create AI-Generated Data Script
Create a Node.js script that uses AI to generate data and directly inserts into MongoDB.

```javascript
// scripts/generate-plant-data.js
const { OpenAI } = require('openai');
const mongoose = require('mongoose');
const PlantData = require('../src/models/PlantData');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

async function generatePlantData(plantRequest) {
  const prompt = `
Generate comprehensive plant data for: ${plantRequest.plantName}
Farming Type: ${plantRequest.farmingType}
Category: ${plantRequest.category}

Return ONLY a JSON object with this EXACT structure:
{
  "name": "Plant Name (Variety)",
  "scientificName": "Scientific binomial name",
  "variety": "Specific variety name",
  "category": "vegetable|fruit|herb|flower|grain|legume|other",
  "farmingType": "open_field_soil|open_field_desert|greenhouse|nethouse|hydroponic|aquaponic|aeroponic|special",
  "family": "Botanical family name",
  "growthCharacteristics": {
    "height": 0,
    "spread": 0,
    "rootDepth": 0,
    "lifecycle": "annual|perennial|biennial"
  },
  "growingRequirements": {
    "soilType": "Detailed soil description",
    "temperature": {"min": -50, "max": 50, "optimal": 25},
    "humidity": {"min": 0, "max": 100, "optimal": 60},
    "lightRequirements": "full_sun|partial_shade|shade",
    "lightHours": {"min": 0, "max": 24, "optimal": 12},
    "soilPh": {"min": 0, "max": 14, "optimal": 6.5},
    "waterRequirements": {
      "level": "low|moderate|high",
      "daily": 0,
      "frequency": "daily|weekly|as_needed"
    }
  },
  "fertilizerSchedule": [
    {
      "day": 0,
      "fertilizerType": "NPK ratio or organic type",
      "applicationRate": 0,
      "frequency": "daily|weekly|bi_weekly|monthly",
      "growthStage": "seedling|vegetative|flowering|fruiting|harvest",
      "applicationMethod": "soil_drench|foliar_spray|granular|injection",
      "notes": "Application notes"
    }
  ],
  "pesticideSchedule": [
    {
      "day": 0,
      "chemicalType": "Chemical or organic treatment name",
      "applicationRate": 0,
      "frequency": "preventive|curative|as_needed",
      "growthStage": "seedling|vegetative|flowering|fruiting|harvest",
      "applicationMethod": "foliar_spray|dust|injection|soil_drench",
      "safetyRequirements": "Required safety equipment",
      "reEntryInterval": 0,
      "harvestRestriction": 0,
      "notes": "Application notes"
    }
  ],
  "growthTimeline": {
    "germinationTime": 0,
    "daysToMaturity": 0,
    "harvestWindow": 0,
    "seasonalPlanting": ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
    "germinationDays": 0,
    "seedlingDays": 0,
    "vegetativeDays": 0,
    "floweringDays": 0,
    "fruitingDays": 0,
    "totalDays": 0
  },
  "yieldInfo": {
    "expectedYieldPerPlant": 0,
    "yieldPerSquareMeter": 0,
    "yieldUnit": "kg|g|lbs|tons",
    "harvestWindow": 0,
    "shelfLife": 0,
    "qualityMetrics": {
      "size": "Size description",
      "color": "Color description",
      "texture": "Texture description",
      "brix": 0
    }
  },
  "resourceRequirements": {
    "seedsPerUnit": 0,
    "fertilizerType": ["Type1", "Type2"],
    "fertilizerAmount": 0,
    "pesticideType": ["Type1", "Type2"],
    "pesticideAmount": 0,
    "spaceRequirement": {
      "width": 0,
      "length": 0,
      "height": 0
    }
  },
  "marketInfo": {
    "basePrice": 0,
    "priceUnit": "kg|g|lbs|each",
    "seasonality": {
      "peakSeason": ["Month1", "Month2"],
      "offSeason": ["Month1", "Month2"]
    },
    "demandLevel": "low|moderate|high|very_high"
  },
  "qualityStandards": {
    "size": {"min": 0, "max": 0, "unit": "cm|mm|inches"},
    "color": ["Color1", "Color2"],
    "texture": ["Texture1", "Texture2"],
    "defects": ["Defect1", "Defect2"]
  },
  "environmentalImpact": {
    "waterFootprint": 0,
    "carbonFootprint": 0,
    "sustainabilityScore": 0
  }
}

CRITICAL VALIDATION RULES:
1. totalDays MUST equal germinationDays + seedlingDays + vegetativeDays + floweringDays + fruitingDays
2. Use ONLY the exact enum values specified above
3. All numeric values must be realistic for the plant type
4. Ensure farming type requirements match the plant's growing needs
5. Use scientifically accurate data for the specific plant variety
6. sustainabilityScore MUST be between 1 and 10 (1-10 scale)
7. All numeric values must be within realistic ranges for the plant type
8. Environmental impact values should be scientifically accurate

Generate realistic, commercially viable data for ${plantRequest.plantName} in ${plantRequest.farmingType} farming.
`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      max_tokens: 4000
    });

    const generatedData = JSON.parse(response.choices[0].message.content);
    return generatedData;
  } catch (error) {
    console.error('Error generating plant data:', error);
    throw error;
  }
}

async function insertPlantData(plantData, userId) {
  try {
    // Add required fields for database
    const completePlantData = {
      ...plantData,
      userId: userId,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Validate the data before insertion
    const plant = new PlantData(completePlantData);
    await plant.validate();

    // Insert into database
    const savedPlant = await plant.save();
    console.log(`✅ Plant data created: ${savedPlant.name} (ID: ${savedPlant._id})`);
    return savedPlant;
  } catch (error) {
    console.error('❌ Error inserting plant data:', error.message);
    throw error;
  }
}

async function generateAndInsertPlant(plantRequest, userId) {
  try {
    console.log(`🌱 Generating plant data for: ${plantRequest.plantName}`);
    
    // Generate data using AI
    const generatedData = await generatePlantData(plantRequest);
    
    // Insert into database
    const savedPlant = await insertPlantData(generatedData, userId);
    
    return savedPlant;
  } catch (error) {
    console.error('❌ Error in plant generation process:', error);
    throw error;
  }
}

module.exports = { generateAndInsertPlant };
```

### Step 2: Create Batch Generation Script
```javascript
// scripts/batch-generate-plants.js
const mongoose = require('mongoose');
const { generateAndInsertPlant } = require('./generate-plant-data');

// Connect to database
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/primerosefarms');

const plantRequests = [
  {
    plantName: "Bell Pepper (California Wonder)",
    farmingType: "greenhouse",
    category: "vegetable"
  },
  {
    plantName: "Lettuce (Butterhead)",
    farmingType: "hydroponic",
    category: "vegetable"
  },
  {
    plantName: "Tomato (Beefsteak)",
    farmingType: "open_field_soil",
    category: "vegetable"
  },
  {
    plantName: "Strawberry (Albion)",
    farmingType: "aeroponic",
    category: "fruit"
  },
  {
    plantName: "Basil (Genovese)",
    farmingType: "nethouse",
    category: "herb"
  }
];

async function batchGenerate() {
  const userId = "68d2698e7ce115d82039ac85"; // Replace with actual user ID
  
  for (const request of plantRequests) {
    try {
      await generateAndInsertPlant(request, userId);
      console.log(`✅ Successfully generated: ${request.plantName}`);
    } catch (error) {
      console.error(`❌ Failed to generate ${request.plantName}:`, error.message);
    }
  }
  
  console.log('🎉 Batch generation complete!');
  process.exit(0);
}

batchGenerate();
```

## Method 2: API Endpoint for AI Generation

### Create AI Generation Endpoint
```javascript
// src/routes/ai-generation.ts
import express from 'express';
import { OpenAI } from 'openai';
import PlantData from '../models/PlantData';
import { authMiddleware } from '../middleware/auth';
import { logger } from '../utils/logger';

const router = express.Router();
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// AI Plant Generation Endpoint
router.post('/generate-plant', authMiddleware, async (req, res) => {
  try {
    const { plantName, farmingType, category, variety } = req.body;
    
    if (!plantName || !farmingType || !category) {
      return res.status(400).json({
        success: false,
        message: 'Plant name, farming type, and category are required'
      });
    }

    // Generate plant data using AI
    const generatedData = await generatePlantDataWithAI({
      plantName,
      farmingType,
      category,
      variety
    });

    // Add user and system fields
    const completePlantData = {
      ...generatedData,
      userId: req.user.userId,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Validate and save
    const plant = new PlantData(completePlantData);
    await plant.validate();
    const savedPlant = await plant.save();

    logger.info('AI Plant generated', {
      userId: req.user.userId,
      plantId: savedPlant._id,
      plantName: savedPlant.name
    });

    res.json({
      success: true,
      message: 'Plant data generated successfully',
      data: { plant: savedPlant }
    });

  } catch (error) {
    logger.error('AI Plant generation failed', {
      userId: req.user.userId,
      error: error.message
    });

    res.status(500).json({
      success: false,
      message: 'Failed to generate plant data',
      error: error.message
    });
  }
});

async function generatePlantDataWithAI(request) {
  const prompt = `
Generate comprehensive plant data for: ${request.plantName}
Farming Type: ${request.farmingType}
Category: ${request.category}
${request.variety ? `Variety: ${request.variety}` : ''}

[Include the same detailed prompt structure as above]

Generate realistic, commercially viable data for this specific plant and farming method.
`;

  const response = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.7,
    max_tokens: 4000
  });

  return JSON.parse(response.choices[0].message.content);
}

export default router;
```

## Method 3: Frontend AI Generation Interface

### Create AI Generation Component
```typescript
// client/src/components/desktop/pages/AIPlantGenerator.tsx
import React, { useState } from 'react';
import { 
  Box, 
  TextField, 
  Button, 
  Select, 
  MenuItem, 
  FormControl, 
  InputLabel,
  Typography,
  Card,
  CardContent,
  Alert,
  CircularProgress
} from '@mui/material';

interface AIPlantGeneratorProps {
  onPlantGenerated: (plant: any) => void;
}

export const AIPlantGenerator: React.FC<AIPlantGeneratorProps> = ({ onPlantGenerated }) => {
  const [formData, setFormData] = useState({
    plantName: '',
    variety: '',
    farmingType: 'open_field_soil',
    category: 'vegetable'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const farmingTypes = [
    { value: 'open_field_soil', label: 'Open Field Soil' },
    { value: 'open_field_desert', label: 'Open Field Desert' },
    { value: 'greenhouse', label: 'Greenhouse' },
    { value: 'nethouse', label: 'Nethouse' },
    { value: 'hydroponic', label: 'Hydroponic' },
    { value: 'aquaponic', label: 'Aquaponic' },
    { value: 'aeroponic', label: 'Aeroponic' },
    { value: 'special', label: 'Special' }
  ];

  const categories = [
    { value: 'vegetable', label: 'Vegetable' },
    { value: 'fruit', label: 'Fruit' },
    { value: 'herb', label: 'Herb' },
    { value: 'flower', label: 'Flower' },
    { value: 'grain', label: 'Grain' },
    { value: 'legume', label: 'Legume' },
    { value: 'other', label: 'Other' }
  ];

  const handleGenerate = async () => {
    if (!formData.plantName.trim()) {
      setError('Plant name is required');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/v1/ai-generation/generate-plant', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(formData)
      });

      const result = await response.json();

      if (result.success) {
        onPlantGenerated(result.data.plant);
        setFormData({
          plantName: '',
          variety: '',
          farmingType: 'open_field_soil',
          category: 'vegetable'
        });
      } else {
        setError(result.message || 'Failed to generate plant data');
      }
    } catch (err) {
      setError('Network error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          AI Plant Data Generator
        </Typography>
        
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            label="Plant Name"
            value={formData.plantName}
            onChange={(e) => setFormData({ ...formData, plantName: e.target.value })}
            placeholder="e.g., Bell Pepper, Tomato, Lettuce"
            fullWidth
          />

          <TextField
            label="Variety (Optional)"
            value={formData.variety}
            onChange={(e) => setFormData({ ...formData, variety: e.target.value })}
            placeholder="e.g., California Wonder, Beefsteak, Romaine"
            fullWidth
          />

          <FormControl fullWidth>
            <InputLabel>Farming Type</InputLabel>
            <Select
              value={formData.farmingType}
              onChange={(e) => setFormData({ ...formData, farmingType: e.target.value })}
            >
              {farmingTypes.map((type) => (
                <MenuItem key={type.value} value={type.value}>
                  {type.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth>
            <InputLabel>Category</InputLabel>
            <Select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            >
              {categories.map((category) => (
                <MenuItem key={category.value} value={category.value}>
                  {category.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Button
            variant="contained"
            onClick={handleGenerate}
            disabled={loading || !formData.plantName.trim()}
            startIcon={loading ? <CircularProgress size={20} /> : null}
            fullWidth
          >
            {loading ? 'Generating Plant Data...' : 'Generate Plant Data with AI'}
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
};
```

## Method 4: Environment Setup

### Add to .env
```bash
# AI Generation
OPENAI_API_KEY=your_openai_api_key_here
```

### Add to package.json
```json
{
  "dependencies": {
    "openai": "^4.0.0"
  }
}
```

## Usage Examples

### 1. Command Line Generation
```bash
# Generate single plant
node scripts/generate-plant-data.js

# Batch generate multiple plants
node scripts/batch-generate-plants.js
```

### 2. API Generation
```bash
curl -X POST http://localhost:3000/api/v1/ai-generation/generate-plant \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "plantName": "Bell Pepper",
    "farmingType": "greenhouse",
    "category": "vegetable",
    "variety": "California Wonder"
  }'
```

### 3. Frontend Integration
Add the AI generator component to your plant data page for seamless integration.

## Benefits of This Approach

1. **No JSON Format Dependencies**: Direct database insertion
2. **AI-Powered**: Uses advanced AI models for realistic data
3. **Validation Built-in**: Database validation ensures data integrity
4. **Flexible**: Can generate any plant type with any farming method
5. **Scalable**: Batch generation for multiple plants
6. **User-Friendly**: Frontend interface for easy generation
7. **Error Handling**: Comprehensive error handling and logging

This approach eliminates JSON format issues and provides a robust, AI-powered plant data generation system!
