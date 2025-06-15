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

const TitleContainer = styled.div`
  position: absolute;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: center;
`

const Title = styled.h1`
  font-size: clamp(3rem, 8vw, 6rem);
  font-weight: 100;
  letter-spacing: 0.3em;
  color: ${props => props.theme.colors.text};
  margin: 0;
  opacity: 0.95;
  text-shadow: 0 0 20px rgba(255, 255, 255, 0.1);
`

const ClickablePeriod = styled.span`
  cursor: pointer;
  transition: all 0.2s ease;
  display: inline-block;
  font-size: clamp(3rem, 8vw, 6rem);
  font-weight: 100;
  color: ${props => props.theme.colors.text};
  opacity: 0.95;
  text-shadow: 0 0 20px rgba(255, 255, 255, 0.1);
  margin-left: -0.15em; /* Adjust spacing to account for letter-spacing */
  
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

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
`

const PasswordModal = styled.form`
  background: #1a1a1a;
  border: 1px solid #333;
  border-radius: 12px;
  padding: 2rem;
  width: 90%;
  max-width: 400px;
  display: flex;
  flex-direction: column;
  gap: 1rem;
`

const PasswordInput = styled.input`
  padding: 0.75rem;
  border-radius: 8px;
  border: 1px solid #444;
  background: #2a2a2a;
  color: #fff;
`

const ModalButtonRow = styled.div`
  display: flex;
  gap: 0.5rem;
  justify-content: flex-end;
`

