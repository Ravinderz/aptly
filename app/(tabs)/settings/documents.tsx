import React, { useState, useEffect } from 'react';
import { SafeAreaView, View, Text, TouchableOpacity } from 'react-native';
import { ArrowLeft } from 'lucide-react-native';
import { router, useFocusEffect } from 'expo-router';
import Button from '../../../components/ui/Button';
import DocumentViewer from '../../../components/ui/DocumentViewer';
import { DocumentStorage, Document, initializeMockData } from '../../../utils/storage';

export default function Documents() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    initializeData();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      loadDocuments();
    }, [])
  );

  const initializeData = async () => {
    try {
      await initializeMockData();
      await loadDocuments();
    } catch (error) {
      console.error('Error initializing data:', error);
    }
  };

  const loadDocuments = async () => {
    try {
      const documentData = await DocumentStorage.getDocuments();
      setDocuments(documentData);
    } catch (error) {
      console.error('Error loading documents:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDocumentAdded = () => {
    loadDocuments();
  };

  const handleDocumentDeleted = () => {
    loadDocuments();
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-background">
        <View className="flex-1 items-center justify-center">
          <Text className="text-text-secondary">Loading documents...</Text>
        </View>
      </SafeAreaView>
    );
  }

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
      </View>

      <View className="flex-1 p-4">
        <DocumentViewer
          documents={documents}
          onDocumentAdded={handleDocumentAdded}
          onDocumentDeleted={handleDocumentDeleted}
          onRefresh={loadDocuments}
        />
      </View>
    </SafeAreaView>
  );
}