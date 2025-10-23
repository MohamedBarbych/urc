#!/bin/bash

# Script d'Installation Complète - URC Messaging avec Zustand
# À exécuter depuis : ~/Documents/tp-tibault/urc
# Usage: bash install_zustand.sh

echo "╔═══════════════════════════════════════════════════════════╗"
echo "║  Installation Complète - URC Messaging avec Zustand      ║"
echo "╚═══════════════════════════════════════════════════════════╝"
echo ""

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Vérifier qu'on est dans le bon dossier
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ Erreur : package.json non trouvé${NC}"
    echo "Vous devez être dans ~/Documents/tp-tibault/urc/"
    exit 1
fi

echo -e "${GREEN}✅ Dossier correct : $(pwd)${NC}"
echo ""

# Étape 1 : Créer les dossiers
echo -e "${YELLOW}📁 Étape 1 : Création des dossiers...${NC}"
mkdir -p src/store
mkdir -p src/pages
echo -e "${GREEN}✅ Dossiers créés${NC}"
echo ""

# Étape 2 : Installer les dépendances
echo -e "${YELLOW}📦 Étape 2 : Installation des dépendances...${NC}"
echo "Installation de zustand, react-router-dom, Material-UI..."
npm install zustand react-router-dom
npm install @mui/material @emotion/react @emotion/styled @mui/icons-material

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Dépendances installées${NC}"
else
    echo -e "${RED}❌ Erreur lors de l'installation${NC}"
    exit 1
fi
echo ""

# Étape 3 : Créer authStore.js
echo -e "${YELLOW}📄 Étape 3 : Création de authStore.js...${NC}"
cat > src/store/authStore.js << 'AUTHSTORE'
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/**
 * Store Zustand pour l'authentification
 * Beaucoup plus simple que Redux Toolkit !
 */
export const useAuthStore = create(
  persist(
    (set, get) => ({
      // État
      user: null,
      token: null,
      isAuthenticated: false,
      loading: false,
      error: null,

      // Actions
      login: async (username, password) => {
        set({ loading: true, error: null });

        try {
          const response = await fetch('/api/login', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, password }),
          });

          if (!response.ok) {
            const error = await response.text();
            throw new Error(error || 'Erreur de connexion');
          }

          const data = await response.json();

          set({
            user: data.user,
            token: data.token,
            isAuthenticated: true,
            loading: false,
            error: null,
          });

          return { success: true };
        } catch (error) {
          set({
            loading: false,
            error: error.message || 'Erreur réseau',
            isAuthenticated: false,
          });
          return { success: false, error: error.message };
        }
      },

      logout: async () => {
        set({ loading: true });

        try {
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            loading: false,
            error: null,
          });

          return { success: true };
        } catch (error) {
          set({ loading: false, error: error.message });
          return { success: false, error: error.message };
        }
      },

      clearError: () => set({ error: null }),

      restoreSession: () => {
        const { token, user } = get();
        if (token && user) {
          set({ isAuthenticated: true });
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

export default useAuthStore;
AUTHSTORE
echo -e "${GREEN}✅ authStore.js créé${NC}"
echo ""

# Étape 4 : Créer usersStore.js
echo -e "${YELLOW}�� Étape 4 : Création de usersStore.js...${NC}"
cat > src/store/usersStore.js << 'USERSSTORE'
import { create } from 'zustand';
import { useAuthStore } from './authStore';

/**
 * Store Zustand pour la gestion des utilisateurs
 */
export const useUsersStore = create((set, get) => ({
  users: [],
  loading: false,
  error: null,

  fetchUsers: async () => {
    set({ loading: true, error: null });

    try {
      const token = useAuthStore.getState().token;

      if (!token) {
        throw new Error('Non authentifié');
      }

      const response = await fetch('/api/users', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Session expirée');
        }
        throw new Error('Erreur lors de la récupération des utilisateurs');
      }

      const data = await response.json();

      const currentUserId = useAuthStore.getState().user?.id;
      const filteredUsers = data.filter(user => user.id !== currentUserId);

      set({
        users: filteredUsers,
        loading: false,
        error: null,
      });
    } catch (error) {
      set({
        loading: false,
        error: error.message,
      });
    }
  },

  clearError: () => set({ error: null }),
}));

export default useUsersStore;
USERSSTORE
echo -e "${GREEN}✅ usersStore.js créé${NC}"
echo ""

# Étape 5 : Créer LoginPage.jsx (suite dans le prochain message car trop long)
echo -e "${YELLOW}📄 Étape 5 : Création de LoginPage.jsx...${NC}"

# Note: LoginPage.jsx est trop long pour un seul heredoc, on va le créer en morceaux
cat > src/pages/LoginPage.jsx << 'EOF'
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Card, CardContent, TextField, Button, Typography,
  Alert, CircularProgress, Container, InputAdornment, IconButton, Link,
} from '@mui/material';
import {
  Visibility, VisibilityOff, Login as LoginIcon, Message as MessageIcon,
} from '@mui/icons-material';
import { useAuthStore } from '../store/authStore';

const LoginPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated, loading, error, login, clearError } = useAuthStore();

  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (isAuthenticated) navigate('/messages');
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    return () => clearError();
  }, [clearError]);

  const handleChange = (e) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearError();
    if (!credentials.username || !credentials.password) return;
    const result = await login(credentials.username, credentials.password);
    if (result.success) navigate('/messages');
  };

  const handleTogglePassword = () => setShowPassword(!showPassword);

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
              Connexion à votre espace de messagerie
            </Typography>
          </Box>

          <CardContent sx={{ padding: 4 }}>
            <form onSubmit={handleSubmit}>
              {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

              <TextField
                fullWidth label="Nom d'utilisateur" name="username"
                value={credentials.username} onChange={handleChange}
                margin="normal" variant="outlined" required
                autoComplete="username" autoFocus disabled={loading}
              />

              <TextField
                fullWidth label="Mot de passe" name="password"
                type={showPassword ? 'text' : 'password'}
                value={credentials.password} onChange={handleChange}
                margin="normal" variant="outlined" required
                autoComplete="current-password" disabled={loading}
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

              <Button
                type="submit" fullWidth variant="contained" size="large" disabled={loading}
                startIcon={loading ? <CircularProgress size={20} /> : <LoginIcon />}
                sx={{
                  mt: 3, mb: 2, py: 1.5,
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  '&:hover': { background: 'linear-gradient(135deg, #5568d3 0%, #6941a0 100%)' },
                }}
              >
                {loading ? 'Connexion en cours...' : 'Se connecter'}
              </Button>

              <Box sx={{ textAlign: 'center', mt: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Pas encore de compte ?{' '}
                  <Link href="/register" sx={{
                    color: '#667eea', textDecoration: 'none', fontWeight: 600,
                    '&:hover': { textDecoration: 'underline' },
                  }}>
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
EOF
echo -e "${GREEN}✅ LoginPage.jsx créé${NC}"
echo ""

# Étape 6 : Créer MessagesPage.jsx
echo -e "${YELLOW}📄 Étape 6 : Création de MessagesPage.jsx...${NC}"
cat > src/pages/MessagesPage.jsx << 'EOF'
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Container, Typography, AppBar, Toolbar, IconButton,
} from '@mui/material';
import { Logout as LogoutIcon, Message as MessageIcon } from '@mui/icons-material';
import { useAuthStore } from '../store/authStore';

const MessagesPage = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated) navigate('/login');
  }, [isAuthenticated, navigate]);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  if (!isAuthenticated) return null;

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
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
EOF
echo -e "${GREEN}✅ MessagesPage.jsx créé${NC}"
echo ""

# Étape 7 : Créer index.css
echo -e "${YELLOW}📄 Étape 7 : Création de index.css...${NC}"
cat > src/index.css << 'EOF'
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Segoe UI', 'Roboto', 'Arial', sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

#root {
  min-height: 100vh;
}
EOF
echo -e "${GREEN}✅ index.css créé${NC}"
echo ""

# Résumé final
echo ""
echo -e "${GREEN}╔═══════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║            ✅ Installation Terminée !                      ║${NC}"
echo -e "${GREEN}╚═══════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${BLUE}📊 Fichiers créés :${NC}"
echo "  ✅ src/store/authStore.js"
echo "  ✅ src/store/usersStore.js"
echo "  ✅ src/pages/LoginPage.jsx"
echo "  ✅ src/pages/MessagesPage.jsx"
echo "  ✅ src/index.css"
echo ""
echo -e "${BLUE}📦 Dépendances installées :${NC}"
echo "  ✅ zustand"
echo "  ✅ react-router-dom"
echo "  ✅ @mui/material"
echo "  ✅ @emotion/react"
echo "  ✅ @emotion/styled"
echo "  ✅ @mui/icons-material"
echo ""
echo -e "${YELLOW}🚀 Prochaine étape :${NC}"
echo ""
echo "  1. Nettoyer le cache :"
echo -e "     ${GREEN}rm -rf node_modules/.vite${NC}"
echo ""
echo "  2. Lancer l'application :"
echo -e "     ${GREEN}npm run dev${NC}"
echo ""
echo "  3. Ouvrir dans le navigateur :"
echo -e "     ${BLUE}http://localhost:3000${NC}"
echo ""
echo -e "${GREEN}✨ Vous devriez voir l'interface Material-UI ! ✨${NC}"
echo ""
