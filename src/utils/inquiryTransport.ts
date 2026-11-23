import {
  ContactEmailPayload,
  EmailLineItem,
  OWNER_INBOX_EMAIL,
  QuoteEmailPayload,
  RfqEmailPayload,
  buildContactEmailContent,
  buildMailtoHref,
  buildQuoteEmailContent,
  buildRfqEmailContent,
  buildWeb3FormsPayload,
} from './emailFormatter';

export type EmailDeliveryStatus = 'sent' | 'activation_required' | 'queued_locally';

export interface InquirySubmitResult {
  referenceId: string;
  emailStatus: EmailDeliveryStatus;
  emailMessage?: string;
  recipientEmail: string;
  mailtoHref: string;
}

const CLIENT_WEB3FORMS_KEY =
  ((import.meta as { env?: Record<string, string | undefined> }).env?.VITE_WEB3FORMS_ACCESS_KEY || '').trim();

/**
 * On static hosts such as Hostinger or Vercel static deployments (with SPA fallback),
 * POST /api/* endpoints return either 404/405 HTML error pages or 200 text/html (index.html)
 * instead of JSON from Express. Treat any non-JSON or unreachable /api/* response as a
 * static hosting environment and relay via Web3Forms (when key set) or FormSubmit.
 */
export function shouldFallbackToStaticRelay(contentType: string | null | undefined): boolean {
  return !(contentType || '').toLowerCase().includes('application/json');
}

function makeClientReference(prefix: 'QT' | 'INQ' | 'RFQ'): string {
  const year = new Date().getFullYear();
  const suffix = Math.random().toString(16).slice(2, 8).toUpperCase().padEnd(6, '0');
  return `${prefix}-${year}-${suffix}`;
}

async function postJsonOrNull(url: string, body: unknown): Promise<Response | null> {
  try {
    return await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
  } catch {
    return null;
  }
}

async function relayViaWeb3Forms(params: {
  accessKey: string;
  subject: string;
  fromName: string;
  replyTo: string;
  message: string;
  fields?: Record<string, string>;
}): Promise<{ status: EmailDeliveryStatus }> {
  try {
    const res = await fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(buildWeb3FormsPayload(params)),
    });
    const data = (await res.json().catch(() => ({}))) as { success?: boolean };
    if (res.ok && data.success === true) {
      return { status: 'sent' };
    }
    return { status: 'queued_locally' };
  } catch {
    return { status: 'queued_locally' };
  }
}

