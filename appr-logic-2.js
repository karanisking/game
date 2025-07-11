const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const { getVerificationCode } = require('./gmail.js');
const { solveCaptcha } = require('./captcha-solver.js'); // Import the CAPTCHA solver

puppeteer.use(StealthPlugin());

// Configuration
const config = {
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1',
    loginUrl: 'https://www.realme.com/in/login?cb=https://event.realme.com/in/realme-P3Series-FireYourBoss-2025/index.html',
    loginCredentials: {
        email: 'karan0907kumar@gmail.com',
        password: 'Karan@2004'
    }
};

// Custom delay function
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

// Simulate human-like mouse movements
async function simulateHumanMouse(page, x, y) {
    const steps = 15;
    const currentPos = await page.evaluate(() => ({ x: window.scrollX + 50, y: window.scrollY + 50 }));
    const deltaX = (x - currentPos.x) / steps;
    const deltaY = (y - currentPos.y) / steps;

    for (let i = 1; i <= steps; i++) {
        await page.mouse.move(
            currentPos.x + deltaX * i + (Math.random() * 15 - 7),
            currentPos.y + deltaY * i + (Math.random() * 15 - 7)
        );
        await delay(30 + Math.random() * 70);
    }
    await page.mouse.click(x, y);
}

// Simulate human-like typing
async function simulateHumanTyping(page, selector, text) {
    await page.focus(selector);
    for (const char of text) {
        await page.keyboard.type(char);
        await delay(100 + Math.random() * 200);
    }
}

// Enhanced CAPTCHA endpoint monitoring
async function monitorCaptchaEndpoints(page) {
    console.log('Setting up CAPTCHA endpoint monitoring...');
    
    page.on('response', async response => {
        const url = response.url();
        
        // Monitor CAPTCHA API calls
        if (url.includes('captcha-ind-sec.heytapmobile.com/api/a')) {
            console.log('🔍 CAPTCHA challenge endpoint called:', url);
            try {
                const data = await response.text();
                console.log('CAPTCHA challenge response:', data.substring(0, 200) + '...');
            } catch (error) {
                console.error('Error reading CAPTCHA challenge response:', error.message);
            }
        }
        
        if (url.includes('captcha-ind-sec.heytapmobile.com/api/v1')) {
            console.log('✅ CAPTCHA verification endpoint called:', url);
            try {
                const data = await response.json();
                console.log('CAPTCHA verification response:', JSON.stringify(data, null, 2));
            } catch (error) {
                console.error('Error reading CAPTCHA verification response:', error.message);
            }
        }
        
        if (url.includes('send-verification-code')) {
            console.log('📧 Verification code endpoint called:', url);
            try {
                const data = await response.json();
                console.log('Send verification code response:', JSON.stringify(data, null, 2));
            } catch (error) {
                console.error('Error parsing send-verification-code response:', error.message);
            }
        }
    });
}

