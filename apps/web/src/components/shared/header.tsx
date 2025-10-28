import { Button } from "@repo/ui/components/button";

export function Header() {
  return (
    <div className="border-b border-secondary h-16">
      <div className="flex justify-between items-center container h-full">
        <h2 className="font-bold text-2xl text-primary-dark">Krea8 🚀</h2>
        <div className="flex gap-3">
          <Button variant="outline">Sign In</Button>
          <Button>Sign Up</Button>
        </div>
      </div>
    </div>
  );
}
