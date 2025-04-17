/* eslint-disable @typescript-eslint/no-explicit-any */
import axios, { AxiosError } from 'axios';

// Use relative URL to our own API proxy instead of the direct AdGuard URL
const API_BASE_URL = '/api/adguard';

const adguardApi = axios.create({
  baseURL: API_BASE_URL,
  // No need for auth here as our proxy will handle it
});

export interface AdGuardStatus {
  version: string;
  protection_enabled: boolean;
  dns_addresses: string[];
  running: boolean;
}

export interface AdGuardStats {
  num_dns_queries: number;
  num_blocked_filtering: number;
  num_replaced_safebrowsing: number;
  num_replaced_parental: number;
  avg_processing_time: number;
  time_units: string;
}

export interface FilteringStatus {
  enabled: boolean;
  filters: Array<{
    id: number;
    enabled: boolean;
    url: string;
    name: string;
    rules_count: number;
    last_updated: string;
  }>;
}

export interface QueryLogEntry {
  answer: any[];
  client: string;
  client_proto: string;
  elapsedMs: string;
  question: {
    class: string;
    host: string;
    type: string;
  };
  reason: string;
  status: string;
  time: string;
  upstream: string;
}

export interface Client {
  name: string;
  ids: string[];
  use_global_settings: boolean;
  filtering_enabled: boolean;
  parental_enabled: boolean;
  safebrowsing_enabled: boolean;
  safesearch_enabled: boolean;
  use_global_blocked_services: boolean;
  blocked_services: string[];
  upstreams: string[];
}

export const getStatus = async (): Promise<AdGuardStatus> => {
  try {
    const response = await adguardApi.get('/status');
    return response.data;
  } catch (error) {
    console.error('Error fetching AdGuard status:', error);
    throw error;
  }
};

export const getStats = async (): Promise<AdGuardStats> => {
  try {
    const response = await adguardApi.get('/stats');
    return response.data;
  } catch (error) {
    console.error('Error fetching AdGuard stats:', error);
    throw error;
  }
};

export const getFiltering = async (): Promise<FilteringStatus> => {
  try {
    const response = await adguardApi.get('/filtering/status');
    return response.data;
  } catch (error) {
    console.error('Error fetching filtering status:', error);
    if (axios.isAxiosError(error)) {
      if (error.response) {
        console.error('Response status:', error.response.status);
      }
    }
    throw error;
  }
};

export const toggleProtection = async (enabled: boolean): Promise<void> => {
  try {
    await adguardApi.post('/filtering/status', { enabled });
  } catch (error) {
    console.error('Error toggling protection:', error);
    throw error;
  }
};

export const getQueryLog = async (params: { limit?: number; offset?: number } = {}): Promise<{ data: QueryLogEntry[] }> => {
  try {
    const response = await adguardApi.get('/querylog', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching query log:', error);
    throw error;
  }
};

export const addBlockedDomain = async (domain: string): Promise<void> => {
  try {
    // The AdGuard API expects a specific format for filtering rules
    const rule = `||${domain}^$important`;
    console.log(`Adding domain to blocklist: ${domain}`);
    
    const response = await adguardApi.post('/filtering/add_url', {
      name: `Custom rule for ${domain}`,
      url: rule,
    });
    
    console.log('Response from add_url:', response.data);
    
    // If we get here, the request was successful
    return;
  } catch (error) {
    console.error('Error adding blocked domain:', error);
    // Type guard to check if error is an AxiosError
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError;
      if (axiosError.response) {
        console.error('Response data:', axiosError.response.data);
        console.error('Response status:', axiosError.response.status);
      }
    }
    throw error;
  }
};

// Add these new interfaces
export interface WhoisInfo {
  country?: string;
  orgname?: string;
}

export interface AutoClient {
  whois_info: WhoisInfo;
  ip: string;
  name: string;
  source: string;
}

export interface ClientsResponse {
  clients: Client[] | null;
  auto_clients: AutoClient[];
  supported_tags: string[];
}

// Update the getClients function
export const getClients = async (): Promise<ClientsResponse> => {
  try {
    const response = await adguardApi.get('/clients');
    return response.data;
  } catch (error) {
    console.error('Error fetching clients:', error);
    throw error;
  }
};

export const getDhcpStatus = async (): Promise<any> => {
  try {
    const response = await adguardApi.get('/dhcp/status');
    return response.data;
  } catch (error) {
    console.error('Error fetching DHCP status:', error);
    throw error;
  }
};

// Add these interfaces and functions to your existing adguardService.ts file

export interface BlockedService {
  id: string;
  name: string;
  icon_svg: string;
  rules: string[];
}

export interface BlockedServicesResponse {
  blocked_services: BlockedService[];
}

export const getBlockedServices = async (): Promise<BlockedServicesResponse> => {
  try {
    const response = await adguardApi.get('/blocked_services/all');
    return response.data;
  } catch (error) {
    console.error('Error fetching blocked services:', error);
    throw error;
  }
};

export const getEnabledBlockedServices = async (): Promise<string[]> => {
  try {
    const response = await adguardApi.get('/blocked_services/list');
    return response.data;
  } catch (error) {
    console.error('Error fetching enabled blocked services:', error);
    throw error;
  }
};

export const setBlockedServices = async (services: string[]): Promise<void> => {
  try {
    await adguardApi.post('/blocked_services/set', services);
  } catch (error) {
    console.error('Error setting blocked services:', error);
    throw error;
  }
};