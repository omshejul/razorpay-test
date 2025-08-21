"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import PayButton from "@/components/razorpay/PayButton";
import { useState } from "react";

const plans = [
  {
    id: "basic",
    name: "Basic",
    price: 299,
    description: "Essential features for getting started",
  },
  {
    id: "pro",
    name: "Pro",
    price: 499,
    description: "Advanced features for professionals",
  },
  {
    id: "premium",
    name: "Premium",
    price: 999,
    description: "All features with priority support",
  },
];

export default function ProductPage() {
  const [selectedPlan, setSelectedPlan] = useState(plans[1]); // Default to Pro plan

  return (
    <div className="container mx-auto px-4 py-10 max-w-4xl">
      <div className="space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">Choose Your Plan</h1>
          <p className="text-muted-foreground">
            Unlock premium features for your account
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <Card
              key={plan.id}
              className={`cursor-pointer transition-all ${
                selectedPlan.id === plan.id
                  ? "ring-2 ring-primary border-primary"
                  : "hover:border-primary/50"
              }`}
              onClick={() => setSelectedPlan(plan)}
            >
              <CardHeader>
                <CardTitle className="text-xl">{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center space-y-2">
                  <p className="text-3xl font-bold">₹{plan.price}</p>
                  <p className="text-sm text-muted-foreground">per month</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Order Summary</CardTitle>
            <CardDescription>
              Review your selected plan before proceeding.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-start justify-between gap-6">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Selected Plan</p>
                <p className="text-base font-medium">{selectedPlan.name}</p>
                <p className="text-sm text-muted-foreground">
                  {selectedPlan.description}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Price</p>
                <p className="text-xl font-semibold">₹{selectedPlan.price}</p>
              </div>
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                You will be redirected to complete payment securely.
              </p>
              <PayButton amount={selectedPlan.price} />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
