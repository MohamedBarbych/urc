import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Card, CardContent, TextField, Button, Typography,
  Alert, CircularProgress, Container, InputAdornment, IconButton, Link,
} from '@mui/material';
import {
  Visibility, VisibilityOff, PersonAdd as RegisterIcon, Message as MessageIcon,
} from '@mui/icons-material';
import { useAuthStore } from '../store/authStore';

const RegisterPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated, loading, error, register, clearError } = useAuthStore();

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  useEffect(() => {
    if (isAuthenticated) navigate('/messages');
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    return () => clearError();
  }, [clearError]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (e.target.name === 'confirmPassword' || e.target.name === 'password') {
      setPasswordError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearError();
    setPasswordError('');

    // Validation
    if (!formData.username || !formData.email || !formData.password || !formData.confirmPassword) {
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setPasswordError('Les mots de passe ne correspondent pas');
      return;
    }

    if (formData.password.length < 6) {
      setPasswordError('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }

    console.log('📤 Envoi des données d\'inscription:', {
      username: formData.username,
      email: formData.email,
    });

    const result = await register(formData.username, formData.email, formData.password);

    console.log('📥 Résultat de l\'inscription:', result);

    if (result.success) {
      console.log('✅ Inscription réussie, redirection vers /messages');
      navigate('/messages');
    } else {
      console.error('❌ Inscription échouée:', result.error);
    }
  };

  const handleTogglePassword = () => setShowPassword(!showPassword);
  const handleToggleConfirmPassword = () => setShowConfirmPassword(!showConfirmPassword);

  return (
    <Box sx={{
      minHeight: '100vh', display: 'flex', alignItems: 'center',
      justifyContent: 'center', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: 2,
    }}>
      <Container maxWidth="sm">
        <Card elevation={24} sx={{ borderRadius: 4, overflow: 'hidden' }}>
          <Box sx={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            padding: 4, textAlign: 'center', color: 'white',
          }}>
            <MessageIcon sx={{ fontSize: 60, mb: 2 }} />
            <Typography variant="h4" fontWeight="bold" gutterBottom>
              URC Messaging
            </Typography>
            <Typography variant="body1" sx={{ opacity: 0.9 }}>
              Créer votre compte de messagerie
            </Typography>
          </Box>

          <CardContent sx={{ padding: 4 }}>
            <form onSubmit={handleSubmit}>
              {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
              {passwordError && <Alert severity="error" sx={{ mb: 3 }}>{passwordError}</Alert>}

              <TextField
                fullWidth label="Nom d'utilisateur" name="username"
                value={formData.username} onChange={handleChange}
                margin="normal" variant="outlined" required
                autoComplete="username" autoFocus disabled={loading}
                helperText="Choisissez un nom d'utilisateur unique"
              />

              <TextField
                fullWidth label="Email" name="email" type="email"
                value={formData.email} onChange={handleChange}
                margin="normal" variant="outlined" required
                autoComplete="email" disabled={loading}
              />

              <TextField
                fullWidth label="Mot de passe" name="password"
                type={showPassword ? 'text' : 'password'}
                value={formData.password} onChange={handleChange}
                margin="normal" variant="outlined" required
                autoComplete="new-password" disabled={loading}
                helperText="Minimum 6 caractères"
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={handleTogglePassword} edge="end" disabled={loading}>
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />

              <TextField
                fullWidth label="Confirmer le mot de passe" name="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                value={formData.confirmPassword} onChange={handleChange}
                margin="normal" variant="outlined" required
                autoComplete="new-password" disabled={loading}
                error={!!passwordError}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={handleToggleConfirmPassword} edge="end" disabled={loading}>
                        {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />

              <Button
                type="submit" fullWidth variant="contained" size="large" disabled={loading}
                startIcon={loading ? <CircularProgress size={20} /> : <RegisterIcon />}
                sx={{
                  mt: 3, mb: 2, py: 1.5,
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  '&:hover': { background: 'linear-gradient(135deg, #5568d3 0%, #6941a0 100%)' },
                }}
              >
                {loading ? 'Inscription en cours...' : 'S\'inscrire'}
              </Button>

              <Box sx={{ textAlign: 'center', mt: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Vous avez déjà un compte ?{' '}
                  <Link href="/login" sx={{
                    color: '#667eea', textDecoration: 'none', fontWeight: 600,
                    '&:hover': { textDecoration: 'underline' },
                  }}>
                    Se connecter
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

export default RegisterPage;
