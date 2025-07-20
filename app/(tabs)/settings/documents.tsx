import React, { useState } from 'react';
import { ScrollView, SafeAreaView, View, Text, TouchableOpacity, Alert } from 'react-native';
import { 
  ArrowLeft, 
  Plus, 
  FileText, 
  Download, 
  Eye, 
  Trash2,
  Upload,
  Shield,
  CreditCard,
  Home,
  CheckCircle
} from 'lucide-react-native';
import { router } from 'expo-router';
import Button from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { cn } from '../../../utils/cn';

interface Document {
  id: string;
  type: 'aadhar' | 'pan' | 'lease' | 'noc' | 'passport' | 'driving_license' | 'other';
  name: string;
  fileName: string;
  uploadDate: string;
  size: string;
  verified?: boolean;
  expiryDate?: string;
}

export default function Documents() {
  const [documents, setDocuments] = useState<Document[]>([
    {
      id: '1',
      type: 'aadhar',
      name: 'Aadhar Card - Rajesh Kumar',
      fileName: 'aadhar_rajesh.pdf',
      uploadDate: '2024-01-15',
      size: '2.1 MB',
      verified: true,
    },
    {
      id: '2',
      type: 'pan',
      name: 'PAN Card - Rajesh Kumar',
      fileName: 'pan_rajesh.pdf',
      uploadDate: '2024-01-15',
      size: '1.5 MB',
      verified: true,
    },
    {
      id: '3',
      type: 'lease',
      name: 'Lease Agreement - A-301',
      fileName: 'lease_agreement_a301.pdf',
      uploadDate: '2024-01-10',
      size: '3.2 MB',
      verified: false,
      expiryDate: '2026-01-10',
    },
    {
      id: '4',
      type: 'driving_license',
      name: 'Driving License',
      fileName: 'dl_rajesh.pdf',
      uploadDate: '2024-02-01',
      size: '1.8 MB',
      verified: true,
      expiryDate: '2028-05-15',
    },
  ]);

  const handleUploadDocument = () => {
    console.log('Upload document pressed');
    // Handle document upload (camera/gallery/file picker)
  };

  const handleViewDocument = (document: Document) => {
    console.log('View document:', document.name);
    // Open document viewer
  };

  const handleDownloadDocument = (document: Document) => {
    console.log('Download document:', document.name);
    // Handle document download
  };

  const handleDeleteDocument = (document: Document) => {
    Alert.alert(
      'Delete Document',
      `Are you sure you want to delete ${document.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            setDocuments(prev => prev.filter(d => d.id !== document.id));
          },
        },
      ]
    );
  };

  const getDocumentIcon = (type: string) => {
    const icons = {
      aadhar: Shield,
      pan: CreditCard,
      lease: Home,
      noc: FileText,
      passport: FileText,
      driving_license: CreditCard,
      other: FileText,
    };
    return icons[type as keyof typeof icons] || FileText;
  };

  const getDocumentColor = (type: string) => {
    const colors = {
      aadhar: '#6366f1',
      pan: '#2196F3',
      lease: '#4CAF50',
      noc: '#FF9800',
      passport: '#9C27B0',
      driving_license: '#00BCD4',
      other: '#757575',
    };
    return colors[type as keyof typeof colors] || '#757575';
  };

  const getDocumentTypeName = (type: string) => {
    const names = {
      aadhar: 'Aadhar Card',
      pan: 'PAN Card',
      lease: 'Lease Agreement',
      noc: 'NOC Certificate',
      passport: 'Passport',
      driving_license: 'Driving License',
      other: 'Other Document',
    };
    return names[type as keyof typeof names] || 'Document';
  };

  const isDocumentExpiring = (expiryDate?: string) => {
    if (!expiryDate) return false;
    const expiry = new Date(expiryDate);
    const today = new Date();
    const diffTime = expiry.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 90; // Expiring within 90 days
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      {/* Header */}
      <View className="flex-row items-center justify-between p-4 border-b border-divider bg-surface">
        <View className="flex-row items-center">
          <Button
            variant="ghost"
            size="sm"
            onPress={() => router.back()}
            className="mr-2 p-2"
          >
            <ArrowLeft size={20} color="#6366f1" />
          </Button>
          <Text className="text-text-primary text-headline-large font-semibold">
            Documents
          </Text>
        </View>
        
        <Button size="sm" onPress={handleUploadDocument}>
          <Plus size={16} color="white" />
        </Button>
      </View>

      <ScrollView 
        className="flex-1 p-4" 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 20 }}
      >
        {/* Documents List */}
        {documents.map((document) => {
          const DocumentIcon = getDocumentIcon(document.type);
          const isExpiring = isDocumentExpiring(document.expiryDate);
          
          return (
            <Card key={document.id} className={cn("mb-4", isExpiring && "border-warning/50")}>
              {/* Expiry Warning */}
              {isExpiring && (
                <View className="bg-warning/10 border border-warning/20 rounded-lg p-3 mb-4">
                  <Text className="text-warning text-sm font-medium">
                    ⚠️ Document expires on {document.expiryDate}
                  </Text>
                </View>
              )}

              <View className="flex-row items-start">
                {/* Document Icon */}
                <View 
                  className="w-16 h-16 rounded-xl items-center justify-center mr-4"
                  style={{ backgroundColor: `${getDocumentColor(document.type)}15` }}
                >
                  <DocumentIcon size={28} color={getDocumentColor(document.type)} />
                </View>

                {/* Document Info */}
                <View className="flex-1">
                  <View className="flex-row items-start justify-between mb-2">
                    <View className="flex-1 mr-2">
                      <Text className="text-text-primary text-lg font-semibold">
                        {document.name}
                      </Text>
                      
                      {/* Document Type Badge */}
                      <View 
                        className="self-start px-3 py-1 rounded-full mt-1"
                        style={{ backgroundColor: `${getDocumentColor(document.type)}15` }}
                      >
                        <Text 
                          className="text-xs font-medium"
                          style={{ color: getDocumentColor(document.type) }}
                        >
                          {getDocumentTypeName(document.type)}
                        </Text>
                      </View>
                    </View>

                    {/* Verification Status */}
                    {document.verified && (
                      <View className="bg-secondary/10 rounded-full p-2">
                        <CheckCircle size={16} color="#4CAF50" />
                      </View>
                    )}
                  </View>

                  {/* Document Details */}
                  <View className="space-y-1 mb-3">
                    <Text className="text-text-secondary text-sm">
                      File: {document.fileName} • {document.size}
                    </Text>
                    
                    <Text className="text-text-secondary text-sm">
                      Uploaded: {document.uploadDate}
                    </Text>
                    
                    {document.expiryDate && (
                      <Text className={cn(
                        "text-sm",
                        isExpiring ? "text-warning font-medium" : "text-text-secondary"
                      )}>
                        Expires: {document.expiryDate}
                      </Text>
                    )}

                    {document.verified ? (
                      <Text className="text-secondary text-sm font-medium">
                        ✓ Verified by society
                      </Text>
                    ) : (
                      <Text className="text-warning text-sm font-medium">
                        ⏳ Pending verification
                      </Text>
                    )}
                  </View>

                  {/* Action Buttons */}
                  <View className="flex-row gap-2">
                    <TouchableOpacity
                      onPress={() => handleViewDocument(document)}
                      className="flex-1 bg-primary/10 rounded-lg py-2 px-3 flex-row items-center justify-center"
                      activeOpacity={0.7}
                    >
                      <Eye size={14} color="#6366f1" />
                      <Text className="text-primary text-sm font-medium ml-1">
                        View
                      </Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity
                      onPress={() => handleDownloadDocument(document)}
                      className="flex-1 bg-secondary/10 rounded-lg py-2 px-3 flex-row items-center justify-center"
                      activeOpacity={0.7}
                    >
                      <Download size={14} color="#4CAF50" />
                      <Text className="text-secondary text-sm font-medium ml-1">
                        Download
                      </Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity
                      onPress={() => handleDeleteDocument(document)}
                      className="bg-error/10 rounded-lg py-2 px-3"
                      activeOpacity={0.7}
                    >
                      <Trash2 size={14} color="#D32F2F" />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </Card>
          );
        })}

        {/* Empty State */}
        {documents.length === 0 && (
          <View className="items-center justify-center py-12">
            <View className="w-24 h-24 rounded-full bg-primary/10 items-center justify-center mb-4">
              <FileText size={32} color="#6366f1" />
            </View>
            <Text className="text-text-primary text-lg font-semibold mb-2">
              No Documents Uploaded
            </Text>
            <Text className="text-text-secondary text-center mb-6 px-4">
              Upload your important documents for easy access and society verification.
            </Text>
            <Button onPress={handleUploadDocument}>
              Upload Document
            </Button>
          </View>
        )}

        {/* Upload Document Card */}
        {documents.length > 0 && (
          <TouchableOpacity
            onPress={handleUploadDocument}
            className={cn(
              "border-2 border-dashed border-primary/30 rounded-xl p-6",
              "items-center justify-center bg-primary/5",
              "active:bg-primary/10"
            )}
            activeOpacity={0.8}
          >
            <Upload size={24} color="#6366f1" />
            <Text className="text-primary text-body-large font-medium mt-2">
              Upload Document
            </Text>
          </TouchableOpacity>
        )}

        {/* Document Types Info */}
        <Card className="mt-6 bg-secondary/10 border-secondary/20">
          <Text className="text-secondary text-sm font-medium mb-2">
            📄 Supported Documents
          </Text>
          <Text className="text-text-secondary text-sm leading-5">
            • Aadhar Card (Identity proof){'\n'}
            • PAN Card (Tax identification){'\n'}
            • Lease Agreement (Residence proof){'\n'}
            • NOC Certificate (Society approval){'\n'}
            • Driving License, Passport (Additional ID)
          </Text>
        </Card>

        {/* Security Notice */}
        <Card className="mt-4 bg-primary/10 border-primary/20">
          <Text className="text-primary text-sm font-medium mb-2">
            🔒 Security & Privacy
          </Text>
          <Text className="text-text-secondary text-sm leading-5">
            Your documents are encrypted and stored securely. Only you and authorized society members can access them for verification purposes.
          </Text>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}