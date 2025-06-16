import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../apiConfig';

const AdminContainer = styled.div`
  width: 100vw;
  height: 100vh;
  background: linear-gradient(135deg, #101014 0%, #18181c 100%);
  color: #ffffff;
  overflow: auto;
`;

const Header = styled.header`
  background: #1a1a1a;
  border-bottom: 1px solid #333;
  padding: 1rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: sticky;
  top: 0;
  z-index: 100;
`;

const Logo = styled.h1`
  font-size: 1.5rem;
  font-weight: 300;
  margin: 0;
`;

const HeaderButtons = styled.div`
  display: flex;
  gap: 1rem;
  align-items: center;
`;

const BackToFrontendButton = styled.button`
  background: #2c5530;
  color: #ffffff;
  border: none;
  border-radius: 6px;
  padding: 0.5rem 1rem;
  cursor: pointer;
  font-size: 0.9rem;
  
  &:hover {
    background: #3d6b42;
  }
`;

const LogoutButton = styled.button`
  background: #333;
  color: #ffffff;
  border: none;
  border-radius: 6px;
  padding: 0.5rem 1rem;
  cursor: pointer;
  font-size: 0.9rem;
  
  &:hover {
    background: #444;
  }
`;

const MainContent = styled.main`
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
`;

const WelcomeSection = styled.section`
  margin-bottom: 3rem;
`;

const ShopName = styled.h2`
  font-size: 2rem;
  font-weight: 400;
  margin-bottom: 0.5rem;
  color: #ffffff;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  margin-bottom: 3rem;
`;

const StatCard = styled.div`
  background: linear-gradient(135deg, #18181c 0%, #23232a 100%);
  border: 1px solid #333;
  border-radius: 12px;
  padding: 1.5rem;
  text-align: center;
`;

const StatNumber = styled.div`
  font-size: 2rem;
  font-weight: 600;
  color: #ffffff;
  margin-bottom: 0.5rem;
`;

const StatLabel = styled.div`
  font-size: 0.9rem;
  color: #888;
`;

const Section = styled.section`
  margin-bottom: 3rem;
`;

const SectionTitle = styled.h3`
  font-size: 1.5rem;
  font-weight: 400;
  margin-bottom: 1.5rem;
  color: #ffffff;
`;

const ActionGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
`;

const ActionCard = styled.div`
  background: linear-gradient(135deg, #18181c 0%, #23232a 100%);
  border: 1px solid #333;
  border-radius: 12px;
  padding: 2rem;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    border-color: #555;
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
  }
`;

const ActionIcon = styled.div`
  font-size: 3rem;
  margin-bottom: 1rem;
`;

const ActionTitle = styled.h4`
  font-size: 1.2rem;
  font-weight: 500;
  margin-bottom: 0.5rem;
  color: #ffffff;
`;

const ActionDescription = styled.p`
  font-size: 0.9rem;
  color: #888;
  line-height: 1.4;
