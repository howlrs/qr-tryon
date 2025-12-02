import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4 text-center">
      <h1 className="text-5xl font-bold mb-6 tracking-tight">
        Manage with QR
      </h1>
      <p className="text-xl text-muted-foreground mb-8 max-w-md">
        Streamline your store management and enhance customer experience with our QR-based solution.
      </p>
      <Link
        href="/products"
        className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-full font-semibold hover:opacity-90 transition-opacity"
      >
        View Products <ArrowRight size={20} />
      </Link>
    </div>
  );
}
