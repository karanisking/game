
const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const Imap = require('imap');
const { simpleParser } = require('mailparser');

puppeteer.use(StealthPlugin());

// Configuration
const config = {
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1',
    loginUrl: 'https://www.realme.com/in/login?cb=https://event.realme.com/in/realme-P3Series-FireYourBoss-2025/index.html',
    loginCredentials: {
        email: 'karan876625kumar@gmail.com',
        password: 'Karan@2004' // Replace with Gmail App Password
    }
};

// Gmail IMAP configuration
const imapConfig = {
    user: 'karan876625kumar@gmail.com',
    password: 'qkaeknhvhutfreno', // Replace with your 16-character Gmail App Password
    host: 'imap.gmail.com',
    port: 993,
    tls: true,
    tlsOptions: { rejectUnauthorized: false }
};

// Custom delay function using setTimeout
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

// Simulate human-like mouse movements (for main page or iframe)
async function simulateHumanMouse(context, x, y) {
    const steps = 15;
    const currentPos = await context.evaluate(() => ({ x: window.scrollX + 50, y: window.scrollY + 50 }));
    const deltaX = (x - currentPos.x) / steps;
    const deltaY = (y - currentPos.y) / steps;

    // Check if context is a Page (has mouse) or Frame
    const isPage = !!context.mouse;
    
    if (isPage) {
        // For Page, use mouse API
        for (let i = 1; i <= steps; i++) {
            await context.mouse.move(
                currentPos.x + deltaX * i + (Math.random() * 15 - 7),
                currentPos.y + deltaY * i + (Math.random() * 15 - 7)
            );
            await delay(30 + Math.random() * 70);
        }
        await context.mouse.click(x, y);
    } else {
        // For Frame, use evaluate to simulate click
        for (let i = 1; i <= steps; i++) {
            await context.evaluate((xPos, yPos) => {
                const event = new MouseEvent('mousemove', {
                    clientX: xPos,
                    clientY: yPos,
                    bubbles: true
                });
                document.dispatchEvent(event);
            }, currentPos.x + deltaX * i + (Math.random() * 15 - 7), currentPos.y + deltaY * i + (Math.random() * 15 - 7));
            await delay(30 + Math.random() * 70);
        }
        await context.evaluate((xPos, yPos) => {
            const event = new MouseEvent('click', {
                clientX: xPos,
                clientY: yPos,
                bubbles: true
            });
            document.dispatchEvent(event);
        }, x, y);
    }
}

