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
                <p>Your shoe size and skating style determine the best width for you.</p>
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
      }
    }
  };

  const sportContent = content[sport as keyof typeof content];
  if (!sportContent) return null;
  
  return sportContent[category as keyof typeof sportContent] as EducationalContentData || null;
};

export default RecommendationPage

