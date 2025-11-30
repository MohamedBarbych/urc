import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import {
    Box,
    TextField,
    Button,
    Typography,
    Container,
    Paper,
    Alert,
} from '@mui/material';

const LoginPage = () => {
    const navigate = useNavigate();
    const { login, loading, error } = useAuthStore();
    const [credentials, setCredentials] = useState({
        username: '',
        password: '',
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log('📝 FORM SUBMIT');

        const result = await login(credentials.username, credentials.password);
        console.log('📝 RESULT:', result);

        if (result.success) {
            console.log('📝 NAVIGATION vers /messages');
            // Redirection immédiate, le store s'occupe du reste
            navigate('/messages');
        } else {
            console.log('📝 PAS DE NAVIGATION - success =', result.success);
        }
    };

    return (
        <Container maxWidth="sm">
            <Box
                sx={{
                    marginTop: 8,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                }}
            >
                <Paper elevation={3} sx={{ p: 4, width: '100%' }}>
                    <Typography component="h1" variant="h5" textAlign="center" mb={3}>
                        URC Messaging - Connexion
                    </Typography>

                    {error && (
                        <Alert severity="error" sx={{ mb: 2 }}>
                            {error}
                        </Alert>
                    )}

                    <Box component="form" onSubmit={handleSubmit}>
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            label="Nom d'utilisateur"
                            autoComplete="username"
                            value={credentials.username}
                            onChange={(e) =>
                                setCredentials({ ...credentials, username: e.target.value })
                            }
                        />
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            label="Mot de passe"
                            type="password"
                            autoComplete="current-password"
                            value={credentials.password}
                            onChange={(e) =>
                                setCredentials({ ...credentials, password: e.target.value })
                            }
                        />
                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            sx={{ mt: 3, mb: 2 }}
                            disabled={loading}
                        >
                            {loading ? 'Connexion...' : 'Se connecter'}
                        </Button>
                        </Box>

                <Typography variant="body2" color="text.secondary" textAlign="center">
                        Pas encore de compte ?{' '}
                        <a href="/register" style={{ color: '#007bff', textDecoration: 'none' }}>
                            S'inscrire
                        </a>
                    </Typography>
                </Paper>
            </Box>
        </Container>
    );
};

export default LoginPage;    


