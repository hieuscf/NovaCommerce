import Link from 'next/link';
import { ArrowRight, Bot, Search, Wand2 } from 'lucide-react';
import { Button } from '@novacommerce/ui/components/button';
import { Card } from '@novacommerce/ui/components/card';
import { Container } from '@novacommerce/ui/components/container';

const capabilities = [
  {
    icon: Search,
    title: 'Semantic Search',
    description: 'Find products by intent, not just keywords — powered by OpenSearch.',
  },
  {
    icon: Wand2,
    title: 'Smart Recommendations',
    description: 'Personalized suggestions based on browsing behavior and preferences.',
  },
  {
    icon: Bot,
    title: 'AI Shopping Assistant',
    description: 'Get expert guidance through our intelligent commerce chatbot.',
  },
];

export function AiDiscoverySection() {
  return (
    <section className="bg-background py-14 lg:py-20">
      <Container>
        <div className="mx-auto mb-10 max-w-2xl text-center">
          <p className="text-sm font-medium text-primary">AI-First Commerce</p>
          <h2 className="mt-2 text-h2 font-bold tracking-tight text-foreground">
            Intelligent product discovery
          </h2>
          <p className="mt-3 text-muted-foreground">
            NovaCommerce augments shopping with AI — never replacing the trust and clarity
            you expect from premium e-commerce.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          {capabilities.map(({ icon: Icon, title, description }) => (
            <Card key={title} className="border-border/80 bg-surface p-6 transition-shadow hover:shadow-md">
              <div className="mb-4 flex size-12 items-center justify-center rounded-2xl bg-accent-soft text-primary">
                <Icon className="size-5" strokeWidth={1.75} />
              </div>
              <h3 className="font-semibold text-foreground">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{description}</p>
            </Card>
          ))}
        </div>

        <div className="mt-8 text-center">
          <Button asChild variant="secondary">
            <Link href="/shop">
              Explore with AI
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>
      </Container>
    </section>
  );
}
