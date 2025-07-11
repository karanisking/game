const fetch = require('node-fetch');
const crypto = require('crypto');
const puppeteer = require('puppeteer');
const { getVerificationCode } = require('./gmail.js');

// Configuration
const config = {
    jiekou: 'https://event.realme.com/in/realme-P3Series-FireYourBoss-2025/api/api.php',
    secretKey: 'ZtlDqiHoaw0BAQEFASm5Xg1YwUUAUEi8',
    publicKey: `-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAw4H2FL0s5NHU2TtqrTr6
EBaZnZyZVc5Dpca/RDTZGP1aD+ex1rWCVm2KAHCX0UFSL0/SwPMT9FykFT958KKG
bt498hjiLcz1WLExQJ9BcbFz7r/y+clnxfrtiYA8HEBXc1sePjATZCgF3YpfGi5q
vh8RFCNM+SNXsZIHf+P+5SginaAzobtLLhMC0WBARyHxnc/SEId2strRKpb5J+yU
tDcbDGeyZCDsIHTe6sCDm7xx+1MsfTtwVHpx16TS0Vqa/VEueMpdKPNXu3jSF1hL
pVFA1mTwjwtSxvdLEtUyRuPawrZ6l0MFraxFGaIT5ZYpZU4S1y4f2Z/Lsw3wdjhL
SwIDAQAB
-----END PUBLIC KEY-----`,
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1',
    cookies: '_gcl_au=1.1.1991939292.1750258149; _fbp=fb.1.1750258151332.980576735456533753; _ga_FDYPQD4D0C=GS2.1.s1750432698$o2$g1$t1750432776$j60$l0$h0; _gid=GA1.2.1496544482.1750841887; RMID=NzkyNDk4YjUtYmJjZi00OTZiLTkwNzQtNTA5NzZhZTUwYTc0; PHPSESSID=iu0n4odijau3jqp917i1mihnt7; accessToken=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJsb2dpblNjaGVtZSI6IkEiLCJpZGMiOiJpbmRpYSIsImV4cCI6MTc1MTA4OTY5MCwidG9rZW5UeXBlIjoiQUNDRVNTX1RPS0VOIiwidGlkIjoiOFRDdlJDWWp2RWp0VHJCTjlRbUVBMjkxTGFETmx3Z1ljY2o1TXZyVUhCcmVDWklwbGd6TngyemgrVStsYkhyeDB2UVU4dTVnVEw3KzVoSGhwVDBLVzljSVFLdjIxaVFtM1BTNmFMWU9hMXc4SmlOKys5OVo0WUN3aUF0cEEyY1hPZTlxM2F3ZE9vWUdtbE9ZcnNVL090V1ZwRDBZZzM4dUo1RDQxNndDL2lXeEM4U2FOQ2pUbkh4ZVBtSGFaT1VxU0dJMmV0UG41Qnk0SjdNU0Y5elZvUT09IiwicmVmcmVzaFRva2VuIjoiUzc0OXJTYXNtTWZhMlR0djh2N1B6ViJ9.Ap6vOgC8_avuIyHpYMgW5CTGjSFVf293lqA2-I3NBtQ; _ga_C9R87BNWFK=GS2.1.s1751085357$o19$g1$t1751085441$j60$l0$h0; _ga=GA1.2.174272760.1750258110; _ga_PY1R3QQ6DN=GS2.1.s1751085358$o19$g1$t1751085452$j27$l0$h0',
    referer: 'https://event.realme.com/in/realme-P3Series-FireYourBoss-2025/index.html?source=WhatsApp_411&source=WhatsApp&source=WhatsApp&source=WhatsApp&source=WhatsApp&source=WhatsApp&source=WhatsApp&source=WhatsApp&source=WhatsApp&source=WhatsApp&source=WhatsApp&source=WhatsApp',
    loginUrl: 'https://www.realme.com/in/login?cb=https://event.realme.com/in/realme-P3Series-FireYourBoss-2025/index.html',
    loginCredentials: {
        email: 'karan0907kumar@gmail.com',
        password: 'Karan@2004'
    }
};

