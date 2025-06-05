# trust.

A tablet-based platform designed specifically for surf, ski, and skate shops to help customers find the perfect match for technical gear based on their personal characteristics and preferences.

## Features

- **Dark Mode Interface**: Minimalist, clean design optimized for tablets and iPads
- **Sport Categories**: Surfing, Skiing/Snowboarding, and Skating gear recommendations
- **Dynamic Input Forms**: Tailored questionnaires for each product category
- **Product Recommendation Engine**: Matches gear based on user inputs and preferences
- **Shop Inventory Integration**: Backend system for shops to manage their catalog

## Sports & Categories

### 🏄‍♀️ Surfing
- Boards (based on height, weight, experience, wave conditions)
- Wetsuits (based on size, water temperature, thickness preferences)
- Fins (based on board type, experience, fin setup, surf style)

### ⛷️ Skiing/Snowboarding
- Snowboards & Skis (based on height, weight, experience, riding style)
- Boots (based on foot measurements, experience, flex preferences)
- Helmets & Goggles (based on size, features, fit type)

### 🛹 Skating
- Decks (based on height, shoe size, skating style, width preferences)
- Trucks & Wheels (based on deck size, riding style, surface type)
- Helmets (based on head size, skating style, certification needs)

## Technology Stack

- **Frontend**: React 18 with TypeScript
- **Styling**: Styled Components with dark theme
- **Routing**: React Router DOM
- **Build Tool**: Vite
- **Platform**: Optimized for tablets and iPads

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to `http://localhost:5173` (or the port shown in terminal)

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default tseslint.config({
  extends: [
    // Remove ...tseslint.configs.recommended and replace with this
    ...tseslint.configs.recommendedTypeChecked,
    // Alternatively, use this for stricter rules
    ...tseslint.configs.strictTypeChecked,
    // Optionally, add this for stylistic rules
    ...tseslint.configs.stylisticTypeChecked,
  ],
  languageOptions: {
    // other options...
    parserOptions: {
      project: ['./tsconfig.node.json', './tsconfig.app.json'],
      tsconfigRootDir: import.meta.dirname,
    },
  },
})
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default tseslint.config({
  plugins: {
    // Add the react-x and react-dom plugins
    'react-x': reactX,
    'react-dom': reactDom,
  },
  rules: {
    // other rules...
    // Enable its recommended typescript rules
    ...reactX.configs['recommended-typescript'].rules,
    ...reactDom.configs.recommended.rules,
  },
})
```

## Usage

1. **Homepage**: Click on the sport icon (surfboard, skis, or skateboard) in the triangular layout
2. **Sport Selection**: Choose a specific category (e.g., Boards, Boots, Helmets)
3. **Input Form**: Fill out the personalized questionnaire with your measurements and preferences
4. **Recommendations**: View curated product recommendations with match percentages

## Project Structure

```
src/
├── components/           # React components
│   ├── HomePage.tsx     # Main landing page with sport selection
│   ├── SportPage.tsx    # Sport category selection
│   ├── CategoryPage.tsx # Dynamic input forms
│   └── RecommendationPage.tsx # Product recommendations
├── types/               # TypeScript type definitions
└── App.tsx             # Main app component with routing
```

## Design Philosophy

The platform follows a minimalist design approach with:
- Dark color scheme for reduced eye strain
- Clean typography and spacious layouts
- Intuitive navigation optimized for touch interfaces
- Responsive design that scales across different tablet sizes

## Future Enhancements

- Backend API integration for real shop inventory
- User profile management and saved preferences
- Advanced filtering and sorting options
- Shop admin dashboard for inventory management
- Integration with point-of-sale systems
