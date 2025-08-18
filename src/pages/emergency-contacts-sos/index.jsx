import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/ui/Header';
import TabNavigation from '../../components/ui/TabNavigation';
import VoiceNavigationProvider from '../../components/ui/VoiceNavigationProvider';
import AccessibilityFocusManager from '../../components/ui/AccessibilityFocusManager';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Icon from '../../components/AppIcon';

// Import page-specific components
import EmergencyContactCard from './components/EmergencyContactCard';
import SOSButton from './components/SOSButton';
import AddContactModal from './components/AddContactModal';
import EmergencyLogCard from './components/EmergencyLogCard';
import VoiceCommandPanel from './components/VoiceCommandPanel';

const EmergencyContactsSOS = () => {
  const navigate = useNavigate();
  const [contacts, setContacts] = useState([]);
  const [emergencyLogs, setEmergencyLogs] = useState([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingContact, setEditingContact] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isEmergencyActive, setIsEmergencyActive] = useState(false);
  const [isVoiceListening, setIsVoiceListening] = useState(false);
  const [activeTab, setActiveTab] = useState('contacts');

  // Mock emergency contacts data
  const mockContacts = [
    {
      id: '1',
      name: 'Sarah Johnson',
      relationship: 'spouse',
      phone: '+1 (555) 123-4567',
      email: 'sarah.johnson@email.com',
      priority: 'primary',
      notes: 'Primary emergency contact - always available',
      createdAt: '2024-01-15T10:30:00Z',
      updatedAt: '2024-01-15T10:30:00Z'
    },
    {
      id: '2',
      name: 'Dr. Michael Chen',
      relationship: 'doctor',
      phone: '+1 (555) 987-6543',
      email: 'dr.chen@medicalpractice.com',
      priority: 'primary',
      notes: 'Personal physician - cardiac specialist',
      createdAt: '2024-01-10T14:20:00Z',
      updatedAt: '2024-01-10T14:20:00Z'
    },
    {
      id: '3',
      name: 'Emma Rodriguez',
      relationship: 'caregiver',
      phone: '+1 (555) 456-7890',
      email: 'emma.rodriguez@careservice.com',
      priority: 'secondary',
      notes: 'Daily caregiver - available 8 AM to 6 PM',
      createdAt: '2024-01-08T09:15:00Z',
      updatedAt: '2024-01-08T09:15:00Z'
    },
    {
      id: '4',
      name: 'Robert Johnson',
      relationship: 'parent',
      phone: '+1 (555) 234-5678',
      email: 'robert.johnson@email.com',
      priority: 'secondary',
      notes: 'Father - retired, usually available',
      createdAt: '2024-01-05T16:45:00Z',
      updatedAt: '2024-01-05T16:45:00Z'
    }
  ];

  // Mock emergency logs data
  const mockEmergencyLogs = [
    {
      id: '1',
      timestamp: '2024-01-18T14:30:00Z',
      status: 'completed',
      contactsNotified: 3,
      location: {
        address: '123 Main Street, Springfield, IL',
        coordinates: { lat: 39.7817, lng: -89.6501 }
      },
      responseTime: '2 minutes',
      emergencyServicesContacted: true,
      notes: 'False alarm - accidental activation'
    },
    {
      id: '2',
      timestamp: '2024-01-15T09:15:00Z',
      status: 'completed',
      contactsNotified: 2,
      location: {
        address: '456 Oak Avenue, Springfield, IL',
        coordinates: { lat: 39.7901, lng: -89.6440 }
      },
      responseTime: '1 minute',
      emergencyServicesContacted: false,
      notes: 'Medical assistance needed - resolved'
    },
    {
      id: '3',
      timestamp: '2024-01-10T18:45:00Z',
      status: 'cancelled',
      contactsNotified: 0,
      location: null,
      responseTime: null,
      emergencyServicesContacted: false,
      notes: 'Cancelled during countdown'
    }
  ];

  // Initialize mock data
  useEffect(() => {
    setContacts(mockContacts);
    setEmergencyLogs(mockEmergencyLogs);
  }, []);

  // Voice announcement function
  const announceToScreenReader = (message) => {
    const announcement = document.createElement('div');
    announcement?.setAttribute('aria-live', 'polite');
    announcement?.setAttribute('aria-atomic', 'true');
    announcement.className = 'sr-only';
    announcement.textContent = message;
    document.body?.appendChild(announcement);
    
    setTimeout(() => {
      if (document.body?.contains(announcement)) {
        document.body?.removeChild(announcement);
      }
    }, 2000);
  };

  // Handle SOS activation
  const handleSOSActivate = () => {
    setIsEmergencyActive(true);
    
    // Simulate emergency sequence
    const newLog = {
      id: Date.now()?.toString(),
      timestamp: new Date()?.toISOString(),
      status: 'in-progress',
      contactsNotified: 0,
      location: {
        address: 'Current location being determined...',
        coordinates: { lat: 39.7817, lng: -89.6501 }
      },
      responseTime: null,
      emergencyServicesContacted: false,
      notes: 'Emergency alert activated'
    };
    
    setEmergencyLogs(prev => [newLog, ...prev]);
    announceToScreenReader('Emergency SOS activated. Contacting emergency contacts and services.');
    
    // Simulate emergency completion
    setTimeout(() => {
      setIsEmergencyActive(false);
      setEmergencyLogs(prev => prev?.map(log => 
        log?.id === newLog?.id 
          ? { ...log, status: 'completed', contactsNotified: contacts?.length, responseTime: '30 seconds' }
          : log
      ));
      announceToScreenReader('Emergency contacts notified successfully.');
    }, 5000);
  };

  // Handle contact operations
  const handleCallContact = (contact) => {
    announceToScreenReader(`Calling ${contact?.name} at ${contact?.phone}`);
    // In a real app, this would initiate a phone call
    window.open(`tel:${contact?.phone}`);
  };

  const handleEditContact = (contact) => {
    setEditingContact(contact);
    setIsAddModalOpen(true);
  };

  const handleDeleteContact = (contact) => {
    if (window.confirm(`Are you sure you want to delete ${contact?.name} from your emergency contacts?`)) {
      setContacts(prev => prev?.filter(c => c?.id !== contact?.id));
      announceToScreenReader(`${contact?.name} removed from emergency contacts`);
    }
  };

  const handleSaveContact = (contactData) => {
    if (editingContact) {
      // Update existing contact
      setContacts(prev => prev?.map(c => 
        c?.id === editingContact?.id ? contactData : c
      ));
    } else {
      // Add new contact
      setContacts(prev => [...prev, contactData]);
    }
    
    setEditingContact(null);
    setIsAddModalOpen(false);
  };

  // Handle voice commands
  const handleVoiceCommand = (command, data) => {
    switch (command) {
      case 'emergency':
        handleSOSActivate();
        break;
      case 'call':
        if (data) {
          handleCallContact(data);
        }
        break;
      default:
        console.log('Unknown voice command:', command);
    }
  };

  // Filter contacts based on search
  const filteredContacts = contacts?.filter(contact =>
    contact?.name?.toLowerCase()?.includes(searchQuery?.toLowerCase()) ||
    contact?.relationship?.toLowerCase()?.includes(searchQuery?.toLowerCase()) ||
    contact?.phone?.includes(searchQuery)
  );

  // Sort contacts by priority
  const sortedContacts = filteredContacts?.sort((a, b) => {
    if (a?.priority === 'primary' && b?.priority !== 'primary') return -1;
    if (a?.priority !== 'primary' && b?.priority === 'primary') return 1;
    return a?.name?.localeCompare(b?.name);
  });

  return (
    <VoiceNavigationProvider>
      <AccessibilityFocusManager>
        <div className="min-h-screen bg-background">
          <Header />
          
          <main 
            id="main-content"
            className="pt-20 pb-20 lg:pb-8 lg:pl-64"
            role="main"
            aria-label="Emergency Contacts and SOS"
            tabIndex={-1}
          >
            <div className="container mx-auto px-4 py-6 max-w-6xl">
              {/* Page Header with SOS Button */}
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
                <div className="mb-4 lg:mb-0">
                  <h1 className="text-3xl font-bold text-foreground mb-2">
                    Emergency Contacts & SOS
                  </h1>
                  <p className="text-muted-foreground">
                    Manage your emergency contacts and access one-touch SOS assistance
                  </p>
                </div>
                
                {/* SOS Button - Always Visible */}
                <div className="flex justify-center lg:justify-end">
                  <SOSButton
                    onSOSActivate={handleSOSActivate}
                    onVoiceAnnounce={announceToScreenReader}
                    isEmergencyActive={isEmergencyActive}
                  />
                </div>
              </div>

              {/* Tab Navigation */}
              <div className="flex flex-wrap gap-2 mb-6 border-b border-border">
                <Button
                  variant={activeTab === 'contacts' ? 'default' : 'ghost'}
                  onClick={() => setActiveTab('contacts')}
                  iconName="Users"
                  iconPosition="left"
                  className="mb-2"
                >
                  Contacts ({contacts?.length})
                </Button>
                <Button
                  variant={activeTab === 'logs' ? 'default' : 'ghost'}
                  onClick={() => setActiveTab('logs')}
                  iconName="FileText"
                  iconPosition="left"
                  className="mb-2"
                >
                  Emergency Logs
                </Button>
                <Button
                  variant={activeTab === 'voice' ? 'default' : 'ghost'}
                  onClick={() => setActiveTab('voice')}
                  iconName="Mic"
                  iconPosition="left"
                  className="mb-2"
                >
                  Voice Commands
                </Button>
              </div>

              {/* Contacts Tab */}
              {activeTab === 'contacts' && (
                <div className="space-y-6">
                  {/* Search and Add Contact */}
                  <div className="flex flex-col lg:flex-row gap-4">
                    <div className="flex-1">
                      <Input
                        type="search"
                        placeholder="Search contacts by name, relationship, or phone..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e?.target?.value)}
                        className="w-full"
                        aria-label="Search emergency contacts"
                      />
                    </div>
                    <Button
                      variant="default"
                      size="lg"
                      onClick={() => setIsAddModalOpen(true)}
                      iconName="Plus"
                      iconPosition="left"
                      iconSize={20}
                      className="lg:min-w-[200px]"
                    >
                      Add Emergency Contact
                    </Button>
                  </div>

                  {/* Contacts Grid */}
                  {sortedContacts?.length > 0 ? (
                    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                      {sortedContacts?.map((contact) => (
                        <EmergencyContactCard
                          key={contact?.id}
                          contact={contact}
                          onCall={handleCallContact}
                          onEdit={handleEditContact}
                          onDelete={handleDeleteContact}
                          onVoiceAnnounce={announceToScreenReader}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Icon name="Users" size={48} className="mx-auto text-muted-foreground mb-4" />
                      <h3 className="text-lg font-semibold text-foreground mb-2">
                        {searchQuery ? 'No contacts found' : 'No emergency contacts yet'}
                      </h3>
                      <p className="text-muted-foreground mb-6">
                        {searchQuery 
                          ? 'Try adjusting your search terms' :'Add your first emergency contact to get started'
                        }
                      </p>
                      {!searchQuery && (
                        <Button
                          variant="outline"
                          onClick={() => setIsAddModalOpen(true)}
                          iconName="Plus"
                          iconPosition="left"
                        >
                          Add Emergency Contact
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Emergency Logs Tab */}
              {activeTab === 'logs' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-foreground">
                      Emergency Activity Log
                    </h2>
                    <span className="text-sm text-muted-foreground">
                      {emergencyLogs?.length} total entries
                    </span>
                  </div>

                  {emergencyLogs?.length > 0 ? (
                    <div className="space-y-4">
                      {emergencyLogs?.map((logEntry) => (
                        <EmergencyLogCard
                          key={logEntry?.id}
                          logEntry={logEntry}
                          onVoiceAnnounce={announceToScreenReader}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Icon name="FileText" size={48} className="mx-auto text-muted-foreground mb-4" />
                      <h3 className="text-lg font-semibold text-foreground mb-2">
                        No emergency logs yet
                      </h3>
                      <p className="text-muted-foreground">
                        Emergency activations will appear here
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Voice Commands Tab */}
              {activeTab === 'voice' && (
                <div className="space-y-6">
                  <VoiceCommandPanel
                    contacts={contacts}
                    onVoiceCommand={handleVoiceCommand}
                    onVoiceAnnounce={announceToScreenReader}
                    isListening={isVoiceListening}
                    onToggleListening={setIsVoiceListening}
                  />
                </div>
              )}
            </div>
          </main>

          {/* Add/Edit Contact Modal */}
          <AddContactModal
            isOpen={isAddModalOpen}
            onClose={() => {
              setIsAddModalOpen(false);
              setEditingContact(null);
            }}
            onSave={handleSaveContact}
            editingContact={editingContact}
            onVoiceAnnounce={announceToScreenReader}
          />

          <TabNavigation />
        </div>
      </AccessibilityFocusManager>
    </VoiceNavigationProvider>
  );
};

export default EmergencyContactsSOS;