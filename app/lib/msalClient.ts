
import { PublicClientApplication, AccountInfo, AuthenticationResult } from '@azure/msal-browser';


type MsalConfigParams = {
  clientId: string;
  tenantId: string;
};

const loginRequest = {
  scopes: [
    'openid',
    'profile',
    'email',
    'https://api.bap.microsoft.com/.default',
  ],
};

/**
 * Initializes and returns a singleton MSAL PublicClientApplication instance with dynamic config.
 * @param clientId Azure AD Application (client) ID
 * @param tenantId Azure AD Tenant ID
 */
export async function getMsalInstanceWithConfig({ clientId, tenantId }: MsalConfigParams): Promise<PublicClientApplication> {
  if (typeof window === 'undefined') {
    throw new Error('MSAL PublicClientApplication must only be initialized on the client');
  }
  const authority = `https://login.microsoftonline.com/${tenantId}`;
  const msalConfig = {
    auth: {
      clientId,
      authority,
      redirectUri: window.location.origin,
    },
    cache: {
      cacheLocation: 'localStorage',
      storeAuthStateInCookie: false,
    },
  };
  // Use a unique key per config to support multi-tenant scenarios
  const instanceKey = `__msalInstance_${clientId}_${tenantId}`;
  // @ts-ignore
  if (!window[instanceKey]) {
    // @ts-ignore
    window[instanceKey] = new PublicClientApplication(msalConfig);
    // @ts-ignore
    window[`${instanceKey}Initialized`] = false;
  }
  // @ts-ignore
  if (!window[`${instanceKey}Initialized`]) {
    // @ts-ignore
    await window[instanceKey].initialize();
    // @ts-ignore
    window[`${instanceKey}Initialized`] = true;
  }
  // @ts-ignore
  return window[instanceKey];
}

// ...existing code...

/**
 * Acquire a delegated access token for Power Platform API using MSAL.
 * If the user is not signed in, triggers interactive login.
 * @param clientId Azure AD Application (client) ID
 * @param tenantId Azure AD Tenant ID
 * @returns Access token string
 */
export async function getDelegatedPowerPlatformAccessToken(clientId: string, tenantId: string): Promise<string> {
  if (typeof window === 'undefined') {
    throw new Error('getDelegatedPowerPlatformAccessToken must only be called on the client');
  }
  const msalInstance = await getMsalInstanceWithConfig({ clientId, tenantId });
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