// Common headers
const commonHeaders = {
    'accept': '*/*',
    'accept-language': 'en-US,en;q=0.9',
    'cache-control': 'no-cache',
    'content-type': 'application/x-www-form-urlencoded;charset=UTF-8',
    'origin': 'https://event.realme.com',
    'pragma': 'no-cache',
    'priority': 'u=1, i',
    'referer': config.referer,
    'sec-fetch-dest': 'empty',
    'sec-fetch-mode': 'cors',
    'sec-fetch-site': 'same-origin',
    'user-agent': config.userAgent
};

async function handleVerificationCode(page) {
    console.log('Handling verification code process...');

    try {
        // Wait for the page to stabilize after sign-in
        console.log('Waiting for page to stabilize after sign-in...');
      

        // Take screenshot of current state
        await page.screenshot({ path: 'debug_after_signin.png' });
        console.log('Saved screenshot after sign-in to debug_after_signin.png');

        // Get full page HTML and log it for debugging
        console.log('=== FULL PAGE HTML AFTER SIGN-IN ===');
        const fullHTML = await page.content();
        console.log(fullHTML);
        console.log('=== END FULL PAGE HTML ===');

        // Check all forms on the page
        const allForms = await page.evaluate(() => {
            const forms = document.querySelectorAll('form');
            return Array.from(forms).map((form, index) => {
                return {
                    index,
                    className: form.className,
                    style: form.style.display,
                    visible: form.offsetParent !== null,
                    innerHTML: form.innerHTML.substring(0, 500) + '...' // Truncate for readability
                };
            });
        });
        console.log('=== ALL FORMS ON PAGE ===');
        console.log(JSON.stringify(allForms, null, 2));

        // Look for "Sign in with code" link and click it to switch to verification form
        console.log('Attempting to click "Sign in with code" link...');
        const signInWithCodeLink = await page.evaluate(() => {
            const links = document.querySelectorAll('a.anchorlink_anchor__1gttsn');
            for (const link of links) {
                if (link.textContent.toLowerCase().includes('sign in with code')) {
                    return {
                        className: link.className,
                        visible: link.offsetParent !== null,
                        href: link.href,
                        outerHTML: link.outerHTML
                    };
                }
            }
            return null;
        });

        if (signInWithCodeLink && signInWithCodeLink.visible) {
            console.log('Found "Sign in with code" link:', signInWithCodeLink);
            await page.evaluate(() => {
                const link = document.querySelector('a.anchorlink_anchor__1gttsn');
                if (link && link.textContent.toLowerCase().includes('sign in with code')) {
                    link.click();
                }
            });
            console.log('Clicked "Sign in with code" link');

        } else {
            console.warn('No visible "Sign in with code" link found. Proceeding to check for verification form...');
        }

        // Re-check forms after clicking "Sign in with code"
        const updatedForms = await page.evaluate(() => {
            const forms = document.querySelectorAll('form');
            return Array.from(forms).map((form, index) => {
                return {
                    index,
                    className: form.className,
                    style: form.style.display,
                    visible: form.offsetParent !== null,
                    innerHTML: form.innerHTML.substring(0, 500) + '...'
                };
            });
        });
        console.log('=== UPDATED FORMS AFTER CLICKING SIGN IN WITH CODE ===');
        console.log(JSON.stringify(updatedForms, null, 2));

        // Look for verification code inputs
        const verificationInputs = await page.evaluate(() => {
            const inputs = document.querySelectorAll('input');
            return Array.from(inputs).map((input, index) => {
                const isVerificationCode = input.placeholder && 
                    (input.placeholder.toLowerCase().includes('verification') || 
                     input.placeholder.toLowerCase().includes('code'));
                return {
                    index,
                    placeholder: input.placeholder,
                    type: input.type,
                    value: input.value,
                    disabled: input.disabled,
                    visible: input.offsetParent !== null,
                    parentFormClass: input.closest('form')?.className || 'no-form',
                    parentFormVisible: input.closest('form')?.offsetParent !== null,
                    isVerificationCode
                };
            }).filter(input => input.isVerificationCode);
        });
        console.log('=== VERIFICATION CODE INPUTS ===');
        console.log(JSON.stringify(verificationInputs, null, 2));

        // Look for "Get code" elements
        const getCodeElements = await page.evaluate(() => {
            const elements = document.querySelectorAll('*');
            const getCodeElems = [];
            elements.forEach((el, index) => {
                const text = el.textContent || '';
                const tagName = el.tagName.toLowerCase();
                if (text.toLowerCase().includes('get code')) {
                    getCodeElems.push({
                        index,
                        tagName,
                        className: el.className,
                        textContent: text.trim(),
                        visible: el.offsetParent !== null,
                        disabled: el.disabled,
                        href: el.href || null,
                        parentFormClass: el.closest('form')?.className || 'no-form',
                        parentFormVisible: el.closest('form')?.offsetParent !== null,
                        outerHTML: el.outerHTML.substring(0, 200) + '...'
                    });
                }
            });
            return getCodeElems;
        });
        console.log('=== GET CODE ELEMENTS ===');
        console.log(JSON.stringify(getCodeElements, null, 2));

        // Find visible verification input
        let verificationInput = null;
        const selectors = [
            'input[placeholder*="Verification code"]',
            'input[placeholder*="verification code"]',
            'input[placeholder*="Code"]',
            'input[placeholder*="code"]',
            'input[type="tel"][maxlength="6"]'
        ];

        for (const selector of selectors) {
            try {
                console.log(`Trying selector: ${selector}`);
                await page.waitForSelector(selector, { visible: true, timeout: 5000 });
                verificationInput = selector;
                console.log(`Found verification input with selector: ${selector}`);
                break;
            } catch (error) {
                console.log(`Selector ${selector} not found or not visible`);
            }
        }

        if (!verificationInput) {
            throw new Error('No verification code input found. Check the page HTML above.');
        }

        // Check if verification code is already filled
        let codeValue = await page.evaluate((selector) => {
            const input = document.querySelector(selector);
            return input ? input.value : '';
        }, verificationInput);
        console.log('Verification code input value:', codeValue);

        if (!codeValue) {
            // Find and click "Get code" button/link
            console.log('Attempting to find and click "Get code" element...');
            const getCodeClicked = await page.evaluate(() => {
                const approaches = [
                    () => document.querySelector('span.verifycodepart_countdown__39tgei a.verifycodepart_link__3dxq2w'),
                    () => document.querySelector('span.verifycodepart_countdown__39tgei'),
                    () => {
                        const elements = document.querySelectorAll('*');
                        for (const el of elements) {
                            if (el.textContent && el.textContent.trim().toLowerCase() === 'get code') {
                                return el;
                            }
                        }
                        return null;
                    },
                    () => {
                        const verifyInput = document.querySelector('input[placeholder*="code"], input[placeholder*="Code"]');
                        if (verifyInput) {
                            const parent = verifyInput.closest('.input_wrapper__1x23fj, .controlledfeild_form___jx_im');
                            if (parent) {
                                const clickables = parent.querySelectorAll('a, span, button');
                                for (const el of clickables) {
                                    if (el.textContent && el.textContent.toLowerCase().includes('get code')) {
                                        return el;
                                    }
                                }
                            }
                        }
                        return null;
                    }
                ];

                for (let i = 0; i < approaches.length; i++) {
                    console.log(`Trying approach ${i + 1} to find "Get code" element...`);
                    const element = approaches[i]();
                    if (element && element.offsetParent !== null) {
                        console.log(`Found element with approach ${i + 1}:`, {
                            tagName: element.tagName,
                            className: element.className,
                            textContent: element.textContent.trim(),
                            outerHTML: element.outerHTML.substring(0, 100)
                        });
                        try {
                            const event = new MouseEvent('click', {
                                view: window,
                                bubbles: true,
                                cancelable: true
                            });
                            element.dispatchEvent(event);
                            console.log(`Successfully clicked "Get code" element using approach ${i + 1}`);
                            return true;
                        } catch (error) {
                            console.log(`Failed to click element from approach ${i + 1}:`, error.message);
                        }
                    }
                }
                return false;
            });

            if (!getCodeClicked) {
                console.log('Could not find or click "Get code" element. Attempting to proceed with manual code entry...');
            } else {
                console.log('✅ Successfully clicked "Get code" element');
               
            }

            // Fetch verification code from Gmail
            console.log('Fetching verification code from Gmail...');
            let verificationCode;
            let attempts = 0;
            const maxAttempts = 3;

            while (attempts < maxAttempts) {
                try {
                    verificationCode = await getVerificationCode();
                    console.log('Verification code retrieved:', verificationCode);
                    break;
                } catch (error) {
                    attempts++;
                    console.log(`Attempt ${attempts} failed to get verification code:`, error.message);
                    if (attempts === maxAttempts) {
                        throw new Error('Failed to retrieve verification code after multiple attempts');
                    }
                  
                }
            }

            // Enter the verification code
            console.log('Entering verification code...');
            await page.focus(verificationInput);
            await page.evaluate((selector) => {
                const input = document.querySelector(selector);
                if (input) {
                    input.value = '';
                }
            }, verificationInput);
            await page.type(verificationInput, verificationCode);
            codeValue = verificationCode;
        }

        // Find and click the "Continue" button
        console.log('Looking for "Continue" button...');
        const continueButtons = await page.evaluate(() => {
            const buttons = document.querySelectorAll('button');
            return Array.from(buttons).map((btn, index) => {
                const spanText = btn.querySelector('span')?.textContent || btn.textContent;
                return {
                    index,
                    className: btn.className,
                    disabled: btn.disabled,
                    visible: btn.offsetParent !== null,
                    textContent: spanText.trim(),
                    isContinue: spanText.toLowerCase().includes('continue')
                };
            }).filter(btn => btn.isContinue);
        });
        console.log('=== CONTINUE BUTTONS ===');
        console.log(JSON.stringify(continueButtons, null, 2));

        if (continueButtons.length === 0) {
            throw new Error('No "Continue" button found');
        }

        // Click the first visible, enabled Continue button
        const continueClicked = await page.evaluate(() => {
            const buttons = document.querySelectorAll('button');
            for (const btn of buttons) {
                const spanText = btn.querySelector('span')?.textContent || btn.textContent;
                if (spanText.toLowerCase().includes('continue') && 
                    !btn.disabled && 
                    btn.offsetParent !== null) {
                    console.log('Clicking Continue button:', btn.className);
                    const event = new MouseEvent('click', {
                        view: window,
                        bubbles: true,
                        cancelable: true
                    });
                    btn.dispatchEvent(event);
                    return true;
                }
            }
            return false;
        });

        if (!continueClicked) {
            throw new Error('Failed to click Continue button');
        }

        console.log('✅ Successfully clicked "Continue" button');
      
        return true;

    } catch (error) {
        console.error('Error in verification code process:', error.message);

        // Save debug information
        try {
            const html = await page.content();
            require('fs').writeFileSync('debug_page_error.html', html);
            console.log('Saved page HTML to debug_page_error.html');

            await page.screenshot({ path: 'debug_verification_error.png' });
            console.log('Saved screenshot to debug_verification_error.png');

            // Check iframe content
            const iframeElement = await page.$('iframe[id*="heytap_popper_validate_center"]');
            if (iframeElement) {
                console.log('Found iframe, extracting content...');
                const frame = await iframeElement.contentFrame();
                if (frame) {
                    const iframeHtml = await frame.content();
                    require('fs').writeFileSync('debug_iframe_error.html', iframeHtml);
                    console.log('Saved iframe HTML to debug_iframe_error.html');
                }
            }
        } catch (debugError) {
            console.error('Error saving debug information:', debugError.message);
        }

        throw error;
    }
}
// Function to check JWT expiration
function isTokenExpired(token) {
    if (!token || token === '<REPLACE_WITH_NEW_ACCESS_TOKEN>') {
        console.error('Invalid or placeholder accessToken.');
        return true;
    }
    try {
        const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
        const exp = payload.exp * 1000; // Convert to milliseconds
        const now = Date.now();
        console.log('Token expiration check:', { exp: new Date(exp), now: new Date(now), isExpired: exp < now });
        return exp < now;
    } catch (error) {
        console.error('Error parsing JWT:', error.message);
        return true; // Assume expired if parsing fails
    }
}

