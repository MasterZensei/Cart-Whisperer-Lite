import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 bg-gradient-to-b from-white to-gray-100">
      <div className="max-w-4xl w-full space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">Cart Whisperer</h1>
          <p className="mt-4 text-xl text-gray-500">AI-powered abandoned cart recovery for Shopify stores</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Smart Recovery</CardTitle>
              <CardDescription>AI-generated emails that convert abandoned carts into sales</CardDescription>
            </CardHeader>
            <CardContent>
              <p>
                Our AI analyzes customer behavior, product details, and purchase history to craft personalized recovery
                emails that resonate with your customers.
              </p>
            </CardContent>
            <CardFooter>
              <Button asChild className="w-full">
                <Link href="/dashboard">Get Started</Link>
              </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Performance Analytics</CardTitle>
              <CardDescription>Track your recovery rate and optimize campaigns</CardDescription>
            </CardHeader>
            <CardContent>
              <p>
                Monitor the performance of your recovery campaigns with detailed analytics. See which messages work best
                and continuously improve your results.
              </p>
            </CardContent>
            <CardFooter>
              <Button asChild variant="outline" className="w-full">
                <Link href="/dashboard/analytics">View Analytics</Link>
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </main>
  )
}
