import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import styled, { ThemeProvider, createGlobalStyle } from 'styled-components'
import { HomePage, SportPage, CategoryPage, RecommendationPage, EmployeeLogin, AdminDashboard, AddProduct, ProductList, ShopSettings, Analytics, EditProduct, ProtectedRoute } from './components'

const darkTheme = {
  colors: {
    primary: 'linear-gradient(135deg, #101014 0%, #18181c 100%)',
    secondary: '#1a1a1a',
    accent: '#2a2a2a',
    text: '#f5f5f5',
    textSecondary: '#b0b0b0',
    border: '#333333'
  },
  fonts: {
    primary: "'Inter', 'Helvetica Neue', Arial, sans-serif",
  }
}

const GlobalStyle = createGlobalStyle`
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  html, body, #root {
    margin: 0;
    padding: 0;
    width: 100%;
    height: 100%;
    overflow-x: hidden;
  }

  body {
    font-family: ${props => props.theme.fonts.primary};
    background: linear-gradient(135deg, #101014 0%, #18181c 100%);
    color: ${props => props.theme.colors.text};
    min-height: 100vh;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }
`

const AppContainer = styled.div`
  width: 100vw;
  height: 100vh;
  margin: 0;
  padding: 0;
  background: linear-gradient(135deg, #101014 0%, #18181c 100%);
`

function App() {
  return (
    <ThemeProvider theme={darkTheme}>
      <GlobalStyle />
      <AppContainer>
        <Router>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/sport/:sport" element={<SportPage />} />
            <Route path="/sport/:sport/category/:category" element={<CategoryPage />} />
            <Route path="/recommendations" element={<RecommendationPage />} />
            <Route path="/login" element={<EmployeeLogin />} />
            <Route path="/admin" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
            <Route path="/admin/products/new" element={<ProtectedRoute><AddProduct /></ProtectedRoute>} />
            <Route path="/admin/products" element={<ProtectedRoute><ProductList /></ProtectedRoute>} />
            <Route path="/admin/products/edit/:id" element={<ProtectedRoute><EditProduct /></ProtectedRoute>} />
            <Route path="/admin/settings" element={<ProtectedRoute><ShopSettings /></ProtectedRoute>} />
            <Route path="/admin/analytics" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
          </Routes>
        </Router>
      </AppContainer>
    </ThemeProvider>
  )
}

export default App