async function relayViaFormSubmit(
  formSubmitPayload: Record<string, string>,
  recipientEmail: string
): Promise<{ status: EmailDeliveryStatus }> {
  try {
    const res = await fetch(
      `https://formsubmit.co/ajax/${encodeURIComponent(recipientEmail)}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(formSubmitPayload),
      }
    );
    const data = (await res.json().catch(() => ({}))) as {
      success?: boolean | string;
      message?: string;
    };

    const isSuccess = data.success === true || data.success === 'true';
    if (res.ok && isSuccess) {
      return { status: 'sent' };
    }

    const msg = String(data.message || '');
    if (msg.toLowerCase().includes('activat')) {
      return { status: 'activation_required' };
    }

    return { status: 'queued_locally' };
  } catch {
    return { status: 'queued_locally' };
  }
}

async function relayOnStaticHost(params: {
  subject: string;
  fromName: string;
  replyTo: string;
  message: string;
  fields?: Record<string, string>;
  formSubmitPayload: Record<string, string>;
  recipientEmail: string;
}): Promise<{ status: EmailDeliveryStatus }> {
  if (CLIENT_WEB3FORMS_KEY) {
    const w3f = await relayViaWeb3Forms({
      accessKey: CLIENT_WEB3FORMS_KEY,
      subject: params.subject,
      fromName: params.fromName,
      replyTo: params.replyTo,
      message: params.message,
      fields: params.fields,
    });
    if (w3f.status === 'sent') {
      return w3f;
    }
  }

  return relayViaFormSubmit(params.formSubmitPayload, params.recipientEmail);
}

export async function submitQuoteInquiry(input: {
  name: string;
  company: string;
  email: string;
  phone: string;
  notes: string;
  items: EmailLineItem[];
}): Promise<InquirySubmitResult> {
  const totalUnits = input.items.reduce((sum, item) => sum + item.quantity, 0);
  const createdAt = new Date().toISOString();

  const response = await postJsonOrNull('/api/quote', input);
  const contentType = response?.headers.get('content-type') || '';

  if (!response || shouldFallbackToStaticRelay(contentType)) {
    const referenceId = makeClientReference('QT');
    const payload: QuoteEmailPayload = { ...input, referenceId, totalUnits, createdAt };
    const { subject, text, formSubmitPayload } = buildQuoteEmailContent(payload);
    const relay = await relayOnStaticHost({
      subject,
      fromName: `${input.name} (${input.company})`,
      replyTo: input.email,
      message: text,
      fields: {
        Reference_ID: referenceId,
        Company: input.company,
        Phone: input.phone || 'Not provided',
        Total_Units: `${totalUnits} pcs`,
      },
      formSubmitPayload,
      recipientEmail: OWNER_INBOX_EMAIL,
    });
    return {
      referenceId,
      emailStatus: relay.status,
      recipientEmail: OWNER_INBOX_EMAIL,
      mailtoHref: buildMailtoHref(OWNER_INBOX_EMAIL, subject, text),
    };
  }

  const data = (await response.json().catch(() => ({}))) as {
    error?: string;
    referenceId?: string;
    emailStatus?: EmailDeliveryStatus;
    recipientEmail?: string;
  };

  if (!response.ok) {
    throw new Error(data.error || 'Unable to submit quote request right now. Please try again.');
  }

  const referenceId = data.referenceId || makeClientReference('QT');
  const recipientEmail = data.recipientEmail || OWNER_INBOX_EMAIL;
  const { subject, text } = buildQuoteEmailContent({
    ...input,
    referenceId,
    totalUnits,
    createdAt,
  });

  return {
    referenceId,
    emailStatus: data.emailStatus || 'queued_locally',
    recipientEmail,
    mailtoHref: buildMailtoHref(recipientEmail, subject, text),
  };
}

export async function submitContactInquiry(input: {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
}): Promise<InquirySubmitResult> {
  const createdAt = new Date().toISOString();

  const response = await postJsonOrNull('/api/contact', input);
  const contentType = response?.headers.get('content-type') || '';

  if (!response || shouldFallbackToStaticRelay(contentType)) {
    const referenceId = makeClientReference('INQ');
    const payload: ContactEmailPayload = { ...input, referenceId, createdAt };
    const { subject, text, formSubmitPayload } = buildContactEmailContent(payload);
    const relay = await relayOnStaticHost({
      subject,
      fromName: input.name,
      replyTo: input.email,
      message: text,
      fields: {
        Reference_ID: referenceId,
        Phone: input.phone || 'Not provided',
        Topic: input.subject,
      },
      formSubmitPayload,
      recipientEmail: OWNER_INBOX_EMAIL,
    });
    return {
      referenceId,
      emailStatus: relay.status,
      recipientEmail: OWNER_INBOX_EMAIL,
      mailtoHref: buildMailtoHref(OWNER_INBOX_EMAIL, subject, text),
    };
  }

  const data = (await response.json().catch(() => ({}))) as {
    error?: string;
    referenceId?: string;
    emailStatus?: EmailDeliveryStatus;
    recipientEmail?: string;
  };

  if (!response.ok) {
    throw new Error(data.error || 'Unable to send your message right now. Please try again.');
  }

  const referenceId = data.referenceId || makeClientReference('INQ');
  const recipientEmail = data.recipientEmail || OWNER_INBOX_EMAIL;
  const { subject, text } = buildContactEmailContent({
    ...input,
    referenceId,
    createdAt,
  });

  return {
    referenceId,
    emailStatus: data.emailStatus || 'queued_locally',
    recipientEmail,
    mailtoHref: buildMailtoHref(recipientEmail, subject, text),
  };
}

export async function submitQuickRfqInquiry(input: {
  company: string;
  email: string;
  items: EmailLineItem[];
}): Promise<InquirySubmitResult> {
  const totalUnits = input.items.reduce((sum, item) => sum + item.quantity, 0);
  const createdAt = new Date().toISOString();

  const response = await postJsonOrNull('/api/rfq', input);
  const contentType = response?.headers.get('content-type') || '';

  if (!response || shouldFallbackToStaticRelay(contentType)) {
    const referenceId = makeClientReference('RFQ');
    const payload: RfqEmailPayload = { ...input, referenceId, totalUnits, createdAt };
    const { subject, text, formSubmitPayload } = buildRfqEmailContent(payload);
    const relay = await relayOnStaticHost({
      subject,
      fromName: input.company,
      replyTo: input.email,
      message: text,
      fields: {
        Reference_ID: referenceId,
        Company: input.company,
        Total_Units: `${totalUnits} pcs`,
      },
      formSubmitPayload,
      recipientEmail: OWNER_INBOX_EMAIL,
    });
    return {
      referenceId,
      emailStatus: relay.status,
      recipientEmail: OWNER_INBOX_EMAIL,
      mailtoHref: buildMailtoHref(OWNER_INBOX_EMAIL, subject, text),
    };
  }

  const data = (await response.json().catch(() => ({}))) as {
    error?: string;
    referenceId?: string;
    emailStatus?: EmailDeliveryStatus;
    recipientEmail?: string;
  };

  if (!response.ok) {
    throw new Error(data.error || 'Unable to submit RFQ right now. Please try again.');
  }

  const referenceId = data.referenceId || makeClientReference('RFQ');
  const recipientEmail = data.recipientEmail || OWNER_INBOX_EMAIL;
  const { subject, text } = buildRfqEmailContent({
    ...input,
    referenceId,
    totalUnits,
    createdAt,
  });

  return {
    referenceId,
    emailStatus: data.emailStatus || 'queued_locally',
    recipientEmail,
    mailtoHref: buildMailtoHref(recipientEmail, subject, text),
  };
}
