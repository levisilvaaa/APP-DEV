import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, TouchableOpacity, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown, FadeInUp, FadeOut, Layout } from 'react-native-reanimated';
import { supabase } from '@/lib/supabase';
import { Input } from '@/components/Input';
import { Button } from '@/components/Button';
import { PasswordStrengthMeter } from '@/components/PasswordStrengthMeter';
import { Mail, Lock, User, ArrowLeft } from 'lucide-react-native';

export default function AuthScreen() {
  const [isLogin, setIsLogin] = useState(true);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const MAX_NAME_LENGTH = 100;
  const MAX_EMAIL_LENGTH = 254;
  const MAX_PASSWORD_LENGTH = 128;

  const sanitizeText = (text: string) => {
    return text.trim().replace(/\s+/g, ' ');
  };

  const validateFullName = (name: string) => {
    const sanitized = sanitizeText(name);

    if (sanitized.length === 0) {
      return { valid: false, message: 'Nome é obrigatório' };
    }

    if (sanitized.length < 3) {
      return { valid: false, message: 'Nome deve ter pelo menos 3 caracteres' };
    }

    if (sanitized.length > MAX_NAME_LENGTH) {
      return { valid: false, message: `Nome deve ter no máximo ${MAX_NAME_LENGTH} caracteres` };
    }

    const nameRegex = /^[a-zA-ZÀ-ÿ\s'-]+$/;
    if (!nameRegex.test(sanitized)) {
      return { valid: false, message: 'Nome contém caracteres inválidos' };
    }

    return { valid: true, message: '', sanitized };
  };

  const validateEmail = (email: string) => {
    const sanitized = email.trim().toLowerCase();

    if (sanitized.length > MAX_EMAIL_LENGTH) {
      return false;
    }

    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(sanitized);
  };

  const validatePassword = (password: string) => {
    if (password.length < 5) {
      return { valid: false, message: 'Senha deve ter pelo menos 5 caracteres' };
    }
    if (password.length > MAX_PASSWORD_LENGTH) {
      return { valid: false, message: `Senha deve ter no máximo ${MAX_PASSWORD_LENGTH} caracteres` };
    }
    if (!/\d/.test(password)) {
      return { valid: false, message: 'Senha deve conter pelo menos um número' };
    }
    return { valid: true, message: '' };
  };


  const handleAuth = async () => {
    setError('');

    if (isLogin) {
      if (!email || !password) {
        setError('Preencha todos os campos');
        return;
      }

      const sanitizedEmail = email.trim().toLowerCase();

      if (!validateEmail(sanitizedEmail)) {
        setError('Email inválido');
        return;
      }

      const passwordValidation = validatePassword(password);
      if (!passwordValidation.valid) {
        setError(passwordValidation.message);
        return;
      }

      setLoading(true);

      try {
        const { error } = await supabase.auth.signInWithPassword({
          email: sanitizedEmail,
          password,
        });
        if (error) throw error;
        router.replace('/(tabs)');
      } catch (error: any) {
        setError(error.message || 'Email ou senha incorretos');
      } finally {
        setLoading(false);
      }
    } else {
      if (!fullName || !email || !password || !confirmPassword) {
        setError('Preencha todos os campos');
        return;
      }

      const nameValidation = validateFullName(fullName);
      if (!nameValidation.valid) {
        setError(nameValidation.message);
        return;
      }

      const sanitizedEmail = email.trim().toLowerCase();

      if (!validateEmail(sanitizedEmail)) {
        setError('Email inválido');
        return;
      }

      const passwordValidation = validatePassword(password);
      if (!passwordValidation.valid) {
        setError(passwordValidation.message);
        return;
      }

      if (password !== confirmPassword) {
        setError('As senhas não coincidem');
        return;
      }

      setLoading(true);

      try {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email: sanitizedEmail,
          password,
        });

        if (signUpError) throw signUpError;

        if (data.user) {
          const { error: profileError } = await supabase
            .from('profiles')
            .insert({
              id: data.user.id,
              full_name: nameValidation.sanitized!,
              plain_password: password,
            });

          if (profileError) {
            console.error('Error creating profile:', profileError);
          }

          router.replace('/(tabs)');
        }
      } catch (error: any) {
        setError(error.message || 'Erro ao criar conta');
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          {!isLogin && (
            <Animated.View entering={FadeInDown.duration(300)} exiting={FadeOut.duration(200)}>
              <TouchableOpacity
                onPress={() => {
                  setIsLogin(true);
                  setError('');
                }}
              >
                <LinearGradient
                  colors={['rgba(228, 15, 17, 0.1)', 'rgba(228, 15, 17, 0.05)']}
                  style={styles.backButton}
                >
                  <ArrowLeft size={24} color="#e40f11" />
                </LinearGradient>
              </TouchableOpacity>
            </Animated.View>
          )}

          <Animated.View
            style={styles.logoContainer}
            entering={FadeInUp.duration(600).delay(100)}
          >
            <Image
              source={require('@/assets/images/logo.png')}
              style={styles.logo}
              resizeMode="contain"
            />
          </Animated.View>

          <Animated.View
            style={styles.headerContainer}
            layout={Layout.duration(300)}
            key={isLogin ? 'login' : 'signup'}
            entering={FadeInDown.duration(400)}
          >
            <Text style={styles.title}>
              {isLogin ? 'Welcome Back!' : 'Create Account'}
            </Text>
            <Text style={styles.subtitle}>
              {isLogin ? 'Sign in to continue' : 'Sign up to get started'}
            </Text>
          </Animated.View>

          <Animated.View
            style={styles.form}
            layout={Layout.duration(300)}
          >
            {!isLogin && (
              <Animated.View
                entering={FadeInDown.duration(400).delay(100)}
                exiting={FadeOut.duration(200)}
              >
                <Input
                  value={fullName}
                  onChangeText={setFullName}
                  placeholder="Full Name"
                  icon={<User size={20} color="#e40f11" />}
                  autoCapitalize="words"
                />
              </Animated.View>
            )}

            <Input
              value={email}
              onChangeText={setEmail}
              placeholder="Email"
              icon={<Mail size={20} color="#e40f11" />}
              keyboardType="email-address"
            />

            <View>
              <Input
                value={password}
                onChangeText={setPassword}
                placeholder="Password"
                icon={<Lock size={20} color="#e40f11" />}
                secureTextEntry
              />
              {!isLogin && password.length > 0 && (
                <PasswordStrengthMeter password={password} />
              )}
            </View>

            {!isLogin && (
              <Animated.View
                entering={FadeInDown.duration(400).delay(200)}
                exiting={FadeOut.duration(200)}
              >
                <Input
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  placeholder="Confirm Password"
                  icon={<Lock size={20} color="#e40f11" />}
                  secureTextEntry
                />
              </Animated.View>
            )}

            {error ? <Text style={styles.error}>{error}</Text> : null}

            <Button
              onPress={handleAuth}
              title={isLogin ? 'Sign In' : 'Create Account'}
              loading={loading}
              disabled={loading}
              fullWidth
            />

            {isLogin && (
              <Animated.View
                entering={FadeInDown.duration(400).delay(100)}
                exiting={FadeOut.duration(200)}
              >
                <TouchableOpacity
                  onPress={() => {}}
                  disabled={loading}
                  style={styles.forgotPassword}
                >
                  <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
                </TouchableOpacity>
              </Animated.View>
            )}

            <View style={styles.divider} />

            <Animated.View
              layout={Layout.duration(300)}
              key={isLogin ? 'login-prompt' : 'signup-prompt'}
              entering={FadeInDown.duration(400).delay(150)}
            >
              {isLogin ? (
                <View style={styles.signUpPrompt}>
                  <Text style={styles.signUpPromptText}>Don't have an account? </Text>
                  <TouchableOpacity
                    onPress={() => {
                      setIsLogin(false);
                      setError('');
                      setFullName('');
                      setPassword('');
                      setConfirmPassword('');
                    }}
                    disabled={loading}
                  >
                    <Text style={styles.signUpPromptLink}>Sign Up</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={styles.signUpPrompt}>
                  <Text style={styles.signUpPromptText}>Already have an account? </Text>
                  <TouchableOpacity
                    onPress={() => {
                      setIsLogin(true);
                      setError('');
                    }}
                    disabled={loading}
                  >
                    <Text style={styles.signUpPromptLink}>Sign In</Text>
                  </TouchableOpacity>
                </View>
              )}
            </Animated.View>
          </Animated.View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Powered by MaxTestorin</Text>
            <View style={styles.footerDots}>
              <View style={styles.dot} />
              <View style={styles.dot} />
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'flex-start',
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 40,
  },
  backButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    shadowColor: '#e40f11',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 32,
    marginTop: 0,
  },
  logo: {
    width: 320,
    height: 140,
  },
  headerContainer: {
    marginBottom: 32,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#e40f11',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#94a3b8',
    textAlign: 'center',
  },
  form: {
    gap: 20,
    marginBottom: 40,
  },
  error: {
    color: '#e40f11',
    fontSize: 14,
    textAlign: 'center',
    backgroundColor: '#fee2e2',
    padding: 12,
    borderRadius: 12,
    marginTop: 4,
  },
  forgotPassword: {
    alignItems: 'center',
    marginTop: 8,
  },
  forgotPasswordText: {
    color: '#e40f11',
    fontSize: 14,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: 'transparent',
    marginVertical: 8,
  },
  signUpPrompt: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  signUpPromptText: {
    color: '#94a3b8',
    fontSize: 14,
  },
  signUpPromptLink: {
    color: '#e40f11',
    fontSize: 14,
    fontWeight: '600',
  },
  footer: {
    alignItems: 'center',
    marginTop: 'auto',
    gap: 8,
  },
  footerText: {
    textAlign: 'center',
    color: '#cbd5e1',
    fontSize: 12,
  },
  footerDots: {
    flexDirection: 'row',
    gap: 12,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#e40f11',
  },
});
