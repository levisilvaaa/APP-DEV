import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, Image, Modal, Alert, Clipboard } from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useRouter } from 'expo-router';
import { Header } from '@/components/Header';
import { DrawerMenu } from '@/components/DrawerMenu';
import { ProfileEditModal } from '@/components/ProfileEditModal';
import { LogOut, Mail, User, Bell, Shield, HelpCircle, Moon, Sun, Globe, Settings, Copy, Eye, EyeOff, Lock } from 'lucide-react-native';
import { supabase } from '@/lib/supabase';

export default function SettingsScreen() {
  const { user, signOut } = useAuth();
  const { theme, mode, toggleTheme } = useTheme();
  const { language, setLanguage } = useLanguage();
  const router = useRouter();
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [profileModalVisible, setProfileModalVisible] = useState(false);
  const [helpModalVisible, setHelpModalVisible] = useState(false);
  const [securityModalVisible, setSecurityModalVisible] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [userPassword, setUserPassword] = useState<string>('');
  const [fullName, setFullName] = useState<string>('');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  useEffect(() => {
    if (user?.id) {
      fetchProfile();
    }
  }, [user?.id]);

  useEffect(() => {
    if (user?.id && !profileModalVisible) {
      fetchProfile();
    }
  }, [profileModalVisible]);

  const fetchProfile = async () => {
    if (!user?.id) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('full_name, avatar_url, plain_password')
        .eq('id', user.id)
        .maybeSingle();

      if (error) throw error;
      if (data) {
        setFullName(data.full_name);
        setUserPassword(data.plain_password || '');
        setAvatarUrl(data.avatar_url);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      // Forçar navegação para a tela de login após logout
      setTimeout(() => {
        router.replace('/login');
      }, 100);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  };

  const getAvatarPublicUrl = (path: string | null) => {
    if (!path) return null;
    const { data } = supabase.storage.from('avatars').getPublicUrl(path);
    return data.publicUrl;
  };

  const publicAvatarUrl = getAvatarPublicUrl(avatarUrl);

  const handleCopyEmail = () => {
    const supportEmail = 'support@maxtestorin.com';
    Clipboard.setString(supportEmail);
    Alert.alert('Email copiado!', 'O email de suporte foi copiado para a área de transferência.');
    setHelpModalVisible(false);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <DrawerMenu visible={drawerVisible} onClose={() => setDrawerVisible(false)} />
      <ProfileEditModal
        visible={profileModalVisible}
        onClose={() => setProfileModalVisible(false)}
        userId={user?.id || ''}
        currentFullName={fullName}
        currentEmail={user?.email}
        onSave={fetchProfile}
      />
      <Header
        greeting="Configurações"
        subtitle="Gerencie sua conta e preferências"
        icon={<Settings size={20} color="#fff" />}
        hideMenu
      />

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
      <View style={styles.content}>
        <View style={[styles.profileCard, { backgroundColor: theme.card }]}>
          <View style={styles.avatar}>
            {publicAvatarUrl ? (
              <Image source={{ uri: publicAvatarUrl }} style={styles.avatarImage} />
            ) : (
              <Text style={styles.avatarText}>
                {user?.email?.[0].toUpperCase() || 'U'}
              </Text>
            )}
          </View>
          {fullName && <Text style={[styles.userName, { color: theme.text }]}>{fullName}</Text>}
          <Text style={[styles.memberSince, { color: theme.textSecondary }]}>
            Membro desde {formatDate(user?.created_at)}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Conta</Text>
          <View style={[styles.settingsCard, { backgroundColor: theme.card }]}>
            <TouchableOpacity
              style={styles.settingItem}
              onPress={() => setProfileModalVisible(true)}
              activeOpacity={0.7}
            >
              <View style={[styles.settingIcon, { backgroundColor: theme.surface }]}>
                <User size={20} color="#64748b" />
              </View>
              <View style={styles.settingContent}>
                <Text style={[styles.settingLabel, { color: theme.text }]}>Perfil</Text>
                <Text style={[styles.settingValue, { color: theme.textSecondary }]}>Editar informações pessoais</Text>
              </View>
            </TouchableOpacity>

            <View style={[styles.divider, { backgroundColor: theme.border }]} />

            <TouchableOpacity style={styles.settingItem}>
              <View style={[styles.settingIcon, { backgroundColor: theme.surface }]}>
                <Mail size={20} color="#64748b" />
              </View>
              <View style={styles.settingContent}>
                <Text style={[styles.settingLabel, { color: theme.text }]}>Email</Text>
                <Text style={[styles.settingValue, { color: theme.textSecondary }]}>{user?.email}</Text>
              </View>
            </TouchableOpacity>

            <View style={[styles.divider, { backgroundColor: theme.border }]} />

            <TouchableOpacity
              style={styles.settingItem}
              onPress={() => setSecurityModalVisible(true)}
              activeOpacity={0.7}
            >
              <View style={[styles.settingIcon, { backgroundColor: theme.surface }]}>
                <Shield size={20} color="#64748b" />
              </View>
              <View style={styles.settingContent}>
                <Text style={[styles.settingLabel, { color: theme.text }]}>Segurança</Text>
                <Text style={[styles.settingValue, { color: theme.textSecondary }]}>Senha e autenticação</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Aparência</Text>
          <View style={[styles.settingsCard, { backgroundColor: theme.card }]}>
            <View style={styles.settingItem}>
              <View style={[styles.settingIcon, { backgroundColor: theme.surface }]}>
                {mode === 'dark' ? (
                  <Moon size={20} color={theme.primary} />
                ) : (
                  <Sun size={20} color={theme.primary} />
                )}
              </View>
              <View style={styles.settingContent}>
                <Text style={[styles.settingLabel, { color: theme.text }]}>Tema Escuro</Text>
                <Text style={[styles.settingValue, { color: theme.textSecondary }]}>Alternar entre claro e escuro</Text>
              </View>
              <Switch
                value={mode === 'dark'}
                onValueChange={toggleTheme}
                trackColor={{ false: '#cbd5e1', true: theme.primary }}
                thumbColor="#fff"
              />
            </View>

            <View style={[styles.divider, { backgroundColor: theme.border }]} />

            <TouchableOpacity
              style={styles.settingItem}
              onPress={() => setLanguage(language === 'pt' ? 'en' : 'pt')}
            >
              <View style={[styles.settingIcon, { backgroundColor: theme.surface }]}>
                <Globe size={20} color={theme.primary} />
              </View>
              <View style={styles.settingContent}>
                <Text style={[styles.settingLabel, { color: theme.text }]}>Idioma</Text>
                <Text style={[styles.settingValue, { color: theme.textSecondary }]}>
                  {language === 'pt' ? 'Português' : 'English'}
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Preferências</Text>
          <View style={[styles.settingsCard, { backgroundColor: theme.card }]}>
            <TouchableOpacity style={styles.settingItem}>
              <View style={[styles.settingIcon, { backgroundColor: theme.surface }]}>
                <Bell size={20} color="#64748b" />
              </View>
              <View style={styles.settingContent}>
                <Text style={[styles.settingLabel, { color: theme.text }]}>Notificações</Text>
                <Text style={[styles.settingValue, { color: theme.textSecondary }]}>Gerenciar alertas</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Suporte</Text>
          <View style={[styles.settingsCard, { backgroundColor: theme.card }]}>
            <TouchableOpacity
              style={styles.settingItem}
              onPress={() => setHelpModalVisible(true)}
              activeOpacity={0.7}
            >
              <View style={[styles.settingIcon, { backgroundColor: theme.surface }]}>
                <HelpCircle size={20} color="#64748b" />
              </View>
              <View style={styles.settingContent}>
                <Text style={[styles.settingLabel, { color: theme.text }]}>Ajuda</Text>
                <Text style={[styles.settingValue, { color: theme.textSecondary }]}>Central de ajuda e FAQ</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity style={[styles.signOutButton, { backgroundColor: theme.card, borderColor: mode === 'dark' ? theme.border : '#fee2e2' }]} onPress={handleSignOut}>
          <LogOut size={20} color="#dc2626" />
          <Text style={styles.signOutText}>Sair da conta</Text>
        </TouchableOpacity>
      </View>
      </ScrollView>

      <Modal
        visible={helpModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setHelpModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.card }]}>
            <View style={styles.modalHeader}>
              <HelpCircle size={32} color="#e40f11" />
              <Text style={[styles.modalTitle, { color: theme.text }]}>Precisa de Ajuda?</Text>
              <Text style={[styles.modalSubtitle, { color: theme.textSecondary }]}>
                Entre em contato com nosso suporte
              </Text>
            </View>

            <View style={styles.emailContainer}>
              <Text style={[styles.emailLabel, { color: theme.textSecondary }]}>
                Email de Suporte:
              </Text>
              <View style={[styles.emailBox, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                <Mail size={18} color="#e40f11" />
                <Text style={[styles.emailText, { color: theme.text }]}>
                  support@maxtestorin.com
                </Text>
              </View>
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.copyButton}
                onPress={handleCopyEmail}
                activeOpacity={0.7}
              >
                <Copy size={18} color="#fff" />
                <Text style={styles.copyButtonText}>Copiar Email</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.closeButton, { backgroundColor: theme.surface, borderColor: theme.border }]}
                onPress={() => setHelpModalVisible(false)}
                activeOpacity={0.7}
              >
                <Text style={[styles.closeButtonText, { color: theme.text }]}>Fechar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        visible={securityModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => {
          setSecurityModalVisible(false);
          setPasswordVisible(false);
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.card }]}>
            <View style={styles.modalHeader}>
              <Shield size={32} color="#e40f11" />
              <Text style={[styles.modalTitle, { color: theme.text }]}>Segurança da Conta</Text>
              <Text style={[styles.modalSubtitle, { color: theme.textSecondary }]}>
                Visualize suas informações de login
              </Text>
            </View>

            <View style={styles.securityInfoContainer}>
              <View style={styles.securityItem}>
                <Text style={[styles.securityLabel, { color: theme.textSecondary }]}>
                  Email de Login:
                </Text>
                <View style={[styles.securityBox, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                  <Mail size={18} color="#64748b" />
                  <Text style={[styles.securityText, { color: theme.text }]}>
                    {user?.email}
                  </Text>
                </View>
              </View>

              <View style={styles.securityItem}>
                <Text style={[styles.securityLabel, { color: theme.textSecondary }]}>Senha de Acesso:</Text>
                <View style={[styles.securityBox, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                  <Lock size={18} color="#64748b" />
                  <Text style={[styles.securityText, { color: theme.text }]}>{passwordVisible ? (userPassword || 'Senha não disponível') : '••••••••'}</Text>
                  <TouchableOpacity onPress={() => setPasswordVisible(!passwordVisible)} style={styles.eyeButton} activeOpacity={0.7}>
                    {passwordVisible ? <EyeOff size={18} color="#64748b" /> : <Eye size={18} color="#e40f11" />}
                  </TouchableOpacity>
                </View>
              </View>
              {passwordVisible && !userPassword && (
                <View style={[styles.securityNote, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                  <Text style={[styles.securityNoteText, { color: theme.textSecondary }]}>Senha não disponível. Esta conta pode ter sido criada antes da implementação deste recurso.</Text>
                </View>
              )}
            </View>

            <TouchableOpacity
              style={[styles.closeButton, { backgroundColor: theme.surface, borderColor: theme.border }]}
              onPress={() => {
                setSecurityModalVisible(false);
                setPasswordVisible(false);
              }}
              activeOpacity={0.7}
            >
              <Text style={[styles.closeButtonText, { color: theme.text }]}>Fechar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  profileCard: {
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#2563eb',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 40,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: '700',
    color: '#fff',
  },
  userName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  memberSince: {
    fontSize: 13,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  settingsCard: {
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 16,
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  settingContent: {
    flex: 1,
    gap: 4,
  },
  settingLabel: {
    fontSize: 15,
    fontWeight: '600',
  },
  settingValue: {
    fontSize: 13,
  },
  divider: {
    height: 1,
    marginHorizontal: 16,
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    marginTop: 8,
    shadowColor: '#dc2626',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  signOutText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#dc2626',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  modalHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '700',
    marginTop: 12,
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 14,
    textAlign: 'center',
  },
  emailContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  emailLabel: {
    fontSize: 13,
    marginBottom: 12,
    fontWeight: '500',
  },
  emailBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 1,
    width: '100%',
  },
  emailText: {
    fontSize: 15,
    fontWeight: '600',
    flex: 1,
  },
  modalButtons: {
    gap: 12,
  },
  copyButton: {
    backgroundColor: '#e40f11',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    shadowColor: '#e40f11',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  copyButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  closeButton: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
  },
  closeButtonText: {
    fontSize: 15,
    fontWeight: '600',
  },
  securityInfoContainer: {
    marginBottom: 24,
  },
  securityItem: {
    marginBottom: 20,
  },
  securityLabel: {
    fontSize: 13,
    marginBottom: 8,
    fontWeight: '500',
  },
  securityBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  securityText: {
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
  },
  eyeButton: {
    padding: 4,
  },
  securityNote: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 4,
  },
  securityNoteText: {
    fontSize: 12,
    lineHeight: 18,
  },
});
