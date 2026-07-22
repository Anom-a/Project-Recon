import { useEffect, useRef, useState } from 'react';
import {
  ArrowLeft, CheckCircle2, Clock, Building2, XCircle, X, AlertCircle,
  Upload, Loader2, Mail,
} from 'lucide-react';
import { getPendingOrder, verifyPendingOrderEmail } from '../api/checkoutApi';
import { submitPaymentEvidence } from '@/domains/store/payments/api/paymentApi';
import { isApiError } from '@/shared/api/http';
import type { PendingOrder, StorePaymentMethod } from '@/domains/store/model/types';
import { formatMoney } from '@/domains/store/utils/formatMoney';
import { cn } from '@/shared/utils/cn';
import { Button } from '@/shared/ui/Button';
import { formatApiError } from '@/shared/utils/formatApiError';

const PAYMENT_METHODS: { value: StorePaymentMethod; label: string }[] = [
  { value: 'BANK_TRANSFER', label: 'Bank transfer' },
  { value: 'MOBILE_MONEY', label: 'Mobile money' },
  { value: 'CASH', label: 'Cash (pay at branch)' },
  { value: 'CHEQUE', label: 'Cheque' },
];

interface Props {
  orderId: string;
  onBack: () => void;
}

export default function PendingOrderView({ orderId, onBack }: Props) {
  const [order, setOrder] = useState<PendingOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [evMethod, setEvMethod] = useState<StorePaymentMethod>('BANK_TRANSFER');
  const [evBank, setEvBank] = useState('');
  const [evRef, setEvRef] = useState('');
  const [evFile, setEvFile] = useState<File | null>(null);
  const [evSubmitting, setEvSubmitting] = useState(false);
  const [evSuccess, setEvSuccess] = useState(false);
  const [evError, setEvError] = useState<string | null>(null);
  const [otp, setOtp] = useState('');
  const [otpSubmitting, setOtpSubmitting] = useState(false);
  const [otpError, setOtpError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getPendingOrder(orderId);
        setOrder(data);
      } catch (e: unknown) {
        setError(formatApiError(e));
      } finally {
        setLoading(false);
      }
    })();
  }, [orderId]);

  useEffect(() => {
    if (evMethod === 'CASH') {
      setEvFile(null);
      setEvRef('');
      setEvBank('');
      if (fileRef.current) fileRef.current.value = '';
    }
  }, [evMethod]);

  const needsEmailVerify = Boolean(order?.guest_email && !order.email_verified);

  const handleVerifyEmail = async () => {
    if (!order || otp.trim().length !== 6) {
      setOtpError('Enter the 6-digit code from your email.');
      return;
    }
    setOtpSubmitting(true);
    setOtpError(null);
    try {
      await verifyPendingOrderEmail(order.id, otp.trim());
      const fullOrder = await getPendingOrder(orderId);
      setOrder(fullOrder);
    } catch (e: unknown) {
      if (isApiError(e) && e.status === 400 && e.message.toLowerCase().includes('already verified')) {
        const fullOrder = await getPendingOrder(orderId);
        setOrder({ ...fullOrder, email_verified: true });
      } else {
        setOtpError(formatApiError(e));
      }
    } finally {
      setOtpSubmitting(false);
    }
  };

  const handleSubmitEvidence = async () => {
    if (!order?.id) return;
    if (needsEmailVerify) {
      setEvError('Verify your email before submitting payment evidence.');
      return;
    }
    if (evMethod !== 'CASH' && !evRef.trim()) {
      setEvError('Transaction reference is required for this payment method.');
      return;
    }
    setEvSubmitting(true);
    setEvError(null);
    try {
      await submitPaymentEvidence(order.id, {
        amount: order.total,
        payment_method: evMethod,
        transaction_reference: evRef.trim() || undefined,
        bank_name: evBank.trim() || undefined,
        attachment: evFile || undefined,
      });
      setEvSuccess(true);
    } catch (e: unknown) {
      setEvError(formatApiError(e));
    } finally {
      setEvSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-lg mx-auto px-4 py-12" aria-busy="true" aria-label="Loading pending order">
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-16 rounded-xl bg-brand-surface animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="max-w-lg mx-auto px-4 py-12 text-center">
        <div className="w-14 h-14 rounded-xl bg-red-50 border border-red-200 flex items-center justify-center mx-auto mb-4">
          <XCircle className="w-7 h-7 text-red-400" />
        </div>
        <h3 className="text-lg font-bold text-brand-ink mb-1">Pending order not found</h3>
        <p className="text-sm text-brand-muted mb-6">{error || 'This pending order could not be found or has expired.'}</p>
        <Button onClick={onBack} variant="secondary">Back to store</Button>
      </div>
    );
  }

  const items = order.items ?? [];
  const isExpired = order.expires_at && new Date(order.expires_at) < new Date();

  return (
    <div className="max-w-lg mx-auto px-4 py-8">
      <button
        type="button"
        onClick={onBack}
        className="flex items-center gap-1.5 text-sm text-brand-muted hover:text-brand-ink transition-colors mb-6 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue/30 rounded-lg"
      >
        <ArrowLeft className="w-4 h-4" /> Back to store
      </button>

      <div className={cn(
        'rounded-2xl border p-6 mb-6',
        isExpired ? 'bg-red-50/50 border-red-200' : 'bg-amber-50/50 border-amber-200',
      )}>
        <div className="flex items-center gap-3 mb-4">
          <div className={cn(
            'w-10 h-10 rounded-xl border flex items-center justify-center',
            isExpired ? 'bg-red-50 border-red-200' : 'bg-amber-50 border-amber-200',
          )}>
            {isExpired ? <XCircle className="w-5 h-5 text-red-500" /> : <Clock className="w-5 h-5 text-amber-600" />}
          </div>
          <div>
            <h2 className="font-bold text-brand-ink">Pending order</h2>
            <p className="text-xs text-brand-muted">Reference: <span className="font-mono font-semibold">{order.id?.slice(0, 8) ?? '---'}</span></p>
          </div>
        </div>

        {isExpired && (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700 mb-4">
            <AlertCircle className="w-4 h-4 shrink-0" />
            This order has expired. Please start a new checkout.
          </div>
        )}

        {!isExpired && order.expires_at && (
          <p className="text-xs text-amber-700 mb-4 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" />
            Expires {new Date(order.expires_at).toLocaleString()}
          </p>
        )}

        <div className="space-y-3 text-sm">
          <div className="flex justify-between gap-3">
            <span className="text-brand-muted">Branch</span>
            <span className="font-semibold text-brand-ink flex items-center gap-1.5 text-right">
              <Building2 className="w-3.5 h-3.5 text-brand-muted shrink-0" /> {order.branch_name}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-brand-muted">Items</span>
            <span className="font-semibold text-brand-ink">{items.length}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-brand-muted">Subtotal</span>
            <span className="font-semibold text-brand-ink">{formatMoney(order.subtotal)}</span>
          </div>
          <div className="flex justify-between pt-2 border-t border-brand-border/50">
            <span className="font-semibold text-brand-ink">Total</span>
            <span className="font-bold text-brand-blue">{formatMoney(order.total)}</span>
          </div>
          {order.payment_reference && (
            <div className="pt-2 border-t border-brand-border/50">
              <p className="text-[11px] text-brand-muted uppercase tracking-wider mb-1">Payment reference</p>
              <p className="font-mono text-xs font-semibold break-all">{order.payment_reference}</p>
            </div>
          )}
          {order.guest_name && (
            <div className="pt-2 border-t border-brand-border/50">
              <p className="text-[11px] text-brand-muted uppercase tracking-wider mb-1">Customer</p>
              <p className="font-semibold text-brand-ink">{order.guest_name}</p>
              {order.guest_email && <p className="text-xs text-brand-muted">{order.guest_email}</p>}
              {order.guest_phone && <p className="text-xs text-brand-muted">{order.guest_phone}</p>}
            </div>
          )}
        </div>
      </div>

      <h3 className="font-bold text-sm text-brand-ink mb-3">Items</h3>
      <div className="space-y-2 mb-6">
        {items.map(item => (
          <div key={item.id} className="flex items-center justify-between p-3 rounded-xl bg-white border border-brand-border/60">
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-brand-ink truncate">{item.product_name}</p>
              <p className="text-xs text-brand-muted">{item.quantity} × {formatMoney(item.unit_price)}</p>
            </div>
            <span className="text-sm font-bold text-brand-ink ml-3">{formatMoney(item.subtotal)}</span>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-2">
        {!isExpired && needsEmailVerify && !evSuccess && (
          <div className="border-t border-brand-border/50 pt-4 mb-2">
            <h4 className="font-bold text-sm text-brand-ink mb-2 flex items-center gap-1.5">
              <Mail className="w-4 h-4" /> Verify your email
            </h4>
            <p className="text-xs text-brand-muted mb-3">
              We sent a 6-digit code to <span className="font-semibold text-brand-ink">{order.guest_email}</span>.
              Verify before submitting payment evidence.
            </p>
            <div className="flex gap-2 mb-2">
              <label htmlFor="pending-otp" className="sr-only">Verification code</label>
              <input
                id="pending-otp"
                value={otp}
                onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                className="form-input flex-1 min-h-[44px] font-mono tracking-widest"
                placeholder="000000"
                inputMode="numeric"
                autoComplete="one-time-code"
                aria-invalid={Boolean(otpError)}
              />
              <Button
                type="button"
                onClick={handleVerifyEmail}
                disabled={otpSubmitting || otp.length !== 6}
                className="min-h-[44px]"
              >
                {otpSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Verify'}
              </Button>
            </div>
            {otpError && (
              <div className="mb-2 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700" role="alert">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" /> {otpError}
              </div>
            )}
          </div>
        )}
        {!isExpired && order.email_verified && !needsEmailVerify && !evSuccess && (
          <div className="border-t border-brand-border/50 pt-4 mb-2">
            <div className="flex items-center gap-3 p-4 rounded-xl bg-emerald-50 border border-emerald-200">
              <div className="w-9 h-9 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-emerald-800">Email verified</p>
                <p className="text-xs text-emerald-600">{order.guest_email ?? ''}</p>
              </div>
            </div>
          </div>
        )}
        {!isExpired && !evSuccess && !needsEmailVerify && (
          <div className="border-t border-brand-border/50 pt-4 mb-2">
            <h4 className="font-bold text-sm text-brand-ink mb-3 flex items-center gap-1.5">
              <Upload className="w-4 h-4" /> Submit payment evidence
            </h4>
            <div className="space-y-3 mb-4">
              <div>
                <p className="text-[11px] font-bold text-brand-muted uppercase tracking-wide mb-1">Payment method</p>
                <div className="flex flex-wrap gap-2" role="group" aria-label="Payment method">
                  {PAYMENT_METHODS.map(m => (
                    <button
                      key={m.value}
                      type="button"
                      onClick={() => setEvMethod(m.value)}
                      className={cn(
                        'px-4 py-2.5 sm:px-3 sm:py-1.5 text-xs font-semibold rounded-lg border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue/30',
                        evMethod === m.value ? 'bg-brand-blue text-white border-brand-blue' : 'bg-white text-brand-muted border-brand-border hover:border-brand-blue/30',
                      )}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>
              {evMethod !== 'CASH' && (
                <>
                  <div>
                    <label htmlFor="ev-bank" className="text-[11px] font-bold text-brand-muted uppercase tracking-wide mb-1 block">Bank / provider</label>
                    <input
                      id="ev-bank"
                      value={evBank}
                      onChange={e => setEvBank(e.target.value)}
                      className="form-input w-full min-h-[44px]"
                      placeholder="e.g. Commercial Bank of Ethiopia"
                    />
                  </div>
                  <div>
                    <label htmlFor="ev-ref" className="text-[11px] font-bold text-brand-muted uppercase tracking-wide mb-1 block">Transaction reference</label>
                    <input
                      id="ev-ref"
                      value={evRef}
                      onChange={e => setEvRef(e.target.value)}
                      className="form-input w-full min-h-[44px]"
                      placeholder="Transfer / receipt reference"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-brand-muted uppercase tracking-wide mb-1 block">Upload receipt <span className="font-medium normal-case tracking-normal">(optional)</span></label>
                    <div className="flex items-center gap-2">
                      <input
                        ref={fileRef}
                        type="file"
                        accept="image/*,.pdf"
                        onChange={e => setEvFile(e.target.files?.[0] || null)}
                        className="hidden"
                      />
                      <Button type="button" variant="secondary" size="sm" onClick={() => fileRef.current?.click()}>
                        <Upload className="w-3.5 h-3.5 mr-1.5 inline" />
                        {evFile ? evFile.name : 'Choose file'}
                      </Button>
                      {evFile && (
                        <button
                          type="button"
                          onClick={() => { setEvFile(null); if (fileRef.current) fileRef.current.value = ''; }}
                          className="p-1.5 text-brand-muted hover:text-red-500 transition-colors"
                          aria-label="Remove file"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
            {evError && (
              <div className="mb-3 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700" role="alert">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" /> {evError}
              </div>
            )}
            <Button
              onClick={handleSubmitEvidence}
              disabled={evSubmitting}
              className="w-full bg-emerald-600 hover:bg-emerald-700"
            >
              {evSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-1.5 inline" /> : <CheckCircle2 className="w-4 h-4 mr-1.5 inline" />}
              {evSubmitting ? 'Submitting…' : 'Submit evidence'}
            </Button>
          </div>
        )}
        {evSuccess && (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-sm text-emerald-700 mb-2" role="status">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            Payment evidence submitted. Staff will verify shortly.
          </div>
        )}
        {!isExpired && !evSuccess && (
          <p className="text-xs text-brand-muted text-center">
            <CheckCircle2 className="w-3.5 h-3.5 inline mr-1 text-emerald-500" />
            Or submit payment at the branch and contact staff with your reference.
          </p>
        )}
        <Button onClick={onBack} variant="secondary">Back to store</Button>
      </div>
    </div>
  );
}
