
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ModeCard } from "@/components/ModeCard";

const Explore = () => {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden py-20 md:py-32">
          <div className="absolute inset-0 bg-gradient-to-br from-music-400/20 via-background to-music-300/10" />
          <div className="container relative z-10">
            <div className="mx-auto max-w-3xl text-center">
              <h1 className="mb-6 text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
                <span className="bg-gradient-to-r from-music-400 to-music-300 bg-clip-text text-transparent">Explore</span>
                <span className="block mt-2">Choose Your Musical Journey</span>
              </h1>
              <p className="mb-8 text-xl text-muted-foreground">
                Select how you want to create and collaborate on your next musical project.
              </p>
            </div>
          </div>
          <div className="absolute inset-0 -z-10 h-full w-full bg-white [background:radial-gradient(125%_125%_at_50%_30%,#fff_40%,#8B5CF6_100%)]" />
        </section>

        {/* Project Modes Section */}
        <section className="py-16 md:py-24">
          <div className="container">
            <div className="mx-auto mb-12 max-w-3xl text-center">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
                Create a New Project
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                Choose how you want to work on your next musical masterpiece.
              </p>
            </div>
            <div className="grid gap-8 md:grid-cols-3">
              <ModeCard
                title="Solo Mode"
                description="Create and experiment on your own, at your own pace."
                icon={<UserIcon className="h-6 w-6" />}
                features={[
                  "Build your own tracks at your own pace",
                  "Access instruments, loops, and production tools",
                  "Save and revisit your projects anytime",
                ]}
                linkTo="/create/solo"
                buttonText="Start Solo Project"
              />
              <ModeCard
                title="Collaboration Mode"
                description="Team up with other musicians to create something amazing together."
                icon={<UsersIcon className="h-6 w-6" />}
                features={[
                  "Connect with musicians of complementary skills",
                  "Work asynchronously or in real-time",
                  "Share files, feedback, and ideas easily",
                ]}
                linkTo="/create/collaborate"
                buttonText="Find Collaborators"
              />
              <ModeCard
                title="Learning Mode"
                description="Improve your skills while creating with guidance and resources."
                icon={<BookOpenIcon className="h-6 w-6" />}
                features={[
                  "Access expert tutorials and creative walkthroughs",
                  "Get tips from professional musicians",
                  "Participate in feedback sessions and challenges",
                ]}
                linkTo="/create/learn"
                buttonText="Start Learning"
              />
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

function UserIcon(props: React.SVGProps<SVGSVGElement>) {
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
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

function UsersIcon(props: React.SVGProps<SVGSVGElement>) {
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
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

function BookOpenIcon(props: React.SVGProps<SVGSVGElement>) {
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
      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
    </svg>
  );
}

export default Explore;
