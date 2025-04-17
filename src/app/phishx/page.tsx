'use client';

import { useState, useEffect } from 'react';
import { 
  getStatus, 
  getStats, 
  getFiltering, 
  toggleProtection, 
  getQueryLog,
  addBlockedDomain,
  getClients,
} from '@/services/adguardService';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { RefreshCw } from "lucide-react";

interface DNSAnswer {
  type: string;
  value: string;
  ttl: number;
}

interface WhoisInfo {
  country?: string;
  orgname?: string;
}

interface ClientInfo {
  whois?: WhoisInfo;
  name?: string;
  disallowed_rule?: string;
  disallowed?: boolean;
}

interface DNSQuestion {
  class: string;
  name: string;  // Using name consistently
  type: string;
}

interface FilterRule {
  filter_list_id: number;
  text: string;
}

interface QueryLogEntry {
  answer: DNSAnswer[];
  answer_dnssec?: boolean;
  cached?: boolean;
  client: string;
  client_info?: ClientInfo;
  client_proto: string;
  elapsedMs: string;
  filterId?: number;
  question: {
    class: string;
    name: string;  // Using name instead of host
    type: string;
  };
  reason: string;
  rule?: string;
  rules?: FilterRule[];
  status: string;
  time: string;
  upstream: string;
}

interface Status {
  version: string;
  protection_enabled: boolean;
  running: boolean;
}

interface Stats {
  num_dns_queries: number;
  num_blocked_filtering: number;
  avg_processing_time: number;
  time_units: string;
}

interface FilteringStatus {
  enabled: boolean;
}

interface Client {
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

interface DNSInfo {
  upstream_dns: string[];
  bootstrap_dns: string[];
  protection_enabled: boolean;
  ratelimit: number;
  blocking_mode: string;
  blocking_ipv4: string;
  blocking_ipv6: string;
  edns_cs_enabled: boolean;
  dnssec_enabled: boolean;
  disable_ipv6: boolean;
  cache_size: number;
  cache_ttl_min: number;
  cache_ttl_max: number;
  upstream_mode: string;
}

interface AutoClient {
  whois_info: WhoisInfo;
  ip: string;
  name: string;
  source: string;
}

// Update the ClientsData interface to match the response
interface ClientsData {
  clients: Client[] | null;
  auto_clients: AutoClient[] | null;
  supported_tags: string[] | null;
}

export default function AdGuardDashboard() {
  const [status, setStatus] = useState<Status | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [filtering, setFiltering] = useState<FilteringStatus | null>(null);
  const [queryLog, setQueryLog] = useState<QueryLogEntry[]>([]);
  const [clientsData, setClientsData] = useState<ClientsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newBlockedDomain, setNewBlockedDomain] = useState('');
  const [dnsInfo, setDnsInfo] = useState<DNSInfo | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [statusData, statsData, filteringData, queryLogData, clientsData, dnsInfoData] = await Promise.all([
        getStatus(),
        getStats(),
        getFiltering(),
        getQueryLog({ limit: 100 }),
        getClients(),
        fetch('/api/adguard/dns_info').then(res => res.json())
      ]);
  
