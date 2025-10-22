import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Button,
  AppBar,
  Toolbar,
  IconButton,
} from '@mui/material';
import { Logout as LogoutIcon, Message as MessageIcon } from '@mui/icons-material';
import { useAuthStore } from '../store/authStore';

/**
 * Page principale de messagerie (placeholder)
 * Utilise Zustand pour le state management
 * Sera complétée dans les prochaines étapes
 */
const MessagesPage = () => {
  const navigate = useNavigate();
  
  // Zustand : récupération de l'état et des actions
  const { user, isAuthenticated, logout } = useAuthStore();

  // Redirection si non connecté
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
      {/* AppBar avec déconnexion */}
      <AppBar position="static">
        <Toolbar>
          <MessageIcon sx={{ mr: 2 }} />
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            URC Messaging
          </Typography>
          <Typography variant="body1" sx={{ mr: 2 }}>
            {user?.username}
          </Typography>
          <IconButton color="inherit" onClick={handleLogout}>
            <LogoutIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      {/* Contenu principal */}
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Typography variant="h4" gutterBottom>
          Bienvenue, {user?.username} ! 👋
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          Vous êtes connecté avec succès. La messagerie sera implémentée dans
          les prochaines étapes du TP.
        </Typography>

        <Box sx={{ mt: 4, p: 3, backgroundColor: 'white', borderRadius: 2 }}>
          <Typography variant="h6" gutterBottom>
            🚀 Prochaines étapes
          </Typography>
          <Typography variant="body2" component="div">
            <ul>
              <li>Créer la page d'inscription</li>
              <li>Implémenter la liste des utilisateurs</li>
              <li>Développer le système de messagerie</li>
              <li>Intégrer les notifications push</li>
              <li>Ajouter les salons de discussion</li>
            </ul>
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default MessagesPage;
