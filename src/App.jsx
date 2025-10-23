import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';

// Pages
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import MessagesPage from './pages/MessagesPage';

/**
 * Thème Material-UI personnalisé
 */
const theme = createTheme({
  palette: {
    primary: {
      main: '#667eea',
    },
    secondary: {
      main: '#764ba2',
    },
  },
  typography: {
    fontFamily: '"Segoe UI", "Roboto", "Arial", sans-serif',
  },
});

/**
 * Composant principal de l'application
 * 
 * AVANTAGE ZUSTAND : Pas besoin de Provider ! 
 * Le store est accessible partout directement via les hooks
 */
function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <Routes>
          {/* Route par défaut */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          
          {/* Route de connexion */}
          <Route path="/login" element={<LoginPage />} />
          
          {/* Route de messagerie */}
          <Route path="/messages" element={<MessagesPage />} />
          <Route path="/messages/user/:userId" element={<MessagesPage />} />
          <Route path="/messages/room/:roomId" element={<MessagesPage />} />
          
          {/* Route d'inscription */}
          <Route path="/register" element={<RegisterPage />} />
          
          {/* Route 404 */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
