import { useLocation, useNavigate } from 'react-router-dom'
import { useState, useEffect, useCallback } from 'react'
import styled from 'styled-components'
import type { RecommendationProduct } from '../types'
import type { FormData as CustomFormData } from '../types'
import { API_BASE_URL } from '../apiConfig'

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

const MatchScore = styled.div<{ scoreValue: number }>`
  background-color: ${props => 
    props.scoreValue >= 85 ? '#4ade80' : // green for high scores
    props.scoreValue >= 70 ? '#facc15' : // yellow for medium scores  
    '#f87171' // red for lower scores
  };
  color: ${props => props.theme.colors.primary};
  padding: 0.5rem 1rem;
  border-radius: 20px;
  text-align: center;
  font-weight: 600;
  font-size: 0.9rem;
  margin-bottom: 1rem;
`

const MatchReasons = styled.div`
  background-color: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  padding: 0.75rem;
  margin-bottom: 1rem;
  border-left: 3px solid ${props => props.theme.colors.text};
`

const MatchReasonsTitle = styled.div`
  font-size: 0.8rem;
  font-weight: 600;
  color: ${props => props.theme.colors.text};
  margin-bottom: 0.5rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`

const MatchReason = styled.div`
  font-size: 0.85rem;
  color: ${props => props.theme.colors.textSecondary};
  margin-bottom: 0.4rem;
  line-height: 1.3;
  
  &:before {
    content: "✓ ";
    color: ${props => props.theme.colors.text};
    font-weight: bold;
  }
  
  &:last-child {
    margin-bottom: 0;
  }
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

const FeaturesTitle = styled.div`
  font-size: 0.8rem;
  font-weight: 600;
  color: ${props => props.theme.colors.textSecondary};
  margin-bottom: 0.5rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
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

const EducationalSection = styled.div`
  background-color: ${props => props.theme.colors.secondary};
  border-radius: 15px;
  padding: 2rem;
  margin: 0 auto 3rem auto;
  max-width: 1200px;
  border: 1px solid ${props => props.theme.colors.accent};
`

const EducationalTitle = styled.h2`
  color: ${props => props.theme.colors.text};
  font-size: 1.5rem;
  font-weight: 400;
  margin-bottom: 1.5rem;
  text-align: center;
  text-transform: uppercase;
  letter-spacing: 0.1em;
`

const GuideGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
  margin-bottom: 1.5rem;
`

const GuideCard = styled.div`
  background-color: rgba(255, 255, 255, 0.05);
  border-radius: 10px;
  padding: 1.5rem;
  border-left: 4px solid ${props => props.theme.colors.text};
`

const GuideCardTitle = styled.h3`
  color: ${props => props.theme.colors.text};
  font-size: 1.1rem;
  font-weight: 500;
  margin-bottom: 0.75rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`

const GuideCardContent = styled.div`
  color: ${props => props.theme.colors.textSecondary};
  font-size: 0.9rem;
  line-height: 1.5;
  
  ul {
    margin: 0.5rem 0;
    padding-left: 1rem;
  }
  
  li {
    margin-bottom: 0.25rem;
  }
  
  strong {
    color: ${props => props.theme.colors.text};
  }
`

const TipsBanner = styled.div`
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%);
  border-radius: 10px;
  padding: 1rem;
  text-align: center;
  border: 1px solid rgba(255, 255, 255, 0.1);
`

const TipsText = styled.p`
  color: ${props => props.theme.colors.textSecondary};
  font-size: 0.9rem;
  margin: 0;
  
  strong {
    color: ${props => props.theme.colors.text};
  }
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
      'ski boots': '🎿',
      helmets: '🪖',
      goggles: '🥽'
    },
    skate: {
      decks: '🛹',
      trucks: '🔧',
      wheels: '⚙️',
      helmets: '🪖'
    }
  };
  
  return icons[sport]?.[category] || '🏪';
};

interface LocationState {
  sport: string;
  category: string;
  formData: CustomFormData;
}

interface GuideContent {
  title: string;
  content: React.ReactElement;
}

interface EducationalContentData {
  title: string;
  guides: GuideContent[];
  tip: string;
}