const ModalButton = styled.button`
  padding: 0.5rem 1rem;
  border-radius: 6px;
  border: none;
  cursor: pointer;
  background: #ffffff;
  color: #000000;
  &:hover {
    background: #f0f0f0;
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
  const [showPasswordPrompt, setShowPasswordPrompt] = useState(false)
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

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
      setShowPasswordPrompt(true)
    }
  }

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!shopOwner) return
    setError('')
    try {
      const response = await fetch('http://localhost:3001/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: shopOwner.email, password })
      })
      const data = await response.json()
      if (response.ok) {
        localStorage.setItem('token', data.token)
        localStorage.setItem('shopOwner', JSON.stringify(data.shop))
        setShowPasswordPrompt(false)
        setPassword('')
        navigate('/admin')
      } else {
        setError(data.error || 'Authentication failed')
      }
    } catch {
      setError('Network error')
    }
  }
  
  return (
    <HomeContainer>      <CenterLayout>
        <TitleContainer>
          <Title>trust</Title>
          <ClickablePeriod onClick={handleEmployeeLogin}>.</ClickablePeriod>
        </TitleContainer>{/* Surfboard Icon - Top */}        <SportIcon 
          position="top" 
          onClick={() => handleSportClick('surf')}
          title="surf"
        ><IconSvg viewBox="0 0 24 24">
            {/* Main surfboard outline with pointed nose, wider middle, and fish tail */}
            <path d="M12 2 L10.5 4 L9.5 8 L9 12 L9.5 16 L10 18 L11 21 L12 20 L13 21 L14 18 L14.5 16 L15 12 L14.5 8 L13.5 4 Z"/>
            {/* Center stringer line */}
            <path d="M12 3 L12 20" strokeWidth="0.5"/>
          </IconSvg>
        </SportIcon>        {/* Snowflake Icon - Bottom Left */}        <SportIcon 
          position="bottom-left" 
          onClick={() => handleSportClick('ski')}
          title="skiing/snowboarding"
        >
          <IconSvg viewBox="0 0 24 24">
            {/* Main cross lines */}
            <path d="M12 1 L12 23" strokeWidth="1.2"/>
            <path d="M1 12 L23 12" strokeWidth="1.2"/>
            <path d="M5.64 5.64 L18.36 18.36" strokeWidth="1.2"/>
            <path d="M18.36 5.64 L5.64 18.36" strokeWidth="1.2"/>
            
            {/* Inner diamond pattern */}
            <path d="M12 6 L9 9 L12 12 L15 9 Z" strokeWidth="0.8" fill="none"/>
            <path d="M12 12 L9 15 L12 18 L15 15 Z" strokeWidth="0.8" fill="none"/>
            <path d="M6 12 L9 9 L12 12 L9 15 Z" strokeWidth="0.8" fill="none"/>
            <path d="M12 12 L15 9 L18 12 L15 15 Z" strokeWidth="0.8" fill="none"/>            {/* Endpoint arrows - Top (pointing inward toward center) */}
            <path d="M12 4 L10 2.5" strokeWidth="1"/>
            <path d="M12 4 L14 2.5" strokeWidth="1"/>
            <path d="M12 3.5 L11 2" strokeWidth="0.8"/>
            <path d="M12 3.5 L13 2" strokeWidth="0.8"/>
            
            {/* Endpoint arrows - Bottom (pointing inward toward center) */}
            <path d="M12 20 L10 21.5" strokeWidth="1"/>
            <path d="M12 20 L14 21.5" strokeWidth="1"/>
            <path d="M12 20.5 L11 22" strokeWidth="0.8"/>
            <path d="M12 20.5 L13 22" strokeWidth="0.8"/>
            
            {/* Endpoint arrows - Left (pointing inward toward center) */}
            <path d="M4 12 L2.5 10" strokeWidth="1"/>
            <path d="M4 12 L2.5 14" strokeWidth="1"/>
            <path d="M3.5 12 L2 11" strokeWidth="0.8"/>
            <path d="M3.5 12 L2 13" strokeWidth="0.8"/>
            
            {/* Endpoint arrows - Right (pointing inward toward center) */}
            <path d="M20 12 L21.5 10" strokeWidth="1"/>
            <path d="M20 12 L21.5 14" strokeWidth="1"/>
            <path d="M20.5 12 L22 11" strokeWidth="0.8"/>
            <path d="M20.5 12 L22 13" strokeWidth="0.8"/>
            
            {/* Diagonal endpoint arrows - Top Left (pointing inward toward center) */}
            <path d="M7.5 7.5 L6.5 6.5" strokeWidth="1"/>
            <path d="M7.5 7.5 L6 7" strokeWidth="1"/>
            
            {/* Diagonal endpoint arrows - Top Right (pointing inward toward center) */}
            <path d="M16.5 7.5 L17.5 6.5" strokeWidth="1"/>
            <path d="M16.5 7.5 L18 7" strokeWidth="1"/>
            
            {/* Diagonal endpoint arrows - Bottom Left (pointing inward toward center) */}
            <path d="M7.5 16.5 L6.5 17.5" strokeWidth="1"/>
            <path d="M7.5 16.5 L6 17" strokeWidth="1"/>
            
            {/* Diagonal endpoint arrows - Bottom Right (pointing inward toward center) */}
            <path d="M16.5 16.5 L17.5 17.5" strokeWidth="1"/>
            <path d="M16.5 16.5 L18 17" strokeWidth="1"/>
          </IconSvg>
        </SportIcon>
          {/* Skateboard Icon - Bottom Right */}        <SportIcon 
          position="bottom-right" 
          onClick={() => handleSportClick('skate')}
          title="skate"        >          <IconSvg viewBox="0 0 24 24">
            {/* Penny board deck with upward-curved tail - side view */}
            <path d="M6 11 C6.5 10.5 7 11 7.5 11.5 L15 11.5 C16 11.5 17 11.7 17.5 12 C18 12.3 17.7 12.5 17 12.5 L7.5 12.5 C7 12.5 6.5 12 6 11 Z" strokeWidth="1.5" fill="none"/>
            
            {/* Left wheels */}
            <circle cx="8" cy="14.5" r="1" fill="none" strokeWidth="1"/>
            
            {/* Right wheels */}
            <circle cx="16" cy="14.5" r="1" fill="none" strokeWidth="1"/>
          </IconSvg>
        </SportIcon>
      </CenterLayout>
        {shopOwner && (
        <ShopStatusIndicator onClick={handleShopStatusClick}>
          {shopOwner.name}
        </ShopStatusIndicator>
      )}
      {showPasswordPrompt && (
        <ModalOverlay>
          <PasswordModal onSubmit={handlePasswordSubmit}>
            <div style={{ color: '#fff' }}>Enter password for {shopOwner?.name}</div>
            <PasswordInput
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              autoFocus
            />
            {error && <div style={{ color: '#ff6b6b', fontSize: '0.9rem' }}>{error}</div>}
            <ModalButtonRow>
              <ModalButton type="button" onClick={() => { setShowPasswordPrompt(false); setPassword(''); setError(''); }}>
                Cancel
              </ModalButton>
              <ModalButton type="submit">Enter</ModalButton>
            </ModalButtonRow>
          </PasswordModal>
        </ModalOverlay>
      )}
    </HomeContainer>
  )
}

export default HomePage
