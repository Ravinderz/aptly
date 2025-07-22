import NoticeSection from "@/components/NoticeSection";
import QuickActions from "@/components/QuickActions";
import SocietyOverview from "@/components/SocietyOverview";
import Header from "@/components/ui/Header";
import UpcomingVisitorSection from "@/components/UpcomingVisitorSection";

export default function HomePage() {
  return (
    <Header>
      <NoticeSection />
      <UpcomingVisitorSection />
      <QuickActions />
      <SocietyOverview />
    </Header>
  );
}