// Fetch the latest verification code from Gmail
async function getVerificationCode() {
    return new Promise((resolve, reject) => {
        const maxRetries = 5;
        let retryCount = 0;

        async function tryFetchCode() {
            try {
                const imap = new Imap(imapConfig);
                imap.once('error', (err) => {
                    console.error('IMAP error:', err.message);
                    reject(err);
                });

                imap.once('ready', () => {
                    console.log('IMAP connection established');
                    imap.openBox('INBOX', true, (err, box) => {
                        if (err) {
                            console.error('Error opening INBOX:', err.message);
                            return reject(err);
                        }

                        // Search for emails from realme@account3.realme.com within the last 15 minutes
                        const searchTime = new Date(Date.now() - 15 * 60 * 1000).toISOString();
                        console.log(`Searching for emails since: ${searchTime}`);
                        imap.search(
                            [
                                ['FROM', 'realme@account3.realme.com'],
                                ['SINCE', searchTime]
                            ],
                            (err, results) => {
                                if (err) {
                                    console.error('Error searching emails:', err.message);
                                    return reject(err);
                                }

                                console.log(`Found ${results?.length || 0} emails matching criteria`);
                                if (!results || results.length === 0) {
                                    console.error('No emails found from realme@account3.realme.com');
                                    if (retryCount < maxRetries) {
                                        retryCount++;
                                        console.log(`Retrying (${retryCount}/${maxRetries}) in 10 seconds...`);
                                        imap.end();
                                        setTimeout(tryFetchCode, 10000);
                                        return;
                                    }
                                    imap.end();
                                    return reject(new Error('No emails found from realme@account3.realme.com'));
                                }

                                // Fetch email headers to get dates and subjects
                                const fetchHeaders = imap.fetch(results, { bodies: ['HEADER.FIELDS (DATE SUBJECT)'], struct: true });
                                let emails = [];

                                fetchHeaders.on('message', (msg, seqno) => {
                                    const uid = msg.uid; // Explicitly capture UID
                                    msg.on('body', (stream, info) => {
                                        let buffer = '';
                                        stream.on('data', (chunk) => buffer += chunk.toString('utf8'));
                                        stream.on('end', () => {
                                            simpleParser(buffer, (err, parsed) => {
                                                if (err) {
                                                    console.error(`Error parsing headers for UID ${uid}:`, err.message);
                                                    return;
                                                }
                                                const emailDate = parsed.headers.get('date');
                                                const subject = parsed.headers.get('subject') || 'No subject';
                                                console.log(`Email UID: ${uid}, Subject: ${subject}, Date: ${emailDate}`);
                                                if (emailDate) {
                                                    const parsedDate = new Date(emailDate);
                                                    if (!isNaN(parsedDate)) {
                                                        emails.push({ uid: uid, date: parsedDate, subject: subject });
                                                    } else {
                                                        console.warn(`Invalid date for email UID ${uid}: ${emailDate}`);
                                                    }
                                                } else {
                                                    console.warn(`No date header for email UID ${uid}`);
                                                }
                                            });
                                        });
                                    });
                                });

                                fetchHeaders.once('error', (err) => {
                                    console.error('Fetch headers error:', err.message);
                                    reject(err);
                                    imap.end();
                                });

                                fetchHeaders.once('end', () => {
                                    if (emails.length === 0) {
                                        console.error('No emails with valid date headers found');
                                        if (retryCount < maxRetries) {
                                            retryCount++;
                                            console.log(`Retrying (${retryCount}/${maxRetries}) in 10 seconds...`);
                                            imap.end();
                                            setTimeout(tryFetchCode, 10000);
                                            return;
                                        }
                                        imap.end();
                                        return reject(new Error('No emails with valid date headers found'));
                                    }

                                    // Sort emails by date (newest first)
                                    emails.sort((a, b) => b.date - a.date);
                                    const latestEmail = emails[0];
                                    console.log(`Selected latest email: UID ${latestEmail.uid}, Date: ${latestEmail.date}, Subject: ${latestEmail.subject}`);

                                    // Fetch the body of the latest email
                                    const fetchBody = imap.fetch(latestEmail.uid, { bodies: '', markSeen: true });
                                    fetchBody.on('message', (msg) => {
                                        msg.on('body', (stream) => {
                                            simpleParser(stream, async (err, parsed) => {
                                                if (err) {
                                                    console.error('Error parsing email:', err.message);
                                                    return reject(err);
                                                }

                                                const body = parsed.html || parsed.text || '';
                                                const codeMatch = body.match(/The verification code is:.*?\b(\d{6})\b/i);
                                                if (codeMatch) {
                                                    console.log('Verification code found:', codeMatch[1]);
                                                    resolve(codeMatch[1]);
                                                } else {
                                                    console.error('No verification code found in email');
                                                    console.log('Full email body:', body);
                                                    if (retryCount < maxRetries) {
                                                        retryCount++;
                                                        console.log(`Retrying (${retryCount}/${maxRetries}) in 10 seconds...`);
                                                        imap.end();
                                                        setTimeout(tryFetchCode, 10000);
                                                        return;
                                                    }
                                                    reject(new Error('No verification code found in email'));
                                                }
                                                imap.end();
                                            });
                                        });
                                    });

                                    fetchBody.once('error', (err) => {
                                        console.error('Fetch body error:', err.message);
                                        reject(err);
                                        imap.end();
                                    });

                                    fetchBody.once('end', () => {
                                        console.log('Done fetching email');
                                        imap.end();
                                    });
                                });
                            }
                        );
                    });
                });

                imap.connect();
            } catch (error) {
                console.error('Error in getVerificationCode:', error.message);
                if (retryCount < maxRetries) {
                    retryCount++;
                    console.log(`Retrying (${retryCount}/${maxRetries}) in 10 seconds...`);
                    setTimeout(tryFetchCode, 10000);
                    return;
                }
                reject(error);
            }
        }

        tryFetchCode();
    });
}

