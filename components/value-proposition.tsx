import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function ValueProposition() {
  return (
    <div className="mt-12 space-y-8">
      <h2 className="text-3xl font-bold tracking-tight text-center">Why Choose Cart Whisperer?</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Intelligent Recovery</CardTitle>
            <CardDescription>AI-powered abandoned cart emails</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm">
              Our AI analyzes customer behavior and product details to craft personalized recovery messages
              that have been proven to increase conversion rates by up to 25%.
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Easy Integration</CardTitle>
            <CardDescription>Seamless Shopify integration</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm">
              Connect your Shopify store in minutes with our one-click integration. No coding required,
              and we handle all the technical details for you.
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Increase Revenue</CardTitle>
            <CardDescription>Recover lost sales automatically</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm">
              The average store recovers 15% of abandoned carts with our solution, translating to
              thousands in additional revenue each month.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 