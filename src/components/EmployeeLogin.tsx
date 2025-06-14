import React, { useState } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';

const LoginContainer = styled.div`
  width: 100vw;
  height: 100vh;
  background: #0a0a0a;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
`;

const BackButton = styled.button`
  position: absolute;
  top: 2rem;
  left: 2rem;
  background: none;
  border: none;
  color: #ffffff;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0.5rem;
  
  &:hover {
    color: #888;
  }
`;

const LoginForm = styled.form`
  background: #1a1a1a;
  border: 1px solid #333;
  border-radius: 12px;
  padding: 3rem;
  width: 100%;
  max-width: 400px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
`;

const Title = styled.h1`
  color: #ffffff;
  text-align: center;
  margin-bottom: 2rem;
  font-size: 2rem;
  font-weight: 300;
`;

const TrustLogo = styled.span`
  color: #ffffff;
  font-weight: 400;
`;

const InputGroup = styled.div`
  margin-bottom: 1.5rem;
`;

const Label = styled.label`
  display: block;
  color: #ccc;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
`;

const Input = styled.input`
  width: 100%;
  padding: 1rem;
  background: #2a2a2a;
  border: 1px solid #444;
  border-radius: 8px;
  color: #ffffff;
  font-size: 1rem;
  
  &:focus {
    outline: none;
    border-color: #666;
  }
  
  &::placeholder {
    color: #666;
  }
`;

const LoginButton = styled.button`
  width: 100%;
  background: #ffffff;
  color: #000000;
  border: none;
  border-radius: 8px;
  padding: 1rem;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background: #f0f0f0;
    transform: translateY(-1px);
  }
  
  &:disabled {
    background: #666;
    color: #999;
    cursor: not-allowed;
    transform: none;
  }
`;

const ErrorMessage = styled.div`
  color: #ff6b6b;
  text-align: center;
  margin-top: 1rem;
  font-size: 0.9rem;
`;

const RegisterLink = styled.p`
  text-align: center;
  margin-top: 2rem;
  color: #888;
  font-size: 0.9rem;
  
  a {
    color: #ffffff;
    text-decoration: none;
    
    &:hover {
      text-decoration: underline;
    }
  }
`;

const EmployeeLogin: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [shopName, setShopName] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');    try {
      const endpoint = isRegisterMode ? '/api/register' : '/api/login';
      const body = isRegisterMode 
        ? { email, password, name: shopName }
        : { email, password };

      const response = await fetch(`http://localhost:3001${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();      if (response.ok) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('shopOwner', JSON.stringify(data.shop));
        navigate('/admin');
      } else {
        setError(data.error || data.message || 'Authentication failed');
      }
    } catch (err) {
      console.error(err);
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    navigate('/');
  };

  return (
    <LoginContainer>
      <BackButton onClick={handleBack}>←</BackButton>
      <LoginForm onSubmit={handleSubmit}>
        <Title>
          <TrustLogo>trust.</TrustLogo> {isRegisterMode ? 'Register' : 'Employee Login'}
        </Title>
        
        {isRegisterMode && (
          <InputGroup>
            <Label htmlFor="shopName">Shop Name</Label>
            <Input
              id="shopName"
              type="text"
              value={shopName}
              onChange={(e) => setShopName(e.target.value)}
              placeholder="Enter your shop name"
              required
            />
          </InputGroup>
        )}
        
        <InputGroup>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            required
          />
        </InputGroup>
        
        <InputGroup>
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            required
          />
        </InputGroup>
        
        <LoginButton type="submit" disabled={isLoading}>
          {isLoading ? 'Loading...' : (isRegisterMode ? 'Register Shop' : 'Login')}
        </LoginButton>
        
        {error && <ErrorMessage>{error}</ErrorMessage>}
        
        <RegisterLink>
          {isRegisterMode ? (
            <>
              Already have an account?{' '}
              <a href="#" onClick={(e) => { e.preventDefault(); setIsRegisterMode(false); }}>
                Login here
              </a>
            </>
          ) : (
            <>
              Don't have an account?{' '}
              <a href="#" onClick={(e) => { e.preventDefault(); setIsRegisterMode(true); }}>
                Register your shop
              </a>
            </>
          )}
        </RegisterLink>
      </LoginForm>
    </LoginContainer>
  );
};

export default EmployeeLogin;
