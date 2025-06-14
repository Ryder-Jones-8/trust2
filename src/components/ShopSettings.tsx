import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';

const Container = styled.div`
  width: 100vw;
  height: 100vh;
  background: #0a0a0a;
  color: #ffffff;
  overflow: auto;
`;

const Header = styled.header`
  background: #1a1a1a;
  border-bottom: 1px solid #333;
  padding: 1rem 2rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  position: sticky;
  top: 0;
  z-index: 100;
`;

const BackButton = styled.button`
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

const Title = styled.h1`
  font-size: 1.5rem;
  font-weight: 300;
  margin: 0;
`;

const Content = styled.div`
  max-width: 800px;
  margin: 2rem auto;
  padding: 0 2rem;
`;

const SettingsSection = styled.section`
  background: #1a1a1a;
  border: 1px solid #333;
  border-radius: 12px;
  padding: 2rem;
  margin-bottom: 2rem;
`;

const SectionTitle = styled.h2`
  font-size: 1.2rem;
  font-weight: 500;
  margin-bottom: 1.5rem;
  color: #ffffff;
`;

const FormGroup = styled.div`
  margin-bottom: 1.5rem;
`;

const Label = styled.label`
  display: block;
  color: #ccc;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
  font-weight: 500;
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

const TextArea = styled.textarea`
  width: 100%;
  padding: 1rem;
  background: #2a2a2a;
  border: 1px solid #444;
  border-radius: 8px;
  color: #ffffff;
  font-size: 1rem;
  min-height: 100px;
  resize: vertical;
  
  &:focus {
    outline: none;
    border-color: #666;
  }
  
  &::placeholder {
    color: #666;
  }
`;

const CheckboxGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const Checkbox = styled.input`
  width: 18px;
  height: 18px;
  accent-color: #ffffff;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 2rem;
`;

const Button = styled.button<{ variant?: 'primary' | 'danger' }>`
  padding: 1rem 2rem;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  
  ${props => props.variant === 'primary' ? `
    background: #ffffff;
    color: #000000;
    border: none;
    
    &:hover {
      background: #f0f0f0;
      transform: translateY(-1px);
    }
  ` : props.variant === 'danger' ? `
    background: #ff6b6b;
    color: #ffffff;
    border: none;
    
    &:hover {
      background: #ff5252;
    }
  ` : `
    background: transparent;
    color: #ffffff;
    border: 1px solid #444;
    
    &:hover {
      border-color: #666;
      background: #2a2a2a;
    }
  `}
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

const Message = styled.div<{ type: 'success' | 'error' }>`
  color: ${props => props.type === 'success' ? '#4ecdc4' : '#ff6b6b'};
  margin-top: 1rem;
  font-size: 0.9rem;
`;

const DangerZone = styled.div`
  border: 1px solid #ff6b6b;
  border-radius: 12px;
  padding: 1.5rem;
  background: rgba(255, 107, 107, 0.05);
`;

const DangerTitle = styled.h3`
  color: #ff6b6b;
  font-size: 1.1rem;
  margin-bottom: 1rem;
`;

const DangerDescription = styled.p`
  color: #ccc;
  font-size: 0.9rem;
  margin-bottom: 1rem;
  line-height: 1.4;
