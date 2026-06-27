import { useCallback, useState } from 'react';
import { View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Button, Card, Chip, Separator, Spinner } from 'heroui-native';
import Feather from '@expo/vector-icons/Feather';
import RazorpayCheckout from 'react-native-razorpay';
import { AppText } from '../../components/app-text';
import { DarkHeaderCard } from '../../components/dark-header-card';
import { ScreenScrollView } from '../../components/screen-scroll-view';
import { SectionLabel } from '../../components/section-label';
import { mflColors } from '../../constants/colors';
import { AppRoutes } from '../../core/config/routes';
import { useCreateOrder, useVerifyPayment, usePayments } from '../../features/payments';
import type {
  PaymentOrder,
  Payment,
  PaymentStatus,
  RazorpayOptions,
  RazorpaySuccessResponse,
} from '../../features/payments';

// ─── Payment Status Chip ────────────────────────────────────────────────────

function StatusChip({ status }: { status: PaymentStatus }) {
  const colorMap: Record<PaymentStatus, { bg: string; text: string }> = {
    completed: { bg: mflColors.brandLight, text: mflColors.brand },
    pending: { bg: mflColors.amberLight, text: mflColors.amber },
    failed: { bg: mflColors.dangerLight, text: mflColors.danger },
    refunded: { bg: mflColors.blueLight, text: mflColors.blue },
  };
  const colors = colorMap[status] || { bg: mflColors.amberLight, text: mflColors.amber };

  return (
    <Chip size="sm" variant="soft" style={{ backgroundColor: colors.bg }}>
      <Chip.Label style={{ color: colors.text }}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Chip.Label>
    </Chip>
  );
}

// ─── Payment History Card ───────────────────────────────────────────────────