      setStatus(statusData);
      setStats(statsData);
      setFiltering(filteringData);
      // Transform the query log data to match our interface
      const transformedQueryLog = (queryLogData?.data || []).map((log: any) => ({
        ...log,
        question: {
          ...log.question,
          name: log.question.host || log.question.name // Handle both host and name properties
        }
      }));
      setQueryLog(transformedQueryLog);
      setClientsData({
        clients: clientsData?.clients || null,
        auto_clients: clientsData?.auto_clients || null,
        supported_tags: clientsData?.supported_tags || null
      });
      setDnsInfo(dnsInfoData);
    } catch (err) {
      setError('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const handleProtectionToggle = async (checked: boolean) => {
    try {
      await toggleProtection(checked);
      setFiltering(prev => prev ? { ...prev, enabled: checked } : null);
    } catch (err) {
      setError('Failed to toggle protection');
    }
  };

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <div className="animate-spin">
          <RefreshCw className="h-8 w-8" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Overview</h1>
        <Button variant="outline" size="icon" onClick={fetchData}>
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="protection">DNS Info</TabsTrigger>
          <TabsTrigger value="querylog">Query Log</TabsTrigger>
          <TabsTrigger value="clients">Clients</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span>Protection</span>
                  <Switch
                    checked={filtering?.enabled}
                    onCheckedChange={handleProtectionToggle}
                  />
                </div>
                <div className="flex justify-between items-center">
                  <span>Version</span>
                  <Badge variant="secondary">{status?.version}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span>DNS Server</span>
                  <Badge variant={status?.running ? "secondary" : "destructive"}>
                    {status?.running ? "Running" : "Stopped"}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Statistics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span>Total DNS Queries</span>
                  <Badge variant="secondary">
                    {stats?.num_dns_queries.toLocaleString()}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span>Blocked Queries</span>
                  <Badge variant="secondary">
                    {stats?.num_blocked_filtering.toLocaleString()}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span>Average Processing Time</span>
                  <Badge variant="secondary">
                    {`${stats?.avg_processing_time} ${stats?.time_units}`}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="protection" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>DNS Settings</CardTitle>
                <CardDescription>Current DNS configuration</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span>Protection Status</span>
                    <Badge variant={dnsInfo?.protection_enabled ? "secondary" : "destructive"}>
                      {dnsInfo?.protection_enabled ? "Enabled" : "Disabled"}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Blocking Mode</span>
                    <Badge variant="outline">{dnsInfo?.blocking_mode}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Rate Limit</span>
                    <Badge variant="outline">{dnsInfo?.ratelimit} rps</Badge>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Upstream DNS Servers</h4>
                  <div className="bg-muted rounded-md p-2">
                    {dnsInfo?.upstream_dns.map((dns, index) => (
                      <div key={index} className="text-sm">{dns}</div>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Bootstrap DNS Servers</h4>
                  <div className="bg-muted rounded-md p-2">
                    {dnsInfo?.bootstrap_dns.map((dns, index) => (
                      <div key={index} className="text-sm">{dns}</div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Advanced Settings</CardTitle>
                <CardDescription>DNS protocol and cache settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span>DNSSEC</span>
                    <Badge variant={dnsInfo?.dnssec_enabled ? "secondary" : "outline"}>
                      {dnsInfo?.dnssec_enabled ? "Enabled" : "Disabled"}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>EDNS Client Subnet</span>
                    <Badge variant={dnsInfo?.edns_cs_enabled ? "secondary" : "outline"}>
                      {dnsInfo?.edns_cs_enabled ? "Enabled" : "Disabled"}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>IPv6 Disabled</span>
                    <Badge variant={dnsInfo?.disable_ipv6 ? "secondary" : "outline"}>
                      {dnsInfo?.disable_ipv6 ? "Yes" : "No"}
                    </Badge>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Cache Configuration</h4>
                  <div className="space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Cache Size</span>
                      <span className="text-sm">{dnsInfo?.cache_size} entries</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Min TTL</span>
                      <span className="text-sm">{dnsInfo?.cache_ttl_min} seconds</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Max TTL</span>
                      <span className="text-sm">{dnsInfo?.cache_ttl_max} seconds</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="querylog">
          <Card>
            <CardHeader>
              <CardTitle>Query Log</CardTitle>
              <CardDescription>Recent DNS queries and their status</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[600px]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Time</TableHead>
                      <TableHead>Domain</TableHead>
                      <TableHead>Client</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {queryLog.map((log, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          {new Date(log.time).toLocaleString()}
                        </TableCell>
                        <TableCell>{log.question.name}</TableCell>
                        <TableCell>
                          {log.client_info?.name || log.client}
                          {log.client_info?.whois?.country && (
                            <Badge variant="outline" className="ml-2">
                              {log.client_info.whois.country}
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>{log.question.type}</TableCell>
                        <TableCell>
                          <Badge 
                            variant={log.reason === "FilteredBlackList" ? "destructive" : "secondary"}
                          >
                            {log.reason}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="clients">
          <Card>
            <CardHeader>
              <CardTitle>Connected Clients</CardTitle>
              <CardDescription>List of all clients connected to AdGuard Home</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[600px]">
                <div className="space-y-8">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Persistent Clients</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {clientsData?.clients?.map((client, index) => (
                        <Card key={index}>
                          <CardHeader>
                            <CardTitle className="text-base">{client.name}</CardTitle>
                            <CardDescription>
                              {client.ids.join(', ')}
                            </CardDescription>
                          </CardHeader>
                          <CardContent className="space-y-2">
                            <div className="flex justify-between items-center">
                              <span>Filtering</span>
                              <Badge variant={client.filtering_enabled ? "secondary" : "outline"}>
                                {client.filtering_enabled ? "Enabled" : "Disabled"}
                              </Badge>
                            </div>
                            <div className="flex justify-between items-center">
                              <span>Safe Browsing</span>
                              <Badge variant={client.safebrowsing_enabled ? "secondary" : "outline"}>
                                {client.safebrowsing_enabled ? "Enabled" : "Disabled"}
                              </Badge>
                            </div>
                            <div className="flex justify-between items-center">
                              <span>Safe Search</span>
                              <Badge variant={client.safesearch_enabled ? "secondary" : "outline"}>
                                {client.safesearch_enabled ? "Enabled" : "Disabled"}
                              </Badge>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Auto-detected Clients</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {clientsData?.auto_clients?.map((client, index) => (
                        <Card key={index}>
                          <CardHeader>
                            <CardTitle className="text-base">{client.name}</CardTitle>
                            <CardDescription>{client.ip}</CardDescription>
                          </CardHeader>
                          <CardContent className="space-y-2">
                            <div className="flex justify-between items-center">
                              <span>Source</span>
                              <Badge variant="outline">{client.source}</Badge>
                            </div>
                            {client.whois_info && (
                              <>
                                <div className="flex justify-between items-center">
                                  <span>Organization</span>
                                  <span className="text-sm">{client.whois_info.orgname}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                  <span>Country</span>
                                  <Badge variant="outline">{client.whois_info.country}</Badge>
                                </div>
                              </>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}