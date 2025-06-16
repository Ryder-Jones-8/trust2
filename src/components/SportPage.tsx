import { useParams, useNavigate } from 'react-router-dom'
import styled from 'styled-components'

const SportContainer = styled.div`
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

const SportTitle = styled.h1`
  font-size: 3rem;
  font-weight: 300;
  margin: 4rem 0 3rem 0;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: ${props => props.theme.colors.text};
  
  @media (max-width: 768px) {
    font-size: 2.5rem;
    margin: 3rem 0 2rem 0;
  }
`

const CategoriesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 2rem;
  max-width: 800px;
  width: 100%;
`

const CategoryCard = styled.div`
  background-color: ${props => props.theme.colors.secondary};
  border: 2px solid ${props => props.theme.colors.accent};
  border-radius: 15px;
  padding: 2rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    border-color: ${props => props.theme.colors.text};
    transform: translateY(-5px);
    box-shadow: 0 10px 20px rgba(255, 255, 255, 0.1);
  }
`

const CategoryIcon = styled.div`
  font-size: 3rem;
  margin-bottom: 1rem;
`

const CategoryName = styled.h3`
  font-size: 1.2rem;
  font-weight: 400;
  color: ${props => props.theme.colors.text};
  text-transform: uppercase;
  letter-spacing: 0.05em;
`

const sportDisplayNames = {
  surf: 'Surfing',
  ski: 'Skiing/Snowboarding', 
  skate: 'Skateboarding'
}

const categoryDisplayNames: { [key: string]: string } = {
  'boards': 'Boards',
  'wetsuits': 'Wetsuits', 
  'fins': 'Fins',
  'snowboards': 'Snowboards',
  'skis': 'Skis',
  'snowboard boots': 'Snowboard Boots',
  'ski boots': 'Ski Boots',
  'helmets': 'Helmets',
  'goggles': 'Goggles',
  'decks': 'Decks',
  'trucks': 'Trucks',
  'wheels': 'Wheels'
}

const sportCategories = {
  surf: [
    { name: 'boards', icon: '🏄‍♀️' },
    { name: 'wetsuits', icon: '🌊' },
    { name: 'fins', icon: '🔱' }
  ],
  ski: [
    { name: 'snowboards', icon: '🏂' },
    { name: 'skis', icon: '⛷️' },
    { name: 'snowboard boots', icon: '🥾' },
    { name: 'ski boots', icon: '🎿' },
    { name: 'helmets', icon: '🪖' },
    { name: 'goggles', icon: '🥽' }
  ],
  snow: [
    { name: 'Snowboards', icon: '🏂' },
    { name: 'Skis', icon: '⛷️' },
    { name: 'Snowboard Boots', icon: '🥾' },
    { name: 'Ski Boots', icon: '🎿' },
    { name: 'Helmets', icon: '🪖' },
    { name: 'Goggles', icon: '🥽' }
  ],
  skate: [
    { name: 'decks', icon: '🛹' },
    { name: 'trucks', icon: '🔧' },
    { name: 'wheels', icon: '⚙️' },
    { name: 'helmets', icon: '🪖' }
  ]
}

const SportPage = () => {
  const { sport } = useParams<{ sport: string }>()
  const navigate = useNavigate()

  const categories = sport ? sportCategories[sport as keyof typeof sportCategories] : []

  const handleCategoryClick = (category: string) => {
    navigate(`/sport/${sport}/category/${category.toLowerCase()}`)
  }

  const handleBackClick = () => {
    navigate('/')
  }

  return (
    <SportContainer>
      <BackButton onClick={handleBackClick}>
        ← Back to Home
      </BackButton>
      
      <SportTitle>{sportDisplayNames[sport as keyof typeof sportDisplayNames]}</SportTitle>
      
      <CategoriesGrid>
        {categories.map((category) => (
          <CategoryCard 
            key={category.name}
            onClick={() => handleCategoryClick(category.name)}
          >
            <CategoryIcon>{category.icon}</CategoryIcon>
            <CategoryName>{categoryDisplayNames[category.name] || category.name}</CategoryName>
          </CategoryCard>
        ))}
      </CategoriesGrid>
    </SportContainer>
  )
}

export default SportPage
