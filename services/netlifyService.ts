
export interface NetlifySite {
  id: string;
  name: string;
  url: string;
  ssl_url: string;
  screenshot_url: string;
  updated_at: string;
  published_deploy?: {
    screenshot_url: string;
  };
}

export const fetchNetlifySites = async (token: string): Promise<NetlifySite[]> => {
  if (!token) return [];
  try {
    const response = await fetch('https://api.netlify.com/api/v1/sites', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    
    if (response.status === 401) {
      throw new Error('Unauthorized: Invalid Netlify Access Token.');
    }
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Netlify API error: ${response.status} ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error: any) {
    console.error('Netlify API Error Detail:', error);
    throw error; // Re-throw to allow the UI to display the specific error message
  }
};