async function loginWithEmailOTP() {
    let browser = null;
    let page = null;

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
                '--disable-features=VizDisplayCompositor'
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
            
            // Override automation detection methods
            delete navigator.__proto__.webdriver;
            
            // Mock touch events for mobile simulation
            window.ontouchstart = null;
            window.ontouchmove = null;
            window.ontouchend = null;
        });

        // Enable request interception and monitoring
        await page.setRequestInterception(true);
        await monitorCaptchaEndpoints(page);
        
        page.on('request', request => {
            const url = request.url();
            
            // Log important requests
            if (url.includes('captcha') || url.includes('verification') || url.includes('login')) {
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

        // Click "Sign in with code" link
        console.log('Clicking "Sign in with code" link...');
        const signInWithCodeLink = await page.evaluate(() => {
            const links = document.querySelectorAll('a.anchorlink_anchor__1gttsn');
            for (const link of links) {
                if (link.textContent.toLowerCase().includes('sign in with code')) {
                    link.click();
                    return true;
                }
            }
            return false;
        });
        if (!signInWithCodeLink) {
            throw new Error('No "Sign in with code" link found');
        }
        await delay(2000 + Math.random() * 1000);

        // Click Email login icon
        console.log('Clicking Email login icon...');
        const emailIconFound = await page.evaluate(() => {
            const emailIcon = document.querySelector('.loginicon_container__bus_bi img[alt="third_party_icon"]');
            if (emailIcon) {
                const box = emailIcon.closest('.loginicon_container__bus_bi').getBoundingClientRect();
                return { found: true, x: box.x + box.width / 2, y: box.y + box.height / 2 };
            }
            return { found: false };
        });
        if (!emailIconFound.found) {
            throw new Error('Email login icon not found');
        }
        await simulateHumanMouse(page, emailIconFound.x, emailIconFound.y);
        await delay(1000 + Math.random() * 500);

        // Enter email address
        console.log('Entering email address...');
        const emailInputSelector = 'form.controlledfeild_form___jx_im input[placeholder="Email"]';
        await page.waitForSelector(emailInputSelector, { visible: true, timeout: 10000 });
        await simulateHumanTyping(page, emailInputSelector, config.loginCredentials.email);

        // Verify email input
        const emailValue = await page.evaluate((selector) => {
            const input = document.querySelector(selector);
            return input ? input.value : null;
        }, emailInputSelector);
        console.log('Email input value:', emailValue);
        if (emailValue !== config.loginCredentials.email) {
            throw new Error('Email input was not filled correctly');
        }

        await page.screenshot({ path: 'debug_email_entered.png' });

        // Click "Get code" link
        console.log('Clicking "Get code" link...');
        const getCodeSelector = 'a.verifycodepart_link__3dxq2w.anchorlink_anchor__1gttsn';
        await page.waitForSelector(getCodeSelector, { visible: true, timeout: 10000 });
        const getCodeBox = await page.evaluate((selector) => {
            const link = document.querySelector(selector);
            if (link && link.offsetParent !== null) {
                const box = link.getBoundingClientRect();
                return { x: box.x + box.width / 2, y: box.y + box.height / 2 };
            }
            return null;
        }, getCodeSelector);
        if (!getCodeBox) {
            throw new Error('Failed to find or click "Get code" link');
        }
        await simulateHumanMouse(page, getCodeBox.x, getCodeBox.y);
        console.log('✅ Successfully clicked "Get code" link');
        await delay(2000 + Math.random() * 1000);

        await page.screenshot({ path: 'debug_get_code_clicked.png' });

        // **ENHANCED CAPTCHA SOLVING**
        console.log('🤖 Starting automated CAPTCHA solving...');
        const captchaSolved = await solveCaptcha(page);
        if (!captchaSolved) {
            throw new Error('Failed to solve CAPTCHA automatically and manually');
        }
        console.log('✅ CAPTCHA solving completed successfully!');

        // Wait a bit after CAPTCHA solving
        await delay(3000);

        // Check if verification code request was successful
        await page.screenshot({ path: 'debug_after_captcha.png' });

        // Fetch verification code from Gmail
        console.log('Fetching verification code from Gmail...');
        let verificationCode;
        let attempts = 0;
        const maxAttempts = 5; // Increased attempts

        while (attempts < maxAttempts) {
            try {
                await delay(3000); // Wait before each attempt
                verificationCode = await getVerificationCode();
                console.log('Verification code retrieved:', verificationCode);
                break;
            } catch (error) {
                attempts++;
                console.error(`Attempt ${attempts} failed to get verification code:`, error.message);
                if (attempts === maxAttempts) {
                    throw new Error('Failed to retrieve verification code after multiple attempts');
                }
                await delay(5000);
            }
        }

        // Enter verification code
        console.log('Entering verification code...');
        const codeInputSelector = 'input[placeholder="Verification code"]';
        await page.waitForSelector(codeInputSelector, { visible: true, timeout: 15000 });
        
        // Clear any existing value first
        await page.click(codeInputSelector, { clickCount: 3 });
        await page.keyboard.press('Backspace');
        
        await simulateHumanTyping(page, codeInputSelector, verificationCode);

        // Verify code was entered correctly
        const enteredCode = await page.evaluate((selector) => {
            const input = document.querySelector(selector);
            return input ? input.value : null;
        }, codeInputSelector);
        console.log('Verification code entered:', enteredCode);

        await page.screenshot({ path: 'debug_code_entered.png' });

        // Click "Continue" button
        console.log('Clicking "Continue" button...');
        const continueButtonSelector = 'form.controlledfeild_form___jx_im button.byverifycodeandemail_button__2xztb4';
        await page.waitForSelector(continueButtonSelector, { visible: true, timeout: 10000 });
        
        // Wait for button to be enabled
        await page.waitForFunction(
            selector => {
                const button = document.querySelector(selector);
                return button && !button.disabled;
            },
            { timeout: 10000 },
            continueButtonSelector
        );
        
        const continueBox = await page.evaluate((selector) => {
            const button = document.querySelector(selector);
            if (button && !button.disabled) {
                const box = button.getBoundingClientRect();
                return { x: box.x + box.width / 2, y: box.y + box.height / 2 };
            }
            return null;
        }, continueButtonSelector);
        
        if (!continueBox) {
            throw new Error('Failed to find or click "Continue" button');
        }
        
        await simulateHumanMouse(page, continueBox.x, continueBox.y);
        console.log('✅ Successfully clicked "Continue" button');

        // Wait for login completion
        await delay(5000);
        await page.screenshot({ path: 'debug_login_complete.png' });

        // Check for successful login
        const isLoggedIn = await page.evaluate(() => {
            // Check for login success indicators
            const userProfile = document.querySelector('[class*="profile"], [class*="user"], [class*="avatar"]');
            const loginForm = document.querySelector('form[class*="login"]');
            const errorMessage = document.querySelector('[class*="error"], [class*="failed"]');
            
            return {
                hasUserProfile: !!userProfile,
                hasLoginForm: !!loginForm,
                hasError: !!errorMessage,
                currentUrl: window.location.href
            };
        });
        
        console.log('Login status check:', isLoggedIn);

        if (isLoggedIn.hasError) {
            throw new Error('Login failed with error message displayed');
        }

        if (!isLoggedIn.hasLoginForm && (isLoggedIn.hasUserProfile || isLoggedIn.currentUrl.includes('event.realme.com'))) {
            console.log('✅ Login appears successful!');
        } else {
            console.log('⚠️ Login status unclear, continuing...');
        }

        // Log cookies for debugging
        const cookies = await page.cookies();
        console.log('Cookies after login:', JSON.stringify(cookies.map(c => ({name: c.name, domain: c.domain})), null, 2));

        console.log('🎉 Login process completed! Browser will remain open for debugging.');
        console.log('Check the screenshots in the current directory for step-by-step verification.');
        
        return true;

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
        // Keep browser open for debugging
        console.log('Browser will remain open. Close it manually when done debugging.');
        // if (browser) await browser.close();
    }
}

// Run the login function with better error handling
if (require.main === module) {
    loginWithEmailOTP()
        .then(() => {
            console.log('🎉 Login script executed successfully!');
        })
        .catch(error => {
            console.error('💥 Fatal error in login process:', error.message);
            console.error('Stack trace:', error.stack);
            process.exit(1);
        });
}

module.exports = { loginWithEmailOTP };