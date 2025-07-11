try {
    require('node-fetch');
    require('jsrsasign');
    require('crypto');
    require('punycode'); // Optional: for punycode warning suppression
    console.log('All dependencies loaded successfully.');
} catch (error) {
    console.error('Dependency error:', error.message);
    process.exit(1);
}

const fetch = require('node-fetch');
const crypto = require('crypto');
const jsrsasign = require('jsrsasign');

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
    cookies: '_gcl_au=1.1.1991939292.1750258149; _fbp=fb.1.1750258151332.980576735456533753; _gid=GA1.2.616646524.1751279054; _dx_uzZo5y=d798c47029cc1f956101f24cc5d116eee9fda1cb80adaaf82658bfb869eb10362d0d6455; _ga_68034Z2JQR=GS2.1.s1751450043$o1$g1$t1751450587$j60$l0$h0; _ga_1DMFLV0HBJ=GS2.1.s1751725747$o1$g1$t1751725771$j36$l0$h0; _ga_6K8YNJ7DDV=GS2.2.s1751725651$o2$g1$t1751725778$j29$l0$h0; _ga_FDYPQD4D0C=GS2.1.s1751725650$o4$g1$t1751725832$j60$l0$h0; PHPSESSID=l4b5d2e26n564829blejcbjtej; acIdAuthSession=Dgs-Tz5SYN7YnEdZy0QVPEkSfUomiJsDOQDDirlzXh0ZCcd5yUDp-KpMO0gkixDlUSQedmSMh_w; _clck=1stfyvp%7C2%7Cfxi%7C0%7C2014; accessToken=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJsb2dpblNjaGVtZSI6IkEiLCJpZGMiOiJpbmRpYSIsImV4cCI6MTc1MjIwNTUwNSwidG9rZW5UeXBlIjoiQUNDRVNTX1RPS0VOIiwidGlkIjoiOFRDdlJDWWp2RWp0VHJCTjlRbUVBOS9EQVhjYnRxa2h2YStEMzZIWTJZRnpXQzY2bnVMWlAvbkxhVVlBaGpVOURHL0FLYWwzV0hWSHdjeW5jZWlHNmd0ZGZVdWszS2dpUTJkK3dwOXEwVW84SmlOKys5OVo0WUN3aUF0cEEyY1hPZTlxM2F3ZE9vWUdtbE9ZcnNVL090V1ZwRDBZZzM4dUo1RDQxNndDL2lVdG0yZWNKekZTVWt2bDZndVRiV3A2ZmF4N1JXZFJ3SFdXSmZPMEd2S1NNdz09IiwicmVmcmVzaFRva2VuIjoiUTRGYmMyd0pWaW96S3NFRjRnQ0hFayJ9.RaHS5nIRUU0KDcxeK5DGhGx_XjSLkPvw9xA2hYTFR2Q; _ga=GA1.1.174272760.1750258110; _ga_C9R87BNWFK=GS2.1.s1752203688$o170$g1$t1752203707$j41$l0$h0; _clsk=1b01hh9%7C1752203708458%7C2%7C0%7Cq.clarity.ms%2Fcollect; _ga_PY1R3QQ6DN=GS2.1.s1752203688$o170$g1$t1752203709$j39$l0$h0; _dx_app_67005b61edc4fc50f973192416a2c6dc=687081d55RO6HVxM0EiThICop27hTe4UbgdPptJ1; _dx_captcha_vid=197F77B357C67005B61EDDE1B764257CD46E5A65D27E8268B291D%40ind',
    referer: 'https://event.realme.com/in/realme-P3Series-FireYourBoss-2025/index.html?source=WhatsApp_411&source=WhatsApp&source=WhatsApp&source=WhatsApp&source=WhatsApp&source=WhatsApp&source=WhatsApp&source=WhatsApp&source=WhatsApp&source=WhatsApp&source=WhatsApp&source=WhatsApp'
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

// Function to check JWT expiration
function isTokenExpired(token) {
    if (!token || token === '<REPLACE_WITH_NEW_ACCESS_TOKEN>') {
        console.error('Invalid or placeholder accessToken. Please update config.cookies with a valid accessToken obtained from https://www.realme.com/in/.');
        return true;
    }
    try {
        const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
        const exp = payload.exp * 1000; // Convert to milliseconds
        const now = Date.now();
        console.log('Token expiration check:', { exp: new Date(exp), now: new Date(now), isExpired: exp < now });

        if(exp < now){
            const now = new Date();
            console.log(now.toLocaleTimeString());
            process.exit(1);
        }
        return exp < now;
    } catch (error) {
        console.error('Error parsing JWT:', error.message);
        return true; // Assume expired if parsing fails
    }
}

