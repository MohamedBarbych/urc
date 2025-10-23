import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  AppBar,
  Toolbar,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  ListItemAvatar,
  Avatar,
  TextField,
  Button,
  Paper,
  Divider,
  CircularProgress,
} from '@mui/material';
import {
  Logout as LogoutIcon,
  Message as MessageIcon,
  Send as SendIcon,
} from '@mui/icons-material';
import { useAuthStore } from '../store/authStore';
import { useUsersStore } from '../store/usersStore';

const MessagesPage = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuthStore();
  const { users, messages, loading, fetchUsers, sendMessage } = useUsersStore();

  const [selectedUser, setSelectedUser] = useState(null);
  const [messageText, setMessageText] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    } else {
      fetchUsers();
    }
  }, [isAuthenticated, navigate, fetchUsers]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, selectedUser]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleSelectUser = (selectedUser) => {
    setSelectedUser(selectedUser);
  };

  const handleSendMessage = async () => {
    if (!selectedUser || !messageText.trim()) return;

    const result = await sendMessage(selectedUser.id, messageText.trim());

    if (result.success) {
      setMessageText('');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const getConversationMessages = () => {
    if (!selectedUser) return [];
    return messages[selectedUser.id] || [];
  };

  const getInitials = (username) => {
    return username ? username.substring(0, 2).toUpperCase() : '?';
  };

  if (!isAuthenticated) return null;

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
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

      <Box sx={{ display: 'flex', flexGrow: 1, overflow: 'hidden' }}>
        {/* Liste des utilisateurs */}
        <Paper
          sx={{
            width: 320,
            borderRadius: 0,
            borderRight: '1px solid',
            borderColor: 'divider',
            display: 'flex',
            flexDirection: 'column',
          }}
          elevation={0}
        >
          <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
            <Typography variant="h6">Contacts</Typography>
          </Box>

          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <List sx={{ flexGrow: 1, overflow: 'auto' }}>
              {users.map((u) => (
                <ListItem key={u.id} disablePadding>
                  <ListItemButton
                    selected={selectedUser?.id === u.id}
                    onClick={() => handleSelectUser(u)}
                    sx={{
                      '&.Mui-selected': {
                        backgroundColor: 'primary.light',
                        '&:hover': {
                          backgroundColor: 'primary.light',
                        },
                      },
                    }}
                  >
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: 'primary.main' }}>
                        {getInitials(u.username)}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={u.username}
                      secondary={
                        messages[u.id]?.length
                          ? `${messages[u.id].length} message(s)`
                          : 'Aucun message'
                      }
                    />
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          )}
        </Paper>

        {/* Zone de messages */}
        <Box
          sx={{
            flexGrow: 1,
            display: 'flex',
            flexDirection: 'column',
            backgroundColor: '#f5f5f5',
          }}
        >
          {!selectedUser ? (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%',
                flexDirection: 'column',
                gap: 2,
              }}
            >
              <MessageIcon sx={{ fontSize: 80, color: 'text.secondary' }} />
              <Typography variant="h5" color="text.secondary">
                Selectionnez un contact pour commencer
              </Typography>
            </Box>
          ) : (
            <>
              {/* En-tete de conversation */}
              <Paper
                sx={{
                  p: 2,
                  borderRadius: 0,
                  borderBottom: '1px solid',
                  borderColor: 'divider',
                }}
                elevation={1}
              >
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                    {getInitials(selectedUser.username)}
                  </Avatar>
                  <Typography variant="h6">{selectedUser.username}</Typography>
                </Box>
              </Paper>

              {/* Messages */}
              <Box
                sx={{
                  flexGrow: 1,
                  overflow: 'auto',
                  p: 2,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 1,
                }}
              >
                {getConversationMessages().length === 0 ? (
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      height: '100%',
                    }}
                  >
                    <Typography color="text.secondary">
                      Aucun message. Commencez la conversation !
                    </Typography>
                  </Box>
                ) : (
                  getConversationMessages().map((msg) => {
                    const isSent = msg.senderId === user.id;
                    return (
                      <Box
                        key={msg.id}
                        sx={{
                          display: 'flex',
                          justifyContent: isSent ? 'flex-end' : 'flex-start',
                          mb: 1,
                        }}
                      >
                        <Paper
                          sx={{
                            p: 1.5,
                            maxWidth: '70%',
                            backgroundColor: isSent ? 'primary.main' : 'white',
                            color: isSent ? 'white' : 'text.primary',
                          }}
                          elevation={1}
                        >
                          <Typography variant="body1">{msg.content}</Typography>
                          <Typography
                            variant="caption"
                            sx={{
                              display: 'block',
                              mt: 0.5,
                              opacity: 0.7,
                              textAlign: 'right',
                            }}
                          >
                            {new Date(msg.timestamp).toLocaleTimeString('fr-FR', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </Typography>
                        </Paper>
                      </Box>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </Box>

              <Divider />

              {/* Zone d'envoi */}
              <Paper
                sx={{
                  p: 2,
                  borderRadius: 0,
                }}
                elevation={2}
              >
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <TextField
                    fullWidth
                    multiline
                    maxRows={4}
                    placeholder="Tapez votre message..."
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    onKeyPress={handleKeyPress}
                    disabled={!selectedUser}
                  />
                  <Button
                    variant="contained"
                    endIcon={<SendIcon />}
                    onClick={handleSendMessage}
                    disabled={!selectedUser || !messageText.trim()}
                    sx={{ minWidth: 100 }}
                  >
                    Envoyer
                  </Button>
                </Box>
              </Paper>
            </>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default MessagesPage;
