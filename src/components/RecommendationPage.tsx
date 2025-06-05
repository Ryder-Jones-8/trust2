import { useLocation, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import styled from 'styled-components'
import type { RecommendationProduct } from '../types'
import type { FormData as CustomFormData } from '../types'

const RecommendationContainer = styled.div`
  min-height: 100vh;
  padding: 2rem;
  background-color: ${props => props.theme.colors.primary};
`

const BackButton = styled.button`
  background: none;
  border: 2px solid ${props => props.theme.colors.text};
  color: ${props => props.theme.colors.text};
  padding: 0.5rem 1rem;
  border-radius: 25px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.3s ease;
  margin-bottom: 2rem;
  
  &:hover {
    background-color: ${props => props.theme.colors.text};
    color: ${props => props.theme.colors.primary};
  }
`

const Header = styled.div`
  text-align: center;
  margin-bottom: 3rem;
`

const Title = styled.h1`
  font-size: 2.5rem;
  font-weight: 300;
  margin-bottom: 0.5rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: ${props => props.theme.colors.text};
  
  @media (max-width: 768px) {
    font-size: 2rem;
  }
`

const Subtitle = styled.p`
  font-size: 1rem;
  color: ${props => props.theme.colors.textSecondary};
  margin-bottom: 1rem;
`

const UserProfile = styled.div`
  background-color: ${props => props.theme.colors.secondary};
  border-radius: 10px;
  padding: 1rem;
  margin: 0 auto 3rem auto;
  max-width: 600px;
  border: 1px solid ${props => props.theme.colors.accent};
`

const ProfileTitle = styled.h3`
  color: ${props => props.theme.colors.text};
  margin-bottom: 0.5rem;
  font-size: 1rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
`

const ProfileDetails = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 0.5rem;
  font-size: 0.9rem;
  color: ${props => props.theme.colors.textSecondary};
`

const RecommendationsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  max-width: 1200px;
  margin: 0 auto;
`

const ProductCard = styled.div`
  background-color: ${props => props.theme.colors.secondary};
  border: 2px solid ${props => props.theme.colors.accent};
  border-radius: 15px;
  padding: 1.5rem;
  transition: all 0.3s ease;
  
  &:hover {
    border-color: ${props => props.theme.colors.text};
    transform: translateY(-5px);
    box-shadow: 0 10px 20px rgba(255, 255, 255, 0.1);
  }
`

const ProductImage = styled.div`
  width: 100%;
  height: 200px;
  background-color: ${props => props.theme.colors.accent};
  border-radius: 10px;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 3rem;
`

const ProductName = styled.h3`
  font-size: 1.2rem;
  color: ${props => props.theme.colors.text};
  margin-bottom: 0.5rem;
  font-weight: 500;
`

const ProductBrand = styled.p`
  font-size: 0.9rem;
  color: ${props => props.theme.colors.textSecondary};
  margin-bottom: 0.5rem;
`

const ProductPrice = styled.p`
  font-size: 1.1rem;
  color: ${props => props.theme.colors.text};
  font-weight: 600;
  margin-bottom: 1rem;
`

const MatchScore = styled.div`
  background-color: ${props => props.theme.colors.text};
  color: ${props => props.theme.colors.primary};
  padding: 0.5rem 1rem;
  border-radius: 20px;
  text-align: center;
  font-weight: 600;
  font-size: 0.9rem;
  margin-bottom: 1rem;
`

const ProductFeatures = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  font-size: 0.85rem;
  color: ${props => props.theme.colors.textSecondary};
  
  li {
    margin-bottom: 0.25rem;
    
    &:before {
      content: "• ";
      color: ${props => props.theme.colors.text};
    }
  }
`

const NewSearchButton = styled.button`
  display: block;
  margin: 3rem auto 0 auto;
  padding: 1rem 2rem;
  background-color: ${props => props.theme.colors.text};
  color: ${props => props.theme.colors.primary};
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background-color: ${props => props.theme.colors.textSecondary};
  }
`

const LoadingSpinner = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
  font-size: 1.2rem;
  color: ${props => props.theme.colors.textSecondary};
`

const ErrorMessage = styled.div`
  background-color: #ff6b6b;
  color: white;
  padding: 1rem;
  border-radius: 8px;
  text-align: center;
  margin: 2rem auto;
  max-width: 500px;
`

