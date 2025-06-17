import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import styled from 'styled-components'
import type { FormField, CategoryForms } from '../types'

const CategoryContainer = styled.div`
  min-height: 100vh;
  padding: 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  background-color: ${props => props.theme.colors.primary};
`

const BackButton = styled.button`
  position: absolute;
  top: 2rem;
  left: 2rem;
  background: none;
  border: 2px solid ${props => props.theme.colors.text};
  color: ${props => props.theme.colors.text};
  padding: 0.5rem 1rem;
  border-radius: 25px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.3s ease;
  
  &:hover {
    background-color: ${props => props.theme.colors.text};
    color: ${props => props.theme.colors.primary};
  }
`

const CategoryTitle = styled.h1`
  font-size: 2.5rem;
  font-weight: 300;
  margin: 4rem 0 1rem 0;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: ${props => props.theme.colors.text};
  
  @media (max-width: 768px) {
    font-size: 2rem;
    margin: 3rem 0 1rem 0;
  }
`

const Subtitle = styled.p`
  font-size: 1rem;
  color: ${props => props.theme.colors.textSecondary};
  margin-bottom: 3rem;
  text-align: center;
  max-width: 600px;
`

const OptionalText = styled.span`
  font-size: 0.75rem;
  color: ${props => props.theme.colors.textSecondary};
  font-weight: normal;
  margin-left: 0.5rem;
`

const FormContainer = styled.form`
  background-color: ${props => props.theme.colors.secondary};
  border-radius: 15px;
  padding: 2rem;
  max-width: 500px;
  width: 100%;
  border: 2px solid ${props => props.theme.colors.accent};
`

const FormGroup = styled.div`
  margin-bottom: 1.5rem;
`

const Label = styled.label`
  display: block;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
  color: ${props => props.theme.colors.text};
  text-transform: uppercase;
  letter-spacing: 0.05em;
`

const Input = styled.input`
  width: 100%;
  padding: 0.75rem;
  border: 2px solid ${props => props.theme.colors.accent};
  border-radius: 8px;
  background-color: #ffffff;
  color: #333333;
  font-size: 1rem;
  
  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.text};
  }
  
  &::placeholder {
    color: #666666;
  }
`

const Select = styled.select`
  width: 100%;
  padding: 0.75rem;
  border: 2px solid ${props => props.theme.colors.accent};
  border-radius: 8px;
  background-color: #ffffff;
  color: #333333;
  font-size: 1rem;
  
  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.text};
  }
  
  option {
    background-color: #ffffff;
    color: #333333;
  }
`

const SubmitButton = styled.button`
  width: 100%;
  padding: 1rem;
  background-color: ${props => props.theme.colors.text};
  color: #000000 !important;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-top: 1rem;
  -webkit-appearance: none;
  -webkit-text-fill-color: #000000;
  
  &:hover {
    background-color: ${props => props.theme.colors.textSecondary};
    color: #000000 !important;
    -webkit-text-fill-color: #000000;
  }
`

interface FormData {
  [key: string]: string | number
}

