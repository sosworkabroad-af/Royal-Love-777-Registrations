/**
 * Royal Love 777 — registration receiver
 * Saves each registration from the Royal Love 777 page into this Google
 * Sheet (one tab per group), emails a confirmation to the person who
 * registered, and emails a copy to the team.
 *
 * Paste this into Extensions → Apps Script of the Google Sheet, then deploy
 * as a Web app (Execute as: Me, Who has access: Anyone).
 */

const ORG_NAME   = 'Royal Love 777';
const TEAM_EMAIL = 'info@nekotechcenter.org';   // gets a copy of every registration
const WHATSAPP   = '+1 (940) 977-1707';

// Websites listed at the bottom of every confirmation email. Change a link here if it moves.
const WEBSITES = [
  'Royal Love 777: https://royallove777.world'
];

// One tab per group
const TABS = {
  'Royal Love family':     'Families',
  'Pilgrimage church':     'Churches',
  '3 January participant': '3 January'
};

const NEXT_STEPS = {
  'Royal Love family':
    '1. We welcome your family and confirm any book order.\n' +
    '2. You begin the 7-day, 7-times-a-day devotional together.\n' +
    '3. You are invited to the Love Audit and the Ambassador\'s Training Program.',
  'Pilgrimage church':
    '1. We review your church and confirm one of the 144 pilgrimage places.\n' +
    '2. We agree your delegation size and the pilgrimage you will attend.\n' +
    '3. Your coordinator receives the programme, travel guidance and the book order for the delegation.',
  '3 January participant':
    '1. We confirm your registration and the number of people with you.\n' +
    '2. You receive the programme and arrival details before the day.'
};

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    const d = JSON.parse(e.postData.contents);
    const fields = d.fields || {};

    // 1. Save to the right tab (adds new columns automatically when needed)
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const tabName = TABS[d.type] || 'Other';
    const sh = ss.getSheetByName(tabName) || ss.insertSheet(tabName);
    let headers = sh.getLastRow() > 0
      ? sh.getRange(1, 1, 1, sh.getLastColumn()).getValues()[0]
      : [];
    if (headers.length === 0) {
      headers = ['Received', 'Reference', 'Status'];
      sh.getRange(1, 1, 1, headers.length).setValues([headers]).setFontWeight('bold');
      sh.setFrozenRows(1);
    }
    Object.keys(fields).forEach(function (k) {
      if (headers.indexOf(k) === -1) {
        headers.push(k);
        sh.getRange(1, headers.length).setValue(k).setFontWeight('bold');
      }
    });
    const row = headers.map(function (h) {
      if (h === 'Received') return new Date();
      if (h === 'Reference') return d.ref || '';
      if (h === 'Status') return 'New';
      return fields[h] || '';
    });
    sh.appendRow(row);

    // 2. Confirmation email to the person who registered
    if (d.email) {
      const greeting = d.name ? 'Dear ' + d.name + ',' : 'Greetings,';
      const body =
        greeting + '\n\n' +
        'Thank you for registering with ' + ORG_NAME + '. We have received your registration.\n\n' +
        'Your reference number: ' + d.ref + '\n' +
        'Registering as: ' + d.type + '\n\n' +
        'What happens next\n' + (NEXT_STEPS[d.type] || 'Our team will contact you.') + '\n\n' +
        'Your details\n' +
        Object.keys(fields).map(function (k) { return k + ': ' + fields[k]; }).join('\n') + '\n\n' +
        'Book orders are confirmed with an invoice before any payment.\n' +
        'Questions? Reply to this email or message us on WhatsApp at ' + WHATSAPP + '.\n' +
        'Please quote your reference number ' + d.ref + '.\n\n' +
        '"Love one another as I have loved you." John 13:34\n\n' +
        ORG_NAME + ' · Heal Me, Heal My World\n' + WEBSITES.join('\n');
      MailApp.sendEmail({
        to: d.email,
        replyTo: TEAM_EMAIL,
        name: ORG_NAME,
        subject: ORG_NAME + ': registration ' + d.ref + ' received',
        body: body
      });
    }

    // 3. Copy to the team
    MailApp.sendEmail({
      to: TEAM_EMAIL,
      replyTo: d.email || TEAM_EMAIL,
      name: ORG_NAME + ' registrations',
      subject: 'New registration ' + d.ref + ' (' + d.type + ')',
      body: d.text || JSON.stringify(d, null, 2)
    });

    return ContentService.createTextOutput(JSON.stringify({ ok: true }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ ok: false, error: String(err) }))
      .setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock();
  }
}

/** Run this once from the editor to grant permissions and test the setup. */
function testSetup() {
  doPost({ postData: { contents: JSON.stringify({
    ref: 'RL777-TEST01', type: 'Pilgrimage church', email: TEAM_EMAIL, name: 'Test',
    fields: { 'Church name': 'Test Church', 'Country': 'Ghana', 'Pilgrimage': 'March', 'Email': TEAM_EMAIL },
    text: 'Test registration'
  }) } });
}
