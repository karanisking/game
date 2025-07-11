const axios = require('axios');
const qs = require('querystring');

// Step 1: Initial GET request to login URL
const loginUrl = 'https://www.realme.com/in/login?cb=https://event.realme.com/in/realme-P3Series-FireYourBoss-2025/index.html';
const cookies = {
  '_gcl_au': '1.1.1947807806.1750950333',
  '_gid': 'GA1.2.1158945368.1750950334',
  '_fbp': 'fb.1.1750950334688.184795217386392754',
  'PHPSESSID': '4ike5all3qs8u7v5kkcmthrm5i',
  'accessToken': 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJsb2dpblNjaGVtZSI6IkEiLCJpZGMiOiJpbmRpYSIsImV4cCI6MTc1MTA0MTMyMSwidG9rZW5UeXBlIjoiQUNDRVNTX1RPS0VOIiwidGlkIjoiOFRDdlJDWWp2RWp0VHJCTjlRbUVBKy90Ry9iYTQ4T3dla0VpZzRtNGxaZFRLVEZ2U1paZ1NhZGprL1M2aUFiZGVYRUhRUldBdjduOFFNaE4rQjJsVTM4SEFPTUVSU3RuMFJuYy93czduVXc4SmlOKys5OVo0WUN3aUF0cEEyY1hPZTlxM2F3ZE9vWUdtbE9ZcnNVL090V1ZwRDBZZzM4dUo1RDQxNndDL2lXYTRvK0d4MFpGQXBQN3d0dXpaaXFrWm9oK1BjL2VXUXJRc2dXTG1NdUI1UT09IiwicmVmcmVzaFRva2VuIjoiTnRzVllkM0NncGlKWDI1eWFpMUJlUSJ9.L9ZajGrb8derkasyqsYPL3L0tbnlWP7G42Ajd0-sxZw',
  '_ga': 'GA1.1.1879940858.1750950334',
  '_ga_C9R87BNWFK': 'GS2.1.s1751039523$o15$g0$t1751039523$j60$l0$h0',
  '_ga_PY1R3QQ6DN': 'GS2.1.s1751039523$o15$g0$t1751039524$j59$l0$h0'
};

async function getAccessToken() {
  try {
    // Step 1: Hit login URL and follow redirects
    const loginResponse = await axios.get(loginUrl, {
      headers: {
        'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'accept-language': 'en-US',
        'user-agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1',
        'Cookie': Object.entries(cookies).map(([key, value]) => `${key}=${value}`).join('; ')
      },
      maxRedirects: 0 // Do not follow redirects automatically
    }).catch(err => {
      if (err.response && err.response.status === 302) {
        return { headers: err.response.headers };
      }
      throw err;
    });

    // Extract redirect URL
    const redirectUrl = loginResponse.headers.location;
    console.log('Redirect URL:', redirectUrl);

    // Step 2: Extract code from redirect URL (assuming code is in query params)
    const url = new URL(redirectUrl);
    const code = url.searchParams.get('code');
    if (!code) {
      throw new Error('No code found in redirect URL');
    }
    console.log('Authorization Code:', code);

    // Step 3: Request access token (replace with actual token endpoint)
    const tokenUrl = 'https://id.realme.com/apis/oauth/token'; // Hypothetical endpoint
    const tokenResponse = await axios.post(tokenUrl, qs.stringify({
      grant_type: 'authorization_code',
      code: code,
      client_id: 'YOUR_CLIENT_ID', // Replace with actual client_id
      client_secret: 'YOUR_CLIENT_SECRET', // Replace with actual client_secret
      redirect_uri: 'https://event.realme.com/in/realme-P3Series-FireYourBoss-2025/index.html'
    }), {
      headers: {
        'content-type': 'application/x-www-form-urlencoded',
        'accept': 'application/json',
        'bizappkey': 'LSAtxEduMCQnZGyhCtXRkS',
        'user-agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1',
        'x-businesssystem': 'REALME',
        'x-protocol-version': '1.0',
        'x-timezone': 'GMT+5.5',
        'Cookie': Object.entries(cookies).map(([key, value]) => `${key}=${value}`).join('; ')
      }
    });

    console.log('Access Token Response:', tokenResponse.data);

    // Step 4: Use access token for validate-password request (optional)
    const validatePasswordUrl = 'https://id.realme.com/apis/login/validate-password';
    const validateResponse = await axios.post(validatePasswordUrl, '<ENCRYPTED_JSON_PAYLOAD>', {
      headers: {
        'accept': 'application/encrypted-json;charset=UTF-8',
        'content-type': 'application/encrypted-json;charset=UTF-8',
        'bizappkey': 'LSAtxEduMCQnZGyhCtXRkS',
        'device_id': '2663ef53be95ab88575f0230bb3c2b4f',
        'x-session-ticket': '7+8EkrHQ3ed2OWLA97reL2YMSs6pEi4c341Fz3ANiKw=',
        'x-key': 'fq1JwI8Zb3hnrPFG4X7VpeXF8CrQLJYjn/ItjnU3QF5AFe0P0x10pysNclpgNWc8tO+V9jaSfjvxQGQ9NM8sTeRnUPdPV39hWk2Lse5eo5weNeEcb8KAziBiiClO8vAoxsTiFRD2bTUOcRtqnTtQw3PYB3tHU9hesGGKY6c14YI=',
        'Cookie': Object.entries(cookies).map(([key, value]) => `${key}=${value}`).join('; ')
      }
    });

    console.log('Validate Password Response:', validateResponse.data);
  } catch (error) {
    console.error('Error:', error.message, error.response?.data);
  }
}

getAccessToken();