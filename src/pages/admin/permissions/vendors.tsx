// src/pages/admin/permissions/vendors.tsx
import { useList, useUpdate } from "@refinedev/core";
import { SubPage } from "@/components/layout";
import { Lead } from "@/components/reader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Badge,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Skeleton,
  Switch,
} from "@/components/ui";
import { Building2, Globe, Calendar } from "lucide-react";

type Vendor = {
  id: number;
  name: string;
  subdomain: string;
  is_active: boolean;
  created_at: string;
};

export const VendorManagement = () => {
  const { data: vendorsData, isLoading, refetch } = useList<Vendor>({
    resource: "vendors",
    pagination: { pageSize: 100 },
  });

  const { mutate: updateVendor, isLoading: updating } = useUpdate();

  const vendors = vendorsData?.data ?? [];

  const handleToggleActive = (vendorId: number, isActive: boolean) => {
    updateVendor(
      {
        resource: "vendors",
        id: vendorId,
        values: { is_active: isActive },
        successNotification: () => ({
          message: isActive ? "Vendor aktywowany" : "Vendor dezaktywowany",
          type: "success"
        }),
      },
      { onSuccess: () => refetch() }
    );
  };

  return (
    <SubPage>
      <Lead 
        title="Zarządzanie vendorami" 
        description="Przegląd i zarządzanie organizacjami w systemie"
      />

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Building2 className="w-5 h-5" />
              Lista vendorów
            </CardTitle>
            <Badge variant="outline">
              {vendors.length} vendorów
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              {[1, 2, 3].map(i => (
                <Skeleton key={i} className="h-16" />
              ))}
            </div>
          ) : vendors.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Building2 className="w-12 h-12 mx-auto mb-4 opacity-20" />
              <p>Brak vendorów w systemie</p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nazwa</TableHead>
                    <TableHead>Subdomena</TableHead>
                    <TableHead>Data utworzenia</TableHead>
                    <TableHead className="text-center">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {vendors.map(vendor => (
                    <TableRow key={vendor.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                            <Building2 className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <div className="font-medium">{vendor.name}</div>
                            <div className="text-xs text-muted-foreground">ID: {vendor.id}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Globe className="w-4 h-4 text-muted-foreground" />
                          <code className="text-sm">{vendor.subdomain}</code>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="w-4 h-4" />
                          {new Date(vendor.created_at).toLocaleDateString('pl-PL')}
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-2">
                          <Switch
                            checked={vendor.is_active}
                            onCheckedChange={(v) => handleToggleActive(vendor.id, v)}
                            disabled={updating}
                          />
                          <Badge variant={vendor.is_active ? "default" : "secondary"}>
                            {vendor.is_active ? "Aktywny" : "Nieaktywny"}
                          </Badge>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </SubPage>
  );
};