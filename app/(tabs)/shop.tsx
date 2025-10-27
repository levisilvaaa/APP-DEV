import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, Image, Pressable } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { Header } from '@/components/Header';
import { DrawerMenu } from '@/components/DrawerMenu';
import { ShoppingCart, Package, Shield, Truck, Lock, Clock, Award, Leaf, RotateCcw, Globe, BadgeCheck, X } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { WebView } from 'react-native-webview';

interface ProductPackage {
  id: string;
  bottles: number;
  title: string;
  originalPrice: number;
  salePrice: number;
  savings: number;
  pricePerBottle: number;
  badge?: string;
  checkoutUrl: string;
}

interface Feature {
  icon: any;
  title: string;
  description?: string;
}

interface PaymentMethod {
  name: string;
  logo: string;
}

export default function ShopScreen() {
  const { theme, mode } = useTheme();
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [webViewVisible, setWebViewVisible] = useState(false);
  const [selectedCheckoutUrl, setSelectedCheckoutUrl] = useState('');

  const packages: ProductPackage[] = [
    {
      id: '6-bottles',
      bottles: 6,
      title: '6 Bottles',
      originalPrice: 594,
      salePrice: 294,
      savings: 300,
      pricePerBottle: 49,
      badge: 'MELHOR OFERTA',
      checkoutUrl: 'https://checkout.example.com/6-bottles',
    },
    {
      id: '3-bottles',
      bottles: 3,
      title: '3 Bottles',
      originalPrice: 297,
      salePrice: 177,
      savings: 120,
      pricePerBottle: 59,
      checkoutUrl: 'https://checkout.example.com/3-bottles',
    },
    {
      id: '1-bottle',
      bottles: 1,
      title: '1 Bottle',
      originalPrice: 99,
      salePrice: 69,
      savings: 30,
      pricePerBottle: 69,
      checkoutUrl: 'https://checkout.example.com/1-bottle',
    },
  ];

  const features: Feature[] = [
    { icon: Shield, title: '180 Dias', description: 'Garantia de devolução' },
    { icon: Truck, title: 'Frete Grátis', description: 'Em todos os pedidos' },
    { icon: Lock, title: 'Seguro', description: 'Pagamento protegido' },
    { icon: BadgeCheck, title: 'SSL', description: 'Criptografia' },
    { icon: Clock, title: '24/7', description: 'Suporte ao cliente' },
  ];

  const paymentMethods: PaymentMethod[] = [
    { name: 'VISA', logo: '💳' },
    { name: 'Mastercard', logo: '💳' },
    { name: 'Discover', logo: '💳' },
    { name: 'AMEX', logo: '💳' },
    { name: 'PayPal', logo: '💰' },
    { name: 'Apple Pay', logo: '🍎' },
    { name: 'Google Pay', logo: '🔵' },
  ];

  const productInfo: Feature[] = [
    { icon: Award, title: 'Fórmula Premium', description: 'Ingredientes selecionados de alta qualidade' },
    { icon: Leaf, title: 'Ingredientes Naturais', description: '100% natural e seguro' },
    { icon: RotateCcw, title: 'Garantia de Devolução', description: '180 dias de garantia total' },
    { icon: Globe, title: 'Frete Grátis Mundial', description: 'Entrega em todo o mundo' },
    { icon: BadgeCheck, title: 'Qualidade Garantida', description: 'Certificado e testado' },
  ];

  const handleBuyNow = (checkoutUrl: string) => {
    setSelectedCheckoutUrl(checkoutUrl);
    setWebViewVisible(true);
  };

  const mainPackage = packages[0];
  const otherPackages = packages.slice(1);

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <DrawerMenu visible={drawerVisible} onClose={() => setDrawerVisible(false)} />
      <Header
        greeting="Shop"
        subtitle="Continue your treatment"
        onMenuPress={() => setDrawerVisible(true)}
        icon={<ShoppingCart size={20} color="#fff" />}
      />

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Main Package - Best Offer */}
        <View style={styles.mainPackageContainer}>
          <LinearGradient
            colors={['#dc2626', '#b91c1c']}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 0.5 }}
            style={styles.mainPackageCard}
          >
            <Image
              source={require('@/assets/images/6-bottles.png')}
              style={styles.bottlesImage}
              resizeMode="contain"
            />

            <Text style={styles.productName}>MAX TESTORIN</Text>
            <Text style={styles.packageTitleWhite}>6 BOTTLE PACKAGE</Text>

            <View style={styles.savingsBox}>
              <Text style={styles.savingsBoxText}>YOU'RE SAVING ${mainPackage.savings}</Text>
            </View>

            <Text style={styles.priceDetail}>
              only ${mainPackage.pricePerBottle} per bottle, ${mainPackage.salePrice} total
            </Text>

            <TouchableOpacity
              style={styles.claimButton}
              onPress={() => handleBuyNow(mainPackage.checkoutUrl)}
              activeOpacity={0.9}
            >
              <Text style={styles.claimButtonText}>CLAIM OFFER NOW</Text>
            </TouchableOpacity>
          </LinearGradient>
        </View>

        {/* Other Packages */}
        <View style={styles.otherPackagesSection}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Other Available Packages</Text>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.otherPackagesScroll}
          >
            {otherPackages.map((pkg) => (
              <View key={pkg.id} style={[styles.packageCard, { backgroundColor: theme.card }]}>
                <View style={styles.smallBottlesDisplay}>
                  {[...Array(pkg.bottles)].map((_, index) => (
                    <Package key={index} size={24} color="#e40f11" />
                  ))}
                </View>

                <Text style={[styles.smallPackageTitle, { color: theme.text }]}>{pkg.title}</Text>

                <View style={styles.smallPriceRow}>
                  <Text style={styles.smallOriginalPrice}>${pkg.originalPrice}</Text>
                  <Text style={styles.smallSalePrice}>${pkg.salePrice}</Text>
                </View>

                <Text style={[styles.smallSavings, { color: '#10b981' }]}>
                  Save ${pkg.savings}
                </Text>

                <Text style={[styles.smallPricePerBottle, { color: theme.textSecondary }]}>
                  ${pkg.pricePerBottle}/bottle
                </Text>

                <TouchableOpacity
                  style={[styles.smallBuyButton, { borderColor: '#e40f11' }]}
                  onPress={() => handleBuyNow(pkg.checkoutUrl)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.smallBuyButtonText}>COMPRAR AGORA</Text>
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>
        </View>

        {/* Features & Guarantees */}
        <View style={styles.featuresSection}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Features & Guarantees</Text>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.featuresScroll}
          >
            {features.map((feature, index) => (
              <View key={index} style={[styles.featureCard, { backgroundColor: theme.card }]}>
                <View style={[styles.featureIconCircle, { backgroundColor: mode === 'dark' ? '#1f2937' : '#f3f4f6' }]}>
                  <feature.icon size={24} color="#e40f11" />
                </View>
                <Text style={[styles.featureTitle, { color: theme.text }]}>{feature.title}</Text>
                {feature.description && (
                  <Text style={[styles.featureDescription, { color: theme.textSecondary }]}>
                    {feature.description}
                  </Text>
                )}
              </View>
            ))}
          </ScrollView>
        </View>

        {/* Payment Methods */}
        <View style={styles.paymentSection}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Payment Methods</Text>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.paymentScroll}
          >
            {paymentMethods.map((method, index) => (
              <View key={index} style={[styles.paymentCard, { backgroundColor: theme.card }]}>
                <Text style={styles.paymentLogo}>{method.logo}</Text>
                <Text style={[styles.paymentName, { color: theme.text }]}>{method.name}</Text>
              </View>
            ))}
          </ScrollView>
        </View>

        {/* Product Info */}
        <View style={styles.productInfoSection}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Sobre o MAX TESTORIN</Text>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.productInfoScroll}
          >
            {productInfo.map((info, index) => (
              <View key={index} style={[styles.productInfoCard, { backgroundColor: theme.card }]}>
                <View style={[styles.productInfoIconCircle, { backgroundColor: mode === 'dark' ? '#1f2937' : '#f3f4f6' }]}>
                  <info.icon size={28} color="#e40f11" />
                </View>
                <Text style={[styles.productInfoTitle, { color: theme.text }]}>{info.title}</Text>
                {info.description && (
                  <Text style={[styles.productInfoDescription, { color: theme.textSecondary }]}>
                    {info.description}
                  </Text>
                )}
              </View>
            ))}
          </ScrollView>
        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>

      {/* WebView Modal */}
      <Modal
        visible={webViewVisible}
        animationType="slide"
        transparent={false}
        onRequestClose={() => setWebViewVisible(false)}
      >
        <View style={[styles.modalContainer, { backgroundColor: theme.background }]}>
          <View style={[styles.modalHeader, { backgroundColor: theme.card }]}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>Checkout</Text>
            <Pressable
              style={styles.closeButton}
              onPress={() => setWebViewVisible(false)}
            >
              <X size={24} color={theme.text} />
            </Pressable>
          </View>

          <WebView
            source={{ uri: selectedCheckoutUrl }}
            style={styles.webView}
            startInLoadingState={true}
          />
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
  mainPackageContainer: {
    padding: 16,
    paddingTop: 8,
  },
  mainPackageCard: {
    borderRadius: 20,
    padding: 20,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 10,
  },
  bottlesImage: {
    width: '100%',
    height: 140,
    marginBottom: 12,
  },
  productName: {
    color: '#fff',
    fontSize: 26,
    fontWeight: '800',
    letterSpacing: 1.5,
    marginBottom: 8,
  },
  packageTitleWhite: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '700',
    letterSpacing: 0.8,
    marginBottom: 20,
  },
  savingsBox: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  savingsBoxText: {
    color: '#fbbf24',
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  priceDetail: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '500',
    marginBottom: 20,
    textAlign: 'center',
  },
  claimButton: {
    backgroundColor: '#fbbf24',
    paddingVertical: 16,
    paddingHorizontal: 40,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  claimButtonText: {
    color: '#7c2d12',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  otherPackagesSection: {
    paddingVertical: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    paddingHorizontal: 16,
    marginBottom: 12,
    textAlign: 'center',
  },
  swipeIndicator: {
    alignItems: 'center',
    marginBottom: 16,
  },
  swipeText: {
    fontSize: 13,
    fontWeight: '500',
  },
  otherPackagesScroll: {
    paddingHorizontal: 16,
    gap: 12,
  },
  packageCard: {
    width: 200,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  smallBottlesDisplay: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 4,
    marginBottom: 12,
  },
  smallPackageTitle: {
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
  },
  smallPriceRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  smallOriginalPrice: {
    fontSize: 16,
    color: '#9ca3af',
    textDecorationLine: 'line-through',
  },
  smallSalePrice: {
    fontSize: 24,
    fontWeight: '700',
    color: '#10b981',
  },
  smallSavings: {
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 4,
  },
  smallPricePerBottle: {
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 12,
  },
  smallBuyButton: {
    borderWidth: 2,
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  smallBuyButtonText: {
    color: '#e40f11',
    fontSize: 13,
    fontWeight: '700',
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  featuresSection: {
    paddingVertical: 20,
  },
  featuresScroll: {
    paddingHorizontal: 16,
    gap: 12,
  },
  featureCard: {
    width: 140,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  featureIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  featureTitle: {
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 11,
    textAlign: 'center',
  },
  paymentSection: {
    paddingVertical: 20,
  },
  paymentScroll: {
    paddingHorizontal: 16,
    gap: 12,
  },
  paymentCard: {
    width: 100,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  paymentLogo: {
    fontSize: 32,
    marginBottom: 8,
  },
  paymentName: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  productInfoSection: {
    paddingVertical: 20,
  },
  productInfoScroll: {
    paddingHorizontal: 16,
    gap: 12,
  },
  productInfoCard: {
    width: 180,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  productInfoIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  productInfoTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 6,
  },
  productInfoDescription: {
    fontSize: 12,
    lineHeight: 16,
  },
  bottomPadding: {
    height: 24,
  },
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  closeButton: {
    padding: 4,
  },
  webView: {
    flex: 1,
  },
});
