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
  formatItemsSummary,
} from './emailFormatter';

export type EmailDeliveryStatus = 'sent';

export interface InquirySubmitResult {
  referenceId: string;
  emailStatus: EmailDeliveryStatus;
  recipientEmail: string;
  mailtoHref: string;
}

const CLIENT_WEB3FORMS_KEY = (import.meta.env?.VITE_WEB3FORMS_ACCESS_KEY || '').trim();
const WEB3FORMS_ENDPOINT = 'https://api.web3forms.com/submit';

function makeClientReference(prefix: 'QT' | 'INQ' | 'RFQ'): string {
  const year = new Date().getFullYear();
  const suffix = Math.random().toString(16).slice(2, 8).toUpperCase().padEnd(6, '0');
  return `${prefix}-${year}-${suffix}`;
}

export async function relayViaWeb3Forms(
  params: {
    accessKey: string;
    subject: string;
    fromName: string;
    replyTo: string;
    message: string;
    fields?: Record<string, string>;
  },
  fetchFn: typeof fetch = fetch
): Promise<void> {
  const accessKey = params.accessKey.trim();
  if (!accessKey) {
    throw new Error(
      'Web3Forms access key is not configured (VITE_WEB3FORMS_ACCESS_KEY). Add it to your environment variables and redeploy.'
    );
  }

  let res: Response;
  try {
    res = await fetchFn(WEB3FORMS_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(
        buildWeb3FormsPayload({
          ...params,
          accessKey,
        })
      ),
    });
  } catch (err) {
    console.error('[TermiCore Web3Forms] Network error:', err);
    throw new Error('Unable to reach Web3Forms right now. Please check your connection and try again.');
  }

  const data = (await res.json().catch(() => ({}))) as {
    success?: boolean;
    message?: string;
  };

  if (!res.ok || data.success !== true) {
    const reason = data.message || `HTTP ${res.status}`;
    console.error('[TermiCore Web3Forms] Submission rejected:', res.status, reason);
    throw new Error(
      data.message
        ? `Unable to send inquiry (${data.message}).`
        : 'Unable to send inquiry right now. Please try again.'
    );
  }
}

export interface TransportOptions {
  accessKey?: string;
  fetchFn?: typeof fetch;
}

export async function submitQuoteInquiry(
  input: {
    name: string;
    company: string;
    email: string;
    phone: string;
    notes: string;
    items: EmailLineItem[];
  },
  options: TransportOptions = {}
): Promise<InquirySubmitResult> {
  const totalUnits = input.items.reduce((sum, item) => sum + item.quantity, 0);
  const createdAt = new Date().toISOString();
  const referenceId = makeClientReference('QT');
  const payload: QuoteEmailPayload = { ...input, referenceId, totalUnits, createdAt };
  const { subject, text } = buildQuoteEmailContent(payload);

  await relayViaWeb3Forms(
    {
      accessKey: options.accessKey ?? CLIENT_WEB3FORMS_KEY,
      subject,
      fromName: `${input.name} (${input.company})`,
      replyTo: input.email,
      message: text,
      fields: {
        Reference_ID: referenceId,
        Company: input.company,
        Phone: input.phone || 'Not provided',
        Total_Units: `${totalUnits} pcs`,
        Queued_Items: formatItemsSummary(input.items),
      },
    },
    options.fetchFn
  );

  return {
    referenceId,
    emailStatus: 'sent',
    recipientEmail: OWNER_INBOX_EMAIL,
    mailtoHref: buildMailtoHref(OWNER_INBOX_EMAIL, subject, text),
  };
}

export async function submitContactInquiry(
  input: {
    name: string;
    email: string;
    phone: string;
    subject: string;
    message: string;
  },
  options: TransportOptions = {}
): Promise<InquirySubmitResult> {
  const createdAt = new Date().toISOString();
  const referenceId = makeClientReference('INQ');
  const payload: ContactEmailPayload = { ...input, referenceId, createdAt };
  const { subject, text } = buildContactEmailContent(payload);

  await relayViaWeb3Forms(
    {
      accessKey: options.accessKey ?? CLIENT_WEB3FORMS_KEY,
      subject,
      fromName: input.name,
      replyTo: input.email,
      message: text,
      fields: {
        Reference_ID: referenceId,
        Phone: input.phone || 'Not provided',
        Topic: input.subject,
      },
    },
    options.fetchFn
  );

  return {
    referenceId,
    emailStatus: 'sent',
    recipientEmail: OWNER_INBOX_EMAIL,
    mailtoHref: buildMailtoHref(OWNER_INBOX_EMAIL, subject, text),
  };
}

export async function submitQuickRfqInquiry(
  input: {
    company: string;
    email: string;
    items: EmailLineItem[];
  },
  options: TransportOptions = {}
): Promise<InquirySubmitResult> {
  const totalUnits = input.items.reduce((sum, item) => sum + item.quantity, 0);
  const createdAt = new Date().toISOString();
  const referenceId = makeClientReference('RFQ');
  const payload: RfqEmailPayload = { ...input, referenceId, totalUnits, createdAt };
  const { subject, text } = buildRfqEmailContent(payload);

  await relayViaWeb3Forms(
    {
      accessKey: options.accessKey ?? CLIENT_WEB3FORMS_KEY,
      subject,
      fromName: input.company,
      replyTo: input.email,
      message: text,
      fields: {
        Reference_ID: referenceId,
        Company: input.company,
        Total_Units: `${totalUnits} pcs`,
        Queued_Items: formatItemsSummary(input.items),
      },
    },
    options.fetchFn
  );

  return {
    referenceId,
    emailStatus: 'sent',
    recipientEmail: OWNER_INBOX_EMAIL,
    mailtoHref: buildMailtoHref(OWNER_INBOX_EMAIL, subject, text),
  };
}
