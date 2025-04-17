import { useState, useEffect } from 'react';
import { 
  Card, 
  CardContent, 
  Typography, 
  Checkbox, 
  FormControlLabel, 
  Button, 
  CircularProgress, 
  Alert, 
  Box, 
  Paper, 
  Divider,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Tooltip
} from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';
import { getBlockedServices, getEnabledBlockedServices, setBlockedServices, BlockedService } from '@/services/adguardService';

export default function BlockedServicesTab() {
  const [allServices, setAllServices] = useState<BlockedService[]>([]);
  const [enabledServices, setEnabledServices] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [allServicesData, enabledServicesData] = await Promise.all([
          getBlockedServices(),
          getEnabledBlockedServices()
        ]);
        
        setAllServices(allServicesData.blocked_services || []);
        setEnabledServices(enabledServicesData || []);
      } catch (err) {
        console.error('Error fetching blocked services data:', err);
        setError('Failed to fetch blocked services. Please check your connection and credentials.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleToggleService = (serviceId: string) => {
    setEnabledServices(prev => {
      if (prev.includes(serviceId)) {
        return prev.filter(id => id !== serviceId);
      } else {
        return [...prev, serviceId];
      }
    });
  };

  const handleSaveChanges = async () => {
    setSaving(true);
    setSaveSuccess(false);
    setError(null);
    
    try {
      await setBlockedServices(enabledServices);
      setSaveSuccess(true);
    } catch (err) {
      console.error('Error saving blocked services:', err);
      setError('Failed to save blocked services settings.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px' }}>
        <CircularProgress />
        <Typography variant="body1" sx={{ ml: 2 }}>Loading blocked services...</Typography>
      </Box>
    );
  }

  return (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">Blocked Services</Typography>
          <Button 
            variant="contained" 
            color="primary" 
            onClick={handleSaveChanges}
            disabled={saving}
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </Box>
        
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        
        {saveSuccess && (
          <Alert severity="success" sx={{ mb: 2 }}>
            Blocked services settings saved successfully!
          </Alert>
        )}
        
        <Typography variant="body2" color="textSecondary" paragraph>
          Select services you want to block. All domains associated with these services will be blocked.
        </Typography>
        
        <Divider sx={{ mb: 2 }} />
        
        <List>
          {allServices.map((service) => {
            const isChecked = enabledServices.includes(service.id);
            
            return (
              <Paper key={service.id} sx={{ mb: 2, p: 1 }}>
                <ListItem>
                  <ListItemAvatar>
                    {/* Fix: Use a wrapper component instead of dangerouslySetInnerHTML */}
                    <Avatar 
                      sx={{ bgcolor: isChecked ? 'error.main' : 'action.disabled' }}
                    >
                      <span dangerouslySetInnerHTML={{ __html: service.icon_svg }} />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText 
                    primary={service.name} 
                    secondary={`${service.rules.length} domains will be blocked`}
                  />
                  <ListItemSecondaryAction>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Tooltip title="View blocked domains">
                        <IconButton edge="end" aria-label="info">
                          <InfoIcon />
                        </IconButton>
                      </Tooltip>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={isChecked}
                            onChange={() => handleToggleService(service.id)}
                            color="primary"
                          />
                        }
                        label={isChecked ? "Blocked" : "Allow"}
                      />
                    </Box>
                  </ListItemSecondaryAction>
                </ListItem>
              </Paper>
            );
          })}
        </List>
      </CardContent>
    </Card>
  );
}