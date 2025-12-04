import Link from "next/link";
import {
  Youtube,
  FileText,
  Image,
  Search,
  BarChart3,
  Video,
  Sparkles,
  Check,
  ArrowRight,
  Star,
} from "lucide-react";

export default function HomePage() {
  const features = [
    {
      icon: Sparkles,
      title: "AI Script Generator",
      description:
        "Create engaging scripts in seconds with our AI-powered writing assistant.",
    },
    {
      icon: Image,
      title: "Thumbnail Creator",
      description:
        "Design click-worthy thumbnails with AI-generated images and templates.",
    },
    {
      icon: Search,
      title: "SEO Tools",
      description:
        "Find trending keywords and optimize your videos for maximum reach.",
    },
    {
      icon: Video,
      title: "Video Editor",
      description:
        "Edit your videos in the browser with auto-captions and music.",
    },
    {
      icon: BarChart3,
      title: "Analytics Dashboard",
      description:
        "Track your growth with simple, actionable insights.",
    },
    {
      icon: FileText,
      title: "Content Calendar",
      description:
        "Plan and schedule your content with our drag-and-drop calendar.",
    },
  ];

  const testimonials = [
    {
      quote:
        "CreatorHub helped me go from 0 to 10K subscribers in just 3 months. The AI tools saved me hours every week!",
      author: "Alex Chen",
      role: "Tech Reviewer",
      avatar: "AC",
    },
    {
      quote:
        "Finally, one platform that does everything. No more switching between 5 different tools.",
      author: "Sarah Johnson",
      role: "Lifestyle Vlogger",
      avatar: "SJ",
    },
    {
      quote:
        "The thumbnail generator alone is worth the subscription. My CTR doubled overnight.",
      author: "Mike Roberts",
      role: "Gaming Creator",
      avatar: "MR",
    },
  ];

  const plans = [
    {
      name: "Free",
      price: "$0",
      features: [
        "3 scripts/month",
        "5 thumbnails/month",
        "Basic analytics",
        "Community support",
      ],
    },
    {
      name: "Pro",
      price: "$19",
      popular: true,
      features: [
        "Unlimited scripts",
        "Unlimited thumbnails",
        "300 min captions/month",
        "Advanced analytics",
        "Competitor analysis",
        "Priority support",
      ],
    },
    {
      name: "Team",
      price: "$49",
      features: [
        "Everything in Pro",
        "5 team members",
        "Unlimited captions",
        "API access",
        "Dedicated support",
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <Youtube className="h-5 w-5 text-white" />
              </div>
              <span className="font-bold text-lg">CreatorHub</span>
            </Link>
            <div className="flex items-center gap-4">
              <Link
                href="/login"
                className="text-sm font-medium text-foreground-secondary hover:text-foreground"
              >
                Sign In
              </Link>
              <Link
                href="/signup"
                className="inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark transition-colors"
              >
                Get Started Free
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
            <Sparkles className="h-4 w-4" />
            AI-Powered YouTube Growth Platform
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-6">
            From Idea to Upload,{" "}
            <span className="text-primary">All in One Place</span>
          </h1>
          <p className="text-lg sm:text-xl text-foreground-secondary max-w-2xl mx-auto mb-8">
            The all-in-one platform for YouTube creators. Generate scripts,
            create thumbnails, optimize SEO, and grow your channel faster with
            AI.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/signup"
              className="inline-flex items-center justify-center rounded-lg bg-primary px-6 py-3 text-base font-medium text-white hover:bg-primary-dark transition-colors gap-2"
            >
              Start Creating for Free
              <ArrowRight className="h-5 w-5" />
            </Link>
            <Link
              href="#features"
              className="inline-flex items-center justify-center rounded-lg border border-border px-6 py-3 text-base font-medium hover:bg-surface-hover transition-colors"
            >
              See How It Works
            </Link>
          </div>
          <p className="text-sm text-foreground-tertiary mt-4">
            No credit card required. Start with our free plan.
          </p>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 bg-background-secondary">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Everything You Need to Succeed
            </h2>
            <p className="text-foreground-secondary max-w-2xl mx-auto">
              Stop juggling multiple tools. CreatorHub gives you everything to
              create, optimize, and grow your YouTube channel.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="p-6 rounded-xl bg-surface border border-border hover:border-primary/50 transition-colors"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 mb-4">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-foreground-secondary">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Loved by Creators
            </h2>
            <p className="text-foreground-secondary">
              Join thousands of creators who are growing faster with CreatorHub
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((testimonial) => (
              <div
                key={testimonial.author}
                className="p-6 rounded-xl bg-surface border border-border"
              >
                <div className="flex gap-1 mb-4">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className="h-5 w-5 text-warning fill-warning"
                    />
                  ))}
                </div>
                <p className="text-foreground-secondary mb-4">
                  &ldquo;{testimonial.quote}&rdquo;
                </p>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-white font-medium">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <p className="font-medium">{testimonial.author}</p>
                    <p className="text-sm text-foreground-tertiary">
                      {testimonial.role}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 px-4 bg-background-secondary">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-foreground-secondary">
              Start free, upgrade when you&apos;re ready
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`p-6 rounded-xl border ${
                  plan.popular
                    ? "bg-surface border-primary ring-2 ring-primary/20"
                    : "bg-surface border-border"
                }`}
              >
                {plan.popular && (
                  <div className="text-center mb-4">
                    <span className="inline-block px-3 py-1 rounded-full bg-primary text-white text-sm font-medium">
                      Most Popular
                    </span>
                  </div>
                )}
                <h3 className="text-xl font-semibold text-center">{plan.name}</h3>
                <p className="text-3xl font-bold text-center mt-2">
                  {plan.price}
                  <span className="text-sm font-normal text-foreground-secondary">
                    /month
                  </span>
                </p>
                <ul className="mt-6 space-y-3">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2">
                      <Check className="h-5 w-5 text-success flex-shrink-0" />
                      <span className="text-sm text-foreground-secondary">
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>
                <Link
                  href="/signup"
                  className={`mt-6 block w-full text-center py-3 rounded-lg font-medium transition-colors ${
                    plan.popular
                      ? "bg-primary text-white hover:bg-primary-dark"
                      : "border border-border hover:bg-surface-hover"
                  }`}
                >
                  Get Started
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Ready to Grow Your Channel?
          </h2>
          <p className="text-foreground-secondary mb-8 max-w-2xl mx-auto">
            Join thousands of creators who are using CreatorHub to create better
            content and grow faster.
          </p>
          <Link
            href="/signup"
            className="inline-flex items-center justify-center rounded-lg bg-primary px-8 py-4 text-lg font-medium text-white hover:bg-primary-dark transition-colors gap-2"
          >
            Start Creating for Free
            <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 border-t border-border">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <Youtube className="h-5 w-5 text-white" />
              </div>
              <span className="font-bold">CreatorHub</span>
            </div>
            <div className="flex items-center gap-6 text-sm text-foreground-secondary">
              <Link href="/terms" className="hover:text-foreground">
                Terms
              </Link>
              <Link href="/privacy" className="hover:text-foreground">
                Privacy
              </Link>
              <Link href="/contact" className="hover:text-foreground">
                Contact
              </Link>
            </div>
            <p className="text-sm text-foreground-tertiary">
              &copy; 2024 CreatorHub. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
