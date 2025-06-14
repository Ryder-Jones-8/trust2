import React, { useState } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import type { ProductSpecifications, SpecificationRange } from '../types';

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

const Form = styled.form`
  background: #1a1a1a;
  border: 1px solid #333;
  border-radius: 12px;
  padding: 2rem;
`;

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
`;

const Label = styled.label`
  color: #ccc;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
  font-weight: 500;
`;

const Input = styled.input`
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

const Select = styled.select`
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
  
  option {
    background: #2a2a2a;
    color: #ffffff;
  }
`;

const TextArea = styled.textarea`
  padding: 1rem;
  background: #2a2a2a;
  border: 1px solid #444;
  border-radius: 8px;
  color: #ffffff;
  font-size: 1rem;
  min-height: 120px;
  resize: vertical;
  
  &:focus {
    outline: none;
    border-color: #666;
  }
  
  &::placeholder {
    color: #666;
  }
`;

const SpecsSection = styled.div`
  background: #2a2a2a;
  border: 1px solid #444;
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
`;

const SpecsTitle = styled.h3`
  color: #ffffff;
  margin: 0 0 1rem 0;
  font-size: 1.1rem;
  font-weight: 500;
`;

const RangeGroup = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr auto;
  gap: 0.5rem;
  align-items: end;
  margin-bottom: 1rem;
`;

const RangeLabel = styled.label`
  color: #ccc;
  font-size: 0.8rem;
  margin-bottom: 0.25rem;
`;

const SmallInput = styled(Input)`
  padding: 0.75rem;
  font-size: 0.9rem;
`;

const UnitLabel = styled.span`
  color: #999;
  font-size: 0.9rem;
  padding: 0.75rem 0;
`;

const CheckboxGroup = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 0.5rem;
`;

const CheckboxLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #ccc;
  font-size: 0.9rem;
  cursor: pointer;
`;

const Checkbox = styled.input`
  width: 16px;
  height: 16px;
  accent-color: #ffffff;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
`;

const Button = styled.button<{ variant?: 'primary' | 'secondary' }>`
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

const ErrorMessage = styled.div`
  color: #ff6b6b;
  margin-top: 0.5rem;
  font-size: 0.9rem;
`;

const SuccessMessage = styled.div`
  color: #4ecdc4;
  margin-top: 0.5rem;
  font-size: 0.9rem;
`;

const sportCategories = {
  surf: ['Boards', 'Wetsuits', 'Fins'],
  ski: ['Snowboards', 'Skis', 'Snowboard Boots', 'Ski Boots', 'Helmets', 'Goggles'],
  skate: ['Decks', 'Trucks', 'Wheels', 'Helmets']
};