`;

interface ShopSettings {
  shopName: string;
  description: string;
  address: string;
  location: string;
  phone: string;
  email: string;
  website: string;
  businessHours: string;
  acceptsRecommendations: boolean;
  autoNotifyLowStock: boolean;
  enableInventoryAlerts: boolean;
  enableEmailNotifications: boolean;
  enableSMSNotifications: boolean;
  lowStockThreshold: number;
}

const ShopSettings: React.FC = () => {
  const navigate = useNavigate();
  const [settings, setSettings] = useState<ShopSettings>({
    shopName: '',
    description: '',
    address: '',
    location: '',
    phone: '',
    email: '',
    website: '',
    businessHours: '',
    acceptsRecommendations: true,
    autoNotifyLowStock: true,
    enableInventoryAlerts: true,
    enableEmailNotifications: false,
    enableSMSNotifications: false,
    lowStockThreshold: 5
  });
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    loadSettings();
  }, []);
  const loadSettings = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setMessage({ type: 'error', text: 'Authentication required. Please log in again.' });
        return;
      }

      const response = await fetch('http://localhost:3001/api/shop/settings', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setSettings(prev => ({
          ...prev,
          shopName: data.name || '',
          email: data.email || '',
          location: data.location || '',
          // Map any settings from the API response
          ...data.settings
        }));
      } else if (response.status === 401) {
        setMessage({ type: 'error', text: 'Session expired. Please log in again.' });
        localStorage.removeItem('token');
        localStorage.removeItem('shopOwner');
      } else {
        throw new Error('Failed to load settings');
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
      setMessage({ type: 'error', text: 'Failed to load settings. Please try again.' });
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : 
              name === 'lowStockThreshold' ? parseInt(value) || 0 : value
    }));
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setMessage({ type: 'error', text: 'Authentication required. Please log in again.' });
        return;
      }

      const response = await fetch('http://localhost:3001/api/shop/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: settings.shopName,
          location: settings.location,
          settings: {
            lowStockThreshold: settings.lowStockThreshold,
            enableInventoryAlerts: settings.enableInventoryAlerts,
            enableEmailNotifications: settings.enableEmailNotifications,
            enableSMSNotifications: settings.enableSMSNotifications,
            businessHours: settings.businessHours,
            description: settings.description,
            website: settings.website,
            phone: settings.phone
          }
        })
      });

      if (response.ok) {
        const updatedData = await response.json();
        setMessage({ type: 'success', text: 'Settings saved successfully!' });
        
        // Update localStorage shopOwner data if it exists
        const shopOwnerData = localStorage.getItem('shopOwner');
        if (shopOwnerData) {
          const shopOwner = JSON.parse(shopOwnerData);
          shopOwner.name = updatedData.name;
          shopOwner.location = updatedData.location;
          localStorage.setItem('shopOwner', JSON.stringify(shopOwner));
        }
      } else if (response.status === 401) {
        setMessage({ type: 'error', text: 'Session expired. Please log in again.' });
        localStorage.removeItem('token');
        localStorage.removeItem('shopOwner');
      } else {
        const errorData = await response.json();
        setMessage({ type: 'error', text: errorData.error || 'Failed to save settings.' });
      }
    } catch (error) {
      console.error('Failed to save settings:', error);
      setMessage({ type: 'error', text: 'Network error. Please check your connection and try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    const confirmation = prompt('Type "DELETE" to confirm account deletion:');
    if (confirmation !== 'DELETE') {
      return;
    }

    if (!confirm('This action cannot be undone. Are you absolutely sure?')) {
      return;
    }

    try {
      // In a real app, this would call the delete account API
      console.log('Account deletion requested');
      
      // For now, just log out
      localStorage.removeItem('token');
      localStorage.removeItem('shopOwner');
      localStorage.removeItem('shopSettings');
      navigate('/');
    } catch (error) {
      console.error(error);
      setMessage({ type: 'error', text: 'Failed to delete account. Please contact support.' });
    }
  };

  return (
    <Container>
      <Header>
        <BackButton onClick={() => navigate('/admin')}>←</BackButton>
        <Title>Shop Settings</Title>
      </Header>
      
      <Content>
        <form onSubmit={handleSubmit}>
          <SettingsSection>
            <SectionTitle>Shop Information</SectionTitle>
            
            <FormGroup>
              <Label htmlFor="shopName">Shop Name *</Label>
              <Input
                id="shopName"
                name="shopName"
                type="text"
                value={settings.shopName}
                onChange={handleInputChange}
                placeholder="Your shop name"
                required
              />
            </FormGroup>
            
            <FormGroup>
              <Label htmlFor="description">Description</Label>
              <TextArea
                id="description"
                name="description"
                value={settings.description}
                onChange={handleInputChange}
                placeholder="Tell customers about your shop..."
              />
            </FormGroup>
            
            <FormGroup>
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                name="address"
                type="text"
                value={settings.address}
                onChange={handleInputChange}
                placeholder="123 Main St, City, State 12345"
              />
            </FormGroup>
            
            <FormGroup>
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                value={settings.phone}
                onChange={handleInputChange}
                placeholder="(555) 123-4567"
              />
            </FormGroup>
            
            <FormGroup>
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                name="website"
                type="url"
                value={settings.website}
                onChange={handleInputChange}
                placeholder="https://yourshop.com"
              />
            </FormGroup>
          </SettingsSection>

          <SettingsSection>
            <SectionTitle>Preferences</SectionTitle>
            
            <FormGroup>
              <CheckboxGroup>
                <Checkbox
                  id="acceptsRecommendations"
                  name="acceptsRecommendations"
                  type="checkbox"
                  checked={settings.acceptsRecommendations}
                  onChange={handleInputChange}
                />
                <Label htmlFor="acceptsRecommendations">
                  Show my products in customer recommendations
                </Label>
              </CheckboxGroup>
            </FormGroup>
            
            <FormGroup>
              <CheckboxGroup>
                <Checkbox
                  id="autoNotifyLowStock"
                  name="autoNotifyLowStock"
                  type="checkbox"
                  checked={settings.autoNotifyLowStock}
                  onChange={handleInputChange}
                />
                <Label htmlFor="autoNotifyLowStock">
                  Notify me when products are low in stock
                </Label>
              </CheckboxGroup>
            </FormGroup>
            
            <FormGroup>
              <Label htmlFor="lowStockThreshold">Low Stock Threshold</Label>
              <Input
                id="lowStockThreshold"
                name="lowStockThreshold"
                type="number"
                min="1"
                value={settings.lowStockThreshold}
                onChange={handleInputChange}
                placeholder="5"
              />
            </FormGroup>
          </SettingsSection>

          <ButtonGroup>
            <Button type="button" onClick={() => navigate('/admin')}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={isLoading}>
              {isLoading ? 'Saving...' : 'Save Settings'}
            </Button>
          </ButtonGroup>
          
          {message && (
            <Message type={message.type}>{message.text}</Message>
          )}
        </form>

        <SettingsSection>
          <DangerZone>
            <DangerTitle>Danger Zone</DangerTitle>
            <DangerDescription>
              Once you delete your account, there is no going back. This will permanently delete 
              your shop data, products, and all associated information.
            </DangerDescription>
            <Button variant="danger" onClick={handleDeleteAccount}>
              Delete Account
            </Button>
          </DangerZone>
        </SettingsSection>
      </Content>
    </Container>
  );
};

export default ShopSettings;
