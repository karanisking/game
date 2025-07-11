const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

puppeteer.use(StealthPlugin());

// Custom delay function
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

// Enhanced CAPTCHA detection
async function detectCaptchaType(page) {
    const captchaInfo = await page.evaluate(() => {
        // Check for sliding CAPTCHA
        const sliderCaptcha = document.querySelector('.captcha-slider-container, [class*="slider"], [class*="puzzle"]');
        const sliderImg = document.querySelector('img[src*="captcha"]');
        
        // Check for click-in-order CAPTCHA
        const clickCaptcha = document.querySelector('.captcha-click-order-container, [class*="click-order"], [class*="sequence"]');
        const multipleImages = document.querySelectorAll('img[src*="captcha"]').length > 1;
        
        // Get CAPTCHA iframe or container
        const captchaFrame = document.querySelector('iframe[src*="captcha"], [id*="captcha"], [class*="captcha"]');
        
        return {
            hasSlider: !!sliderCaptcha || (!!sliderImg && !multipleImages),
            hasClickOrder: !!clickCaptcha || multipleImages,
            captchaFrame: captchaFrame ? captchaFrame.src || captchaFrame.id : null,
            captchaImages: Array.from(document.querySelectorAll('img[src*="captcha"]')).map(img => img.src)
        };
    });
    
    console.log('CAPTCHA detection result:', captchaInfo);
    
    if (captchaInfo.hasSlider) return { type: 'slider', info: captchaInfo };
    if (captchaInfo.hasClickOrder) return { type: 'click-order', info: captchaInfo };
    return null;
}

// Solve sliding puzzle CAPTCHA
async function solveSlidingCaptcha(page, captchaInfo) {
    console.log('Attempting to solve sliding CAPTCHA...');
    
    try {
        // Take screenshot of the CAPTCHA area
        const captchaElement = await page.$('.captcha-slider-container, [class*="slider"], [class*="puzzle"]');
        if (!captchaElement) {
            throw new Error('Sliding CAPTCHA element not found');
        }
        
        const boundingBox = await captchaElement.boundingBox();
        await page.screenshot({
            path: 'captcha_sliding.png',
            clip: boundingBox
        });
        
        // Method 1: Simple sliding approach
        // Find the slider handle and the gap
        const sliderHandle = await page.$('.slider-handle, [class*="handle"], [class*="drag"]');
        if (sliderHandle) {
            const handleBox = await sliderHandle.boundingBox();
            
            // Try different sliding distances
            const slidingDistances = [100, 150, 200, 250, 300];
            
            for (const distance of slidingDistances) {
                console.log(`Trying sliding distance: ${distance}px`);
                
                // Reset slider position
                await page.mouse.move(handleBox.x + handleBox.width/2, handleBox.y + handleBox.height/2);
                await page.mouse.down();
                
                // Slide with human-like movement
                const steps = 20;
                for (let i = 1; i <= steps; i++) {
                    const currentDistance = (distance / steps) * i;
                    const randomOffset = (Math.random() - 0.5) * 3; // Small random offset
                    await page.mouse.move(
                        handleBox.x + handleBox.width/2 + currentDistance + randomOffset,
                        handleBox.y + handleBox.height/2 + (Math.random() - 0.5) * 2
                    );
                    await delay(50 + Math.random() * 50);
                }
                
                await page.mouse.up();
                await delay(2000);
                
                // Check if CAPTCHA is solved
                const isSolved = await page.evaluate(() => {
                    const successIndicator = document.querySelector('.captcha-success, [class*="success"], [class*="verified"]');
                    const captchaContainer = document.querySelector('.captcha-slider-container, [class*="slider"], [class*="puzzle"]');
                    return !!successIndicator || !captchaContainer;
                });
                
                if (isSolved) {
                    console.log('✅ Sliding CAPTCHA solved successfully!');
                    return true;
                }
            }
        }
        
        // Method 2: Image analysis approach (if simple sliding fails)
        console.log('Trying image analysis approach...');
        return await solveSlidingWithImageAnalysis(page, captchaInfo);
        
    } catch (error) {
        console.error('Error solving sliding CAPTCHA:', error.message);
        return false;
    }
}