const categoryForms: CategoryForms = {
  surf: {
    boards: [
      { name: 'height', label: 'Height', type: 'text', placeholder: "e.g. 5'10\"" },
      { name: 'weight', label: 'Weight', type: 'text', placeholder: 'e.g. 170 lbs' },
      { name: 'experience', label: 'Experience Level', type: 'select', options: ['Beginner', 'Intermediate', 'Advanced', 'Expert'] },
      { name: 'waveConditions', label: 'Preferred Wave Conditions', type: 'select', options: ['Small waves (1-3ft)', 'Medium waves (3-6ft)', 'Large waves (6ft+)', 'All conditions'] },
      { name: 'surfStyle', label: 'Surf Style', type: 'select', options: ['Longboard cruising', 'Shortboard performance', 'All-around', 'Big wave'] },
      { name: 'priceRange', label: 'Price Range (Optional)', type: 'select', options: ['Under $200', '$200 - $400', '$400 - $600', '$600 - $800', '$800 - $1000', '$1000+', 'No preference'] }
    ],    wetsuits: [
      { name: 'height', label: 'Height', type: 'text', placeholder: "e.g. 5'10\"" },
      { name: 'weight', label: 'Weight', type: 'text', placeholder: 'e.g. 170 lbs' },
      { name: 'chestSize', label: 'Chest Size', type: 'text', placeholder: 'e.g. 38"' },
      { name: 'waterTemp', label: 'Water Temperature', type: 'select', options: ['Warm (70°F+)', 'Moderate (60-70°F)', 'Cool (50-60°F)', 'Cold (Below 50°F)'] },
      { name: 'thickness', label: 'Preferred Thickness', type: 'select', options: ['2mm (Summer)', '3/2mm (Spring/Fall)', '4/3mm (Winter)', '5/4mm (Cold water)'] },
      { name: 'priceRange', label: 'Price Range (Optional)', type: 'select', options: ['Under $100', '$100 - $200', '$200 - $300', '$300 - $400', '$400 - $500', '$500+', 'No preference'] }
    ],
    fins: [
      { name: 'boardType', label: 'Board Type', type: 'select', options: ['Longboard', 'Shortboard', 'Fish', 'Funboard', 'SUP'] },
      { name: 'experience', label: 'Experience Level', type: 'select', options: ['Beginner', 'Intermediate', 'Advanced', 'Expert'] },
      { name: 'finSetup', label: 'Fin Setup', type: 'select', options: ['Single fin', 'Twin fin', 'Thruster (3 fin)', 'Quad (4 fin)', '2+1 (3 fin)', 'Not sure'] },
      { name: 'surfStyle', label: 'Surf Style', type: 'select', options: ['Cruising/noseriding', 'High performance', 'All-around', 'Speed/drive', 'Maneuverability'] },
      { name: 'waveType', label: 'Wave Type', type: 'select', options: ['Small mushy waves', 'Clean medium waves', 'Powerful waves', 'Mixed conditions'] },
      { name: 'finMaterial', label: 'Fin Material Preference', type: 'select', options: ['Fiberglass (stiff)', 'Plastic (flexible)', 'Carbon fiber (high performance)', 'Bamboo (eco-friendly)', 'No preference'] },
      { name: 'priceRange', label: 'Price Range (Optional)', type: 'select', options: ['Under $25', '$25 - $50', '$50 - $100', '$100 - $150', '$150+', 'No preference'] }
    ]
  },
  ski: {
    snowboards: [
      { name: 'height', label: 'Height', type: 'text', placeholder: "e.g. 5'10\"" },
      { name: 'weight', label: 'Weight', type: 'text', placeholder: 'e.g. 170 lbs' },
      { name: 'bootSize', label: 'Boot Size', type: 'text', placeholder: 'e.g. 10' },
      { name: 'experience', label: 'Experience Level', type: 'select', options: ['Beginner', 'Intermediate', 'Advanced', 'Expert'] },
      { name: 'ridingStyle', label: 'Riding Style', type: 'select', options: ['All-mountain', 'Freestyle', 'Freeride', 'Powder'] },
      { name: 'terrain', label: 'Preferred Terrain', type: 'select', options: ['Groomed runs', 'Park & pipe', 'Backcountry', 'Mixed terrain'] },
      { name: 'priceRange', label: 'Price Range (Optional)', type: 'select', options: ['Under $300', '$300 - $500', '$500 - $700', '$700 - $900', '$900+', 'No preference'] }
    ],
    skis: [
      { name: 'height', label: 'Height', type: 'text', placeholder: "e.g. 5'10\"" },
      { name: 'weight', label: 'Weight', type: 'text', placeholder: 'e.g. 170 lbs' },
      { name: 'bootSize', label: 'Boot Size', type: 'text', placeholder: 'e.g. 27.5' },
      { name: 'experience', label: 'Experience Level', type: 'select', options: ['Beginner', 'Intermediate', 'Advanced', 'Expert'] },
      { name: 'skiType', label: 'Ski Type', type: 'select', options: ['All-mountain', 'Carving', 'Freestyle', 'Touring', 'Racing'] },
      { name: 'terrain', label: 'Preferred Terrain', type: 'select', options: ['Groomed runs', 'Off-piste', 'Park', 'Backcountry'] },
      { name: 'priceRange', label: 'Price Range (Optional)', type: 'select', options: ['Under $300', '$300 - $500', '$500 - $700', '$700 - $900', '$900+', 'No preference'] }
    ],    boots: [
      { name: 'footLength', label: 'Foot Length (cm)', type: 'text', placeholder: 'e.g. 28.5' },
      { name: 'footWidth', label: 'Foot Width', type: 'select', options: ['Narrow', 'Medium', 'Wide'] },
      { name: 'experience', label: 'Experience Level', type: 'select', options: ['Beginner', 'Intermediate', 'Advanced', 'Expert'] },
      { name: 'flex', label: 'Preferred Flex', type: 'select', options: ['Soft (60-80)', 'Medium (80-100)', 'Stiff (100-120)', 'Very Stiff (120+)'] },
      { name: 'volume', label: 'Foot Volume', type: 'select', options: ['Low volume', 'Medium volume', 'High volume'] },
      { name: 'priceRange', label: 'Price Range (Optional)', type: 'select', options: ['Under $200', '$200 - $400', '$400 - $600', '$600 - $800', '$800+', 'No preference'] }
    ],    'snowboard boots': [
      { name: 'footLength', label: 'Foot Length (inches)', type: 'text', placeholder: 'e.g. 11.2' },
      { name: 'footWidth', label: 'Foot Width', type: 'select', options: ['Narrow', 'Medium', 'Wide'] },
      { name: 'experience', label: 'Experience Level', type: 'select', options: ['Beginner', 'Intermediate', 'Advanced', 'Expert'] },
      { name: 'flex', label: 'Preferred Flex', type: 'select', options: ['Soft (3-5)', 'Medium (5-7)', 'Stiff (7-9)', 'Very Stiff (9-10)'] },
      { name: 'lacingSystem', label: 'Lacing System', type: 'select', options: ['Traditional laces', 'BOA system', 'Speed lacing', 'Hybrid'] },
      { name: 'ridingStyle', label: 'Riding Style', type: 'select', options: ['All-mountain', 'Freestyle', 'Freeride', 'Powder'] },
      { name: 'volume', label: 'Foot Volume', type: 'select', options: ['Low volume', 'Medium volume', 'High volume'] },
      { name: 'priceRange', label: 'Price Range (Optional)', type: 'select', options: ['Under $200', '$200 - $400', '$400 - $600', '$600 - $800', '$800+', 'No preference'] }
    ],    'ski boots': [
      { name: 'footLength', label: 'Foot Length (inches)', type: 'text', placeholder: 'e.g. 11.2' },
      { name: 'footWidth', label: 'Foot Width', type: 'select', options: ['Narrow (3.9-3.94")', 'Medium (3.94-4.02")', 'Wide (4.02-4.17")', 'Extra Wide (4.17"+)'] },
      { name: 'experience', label: 'Experience Level', type: 'select', options: ['Beginner', 'Intermediate', 'Advanced', 'Expert'] },
      { name: 'flex', label: 'Flex Rating', type: 'select', options: ['Soft (60-80)', 'Medium (80-100)', 'Stiff (100-120)', 'Very Stiff (120-140)', 'Race (140+)'] },
      { name: 'skiType', label: 'Ski Type', type: 'select', options: ['All-mountain', 'Carving', 'Racing', 'Touring', 'Freestyle'] },
      { name: 'calfWidth', label: 'Calf Width', type: 'select', options: ['Narrow', 'Medium', 'Wide'] },
      { name: 'volume', label: 'Foot Volume', type: 'select', options: ['Low volume', 'Medium volume', 'High volume'] },
      { name: 'priceRange', label: 'Price Range (Optional)', type: 'select', options: ['Under $200', '$200 - $400', '$400 - $600', '$600 - $800', '$800+', 'No preference'] }
    ],    helmets: [
      { name: 'headCircumference', label: 'Head Circumference (inches)', type: 'text', placeholder: 'e.g. 22.8' },
      { name: 'activity', label: 'Primary Activity', type: 'select', options: ['Alpine skiing', 'Snowboarding', 'Freestyle', 'Backcountry'] },
      { name: 'features', label: 'Desired Features', type: 'select', options: ['Basic protection', 'Ventilation system', 'Audio compatibility', 'Goggle integration'] },
      { name: 'priceRange', label: 'Price Range (Optional)', type: 'select', options: ['Under $50', '$50 - $100', '$100 - $200', '$200 - $300', '$300+', 'No preference'] }
    ],
    goggles: [
      { name: 'faceSize', label: 'Face Size', type: 'select', options: ['Small', 'Medium', 'Large'] },
      { name: 'lensType', label: 'Lens Type', type: 'select', options: ['Clear/Low light', 'All conditions', 'Sunny conditions', 'Interchangeable'] },
      { name: 'fitType', label: 'Fit Type', type: 'select', options: ['Asian fit', 'Standard fit', 'Wide fit'] },
      { name: 'priceRange', label: 'Price Range (Optional)', type: 'select', options: ['Under $50', '$50 - $100', '$100 - $150', '$150 - $250', '$250+', 'No preference'] }
    ]  },
  snow: {
    snowboards: [
      { name: 'height', label: 'Height', type: 'text', placeholder: "e.g. 5'10\"" },
      { name: 'weight', label: 'Weight', type: 'text', placeholder: 'e.g. 170 lbs' },
      { name: 'bootSize', label: 'Boot Size', type: 'text', placeholder: 'e.g. 10' },
      { name: 'experience', label: 'Experience Level', type: 'select', options: ['Beginner', 'Intermediate', 'Advanced', 'Expert'] },
      { name: 'ridingStyle', label: 'Riding Style', type: 'select', options: ['All-mountain', 'Freestyle', 'Freeride', 'Powder'] },
      { name: 'terrain', label: 'Preferred Terrain', type: 'select', options: ['Groomed runs', 'Park & pipe', 'Backcountry', 'Mixed terrain'] },
      { name: 'priceRange', label: 'Price Range (Optional)', type: 'select', options: ['Under $300', '$300 - $500', '$500 - $700', '$700 - $900', '$900+', 'No preference'] }
    ],
    skis: [
      { name: 'height', label: 'Height', type: 'text', placeholder: "e.g. 5'10\"" },
      { name: 'weight', label: 'Weight', type: 'text', placeholder: 'e.g. 170 lbs' },
      { name: 'bootSize', label: 'Boot Size', type: 'text', placeholder: 'e.g. 27.5' },
      { name: 'experience', label: 'Experience Level', type: 'select', options: ['Beginner', 'Intermediate', 'Advanced', 'Expert'] },
      { name: 'skiType', label: 'Ski Type', type: 'select', options: ['All-mountain', 'Carving', 'Freestyle', 'Touring', 'Racing'] },
      { name: 'terrain', label: 'Preferred Terrain', type: 'select', options: ['Groomed runs', 'Off-piste', 'Park', 'Backcountry'] },
      { name: 'priceRange', label: 'Price Range (Optional)', type: 'select', options: ['Under $300', '$300 - $500', '$500 - $700', '$700 - $900', '$900+', 'No preference'] }
    ],
    boots: [
      { name: 'footLength', label: 'Foot Length (cm)', type: 'text', placeholder: 'e.g. 28.5' },
      { name: 'footWidth', label: 'Foot Width', type: 'select', options: ['Narrow', 'Medium', 'Wide'] },
      { name: 'experience', label: 'Experience Level', type: 'select', options: ['Beginner', 'Intermediate', 'Advanced', 'Expert'] },
      { name: 'flex', label: 'Preferred Flex', type: 'select', options: ['Soft (60-80)', 'Medium (80-100)', 'Stiff (100-120)', 'Very Stiff (120+)'] },
      { name: 'volume', label: 'Foot Volume', type: 'select', options: ['Low volume', 'Medium volume', 'High volume'] },
      { name: 'priceRange', label: 'Price Range (Optional)', type: 'select', options: ['Under $200', '$200 - $400', '$400 - $600', '$600 - $800', '$800+', 'No preference'] }
    ],
    'snowboard boots': [
      { name: 'footLength', label: 'Foot Length (inches)', type: 'text', placeholder: 'e.g. 11.2' },
      { name: 'footWidth', label: 'Foot Width', type: 'select', options: ['Narrow', 'Medium', 'Wide'] },
      { name: 'experience', label: 'Experience Level', type: 'select', options: ['Beginner', 'Intermediate', 'Advanced', 'Expert'] },
      { name: 'flex', label: 'Preferred Flex', type: 'select', options: ['Soft (3-5)', 'Medium (5-7)', 'Stiff (7-9)', 'Very Stiff (9-10)'] },
      { name: 'lacingSystem', label: 'Lacing System', type: 'select', options: ['Traditional laces', 'BOA system', 'Speed lacing', 'Hybrid'] },
      { name: 'ridingStyle', label: 'Riding Style', type: 'select', options: ['All-mountain', 'Freestyle', 'Freeride', 'Powder'] },
      { name: 'volume', label: 'Foot Volume', type: 'select', options: ['Low volume', 'Medium volume', 'High volume'] },
      { name: 'priceRange', label: 'Price Range (Optional)', type: 'select', options: ['Under $200', '$200 - $400', '$400 - $600', '$600 - $800', '$800+', 'No preference'] }
    ],
    'ski boots': [
      { name: 'footLength', label: 'Foot Length (inches)', type: 'text', placeholder: 'e.g. 11.2' },
      { name: 'footWidth', label: 'Foot Width', type: 'select', options: ['Narrow (3.9-3.94")', 'Medium (3.94-4.02")', 'Wide (4.02-4.17")', 'Extra Wide (4.17"+)'] },
      { name: 'experience', label: 'Experience Level', type: 'select', options: ['Beginner', 'Intermediate', 'Advanced', 'Expert'] },
      { name: 'flex', label: 'Flex Rating', type: 'select', options: ['Soft (60-80)', 'Medium (80-100)', 'Stiff (100-120)', 'Very Stiff (120-140)', 'Race (140+)'] },
      { name: 'skiType', label: 'Ski Type', type: 'select', options: ['All-mountain', 'Carving', 'Racing', 'Touring', 'Freestyle'] },
      { name: 'calfWidth', label: 'Calf Width', type: 'select', options: ['Narrow', 'Medium', 'Wide'] },
      { name: 'volume', label: 'Foot Volume', type: 'select', options: ['Low volume', 'Medium volume', 'High volume'] },
      { name: 'priceRange', label: 'Price Range (Optional)', type: 'select', options: ['Under $200', '$200 - $400', '$400 - $600', '$600 - $800', '$800+', 'No preference'] }
    ],
    helmets: [
      { name: 'headCircumference', label: 'Head Circumference (inches)', type: 'text', placeholder: 'e.g. 22.8' },
      { name: 'activity', label: 'Primary Activity', type: 'select', options: ['Alpine skiing', 'Snowboarding', 'Freestyle', 'Backcountry'] },
      { name: 'features', label: 'Desired Features', type: 'select', options: ['Basic protection', 'Ventilation system', 'Audio compatibility', 'Goggle integration'] },
      { name: 'priceRange', label: 'Price Range (Optional)', type: 'select', options: ['Under $50', '$50 - $100', '$100 - $200', '$200 - $300', '$300+', 'No preference'] }
    ],
    goggles: [
      { name: 'faceSize', label: 'Face Size', type: 'select', options: ['Small', 'Medium', 'Large'] },
      { name: 'lensType', label: 'Lens Type', type: 'select', options: ['Clear/Low light', 'All conditions', 'Sunny conditions', 'Interchangeable'] },
      { name: 'fitType', label: 'Fit Type', type: 'select', options: ['Asian fit', 'Standard fit', 'Wide fit'] },
      { name: 'priceRange', label: 'Price Range (Optional)', type: 'select', options: ['Under $50', '$50 - $100', '$100 - $150', '$150 - $250', '$250+', 'No preference'] }
    ]
  },
  skate: {
    decks: [
      { name: 'height', label: 'Height', type: 'text', placeholder: "e.g. 5'10\"" },
      { name: 'shoeSize', label: 'Shoe Size', type: 'text', placeholder: 'e.g. 10' },
      { name: 'experience', label: 'Experience Level', type: 'select', options: ['Beginner', 'Intermediate', 'Advanced', 'Expert'] },
      { name: 'skateStyle', label: 'Skating Style', type: 'select', options: ['Street', 'Vert', 'Cruising', 'Tricks'] },
      { name: 'deckWidth', label: 'Preferred Width', type: 'select', options: ['7.5-7.75"', '7.75-8.0"', '8.0-8.25"', '8.25-8.5"', '8.5"+'] },
      { name: 'priceRange', label: 'Price Range (Optional)', type: 'select', options: ['Under $50', '$50 - $80', '$80 - $120', '$120 - $180', '$180+', 'No preference'] }
    ],
    trucks: [
      { name: 'deckWidth', label: 'Deck Width', type: 'text', placeholder: 'e.g. 8.0"' },
      { name: 'ridingStyle', label: 'Riding Style', type: 'select', options: ['Street', 'Vert', 'Cruising', 'All-around'] },
      { name: 'truckHeight', label: 'Truck Height', type: 'select', options: ['Low', 'Mid', 'High'] },
      { name: 'priceRange', label: 'Price Range (Optional)', type: 'select', options: ['Under $30', '$30 - $50', '$50 - $80', '$80 - $120', '$120+', 'No preference'] }
    ],
    wheels: [
      { name: 'ridingStyle', label: 'Riding Style', type: 'select', options: ['Street', 'Vert', 'Cruising', 'Tricks'] },
      { name: 'surface', label: 'Primary Surface', type: 'select', options: ['Smooth concrete', 'Rough streets', 'Skate parks', 'Mixed terrain'] },
      { name: 'wheelSize', label: 'Preferred Size', type: 'select', options: ['50-53mm (Street)', '54-58mm (All-around)', '59mm+ (Cruising)'] },
      { name: 'priceRange', label: 'Price Range (Optional)', type: 'select', options: ['Under $20', '$20 - $40', '$40 - $60', '$60 - $80', '$80+', 'No preference'] }
    ],
    helmets: [
      { name: 'headCircumference', label: 'Head Circumference (cm)', type: 'text', placeholder: 'e.g. 58' },
      { name: 'skateStyle', label: 'Skating Style', type: 'select', options: ['Street', 'Vert', 'Bowl', 'Cruising'] },
      { name: 'certifications', label: 'Certification Preference', type: 'select', options: ['CPSC (Basic)', 'ASTM (Skate specific)', 'Dual certified'] },
      { name: 'priceRange', label: 'Price Range (Optional)', type: 'select', options: ['Under $30', '$30 - $50', '$50 - $80', '$80 - $120', '$120+', 'No preference'] }
    ]
  }
}