// Function to refresh access token using Puppeteer
async function refreshAccessToken() {
    console.log('Refreshing access token...');
    let browser = null;
    let page = null;
    let newAccessToken = null;
    try {
        // Launch browser with headless: false and devtools enabled
        browser = await puppeteer.launch({
            headless: false,
            devtools: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1280,720'],
            defaultViewport: null
        });
        page = await browser.newPage();

        // Set mobile viewport to emulate phone layout
        await page.setViewport({
            width: 375,
            height: 667,
            isMobile: true,
            hasTouch: true
        });

        // Set user agent to match config
        await page.setUserAgent(config.userAgent);

        // Enable DevTools and attempt to open Network tab
        await page.evaluateOnNewDocument(() => {
            window.localStorage.setItem('devtools', 'true');
            window.dispatchEvent(new KeyboardEvent('keydown', {
                key: 'F12',
                code: 'F12',
                bubbles: true
            }));
            setTimeout(() => {
                window.dispatchEvent(new KeyboardEvent('keydown', {
                    key: 't',
                    code: 'KeyT',
                    ctrlKey: true,
                    shiftKey: true,
                    bubbles: true
                }));
            }, 1000);
        });

        // Intercept and log network requests and responses
        await page.setRequestInterception(true);
        page.on('request', request => {
            console.log(`Network Request: ${request.method()} ${request.url()}`);
            request.continue();
        });
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

        // Navigate to the login page
        console.log('Navigating to login page:', config.loginUrl);
        await page.goto(config.loginUrl, { waitUntil: 'networkidle2' });

        // Wait for the "Other ways to sign in" section
        console.log('Waiting for "Other ways to sign in" section...');
        await page.waitForSelector('.otherwayslogin_third_icons__3hdt1t', { timeout: 30000 });

        // Click the Email login icon
        console.log('Clicking Email login icon...');
        await page.evaluate(() => {
            const emailIcon = document.querySelector('.loginicon_container__bus_bi img[alt="third_party_icon"]');
            if (emailIcon) {
                emailIcon.closest('.loginicon_container__bus_bi').click();
            } else {
                throw new Error('Email login icon not found');
            }
        });

        // Wait for the email login form to appear
        console.log('Waiting for email login form...');
        await page.waitForSelector('form.controlledfeild_form___jx_im input[placeholder="Email address"]', { timeout: 30000 });

        // Fill in the email and password
        console.log('Filling in email and password...');
        await page.type('form.controlledfeild_form___jx_im input[placeholder="Email address"]', config.loginCredentials.email);
        await page.type('form.controlledfeild_form___jx_im input[placeholder="Password required"]', config.loginCredentials.password);

        // Take a screenshot before clicking the button
        console.log('Capturing screenshot before clicking Sign in button...');
        await page.screenshot({ path: 'debug_signin_form.png' });

        // Click the "Sign in with password" button
        console.log('Clicking "Sign in with password" button...');
        await page.waitForSelector('form.controlledfeild_form___jx_im button.bypwdandemail_button__2j-3g4.button_info__18sstp', { 
            visible: true, 
            timeout: 30000 
        });
        const isButtonDisabled = await page.evaluate(() => {
            const button = document.querySelector('form.controlledfeild_form___jx_im button.bypwdandemail_button__2j-3g4.button_info__18sstp');
            return button ? button.disabled : true;
        });
        console.log('Is Sign in button disabled?', isButtonDisabled);
        if (isButtonDisabled) {
            throw new Error('Sign in with password button is disabled');
        }
        await page.click('form.controlledfeild_form___jx_im button.bypwdandemail_button__2j-3g4.button_info__18sstp');

        // Wait for the page to update and verification form to appear
        console.log('Waiting 10 seconds for verification form...');
      

        // Handle verification code process
        console.log('Starting verification code process...');
        await handleVerificationCode(page);

        // Wait for network activity to settle and new accessToken
        console.log('Waiting for accessToken response...');
     

        // Check cookies for new accessToken
        const cookies = await page.cookies();
        const accessTokenCookie = cookies.find(cookie => cookie.name === 'accessToken');
        if (accessTokenCookie) {
            newAccessToken = accessTokenCookie.value;
            console.log('New accessToken found in cookies:', newAccessToken);
        } else if (newAccessToken) {
            console.log('Using accessToken from network response:', newAccessToken);
        } else {
            throw new Error('Failed to capture new accessToken');
        }

        // Update config.cookies with the new accessToken
        const updatedCookies = config.cookies.replace(/accessToken=[^;]+/, `accessToken=${newAccessToken}`);
        config.cookies = updatedCookies;
        console.log('Updated cookies with new accessToken:', config.cookies);

        // Keep browser open for debugging
        console.log('Browser is open for debugging. Close it manually when done.');
        return newAccessToken;
    } catch (error) {
        console.error('Error refreshing access token:', error.message);
        if (page) {
            await page.screenshot({ path: 'debug_error.png' });
        }
        throw error;
    } finally {
        // Comment out to keep browser open for debugging
        // if (browser) await browser.close();
    }
}

