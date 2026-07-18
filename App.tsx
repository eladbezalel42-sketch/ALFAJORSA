import React, { useMemo, useState } from 'react';
import {
  Alert,
  Linking,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

type Flavor = {
  id: string;
  name: string;
  spanishName: string;
  description: string;
  price: number;
  accent: string;
};

const WHATSAPP_NUMBER = '972523838732';

const flavors: Flavor[] = [
  {
    id: 'classic',
    name: 'קלאסי שוקולד',
    spanishName: 'CLÁSICO',
    description: 'ריבת חלב עשירה וציפוי שוקולד בסגנון ארגנטינאי.',
    price: 16,
    accent: '#6B3D2E',
  },
  {
    id: 'white',
    name: 'שוקולד לבן',
    spanishName: 'BLANCO',
    description: 'ריבת חלב וציפוי שוקולד לבן עדין.',
    price: 16,
    accent: '#B4483D',
  },
  {
    id: 'pistachio',
    name: 'פיסטוק',
    spanishName: 'PISTACHO',
    description: 'קרם פיסטוק, ריבת חלב ושוקולד איכותי.',
    price: 18,
    accent: '#6F7446',
  },
  {
    id: 'espresso',
    name: 'אספרסו',
    spanishName: 'ESPRESSO',
    description: 'ריבת חלב עם קפה עמוק ומאוזן.',
    price: 17,
    accent: '#4A2F27',
  },
  {
    id: 'salted-caramel',
    name: 'קרמל מלוח',
    spanishName: 'CARAMELO SALADO',
    description: 'קרמל עשיר עם נגיעה מדויקת של מלח.',
    price: 18,
    accent: '#A66C3A',
  },
  {
    id: 'hazelnut',
    name: 'אגוזי לוז',
    spanishName: 'AVELLANA',
    description: 'קרם אגוזי לוז וריבת חלב קטיפתית.',
    price: 18,
    accent: '#79533D',
  },
  {
    id: 'berries',
    name: 'פירות יער',
    spanishName: 'FRUTOS DEL BOSQUE',
    description: 'חמיצות פירותית עדינה מול מתיקות ריבת החלב.',
    price: 18,
    accent: '#7B334B',
  },
  {
    id: 'lemon',
    name: 'לימון',
    spanishName: 'LIMÓN',
    description: 'קרם לימון רענן עם מתיקות מאוזנת.',
    price: 17,
    accent: '#B69A3F',
  },
];

const packOptions = [
  { title: 'יחיד', subtitle: 'לבחירת טעם' },
  { title: 'מארז 6', subtitle: 'לשיתוף וטעימה' },
  { title: 'מארז 12', subtitle: 'למשפחה ולאירוח' },
];

export default function App() {
  const [cart, setCart] = useState<Record<string, number>>({});

  const totalItems = useMemo(
    () => Object.values(cart).reduce((sum, amount) => sum + amount, 0),
    [cart],
  );

  const totalPrice = useMemo(
    () =>
      flavors.reduce(
        (sum, flavor) => sum + (cart[flavor.id] ?? 0) * flavor.price,
        0,
      ),
    [cart],
  );

  const changeQuantity = (id: string, delta: number) => {
    setCart((current) => {
      const next = Math.max((current[id] ?? 0) + delta, 0);
      return { ...current, [id]: next };
    });
  };

  const clearCart = () => setCart({});

  const sendWhatsAppOrder = async () => {
    if (totalItems === 0) {
      Alert.alert('הסל ריק', 'יש להוסיף לפחות אלפחור אחד להזמנה.');
      return;
    }

    const orderLines = flavors
      .filter((flavor) => (cart[flavor.id] ?? 0) > 0)
      .map((flavor) => {
        const quantity = cart[flavor.id] ?? 0;
        return `• ${flavor.name}: ${quantity} יחידות — ₪${quantity * flavor.price}`;
      })
      .join('\n');

    const message = [
      'שלום ALFAJORSA 👋',
      'אשמח לבצע הזמנה:',
      '',
      orderLines,
      '',
      `סה״כ פריטים: ${totalItems}`,
      `סה״כ משוער: ₪${totalPrice}`,
      '',
      'שם:',
      'יישוב וכתובת:',
      'טלפון:',
      'הערות:',
    ].join('\n');

    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;

    try {
      const supported = await Linking.canOpenURL(url);
      if (!supported) {
        throw new Error('Unsupported URL');
      }
      await Linking.openURL(url);
    } catch {
      Alert.alert('לא ניתן לפתוח WhatsApp', 'נסו שוב או צרו קשר ישירות עם ALFAJORSA.');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#F6F0E4" />
      <ScrollView
        contentContainerStyle={styles.page}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.hero}>
          <View style={styles.monogram}>
            <Text style={styles.monogramText}>Af.</Text>
          </View>
          <Text style={styles.brand}>ALFAJORSA</Text>
          <Text style={styles.subtitle}>טעם ארגנטינאי אמיתי בישראל</Text>
          <View style={styles.goldLine} />
          <Text style={styles.intro}>
            אלפחורס פרימיום בהשראת ארגנטינה, עם ריבת חלב עשירה,
            חומרי גלם איכותיים ועטיפה אלגנטית.
          </Text>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>אפשרויות הזמנה</Text>
          <Text style={styles.sectionCaption}>יחידים ומארזים בהרכבה אישית</Text>
        </View>

        <View style={styles.packRow}>
          {packOptions.map((pack) => (
            <View key={pack.title} style={styles.packCard}>
              <Text style={styles.packTitle}>{pack.title}</Text>
              <Text style={styles.packSubtitle}>{pack.subtitle}</Text>
            </View>
          ))}
        </View>

        <View style={styles.notice}>
          <Text style={styles.noticeText}>
            גרסת פיילוט: המחיר הסופי, זמינות הטעמים והמשלוח יאושרו ב־WhatsApp.
          </Text>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>שמונת הטעמים</Text>
          <Text style={styles.sectionCaption}>בחרו את ההרכב שלכם</Text>
        </View>

        <View style={styles.grid}>
          {flavors.map((flavor) => {
            const quantity = cart[flavor.id] ?? 0;
            return (
              <View key={flavor.id} style={styles.card}>
                <View style={[styles.flavorStripe, { backgroundColor: flavor.accent }]} />
                <Text style={styles.flavorSpanish}>{flavor.spanishName}</Text>
                <Text style={styles.flavorName}>{flavor.name}</Text>
                <Text style={styles.description}>{flavor.description}</Text>
                <View style={styles.cardBottom}>
                  <Text style={styles.price}>₪{flavor.price}</Text>
                  {quantity === 0 ? (
                    <TouchableOpacity
                      accessibilityRole="button"
                      accessibilityLabel={`הוספת ${flavor.name} לסל`}
                      style={styles.addButton}
                      activeOpacity={0.82}
                      onPress={() => changeQuantity(flavor.id, 1)}
                    >
                      <Text style={styles.addButtonText}>הוספה</Text>
                    </TouchableOpacity>
                  ) : (
                    <View style={styles.quantity}>
                      <TouchableOpacity
                        accessibilityRole="button"
                        accessibilityLabel={`הפחתת ${flavor.name}`}
                        style={styles.quantityButton}
                        onPress={() => changeQuantity(flavor.id, -1)}
                      >
                        <Text style={styles.quantityButtonText}>−</Text>
                      </TouchableOpacity>
                      <Text style={styles.quantityText}>{quantity}</Text>
                      <TouchableOpacity
                        accessibilityRole="button"
                        accessibilityLabel={`הוספת ${flavor.name}`}
                        style={styles.quantityButton}
                        onPress={() => changeQuantity(flavor.id, 1)}
                      >
                        <Text style={styles.quantityButtonText}>+</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              </View>
            );
          })}
        </View>

        <View style={styles.cart}>
          <View style={styles.cartTop}>
            <View style={styles.cartDetails}>
              <Text style={styles.cartTitle}>ההזמנה שלי</Text>
              <Text style={styles.cartSummary}>
                {totalItems} פריטים · ₪{totalPrice} משוער
              </Text>
            </View>
            {totalItems > 0 && (
              <TouchableOpacity onPress={clearCart} style={styles.clearButton}>
                <Text style={styles.clearText}>ניקוי</Text>
              </TouchableOpacity>
            )}
          </View>
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel="שליחת ההזמנה בוואטסאפ"
            style={[
              styles.orderButton,
              totalItems === 0 && styles.orderButtonDisabled,
            ]}
            activeOpacity={0.85}
            onPress={sendWhatsAppOrder}
          >
            <Text style={styles.orderButtonText}>שליחת הזמנה ב־WhatsApp</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.footer}>CRAFTED IN ISRAEL · INSPIRED BY ARGENTINA</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F6F0E4' },
  page: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 44 },
  hero: {
    alignItems: 'center',
    paddingVertical: 27,
    paddingHorizontal: 20,
    backgroundColor: '#FFFDF8',
    borderRadius: 26,
    borderWidth: 1,
    borderColor: '#E4D4B4',
  },
  monogram: {
    width: 84,
    height: 84,
    borderRadius: 42,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EEE2CB',
    borderWidth: 1,
    borderColor: '#B8985D',
    marginBottom: 13,
  },
  monogramText: {
    color: '#493126',
    fontSize: 31,
    fontWeight: '700',
    fontStyle: 'italic',
  },
  brand: {
    color: '#352720',
    fontSize: 30,
    fontWeight: '900',
    letterSpacing: 3.6,
  },
  subtitle: {
    marginTop: 8,
    color: '#806B4E',
    fontSize: 15,
    fontWeight: '700',
    textAlign: 'center',
    writingDirection: 'rtl',
  },
  goldLine: {
    width: 56,
    height: 2,
    backgroundColor: '#B8985D',
    marginVertical: 16,
  },
  intro: {
    color: '#594C41',
    fontSize: 15,
    lineHeight: 23,
    textAlign: 'center',
    writingDirection: 'rtl',
  },
  sectionHeader: {
    marginTop: 28,
    marginBottom: 14,
    alignItems: 'flex-end',
  },
  sectionTitle: {
    color: '#352720',
    fontSize: 23,
    fontWeight: '900',
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  sectionCaption: {
    color: '#867563',
    fontSize: 14,
    marginTop: 4,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  packRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  packCard: {
    width: '31.8%',
    minHeight: 92,
    justifyContent: 'center',
    padding: 10,
    borderRadius: 17,
    backgroundColor: '#FFFDF9',
    borderWidth: 1,
    borderColor: '#DDD0BB',
  },
  packTitle: {
    color: '#3B2B23',
    fontWeight: '900',
    fontSize: 16,
    textAlign: 'center',
    writingDirection: 'rtl',
  },
  packSubtitle: {
    color: '#806F60',
    fontSize: 11,
    lineHeight: 16,
    marginTop: 6,
    textAlign: 'center',
    writingDirection: 'rtl',
  },
  notice: {
    marginTop: 12,
    paddingVertical: 11,
    paddingHorizontal: 13,
    borderRadius: 14,
    backgroundColor: '#EFE5D4',
  },
  noticeText: {
    color: '#665649',
    fontSize: 12,
    lineHeight: 18,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  card: {
    width: '48.3%',
    minHeight: 255,
    overflow: 'hidden',
    backgroundColor: '#FFFDF9',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E6DCCB',
    marginBottom: 14,
    paddingHorizontal: 13,
    paddingBottom: 13,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  flavorStripe: { height: 10, marginHorizontal: -13, marginBottom: 14 },
  flavorSpanish: {
    color: '#A1855A',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
    textAlign: 'right',
  },
  flavorName: {
    marginTop: 5,
    color: '#332721',
    fontSize: 17,
    fontWeight: '900',
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  description: {
    flex: 1,
    marginTop: 8,
    color: '#6C6056',
    fontSize: 13,
    lineHeight: 19,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  cardBottom: { marginTop: 13 },
  price: {
    color: '#493126',
    fontSize: 19,
    fontWeight: '900',
    marginBottom: 9,
    textAlign: 'right',
  },
  addButton: {
    minHeight: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#493126',
  },
  addButtonText: { color: '#FFF9ED', fontSize: 14, fontWeight: '800' },
  quantity: {
    minHeight: 40,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 12,
    backgroundColor: '#F1E8D8',
    paddingHorizontal: 5,
  },
  quantityButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 9,
    backgroundColor: '#493126',
  },
  quantityButtonText: { color: '#FFFFFF', fontSize: 20, fontWeight: '800' },
  quantityText: { color: '#352720', fontSize: 16, fontWeight: '900' },
  cart: {
    marginTop: 15,
    padding: 19,
    backgroundColor: '#352720',
    borderRadius: 24,
  },
  cartTop: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  cartDetails: { alignItems: 'flex-end' },
  cartTitle: {
    color: '#FFF7E7',
    fontSize: 21,
    fontWeight: '900',
    writingDirection: 'rtl',
  },
  cartSummary: {
    color: '#D5BE95',
    fontSize: 14,
    fontWeight: '700',
    marginTop: 4,
    writingDirection: 'rtl',
  },
  clearButton: {
    paddingVertical: 8,
    paddingHorizontal: 11,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#736052',
  },
  clearText: { color: '#E9D8BD', fontWeight: '700', fontSize: 12 },
  orderButton: {
    minHeight: 54,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    backgroundColor: '#C7A56B',
    paddingHorizontal: 14,
  },
  orderButtonDisabled: { opacity: 0.52 },
  orderButtonText: {
    color: '#2F241E',
    fontSize: 16,
    fontWeight: '900',
    textAlign: 'center',
    writingDirection: 'rtl',
  },
  footer: {
    marginTop: 27,
    color: '#9B8972',
    fontSize: 10,
    letterSpacing: 1.1,
    textAlign: 'center',
  },
});
