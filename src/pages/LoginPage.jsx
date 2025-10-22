import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
  Container,
  InputAdornment,
  IconButton,
  Link,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Login as LoginIcon,
  Message as MessageIcon,
} from '@mui/icons-material';
import { useAuthStore } from '../store/authStore';

/**
 * Page de connexion moderne et responsive
 * Utilise Zustand pour le state management (plus simple que Redux!)
 */
const LoginPage = () => {
  const navigate = useNavigate();
  
  // Zustand : récupération de l'état et des actions
  const { isAuthenticated, loading, error, login, clearError } = useAuthStore();

  const [credentials, setCredentials] = useState({
    username: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);

  // Redirection si déjà connecté
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/messages');
    }
  }, [isAuthenticated, navigate]);

  // Nettoyer les erreurs au démontage
  useEffect(() => {
    return () => {
      clearError();
    };
  }, [clearError]);

  const handleChange = (e) => {
    setCredentials({
      ...credentials,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearError();
    
    // Validation basique
    if (!credentials.username || !credentials.password) {
      return;
    }

    // Appel de l'action login du store Zustand
    const result = await login(credentials.username, credentials.password);
    
    if (result.success) {
      navigate('/messages');
    }
  };

  const handleTogglePassword = () => {
    setShowPassword(!showPassword);
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: 2,
      }}
    >
      <Container maxWidth="sm">
        <Card
          elevation={24}
          sx={{
            borderRadius: 4,
            overflow: 'hidden',
          }}
        >
          <Box
            sx={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              padding: 4,
              textAlign: 'center',
              color: 'white',
            }}
          >
            <MessageIcon sx={{ fontSize: 60, mb: 2 }} />
            <Typography variant="h4" fontWeight="bold" gutterBottom>
              URC Messaging
            </Typography>
            <Typography variant="body1" sx={{ opacity: 0.9 }}>
              Connexion à votre espace de messagerie
            </Typography>
          </Box>

          <CardContent sx={{ padding: 4 }}>
            <form onSubmit={handleSubmit}>
              {error && (
                <Alert severity="error" sx={{ mb: 3 }}>
                  {error}
                </Alert>
              )}

              <TextField
                fullWidth
                label="Nom d'utilisateur"
                name="username"
                value={credentials.username}
                onChange={handleChange}
                margin="normal"
                variant="outlined"
                required
                autoComplete="username"
                autoFocus
                disabled={loading}
              />

              <TextField
                fullWidth
                label="Mot de passe"
                name="password"
                type={showPassword ? 'text' : 'password'}
                value={credentials.password}
                onChange={handleChange}
                margin="normal"
                variant="outlined"
                required
                autoComplete="current-password"
                disabled={loading}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={handleTogglePassword}
                        edge="end"
                        disabled={loading}
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />

              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                disabled={loading}
                startIcon={loading ? <CircularProgress size={20} /> : <LoginIcon />}
                sx={{
                  mt: 3,
                  mb: 2,
                  py: 1.5,
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #5568d3 0%, #6941a0 100%)',
                  },
                }}
              >
                {loading ? 'Connexion en cours...' : 'Se connecter'}
              </Button>

              <Box sx={{ textAlign: 'center', mt: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Pas encore de compte ?{' '}
                  <Link
                    href="/register"
                    sx={{
                      color: '#667eea',
                      textDecoration: 'none',
                      fontWeight: 600,
                      '&:hover': {
                        textDecoration: 'underline',
                      },
                    }}
                  >
                    S'inscrire
                  </Link>
                </Typography>
              </Box>
            </form>
          </CardContent>
        </Card>

        <Box sx={{ textAlign: 'center', mt: 3 }}>
          <Typography variant="body2" sx={{ color: 'white', opacity: 0.8 }}>
            © 2025 URC Messaging - TP Développement Web
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default LoginPage;