// Monitor network requests and responses
// Monitor network requests and responses
async function monitorNetwork(page) {
    console.log('Setting up network monitoring...');
    
    page.on('response', async response => {
        const url = response.url();
        console.log(`Network Response: ${response.status()} ${url}`);
        
        if (url.includes('validate-password')) {
            try {
                const data = await response.json();
                console.log('validate-password response:', JSON.stringify(data, null, 2));
            } catch (error) {
                console.error('Error parsing validate-password response:', error.message);
            }
        }
        
        if (url.includes('get-access-token')) {
            try {
                const data = await response.json();
                console.log('get-access-token response:', JSON.stringify(data, null, 2));
                if (data.accessToken) {
                    newAccessToken = data.accessToken;
                    console.log('New accessToken captured:', newAccessToken);
                }
                
                // Capture cookies from response headers
                const headers = response.headers();
                const setCookie = headers['set-cookie'];
                if (setCookie) {
                    console.log('Cookies from get-access-token response:', setCookie);
                    // Parse and log individual cookies if needed
                    const cookiesArray = Array.isArray(setCookie) ? setCookie : setCookie.split('\n');
                    console.log('Parsed cookies:', JSON.stringify(cookiesArray, null, 2));
                } else {
                    console.log('No set-cookie header found in get-access-token response');
                }
            } catch (error) {
                console.error('Error parsing get-access-token response:', error.message);
            }
        }
        
        if (url.includes('send-verification-code')) {
            try {
                const data = await response.json();
                console.log('send-verification-code response:', JSON.stringify(data, null, 2));
            } catch (error) {
                console.error('Error parsing send-verification-code response:', error.message);
            }
        }
    });
}