const RecommendationPage = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const { sport, category, formData } = (location.state as LocationState) || {}
  
  const [recommendations, setRecommendations] = useState<RecommendationProduct[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchRecommendations = useCallback(async () => {
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

      const response = await fetch(`${API_BASE_URL}/api/recommendations`, {
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
  }, [sport, category, formData])

  useEffect(() => {
    if (sport && category) {
      fetchRecommendations()
    }
  }, [sport, category, fetchRecommendations])

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
                    src={`${API_BASE_URL}/uploads/${product.image}`}
                    alt={product.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '10px' }}
                  />
                ) : (
                  getSportIcon(product.sport, product.category)
                )}
              </ProductImage>
              <MatchScore 
                scoreValue={product.score}
              >
                {product.score}% Match
              </MatchScore>
              <ProductName>{product.name}</ProductName>
              <ProductBrand>{product.brand}</ProductBrand>
              <ProductPrice>{formatCurrency(product.price)}</ProductPrice>
              
              {product.matchReasons && product.matchReasons.length > 0 && (
                <MatchReasons>
                  <MatchReasonsTitle>Why this matches:</MatchReasonsTitle>
                  {product.matchReasons.map((reason: string, idx: number) => (
                    <MatchReason key={idx}>{reason}</MatchReason>
                  ))}
                </MatchReasons>
              )}
              
              {product.features && product.features.length > 0 && (
                <ProductFeatures>
                  <FeaturesTitle>Key features:</FeaturesTitle>
                  {product.features.slice(0, 3).map((feature: string, idx: number) => (
                    <li key={`feature-${idx}`}>{feature}</li>
                  ))}
                </ProductFeatures>
              )}
            </ProductCard>
          ))}
        </RecommendationsGrid>
      )}

      {!loading && !error && recommendations.length === 0 && (
        <EmptyState>
          <h3>No products available</h3>
          <p>There are currently no products in stock for this category. Our system shows both perfect matches and close alternatives, so please check back later or try a different category!</p>
        </EmptyState>
      )}

      {getEducationalContent(sport, category, formData) && (
        <EducationalSection>
          <EducationalTitle>{getEducationalContent(sport, category, formData)?.title}</EducationalTitle>

          <GuideGrid>
            {getEducationalContent(sport, category, formData)?.guides.map((guide: GuideContent, idx: number) => (
              <GuideCard key={idx}>
                <GuideCardTitle>
                  {guide.title}
                </GuideCardTitle>
                <GuideCardContent>
                  {guide.content}
                </GuideCardContent>
              </GuideCard>
            ))}
          </GuideGrid>

          <TipsBanner>
            <TipsText>
              <strong>{getEducationalContent(sport, category, formData)?.tip}</strong>
            </TipsText>
          </TipsBanner>
        </EducationalSection>
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

const getEducationalContent = (sport: string, category: string, formData: CustomFormData): EducationalContentData | null => {
  const content = {
    ski: {
      snowboards: {
        title: "🎿 What to Look for in a Snowboard",
        guides: [
          {
            title: "📏 Board Length",
            content: (
              <div>
                <p><strong>Your ideal length:</strong> Based on your height ({formData.height}), weight ({formData.weight}), and {String(formData.experience)?.toLowerCase()} experience level.</p>
                <ul>
                  <li><strong>Shorter boards (chin to nose height):</strong> Easier to turn, better for beginners and freestyle</li>
                  <li><strong>Longer boards (nose to forehead height):</strong> More stable at speed, better float in powder</li>
                  <li><strong>Your style ({formData.ridingStyle}):</strong> Influences the optimal length within your range</li>
                </ul>
                <div style={{backgroundColor: 'rgba(255, 255, 255, 0.1)', padding: '0.75rem', borderRadius: '5px', marginTop: '0.5rem'}}>
                  <strong>📐 Quick Sizing Guide:</strong>
                  <ul style={{margin: '0.25rem 0'}}>
                    <li><strong>5'0" - 5'2":</strong> 142-147cm</li>
                    <li><strong>5'2" - 5'4":</strong> 144-149cm</li>
                    <li><strong>5'4" - 5'6":</strong> 146-151cm</li>
                    <li><strong>5'6" - 5'8":</strong> 148-153cm</li>
                    <li><strong>5'8" - 5'10":</strong> 150-155cm</li>
                    <li><strong>5'10" - 6'0":</strong> 152-157cm</li>
                    <li><strong>6'0" - 6'2":</strong> 154-159cm</li>
                    <li><strong>6'2" - 6'4":</strong> 156-162cm</li>
                  </ul>
                  <p style={{margin: '0.25rem 0', fontSize: '0.85em', fontStyle: 'italic'}}>
                    💡 <strong>Freestyle:</strong> Go 5-8cm shorter | <strong>Freeride:</strong> Go 3-5cm longer
                  </p>
                </div>
              </div>
            )
          },
          {
            title: "💪 Board Flex",
            content: (
              <div>
                <p><strong>Flex affects how the board feels and performs:</strong></p>
                <ul>
                  <li><strong>Soft flex (1-4):</strong> Forgiving, great for beginners and park riding</li>
                  <li><strong>Medium flex (5-7):</strong> Versatile, works for most riding styles</li>
                  <li><strong>Stiff flex (8-10):</strong> Responsive, better for advanced riders and high speeds</li>
                </ul>
                <p>For {String(formData.experience)?.toLowerCase()} riders like you, consider medium to {formData.experience === 'Beginner' ? 'soft' : formData.experience === 'Advanced' || formData.experience === 'Expert' ? 'stiff' : 'medium'} flex.</p>
              </div>
            )
          },
          {
            title: "🎯 Board Shape",
            content: (
              <div>
                <p><strong>Different shapes for different styles:</strong></p>
                <ul>
                  <li><strong>Directional:</strong> Longer nose, great for all-mountain and freeride</li>
                  <li><strong>Twin:</strong> Symmetrical, perfect for freestyle and park</li>
                  <li><strong>Directional Twin:</strong> Slight directional bias, versatile for most riding</li>
                </ul>
                <p>Your {formData.ridingStyle} preference suggests a {formData.ridingStyle === 'Freestyle' ? 'twin' : formData.ridingStyle === 'Freeride' ? 'directional' : 'directional twin'} shape would work well.</p>
              </div>
            )
          }
        ],
        tip: "💡 Pro Tip: A board that's slightly shorter than recommended is easier to learn on, while a longer board provides more stability at higher speeds."
      },
      skis: {
        title: "⛷️ What to Look for in Skis",
        guides: [
          {
            title: "📏 Ski Length",
            content: (
              <div>
                <p><strong>Your ideal length:</strong> Based on your height ({formData.height}), weight ({formData.weight}), and skiing ability.</p>
                <ul>
                  <li><strong>Shorter skis (chin to nose):</strong> Easier to turn, more maneuverable</li>
                  <li><strong>Longer skis (forehead to top of head):</strong> More stable, better for speed and powder</li>
                  <li><strong>All-mountain skis:</strong> Typically nose to forehead height</li>
                </ul>
              </div>
            )
          },
          {
            title: "📐 Ski Width (Waist)",
            content: (
              <div>
                <p><strong>Waist width affects performance:</strong></p>
                <ul>
                  <li><strong>Narrow (70-85mm):</strong> Quick edge-to-edge, great for groomed runs</li>
                  <li><strong>Medium (85-105mm):</strong> Versatile all-mountain performance</li>
                  <li><strong>Wide (105mm+):</strong> Better float in powder, slower on groomers</li>
                </ul>
              </div>
            )
          },
          {
            title: "🎯 Ski Type",
            content: (
              <div>
                <p><strong>Choose based on where you ski:</strong></p>
                <ul>
                  <li><strong>All-Mountain:</strong> Versatile for any terrain</li>
                  <li><strong>Carving:</strong> Precise turns on groomed runs</li>
                  <li><strong>Powder:</strong> Wide skis for deep snow</li>
                  <li><strong>Racing:</strong> Stiff and precise for high speeds</li>
                </ul>
              </div>
            )
          }
        ],
        tip: "💡 Pro Tip: Beginners should prioritize ease of turning over stability - choose skis on the shorter end of your range."
      },
      'snowboard boots': {
        title: "🥾 What to Look for in Snowboard Boots",
        guides: [
          {
            title: "👣 Fit & Sizing",
            content: (
              <div>
                <p><strong>Proper fit is everything:</strong> Based on your foot length ({formData.footLength}) and width ({formData.footWidth}).</p>
                <ul>
                  <li><strong>Length:</strong> Toes should barely touch the front when standing</li>
                  <li><strong>Width:</strong> Snug but not pinching on the sides</li>
                  <li><strong>Heel hold:</strong> No lifting when flexing forward</li>
                  <li><strong>Volume:</strong> Match your foot's {formData.volume} needs</li>
                </ul>
              </div>
            )
          },
          {
            title: "💪 Flex & Response",
            content: (
              <div>
                <p><strong>Flex affects your riding:</strong></p>
                <ul>
                  <li><strong>Soft (3-5):</strong> Forgiving, easy turn initiation, park riding</li>
                  <li><strong>Medium (5-7):</strong> Versatile, all-mountain performance</li>
                  <li><strong>Stiff (7-9):</strong> Responsive, aggressive riding, racing</li>
                  <li><strong>Very Stiff (9-10):</strong> Competition level, expert riders</li>
                </ul>
                <p>For {formData.experience} {formData.ridingStyle} riding, consider {formData.experience === 'Beginner' ? 'soft to medium' : formData.experience === 'Advanced' ? 'medium to stiff' : 'medium'} flex.</p>
              </div>
            )
          },
          {
            title: "🔗 Lacing Systems",
            content: (
              <div>
                <p><strong>Choose your closure system:</strong></p>
                <ul>
                  <li><strong>Traditional Laces:</strong> Customizable, reliable, budget-friendly</li>
                  <li><strong>BOA System:</strong> Quick, even pressure, easy with gloves</li>
                  <li><strong>Speed Lacing:</strong> Fast, good power transfer</li>
                  <li><strong>Hybrid:</strong> Combines multiple systems for best of both</li>
                </ul>
                <p>Your {formData.lacingSystem} preference offers the right balance for your needs.</p>
              </div>
            )
          }
        ],
        tip: "💡 Pro Tip: Boots pack out (get bigger) over time, so choose a snug fit initially - they'll mold to your feet perfectly."
      },
      'ski boots': {
        title: "👢 What to Look for in Ski Boots",
        guides: [
          {
            title: "📏 Sizing & Last Width",
            content: (
              <div>
                <p><strong>Critical measurements:</strong> Foot length ({formData.footLength}) and width ({formData.footWidth}).</p>
                <ul>
                  <li><strong>Mondo sizing:</strong> Length in centimeters (most accurate)</li>
                  <li><strong>Last width:</strong> The boot's internal width</li>
                  <li><strong>Narrow:</strong> 98-100mm last width</li>
                  <li><strong>Medium:</strong> 100-102mm last width</li>
                  <li><strong>Wide:</strong> 102-106mm last width</li>
                </ul>
                <p>Your {formData.footWidth} feet need a {formData.footWidth === 'Narrow' ? '98-100mm' : formData.footWidth === 'Wide' ? '102-106mm' : '100-102mm'} last width.</p>
              </div>
            )
          },
          {
            title: "⚡ Flex Rating",
            content: (
              <div>
                <p><strong>Flex determines responsiveness:</strong></p>
                <ul>
                  <li><strong>Soft (60-80):</strong> Forgiving, comfortable, beginner-friendly</li>
                  <li><strong>Medium (80-100):</strong> Versatile, progressive, intermediate</li>
                  <li><strong>Stiff (100-120):</strong> Responsive, performance-oriented</li>
                  <li><strong>Very Stiff (120-140):</strong> Racing, expert level</li>
                  <li><strong>Race (140+):</strong> Competition, maximum precision</li>
                </ul>
                <p>For {formData.experience} {formData.skiType} skiing, {formData.flex} flex is ideal.</p>
              </div>
            )
          },
          {
            title: "🎿 Features & Technology",
            content: (
              <div>
                <p><strong>Modern ski boot features:</strong></p>
                <ul>
                  <li><strong>Heat moldable liners:</strong> Custom fit to your foot shape</li>
                  <li><strong>Micro-adjustable buckles:</strong> Precise fit adjustments</li>
                  <li><strong>Cuff adjustment:</strong> Forward lean and lateral canting</li>
                  <li><strong>Walk mode:</strong> For touring and easier walking</li>
                </ul>
              </div>
            )
          }
        ],
        tip: "💡 Pro Tip: Get your boots fitted by a professional - proper fitting can make the difference between a great day and a miserable one on the mountain."
      },
      helmets: {
        title: "⛑️ What to Look for in a Ski/Snowboard Helmet",
        guides: [
          {
            title: "📐 Size & Fit",
            content: (
              <div>
                <p><strong>Measure your head circumference:</strong> {formData.headCircumference} inches determines your size.</p>
                <ul>
                  <li><strong>Small:</strong> 20.5-21.75 inches (52-55cm)</li>
                  <li><strong>Medium:</strong> 21.75-23 inches (55-59cm)</li>
                  <li><strong>Large:</strong> 23-24.5 inches (59-62cm)</li>
                  <li><strong>X-Large:</strong> 24.5+ inches (62cm+)</li>
                </ul>
                <p>Helmet should sit level on your head, not tilted back or forward.</p>
              </div>
            )
          },
          {
            title: "❄️ Ventilation & Comfort",
            content: (
              <div>
                <p><strong>Stay comfortable all day:</strong></p>
                <ul>
                  <li><strong>Adjustable vents:</strong> Control airflow for temperature</li>
                  <li><strong>Moisture-wicking liner:</strong> Keeps head dry</li>
                  <li><strong>Dial fit system:</strong> Fine-tune fit on the mountain</li>
                  <li><strong>Goggle compatibility:</strong> Seamless integration with your goggles</li>
                </ul>
                <p>For {formData.activity}, prioritize {formData.activity === 'Freestyle' ? 'lightweight protection with good venting' : formData.activity === 'Backcountry' ? 'ventilation and compatibility with other gear' : 'all-around comfort and protection'}.</p>
              </div>
            )
          },
          {
            title: "🛡️ Safety & Certification",
            content: (
              <div>
                <p><strong>Protection standards:</strong></p>
                <ul>
                  <li><strong>MIPS technology:</strong> Multi-directional impact protection</li>
                  <li><strong>CE EN 1077:</strong> European safety standard</li>
                  <li><strong>ASTM F2040:</strong> American safety standard</li>
                  <li><strong>Construction:</strong> In-mold vs hard shell</li>
                </ul>
                <p>Your {formData.features} requirements suggest looking for {String(formData.features)?.includes('Basic') ? 'certified protection with good value' : 'advanced features and premium protection'}.</p>
              </div>
            )
          }
        ],
        tip: "💡 Pro Tip: Replace your helmet after any significant impact, even if there's no visible damage - the protective foam compresses and loses effectiveness."
      },
      goggles: {
        title: "🥽 What to Look for in Ski/Snowboard Goggles",
        guides: [
          {
            title: "👀 Fit & Face Shape",
            content: (
              <div>
                <p><strong>Match your face size ({formData.faceSize}) and shape:</strong></p>
                <ul>
                  <li><strong>Small:</strong> Narrow faces, smaller features</li>
                  <li><strong>Medium:</strong> Average face width and height</li>
                  <li><strong>Large:</strong> Wider faces, larger features</li>
                  <li><strong>Fit types:</strong> Asian fit (flatter bridge), Wide fit (broader faces)</li>
                </ul>
                <p>Your {formData.fitType} facial structure needs {formData.fitType === 'Asian fit' ? 'goggles with a lower nose bridge' : formData.fitType === 'Wide fit' ? 'goggles with a wider frame' : 'standard fit goggles'}.</p>
              </div>
            )
          },
          {
            title: "🌤️ Lens Technology",
            content: (
              <div>
                <p><strong>Choose lens for your conditions:</strong></p>
                <ul>
                  <li><strong>Clear/Low light:</strong> Stormy days, night skiing (85-95% VLT)</li>
                  <li><strong>All conditions:</strong> Variable light, overcast (15-60% VLT)</li>
                  <li><strong>Sunny conditions:</strong> Bright days, high UV (5-20% VLT)</li>
                  <li><strong>Interchangeable:</strong> Multiple lenses for any condition</li>
                </ul>
                <p>Your {formData.lensType} preference is perfect for the conditions you'll face most often.</p>
              </div>
            )
          },
          {
            title: "💨 Anti-Fog & Features",
            content: (
              <div>
                <p><strong>Stay fog-free all day:</strong></p>
                <ul>
                  <li><strong>Double lens:</strong> Thermal barrier prevents fogging</li>
                  <li><strong>Anti-fog coating:</strong> Chemical treatment on inner lens</li>
                  <li><strong>Ventilation:</strong> Strategic vents for airflow</li>
                  <li><strong>Helmet integration:</strong> Seamless fit with your helmet</li>
                </ul>
              </div>
            )
          }
        ],
        tip: "💡 Pro Tip: Never wipe the inside of your goggles - it removes the anti-fog coating. Instead, let them air dry or gently shake off moisture."
      }
    },
    surf: {
      boards: {
        title: "🏄‍♀️ What to Look for in a Surfboard",
        guides: [
          {
            title: "📏 Board Length & Volume",
            content: (
              <div>
                <p><strong>Your size matters:</strong> Height ({formData.height}), weight ({formData.weight}), and experience level determine ideal dimensions.</p>
                <ul>
                  <li><strong>Beginners:</strong> Longer, wider boards with more volume for stability</li>
                  <li><strong>Intermediate:</strong> Moderate length, balanced volume for progression</li>
                  <li><strong>Advanced:</strong> Shorter, lower volume boards for performance</li>
                </ul>
                <div style={{backgroundColor: 'rgba(255, 255, 255, 0.1)', padding: '0.75rem', borderRadius: '5px', marginTop: '0.5rem'}}>
                  <strong>🏄‍♀️ Length by Experience & Weight:</strong>
                  <ul style={{margin: '0.25rem 0'}}>
                    <li><strong>Beginner (120-150 lbs):</strong> 8'6" - 9'6" longboard</li>
                    <li><strong>Beginner (150-180 lbs):</strong> 9'0" - 10'0" longboard</li>
                    <li><strong>Intermediate (120-150 lbs):</strong> 7'6" - 8'6" funboard</li>
                    <li><strong>Intermediate (150-180 lbs):</strong> 8'0" - 9'0" funboard</li>
                    <li><strong>Advanced (120-150 lbs):</strong> 5'8" - 6'4" shortboard</li>
                    <li><strong>Advanced (150-180 lbs):</strong> 6'0" - 6'8" shortboard</li>
                  </ul>
                  <p style={{margin: '0.25rem 0', fontSize: '0.85em', fontStyle: 'italic'}}>
                    💡 <strong>Volume rule:</strong> Beginner = 100% of body weight in liters, Advanced = 30-35%
                  </p>
                </div>
              </div>
            )
          },
          {
            title: "🌊 Board Type",
            content: (
              <div>
                <p><strong>Different boards for different waves:</strong></p>
                <ul>
                  <li><strong>Longboard (8-10ft):</strong> Stable, great for small waves and beginners</li>
                  <li><strong>Funboard (7-8.5ft):</strong> Good progression board, versatile</li>
                  <li><strong>Shortboard (5.5-7ft):</strong> High performance, requires experience</li>
                </ul>
                <p>For {formData.waveConditions}, a {String(formData.waveConditions)?.includes('Small') ? 'longboard or funboard' : String(formData.waveConditions)?.includes('Large') ? 'shortboard or gun' : 'versatile all-around board'} would be ideal.</p>
              </div>
            )
          },
          {
            title: "🎯 Tail Shape",
            content: (
              <div>
                <p><strong>Tail affects performance:</strong></p>
                <ul>
                  <li><strong>Square tail:</strong> Maximum planing surface, good for small waves</li>
                  <li><strong>Round tail:</strong> Smooth turns, forgiving</li>
                  <li><strong>Pin tail:</strong> Hold in larger waves, less maneuverable</li>
                </ul>
              </div>
            )
          }
        ],
        tip: "💡 Pro Tip: When in doubt, choose a board with more volume rather than less - it's easier to surf a board that's slightly too big than too small."
      },
      wetsuits: {
        title: "🌊 What to Look for in a Wetsuit",
        guides: [
          {
            title: "📏 Size & Fit",
            content: (
              <div>
                <p><strong>Perfect fit is crucial:</strong> Height ({formData.height}), weight ({formData.weight}), and chest size ({formData.chestSize}) determine your size.</p>
                <ul>
                  <li><strong>Snug but not restrictive:</strong> Should feel like a second skin</li>
                  <li><strong>No gaps:</strong> Especially at neck, wrists, and ankles</li>
                  <li><strong>Full range of motion:</strong> Test arm and leg movement</li>
                </ul>
              </div>
            )
          },
          {
            title: "🌡️ Thickness for Water Temperature",
            content: (
              <div>
                <p><strong>Choose thickness based on your water conditions:</strong></p>
                <ul>
                  <li><strong>2mm:</strong> 70°F+ warm water, summer use</li>
                  <li><strong>3/2mm:</strong> 60-70°F spring/fall conditions</li>
                  <li><strong>4/3mm:</strong> 50-60°F winter surfing</li>
                  <li><strong>5/4mm:</strong> 45-55°F cold water conditions</li>
                  <li><strong>6/5mm+:</strong> Below 45°F extreme cold</li>
                </ul>
                <p>For {formData.waterTemp} water, a {String(formData.waterTemp)?.includes('Warm') ? '2mm' : String(formData.waterTemp)?.includes('Moderate') ? '3/2mm' : String(formData.waterTemp)?.includes('Cool') ? '4/3mm' : '5/4mm+'} thickness is ideal.</p>
              </div>
            )
          },
          {
            title: "🧵 Construction & Features",
            content: (
              <div>
                <p><strong>Key construction details:</strong></p>
                <ul>
                  <li><strong>Seam construction:</strong> Flatlock (budget), GBS (better), Sealed/Taped (best)</li>
                  <li><strong>Neoprene quality:</strong> Limestone vs petroleum-based</li>
                  <li><strong>Zip placement:</strong> Back zip (traditional), chest zip (warmer), zipless (warmest)</li>
                  <li><strong>Knee pads:</strong> Essential for durability</li>
                </ul>
              </div>
            )
          }
        ],
        tip: "💡 Pro Tip: Try on wetsuits in the afternoon when your body is slightly larger - this ensures the perfect fit for all-day sessions."
      },
      fins: {
        title: "🔱 What to Look for in Surfboard Fins",
        guides: [
          {
            title: "📐 Fin Setup & Configuration",
            content: (
              <div>
                <p><strong>Choose setup based on your board ({formData.boardType}) and style:</strong></p>
                <ul>
                  <li><strong>Single Fin:</strong> Classic longboard feel, smooth turns</li>
                  <li><strong>Twin Fin:</strong> Loose, skatey feel, great for smaller waves</li>
                  <li><strong>Thruster (3-fin):</strong> Most popular, balanced performance</li>
                  <li><strong>Quad (4-fin):</strong> Speed and drive, less drag</li>
                  <li><strong>2+1:</strong> Versatile longboard option</li>
                </ul>
                <p>Your {formData.finSetup} preference matches your {formData.surfStyle} style perfectly.</p>
              </div>
            )
          },
          {
            title: "📏 Fin Size & Template",
            content: (
              <div>
                <p><strong>Size affects performance:</strong></p>
                <ul>
                  <li><strong>Larger fins:</strong> More hold, stability, better for bigger waves</li>
                  <li><strong>Smaller fins:</strong> More release, maneuverability, better for smaller waves</li>
                  <li><strong>Rake (swept back):</strong> Smoother turns, more drive</li>
                  <li><strong>Upright:</strong> Quicker turns, more responsive</li>
                </ul>
                <p>For {formData.waveType}, consider {String(formData.waveType)?.includes('Small') ? 'smaller, more upright fins' : String(formData.waveType)?.includes('Powerful') ? 'larger fins with more rake' : 'medium-sized, versatile fins'}.</p>
              </div>
            )
          },
          {
            title: "🪵 Materials & Construction",
            content: (
              <div>
                <p><strong>Material affects feel and performance:</strong></p>
                <ul>
                  <li><strong>Fiberglass:</strong> Stiff, responsive, traditional feel</li>
                  <li><strong>Plastic:</strong> Flexible, forgiving, great for beginners</li>
                  <li><strong>Carbon Fiber:</strong> Ultra-responsive, high performance</li>
                  <li><strong>Bamboo:</strong> Eco-friendly, good flex characteristics</li>
                </ul>
                <p>Your {formData.finMaterial} preference aligns with your {formData.experience} level.</p>
              </div>
            )
          }
        ],
        tip: "💡 Pro Tip: Start with plastic fins if you're learning - they're safer and more forgiving, plus they won't break the bank if you lose one."
      }
    },
    skate: {
      decks: {
        title: "🛹 What to Look for in a Skateboard Deck",
        guides: [
          {
            title: "📏 Deck Width",
            content: (
              <div>
                <p><strong>Width affects control and comfort:</strong></p>
                <ul>
                  <li><strong>7.5" - 8.0":</strong> Street skating, technical tricks</li>
                  <li><strong>8.0" - 8.5":</strong> Versatile, good for most skating</li>
                  <li><strong>8.5" +:</strong> Vert, pools, larger riders</li>
                </ul>
                <div style={{backgroundColor: 'rgba(255, 255, 255, 0.1)', padding: '0.75rem', borderRadius: '5px', marginTop: '0.5rem'}}>
                  <strong>👟 Width by Shoe Size:</strong>
                  <ul style={{margin: '0.25rem 0'}}>
                    <li><strong>Size 6.5-7.5:</strong> 7.5" deck width</li>
                    <li><strong>Size 8-9:</strong> 7.75" deck width</li>
                    <li><strong>Size 9-10.5:</strong> 8.0" deck width</li>
                    <li><strong>Size 10.5-12:</strong> 8.25" deck width</li>
                    <li><strong>Size 12+:</strong> 8.5" deck width</li>
                  </ul>
                  <p style={{margin: '0.25rem 0', fontSize: '0.85em', fontStyle: 'italic'}}>
                    💡 <strong>Style adjustment:</strong> Street = -0.25", Vert = +0.25", Cruising = +0.5"
                  </p>
                </div>
              </div>
            )
          },
          {
            title: "🎯 Deck Shape",
            content: (
              <div>
                <p><strong>Shape affects performance:</strong></p>
                <ul>
                  <li><strong>Popsicle:</strong> Standard street shape, symmetrical</li>
                  <li><strong>Cruiser:</strong> Wider, more stable for transportation</li>
                  <li><strong>Old School:</strong> Wider nose, retro style</li>
                </ul>
              </div>
            )
          },
          {
            title: "🪵 Construction",
            content: (
              <div>
                <p><strong>Materials and build quality:</strong></p>
                <ul>
                  <li><strong>7-ply maple:</strong> Standard, durable construction</li>
                  <li><strong>Bamboo/composite:</strong> Lighter, more flex</li>
                  <li><strong>Carbon fiber:</strong> Ultra-light, premium option</li>
                </ul>
              </div>
            )
          }
        ],
        tip: "💡 Pro Tip: Start with a standard 8.0\" popsicle deck if you're unsure - it's the most versatile size for learning."
      },
      trucks: {
        title: "🔧 What to Look for in Skateboard Trucks",
        guides: [
          {
            title: "📏 Truck Width & Sizing",
            content: (
              <div>
                <p><strong>Match your deck width ({formData.deckWidth}):</strong></p>
                <ul>
                  <li><strong>Truck width should match deck width:</strong> Axle should align with deck edges</li>
                  <li><strong>Too narrow:</strong> Unstable, poor performance</li>
                  <li><strong>Too wide:</strong> Awkward foot placement, harder to flip</li>
                  <li><strong>Hanger measurement:</strong> The actual width specification</li>
                </ul>
                <p>For your {formData.deckWidth} deck, choose trucks with matching hanger width.</p>
              </div>
            )
          },
          {
            title: "⛰️ Truck Height",
            content: (
              <div>
                <p><strong>Height affects your ride:</strong></p>
                <ul>
                  <li><strong>Low trucks:</strong> More stable, better for street skating and technical tricks</li>
                  <li><strong>Mid trucks:</strong> Balanced performance, versatile for most skating</li>
                  <li><strong>High trucks:</strong> More clearance, better for larger wheels and cruising</li>
                </ul>
                <p>Your {formData.ridingStyle} style works best with {formData.ridingStyle === 'Street' ? 'low to mid' : formData.ridingStyle === 'Vert' ? 'mid to high' : formData.ridingStyle === 'Cruising' ? 'high' : 'mid'} height trucks.</p>
              </div>
            )
          },
          {
            title: "🔩 Construction & Materials",
            content: (
              <div>
                <p><strong>Quality and durability matter:</strong></p>
                <ul>
                  <li><strong>Aluminum construction:</strong> Lightweight, strong, standard choice</li>
                  <li><strong>Steel axles:</strong> Durable, long-lasting</li>
                  <li><strong>Kingpin angle:</strong> Affects turning characteristics</li>
                  <li><strong>Baseplate:</strong> Mounting angle and strength</li>
                </ul>
              </div>
            )
          }
        ],
        tip: "💡 Pro Tip: Quality trucks last for years - invest in good ones from established brands like Independent, Thunder, or Venture."
      },
      wheels: {
        title: "⚙️ What to Look for in Skateboard Wheels",
        guides: [
          {
            title: "📐 Wheel Size & Diameter",
            content: (
              <div>
                <p><strong>Size affects performance:</strong></p>
                <ul>
                  <li><strong>50-53mm:</strong> Street skating, flip tricks, technical riding</li>
                  <li><strong>54-58mm:</strong> All-around skating, good balance</li>
                  <li><strong>59mm+:</strong> Cruising, transportation, rough surfaces</li>
                </ul>
                <p>Your {formData.ridingStyle} preference suggests {formData.wheelSize} wheels for optimal performance.</p>
              </div>
            )
          },
          {
            title: "🏗️ Durometer (Hardness)",
            content: (
              <div>
                <p><strong>Hardness affects ride quality:</strong></p>
                <ul>
                  <li><strong>78A-87A:</strong> Soft, smooth ride, good for cruising and rough surfaces</li>
                  <li><strong>88A-95A:</strong> Medium, versatile for street and park</li>
                  <li><strong>96A-101A:</strong> Hard, sliding and tricks, smooth surfaces only</li>
                  <li><strong>101A+:</strong> Very hard, advanced technical skating</li>
                </ul>
                <p>For {formData.surface}, consider {String(formData.surface)?.includes('Rough') ? 'softer wheels (78A-87A)' : String(formData.surface)?.includes('Smooth') ? 'harder wheels (96A+)' : 'medium durometer wheels (88A-95A)'}.</p>
              </div>
            )
          },
          {
            title: "🎯 Shape & Contact Patch",
            content: (
              <div>
                <p><strong>Wheel shape affects performance:</strong></p>
                <ul>
                  <li><strong>Wide contact patch:</strong> More grip, better for cruising</li>
                  <li><strong>Narrow contact patch:</strong> Less friction, easier for tricks</li>
                  <li><strong>Rounded edges:</strong> Smooth turning and sliding</li>
                  <li><strong>Square edges:</strong> More grip when needed</li>
                </ul>
              </div>
            )
          }
        ],
        tip: "💡 Pro Tip: Have different sets of wheels for different activities - soft for cruising, hard for street tricks, and medium for all-around skating."
      },
      helmets: {
        title: "⛑️ What to Look for in a Skateboard Helmet",
        guides: [
          {
            title: "📏 Sizing & Fit",
            content: (
              <div>
                <p><strong>Measure your head circumference:</strong> {formData.headCircumference}cm determines your size.</p>
                <ul>
                  <li><strong>Small:</strong> 51-55cm circumference</li>
                  <li><strong>Medium:</strong> 55-59cm circumference</li>
                  <li><strong>Large:</strong> 59-63cm circumference</li>
                  <li><strong>Snug fit:</strong> Should not move when you shake your head</li>
                </ul>
                <p>Helmet should sit level on your head, covering the forehead.</p>
              </div>
            )
          },
          {
            title: "🛡️ Safety Certifications",
            content: (
              <div>
                <p><strong>Choose proper certification for your skating:</strong></p>
                <ul>
                  <li><strong>CPSC:</strong> Basic bicycle helmet standard</li>
                  <li><strong>ASTM F1492:</strong> Skateboarding specific standard</li>
                  <li><strong>Dual Certified:</strong> Meets both CPSC and ASTM (best choice)</li>
                  <li><strong>MIPS:</strong> Additional rotational impact protection</li>
                </ul>
                <p>Your {formData.certifications} preference provides {formData.certifications === 'CPSC (Basic)' ? 'basic protection' : formData.certifications === 'ASTM (Skate specific)' ? 'skateboard-optimized protection' : 'comprehensive protection for all activities'}.</p>
              </div>
            )
          },
          {
            title: "🎨 Style & Ventilation",
            content: (
              <div>
                <p><strong>Comfort and style for your skating:</strong></p>
                <ul>
                  <li><strong>Classic skate style:</strong> Lower profile, street aesthetic</li>
                  <li><strong>BMX style:</strong> More coverage, better for vert</li>
                  <li><strong>Ventilation:</strong> Multiple vents for cooling</li>
                  <li><strong>Adjustable fit system:</strong> Dial or strap adjustments</li>
                </ul>
                <p>For {formData.skateStyle} skating, prioritize {formData.skateStyle === 'Street' ? 'low-profile style with good venting' : formData.skateStyle === 'Vert' ? 'maximum coverage and protection' : 'comfort and all-around protection'}.</p>
              </div>
            )
          }
        ],
        tip: "💡 Pro Tip: A good helmet is a one-time investment in your safety - replace it after any significant impact or every few years of regular use."
      }
    }
  };

  const sportContent = content[sport as keyof typeof content];
  if (!sportContent) return null;
  
  return sportContent[category as keyof typeof sportContent] as EducationalContentData || null;
};

export default RecommendationPage

