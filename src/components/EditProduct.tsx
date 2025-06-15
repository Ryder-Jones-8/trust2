import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate, useParams } from 'react-router-dom';
import type { ProductSpecifications, SpecificationRange } from '../types';

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
  padding: 2rem;
  max-width: 800px;
  margin: 0 auto;
`;

const Form = styled.form`
  background: linear-gradient(135deg, #18181c 0%, #23232a 100%);
  border: 1px solid #333;
  border-radius: 12px;
  padding: 2rem;
`;

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
  margin-bottom: 1.5rem;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const Label = styled.label`
  font-size: 0.9rem;
  color: #888;
  font-weight: 500;
`;

const Input = styled.input`
  padding: 0.75rem;
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

const Select = styled.select`
  padding: 0.75rem;
  background: #2a2a2a;
  border: 1px solid #444;
  border-radius: 8px;
  color: #ffffff;
  font-size: 1rem;
  
  &:focus {
    outline: none;
    border-color: #666;
  }
  
  option {
    background: #2a2a2a;
    color: #ffffff;
  }
`;

const TextArea = styled.textarea`
  padding: 0.75rem;
  background: #2a2a2a;
  border: 1px solid #444;
  border-radius: 8px;
  color: #ffffff;
  font-size: 1rem;
  min-height: 100px;
  resize: vertical;
  font-family: inherit;
  
  &:focus {
    outline: none;
    border-color: #666;
  }
  
  &::placeholder {
    color: #666;
  }
`;

const FullWidthGroup = styled(FormGroup)`
  grid-column: 1 / -1;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 2rem;
`;

const Button = styled.button<{ variant?: 'primary' | 'secondary' }>`
  padding: 0.75rem 2rem;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  
  ${props => props.variant === 'primary' ? `
    background: #ffffff;
    color: #000000;
    
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
  ` : `
    background: transparent;
    color: #888;
    border: 1px solid #444;
    
    &:hover {
      background: #2a2a2a;
      color: #ffffff;
      border-color: #666;
    }
  `}
`;

const ErrorMessage = styled.div`
  background: rgba(255, 107, 107, 0.1);
  border: 1px solid #ff6b6b;
  border-radius: 8px;
  padding: 1rem;
  color: #ff6b6b;
  margin-bottom: 1rem;
`;

const SuccessMessage = styled.div`
  background: rgba(76, 205, 196, 0.1);
  border: 1px solid #4ecdc4;
  border-radius: 8px;
  padding: 1rem;
  color: #4ecdc4;
  margin-bottom: 1rem;
`;

const LoadingState = styled.div`
  text-align: center;
  padding: 3rem;
  color: #888;
`;

const SpecsSection = styled.div`
  background: #2a2a2a;
  border-radius: 8px;
  padding: 1.5rem;
  margin: 1.5rem 0;
`;

const SpecsTitle = styled.h3`
  color: #ffffff;
  font-size: 1.1rem;
  font-weight: 500;
  margin: 0 0 1rem 0;
`;

const RangeGroup = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr auto;
  gap: 0.5rem;
  align-items: end;
  margin-bottom: 1rem;
`;

const RangeLabel = styled.label`
  font-size: 0.8rem;
  color: #888;
  font-weight: 500;
  margin-bottom: 0.25rem;
  display: block;
`;

const SmallInput = styled(Input)`
  padding: 0.5rem;
  font-size: 0.9rem;
`;

const UnitLabel = styled.span`
  color: #888;
  font-size: 0.8rem;
  padding: 0.5rem;
`;

const CheckboxGroup = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 0.5rem;
  margin-top: 0.5rem;
`;

const CheckboxLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #ffffff;
  font-size: 0.9rem;
  cursor: pointer;
`;

const Checkbox = styled.input`
  accent-color: #ffffff;
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
  description?: string;
  features: string[];
  specifications?: ProductSpecifications;
}

const sportCategories = {
  surf: ['boards', 'wetsuits', 'fins'],
  ski: ['snowboards', 'skis', 'ski boots', 'snowboard boots', 'helmets', 'goggles'],
  skate: ['decks', 'trucks', 'wheels', 'helmets']
};

