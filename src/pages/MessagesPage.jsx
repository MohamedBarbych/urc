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
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { useAuthStore } from '../store/authStore';
import { useUsersStore } from '../store/usersStore';

const MessagesPage = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuthStore();
  const {
    users,
    rooms,
    messages,
    roomMessages,
    loading,
    fetchUsers,
    fetchRooms,
    fetchMessages,
    sendMessage,
    fetchRoomMessages,
    sendRoomMessage,
  } = useUsersStore();

  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [messageText, setMessageText] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    } else {
      fetchUsers();
      fetchRooms();
    }
  }, [isAuthenticated, navigate, fetchUsers, fetchRooms]);

  useEffect(() => {
    // Charger les messages quand un utilisateur est sélectionné
    if (selectedUser) {
      fetchMessages(selectedUser.user_id);

      // Polling automatique toutes les 3 secondes
      const interval = setInterval(() => {
        fetchMessages(selectedUser.user_id);
      }, 3000);

      // Nettoyer l'interval quand on change d'utilisateur
      return () => clearInterval(interval);
    }

    // Charger les messages quand un salon est sélectionné
    if (selectedRoom) {
      fetchRoomMessages(selectedRoom.room_id);

      // Polling automatique toutes les 3 secondes
      const interval = setInterval(() => {
        fetchRoomMessages(selectedRoom.room_id);
      }, 3000);

      // Nettoyer l'interval quand on change de salon
      return () => clearInterval(interval);
    }
  }, [selectedUser, selectedRoom, fetchMessages, fetchRoomMessages]);

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

  const handleSelectUser = (user) => {
    setSelectedUser(user);
    setSelectedRoom(null); // Désélectionner le salon
  };

  const handleSelectRoom = (room) => {
    setSelectedRoom(room);
    setSelectedUser(null); // Désélectionner l'utilisateur
  };

  const handleSendMessage = async () => {
    // Envoi vers un utilisateur
    if (selectedUser && !selectedRoom) {
      if (!messageText.trim()) {
        return;
      }

      const result = await sendMessage(selectedUser.user_id, messageText.trim());

      if (result.success) {
        setMessageText('');
      } else {
        alert('Erreur lors de l\'envoi du message: ' + result.error);
      }
    }

    // Envoi vers un salon
    if (selectedRoom && !selectedUser) {
      if (!messageText.trim()) {
        return;
      }

      const result = await sendRoomMessage(selectedRoom.room_id, messageText.trim());

      if (result.success) {
        setMessageText('');
      } else {
        alert('Erreur lors de l\'envoi du message au salon: ' + result.error);
      }
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleRefreshMessages = () => {
    if (selectedUser) {
      fetchMessages(selectedUser.user_id);
    }
    if (selectedRoom) {
      fetchRoomMessages(selectedRoom.room_id);
    }
  };

  const getConversationMessages = () => {
    if (selectedUser) {
      return messages[selectedUser.user_id] || [];
    }
    if (selectedRoom) {
      return roomMessages[selectedRoom.room_id] || [];
    }
    return [];
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
            <Typography variant="h6">Conversations</Typography>
          </Box>

          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <List sx={{ flexGrow: 1, overflow: 'auto' }}>
              {/* Salons */}
              {rooms.length > 0 && (
                <>
                  <ListItem>
                    <Typography variant="caption" color="text.secondary" sx={{ pl: 2, fontWeight: 'bold' }}>
                      SALONS
                    </Typography>
                  </ListItem>
                  {rooms.map((room) => (
                    <ListItem key={room.room_id} disablePadding>
                      <ListItemButton
                        selected={selectedRoom?.room_id === room.room_id}
                        onClick={() => handleSelectRoom(room)}
                        sx={{
                          '&.Mui-selected': {
                            backgroundColor: 'secondary.light',
                            '&:hover': {
                              backgroundColor: 'secondary.light',
                            },
                          },
                        }}
                      >
                        <ListItemAvatar>
                          <Avatar sx={{ bgcolor: 'secondary.main' }}>
                            #
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={room.name}
                          secondary="Salon de discussion"
                        />
                      </ListItemButton>
                    </ListItem>
                  ))}
                  <Divider sx={{ my: 1 }} />
                </>
              )}

              {/* Utilisateurs */}
              <ListItem>
                <Typography variant="caption" color="text.secondary" sx={{ pl: 2, fontWeight: 'bold' }}>
                  MESSAGES PRIVÉS
                </Typography>
              </ListItem>
              {users.map((u) => (
                <ListItem key={u.user_id} disablePadding>
                  <ListItemButton
                    selected={selectedUser?.user_id === u.user_id}
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
                        messages[u.user_id]?.length
                          ? `${messages[u.user_id].length} message(s)`
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
          {!selectedUser && !selectedRoom ? (
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
                Sélectionnez une conversation pour commencer
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
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Avatar sx={{ bgcolor: selectedRoom ? 'secondary.main' : 'primary.main', mr: 2 }}>
                      {selectedRoom ? '#' : getInitials(selectedUser?.username || '')}
                    </Avatar>
                    <Typography variant="h6">
                      {selectedRoom ? `# ${selectedRoom.name}` : selectedUser?.username}
                    </Typography>
                  </Box>
                  {selectedUser && (
                    <IconButton onClick={handleRefreshMessages} color="primary" title="Rafraîchir les messages">
                      <RefreshIcon />
                    </IconButton>
                  )}
                  {selectedRoom && (
                    <IconButton onClick={handleRefreshMessages} color="primary" title="Rafraîchir les messages">
                      <RefreshIcon />
                    </IconButton>
                  )}
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
                  getConversationMessages().map((msg, index) => {
                    const isSent = msg.senderId === user.id;
                    return (
                      <Box
                        key={msg.timestamp + index}
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
                    disabled={!selectedUser && !selectedRoom}
                  />
                  <Button
                    variant="contained"
                    endIcon={<SendIcon />}
                    onClick={handleSendMessage}
                    disabled={(!selectedUser && !selectedRoom) || !messageText.trim()}
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