async function loginWithEmailPassword() {
    let browser = null;
    let page = null;
    let newAccessToken = null;

    try {
        // Launch browser
        console.log('Launching browser...');
        browser = await puppeteer.launch({
            headless: false,
            devtools: true,
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--window-size=1280,720',
                '--disable-blink-features=AutomationControlled',
                '--disable-features=VizDisplayCompositor',
                '--disable-web-security'
            ],
            defaultViewport: null
        });
        page = await browser.newPage();

        // Set mobile viewport
        await page.setViewport({
            width: 375,
            height: 667,
            isMobile: true,
            hasTouch: true
        });

        // Enhanced anti-detection measures
        await page.setUserAgent(config.userAgent);
        await page.evaluateOnNewDocument(() => {
            Object.defineProperty(navigator, 'webdriver', { get: () => false });
            Object.defineProperty(navigator, 'plugins', { get: () => ({ length: 3 }) });
            Object.defineProperty(navigator, 'languages', { get: () => ['en-US', 'en'] });
            window.chrome = { runtime: {} };
            delete navigator.__proto__.webdriver;
            window.ontouchstart = null;
            window.ontouchmove = null;
            window.ontouchend = null;
        });

        // Enable request interception and monitoring
        await page.setRequestInterception(true);
        await monitorNetwork(page);

        page.on('request', request => {
            const url = request.url();
            if (url.includes('validate-password') || url.includes('get-access-token') || url.includes('login')) {
                console.log(`🌐 ${request.method()} ${url}`);
            }
            request.continue();
        });

        // Navigate to login page
        console.log('Navigating to login page:', config.loginUrl);
        await page.goto(config.loginUrl, { waitUntil: 'networkidle2' });
        await delay(2000 + Math.random() * 1000);

        // Wait for "Other ways to sign in" section
        console.log('Waiting for "Other ways to sign in" section...');
        await page.waitForSelector('.otherwayslogin_third_icons__3hdt1t', { timeout: 30000 });

        // Debug: Log all available login icons
        console.log('Listing all available login icons...');
        const availableIcons = await page.evaluate(() => {
            const icons = document.querySelectorAll('.loginicon_container__bus_bi');
            return Array.from(icons).map(icon => ({
                description: icon.querySelector('.loginicon_description__3edmrx')?.textContent || 'No description',
                imgSrc: icon.querySelector('img')?.src || 'No src',
                alt: icon.querySelector('img')?.alt || 'No alt'
            }));
        });
        console.log('Available login icons:', JSON.stringify(availableIcons, null, 2));

        // Click Email login icon
        console.log('Clicking Email login icon...');
        const emailIconFound = await page.evaluate(() => {
            const icons = document.querySelectorAll('.loginicon_container__bus_bi');
            for (const icon of icons) {
                const description = icon.querySelector('.loginicon_description__3edmrx')?.textContent?.toLowerCase();
                if (description && description.includes('email')) {
                    const box = icon.getBoundingClientRect();
                    return { found: true, x: box.x + box.width / 2, y: box.y + box.height / 2 };
                }
            }
            return { found: false };
        });
        if (!emailIconFound.found) {
            throw new Error('Email login icon not found. Check debug_error.html for page structure.');
        }
        await simulateHumanMouse(page, emailIconFound.x, emailIconFound.y);
        await delay(1000 + Math.random() * 500);

        // Wait for email login form
        console.log('Waiting for email login form...');
        const emailInputSelector = 'form.controlledfeild_form___jx_im input[placeholder="Email address"]';
        await page.waitForSelector(emailInputSelector, { visible: true, timeout: 30000 });

        // Fill in email
        console.log('Filling in email address...');
        await page.type(emailInputSelector, config.loginCredentials.email, { delay: 100 + Math.random() * 200 });

        // Verify email input
        const emailValue = await page.evaluate((selector) => {
            const input = document.querySelector(selector);
            return input ? input.value : null;
        }, emailInputSelector);
        console.log('Email input value:', emailValue);
        if (emailValue !== config.loginCredentials.email) {
            throw new Error(`Email input was not filled correctly. Expected: ${config.loginCredentials.email}, Got: ${emailValue}`);
        }

        // Fill in password
        console.log('Filling in password...');
        const passwordInputSelector = 'form.controlledfeild_form___jx_im input[placeholder="Password required"]';
        await page.waitForSelector(passwordInputSelector, { visible: true, timeout: 10000 });
        await page.type(passwordInputSelector, config.loginCredentials.password, { delay: 100 + Math.random() * 200 });

        // Verify password input
        const passwordValue = await page.evaluate((selector) => {
            const input = document.querySelector(selector);
            return input ? input.value : null;
        }, passwordInputSelector);
        console.log('Password input value:', passwordValue);
        if (passwordValue !== config.loginCredentials.password) {
            throw new Error(`Password input was not filled correctly. Expected: ${config.loginCredentials.password}, Got: ${passwordValue}`);
        }

        // Take a screenshot before clicking the button
        console.log('Capturing screenshot before clicking Sign in button...');
        await page.screenshot({ path: 'debug_signin_form.png' });

        // Click "Sign in with password" button
        console.log('Clicking "Sign in with password" button...');
        const signInButtonSelector = 'form.controlledfeild_form___jx_im button.bypwdandemail_button__2j-3g4.button_info__18sstp';
        await page.waitForSelector(signInButtonSelector, { visible: true, timeout: 30000 });
        
        // Check if button is enabled
        const isButtonDisabled = await page.evaluate((selector) => {
            const button = document.querySelector(selector);
            return button ? button.disabled : true;
        }, signInButtonSelector);
        console.log('Is Sign in button disabled?', isButtonDisabled);
        if (isButtonDisabled) {
            throw new Error('Sign in with password button is disabled');
        }

        // Get button coordinates and click
        const signInButtonBox = await page.evaluate((selector) => {
            const button = document.querySelector(selector);
            if (button && !button.disabled) {
                const box = button.getBoundingClientRect();
                return { x: box.x + box.width / 2, y: box.y + box.height / 2 };
            }
            return null;
        }, signInButtonSelector);
        if (!signInButtonBox) {
            throw new Error('Failed to find or click "Sign in with password" button');
        }
        await simulateHumanMouse(page, signInButtonBox.x, signInButtonBox.y);
        console.log('✅ Successfully clicked "Sign in with password" button');

        // Wait for the verification modal to appear
        console.log('Waiting for verification modal...');
        const verificationModalSelector = 'iframe[src*="safe/index.html"]';
        await page.waitForSelector(verificationModalSelector, { visible: true, timeout: 30000 });
        console.log('Verification modal detected.');

        // Wait for the iframe to be fully loaded
        const iframeElement = await page.$(verificationModalSelector);
        const iframeUrl = await iframeElement.evaluate(el => el.src);
        console.log('Iframe URL:', iframeUrl);
        const iframe = await iframeElement.contentFrame();
        if (!iframe) {
            throw new Error('Failed to access verification modal iframe');
        }

        // Wait for the iframe to be ready
        await page.waitForFrame(async frame => frame.url().includes('safe/index.html'), { timeout: 30000 });
        console.log('Switched to verification modal iframe.');

        // Debug: Log iframe content
        try {
            const iframeContent = await iframe.content();
            require('fs').writeFileSync('debug_iframe.html', iframeContent);
            console.log('Saved iframe HTML to debug_iframe.html');
        } catch (htmlError) {
            console.error('Could not save iframe HTML:', htmlError.message);
        }

        // Wait for the "Get code" link
        console.log('Waiting for "Get code" link...');
        const getCodeSelector = 'a.verifycodepart_link__3dxq2w';
        await iframe.waitForSelector(getCodeSelector, { visible: true, timeout: 30000 });

        // Click "Get code" link
        console.log('Clicking "Get code" link...');
        const getCodeFound = await iframe.evaluate((selector) => {
            const link = document.querySelector(selector);
            if (link) {
                link.click();
                return true;
            }
            return false;
        }, getCodeSelector);
        if (!getCodeFound) {
            throw new Error('Failed to find or click "Get code" link');
        }
        console.log('✅ Successfully clicked "Get code" link');

        // Wait for 3 seconds as specified
        await delay(3000);

        // Fetch the verification code from email
        console.log('Fetching verification code from email...');
        const verificationCode = await getVerificationCode();
        console.log('Verification code retrieved:', verificationCode);

        // Wait for the verification code input to become active
        console.log('Waiting for verification code input to become active...');
        const verificationInputSelector = 'input[placeholder="Verification code"]';
        await iframe.waitForSelector(`${verificationInputSelector}:not([disabled])`, { visible: true, timeout: 30000 });

        // Enter the verification code
        console.log('Entering verification code...');
        await iframe.type(verificationInputSelector, verificationCode, { delay: 100 + Math.random() * 200 });

        // Verify the input value
        const verificationCodeValue = await iframe.evaluate((selector) => {
            const input = document.querySelector(selector);
            return input ? input.value : null;
        }, verificationInputSelector);
        console.log('Verification code input value:', verificationCodeValue);
        if (verificationCodeValue !== verificationCode) {
            throw new Error(`Verification code was not filled correctly. Expected: ${verificationCode}, Got: ${verificationCodeValue}`);
        }

        // Wait for 2 seconds as requested
        console.log('Waiting for 2 seconds after entering verification code...');
        await delay(2000);

        // Click the "OK" button
        console.log('Clicking "OK" button...');
const okButtonSelector = 'button.button_button__2g6tsu.button_info__18sstp.button_enhanced__3ygorj';
await iframe.waitForSelector(okButtonSelector, { visible: true, timeout: 30000 });

// Check if button is enabled
const isOkButtonDisabled = await iframe.evaluate((selector) => {
    const button = document.querySelector(selector);
    return button ? button.disabled : true;
}, okButtonSelector);
console.log('Is OK button disabled?', isOkButtonDisabled);
if (isOkButtonDisabled) {
    throw new Error('OK button is disabled');
}

// Click "OK" button using mouse simulation for reliability
const okButtonBox = await iframe.evaluate((selector) => {
    const button = document.querySelector(selector);
    if (button && !button.disabled) {
        const box = button.getBoundingClientRect();
        button.click(); // Direct click to trigger JavaScript events
        return { x: box.x + box.width / 2, y: box.y + box.height / 2 };
    }
    return null;
}, okButtonSelector);
if (!okButtonBox) {
    throw new Error('Failed to find or click "OK" button');
}
await simulateHumanMouse(iframe, okButtonBox.x, okButtonBox.y);
console.log('✅ Successfully clicked "OK" button');

// Take a screenshot after clicking OK
await page.screenshot({ path: 'debug_ok_button_clicked.png' });

// Wait for page reload and get-access-token request
console.log('Waiting for page reload and get-access-token request...');
await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 30000 }).catch(err => {
    console.warn('Navigation after OK button click timed out, continuing...', err.message);
});

