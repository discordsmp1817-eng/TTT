import test from 'node:test';
import assert from 'node:assert/strict';
import {
  submitContactInquiry,
  submitQuickRfqInquiry,
  submitQuoteInquiry,
} from './inquiryTransport';

test('submitContactInquiry sends exclusively to Web3Forms with formatted fields', async () => {
  const calls: Array<{ url: string; body: Record<string, string> }> = [];
  const fakeFetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
    calls.push({
      url: String(input),
      body: JSON.parse(String(init?.body || '{}')) as Record<string, string>,
    });
    return new Response(JSON.stringify({ success: true, message: 'Email sent' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }) as typeof fetch;

  const result = await submitContactInquiry(
    {
      name: 'Rajesh Kulkarni',
      email: 'rajesh@switchgear.example',
      phone: '+91 98765 43210',
      subject: 'Technical Specification / CAD Request',
      message: 'Need 4mm² DIN rail terminal block pricing.',
    },
    { accessKey: 'test-key-123', fetchFn: fakeFetch }
  );

  assert.equal(calls.length, 1);
  assert.equal(calls[0].url, 'https://api.web3forms.com/submit');
  assert.equal(calls[0].body.access_key, 'test-key-123');
  assert.equal(calls[0].body.name, 'Rajesh Kulkarni');
  assert.equal(calls[0].body.email, 'rajesh@switchgear.example');
  assert.equal(calls[0].body.replyto, 'rajesh@switchgear.example');
  assert.equal(calls[0].body.Inquiry_Topic, 'Technical Specification / CAD Request');
  assert.match(result.referenceId, /^INQ-\d{4}-/);
  assert.equal(result.emailStatus, 'sent');
});

test('submitQuoteInquiry sends exclusively to Web3Forms including queued items', async () => {
  const calls: Array<{ url: string; body: Record<string, string> }> = [];
  const fakeFetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
    calls.push({
      url: String(input),
      body: JSON.parse(String(init?.body || '{}')) as Record<string, string>,
    });
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }) as typeof fetch;

  const result = await submitQuoteInquiry(
    {
      name: 'Meera Nair',
      company: 'Delta Panels Pvt Ltd',
      email: 'meera@deltapanels.example',
      phone: '+91 98220 11223',
      notes: 'Estimated quantity: 500 pcs | Destination: India',
      items: [
        {
          id: 'TSC 4',
          model: 'TSC 4',
          title: 'TSC 4 Feed-Through Block',
          category: 'Spring Cage Connection',
          specSummary: '0.2 - 4.0 mm² · 32 A · 800 V',
          quantity: 500,
        },
      ],
    },
    { accessKey: 'quote-key-456', fetchFn: fakeFetch }
  );

  assert.equal(calls.length, 1);
  assert.equal(calls[0].url, 'https://api.web3forms.com/submit');
  assert.equal(calls[0].body.access_key, 'quote-key-456');
  assert.equal(calls[0].body.Company, 'Delta Panels Pvt Ltd');
  assert.equal(calls[0].body.Total_Units, '500 pcs');
  assert.match(calls[0].body.Queued_Items, /TSC 4 — TSC 4 Feed-Through Block/);
  assert.match(result.referenceId, /^QT-\d{4}-/);
  assert.equal(result.emailStatus, 'sent');
});

test('submitQuickRfqInquiry sends exclusively to Web3Forms', async () => {
  const calls: Array<{ url: string; body: Record<string, string> }> = [];
  const fakeFetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
    calls.push({
      url: String(input),
      body: JSON.parse(String(init?.body || '{}')) as Record<string, string>,
    });
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }) as typeof fetch;

  const result = await submitQuickRfqInquiry(
    {
      company: 'Apex Automation',
      email: 'rfq@apex.example',
      items: [
        {
          id: 'TBC 50',
          model: 'TBC 50',
          title: 'TBC 50 Stud Terminal Block',
          category: 'Bolt Connection',
          specSummary: '50 mm² · 150 A',
          quantity: 100,
        },
      ],
    },
    { accessKey: 'rfq-key-789', fetchFn: fakeFetch }
  );

  assert.equal(calls.length, 1);
  assert.equal(calls[0].url, 'https://api.web3forms.com/submit');
  assert.match(result.referenceId, /^RFQ-\d{4}-/);
  assert.equal(result.emailStatus, 'sent');
});

test('inquiry submission throws clear error when Web3Forms access key is missing or rejected', async () => {
  await assert.rejects(
    () =>
      submitQuoteInquiry(
        {
          name: 'Aarav',
          company: 'Test Co',
          email: 'aarav@test.example',
          phone: '',
          notes: '',
          items: [],
        },
        { accessKey: '' }
      ),
    /VITE_WEB3FORMS_ACCESS_KEY/
  );

  const failingFetch = (async () =>
    new Response(JSON.stringify({ success: false, message: 'Invalid access key' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })) as typeof fetch;

  await assert.rejects(
    () =>
      submitContactInquiry(
        {
          name: 'Aarav',
          email: 'aarav@test.example',
          phone: '',
          subject: 'Sample Kit Request',
          message: 'Test',
        },
        { accessKey: 'bad-key', fetchFn: failingFetch }
      ),
    /Invalid access key/
  );
});
