// Quick fix script to identify and fix plant data validation issues
const mongoose = require('mongoose');

// Connect to your database
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/primerosefarms');

// Import the PlantData model
const PlantData = require('../src/models/PlantData');

// Validation rules from the model
const VALIDATION_RULES = {
  // Enum values
  farmingType: ['open_field_soil', 'open_field_desert', 'greenhouse', 'nethouse', 'hydroponic', 'aquaponic', 'aeroponic', 'special'],
  category: ['vegetable', 'fruit', 'herb', 'flower', 'grain', 'legume', 'other'],
  lifecycle: ['annual', 'perennial', 'biennial'],
  lightRequirements: ['full_sun', 'partial_shade', 'shade'],
  waterLevel: ['low', 'moderate', 'high'],
  demandLevel: ['low', 'moderate', 'high', 'very_high'],
  
  // Fertilizer schedule
  fertilizerFrequency: ['daily', 'weekly', 'bi_weekly', 'monthly'],
  fertilizerGrowthStage: ['seedling', 'vegetative', 'flowering', 'fruiting', 'harvest'],
  fertilizerApplicationMethod: ['soil_drench', 'foliar_spray', 'granular', 'injection'],
  
  // Pesticide schedule
  pesticideFrequency: ['preventive', 'curative', 'as_needed'],
  pesticideGrowthStage: ['seedling', 'vegetative', 'flowering', 'fruiting', 'harvest'],
  pesticideApplicationMethod: ['foliar_spray', 'dust', 'injection', 'soil_drench'],
  
  // Numeric ranges
  sustainabilityScore: { min: 1, max: 10 },
  soilPh: { min: 0, max: 14 },
  temperature: { min: -50, max: 50 },
  humidity: { min: 0, max: 100 },
  lightHours: { min: 0, max: 24 }
};

function validatePlantData(plantData) {
  const errors = [];
  
  // Check farming type
  if (!VALIDATION_RULES.farmingType.includes(plantData.farmingType)) {
    errors.push(`Invalid farmingType: ${plantData.farmingType}. Must be one of: ${VALIDATION_RULES.farmingType.join(', ')}`);
  }
  
  // Check category
  if (!VALIDATION_RULES.category.includes(plantData.category)) {
    errors.push(`Invalid category: ${plantData.category}. Must be one of: ${VALIDATION_RULES.category.join(', ')}`);
  }
  
  // Check lifecycle
  if (plantData.growthCharacteristics?.lifecycle && !VALIDATION_RULES.lifecycle.includes(plantData.growthCharacteristics.lifecycle)) {
    errors.push(`Invalid lifecycle: ${plantData.growthCharacteristics.lifecycle}. Must be one of: ${VALIDATION_RULES.lifecycle.join(', ')}`);
  }
  
  // Check light requirements
  if (plantData.growingRequirements?.lightRequirements && !VALIDATION_RULES.lightRequirements.includes(plantData.growingRequirements.lightRequirements)) {
    errors.push(`Invalid lightRequirements: ${plantData.growingRequirements.lightRequirements}. Must be one of: ${VALIDATION_RULES.lightRequirements.join(', ')}`);
  }
  
  // Check water level
  if (plantData.growingRequirements?.waterRequirements?.level && !VALIDATION_RULES.waterLevel.includes(plantData.growingRequirements.waterRequirements.level)) {
    errors.push(`Invalid water level: ${plantData.growingRequirements.waterRequirements.level}. Must be one of: ${VALIDATION_RULES.waterLevel.join(', ')}`);
  }
  
  // Check sustainability score
  if (plantData.environmentalImpact?.sustainabilityScore) {
    const score = plantData.environmentalImpact.sustainabilityScore;
    if (score < VALIDATION_RULES.sustainabilityScore.min || score > VALIDATION_RULES.sustainabilityScore.max) {
      errors.push(`Invalid sustainabilityScore: ${score}. Must be between ${VALIDATION_RULES.sustainabilityScore.min} and ${VALIDATION_RULES.sustainabilityScore.max}`);
    }
  }
  
  // Check growth timeline math
  if (plantData.growthTimeline) {
    const { germinationDays, seedlingDays, vegetativeDays, floweringDays, fruitingDays, totalDays } = plantData.growthTimeline;
    const calculatedTotal = germinationDays + seedlingDays + vegetativeDays + floweringDays + fruitingDays;
    if (Math.abs(calculatedTotal - totalDays) > 1) {
      errors.push(`Growth timeline math error: totalDays (${totalDays}) must equal sum of all phases (${calculatedTotal})`);
    }
  }
  
  // Check fertilizer schedule
  if (plantData.fertilizerSchedule) {
    plantData.fertilizerSchedule.forEach((schedule, index) => {
      if (schedule.frequency && !VALIDATION_RULES.fertilizerFrequency.includes(schedule.frequency)) {
        errors.push(`Invalid fertilizer frequency at index ${index}: ${schedule.frequency}. Must be one of: ${VALIDATION_RULES.fertilizerFrequency.join(', ')}`);
      }
      if (schedule.growthStage && !VALIDATION_RULES.fertilizerGrowthStage.includes(schedule.growthStage)) {
        errors.push(`Invalid fertilizer growth stage at index ${index}: ${schedule.growthStage}. Must be one of: ${VALIDATION_RULES.fertilizerGrowthStage.join(', ')}`);
      }
      if (schedule.applicationMethod && !VALIDATION_RULES.fertilizerApplicationMethod.includes(schedule.applicationMethod)) {
        errors.push(`Invalid fertilizer application method at index ${index}: ${schedule.applicationMethod}. Must be one of: ${VALIDATION_RULES.fertilizerApplicationMethod.join(', ')}`);
      }
    });
  }
  
  // Check pesticide schedule
  if (plantData.pesticideSchedule) {
    plantData.pesticideSchedule.forEach((schedule, index) => {
      if (schedule.frequency && !VALIDATION_RULES.pesticideFrequency.includes(schedule.frequency)) {
        errors.push(`Invalid pesticide frequency at index ${index}: ${schedule.frequency}. Must be one of: ${VALIDATION_RULES.pesticideFrequency.join(', ')}`);
      }
      if (schedule.growthStage && !VALIDATION_RULES.pesticideGrowthStage.includes(schedule.growthStage)) {
        errors.push(`Invalid pesticide growth stage at index ${index}: ${schedule.growthStage}. Must be one of: ${VALIDATION_RULES.pesticideGrowthStage.join(', ')}`);
      }
      if (schedule.applicationMethod && !VALIDATION_RULES.pesticideApplicationMethod.includes(schedule.applicationMethod)) {
        errors.push(`Invalid pesticide application method at index ${index}: ${schedule.applicationMethod}. Must be one of: ${VALIDATION_RULES.pesticideApplicationMethod.join(', ')}`);
      }
    });
  }
  
  return errors;
}

