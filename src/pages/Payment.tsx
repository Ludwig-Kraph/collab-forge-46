import Layout from "@/components/layout/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const Payment = () => {
  return (
    <Layout>
      <div className="container px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Make Payment</CardTitle>
            <CardDescription>Payment trigger functionality will be implemented in Phase 3</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Coming soon...</p>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Payment;
