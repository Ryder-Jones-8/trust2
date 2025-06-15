// Test the enhanced snowboard and surfboard sizing recommendations
const fetch = require('node-fetch');

// Test snowboard sizing
async function testSnowboardSizing() {
  console.log('\n=== TESTING ENHANCED SNOWBOARD SIZING ===');
  
  const testCases = [
    {
      name: 'Beginner Rider',
      formData: {
        height: "5'6\"",
        weight: '140 lbs',
        experience: 'Beginner',
        ridingStyle: 'All-mountain'
      }
    },
    {
      name: 'Intermediate Freestyle Rider', 
      formData: {
        height: "5'10\"",
        weight: '170 lbs',
        experience: 'Intermediate',
        ridingStyle: 'Freestyle'
      }
    },
    {
      name: 'Advanced Freeride Rider',
      formData: {
        height: '6.0',
        weight: '190 lbs',
        experience: 'Advanced',
        ridingStyle: 'Freeride'
      }
    }
  ];

  for (const testCase of testCases) {
    console.log(`\n📏 Testing: ${testCase.name}`);
    console.log(`Height: ${testCase.formData.height}, Weight: ${testCase.formData.weight}`);
    console.log(`Experience: ${testCase.formData.experience}, Style: ${testCase.formData.ridingStyle}`);
    
    try {
      const response = await fetch('http://localhost:3001/api/recommendations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sport: 'ski',
          category: 'snowboards',
          formData: testCase.formData
        })
      });

      if (response.ok) {
        const recommendations = await response.json();
        console.log(`✅ Found ${recommendations.length} recommendations`);
        
        recommendations.forEach((rec, index) => {
          console.log(`\n${index + 1}. ${rec.name} (Score: ${rec.score}%)`);
          rec.matchReasons?.forEach(reason => {
            console.log(`   • ${reason}`);
          });
        });
      } else {
        console.log(`❌ Error: ${response.status}`);
      }
    } catch (error) {
      console.log(`❌ Network error: ${error.message}`);
    }
  }
}

// Test surfboard sizing
async function testSurfboardSizing() {
  console.log('\n\n=== TESTING ENHANCED SURFBOARD SIZING ===');
  
  const testCases = [
    {
      name: 'Beginner Surfer',
      formData: {
        height: "5'8\"",
        weight: '160 lbs',
        experience: 'Beginner',
        surfStyle: 'Longboard cruising'
      }
    },
    {
      name: 'Intermediate Surfer',
      formData: {
        height: "5'10\"",
        weight: '175 lbs',
        experience: 'Intermediate',
        surfStyle: 'All-around'
      }
    },
    {
      name: 'Advanced Shortboard Surfer',
      formData: {
        height: '6.0',
        weight: '180 lbs',
        experience: 'Advanced',
        surfStyle: 'Shortboard performance'
      }
    }
  ];

  for (const testCase of testCases) {
    console.log(`\n🏄 Testing: ${testCase.name}`);
    console.log(`Height: ${testCase.formData.height}, Weight: ${testCase.formData.weight}`);
    console.log(`Experience: ${testCase.formData.experience}, Style: ${testCase.formData.surfStyle}`);
    
    try {
      const response = await fetch('http://localhost:3001/api/recommendations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sport: 'surf',
          category: 'boards',
          formData: testCase.formData
        })
      });

      if (response.ok) {
        const recommendations = await response.json();
        console.log(`✅ Found ${recommendations.length} recommendations`);
        
        recommendations.forEach((rec, index) => {
          console.log(`\n${index + 1}. ${rec.name} (Score: ${rec.score}%)`);
          rec.matchReasons?.forEach(reason => {
            console.log(`   • ${reason}`);
          });
        });
      } else {
        console.log(`❌ Error: ${response.status}`);
      }
    } catch (error) {
      console.log(`❌ Network error: ${error.message}`);
    }
  }
}

// Run tests
(async () => {
  await testSnowboardSizing();
  await testSurfboardSizing();
  console.log('\n=== SIZING TEST COMPLETE ===');
})().catch(console.error);