// Advanced sliding CAPTCHA solver using image analysis
async function solveSlidingWithImageAnalysis(page, captchaInfo) {
    try {
        // This would require image processing libraries like sharp or canvas
        // For now, we'll use a probability-based approach
        
        const backgroundImg = await page.$('img[src*="captcha"]:first-of-type');
        const sliderImg = await page.$('img[src*="captcha"]:last-of-type');
        
        if (backgroundImg && sliderImg) {
            // Get image dimensions
            const bgDimensions = await page.evaluate(img => {
                return { width: img.naturalWidth, height: img.naturalHeight };
            }, backgroundImg);
            
            // Calculate probable gap position (usually around 60-80% of image width)
            const probableGapPosition = bgDimensions.width * (0.6 + Math.random() * 0.2);
            
            console.log(`Calculated gap position: ${probableGapPosition}px`);
            
            // Perform sliding
            const sliderHandle = await page.$('.slider-handle, [class*="handle"], [class*="drag"]');
            if (sliderHandle) {
                const handleBox = await sliderHandle.boundingBox();
                
                await page.mouse.move(handleBox.x + handleBox.width/2, handleBox.y + handleBox.height/2);
                await page.mouse.down();
                
                // Slide to calculated position
                const steps = 25;
                for (let i = 1; i <= steps; i++) {
                    const currentDistance = (probableGapPosition / steps) * i;
                    const randomOffset = (Math.random() - 0.5) * 2;
                    await page.mouse.move(
                        handleBox.x + handleBox.width/2 + currentDistance + randomOffset,
                        handleBox.y + handleBox.height/2 + (Math.random() - 0.5) * 1
                    );
                    await delay(40 + Math.random() * 40);
                }
                
                await page.mouse.up();
                await delay(2000);
                
                // Check if solved
                const isSolved = await page.evaluate(() => {
                    const successIndicator = document.querySelector('.captcha-success, [class*="success"], [class*="verified"]');
                    const captchaContainer = document.querySelector('.captcha-slider-container, [class*="slider"], [class*="puzzle"]');
                    return !!successIndicator || !captchaContainer;
                });
                
                return isSolved;
            }
        }
        
        return false;
    } catch (error) {
        console.error('Error in image analysis approach:', error.message);
        return false;
    }
}

// Solve click-in-order CAPTCHA
async function solveClickOrderCaptcha(page, captchaInfo) {
    console.log('Attempting to solve click-in-order CAPTCHA...');
    
    try {
        // Take screenshot for analysis
        await page.screenshot({ path: 'captcha_click_order.png' });
        
        // Get all CAPTCHA images
        const captchaImages = await page.evaluate(() => {
            const images = Array.from(document.querySelectorAll('img[src*="captcha"]'));
            return images.map((img, index) => ({
                index,
                src: img.src,
                boundingBox: {
                    x: img.getBoundingClientRect().x,
                    y: img.getBoundingClientRect().y,
                    width: img.getBoundingClientRect().width,
                    height: img.getBoundingClientRect().height
                }
            }));
        });
        
        console.log(`Found ${captchaImages.length} CAPTCHA images`);
        
        // Look for sequence indicators (numbers, arrows, etc.)
        const sequenceHints = await page.evaluate(() => {
            const hints = [];
            const elements = document.querySelectorAll('[class*="order"], [class*="sequence"], [class*="number"]');
            elements.forEach((el, index) => {
                const text = el.textContent.trim();
                const numbers = text.match(/\d+/g);
                if (numbers) {
                    hints.push({
                        element: index,
                        numbers: numbers.map(n => parseInt(n)),
                        boundingBox: {
                            x: el.getBoundingClientRect().x,
                            y: el.getBoundingClientRect().y,
                            width: el.getBoundingClientRect().width,
                            height: el.getBoundingClientRect().height
                        }
                    });
                }
            });
            return hints;
        });
        
        console.log('Sequence hints found:', sequenceHints);
        
        // Method 1: If sequence numbers are provided, follow them
        if (sequenceHints.length > 0) {
            const sortedHints = sequenceHints.sort((a, b) => a.numbers[0] - b.numbers[0]);
            
            for (const hint of sortedHints) {
                const centerX = hint.boundingBox.x + hint.boundingBox.width / 2;
                const centerY = hint.boundingBox.y + hint.boundingBox.height / 2;
                
                console.log(`Clicking sequence ${hint.numbers[0]} at (${centerX}, ${centerY})`);
                await page.mouse.click(centerX, centerY);
                await delay(500 + Math.random() * 500);
            }
        } else {
            // Method 2: Random clicking with pattern recognition
            console.log('No clear sequence found, trying pattern-based approach...');
            
            // Try common patterns: top-left to bottom-right, etc.
            const patterns = [
                // Top-left, top-right, bottom-left, bottom-right
                [0, 1, 2, 3],
                // Left to right, top to bottom
                [0, 2, 1, 3],
                // Circular pattern
                [0, 1, 3, 2]
            ];
            
            for (const pattern of patterns) {
                console.log(`Trying pattern: ${pattern}`);
                
                // Reset any previous attempts
                await page.reload({ waitUntil: 'networkidle2' });
                await delay(2000);
                
                // Click in pattern order
                for (const imageIndex of pattern) {
                    if (captchaImages[imageIndex]) {
                        const img = captchaImages[imageIndex];
                        const centerX = img.boundingBox.x + img.boundingBox.width / 2;
                        const centerY = img.boundingBox.y + img.boundingBox.height / 2;
                        
                        console.log(`Clicking image ${imageIndex} at (${centerX}, ${centerY})`);
                        await page.mouse.click(centerX, centerY);
                        await delay(800 + Math.random() * 400);
                    }
                }
                
                await delay(2000);
                
                // Check if solved
                const isSolved = await page.evaluate(() => {
                    const successIndicator = document.querySelector('.captcha-success, [class*="success"], [class*="verified"]');
                    const captchaContainer = document.querySelector('.captcha-click-order-container, [class*="click-order"], [class*="sequence"]');
                    return !!successIndicator || !captchaContainer;
                });
                
                if (isSolved) {
                    console.log('✅ Click-order CAPTCHA solved successfully!');
                    return true;
                }
            }
        }
        
        return false;
    } catch (error) {
        console.error('Error solving click-order CAPTCHA:', error.message);
        return false;
    }
}