// Function to perform auth API call
async function auth() {
    console.log('Starting auth request...');

    // Extract and validate accessToken
    const accessTokenMatch = config.cookies.match(/accessToken=([^;]+)/);
    if (!accessTokenMatch) {
        console.error('No accessToken found in cookies. Attempting to refresh...');
        await refreshAccessToken();
        const newAccessTokenMatch = config.cookies.match(/accessToken=([^;]+)/);
        if (!newAccessTokenMatch) {
            throw new Error('Failed to obtain a new accessToken');
        }
    }
    const accessToken = accessTokenMatch[1];

    if (isTokenExpired(accessToken)) {
        console.error('accessToken is expired or invalid. Refreshing token...');
        await refreshAccessToken();
        const newAccessTokenMatch = config.cookies.match(/accessToken=([^;]+)/);
        if (!newAccessTokenMatch) {
            throw new Error('Failed to obtain a new accessToken after refresh');
        }
    }

    const body = new URLSearchParams({
        apptype: '4',
        source: '3',
        invite: '411'
    });

    try {
        const response = await fetch(`${config.jiekou}?a=auth`, {
            method: 'POST',
            headers: {
                ...commonHeaders,
                'cookie': config.cookies
            },
            body: body
        });

        console.log('Auth status:', response.status);
        console.log('Auth headers:', JSON.stringify([...response.headers], null, 2));

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Auth request failed:', response.status, errorText);
            throw new Error(`HTTP ${response.status}: ${errorText}`);
        }

        const data = await response.json();
        console.log('Auth response:', JSON.stringify(data, null, 2));

        if (data.error !== 0) {
            console.error('Auth API error:', data.info, 'Error code:', data.error, 'Data:', data.data);
            if (data.data?.login_url) {
                console.error(`Please log in at ${data.data.login_url} to obtain a new accessToken`);
            }
            throw new Error(data.info);
        }

        console.log('Auth successful. User token:', data.data.token);
        return data.data.token;
    } catch (error) {
        console.error('Auth error:', error.message);
        throw error;
    }
}

