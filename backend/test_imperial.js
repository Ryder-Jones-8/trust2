// Test imperial parsing functions
const fs = require('fs');

// Copy the helper functions from server.js for testing
function parseHeight(heightStr) {
  if (!heightStr) return null;
  
  // Handle feet'inches" format like "5'10""
  const feetInchesMatch = heightStr.match(/(\d+)'(\d+)"/);
  if (feetInchesMatch) {
    const feet = parseFloat(feetInchesMatch[1]);
    const inches = parseFloat(feetInchesMatch[2]);
    return feet + (inches / 12);
  }
  
  // Handle decimal feet format like "5.83"
  const decimalMatch = heightStr.match(/[\d.]+/);
  if (decimalMatch) {
    return parseFloat(decimalMatch[0]);
  }
  
  return null;
}

function parseWeight(weightStr) {
  if (!weightStr) return null;
  const match = weightStr.match(/[\d.]+/);
  return match ? parseFloat(match[0]) : null;
}

function parseChestSize(chestStr) {
  if (!chestStr) return null;
  const match = chestStr.match(/[\d.]+/);
  return match ? parseFloat(match[0]) : null;
}

function parseTemperature(tempStr) {
  if (!tempStr) return null;
  const match = tempStr.match(/[\d.]+/);
  return match ? parseFloat(match[0]) : null;
}

// Test cases
console.log('Testing Imperial Parsing Functions:');
console.log('===================================');

// Height parsing tests
console.log('\nHeight Parsing Tests:');
console.log(`parseHeight("5'10\"") = ${parseHeight("5'10\"")}`); // Should be ~5.83
console.log(`parseHeight("6'2\"") = ${parseHeight("6'2\"")}`);   // Should be ~6.17
console.log(`parseHeight("5.5") = ${parseHeight("5.5")}`);       // Should be 5.5
console.log(`parseHeight("6.0") = ${parseHeight("6.0")}`);       // Should be 6.0

// Weight parsing tests
console.log('\nWeight Parsing Tests:');
console.log(`parseWeight("150 lbs") = ${parseWeight("150 lbs")}`);
console.log(`parseWeight("180") = ${parseWeight("180")}`);
console.log(`parseWeight("165.5 lbs") = ${parseWeight("165.5 lbs")}`);

// Chest size parsing tests
console.log('\nChest Size Parsing Tests:');
console.log(`parseChestSize("38 in") = ${parseChestSize("38 in")}`);
console.log(`parseChestSize("42") = ${parseChestSize("42")}`);
console.log(`parseChestSize("36.5 inches") = ${parseChestSize("36.5 inches")}`);

// Temperature parsing tests
console.log('\nTemperature Parsing Tests:');
console.log(`parseTemperature("65°F") = ${parseTemperature("65°F")}`);
console.log(`parseTemperature("70") = ${parseTemperature("70")}`);
console.log(`parseTemperature("62.5°F") = ${parseTemperature("62.5°F")}`);

// Test a complete matching scenario
console.log('\n\nTesting Complete Matching Scenario:');
console.log('===================================');

const testFormData = {
  height: "5'10\"",
  weight: "170 lbs",
  chestSize: "40 in",
  waterTemp: "65°F"
};

const testSpecifications = {
  heightRange: { min: 5.5, max: 6.2 },
  weightRange: { min: 150, max: 200 },
  chestSizeRange: { min: 38, max: 44 },
  waterTempRange: { min: 60, max: 75 }
};

console.log('\nForm Data:', testFormData);
console.log('Specifications:', testSpecifications);

const height = parseHeight(testFormData.height);
const weight = parseWeight(testFormData.weight);
const chestSize = parseChestSize(testFormData.chestSize);
const waterTemp = parseTemperature(testFormData.waterTemp);

console.log('\nParsed Values:');
console.log(`Height: ${height} ft (range: ${testSpecifications.heightRange.min} - ${testSpecifications.heightRange.max})`);
console.log(`Weight: ${weight} lbs (range: ${testSpecifications.weightRange.min} - ${testSpecifications.weightRange.max})`);
console.log(`Chest: ${chestSize} in (range: ${testSpecifications.chestSizeRange.min} - ${testSpecifications.chestSizeRange.max})`);
console.log(`Water Temp: ${waterTemp}°F (range: ${testSpecifications.waterTempRange.min} - ${testSpecifications.waterTempRange.max})`);

console.log('\nMatching Results:');
console.log(`Height match: ${height >= testSpecifications.heightRange.min && height <= testSpecifications.heightRange.max}`);
console.log(`Weight match: ${weight >= testSpecifications.weightRange.min && weight <= testSpecifications.weightRange.max}`);
console.log(`Chest match: ${chestSize >= testSpecifications.chestSizeRange.min && chestSize <= testSpecifications.chestSizeRange.max}`);
console.log(`Water temp match: ${waterTemp >= testSpecifications.waterTempRange.min && waterTemp <= testSpecifications.waterTempRange.max}`);
