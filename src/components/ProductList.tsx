import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../apiConfig';

const Container = styled.div`
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
  align-items: center;
  justify-content: space-between;
  position: sticky;
  top: 0;
  z-index: 100;
`;

const HeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
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

const AddButton = styled.button`
  background: #ffffff;
  color: #000000;
  border: none;
  border-radius: 8px;
  padding: 0.75rem 1.5rem;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background: #f0f0f0;
    transform: translateY(-1px);
  }
`;

const Content = styled.div`
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
`;

const FiltersSection = styled.div`
  background: linear-gradient(135deg, #18181c 0%, #23232a 100%);
  border: 1px solid #333;
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  align-items: center;
`;

const FilterGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const FilterLabel = styled.label`
  font-size: 0.9rem;
  color: #888;
`;

const FilterSelect = styled.select`
  padding: 0.5rem;
  background: #2a2a2a;
  border: 1px solid #444;
  border-radius: 6px;
  color: #ffffff;
  font-size: 0.9rem;
  min-width: 150px;
  
  &:focus {
    outline: none;
    border-color: #666;
  }
  
  option {
    background: #2a2a2a;
    color: #ffffff;
  }
`;

const SearchInput = styled.input`
  padding: 0.5rem;
  background: #2a2a2a;
  border: 1px solid #444;
  border-radius: 6px;
  color: #ffffff;
  font-size: 0.9rem;
  min-width: 200px;
  
  &:focus {
    outline: none;
    border-color: #666;
  }
  
  &::placeholder {
    color: #666;
  }
`;

const ProductsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
`;

const ProductCard = styled.div`
  background: linear-gradient(135deg, #18181c 0%, #23232a 100%);
  border: 1px solid #333;
  border-radius: 12px;
  padding: 1.5rem;
  transition: all 0.3s ease;
  
  &:hover {
    border-color: #555;
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
  }
`;

const ProductHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
`;

const ProductName = styled.h3`
  font-size: 1.1rem;
  font-weight: 500;
  margin: 0;
  color: #ffffff;
  line-height: 1.3;
`;

const StockBadge = styled.span<{ $lowStock: boolean }>`
  background: ${props => props.$lowStock ? '#ff6b6b' : '#4ecdc4'};
  color: #ffffff;
  font-size: 0.8rem;
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  font-weight: 500;
`;

const ProductMeta = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.5rem;
  margin-bottom: 1rem;
`;

const MetaItem = styled.div`
  font-size: 0.9rem;
  color: #888;
`;

const MetaLabel = styled.span`
  color: #666;
`;

const MetaValue = styled.span`
  color: #ffffff;
  font-weight: 500;
`;

const ProductActions = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-top: 1rem;
`;

const ActionButton = styled.button<{ $variant?: 'primary' | 'danger' }>`
  flex: 1;
  padding: 0.5rem;
  border: 1px solid #444;
  border-radius: 6px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.3s ease;
  
  ${props => props.$variant === 'primary' ? `
    background: #2a2a2a;
    color: #ffffff;
    
    &:hover {
      background: #333;
      border-color: #666;
    }
  ` : props.$variant === 'danger' ? `
    background: transparent;
    color: #ff6b6b;
    border-color: #ff6b6b;
    
    &:hover {
      background: rgba(255, 107, 107, 0.1);
    }
  ` : `
    background: transparent;
    color: #888;
    
    &:hover {
      background: #2a2a2a;
      color: #ffffff;
    }
  `}
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 3rem;
  color: #666;
  grid-column: 1 / -1;
`;

const ErrorMessage = styled.div`
  color: #ff6b6b;
  background: rgba(255, 107, 107, 0.1);
  border: 1px solid rgba(255, 107, 107, 0.3);
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 2rem;
  text-align: center;
`;

const LoadingState = styled.div`
  text-align: center;
  padding: 3rem;
  color: #888;
  grid-column: 1 / -1;
`;

interface Product {
  id: string;
  name: string;
  category: string;
  sport: string;
  price: number;
  quantity: number;
  brand?: string;
  size?: string;
}

const ProductList: React.FC = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [sportFilter, setSportFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  useEffect(() => {
    loadProducts();
  }, []);

  useEffect(() => {
    filterProducts();
  }, [products, searchTerm, sportFilter, categoryFilter]);

  const loadProducts = async () => {
    console.log('🔄 DEBUG: Starting loadProducts function...');
    console.log('🔍 DEBUG: Current timestamp:', new Date().toISOString());
    
    try {
      setError('');
      const token = localStorage.getItem('token');
      const shopOwner = localStorage.getItem('shopOwner');
      
      console.log('🔍 DEBUG: Token from localStorage:', token ? `PRESENT (${token.substring(0, 20)}...)` : 'MISSING');
      console.log('🔍 DEBUG: Shop owner from localStorage:', shopOwner ? 'PRESENT' : 'MISSING');
      console.log(`🔍 DEBUG: Making request to ${API_BASE_URL}/api/products`);
      console.log('🔍 DEBUG: Request headers will include Authorization:', token ? 'YES' : 'NO');
      
      const requestHeaders: Record<string, string> = {
        'Content-Type': 'application/json'
      };
      
      if (token) {
        requestHeaders['Authorization'] = `Bearer ${token}`;
      }
      
      console.log('🔍 DEBUG: Final request headers:', requestHeaders);
      
      const response = await fetch(`${API_BASE_URL}/api/products`, {
        method: 'GET',
        headers: requestHeaders
      });

      console.log('📊 DEBUG: Response received!');
      console.log('📊 DEBUG: Response status:', response.status);
      console.log('📊 DEBUG: Response ok:', response.ok);
      console.log('� DEBUG: Response statusText:', response.statusText);
      console.log('� DEBUG: Response headers:', Object.fromEntries(response.headers.entries()));
      
      if (response.ok) {
        const responseText = await response.text();
        console.log('📊 DEBUG: Raw response text length:', responseText.length);
        console.log('📊 DEBUG: Raw response text preview:', responseText.substring(0, 200) + '...');
        
        try {
          const data = JSON.parse(responseText);
          console.log('✅ DEBUG: JSON parsed successfully!');
          console.log('✅ DEBUG: Products array length:', Array.isArray(data) ? data.length : 'NOT AN ARRAY');
          console.log('✅ DEBUG: Products data type:', typeof data);
          
          if (Array.isArray(data) && data.length > 0) {
            console.log('🔍 DEBUG: First product:', data[0]);
            console.log('🔍 DEBUG: Product properties:', Object.keys(data[0]));
          }
          
          setProducts(data);
          console.log('✅ DEBUG: Products state updated successfully');
        } catch (parseError) {
          console.error('❌ DEBUG: JSON parse error:', parseError);
          setError('Failed to parse server response');
        }
      } else {
        const errorText = await response.text();
        console.error('❌ DEBUG: HTTP Error Response:', response.status, response.statusText);
        console.error('❌ DEBUG: Error response body:', errorText);
        setError(`API Error: ${response.status} ${response.statusText} - ${errorText}`);
      }
    } catch (error: unknown) {
      console.error('💥 DEBUG: Network/Fetch error caught:', error);
      if (error instanceof Error) {
        console.error('💥 DEBUG: Error name:', error.name);
        console.error('💥 DEBUG: Error message:', error.message);
        console.error('💥 DEBUG: Error stack:', error.stack);
        console.error('💥 DEBUG: Full error object:', error);
        setError(`Network Error: ${error.message} (Check console for details)`);
      } else {
        console.error('💥 DEBUG: Non-Error value thrown');
        setError('Network Error: Unknown error occurred');
      }
    } finally {
      setIsLoading(false);
      console.log('🏁 DEBUG: loadProducts function completed');
    }
  };

  const filterProducts = () => {
    let filtered = products;

    if (searchTerm) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (product.brand && product.brand.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (sportFilter) {
      filtered = filtered.filter(product => product.sport === sportFilter);
    }

    if (categoryFilter) {
      filtered = filtered.filter(product => product.category === categoryFilter);
    }

    setFilteredProducts(filtered);
  };
  const handleDelete = async (productId: string) => {
    if (!confirm('Are you sure you want to delete this product?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/products/${productId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        setProducts(products.filter(p => p.id !== productId));
      }
    } catch (error) {
      console.error('Failed to delete product:', error);
    }
  };

  const handleEdit = (productId: string) => {
    navigate(`/admin/products/edit/${productId}`);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const uniqueSports = [...new Set(products.map(p => p.sport))];
  const uniqueCategories = [...new Set(products.map(p => p.category))];

  return (
    <Container>
      <Header>
        <HeaderLeft>
          <BackButton onClick={() => navigate('/admin')}>←</BackButton>
          <Title>Product Inventory</Title>
        </HeaderLeft>
        <AddButton onClick={() => navigate('/admin/products/new')}>
          + Add Product
        </AddButton>
      </Header>
      
      <Content>
        {error && <ErrorMessage>{error}</ErrorMessage>}
        
        <FiltersSection>
          <FilterGroup>
            <FilterLabel>Search</FilterLabel>
            <SearchInput
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </FilterGroup>
          
          <FilterGroup>
            <FilterLabel>Sport</FilterLabel>
            <FilterSelect
              value={sportFilter}
              onChange={(e) => setSportFilter(e.target.value)}
            >
              <option value="">All Sports</option>
              {uniqueSports.map(sport => (
                <option key={sport} value={sport}>
                  {sport.charAt(0).toUpperCase() + sport.slice(1)}
                </option>
              ))}
            </FilterSelect>
          </FilterGroup>
          
          <FilterGroup>
            <FilterLabel>Category</FilterLabel>
            <FilterSelect
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="">All Categories</option>
              {uniqueCategories.map(category => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </FilterSelect>
          </FilterGroup>
        </FiltersSection>

        <ProductsGrid>
          {isLoading ? (
            <LoadingState>Loading products...</LoadingState>
          ) : filteredProducts.length === 0 ? (
            <EmptyState>
              {products.length === 0 ? (
                <p>No products yet. Start by adding your first product!</p>
              ) : (
                <p>No products match your filters.</p>
              )}
            </EmptyState>
          ) : (
            filteredProducts.map((product) => (
              <ProductCard key={product.id}>
                <ProductHeader>
                  <ProductName>{product.name}</ProductName>
                  <StockBadge $lowStock={product.quantity < 5}>
                    {product.quantity} in stock
                  </StockBadge>
                </ProductHeader>
                
                <ProductMeta>
                  <MetaItem>
                    <MetaLabel>Price: </MetaLabel>
                    <MetaValue>{formatCurrency(product.price)}</MetaValue>
                  </MetaItem>
                  <MetaItem>
                    <MetaLabel>Sport: </MetaLabel>
                    <MetaValue>{product.sport}</MetaValue>
                  </MetaItem>
                  <MetaItem>
                    <MetaLabel>Category: </MetaLabel>
                    <MetaValue>{product.category}</MetaValue>
                  </MetaItem>
                  {product.brand && (
                    <MetaItem>
                      <MetaLabel>Brand: </MetaLabel>
                      <MetaValue>{product.brand}</MetaValue>
                    </MetaItem>
                  )}
                </ProductMeta>
                  <ProductActions>
                  <ActionButton 
                    $variant="primary"
                    onClick={() => handleEdit(product.id)}
                  >
                    Edit
                  </ActionButton>
                  <ActionButton 
                    $variant="danger"
                    onClick={() => handleDelete(product.id)}
                  >
                    Delete
                  </ActionButton>
                </ProductActions>
              </ProductCard>
            ))
          )}
        </ProductsGrid>
      </Content>
    </Container>
  );
};

export default ProductList;
