import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Image,
  Platform,
  Alert,
} from 'react-native';
import { X, Camera, User } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { Input } from './Input';
import { useTheme } from '@/contexts/ThemeContext';
import { supabase } from '@/lib/supabase';

interface ProfileEditModalProps {
  visible: boolean;
  onClose: () => void;
  userId: string;
  currentFullName?: string;
  currentEmail?: string;
  onSave: () => void;
}

export function ProfileEditModal({
  visible,
  onClose,
  userId,
  currentFullName,
  currentEmail,
  onSave,
}: ProfileEditModalProps) {
  const { theme } = useTheme();
  const [fullName, setFullName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [editMode, setEditMode] = useState(false);

  useEffect(() => {
    if (visible) {
      loadProfileData();
    }
  }, [visible, userId]);

  const loadProfileData = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('full_name, avatar_url')
        .eq('id', userId)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setFullName(data.full_name || '');
        setAvatarUrl(data.avatar_url || null);
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const getAvatarPublicUrl = (path: string | null) => {
    if (!path) return null;
    const { data } = supabase.storage.from('avatars').getPublicUrl(path);
    return data.publicUrl;
  };

  const pickImage = async () => {
    if (!editMode) {
      return;
    }

    if (Platform.OS !== 'web') {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'We need camera roll permissions to select a photo.');
        return;
      }
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      await uploadAvatar(result.assets[0].uri);
    }
  };

  const uploadAvatar = async (uri: string) => {
    setUploading(true);
    try {
      const fileExt = uri.split('.').pop()?.toLowerCase() || 'jpg';
      const fileName = `${userId}/avatar.${fileExt}`;

      let fileData: Blob | File;

      if (Platform.OS === 'web') {
        const response = await fetch(uri);
        fileData = await response.blob();
      } else {
        const response = await fetch(uri);
        const blob = await response.blob();
        fileData = blob;
      }

      const maxSizeInBytes = 5 * 1024 * 1024;
      if (fileData.size > maxSizeInBytes) {
        if (Platform.OS === 'web') {
          alert('Image size must be less than 5MB. Please choose a smaller image.');
        } else {
          Alert.alert('Image Too Large', 'Image size must be less than 5MB. Please choose a smaller image.');
        }
        return;
      }

      try {
        const { data: existingFiles, error: listError } = await supabase.storage
          .from('avatars')
          .list(userId);

        if (!listError && existingFiles && existingFiles.length > 0) {
          const filesToDelete = existingFiles.map(file => `${userId}/${file.name}`);
          const { error: deleteError } = await supabase.storage
            .from('avatars')
            .remove(filesToDelete);

          if (deleteError) {
            console.error('Error deleting old avatars:', deleteError);
          }
        }
      } catch (cleanupError) {
        console.error('Error during cleanup:', cleanupError);
      }

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, fileData, {
          contentType: `image/${fileExt}`,
          upsert: true,
        });

      if (uploadError) throw uploadError;

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: fileName })
        .eq('id', userId);

      if (updateError) throw updateError;

      setAvatarUrl(fileName);
    } catch (error) {
      console.error('Error uploading avatar:', error);
      if (Platform.OS === 'web') {
        alert('Failed to upload image. Please try again.');
      } else {
        Alert.alert('Upload Failed', 'Failed to upload image. Please try again.');
      }
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    if (!fullName.trim()) {
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: fullName.trim(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId);

      if (error) throw error;

      onSave();
      setEditMode(false);
      onClose();
    } catch (error) {
      console.error('Error saving profile:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleDiscard = () => {
    setEditMode(false);
    loadProfileData();
  };

  const handleCancel = () => {
    if (editMode) {
      setEditMode(false);
      loadProfileData();
    } else {
      onClose();
    }
  };

  const publicAvatarUrl = getAvatarPublicUrl(avatarUrl);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={[styles.modalContainer, { backgroundColor: theme.background }]}>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={onClose}
            activeOpacity={0.7}
          >
            <X size={24} color={theme.text} />
          </TouchableOpacity>

          <ScrollView
            style={styles.scrollView}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            <View style={styles.header}>
              <View style={styles.avatarContainer}>
                <View style={styles.avatar}>
                  {publicAvatarUrl ? (
                    <Image source={{ uri: publicAvatarUrl }} style={styles.avatarImage} />
                  ) : (
                    <User size={40} color="#fff" />
                  )}
                </View>
                <TouchableOpacity
                  style={[
                    styles.cameraButton,
                    uploading && styles.cameraButtonDisabled,
                    editMode && styles.cameraButtonActive,
                  ]}
                  onPress={pickImage}
                  activeOpacity={0.7}
                  disabled={!editMode || uploading}
                >
                  {uploading ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <Camera size={16} color="#fff" />
                  )}
                </TouchableOpacity>
              </View>

              {!editMode && !fullName && (
                <Text style={[styles.nameNotInformed, { color: theme.textSecondary }]}>
                  Name not informed
                </Text>
              )}

              {!editMode && fullName && (
                <Text style={[styles.displayName, { color: theme.text }]}>
                  {fullName}
                </Text>
              )}

              <Text style={[styles.usingLabel, { color: theme.textSecondary }]}>
                Using MaxTestorin
              </Text>
            </View>

            <View style={styles.content}>
              <Text style={[styles.title, { color: theme.text }]}>
                Manage Personal Data
              </Text>
              <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
                {editMode ? 'Edit mode active - Change the fields below and click the camera icon to update your profile photo' : 'Click Start Edit to modify your information'}
              </Text>

              {!editMode && (
                <TouchableOpacity
                  style={styles.startEditButton}
                  onPress={() => setEditMode(true)}
                  activeOpacity={0.7}
                >
                  <X size={18} color="#fff" />
                  <Text style={styles.startEditButtonText}>Start Edit</Text>
                </TouchableOpacity>
              )}

              {editMode && (
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={handleCancel}
                  activeOpacity={0.7}
                >
                  <X size={18} color="#fff" />
                  <Text style={styles.cancelButtonText}>Cancel Edit</Text>
                </TouchableOpacity>
              )}

              {loading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color="#e40f11" />
                </View>
              ) : (
                <>
                  <View style={styles.fieldContainer}>
                    <View style={styles.fieldHeader}>
                      <User size={16} color="#e40f11" />
                      <Text style={[styles.fieldLabel, { color: theme.text }]}>
                        Full Name *
                      </Text>
                    </View>
                    <Input
                      value={fullName}
                      onChangeText={setFullName}
                      placeholder="Ex: John Silva Santos"
                      editable={editMode}
                      style={[
                        styles.input,
                        !editMode && styles.inputDisabled,
                        { backgroundColor: editMode ? theme.surface : theme.card },
                      ]}
                    />
                  </View>
                </>
              )}
            </View>

            {editMode && (
              <View style={styles.footer}>
                <Text style={[styles.footerTitle, { color: theme.text }]}>
                  Save Changes
                </Text>
                <Text style={[styles.footerSubtitle, { color: theme.textSecondary }]}>
                  Confirm the changes made to your personal data
                </Text>

                <View style={styles.buttonRow}>
                  <TouchableOpacity
                    style={[styles.discardButton, { borderColor: theme.border }]}
                    onPress={handleDiscard}
                    activeOpacity={0.7}
                    disabled={saving}
                  >
                    <X size={18} color={theme.text} />
                    <Text style={[styles.discardButtonText, { color: theme.text }]}>
                      Discard
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.saveButton, saving && styles.saveButtonDisabled]}
                    onPress={handleSave}
                    activeOpacity={0.7}
                    disabled={saving || !fullName.trim()}
                  >
                    {saving ? (
                      <ActivityIndicator size="small" color="#fff" />
                    ) : (
                      <>
                        <Text style={styles.saveButtonText}>Save Data</Text>
                      </>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    width: '100%',
    maxWidth: 500,
    maxHeight: '90%',
    borderRadius: 20,
    overflow: 'hidden',
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    zIndex: 10,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  header: {
    alignItems: 'center',
    paddingTop: 40,
    paddingBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 12,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#e40f11',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 40,
  },
  cameraButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#9ca3af',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#fff',
  },
  cameraButtonActive: {
    backgroundColor: '#e40f11',
    shadowColor: '#e40f11',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 4,
  },
  cameraButtonDisabled: {
    opacity: 0.6,
  },
  nameNotInformed: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  displayName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  usingLabel: {
    fontSize: 13,
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 13,
    marginBottom: 16,
  },
  startEditButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#10b981',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginBottom: 24,
  },
  startEditButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  cancelButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#dc2626',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginBottom: 24,
  },
  cancelButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  loadingContainer: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  fieldContainer: {
    marginBottom: 20,
  },
  fieldHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  input: {
    fontSize: 14,
  },
  inputDisabled: {
    opacity: 0.6,
  },
  footer: {
    padding: 20,
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  footerTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  footerSubtitle: {
    fontSize: 13,
    marginBottom: 16,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  discardButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 8,
    borderWidth: 2,
  },
  discardButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  saveButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#10b981',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});
