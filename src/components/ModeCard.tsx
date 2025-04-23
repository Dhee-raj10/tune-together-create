
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";

interface ModeCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  features: string[];
  linkTo: string;
  buttonText: string;
}

export function ModeCard({ title, description, icon, features, linkTo, buttonText }: ModeCardProps) {
  return (
    <Card className="flex flex-col overflow-hidden border border-border/40 bg-background/60 transition-all hover:shadow-md">
      <CardHeader className="pb-4">
        <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-music-100 text-music-400">
          {icon}
        </div>
        <CardTitle className="text-xl">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="flex-1">
        <ul className="space-y-2 text-sm">
          {features.map((feature, i) => (
            <li key={i} className="flex items-start">
              <CheckIcon className="mr-2 h-5 w-5 text-music-400 shrink-0" />
              <span>{feature}</span>
            </li>
          ))}
        </ul>
      </CardContent>
      <CardFooter>
        <Button asChild className="w-full bg-music-400 hover:bg-music-500">
          <Link to={linkTo}>{buttonText}</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}

function CheckIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}
