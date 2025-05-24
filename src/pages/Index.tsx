import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ModeCard } from "@/components/ModeCard";
import { ArtistCategory, DrumIcon, PianoIcon, GuitarIcon, MicrophoneIcon, HeadphonesIcon, NotesIcon } from "@/components/ArtistCategory";

const Index = () => {
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
                <span className="bg-gradient-to-r from-music-400 to-music-300 bg-clip-text text-transparent">TuneTogether</span>
                <span className="block mt-2">Create, Collaborate, and Learn Music Your Way</span>
              </h1>
              <p className="mb-8 text-xl text-muted-foreground">
                Whether you&apos;re collaborating with fellow musicians, working on solo projects, 
                or sharpening your skills, TuneTogether is your creative space to make music happen.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Button asChild size="lg" className="bg-music-400 hover:bg-music-500">
                  <Link to="/signup">Sign Up</Link>
                </Button>
                <Button asChild size="lg" variant="outline">
                  <Link to="/login">Log In</Link>
                </Button>
              </div>
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
                linkTo="/create/collaborate" // This should be /create/collaborate based on user intent and App.tsx
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
                linkTo="/create/learn" // This should be /create/learn based on user intent and App.tsx
                buttonText="Start Learning"
              />
            </div>
          </div>
        </section>

        {/* Artist Categories Section */}
        <section className="py-16 bg-music-100/30 md:py-24">
          <div className="container">
            <div className="mx-auto mb-12 max-w-3xl text-center">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Find Your Perfect Collaborator
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                Connect with artists specializing in different instruments and roles.
              </p>
            </div>
            <div className="flex flex-wrap justify-center gap-4">
              <ArtistCategory icon={<DrumIcon className="h-4 w-4" />} label="Drum Artists" />
              <ArtistCategory icon={<PianoIcon className="h-4 w-4" />} label="Piano Artists" />
              <ArtistCategory icon={<GuitarIcon className="h-4 w-4" />} label="Guitarists" />
              <ArtistCategory icon={<MicrophoneIcon className="h-4 w-4" />} label="Vocalists" />
              <ArtistCategory icon={<HeadphonesIcon className="h-4 w-4" />} label="Producers" />
              <ArtistCategory icon={<NotesIcon className="h-4 w-4" />} label="Composers" />
            </div>
            <div className="mt-12 text-center">
              <Button asChild className="bg-music-400 hover:bg-music-500">
                <Link to="#">Browse All Artists</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 md:py-24">
          <div className="container">
            <div className="mx-auto mb-12 max-w-3xl text-center">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Learn While You Create
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                Whether you&apos;re a beginner or looking to master your craft, TuneTogether helps you grow.
              </p>
            </div>
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
              <FeatureCard 
                icon={<VideoIcon />}
                title="Watch Live Collaborations"
                description="See how professional musicians work together in real-time sessions."
              />
              <FeatureCard 
                icon={<BookIcon />}
                title="Expert Tutorials"
                description="Access step-by-step guides from industry professionals."
              />
              <FeatureCard 
                icon={<MessageSquareIcon />}
                title="Feedback Sessions"
                description="Get constructive criticism to improve your compositions."
              />
              <FeatureCard 
                icon={<TrophyIcon />}
                title="Music Challenges"
                description="Participate in community challenges to push your creative boundaries."
              />
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-music-400 text-white md:py-24">
          <div className="container">
            <div className="mx-auto max-w-3xl text-center">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Ready to Make Music Together?
              </h2>
              <p className="mt-4 text-xl">
                Your sound, your way – start your first project now!
              </p>
              <div className="mt-8">
                <Button asChild size="lg" variant="secondary" className="bg-white text-music-400 hover:bg-gray-100">
                  <Link to="/signup">Create Your First Project</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="flex flex-col items-center text-center p-6 rounded-lg border bg-card text-card-foreground shadow-sm">
      <div className="mb-4 rounded-full bg-music-100 p-3 text-music-400">
        {icon}
      </div>
      <h3 className="mb-2 text-xl font-medium">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </div>
  );
}

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

function VideoIcon() {
  return (
    <svg
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
      <path d="M22 8.5a2.5 2.5 0 0 0-3.5-2.3L18 6.5l-6 4V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2v-4.5l6 4 .5.3a2.5 2.5 0 0 0 3.5-2.3z" />
    </svg>
  );
}

function BookIcon() {
  return (
    <svg
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
      <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
    </svg>
  );
}

function MessageSquareIcon() {
  return (
    <svg
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
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
}

function TrophyIcon() {
  return (
    <svg
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
      <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
      <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
      <path d="M4 22h16" />
      <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
      <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
      <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
    </svg>
  );
}

export default Index;
