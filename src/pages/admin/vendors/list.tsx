import { useTable } from "@refinedev/core";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building, Globe, Calendar } from "lucide-react";
import { FlexBox, GridBox } from "@/components/shared";
import { PaginationSwith } from "@/components/navigation";
import { Lead } from "@/components/reader";
import { useLoading } from "@/utility";
import { Badge, Input } from "@/components/ui";
import { SubPage } from "@/components/layout";

interface Vendor {
  id: number;
  name: string;
  subdomain: string;
  is_active: boolean;
  created_at: string;
}

export const VendorsList = () => {
  const {
    tableQuery: { data, isLoading, isError },
    current,
    setCurrent,
    pageSize,
    setFilters,
  } = useTable<Vendor>({
    sorters: {
      initial: [
        {
          field: "created_at",
          order: "desc",
        },
      ],
    },
  });
  
  const init = useLoading({ isLoading, isError });
  if (init) return init;

  return (
    <SubPage>
      <Lead
        title="Organizacje"
        description="Lista wszystkich organizacji w systemie"
      />

      <FlexBox>
        <Input
          placeholder="Szukaj organizacji..."
          className="max-w-sm"
          onChange={(e) => {
            setFilters([
              {
                operator: "or",
                value: [
                  {
                    field: "name",
                    operator: "contains",
                    value: e.target.value,
                  },
                  {
                    field: "subdomain",
                    operator: "contains",
                    value: e.target.value,
                  },
                ],
              },
            ]);
          }}
        />
      </FlexBox>

      <GridBox>
        {data?.data?.map((vendor) => (
          <Card key={vendor.id}>
            <CardHeader>
              <FlexBox>
                <CardTitle className="flex items-center gap-2">
                  <Building className="w-5 h-5" />
                  {vendor.name}
                </CardTitle>
                <Badge variant={vendor.is_active ? "default" : "secondary"}>
                  {vendor.is_active ? "Aktywna" : "Nieaktywna"}
                </Badge>
              </FlexBox>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Globe className="w-3 h-3" />
                <span>{vendor.subdomain}.example.com</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="w-3 h-3" />
                <span>Utworzono: {new Date(vendor.created_at).toLocaleDateString('pl-PL')}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </GridBox>

      <PaginationSwith
        current={current}
        pageSize={pageSize}
        total={data?.total || 0}
        setCurrent={setCurrent}
        itemName="organizacji"
      />
    </SubPage>
  );
};