function PaymentHistoryCard({ payment }: { payment: Payment }) {
  const formattedDate = new Date(payment.createdAt).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  const purposeLabels: Record<string, string> = {
    league_creation: 'League Creation',
    subscription: 'Subscription',
    other: 'Other',
  };

  return (
    <Card className="p-4 mb-3">
      <View className="flex-row justify-between items-start mb-2">
        <View className="flex-1 mr-3">
          <AppText className="text-sm font-semibold text-foreground">
            {payment.leagueName ?? purposeLabels[payment.purpose] ?? payment.description ?? 'Payment'}
          </AppText>
          <AppText className="text-xs text-muted mt-0.5">{formattedDate}</AppText>
        </View>
        <StatusChip status={payment.status} />
      </View>
      <View className="flex-row justify-between items-center mt-1">
        <AppText className="text-base font-bold text-foreground">
          {payment.currency === 'INR' ? '\u20B9' : payment.currency}{' '}
          {payment.totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
        </AppText>
        {payment.razorpayPaymentId && (
          <AppText className="text-[10px] text-muted font-mono">
            {payment.razorpayPaymentId.slice(0, 12)}...
          </AppText>
        )}
      </View>
    </Card>
  );
}

// ─── Screen ─────────────────────────────────────────────────────────────────

type CheckoutState = 'idle' | 'creating-order' | 'paying' | 'verifying' | 'success' | 'error';

interface LeagueDataParams {
  tier_id?: string;
  league_name?: string;
  start_date?: string;
  end_date?: string;
  max_participants?: number;
  num_teams?: number;
  league_id?: string;
  amount?: number;
  rest_days?: number;
  rr_config?: Record<string, unknown>;
  is_public?: boolean;
  is_exclusive?: boolean;
}

export default function PaymentCheckoutScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    leagueData?: string;
  }>();

  const [state, setState] = useState<CheckoutState>('idle');
  const [orderData, setOrderData] = useState<PaymentOrder | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');

  const createOrderMutation = useCreateOrder();
  const verifyPaymentMutation = useVerifyPayment();
  const { data: paymentHistory, isLoading: historyLoading, refetch: refetchHistory } = usePayments();

  // Parse league data from route params
  let leagueData: LeagueDataParams = {};

  try {
    if (params.leagueData) {
      leagueData = JSON.parse(params.leagueData);
    }
  } catch {
    // Invalid JSON, use empty object
  }

  const handleCreateOrder = useCallback(async () => {
    setState('creating-order');
    setErrorMessage('');

    try {
      const order = await createOrderMutation.mutateAsync({
        leagueData: {
          tier_id: leagueData.tier_id ?? '',
          league_name: leagueData.league_name ?? '',
          start_date: leagueData.start_date ?? '',
          end_date: leagueData.end_date ?? '',
          max_participants: leagueData.max_participants,
          num_teams: leagueData.num_teams,
          rest_days: leagueData.rest_days ?? 0,
          rr_config: leagueData.rr_config ?? {},
          is_public: leagueData.is_public ?? false,
          is_exclusive: leagueData.is_exclusive ?? false,
        },
      });

      setOrderData(order);
      setState('paying');

      // Validate Razorpay key before opening checkout
      if (!order.keyId) {
        setState('error');
        setErrorMessage('Payment configuration error. Please contact support.');
        return;
      }

      // Open Razorpay checkout
      const options: RazorpayOptions = {
        description: 'MFL League Payment',
        image: 'https://myfitnessleague.com/logo.png',
        currency: order.currency,
        key: order.keyId,
        amount: order.amount,
        name: 'My Fitness League',
        order_id: order.orderId,
        theme: { color: mflColors.brand },
      };

      const paymentData = await RazorpayCheckout.open(options) as RazorpaySuccessResponse;

      // Verify payment — field names must match web API: orderId, paymentId, signature
      setState('verifying');
      await verifyPaymentMutation.mutateAsync({
        orderId: paymentData.razorpay_order_id,
        paymentId: paymentData.razorpay_payment_id,
        signature: paymentData.razorpay_signature,
      });

      setState('success');
      await refetchHistory();
    } catch (err: unknown) {
      setState('error');
      const sdkErr =
        typeof err === 'object' && err !== null ? (err as Record<string, unknown>) : {};
      const errObj =
        typeof sdkErr.error === 'object' && sdkErr.error !== null
          ? (sdkErr.error as Record<string, unknown>)
          : {};
      const message =
        (errObj.description as string | undefined) ??
        (sdkErr.description as string | undefined) ??
        (sdkErr.message as string | undefined) ??
        'Payment failed. Please try again.';
      setErrorMessage(message);
    }
  }, [
    createOrderMutation,
    verifyPaymentMutation,
    leagueData,
    refetchHistory,
  ]);

  const handleRetry = useCallback(() => {
    setState('idle');
    setErrorMessage('');
    setOrderData(null);
  }, []);

  const handleGoToDashboard = useCallback(() => {
    router.replace(AppRoutes.dashboard);
  }, [router]);

  const displayAmount = orderData
    ? (orderData.amount / 100).toFixed(2)
    : leagueData.amount
      ? (leagueData.amount / 100).toFixed(2)
      : '0.00';

  const displayCurrency = orderData?.currency ?? 'INR';
  const currencySymbol = displayCurrency === 'INR' ? '\u20B9' : displayCurrency;

  // ─── Success State ──────────────────────────────────────────────────────────
  if (state === 'success') {
    return (
      <ScreenScrollView>
        <View className="py-10 items-center gap-6">
          <View
            className="w-20 h-20 rounded-full items-center justify-center"
            style={{ backgroundColor: mflColors.brandLight }}
          >
            <Feather name="check" size={40} color={mflColors.brand} />
          </View>
          <View className="items-center gap-2">
            <AppText className="text-2xl font-bold text-foreground">
              Payment Successful
            </AppText>
            <AppText className="text-sm text-muted text-center">
              Your payment has been verified and the league is ready.
            </AppText>
          </View>
          <Button
            size="lg"
            style={{ backgroundColor: mflColors.brand }}
            onPress={handleGoToDashboard}
            className="w-full mt-4"
          >
            <Button.Label>Go to Dashboard</Button.Label>
          </Button>
        </View>
      </ScreenScrollView>
    );
  }

  // ─── Error State ────────────────────────────────────────────────────────────
  if (state === 'error') {
    return (
      <ScreenScrollView>
        <View className="py-10 items-center gap-6">
          <View
            className="w-20 h-20 rounded-full items-center justify-center"
            style={{ backgroundColor: mflColors.dangerLight }}
          >
            <Feather name="x" size={40} color={mflColors.danger} />
          </View>
          <View className="items-center gap-2">
            <AppText className="text-2xl font-bold text-foreground">
              Payment Failed
            </AppText>
            <AppText className="text-sm text-muted text-center px-4">
              {errorMessage}
            </AppText>
          </View>
          <Button
            size="lg"
            variant="secondary"
            onPress={handleRetry}
            className="w-full mt-4"
          >
            <Button.Label>Try Again</Button.Label>
          </Button>
        </View>

        {/* Still show payment history */}
        <PaymentHistorySection
          payments={paymentHistory ?? []}
          isLoading={historyLoading}
        />
      </ScreenScrollView>
    );
  }

  // ─── Processing State ───────────────────────────────────────────────────────
  if (state === 'creating-order' || state === 'verifying') {
    return (
      <ScreenScrollView>
        <View className="py-20 items-center gap-4">
          <Spinner size="lg" />
          <AppText className="text-sm text-muted">
            {state === 'creating-order'
              ? 'Creating payment order...'
              : 'Verifying payment...'}
          </AppText>
        </View>
      </ScreenScrollView>
    );
  }

  // ─── Main Checkout View ─────────────────────────────────────────────────────
  return (
    <ScreenScrollView onRefresh={() => refetchHistory()}>
      <View className="py-4 gap-5">
        <DarkHeaderCard
          title="Payment"
          subtitle={leagueData.league_name ?? 'League Payment'}
        />

        {/* Order Summary */}
        <Card className="p-5">
          <AppText className="text-sm font-semibold text-foreground mb-4">
            Order Summary
          </AppText>

          {leagueData.league_name && (
            <View className="flex-row justify-between mb-2">
              <AppText className="text-sm text-muted">League</AppText>
              <AppText className="text-sm font-medium text-foreground">
                {leagueData.league_name}
              </AppText>
            </View>
          )}

          {leagueData.start_date && (
            <View className="flex-row justify-between mb-2">
              <AppText className="text-sm text-muted">Start Date</AppText>
              <AppText className="text-sm text-foreground">
                {new Date(leagueData.start_date).toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                })}
              </AppText>
            </View>
          )}

          {leagueData.end_date && (
            <View className="flex-row justify-between mb-2">
              <AppText className="text-sm text-muted">End Date</AppText>
              <AppText className="text-sm text-foreground">
                {new Date(leagueData.end_date).toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                })}
              </AppText>
            </View>
          )}

          {leagueData.num_teams != null && (
            <View className="flex-row justify-between mb-2">
              <AppText className="text-sm text-muted">Teams</AppText>
              <AppText className="text-sm text-foreground">
                {leagueData.num_teams}
              </AppText>
            </View>
          )}

          <Separator className="my-3" />

          <View className="flex-row justify-between">
            <AppText className="text-base font-bold text-foreground">Total</AppText>
            <AppText className="text-base font-bold" style={{ color: mflColors.brand }}>
              {currencySymbol} {displayAmount}
            </AppText>
          </View>
        </Card>

        {/* Pay Button */}
        <Button
          size="lg"
          style={{ backgroundColor: mflColors.brand }}
          onPress={handleCreateOrder}
          isDisabled={state === 'paying'}
          className="w-full"
        >
          <Button.Label>
            {state === 'paying' ? 'Processing...' : `Pay ${currencySymbol} ${displayAmount} with Razorpay`}
          </Button.Label>
        </Button>

        <View className="flex-row items-center justify-center gap-1 mt-1">
          <Feather name="lock" size={12} color={mflColors.textMuted} />
          <AppText className="text-xs text-muted">
            Secured by Razorpay
          </AppText>
        </View>

        {/* Payment History */}
        <PaymentHistorySection
          payments={paymentHistory ?? []}
          isLoading={historyLoading}
        />
      </View>
    </ScreenScrollView>
  );
}

// ─── Payment History Section ────────────────────────────────────────────────

function PaymentHistorySection({
  payments,
  isLoading,
}: {
  payments: Payment[];
  isLoading: boolean;
}) {
  if (isLoading) {
    return (
      <View className="mt-6">
        <SectionLabel label="Payment History" />
        <View className="items-center py-8">
          <Spinner size="sm" />
        </View>
      </View>
    );
  }

  if (payments.length === 0) {
    return (
      <View className="mt-6">
        <SectionLabel label="Payment History" />
        <Card className="p-6 items-center">
          <Feather name="credit-card" size={32} color={mflColors.textMuted} />
          <AppText className="text-sm text-muted text-center mt-3">
            No payments yet. Payments will appear here when you create or join leagues that require payment.
          </AppText>
        </Card>
      </View>
    );
  }

  return (
    <View className="mt-6">
      <SectionLabel label="Payment History" style={{ marginBottom: 12 }} />
      {payments.map((payment) => (
        <PaymentHistoryCard key={payment.paymentId} payment={payment} />
      ))}
    </View>
  );
}