// Function to perform startGame API call
async function startGame(userToken) {
    console.log('Starting startGame request...');
    const timestamp = Math.floor(Date.now() / 1000);
    const nonce = Math.floor(100032768 * Math.random()) + 32768;

    const signData = {
        timestamp: timestamp.toString(),
        nonce: nonce.toString()
    };
    const signString = Object.keys(signData)
        .filter(key => key !== 'signature')
        .sort()
        .map(key => signData[key])
        .join('|') + `|${userToken}`;
    
    console.log('signString:', signString);
    const signature = crypto.createHmac('sha256', config.secretKey).update(signString).digest('hex');
    console.log('signature:', signature);

    const body = new URLSearchParams({
        timestamp: timestamp.toString(),
        nonce: nonce.toString(),
        signature: signature
    });

    try {
        const response = await fetch(`${config.jiekou}?a=startGame`, {
            method: 'POST',
            headers: {
                ...commonHeaders,
                'auth-token': userToken,
                'cookie': config.cookies
            },
            body: body
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('startGame request failed:', response.status, errorText);
            throw new Error(`HTTP ${response.status}: ${errorText}`);
        }

        const data = await response.json();
        console.log('startGame response:', JSON.stringify(data, null, 2));

        if (data.error !== 0) {
            console.error('startGame error:', data.info);
            throw new Error(data.info);
        }

        return data.data.gametoken;
    } catch (error) {
        console.error('startGame error:', error.message);
        throw error;
    }
}

// Function to perform saveGame API call
async function saveGame(userToken, gameToken) {
    console.log('Starting saveGame request...');
    const timestamp = Math.floor(Date.now() / 1000);
    const nonce = Math.floor(100032768 * Math.random()) + 32768;
    const randomNum = Math.floor(900 * Math.random()) + 100;
    const plainText = `${timestamp}.${randomNum}.success.${gameToken}`;

    try {
        const encrypted = crypto.publicEncrypt(
            {
                key: config.publicKey,
                padding: crypto.constants.RSA_PKCS1_PADDING
            },
            Buffer.from(plainText)
        );
        const result = encrypted.toString('base64');
        console.log('Encrypted result:', result);

        const signData = {
            timestamp: timestamp.toString(),
            nonce: nonce.toString(),
            gametoken: gameToken,
            result: result
        };
        const signString = Object.keys(signData)
            .filter(key => key !== 'signature')
            .sort()
            .map(key => signData[key])
            .join('|') + `|${userToken}`;
        console.log('signString:', signString);

        const signature = crypto.createHmac('sha256', config.secretKey).update(signString).digest('hex');
        console.log('signature:', signature);

        const body = new URLSearchParams({
            timestamp: timestamp.toString(),
            nonce: nonce.toString(),
            gametoken: gameToken,
            result: result,
            signature: signature
        });

        try {
            const response = await fetch(`${config.jiekou}?a=saveGame`, {
                method: 'POST',
                headers: {
                    ...commonHeaders,
                    'auth-token': userToken,
                    'cookie': config.cookies
                },
                body: body
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error('saveGame request failed:', response.status, errorText);
                throw new Error(`HTTP ${response.status}: ${errorText}`);
            }

            const data = await response.json();
            console.log('saveGame response:', JSON.stringify(data, null, 2));

            if (data.error !== 0) {
                console.error('saveGame error:', data.info);
                throw new Error(data.info);
            }

            return data;
        } catch (error) {
            console.error('saveGame error:', error.message);
            throw error;
        }
    } catch (error) {
        console.error('saveGame error:', error.message);
        throw error;
    }
}

// Main function to run the API calls in sequence with delay
async function runGameLoop() {
    while (true) {
        try {
            console.log('Starting new game loop iteration...');

            // Step 1: Auth
            const userToken = await auth();
            console.log('User token obtained:', userToken);

            // Step 2: Start Game
            const gameToken = await startGame(userToken);
            console.log('Game token obtained:', gameToken);

            // Step 3: Wait for 5 minutes
            console.log('Waiting for 5 minutes...');
            await new Promise(resolve => setTimeout(resolve, 305000));

            // Step 4: Save Game
            const saveResult = await saveGame(userToken, gameToken);
            console.log('Game saved successfully:', saveResult);

        } catch (error) {
            console.error('Error in game loop:', error.message);
            // Wait before retrying to avoid rapid error loops
            await new Promise(resolve => setTimeout(resolve, 60000));
        }
    }
}

// Start the game loop
runGameLoop().catch(error => {
    console.error('Fatal error in game loop:', error.message);
    process.exit(1);
});