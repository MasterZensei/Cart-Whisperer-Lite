import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Lightbulb } from "lucide-react"

export function PerformanceTips() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Lightbulb className="mr-2 h-5 w-5 text-yellow-500" />
          Optimization Tips
        </CardTitle>
        <CardDescription>Improve your cart recovery rate with these best practices</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <h3 className="font-medium">Timing is Everything</h3>
            <p className="text-sm text-muted-foreground">
              Send your first recovery email 1-3 hours after cart abandonment for the highest conversion rates.
            </p>
          </div>

          <div>
            <h3 className="font-medium">Personalization Matters</h3>
            <p className="text-sm text-muted-foreground">
              Emails that include the customer's name and specific product details convert up to 26% better.
            </p>
          </div>

          <div>
            <h3 className="font-medium">Follow-Up Sequence</h3>
            <p className="text-sm text-muted-foreground">
              A series of 3 emails (1 hour, 24 hours, and 72 hours after abandonment) can increase recovery by 69%.
            </p>
          </div>

          <div>
            <h3 className="font-medium">Mobile Optimization</h3>
            <p className="text-sm text-muted-foreground">
              Over 60% of cart abandonment emails are opened on mobile devices. Ensure your emails are mobile-friendly.
            </p>
          </div>

          <div>
            <h3 className="font-medium">Clear Call-to-Action</h3>
            <p className="text-sm text-muted-foreground">
              A single, prominent CTA button increases click-through rates by up to 28% compared to multiple links.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