// Function to perform auth API call
async function auth() {
    console.log('Starting auth request...');

    // Extract and validate accessToken
    const accessTokenMatch = config.cookies.match(/accessToken=([^;]+)/);
    if (!accessTokenMatch) {
        console.error('No accessToken found in cookies. Please update config.cookies with a valid accessToken.');
        throw new Error('No accessToken found in cookies');
    
    }
    const accessToken = accessTokenMatch[1];
    if (isTokenExpired(accessToken)) {
        console.error('accessToken is expired or invalid. Please obtain a new token from https://www.realme.com/in/');
        throw new Error('accessToken is expired or invalid');
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
    // Use numeric nonce as in ceatorSign
    const nonce = Math.floor(100032768 * Math.random()) + 32768;
    // Alternative: Hex nonce (uncomment to test)
    // const nonce = crypto.randomBytes(8).toString('hex');

    // Construct signString with sorted keys
    const signData = {
        timestamp: timestamp.toString(),
        nonce: nonce.toString() // Ensure nonce is a string
    };
    const signString = Object.keys(signData)
        .filter(key => key !== 'signature')
        .sort()
        .map(key => signData[key])
        .join('|') + `|${userToken}`;
    
    
    const signature = crypto.createHmac('sha256', config.secretKey).update(signString).digest('hex');
    console.log('signature:', signature); // Debug: Inspect the signature

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

// Function to check if error is a duplicate request error
function isDuplicateRequestError(error) {
    if (!error || !error.message) return false;
    
    // Check for common duplicate request error patterns
    const duplicatePatterns = [
        'duplicate request',
        ' Duplicate request',
        'request already processed',
        'already submitted',
        'duplicate submission',
        'game already saved',
        'already completed'
    ];
    
    const errorMessage = error.message.toLowerCase();
    return duplicatePatterns.some(pattern => errorMessage.includes(pattern));
}

// Function to perform saveGame API call with retry logic
async function saveGame(userToken, gameToken, retryCount = 0) {
    console.log(`Starting saveGame request... (attempt ${retryCount + 1})`);
    const timestamp = Math.floor(Date.now() / 1000);
    // Use numeric nonce for consistency with startGame
    const nonce = Math.floor(100032768 * Math.random()) + 32768;
    // Alternative: Hex nonce (uncomment to test)
    // const nonce = crypto.randomBytes(8).toString('hex');
    const randomNum = Math.floor(900 * Math.random()) + 100;
    const plainText = `${timestamp}.${randomNum}.success.${gameToken}`;

    // RSA encryption
    try {
        const rsaKey = jsrsasign.KEYUTIL.getKey(config.publicKey);

        const encrypted = crypto.publicEncrypt(
            {
                key: config.publicKey,
                padding: crypto.constants.RSA_PKCS1_PADDING
            },
            Buffer.from(plainText)
        );
        const result = encrypted.toString('base64');
        

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
      

        const signature = crypto.createHmac('sha256', config.secretKey).update(signString).digest('hex');
        // Alternative: Use crypto-js (uncomment to test)
        // const CryptoJS = require('jsrsasign').CryptoJS;
        // const signature = CryptoJS.HmacSHA256(signString, config.secretKey).toString();


        const body = new URLSearchParams({
            timestamp: timestamp.toString(),
            nonce: nonce.toString(),
            gametoken: gameToken,
            result: result,
            signature: signature
        });

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

        if (data.error !== 0) {
            console.error('saveGame error:', data.info);
            const error = new Error(data.info);
            
            // Check if this is a duplicate request error
            if (isDuplicateRequestError(error)) {
                console.log('Detected duplicate request error. Waiting 5 seconds before retry...');
                await new Promise(resolve => setTimeout(resolve, 5000));
                
                // Retry the saveGame call
                console.log('Retrying saveGame after duplicate request error...');
                return await saveGame(userToken, gameToken, retryCount + 1);
            }
            
            throw error;
        }

        console.log('saveGame successful:', JSON.stringify(data, null, 2));
        return data;
    } catch (error) {
        console.error('saveGame error:', error.message);
        
        // Check if this is a duplicate request error and we haven't retried too many times
        if (isDuplicateRequestError(error) && retryCount < 3) {
            console.log(`Detected duplicate request error. Waiting 5 seconds before retry... (attempt ${retryCount + 1})`);
            await new Promise(resolve => setTimeout(resolve, 5000));
            
            // Retry the saveGame call
            console.log('Retrying saveGame after duplicate request error...');
            return await saveGame(userToken, gameToken, retryCount + 1);
        }
        
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

            await new Promise(resolve => setTimeout(resolve, 1000));
            // Step 2: Start Game
            const gameToken = await startGame(userToken);
            console.log('Game token obtained:', gameToken);

            // Step 3: Wait for 309 seconds (5 minutes 9 seconds)
            console.log('Waiting for 309 seconds...');
            const now = new Date();
            console.log(now.toLocaleTimeString());

            await new Promise(resolve => setTimeout(resolve, 309000));

            // Step 4: Save Game (with retry logic for duplicate requests)
            const saveResult = await saveGame(userToken, gameToken);
            console.log('Game saved successfully:', saveResult);

        } catch (error) {
            console.error('Error in game loop:', error.message);
            // Wait before retrying to avoid rapid error loops
            await new Promise(resolve => setTimeout(resolve, 10000));
        }
    }
}

// Start the game loop
runGameLoop().catch(error => {
    console.error('Fatal error in game loop:', error.message);
    process.exit(1);
});