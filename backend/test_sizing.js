// Test the sizing calculation functions
const express = require('express');

// Copy the sizing functions from server.js for testing

// Parse height from various formats to inches
function parseHeight(heightStr) {
  if (!heightStr) return null;
  
  const str = heightStr.toString().toLowerCase();
  
  // Handle cm format first (before general number matching)
  const cmMatch = str.match(/(\d+)\s*cm/);
  if (cmMatch) {
    return parseInt(cmMatch[1]) / 2.54; // Convert cm to inches
  }
  
  // Handle feet and inches format (5'10", 5 feet 10 inches, etc.)
  const feetInchesMatch = str.match(/(\d+)['']?\s*(?:feet?\s*)?(\d+)['"]?\s*(?:inches?)?/);
  if (feetInchesMatch) {
    const feet = parseInt(feetInchesMatch[1]);
    const inches = parseInt(feetInchesMatch[2]);
    return (feet * 12) + inches;
  }
    // Handle feet only format (5', 6 feet, etc.) - but not large numbers
  const feetOnlyMatch = str.match(/(\d+)['']?\s*(?:feet?|ft)\s*$/);
  if (feetOnlyMatch) {
    const value = parseInt(feetOnlyMatch[1]);
    // Don't treat large numbers as feet
    if (value <= 8) {
      return value * 12;
    }
  }
  
  // Handle explicit inches
  const explicitInchesMatch = str.match(/(\d+)\s*(?:inches?|in)\s*$/);
  if (explicitInchesMatch) {
    return parseInt(explicitInchesMatch[1]);
  }
  
  // Handle just numbers - assume cm if large, inches if small
  const numberMatch = str.match(/^(\d+)\s*$/);
  if (numberMatch) {
    const value = parseInt(numberMatch[1]);
    // If it's a large number without explicit units, assume it's cm
    if (value > 100) {
      return value / 2.54;
    }
    return value; // Small numbers assumed to be inches
  }
  
  return null;
}

// Parse weight from various formats to pounds
function parseWeight(weightStr) {
  if (!weightStr) return null;
  
  const str = weightStr.toString().toLowerCase();
  
  // Handle kg format first
  const kgMatch = str.match(/(\d+)\s*kg/);
  if (kgMatch) {
    return parseInt(kgMatch[1]) * 2.205; // Convert kg to lbs
  }
  
  // Handle pounds format
  const lbsMatch = str.match(/(\d+)\s*(?:lbs?|pounds?)/);
  if (lbsMatch) {
    return parseInt(lbsMatch[1]);
  }
  
  // Handle just numbers - assume lbs for US context unless very low (likely kg)
  const numberMatch = str.match(/(\d+)\s*$/);
  if (numberMatch) {
    const value = parseInt(numberMatch[1]);
    // If it's under 200 and no explicit unit, could be either
    // Use context: if under 50, probably kg; if over 250, probably lbs
    if (value < 50) {
      return value * 2.205; // Treat as kg
    } else {
      return value; // Treat as lbs
    }
  }
  
  return null;
}

// Calculate ideal snowboard length based on rider characteristics
function calculateSnowboardLength(heightInches, weightLbs, ridingStyle, experience) {
  if (!heightInches) return null;
  
  // Base calculation: height in cm minus adjustment
  const heightCm = heightInches * 2.54;
  let baseLength = heightCm;
  
  // Adjust based on riding style
  const styleAdjustments = {
    'freestyle': -8,     // Shorter for tricks and maneuverability
    'park': -8,
    'freeride': +5,      // Longer for stability and float
    'all-mountain': 0,   // Standard length
    'powder': +8,        // Longer for deep snow
    'racing': +3,        // Slightly longer for stability
    'carving': +3
  };
  
  const style = ridingStyle ? ridingStyle.toLowerCase() : 'all-mountain';
  const styleAdj = styleAdjustments[style] || 0;
  baseLength += styleAdj;
  
  // Adjust based on experience level
  const experienceAdjustments = {
    'beginner': -5,      // Shorter for easier control
    'intermediate': 0,   // Standard
    'advanced': +3,      // Can handle longer boards
    'expert': +5
  };
  
  const exp = experience ? experience.toLowerCase() : 'intermediate';
  const expAdj = experienceAdjustments[exp] || 0;
  baseLength += expAdj;
  
  // Weight adjustment (if available)
  if (weightLbs) {
    if (weightLbs < 120) baseLength -= 3;
    else if (weightLbs > 180) baseLength += 3;
    else if (weightLbs > 220) baseLength += 6;
  }
  
  return Math.round(baseLength);
}

// Calculate ideal surfboard length based on rider characteristics
function calculateSurfboardLength(heightInches, weightLbs, experience, surfStyle) {
  if (!heightInches || !weightLbs) return null;
  
  // Base calculation for surfboard length in inches
  let baseLength = heightInches;
  
  // Adjust based on experience level
  const experienceAdjustments = {
    'beginner': +8,      // Longer boards for stability
    'intermediate': +2,  // Slightly longer
    'advanced': -2,      // Shorter for performance
    'expert': -4
  };
  
  const exp = experience ? experience.toLowerCase() : 'intermediate';
  const expAdj = experienceAdjustments[exp] || 0;
  baseLength += expAdj;
  
  // Adjust based on surf style
  const styleAdjustments = {
    'longboard': +18,    // Much longer
    'funboard': +8,      // Moderately longer
    'shortboard': -6,    // Shorter for performance
    'fish': -3,          // Slightly shorter but wider
    'gun': +12           // Longer for big waves
  };
  
  const style = surfStyle ? surfStyle.toLowerCase() : 'funboard';
  const styleAdj = styleAdjustments[style] || 0;
  baseLength += styleAdj;
  
  // Weight adjustments
  if (weightLbs < 130) baseLength -= 2;
  else if (weightLbs > 180) baseLength += 2;
  else if (weightLbs > 220) baseLength += 4;
  
  return Math.round(baseLength);
}

// Calculate ideal skateboard deck width based on rider characteristics
function calculateSkateboardDeckWidth(shoeSize, ridingStyle, height) {
  // Base deck width calculation
  let baseWidth = 8.0; // Standard width in inches
  
  // Adjust based on shoe size
  if (shoeSize) {
    const size = parseFloat(shoeSize);
    if (size < 7) baseWidth = 7.5;
    else if (size < 9) baseWidth = 7.75;
    else if (size < 10.5) baseWidth = 8.0;
    else if (size < 12) baseWidth = 8.25;
    else baseWidth = 8.5;
  }
  
  // Adjust based on riding style
  const styleAdjustments = {
    'street': -0.25,     // Narrower for technical tricks
    'park': -0.125,      // Slightly narrower
    'vert': +0.25,       // Wider for stability
    'cruising': +0.5,    // Much wider for comfort
    'downhill': +0.75    // Widest for stability at speed
  };
  
  const style = ridingStyle ? ridingStyle.toLowerCase() : 'street';
  const styleAdj = styleAdjustments[style] || 0;
  baseWidth += styleAdj;
  
  // Height adjustment for very tall or short riders
  if (height) {
    const heightInches = parseHeight(height);
    if (heightInches) {
      if (heightInches < 60) baseWidth -= 0.25; // Under 5 feet
      else if (heightInches > 72) baseWidth += 0.25; // Over 6 feet
    }
  }
  
  return Math.round(baseWidth * 4) / 4; // Round to nearest quarter inch
}

// Test cases
console.log('=== SIZING FUNCTION TESTS ===\n');

// Test height parsing
console.log('Height Parsing Tests:');
console.log('5\'10":', parseHeight('5\'10"'), 'inches');
console.log('6 feet:', parseHeight('6 feet'), 'inches');
console.log('175cm:', parseHeight('175cm'), 'inches', '(should be ~69)');
console.log('70 inches:', parseHeight('70 inches'), 'inches');
console.log('175:', parseHeight('175'), 'inches', '(should be ~69 as cm)');
console.log('');

// Test weight parsing
console.log('Weight Parsing Tests:');
console.log('150 lbs:', parseWeight('150 lbs'), 'pounds');
console.log('70 kg:', parseWeight('70 kg'), 'pounds');
console.log('180:', parseWeight('180'), 'pounds');
console.log('');

// Test snowboard sizing
console.log('Snowboard Sizing Tests:');
console.log('5\'10" beginner freestyle:', calculateSnowboardLength(70, 150, 'freestyle', 'beginner'), 'cm');
console.log('6\'0" advanced all-mountain:', calculateSnowboardLength(72, 180, 'all-mountain', 'advanced'), 'cm');
console.log('5\'6" intermediate freeride:', calculateSnowboardLength(66, 140, 'freeride', 'intermediate'), 'cm');
console.log('');

// Test surfboard sizing
console.log('Surfboard Sizing Tests:');
console.log('5\'10" beginner longboard:', calculateSurfboardLength(70, 150, 'beginner', 'longboard'), 'inches');
console.log('6\'0" advanced shortboard:', calculateSurfboardLength(72, 180, 'advanced', 'shortboard'), 'inches');
console.log('5\'6" intermediate funboard:', calculateSurfboardLength(66, 140, 'intermediate', 'funboard'), 'inches');
console.log('');

// Test skateboard sizing
console.log('Skateboard Deck Width Tests:');
console.log('Size 9 street skating:', calculateSkateboardDeckWidth('9', 'street', '5\'10"'), 'inches');
console.log('Size 11 vert skating:', calculateSkateboardDeckWidth('11', 'vert', '6\'0"'), 'inches');
console.log('Size 8 cruising:', calculateSkateboardDeckWidth('8', 'cruising', '5\'6"'), 'inches');
console.log('');

// Test real-world scenarios
console.log('=== REAL-WORLD SCENARIOS ===\n');

console.log('Scenario 1: 5\'8" 160lb intermediate snowboarder, all-mountain style');
const height1 = parseHeight('5\'8"');
const weight1 = parseWeight('160 lbs');
const snowboard1 = calculateSnowboardLength(height1, weight1, 'all-mountain', 'intermediate');
console.log(`Recommended snowboard: ${snowboard1}cm\n`);

console.log('Scenario 2: 5\'10" 170lb beginner surfer, wants longboard');
const height2 = parseHeight('5\'10"');
const weight2 = parseWeight('170 lbs');
const surfboard2 = calculateSurfboardLength(height2, weight2, 'beginner', 'longboard');
console.log(`Recommended surfboard: ${Math.floor(surfboard2/12)}'${surfboard2%12}" (${surfboard2} inches)\n`);

console.log('Scenario 3: Size 10 shoes, 6ft tall, street skating');
const deck3 = calculateSkateboardDeckWidth('10', 'street', '6ft');
console.log(`Recommended deck width: ${deck3}"\n`);