// Main CAPTCHA solver function
async function solveCaptcha(page) {
    console.log('Starting CAPTCHA solving process...');
    
    try {
        // Wait a bit for CAPTCHA to fully load
        await delay(3000);
        
        // Detect CAPTCHA type
        const captchaDetection = await detectCaptchaType(page);
        
        if (!captchaDetection) {
            console.log('No CAPTCHA detected');
            return true;
        }
        
        console.log(`Detected CAPTCHA type: ${captchaDetection.type}`);
        
        let solved = false;
        const maxAttempts = 3;
        
        for (let attempt = 1; attempt <= maxAttempts; attempt++) {
            console.log(`CAPTCHA solving attempt ${attempt}/${maxAttempts}`);
            
            if (captchaDetection.type === 'slider') {
                solved = await solveSlidingCaptcha(page, captchaDetection.info);
            } else if (captchaDetection.type === 'click-order') {
                solved = await solveClickOrderCaptcha(page, captchaDetection.info);
            }
            
            if (solved) {
                console.log('✅ CAPTCHA solved successfully!');
                break;
            }
            
            if (attempt < maxAttempts) {
                console.log('CAPTCHA not solved, refreshing and trying again...');
                // Refresh CAPTCHA (if refresh button exists)
                const refreshButton = await page.$('[class*="refresh"], [class*="reload"], [title*="refresh"]');
                if (refreshButton) {
                    await refreshButton.click();
                    await delay(2000);
                }
            }
        }
        
        if (!solved) {
            console.log('❌ Failed to solve CAPTCHA automatically, falling back to manual solving...');
            return await handleManualCaptcha(page, captchaDetection.type);
        }
        
        return true;
        
    } catch (error) {
        console.error('Error in CAPTCHA solving process:', error.message);
        return false;
    }
}

// Fallback manual CAPTCHA handling
async function handleManualCaptcha(page, captchaType) {
    console.log(`Manual CAPTCHA solving required for ${captchaType} CAPTCHA. Please solve it within 60 seconds.`);
    await page.screenshot({ path: 'debug_captcha_manual.png' });
    console.log('Saved CAPTCHA screenshot to debug_captcha_manual.png');

    // Wait for CAPTCHA to disappear or be solved
    try {
        await page.waitForFunction(() => {
            const captchaContainer = document.querySelector('.captcha-slider-container, .captcha-click-order-container, [class*="captcha"]');
            const successIndicator = document.querySelector('.captcha-success, [class*="success"], [class*="verified"]');
            return !captchaContainer || !!successIndicator;
        }, { timeout: 60000 });
        
        console.log('CAPTCHA solved manually or disappeared.');
        return true;
    } catch (error) {
        console.error('Manual CAPTCHA solving timed out:', error.message);
        return false;
    }
}

// Export the solver function
module.exports = { solveCaptcha, detectCaptchaType };

// Usage example:
/*
// In your main login function, replace the CAPTCHA handling section with:
const captchaSolved = await solveCaptcha(page);
if (!captchaSolved) {
    throw new Error('Failed to solve CAPTCHA');
}
*/