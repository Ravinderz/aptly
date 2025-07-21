import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { FileText, Upload, Download, Trash2, Eye, Plus, File } from 'lucide-react-native';
import { Button } from './Button';
import { Card } from './Card';
import { Document } from '../../types/storage';
import { DocumentStorage } from '../../utils/storage';
import { showAlert, showErrorAlert, showDeleteConfirmAlert } from '../../utils/alert';
import { formatFileSize } from '../../utils/storage';

interface DocumentViewerProps {
  documents: Document[];
  onDocumentAdded?: (document: Document) => void;
  onDocumentDeleted?: (documentId: string) => void;
  onRefresh?: () => void;
}

const DOCUMENT_TYPES = {
  aadhar: { label: 'Aadhar Card', icon: '🪪', color: '#FF9800' },
  pan: { label: 'PAN Card', icon: '💳', color: '#2196F3' },
  passport: { label: 'Passport', icon: '📘', color: '#4CAF50' },
  driving_license: { label: 'Driving License', icon: '🚗', color: '#FF5722' },
  property_papers: { label: 'Property Papers', icon: '🏠', color: '#9C27B0' },
  other: { label: 'Other Document', icon: '📄', color: '#757575' }
};

const DocumentUploadForm = ({ 
  visible, 
  onSubmit, 
  onCancel 
}: { 
  visible: boolean; 
  onSubmit: (data: any) => void; 
  onCancel: () => void; 
}) => {
  const [formData, setFormData] = useState({
    name: '',
    type: 'other' as keyof typeof DOCUMENT_TYPES,
    description: ''
  });

  const handleMockUpload = () => {
    if (!formData.name.trim()) {
      showErrorAlert('Error', 'Document name is required');
      return;
    }

    // Mock file upload - in real implementation, use expo-document-picker
    const mockDocument = {
      ...formData,
      fileUri: `mock://documents/${Date.now()}.pdf`,
      mimeType: 'application/pdf',
      size: Math.floor(Math.random() * 5000000) + 100000 // Random size between 100KB - 5MB
    };

    onSubmit(mockDocument);
    
    // Reset form
    setFormData({
      name: '',
      type: 'other',
      description: ''
    });
  };

  if (!visible) return null;

  return (
    <Card className="mb-6">
      <Text className="text-lg font-semibold text-text-primary mb-4">Upload Document</Text>
      
      {/* Document Name */}
      <View className="mb-4">
        <Text className="text-text-primary font-medium mb-2">Document Name</Text>
        <View className="bg-background border border-divider rounded-lg px-4 py-3">
          <Text
            className="text-text-primary"
            onPress={() => {
              Alert.prompt(
                'Document Name',
                'Enter document name',
                [
                  { text: 'Cancel', style: 'cancel' },
                  {
                    text: 'OK',
                    onPress: (text) => setFormData(prev => ({ ...prev, name: text || '' }))
                  }
                ],
                'plain-text',
                formData.name
              );
            }}
          >
            {formData.name || 'Tap to enter name'}
          </Text>
        </View>
      </View>

      {/* Document Type */}
      <View className="mb-4">
        <Text className="text-text-primary font-medium mb-2">Document Type</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View className="flex-row gap-2">
            {Object.entries(DOCUMENT_TYPES).map(([key, type]) => (
              <TouchableOpacity
                key={key}
                onPress={() => setFormData(prev => ({ ...prev, type: key as keyof typeof DOCUMENT_TYPES }))}
                className={`px-4 py-3 rounded-lg border ${
                  formData.type === key
                    ? 'bg-primary/10 border-primary'
                    : 'bg-background border-divider'
                }`}
              >
                <View className="items-center">
                  <Text className="text-lg mb-1">{type.icon}</Text>
                  <Text
                    className={`text-xs font-medium ${
                      formData.type === key ? 'text-primary' : 'text-text-secondary'
                    }`}
                  >
                    {type.label}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>

      {/* Description (Optional) */}
      <View className="mb-4">
        <Text className="text-text-primary font-medium mb-2">
          Description <Text className="text-text-secondary text-sm">(Optional)</Text>
        </Text>
        <TouchableOpacity 
          onPress={() => {
            Alert.prompt(
              'Document Description',
              'Enter description (optional)',
              [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'OK',
                  onPress: (text) => setFormData(prev => ({ ...prev, description: text || '' }))
                }
              ],
              'plain-text',
              formData.description
            );
          }}
          className="bg-background border border-divider rounded-lg px-4 py-3 min-h-[80px] justify-start"
        >
          <Text className={formData.description ? 'text-text-primary' : 'text-text-secondary'}>
            {formData.description || 'Tap to add description'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Mock File Selection */}
      <TouchableOpacity
        onPress={() => showAlert('File Selection', 'In a real app, this would open document picker to select files')}
        className="bg-primary/10 border-2 border-dashed border-primary/30 rounded-lg p-6 items-center justify-center mb-4"
      >
        <Upload size={32} color="#6366f1" />
        <Text className="text-primary font-semibold mt-2">Select Document</Text>
        <Text className="text-text-secondary text-sm">PDF, JPG, PNG (Max 10MB)</Text>
      </TouchableOpacity>

      {/* Action Buttons */}
      <View className="flex-row gap-3">
        <Button variant="outline" className="flex-1" onPress={onCancel}>
          Cancel
        </Button>
        <Button className="flex-1" onPress={handleMockUpload}>
          Upload Document
        </Button>
      </View>
    </Card>
  );
};

export default function DocumentViewer({ 
  documents, 
  onDocumentAdded, 
  onDocumentDeleted, 
  onRefresh 
}: DocumentViewerProps) {
  const [showUploadForm, setShowUploadForm] = useState(false);

  const handleAddDocument = async (documentData: any) => {
    try {
      const newDocument = await DocumentStorage.saveDocument(documentData);
      showAlert('Success', 'Document uploaded successfully');
      setShowUploadForm(false);
      
      if (onDocumentAdded) {
        onDocumentAdded(newDocument);
      }
      if (onRefresh) {
        onRefresh();
      }
    } catch (error) {
      console.error('Error adding document:', error);
      showErrorAlert('Error', 'Failed to upload document');
    }
  };

  const handleViewDocument = (document: Document) => {
    showAlert(
      'View Document',
      `${document.name}\n\nIn a real app, this would open the document viewer with the file from: ${document.fileUri}`
    );
  };

  const handleDownloadDocument = (document: Document) => {
    showAlert(
      'Download Document',
      `Downloading ${document.name}\n\nIn a real app, this would download the file to device storage.`
    );
  };

  const handleDeleteDocument = (document: Document) => {
    showDeleteConfirmAlert(
      'Delete Document',
      `Are you sure you want to delete "${document.name}"?`,
      async () => {
        try {
          await DocumentStorage.deleteDocument(document.id);
          showAlert('Success', 'Document deleted successfully');
          
          if (onDocumentDeleted) {
            onDocumentDeleted(document.id);
          }
          if (onRefresh) {
            onRefresh();
          }
        } catch (error) {
          console.error('Error deleting document:', error);
          showErrorAlert('Error', 'Failed to delete document');
        }
      }
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      {/* Upload Form */}
      <DocumentUploadForm
        visible={showUploadForm}
        onSubmit={handleAddDocument}
        onCancel={() => setShowUploadForm(false)}
      />

      {/* Add Document Button */}
      {!showUploadForm && (
        <TouchableOpacity
          onPress={() => setShowUploadForm(true)}
          className="border-2 border-dashed border-primary/30 rounded-xl p-6 items-center justify-center bg-primary/5 mb-6"
        >
          <Plus size={24} color="#6366f1" />
          <Text className="text-primary font-semibold mt-2">Upload Document</Text>
          <Text className="text-text-secondary text-sm">Add identity & property documents</Text>
        </TouchableOpacity>
      )}

      {/* Documents List */}
      {documents.length === 0 ? (
        <Card className="items-center py-12">
          <View className="w-20 h-20 rounded-full bg-primary/10 items-center justify-center mb-4">
            <FileText size={32} color="#6366f1" />
          </View>
          <Text className="text-text-primary text-lg font-semibold mb-2">No Documents</Text>
          <Text className="text-text-secondary text-center mb-6">
            Upload your important documents for easy access and sharing with society management.
          </Text>
          {!showUploadForm && (
            <Button onPress={() => setShowUploadForm(true)}>
              Upload First Document
            </Button>
          )}
        </Card>
      ) : (
        <View className="space-y-4">
          {documents.map((document) => {
            const documentType = DOCUMENT_TYPES[document.type];
            
            return (
              <Card key={document.id}>
                <View className="flex-row items-start">
                  {/* Document Icon */}
                  <View 
                    className="w-14 h-14 rounded-xl items-center justify-center mr-4"
                    style={{ backgroundColor: `${documentType.color}15` }}
                  >
                    <Text className="text-xl">{documentType.icon}</Text>
                  </View>

                  {/* Document Info */}
                  <View className="flex-1">
                    <View className="flex-row items-start justify-between mb-2">
                      <View className="flex-1">
                        <Text className="text-text-primary font-semibold text-lg mb-1">
                          {document.name}
                        </Text>
                        <View 
                          className="self-start px-2 py-1 rounded-full mb-2"
                          style={{ backgroundColor: `${documentType.color}15` }}
                        >
                          <Text 
                            className="text-xs font-medium"
                            style={{ color: documentType.color }}
                          >
                            {documentType.label}
                          </Text>
                        </View>
                      </View>

                      {/* Action Buttons */}
                      <View className="flex-row gap-2">
                        <TouchableOpacity
                          onPress={() => handleViewDocument(document)}
                          className="p-2 rounded-full bg-primary/10"
                        >
                          <Eye size={14} color="#6366f1" />
                        </TouchableOpacity>
                        <TouchableOpacity
                          onPress={() => handleDownloadDocument(document)}
                          className="p-2 rounded-full bg-success/10"
                        >
                          <Download size={14} color="#4CAF50" />
                        </TouchableOpacity>
                        <TouchableOpacity
                          onPress={() => handleDeleteDocument(document)}
                          className="p-2 rounded-full bg-error/10"
                        >
                          <Trash2 size={14} color="#D32F2F" />
                        </TouchableOpacity>
                      </View>
                    </View>

                    {/* Document Details */}
                    <View className="space-y-1">
                      {document.description && (
                        <Text className="text-text-secondary text-sm">
                          {document.description}
                        </Text>
                      )}
                      
                      <View className="flex-row items-center justify-between">
                        <Text className="text-text-secondary text-xs">
                          Size: {formatFileSize(document.size)}
                        </Text>
                        <Text className="text-text-secondary text-xs">
                          Uploaded: {formatDate(document.createdAt)}
                        </Text>
                      </View>
                      
                      <View className="bg-background rounded-lg p-2 mt-2">
                        <Text className="text-text-secondary text-xs">
                          File: {document.fileUri.split('/').pop()}
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>
              </Card>
            );
          })}
        </View>
      )}

      {/* Info Card */}
      <Card className="mt-6 bg-secondary/10 border-secondary/20">
        <Text className="text-secondary text-sm font-medium mb-2">
          📄 Document Security
        </Text>
        <Text className="text-text-secondary text-sm leading-5">
          • All documents are stored securely on your device{'\n'}
          • Only you have access to your uploaded documents{'\n'}
          • Share documents only when required{'\n'}
          • Keep your documents updated and valid
        </Text>
      </Card>
    </ScrollView>
  );
}