// Log all cookies after page reload for additional debugging
const cookiesAfterReload = await page.cookies();
console.log('Cookies after page reload:', JSON.stringify(cookiesAfterReload.map(c => ({ name: c.name, value: c.value, domain: c.domain })), null, 2));

// Wait for login completion
console.log('Waiting for login completion...');

await page.screenshot({ path: 'debug_login_complete.png' });

        console.log('🎉 Login process completed! Browser will remain open for debugging.');
        console.log('Check the screenshots in the current directory for step-by-step verification.');

        return { success: true, accessToken: newAccessToken };

    } catch (error) {
        console.error('❌ Error in login process:', error.message);
        if (page) {
            await page.screenshot({ path: 'debug_error.png' });
            console.log('Saved error screenshot to debug_error.png');
            
            // Save page HTML for debugging
            try {
                const html = await page.content();
                require('fs').writeFileSync('debug_error.html', html);
                console.log('Saved error HTML to debug_error.html');
            } catch (htmlError) {
                console.error('Could not save HTML:', htmlError.message);
            }
        }
        throw error;
    } finally {
        console.log('Browser will remain open. Close it manually when done debugging.');
    }
}

// Run the login function with error handling
if (require.main === module) {
    loginWithEmailPassword()
        .then(result => {
            console.log('🎉 Login script executed successfully!');
            if (result.accessToken) {
                console.log('Access Token:', result.accessToken);
            }
        })
        .catch(error => {
            console.error('💥 Fatal error in login process:', error.message);
            console.error('Stack trace:', error.stack);
            process.exit(1);
        });
}

module.exports = { loginWithEmailPassword, getVerificationCode };