`;

const ProductsTable = styled.div`
  background: linear-gradient(135deg, #18181c 0%, #23232a 100%);
  border: 1px solid #333;
  border-radius: 12px;
  overflow: hidden;
`;

const TableHeader = styled.div`
  background: #2a2a2a;
  padding: 1rem;
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr 100px;
  gap: 1rem;
  font-weight: 500;
  border-bottom: 1px solid #333;
`;

const TableRow = styled.div`
  padding: 1rem;
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr 100px;
  gap: 1rem;
  border-bottom: 1px solid #333;
  
  &:last-child {
    border-bottom: none;
  }
  
  &:hover {
    background: #2a2a2a;
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 3rem;
  color: #666;
`;

interface Product {
  id: string;
  name: string;
  category: string;
  sport: string;
  price: number;
  quantity: number;
}

interface ShopOwner {
  id: string;
  email: string;
  name: string;
}

const AdminDashboard: React.FC = () => {
  const [shopOwner, setShopOwner] = useState<ShopOwner | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalValue: 0,
    lowStock: 0,
    categories: 0
  });
  const navigate = useNavigate();

  useEffect(() => {
    // Check authentication
    const token = localStorage.getItem('token');
    const ownerData = localStorage.getItem('shopOwner');
    
    if (!token || !ownerData) {
      navigate('/login');
      return;
    }

    const owner = JSON.parse(ownerData);
    setShopOwner(owner);
    loadProducts();
  }, [navigate]);

  const loadProducts = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/products`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });      if (response.ok) {
        const data = await response.json();
        setProducts(data);
          // Calculate stats
        const totalProducts = data.length;
        const totalValue = data.reduce((sum: number, p: Product) => sum + (p.price * p.quantity), 0);
        const lowStock = data.filter((p: Product) => p.quantity < 5).length;
        const categories = new Set(data.map((p: Product) => p.category)).size;
        
        setStats({ totalProducts, totalValue, lowStock, categories });
      }
    } catch (error) {
      console.error('Failed to load products:', error);
    }
  };
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('shopOwner');
    navigate('/');
  };

  const handleBackToFrontend = () => {
    navigate('/');
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  if (!shopOwner) {
    return null;
  }

  return (
    <AdminContainer>      <Header>
        <Logo>trust. admin</Logo>
        <HeaderButtons>
          <BackToFrontendButton onClick={handleBackToFrontend}>
            ← Back to Store
          </BackToFrontendButton>
          <LogoutButton onClick={handleLogout}>Logout</LogoutButton>
        </HeaderButtons>
      </Header>
      
      <MainContent>        <WelcomeSection>
          <ShopName>{shopOwner.name}</ShopName>
          <p style={{ color: '#888', margin: 0 }}>Inventory Management Dashboard</p>
        </WelcomeSection>

        <StatsGrid>
          <StatCard>
            <StatNumber>{stats.totalProducts}</StatNumber>
            <StatLabel>Total Products</StatLabel>
          </StatCard>
          <StatCard>
            <StatNumber>{formatCurrency(stats.totalValue)}</StatNumber>
            <StatLabel>Inventory Value</StatLabel>
          </StatCard>
          <StatCard>
            <StatNumber>{stats.lowStock}</StatNumber>
            <StatLabel>Low Stock Items</StatLabel>
          </StatCard>
          <StatCard>
            <StatNumber>{stats.categories}</StatNumber>
            <StatLabel>Categories</StatLabel>
          </StatCard>
        </StatsGrid>

        <Section>
          <SectionTitle>Quick Actions</SectionTitle>
          <ActionGrid>
            <ActionCard onClick={() => navigate('/admin/products/new')}>
              <ActionIcon>📦</ActionIcon>
              <ActionTitle>Add Product</ActionTitle>
              <ActionDescription>Add new products to your inventory</ActionDescription>
            </ActionCard>
            <ActionCard onClick={() => navigate('/admin/products')}>
              <ActionIcon>📋</ActionIcon>
              <ActionTitle>Manage Inventory</ActionTitle>
              <ActionDescription>View and edit your product catalog</ActionDescription>
            </ActionCard>
            <ActionCard onClick={() => navigate('/admin/analytics')}>
              <ActionIcon>📊</ActionIcon>
              <ActionTitle>View Analytics</ActionTitle>
              <ActionDescription>Track sales and product performance</ActionDescription>
            </ActionCard>
            <ActionCard onClick={() => navigate('/admin/settings')}>
              <ActionIcon>⚙️</ActionIcon>
              <ActionTitle>Shop Settings</ActionTitle>
              <ActionDescription>Configure your shop preferences</ActionDescription>
            </ActionCard>
          </ActionGrid>
        </Section>

        <Section>
          <SectionTitle>Recent Products</SectionTitle>
          <ProductsTable>
            <TableHeader>
              <div>Product Name</div>
              <div>Category</div>
              <div>Price</div>
              <div>Stock</div>
              <div>Status</div>
            </TableHeader>
            {products.length > 0 ? (
              products.slice(0, 10).map((product) => (                <TableRow key={product.id}>
                  <div>{product.name}</div>
                  <div>{product.category}</div>
                  <div>{formatCurrency(product.price)}</div>
                  <div>{product.quantity}</div>
                  <div style={{ color: product.quantity < 5 ? '#ff6b6b' : '#4ecdc4' }}>
                    {product.quantity < 5 ? 'Low' : 'OK'}
                  </div>
                </TableRow>
              ))
            ) : (
              <EmptyState>
                <p>No products yet. Start by adding your first product!</p>
              </EmptyState>
            )}
          </ProductsTable>
        </Section>
      </MainContent>
    </AdminContainer>
  );
};

export default AdminDashboard;
