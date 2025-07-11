const Imap = require('imap');
const { simpleParser } = require('mailparser');

// Gmail IMAP configuration
const imapConfig = {
    user: 'karan0907kumar@gmail.com',
    password: 'Karan@2004', // Replace with your Gmail App Password
    host: 'imap.gmail.com',
    port: 993,
    tls: true,
    tlsOptions: { rejectUnauthorized: false }
};

// Function to fetch the latest verification code from Gmail
async function getVerificationCode() {
    return new Promise((resolve, reject) => {
        try {
            const imap = new Imap(imapConfig);

            // Handle IMAP errors
            imap.once('error', (err) => {
                console.error('IMAP error:', err.message);
                reject(err);
            });

            // When IMAP connection is ready
            imap.once('ready', () => {
                console.log('IMAP connection established');

                // Open the INBOX
                imap.openBox('INBOX', true, (err, box) => {
                    if (err) {
                        console.error('Error opening INBOX:', err.message);
                        return reject(err);
                    }

                    // Search for unread emails from realme@account3.realme.com
                    imap.search(
                        [
                            'UNSEEN',
                            ['FROM', 'realme@account3.realme.com'],
                            ['SINCE', new Date(Date.now() - 5 * 60 * 1000).toISOString()] // Last 5 minutes
                        ],
                        (err, results) => {
                            if (err) {
                                console.error('Error searching emails:', err.message);
                                return reject(err);
                            }

                            if (!results || results.length === 0) {
                                console.error('No verification code email found');
                                imap.end();
                                return reject(new Error('No verification code email found'));
                            }

                            // Fetch the most recent email
                            const fetch = imap.fetch(results[0], { bodies: '', markSeen: true });
                            fetch.on('message', (msg) => {
                                msg.on('body', (stream) => {
                                    simpleParser(stream, async (err, parsed) => {
                                        if (err) {
                                            console.error('Error parsing email:', err.message);
                                            return reject(err);
                                        }

                                        // Extract the email body (text or HTML)
                                        const body = parsed.text || parsed.html || '';
                                        console.log('Email body:', body);

                                        // Extract 6-digit verification code
                                        const codeMatch = body.match(/The verification code is:\s*(\d{6})/);
                                        if (codeMatch) {
                                            console.log('Verification code found:', codeMatch[1]);
                                            resolve(codeMatch[1]);
                                        } else {
                                            console.error('No verification code found in email');
                                            reject(new Error('No verification code found in email'));
                                        }

                                        imap.end();
                                    });
                                });
                            });

                            fetch.once('error', (err) => {
                                console.error('Fetch error:', err.message);
                                reject(err);
                                imap.end();
                            });

                            fetch.once('end', () => {
                                console.log('Done fetching email');
                                imap.end();
                            });
                        }
                    );
                });
            });

            // Connect to IMAP server
            imap.connect();
        } catch (error) {
            console.error('Error in getVerificationCode:', error.message);
            reject(error);
        }
    });
}

module.exports = { getVerificationCode };