const AddProduct: React.FC = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
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
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
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
    });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Please select a valid image file');
        return;
      }
      
      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        setError('Image file must be less than 5MB');
        return;
      }
      
      setImageFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('token');
      console.log('Submitting product with token:', token ? 'present' : 'missing');
      
      // Create FormData for file upload
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      formDataToSend.append('brand', formData.brand);
      formDataToSend.append('category', formData.category);
      formDataToSend.append('sport', formData.sport);
      formDataToSend.append('price', formData.price);
      // Backend expects the quantity field for inventory count
      formDataToSend.append('quantity', formData.stock);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('features', JSON.stringify(formData.features.split(',').map(f => f.trim()).filter(f => f)));
      formDataToSend.append('specifications', JSON.stringify(specifications));
      
      // Add image file if selected
      if (imageFile) {
        formDataToSend.append('image', imageFile);
      }

      console.log('Form data being sent:', {
        name: formData.name,
        brand: formData.brand,
        category: formData.category,
        sport: formData.sport,
        price: formData.price,
        quantity: formData.stock,
        description: formData.description,
        specifications: specifications,
        hasImage: !!imageFile
      });

      const response = await fetch('http://localhost:3001/api/products', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
          // Don't set Content-Type when using FormData - browser will set it with boundary
        },
        body: formDataToSend
      });

      const data = await response.json();
      console.log('API Response:', response.status, data);

      if (response.ok) {
        setSuccess('Product added successfully!');
        // Reset form
        setFormData({
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
        setSpecifications({});
        setImageFile(null);
        setImagePreview(null);
        // Optionally navigate back to product list after success
        setTimeout(() => {
          navigate('/admin/products');
        }, 2000);
      } else {
        console.error('API Error Response:', data);
        setError(data.error || data.message || `Failed to add product (${response.status})`);
      }
    } catch (err) {
      console.error('Network Error:', err);
      setError('Network error. Please check your connection and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    navigate('/admin');
  };

  const availableCategories = formData.sport ? sportCategories[formData.sport as keyof typeof sportCategories] || [] : [];

  return (
    <Container>
      <Header>
        <BackButton onClick={handleBack}>←</BackButton>
        <Title>Add New Product</Title>
      </Header>
      
      <FormContainer>
        <Form onSubmit={handleSubmit}>
          <FormGrid>
            <FormGroup>
              <Label htmlFor="name">Product Name *</Label>
              <Input
                id="name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="e.g., Burton Custom Snowboard"
                required
              />
            </FormGroup>
            
            <FormGroup>
              <Label htmlFor="brand">Brand</Label>
              <Input
                id="brand"
                name="brand"
                type="text"
                value={formData.brand}
                onChange={handleInputChange}
                placeholder="e.g., Burton, Patagonia"
              />
            </FormGroup>
            
            <FormGroup>
              <Label htmlFor="sport">Sport *</Label>
              <Select
                id="sport"
                name="sport"
                value={formData.sport}
                onChange={handleInputChange}
                required
              >
                <option value="">Select Sport</option>
                <option value="surf">Surfing</option>
                <option value="ski">Skiing/Snowboarding</option>
                <option value="skate">Skating</option>
              </Select>
            </FormGroup>
            
            <FormGroup>
              <Label htmlFor="category">Category *</Label>
              <Select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                required
                disabled={!formData.sport}
              >
                <option value="">Select Category</option>
                {availableCategories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </Select>
            </FormGroup>
            
            <FormGroup>
              <Label htmlFor="price">Price ($) *</Label>
              <Input
                id="price"
                name="price"
                type="number"
                step="0.01"
                min="0"
                value={formData.price}
                onChange={handleInputChange}
                placeholder="299.99"
                required
              />
            </FormGroup>
            
            <FormGroup>
              <Label htmlFor="stock">Stock Quantity *</Label>
              <Input
                id="stock"
                name="stock"
                type="number"
                min="0"
                value={formData.stock}
                onChange={handleInputChange}
                placeholder="10"
                required
              />
            </FormGroup>
            
            <FormGroup>
              <Label htmlFor="size">Size/Dimensions</Label>
              <Input
                id="size"
                name="size"
                type="text"
                value={formData.size}
                onChange={handleInputChange}
                placeholder="e.g., 158cm, Large, 8.5"
              />
            </FormGroup>
          </FormGrid>
          
          <FormGroup style={{ marginBottom: '1.5rem' }}>
            <Label htmlFor="description">Description</Label>
            <TextArea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Detailed product description..."
            />
          </FormGroup>

          {/* Image Upload Section */}
          <ImageUploadSection>
            <ImageUploadTitle>Product Image</ImageUploadTitle>
            <ImageUploadContainer>
              <ImageUploadArea>
                <FileInput
                  id="image-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                />
                <FileInputLabel htmlFor="image-upload">
                  Choose Image
                </FileInputLabel>
                <p style={{ margin: '0.5rem 0 0 0', color: '#888', fontSize: '0.8rem' }}>
                  Maximum file size: 5MB
                </p>
                <p style={{ margin: '0.25rem 0 0 0', color: '#888', fontSize: '0.8rem' }}>
                  Supported formats: JPG, PNG, GIF, WebP
                </p>
              </ImageUploadArea>
              
              <ImagePreview>
                {imagePreview ? (
                  <div>
                    <img src={imagePreview} alt="Product preview" />
                    <RemoveImageButton onClick={handleRemoveImage}>
                      Remove Image
                    </RemoveImageButton>
                  </div>
                ) : (
                  <ImagePlaceholder>
                    No image selected
                  </ImagePlaceholder>
                )}
              </ImagePreview>
            </ImageUploadContainer>
          </ImageUploadSection>

          {/* Specifications Section */}
          {formData.category && (
            <SpecsSection>
              <SpecsTitle>Product Specifications</SpecsTitle>
              
              {/* Wetsuit Specifications */}
              {formData.category === 'Wetsuits' && (
                <>                  <RangeGroup>
                    <div>
                      <RangeLabel>Height Range</RangeLabel>
                      <SmallInput
                        type="number"
                        step="0.1"
                        placeholder="Min (ft)"
                        onChange={(e) => handleRangeChange('heightRange', 'min', e.target.value, 'ft')}
                      />
                    </div>
                    <div>
                      <RangeLabel>&nbsp;</RangeLabel>
                      <SmallInput
                        type="number"
                        step="0.1"
                        placeholder="Max (ft)"
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
                        onChange={(e) => handleRangeChange('weightRange', 'min', e.target.value, 'lbs')}
                      />
                    </div>
                    <div>
                      <RangeLabel>&nbsp;</RangeLabel>
                      <SmallInput
                        type="number"
                        placeholder="Max (lbs)"
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
                        onChange={(e) => handleRangeChange('chestSizeRange', 'min', e.target.value, 'in')}
                      />
                    </div>
                    <div>
                      <RangeLabel>&nbsp;</RangeLabel>
                      <SmallInput
                        type="number"
                        placeholder="Max (in)"
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
                        onChange={(e) => handleRangeChange('waterTempRange', 'min', e.target.value, '°F')}
                      />
                    </div>
                    <div>
                      <RangeLabel>&nbsp;</RangeLabel>
                      <SmallInput
                        type="number"
                        placeholder="Max (°F)"
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
              {(formData.category === 'Snowboards' || formData.category === 'Skis') && (
                <>                  <RangeGroup>
                    <div>
                      <RangeLabel>Length Range</RangeLabel>
                      <SmallInput
                        type="number"
                        placeholder="Min (in)"
                        onChange={(e) => handleRangeChange('lengthRange', 'min', e.target.value, 'in')}
                      />
                    </div>
                    <div>
                      <RangeLabel>&nbsp;</RangeLabel>
                      <SmallInput
                        type="number"
                        placeholder="Max (in)"
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
                        onChange={(e) => handleRangeChange('weightCapacityRange', 'min', e.target.value, 'lbs')}
                      />
                    </div>
                    <div>
                      <RangeLabel>&nbsp;</RangeLabel>
                      <SmallInput
                        type="number"
                        placeholder="Max (lbs)"
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
                            onChange={(e) => handleArrayChange('ridingStyleOptions', style, e.target.checked)}
                          />
                          {style}
                        </CheckboxLabel>
                      ))}
                    </CheckboxGroup>
                  </div>
                </>
              )}

              {/* Skateboard Specifications */}
              {formData.category === 'Decks' && (
                <>
                  <RangeGroup>
                    <div>
                      <RangeLabel>Deck Width Range</RangeLabel>
                      <SmallInput
                        type="number"
                        step="0.1"
                        placeholder="Min"
                        onChange={(e) => handleRangeChange('deckWidthRange', 'min', e.target.value, 'inches')}
                      />
                    </div>
                    <div>
                      <RangeLabel>&nbsp;</RangeLabel>
                      <SmallInput
                        type="number"
                        step="0.1"
                        placeholder="Max"
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
              {formData.category === 'Wheels' && (
                <>                  <RangeGroup>
                    <div>
                      <RangeLabel>Wheel Diameter Range</RangeLabel>
                      <SmallInput
                        type="number"
                        step="0.1"
                        placeholder="Min (in)"
                        onChange={(e) => handleRangeChange('wheelDiameterRange', 'min', e.target.value, 'in')}
                      />
                    </div>
                    <div>
                      <RangeLabel>&nbsp;</RangeLabel>
                      <SmallInput
                        type="number"
                        step="0.1"
                        placeholder="Max (in)"
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
                        onChange={(e) => handleRangeChange('durometer', 'min', e.target.value, 'A')}
                      />
                    </div>
                    <div>
                      <RangeLabel>&nbsp;</RangeLabel>
                      <SmallInput
                        type="number"
                        placeholder="Max"
                        onChange={(e) => handleRangeChange('durometer', 'max', e.target.value, 'A')}
                      />
                    </div>
                    <UnitLabel>A</UnitLabel>
                  </RangeGroup>
                </>
              )}

              {/* Helmet Specifications */}
              {formData.category === 'Helmets' && (                <RangeGroup>
                  <div>
                    <RangeLabel>Head Circumference Range</RangeLabel>
                    <SmallInput
                      type="number"
                      step="0.1"
                      placeholder="Min (in)"
                      onChange={(e) => handleRangeChange('headCircumferenceRange', 'min', e.target.value, 'in')}
                    />
                  </div>
                  <div>
                    <RangeLabel>&nbsp;</RangeLabel>
                    <SmallInput
                      type="number"
                      step="0.1"
                      placeholder="Max (in)"
                      onChange={(e) => handleRangeChange('headCircumferenceRange', 'max', e.target.value, 'in')}
                    />
                  </div>
                  <UnitLabel>in</UnitLabel>
                </RangeGroup>
              )}

              {/* Boot Specifications */}
              {(formData.category === 'Snowboard Boots' || formData.category === 'Ski Boots') && (
                <div>
                  <Label>Available Sizes</Label>
                  <CheckboxGroup>
                    {['6', '6.5', '7', '7.5', '8', '8.5', '9', '9.5', '10', '10.5', '11', '11.5', '12', '13'].map(size => (
                      <CheckboxLabel key={size}>
                        <Checkbox
                          type="checkbox"
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
          
          <FormGroup style={{ marginBottom: '2rem' }}>
            <Label htmlFor="features">Features (comma-separated)</Label>
            <Input
              id="features"
              name="features"
              type="text"
              value={formData.features}
              onChange={handleInputChange}
              placeholder="Waterproof, Lightweight, Durable"
            />
          </FormGroup>
          
          <ButtonGroup>
            <Button type="button" onClick={handleBack}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={isLoading}>
              {isLoading ? 'Adding...' : 'Add Product'}
            </Button>
          </ButtonGroup>
          
          {error && <ErrorMessage>{error}</ErrorMessage>}
          {success && <SuccessMessage>{success}</SuccessMessage>}
        </Form>
      </FormContainer>
    </Container>
  );
};

export default AddProduct;

// Styled components
const FormContainer = styled.div`
  padding: 2rem;
  max-width: 800px;
  margin: 0 auto;
`;

const ImageUploadSection = styled.section`
  margin-bottom: 2rem;
`;

const ImageUploadTitle = styled.h3`
  color: #fff;
  font-size: 1.1rem;
  font-weight: 500;
  margin-bottom: 1rem;
`;

const ImageUploadContainer = styled.div`
  display: flex;
  gap: 2rem;
  align-items: flex-start;
`;

const ImageUploadArea = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
`;

const FileInput = styled.input`
  display: none;
`;

const FileInputLabel = styled.label`
  background: #2a2a2a;
  color: #fff;
  border: 1px solid #444;
  border-radius: 8px;
  padding: 0.75rem 1.5rem;
  font-size: 0.95rem;
  font-weight: 500;
  cursor: pointer;
  margin-bottom: 0.5rem;
  transition: all 0.2s;
  &:hover {
    background: #333;
    border-color: #666;
  }
`;

const ImagePreview = styled.div`
  min-width: 160px;
  min-height: 160px;
  background: #181818;
  border: 1px solid #333;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  img {
    max-width: 160px;
    max-height: 160px;
    border-radius: 8px;
    display: block;
  }
`;

const RemoveImageButton = styled.button`
  background: transparent;
  color: #ff6b6b;
  border: none;
  font-size: 0.95rem;
  margin-top: 0.5rem;
  cursor: pointer;
  &:hover {
    text-decoration: underline;
  }
`;

const ImagePlaceholder = styled.div`
  color: #888;
  font-size: 0.95rem;
  text-align: center;
`;