// Helper function to get sport icon
const getSportIcon = (sport: string, category: string): string => {
  const icons: { [key: string]: { [key: string]: string } } = {
    surf: {
      boards: '🏄‍♀️',
      wetsuits: '🌊'
    },
    ski: {
      snowboards: '🏂',
      skis: '⛷️',
      boots: '👢',
      'snowboard boots': '🥾',
      'ski boots': '👢',
      helmets: '⛑️',
      goggles: '🥽'
    },
    skate: {
      decks: '🛹',
      trucks: '🔧',
      wheels: '⚙️',
      helmets: '⛑️'
    }
  };
  
  return icons[sport]?.[category] || '🏪';
};

interface LocationState {
  sport: string;
  category: string;
  formData: CustomFormData;
}

const RecommendationPage = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const { sport, category, formData } = (location.state as LocationState) || {}
  
  const [recommendations, setRecommendations] = useState<RecommendationProduct[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (sport && category) {
      fetchRecommendations()
    }
  }, [sport, category, formData])
  const fetchRecommendations = async () => {
    setLoading(true)
    setError(null)
    
    try {
      // Check if we're in a specific shop context
      const shopOwnerData = localStorage.getItem('shopOwner');
      let shopId = null;
      
      if (shopOwnerData) {
        try {
          const shopOwner = JSON.parse(shopOwnerData);
          shopId = shopOwner.id;
        } catch (e) {
          console.error('Error parsing shop owner data:', e);
        }
      }

      const response = await fetch('http://localhost:3001/api/recommendations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sport,
          category,
          formData,
          shopId // Include shopId to filter to this shop's products only
        })
      })

      if (!response.ok) {
        throw new Error('Failed to fetch recommendations')
      }

      const data = await response.json()
      setRecommendations(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load recommendations')
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  const handleBackClick = () => {
    navigate(`/sport/${sport}/category/${category}`)
  }

  const handleNewSearch = () => {
    navigate('/')
  }

  if (!sport || !category || !formData) {
    return (
      <RecommendationContainer>
        <Header>
          <Title>No Data Available</Title>
          <Subtitle>Please start a new search</Subtitle>
        </Header>
        <NewSearchButton onClick={handleNewSearch}>
          Start New Search
        </NewSearchButton>
      </RecommendationContainer>
    )
  }

  return (
    <RecommendationContainer>
      <BackButton onClick={handleBackClick}>
        ← Back to Form
      </BackButton>
      
      <Header>
        <Title>Your Recommendations</Title>
        <Subtitle>Based on your preferences for {sport} {category}</Subtitle>
      </Header>

      <UserProfile>
        <ProfileTitle>Your Profile</ProfileTitle>        <ProfileDetails>
          {Object.entries(formData).map(([key, value]) => (
            <div key={key}>
              <strong>{key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')}:</strong> {String(value)}
            </div>
          ))}
        </ProfileDetails>      </UserProfile>

      {loading && (
        <LoadingSpinner>
          Loading recommendations...
        </LoadingSpinner>
      )}

      {error && (
        <ErrorMessage>
          {error}
        </ErrorMessage>
      )}

      {!loading && !error && recommendations.length > 0 && (
        <RecommendationsGrid>
          {recommendations.map((product: RecommendationProduct) => (
            <ProductCard key={product.id}>
              <ProductImage>
                {product.image ? (
                  <img 
                    src={`http://localhost:3001/uploads/${product.image}`} 
                    alt={product.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '10px' }}
                  />
                ) : (
                  getSportIcon(product.sport, product.category)
                )}
              </ProductImage>
              <MatchScore>{product.score}% Match</MatchScore>
              <ProductName>{product.name}</ProductName>
              <ProductBrand>{product.brand}</ProductBrand>
              <ProductPrice>{formatCurrency(product.price)}</ProductPrice>
              <ProductFeatures>
                {product.matchReasons?.map((reason: string, idx: number) => (
                  <li key={idx}>{reason}</li>
                ))}
                {product.features.slice(0, 3).map((feature: string, idx: number) => (
                  <li key={`feature-${idx}`}>{feature}</li>
                ))}
              </ProductFeatures>
            </ProductCard>
          ))}
        </RecommendationsGrid>
      )}

      {!loading && !error && recommendations.length === 0 && (
        <EmptyState>
          <h3>No products found</h3>
          <p>Sorry, we couldn't find any products matching your criteria. Try adjusting your preferences or check back later!</p>
        </EmptyState>
      )}

      <NewSearchButton onClick={handleNewSearch}>
        Start New Search
      </NewSearchButton>
    </RecommendationContainer>
  )
}

const EmptyState = styled.div`
  text-align: center;
  padding: 3rem;
  color: ${props => props.theme.colors.textSecondary};
  
  h3 {
    color: ${props => props.theme.colors.text};
    margin-bottom: 1rem;
  }
`

export default RecommendationPage

