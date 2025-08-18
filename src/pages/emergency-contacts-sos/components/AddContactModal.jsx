import React, { useState, useEffect } from 'react';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';


const AddContactModal = ({ 
  isOpen, 
  onClose, 
  onSave, 
  editingContact = null,
  onVoiceAnnounce 
}) => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    relationship: '',
    priority: 'secondary',
    notes: ''
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const relationshipOptions = [
    { value: 'spouse', label: 'Spouse/Partner' },
    { value: 'parent', label: 'Parent' },
    { value: 'child', label: 'Child' },
    { value: 'sibling', label: 'Sibling' },
    { value: 'friend', label: 'Friend' },
    { value: 'doctor', label: 'Doctor' },
    { value: 'caregiver', label: 'Caregiver' },
    { value: 'neighbor', label: 'Neighbor' },
    { value: 'other', label: 'Other' }
  ];

  const priorityOptions = [
    { value: 'primary', label: 'Primary Contact', description: 'First to be contacted in emergency' },
    { value: 'secondary', label: 'Secondary Contact', description: 'Backup emergency contact' }
  ];

  // Initialize form data when editing
  useEffect(() => {
    if (editingContact) {
      setFormData({
        name: editingContact?.name || '',
        phone: editingContact?.phone || '',
        email: editingContact?.email || '',
        relationship: editingContact?.relationship || '',
        priority: editingContact?.priority || 'secondary',
        notes: editingContact?.notes || ''
      });
    } else {
      setFormData({
        name: '',
        phone: '',
        email: '',
        relationship: '',
        priority: 'secondary',
        notes: ''
      });
    }
    setErrors({});
  }, [editingContact, isOpen]);

  // Announce modal opening
  useEffect(() => {
    if (isOpen && onVoiceAnnounce) {
      const message = editingContact 
        ? `Edit emergency contact form opened for ${editingContact?.name}`
        : 'Add new emergency contact form opened';
      onVoiceAnnounce(message);
    }
  }, [isOpen, editingContact, onVoiceAnnounce]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors?.[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData?.name?.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (!formData?.phone?.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^\+?[\d\s\-\(\)]+$/?.test(formData?.phone)) {
      newErrors.phone = 'Please enter a valid phone number';
    }
    
    if (!formData?.relationship) {
      newErrors.relationship = 'Relationship is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors)?.length === 0;
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    
    if (!validateForm()) {
      if (onVoiceAnnounce) {
        onVoiceAnnounce('Please correct the form errors');
      }
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const contactData = {
        ...formData,
        id: editingContact?.id || Date.now()?.toString(),
        createdAt: editingContact?.createdAt || new Date()?.toISOString(),
        updatedAt: new Date()?.toISOString()
      };
      
      await onSave(contactData);
      
      if (onVoiceAnnounce) {
        const message = editingContact 
          ? `Contact ${formData?.name} updated successfully`
          : `Emergency contact ${formData?.name} added successfully`;
        onVoiceAnnounce(message);
      }
      
      onClose();
    } catch (error) {
      console.error('Error saving contact:', error);
      if (onVoiceAnnounce) {
        onVoiceAnnounce('Error saving contact. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (onVoiceAnnounce) {
      onVoiceAnnounce('Contact form closed');
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-1000 flex items-center justify-center p-4 bg-black/50"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div className="bg-card rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 id="modal-title" className="text-xl font-semibold text-foreground">
            {editingContact ? 'Edit Emergency Contact' : 'Add Emergency Contact'}
          </h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClose}
            iconName="X"
            iconSize={20}
            aria-label="Close modal"
            className="min-w-[44px] min-h-[44px]"
          />
        </div>

        {/* Modal Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Name Field */}
          <Input
            label="Full Name"
            type="text"
            placeholder="Enter contact's full name"
            value={formData?.name}
            onChange={(e) => handleInputChange('name', e?.target?.value)}
            error={errors?.name}
            required
            className="mb-4"
          />

          {/* Phone Field */}
          <Input
            label="Phone Number"
            type="tel"
            placeholder="Enter phone number"
            value={formData?.phone}
            onChange={(e) => handleInputChange('phone', e?.target?.value)}
            error={errors?.phone}
            required
            className="mb-4"
          />

          {/* Email Field */}
          <Input
            label="Email Address"
            type="email"
            placeholder="Enter email address (optional)"
            value={formData?.email}
            onChange={(e) => handleInputChange('email', e?.target?.value)}
            error={errors?.email}
            className="mb-4"
          />

          {/* Relationship Field */}
          <Select
            label="Relationship"
            placeholder="Select relationship"
            options={relationshipOptions}
            value={formData?.relationship}
            onChange={(value) => handleInputChange('relationship', value)}
            error={errors?.relationship}
            required
            className="mb-4"
          />

          {/* Priority Field */}
          <Select
            label="Priority Level"
            placeholder="Select priority level"
            options={priorityOptions}
            value={formData?.priority}
            onChange={(value) => handleInputChange('priority', value)}
            className="mb-4"
          />

          {/* Notes Field */}
          <Input
            label="Notes"
            type="text"
            placeholder="Additional notes (optional)"
            value={formData?.notes}
            onChange={(e) => handleInputChange('notes', e?.target?.value)}
            description="Any additional information about this contact"
            className="mb-6"
          />

          {/* Action Buttons */}
          <div className="flex items-center justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
              className="min-w-[100px]"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="default"
              loading={isSubmitting}
              iconName="Save"
              iconPosition="left"
              className="min-w-[100px]"
            >
              {editingContact ? 'Update' : 'Save'} Contact
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddContactModal;