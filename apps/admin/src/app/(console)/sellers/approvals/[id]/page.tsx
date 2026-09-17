import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { SellerApplicationReviewPage } from '@/components/sellers/seller-application-review-page';
import { getSellerApplication } from '@/lib/mock-data/seller-approvals';

type ReviewRouteProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: ReviewRouteProps): Promise<Metadata> {
  const { id } = await params;
  const application = getSellerApplication(id);
  return {
    title: application ? `Review ${application.name}` : 'Seller Application',
  };
}

export default async function SellerApplicationReviewRoute({ params }: ReviewRouteProps) {
  const { id } = await params;
  const application = getSellerApplication(id);
  if (!application) {
    notFound();
  }
  return <SellerApplicationReviewPage application={application} />;
}
