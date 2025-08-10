import BillerSection from '@/components/BillerSection';
import NoticeSection from '@/components/NoticeSection';
import QuickActions from '@/components/QuickActions';
import { SocietyOverview } from '@/components/SocietyOverview';
import Header from '@/components/ui/Header';
import UpcomingVisitorSection from '@/components/UpcomingVisitorSection';

export default function HomePage() {
  return (
    <Header testID="home.screen">
      <NoticeSection testID="home.notices" />
      <UpcomingVisitorSection testID="home.upcoming-visitors" />
      <BillerSection testID="home.billers" />
      <QuickActions testID="home.quick-actions" />
      <SocietyOverview testID="home.society-overview" />
    </Header>
  );
}