// Example usage
const examplePlantData = {
  name: "Test Plant",
  scientificName: "Testus plantus",
  variety: "Test Variety",
  category: "vegetable",
  farmingType: "open_field_soil",
  family: "Testaceae",
  growthCharacteristics: {
    height: 100,
    spread: 50,
    rootDepth: 30,
    lifecycle: "annual"
  },
  growingRequirements: {
    soilType: "Well-drained soil",
    temperature: { min: 15, max: 30, optimal: 22 },
    humidity: { min: 40, max: 70, optimal: 55 },
    lightRequirements: "full_sun",
    lightHours: { min: 6, max: 8, optimal: 7 },
    soilPh: { min: 6.0, max: 7.0, optimal: 6.5 },
    waterRequirements: {
      level: "moderate",
      daily: 2.0,
      frequency: "daily"
    }
  },
  fertilizerSchedule: [
    {
      day: 7,
      fertilizerType: "NPK 10-10-10",
      applicationRate: 5,
      frequency: "weekly",
      growthStage: "seedling",
      applicationMethod: "soil_drench",
      notes: "Initial establishment"
    }
  ],
  pesticideSchedule: [
    {
      day: 14,
      chemicalType: "Organic pesticide",
      applicationRate: 10,
      frequency: "preventive",
      growthStage: "seedling",
      applicationMethod: "foliar_spray",
      safetyRequirements: "Gloves, mask",
      reEntryInterval: 4,
      harvestRestriction: 0,
      notes: "Preventive treatment"
    }
  ],
  growthTimeline: {
    germinationTime: 7,
    daysToMaturity: 90,
    harvestWindow: 30,
    seasonalPlanting: ["Mar", "Apr", "May"],
    germinationDays: 7,
    seedlingDays: 14,
    vegetativeDays: 35,
    floweringDays: 14,
    fruitingDays: 45,
    totalDays: 90
  },
  yieldInfo: {
    expectedYieldPerPlant: 2.0,
    yieldPerSquareMeter: 5.0,
    yieldUnit: "kg",
    harvestWindow: 30,
    shelfLife: 7,
    qualityMetrics: {
      size: "Medium size",
      color: "Green",
      texture: "Firm",
      brix: 5.0
    }
  },
  resourceRequirements: {
    seedsPerUnit: 1,
    fertilizerType: ["NPK 10-10-10"],
    fertilizerAmount: 0.5,
    pesticideType: ["Organic pesticide"],
    pesticideAmount: 10,
    spaceRequirement: {
      width: 50,
      length: 50,
      height: 100
    }
  },
  marketInfo: {
    basePrice: 3.50,
    priceUnit: "kg",
    seasonality: {
      peakSeason: ["Jun", "Jul", "Aug"],
      offSeason: ["Dec", "Jan", "Feb"]
    },
    demandLevel: "high"
  },
  qualityStandards: {
    size: { min: 5, max: 10, unit: "cm" },
    color: ["Green", "Dark green"],
    texture: ["Firm", "Crisp"],
    defects: ["Bruises", "Discoloration"]
  },
  environmentalImpact: {
    waterFootprint: 200,
    carbonFootprint: 2.0,
    sustainabilityScore: 8  // This should be between 1-10
  }
};

console.log('🔍 Validating example plant data...');
const errors = validatePlantData(examplePlantData);

if (errors.length === 0) {
  console.log('✅ Plant data is valid!');
} else {
  console.log('❌ Validation errors found:');
  errors.forEach(error => console.log(`  - ${error}`));
}

console.log('\n📋 Validation Rules Summary:');
console.log('Farming Types:', VALIDATION_RULES.farmingType.join(', '));
console.log('Categories:', VALIDATION_RULES.category.join(', '));
console.log('Sustainability Score:', `${VALIDATION_RULES.sustainabilityScore.min}-${VALIDATION_RULES.sustainabilityScore.max}`);
console.log('Fertilizer Frequencies:', VALIDATION_RULES.fertilizerFrequency.join(', '));
console.log('Pesticide Frequencies:', VALIDATION_RULES.pesticideFrequency.join(', '));

module.exports = { validatePlantData, VALIDATION_RULES };
