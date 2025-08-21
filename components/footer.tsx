export function Footer() {
  return (
    <footer className="border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container max-w-4xl mx-auto px-4 py-8">
        <div className="flex flex-col items-center md:flex-row justify-end gap-8">
          <div className="space-y-4 w-max">
            <h3 className="text-lg font-semibold">Legal & Policies</h3>
            <p className="text-sm text-muted-foreground">
              Learn more about our policies and terms of service.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 w-full max-w-md px-4 text-center">
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Legal</h4>
              <ul className="space-y-1">
                <li>
                  <a
                    href="https://merchant.razorpay.com/policy/R7S7QKAASdLeE7/terms"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    Terms
                  </a>
                </li>
                <li>
                  <a
                    href="https://merchant.razorpay.com/policy/R7S7QKAASdLeE7/privacy"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    Privacy
                  </a>
                </li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Policies</h4>
              <ul className="space-y-1">
                <li>
                  <a
                    href="https://merchant.razorpay.com/policy/R7S7QKAASdLeE7/refund"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    Refunds
                  </a>
                </li>
                <li>
                  <a
                    href="https://merchant.razorpay.com/policy/R7S7QKAASdLeE7/shipping"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    Shipping
                  </a>
                </li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Support</h4>
              <ul className="space-y-1">
                <li>
                  <a
                    href="https://merchant.razorpay.com/policy/R7S7QKAASdLeE7/contact_us"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    Contact
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
        <div className=" border-t p-4 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} Arthkin. All rights reserved.
        </div>
    </footer>
  );
}
