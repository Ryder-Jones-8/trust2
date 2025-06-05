import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import styled from 'styled-components';

const HomeContainer = styled.div`
  width: 100vw;
  height: 100vh;
  margin: 0;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #101014 0%, #18181c 100%);
  background-attachment: fixed;
  position: fixed;
  top: 0;
  left: 0;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: radial-gradient(ellipse at center, rgba(255, 255, 255, 0.02) 0%, transparent 70%);
    pointer-events: none;
  }
`

const CenterLayout = styled.div`
  position: relative;
  width: 100vw;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  max-width: none;
  max-height: none;
`

const Title = styled.h1`
  font-size: clamp(3rem, 8vw, 6rem);
  font-weight: 100;
  letter-spacing: 0.3em;
  color: ${props => props.theme.colors.text};
  position: absolute;
  z-index: 2;
  margin: 0;
  opacity: 0.95;
  text-shadow: 0 0 20px rgba(255, 255, 255, 0.1);
`

const ClickablePeriod = styled.span`
  cursor: pointer;
  transition: all 0.2s ease;
  display: inline-block;
  
  &:hover {
    opacity: 0.7;
    transform: scale(1.05);
  }
  
  &:active {
    transform: scale(0.95);
  }
`

const SportIcon = styled.div<{ position: 'top' | 'bottom-left' | 'bottom-right' }>`
  position: absolute;
  width: clamp(100px, 12vw, 140px);
  height: clamp(100px, 12vw, 140px);
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
  backdrop-filter: blur(20px);
  z-index: 1;
  
  ${props => {
    switch (props.position) {
      case 'top':
        return `
          top: 15vh;
          left: 50vw;
          transform: translateX(-50%);
        `
      case 'bottom-left':
        return `
          bottom: 15vh;
          left: 25vw;
          transform: translateX(-50%);
        `
      case 'bottom-right':
        return `
          bottom: 15vh;
          right: 25vw;
          transform: translateX(50%);
        `
    }
  }}
  
  &:hover {
    background: rgba(255, 255, 255, 0.08);
    border-color: rgba(255, 255, 255, 0.2);
    transform: ${props => {
      switch (props.position) {
        case 'top':
          return 'translateX(-50%) scale(1.1) translateY(-8px);';
        case 'bottom-left':
          return 'translateX(-50%) scale(1.1) translate(-5px, -8px);';
        case 'bottom-right':
          return 'translateX(50%) scale(1.1) translate(5px, -8px);';
      }
    }};
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
  }
  
  &:active {
    transform: ${props => {
      switch (props.position) {
        case 'top':
          return 'translateX(-50%) scale(0.95);';
        case 'bottom-left':
          return 'translateX(-50%) scale(0.95);';
        case 'bottom-right':
          return 'translateX(50%) scale(0.95);';
      }
    }};
  }
`

const IconSvg = styled.svg`
  width: clamp(45px, 6vw, 60px);
  height: clamp(45px, 6vw, 60px);
  fill: none;
  stroke: ${props => props.theme.colors.text};
  stroke-width: 1;
  stroke-linecap: round;
  stroke-linejoin: round;
  transition: all 0.3s ease;
  opacity: 0.7;
  
  ${SportIcon}:hover & {
    opacity: 1;
    stroke-width: 1.2;
  }
`

const ShopStatusIndicator = styled.div`
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  color: ${props => props.theme.colors.text};
  font-size: 0.9rem;
  font-weight: 300;
  letter-spacing: 0.05em;
  z-index: 10;
  cursor: pointer;
  opacity: 0.4;
  transition: opacity 0.3s ease;
  
  &:hover {
    opacity: 0.8;
  }
`

interface ShopOwner {
  id: string;
  email: string;
  name: string;
}

const HomePage = () => {
  const navigate = useNavigate()
  const [shopOwner, setShopOwner] = useState<ShopOwner | null>(null)

  useEffect(() => {
    // Check if user is logged in as shop owner
    const token = localStorage.getItem('token')
    const ownerData = localStorage.getItem('shopOwner')
    
    if (token && ownerData) {
      try {
        const owner = JSON.parse(ownerData)
        setShopOwner(owner)
      } catch (error) {
        console.error('Error parsing shop owner data:', error)
      }
    }
  }, [])

  const handleSportClick = (sport: string) => {
    navigate(`/sport/${sport}`)
  }

  const handleEmployeeLogin = () => {
    navigate('/login')
  }

  const handleShopStatusClick = () => {
    if (shopOwner) {
      navigate('/admin')
    }
  }
  
  return (
    <HomeContainer>
      <CenterLayout>
        <Title>
          trust<ClickablePeriod onClick={handleEmployeeLogin}>.</ClickablePeriod>
        </Title>          {/* Surfboard Icon - Top */}        <SportIcon 
          position="top" 
          onClick={() => handleSportClick('surf')}
          title="surf"
        ><IconSvg viewBox="0 0 24 24">
            {/* Main surfboard outline with pointed nose, wider middle, and fish tail */}
            <path d="M12 2 L10.5 4 L9.5 8 L9 12 L9.5 16 L10 18 L11 21 L12 20 L13 21 L14 18 L14.5 16 L15 12 L14.5 8 L13.5 4 Z"/>
            {/* Center stringer line */}
            <path d="M12 3 L12 20" strokeWidth="0.5"/>
          </IconSvg>
        </SportIcon>        {/* Snowboard Icon - Bottom Left */}        <SportIcon 
          position="bottom-left" 
          onClick={() => handleSportClick('snow')}
          title="snow"
        >
          <IconSvg viewBox="0 0 24 24">
            {/* Main snowboard outline - wider and smoother than surfboard */}
            <path d="M12 3 C10 3 8.5 4 8.5 5.5 L8.5 18.5 C8.5 20 10 21 12 21 C14 21 15.5 20 15.5 18.5 L15.5 5.5 C15.5 4 14 3 12 3 Z"/>
            {/* Center line */}
            <path d="M12 4 L12 20" strokeWidth="0.5"/>
            {/* Front binding */}
            <rect x="9.5" y="8.5" width="5" height="1.2" rx="0.6"/>
            {/* Back binding */}
            <rect x="9.5" y="14.3" width="5" height="1.2" rx="0.6"/>
          </IconSvg>
        </SportIcon>
          {/* Skateboard Icon - Bottom Right */}        <SportIcon 
          position="bottom-right" 
          onClick={() => handleSportClick('skate')}
          title="skate"        >          <IconSvg viewBox="0 0 24 24">
            {/* Skateboard deck - side view as a simple line with slightly curved ends */}
            <path d="M6 12 C6 11 7 10 8 10 L16 10 C17 10 18 11 18 12 C18 13 17 14 16 14 L8 14 C7 14 6 13 6 12 Z" strokeWidth="1.2"/>
            
            {/* Front wheel */}
            <circle cx="8.5" cy="16" r="1.5" fill="none" strokeWidth="0.8"/>
            
            {/* Back wheel */}
            <circle cx="15.5" cy="16" r="1.5" fill="none" strokeWidth="0.8"/>
          </IconSvg>
        </SportIcon>
      </CenterLayout>
        {shopOwner && (
        <ShopStatusIndicator onClick={handleShopStatusClick}>
          {shopOwner.name}
        </ShopStatusIndicator>
      )}
    </HomeContainer>
  )
}

export default HomePage
