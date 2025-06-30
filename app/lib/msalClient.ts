import { PublicClientApplication, AccountInfo, AuthenticationResult } from '@azure/msal-browser';

// MSAL configuration for Azure AD app registration
export const msalConfig = {
  auth: {
    clientId: process.env.NEXT_PUBLIC_AZURE_AD_CLIENT_ID || '',
    authority: process.env.NEXT_PUBLIC_AZURE_AD_AUTHORITY || 'https://login.microsoftonline.com/common',
    redirectUri: typeof window !== 'undefined' ? window.location.origin : '',
  },
  cache: {
    cacheLocation: 'localStorage',
    storeAuthStateInCookie: false,
  },
};

export const loginRequest = {
  scopes: [
    'openid',
    'profile',
    'email',
    'https://api.bap.microsoft.com/.default',
  ],
};

export const msalInstance = new PublicClientApplication(msalConfig);

/**
 * Acquire a delegated access token for Power Platform API using MSAL.
 * If the user is not signed in, triggers interactive login.
 * @returns Access token string
 */
export async function getDelegatedPowerPlatformAccessToken(): Promise<string> {
  const accounts = msalInstance.getAllAccounts();
  let account: AccountInfo | undefined = accounts[0];

  if (!account) {
    const loginResponse = await msalInstance.loginPopup(loginRequest);
    account = loginResponse.account;
  }

  if (!account) throw new Error('No account found after login.');

  const response: AuthenticationResult = await msalInstance.acquireTokenSilent({
    ...loginRequest,
    account,
  }).catch(async () => {
    // Fallback to interactive if silent fails
    return msalInstance.acquireTokenPopup(loginRequest);
  });

  if (!response || !response.accessToken) throw new Error('Failed to acquire delegated access token.');
  return response.accessToken;
}