const EditProduct: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    sport: '',
    category: '',
    price: '',
    stock: '',
    description: '',
    brand: '',
    size: '',
    features: ''
  });
  const [specifications, setSpecifications] = useState<ProductSpecifications>({});

  useEffect(() => {
    if (id) {
      loadProduct();
    }
  }, [id]);

  const loadProduct = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3001/api/products', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const products = await response.json();
        const product = products.find((p: Product) => p.id === id);        if (product) {
          setFormData({
            name: product.name,
            sport: product.sport,
            category: product.category,
            price: product.price.toString(),
            stock: product.quantity.toString(),
            description: product.description || '',
            brand: product.brand || '',
            size: product.size || '',
            features: Array.isArray(product.features) ? product.features.join(', ') : ''
          });
          setSpecifications(product.specifications || {});
        } else {
          setError('Product not found');
        }
      } else {
        setError('Failed to load product');
      }
    } catch (err) {
      console.error(err);
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
      // Reset category when sport changes
      ...(name === 'sport' ? { category: '' } : {})
    }));
  };

  const handleRangeChange = (field: string, type: 'min' | 'max', value: string, unit: string) => {
    setSpecifications(prev => ({
      ...prev,
      [field]: {
        ...prev[field as keyof ProductSpecifications] as SpecificationRange,
        [type]: parseFloat(value) || 0,
        unit
      }
    }));
  };

  const handleArrayChange = (field: string, option: string, checked: boolean) => {
    setSpecifications(prev => {
      const currentArray = (prev[field as keyof ProductSpecifications] as string[]) || [];
      if (checked) {
        return {
          ...prev,
          [field]: [...currentArray, option]
        };
      } else {
        return {
          ...prev,
          [field]: currentArray.filter(item => item !== option)
        };
      }
    });  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3001/api/products/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },        body: JSON.stringify({
          ...formData,
          price: parseFloat(formData.price),
          quantity: parseInt(formData.stock),
          features: formData.features.split(',').map(f => f.trim()).filter(f => f),
          specifications
        })
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('Product updated successfully!');
        setTimeout(() => {
          navigate('/admin/products');
        }, 1500);
      } else {
        setError(data.error || 'Failed to update product');
      }
    } catch (err) {
      console.error(err);
      setError('Network error. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleBack = () => {
    navigate('/admin/products');
  };

  const availableCategories = formData.sport ? sportCategories[formData.sport as keyof typeof sportCategories] || [] : [];

  if (isLoading) {
    return (
      <Container>
        <Header>
          <BackButton onClick={handleBack}>←</BackButton>
          <Title>Edit Product</Title>
        </Header>
        <Content>
          <LoadingState>Loading product...</LoadingState>
        </Content>
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <BackButton onClick={handleBack}>←</BackButton>
        <Title>Edit Product</Title>
      </Header>
      
      <Content>
        {error && <ErrorMessage>{error}</ErrorMessage>}
        {success && <SuccessMessage>{success}</SuccessMessage>}
        
        <Form onSubmit={handleSubmit}>
          <FormGrid>
            <FormGroup>
              <Label>Product Name *</Label>
              <Input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Enter product name"
                required
              />
            </FormGroup>
            
            <FormGroup>
              <Label>Brand</Label>
              <Input
                type="text"
                name="brand"
                value={formData.brand}
                onChange={handleInputChange}
                placeholder="Enter brand name"
              />
            </FormGroup>
            
            <FormGroup>
              <Label>Sport *</Label>
              <Select
                name="sport"
                value={formData.sport}
                onChange={handleInputChange}
                required
              >
                <option value="">Select sport</option>
                <option value="surf">Surf</option>
                <option value="ski">Ski</option>
                <option value="skate">Skate</option>
              </Select>
            </FormGroup>
            
            <FormGroup>
              <Label>Category *</Label>
              <Select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                required
                disabled={!formData.sport}
              >
                <option value="">Select category</option>
                {availableCategories.map(category => (
                  <option key={category} value={category}>
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </option>
                ))}
              </Select>
            </FormGroup>
            
            <FormGroup>
              <Label>Price *</Label>
              <Input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleInputChange}
                placeholder="0.00"
                step="0.01"
                min="0"
                required
              />
            </FormGroup>
            
            <FormGroup>
              <Label>Stock Quantity *</Label>
              <Input
                type="number"
                name="stock"
                value={formData.stock}
                onChange={handleInputChange}
                placeholder="0"
                min="0"
                required
              />
            </FormGroup>
            
            <FormGroup>
              <Label>Size</Label>
              <Input
                type="text"
                name="size"
                value={formData.size}
                onChange={handleInputChange}
                placeholder="e.g., 8.5, M, L, 42"
              />
            </FormGroup>
            
            <FullWidthGroup>
              <Label>Description</Label>
              <TextArea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Product description..."
              />
            </FullWidthGroup>
              <FullWidthGroup>
              <Label>Features (comma-separated)</Label>
              <TextArea
                name="features"
                value={formData.features}
                onChange={handleInputChange}
                placeholder="e.g., Lightweight, Durable, Waterproof"
              />
            </FullWidthGroup>
          </FormGrid>

          {/* Specifications Section */}
          {formData.category && (
            <SpecsSection>
              <SpecsTitle>Product Specifications</SpecsTitle>
              
              {/* Wetsuit Specifications */}
              {formData.category === 'wetsuits' && (
                <>                  <RangeGroup>
                    <div>
                      <RangeLabel>Height Range</RangeLabel>
                      <SmallInput
                        type="number"
                        step="0.1"
                        placeholder="Min (ft)"
                        value={specifications.heightRange?.min || ''}
                        onChange={(e) => handleRangeChange('heightRange', 'min', e.target.value, 'ft')}
                      />
                    </div>
                    <div>
                      <RangeLabel>&nbsp;</RangeLabel>
                      <SmallInput
                        type="number"
                        step="0.1"
                        placeholder="Max (ft)"
                        value={specifications.heightRange?.max || ''}
                        onChange={(e) => handleRangeChange('heightRange', 'max', e.target.value, 'ft')}
                      />
                    </div>
                    <UnitLabel>ft</UnitLabel>
                  </RangeGroup>                  <RangeGroup>
                    <div>
                      <RangeLabel>Weight Range</RangeLabel>
                      <SmallInput
                        type="number"
                        placeholder="Min (lbs)"
                        value={specifications.weightRange?.min || ''}
                        onChange={(e) => handleRangeChange('weightRange', 'min', e.target.value, 'lbs')}
                      />
                    </div>
                    <div>
                      <RangeLabel>&nbsp;</RangeLabel>
                      <SmallInput
                        type="number"
                        placeholder="Max (lbs)"
                        value={specifications.weightRange?.max || ''}
                        onChange={(e) => handleRangeChange('weightRange', 'max', e.target.value, 'lbs')}
                      />
                    </div>
                    <UnitLabel>lbs</UnitLabel>
                  </RangeGroup>                  <RangeGroup>
                    <div>
                      <RangeLabel>Chest Size Range</RangeLabel>
                      <SmallInput
                        type="number"
                        placeholder="Min (in)"
                        value={specifications.chestSizeRange?.min || ''}
                        onChange={(e) => handleRangeChange('chestSizeRange', 'min', e.target.value, 'in')}
                      />
                    </div>
                    <div>
                      <RangeLabel>&nbsp;</RangeLabel>
                      <SmallInput
                        type="number"
                        placeholder="Max (in)"
                        value={specifications.chestSizeRange?.max || ''}
                        onChange={(e) => handleRangeChange('chestSizeRange', 'max', e.target.value, 'in')}
                      />
                    </div>
                    <UnitLabel>in</UnitLabel>
                  </RangeGroup>                  <RangeGroup>
                    <div>
                      <RangeLabel>Water Temperature Range</RangeLabel>
                      <SmallInput
                        type="number"
                        placeholder="Min (°F)"
                        value={specifications.waterTempRange?.min || ''}
                        onChange={(e) => handleRangeChange('waterTempRange', 'min', e.target.value, '°F')}
                      />
                    </div>
                    <div>
                      <RangeLabel>&nbsp;</RangeLabel>
                      <SmallInput
                        type="number"
                        placeholder="Max (°F)"
                        value={specifications.waterTempRange?.max || ''}
                        onChange={(e) => handleRangeChange('waterTempRange', 'max', e.target.value, '°F')}
                      />
                    </div>
                    <UnitLabel>°F</UnitLabel>
                  </RangeGroup>

                  <div>
                    <Label>Thickness Options</Label>
                    <CheckboxGroup>
                      {['2mm', '3mm', '4mm', '5mm', '6mm'].map(thickness => (
                        <CheckboxLabel key={thickness}>
                          <Checkbox
                            type="checkbox"
                            checked={specifications.thicknessOptions?.includes(thickness) || false}
                            onChange={(e) => handleArrayChange('thicknessOptions', thickness, e.target.checked)}
                          />
                          {thickness}
                        </CheckboxLabel>
                      ))}
                    </CheckboxGroup>
                  </div>
                </>
              )}

              {/* Ski/Snowboard Specifications */}
              {(formData.category === 'snowboards' || formData.category === 'skis') && (
                <>                  <RangeGroup>
                    <div>
                      <RangeLabel>Length Range</RangeLabel>
                      <SmallInput
                        type="number"
                        placeholder="Min (in)"
                        value={specifications.lengthRange?.min || ''}
                        onChange={(e) => handleRangeChange('lengthRange', 'min', e.target.value, 'in')}
                      />
                    </div>
                    <div>
                      <RangeLabel>&nbsp;</RangeLabel>
                      <SmallInput
                        type="number"
                        placeholder="Max (in)"
                        value={specifications.lengthRange?.max || ''}
                        onChange={(e) => handleRangeChange('lengthRange', 'max', e.target.value, 'in')}
                      />
                    </div>
                    <UnitLabel>in</UnitLabel>
                  </RangeGroup>                  <RangeGroup>
                    <div>
                      <RangeLabel>Rider Weight Capacity</RangeLabel>
                      <SmallInput
                        type="number"
                        placeholder="Min (lbs)"
                        value={specifications.weightCapacityRange?.min || ''}
                        onChange={(e) => handleRangeChange('weightCapacityRange', 'min', e.target.value, 'lbs')}
                      />
                    </div>
                    <div>
                      <RangeLabel>&nbsp;</RangeLabel>
                      <SmallInput
                        type="number"
                        placeholder="Max (lbs)"
                        value={specifications.weightCapacityRange?.max || ''}
                        onChange={(e) => handleRangeChange('weightCapacityRange', 'max', e.target.value, 'lbs')}
                      />
                    </div>
                    <UnitLabel>lbs</UnitLabel>
                  </RangeGroup>

                  <div>
                    <Label>Experience Levels</Label>
                    <CheckboxGroup>
                      {['Beginner', 'Intermediate', 'Advanced', 'Expert'].map(level => (
                        <CheckboxLabel key={level}>
                          <Checkbox
                            type="checkbox"
                            checked={specifications.experienceLevel?.includes(level) || false}
                            onChange={(e) => handleArrayChange('experienceLevel', level, e.target.checked)}
                          />
                          {level}
                        </CheckboxLabel>
                      ))}
                    </CheckboxGroup>
                  </div>

                  <div>
                    <Label>Riding Styles</Label>
                    <CheckboxGroup>
                      {['All-Mountain', 'Freestyle', 'Freeride', 'Powder', 'Carving'].map(style => (
                        <CheckboxLabel key={style}>
                          <Checkbox
                            type="checkbox"
                            checked={specifications.ridingStyleOptions?.includes(style) || false}
                            onChange={(e) => handleArrayChange('ridingStyleOptions', style, e.target.checked)}
                          />
                          {style}
                        </CheckboxLabel>
                      ))}
                    </CheckboxGroup>
                  </div>
                </>
              )}

              {/* Skateboard Deck Specifications */}
              {formData.category === 'decks' && (
                <>
                  <RangeGroup>
                    <div>
                      <RangeLabel>Deck Width Range</RangeLabel>
                      <SmallInput
                        type="number"
                        step="0.1"
                        placeholder="Min"
                        value={specifications.deckWidthRange?.min || ''}
                        onChange={(e) => handleRangeChange('deckWidthRange', 'min', e.target.value, 'inches')}
                      />
                    </div>
                    <div>
                      <RangeLabel>&nbsp;</RangeLabel>
                      <SmallInput
                        type="number"
                        step="0.1"
                        placeholder="Max"
                        value={specifications.deckWidthRange?.max || ''}
                        onChange={(e) => handleRangeChange('deckWidthRange', 'max', e.target.value, 'inches')}
                      />
                    </div>
                    <UnitLabel>inches</UnitLabel>
                  </RangeGroup>

                  <div>
                    <Label>Experience Levels</Label>
                    <CheckboxGroup>
                      {['Beginner', 'Intermediate', 'Advanced'].map(level => (
                        <CheckboxLabel key={level}>
                          <Checkbox
                            type="checkbox"
                            checked={specifications.experienceLevel?.includes(level) || false}
                            onChange={(e) => handleArrayChange('experienceLevel', level, e.target.checked)}
                          />
                          {level}
                        </CheckboxLabel>
                      ))}
                    </CheckboxGroup>
                  </div>
                </>
              )}

              {/* Wheel Specifications */}
              {formData.category === 'wheels' && (
                <>                  <RangeGroup>
                    <div>
                      <RangeLabel>Wheel Diameter Range</RangeLabel>
                      <SmallInput
                        type="number"
                        step="0.1"
                        placeholder="Min (in)"
                        value={specifications.wheelDiameterRange?.min || ''}
                        onChange={(e) => handleRangeChange('wheelDiameterRange', 'min', e.target.value, 'in')}
                      />
                    </div>
                    <div>
                      <RangeLabel>&nbsp;</RangeLabel>
                      <SmallInput
                        type="number"
                        step="0.1"
                        placeholder="Max (in)"
                        value={specifications.wheelDiameterRange?.max || ''}
                        onChange={(e) => handleRangeChange('wheelDiameterRange', 'max', e.target.value, 'in')}
                      />
                    </div>
                    <UnitLabel>in</UnitLabel>
                  </RangeGroup>

                  <RangeGroup>
                    <div>
                      <RangeLabel>Durometer Range</RangeLabel>
                      <SmallInput
                        type="number"
                        placeholder="Min"
                        value={specifications.durometer?.min || ''}
                        onChange={(e) => handleRangeChange('durometer', 'min', e.target.value, 'A')}
                      />
                    </div>
                    <div>
                      <RangeLabel>&nbsp;</RangeLabel>
                      <SmallInput
                        type="number"
                        placeholder="Max"
                        value={specifications.durometer?.max || ''}
                        onChange={(e) => handleRangeChange('durometer', 'max', e.target.value, 'A')}
                      />
                    </div>
                    <UnitLabel>A</UnitLabel>
                  </RangeGroup>
                </>
              )}

              {/* Helmet Specifications */}
              {formData.category === 'helmets' && (                <RangeGroup>
                  <div>
                    <RangeLabel>Head Circumference Range</RangeLabel>
                    <SmallInput
                      type="number"
                      step="0.1"
                      placeholder="Min (in)"
                      value={specifications.headCircumferenceRange?.min || ''}
                      onChange={(e) => handleRangeChange('headCircumferenceRange', 'min', e.target.value, 'in')}
                    />
                  </div>
                  <div>
                    <RangeLabel>&nbsp;</RangeLabel>
                    <SmallInput
                      type="number"
                      step="0.1"
                      placeholder="Max (in)"
                      value={specifications.headCircumferenceRange?.max || ''}
                      onChange={(e) => handleRangeChange('headCircumferenceRange', 'max', e.target.value, 'in')}
                    />
                  </div>
                  <UnitLabel>in</UnitLabel>
                </RangeGroup>
              )}

              {/* Boot Specifications */}
              {(formData.category === 'snowboard boots' || formData.category === 'ski boots') && (
                <div>
                  <Label>Available Sizes</Label>
                  <CheckboxGroup>
                    {['6', '6.5', '7', '7.5', '8', '8.5', '9', '9.5', '10', '10.5', '11', '11.5', '12', '13'].map(size => (
                      <CheckboxLabel key={size}>
                        <Checkbox
                          type="checkbox"
                          checked={specifications.sizeOptions?.includes(size) || false}
                          onChange={(e) => handleArrayChange('sizeOptions', size, e.target.checked)}
                        />
                        {size}
                      </CheckboxLabel>
                    ))}
                  </CheckboxGroup>
                </div>
              )}
            </SpecsSection>
          )}
          
          <ButtonGroup>
            <Button type="button" variant="secondary" onClick={handleBack}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={isSaving}>
              {isSaving ? 'Updating...' : 'Update Product'}
            </Button>
          </ButtonGroup>
        </Form>
      </Content>
    </Container>
  );
};

export default EditProduct;