const CategoryPage = () => {
  const { sport, category } = useParams<{ sport: string; category: string }>()
  const navigate = useNavigate()
  const [formData, setFormData] = useState<FormData>({})
  const formFields: FormField[] = sport && category ? 
    categoryForms[sport]?.[category] || [] : []

  const handleInputChange = (name: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Navigate to recommendations page with form data
    navigate('/recommendations', { 
      state: { 
        sport, 
        category, 
        formData 
      }
    })
  }

  const handleBackClick = () => {
    navigate(`/sport/${sport}`)
  }

  return (
    <CategoryContainer>
      <BackButton onClick={handleBackClick}>
        ← Back to {sport}
      </BackButton>
        <CategoryTitle>{category}</CategoryTitle>
      <Subtitle>
        Share what you know to get better recommendations - all fields are optional
      </Subtitle>
      
      <FormContainer onSubmit={handleSubmit}>        {formFields.map((field: FormField) => (
          <FormGroup key={field.name}>
            <Label htmlFor={field.name}>
              {field.label}
              <OptionalText>(optional)</OptionalText>
            </Label>
            {field.type === 'select' ? (
              <Select
                id={field.name}
                value={formData[field.name] || ''}
                onChange={(e) => handleInputChange(field.name, e.target.value)}
              >
                <option value="">Select {field.label}</option>
                {field.options?.map((option: string) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </Select>
            ) : (
              <Input
                id={field.name}
                type={field.type}
                placeholder={field.placeholder}
                value={formData[field.name] || ''}
                onChange={(e) => handleInputChange(field.name, e.target.value)}
              />
            )}
          </FormGroup>
        ))}
        
        <SubmitButton type="submit">
          Get Recommendations
        </SubmitButton>
      </FormContainer>
    </CategoryContainer>
  )
}

export default CategoryPage
