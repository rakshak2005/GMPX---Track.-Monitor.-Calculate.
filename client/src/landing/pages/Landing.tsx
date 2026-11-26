import { Story } from '../sections/Story';
import { DashboardStage } from '../sections/StoryStages';
import { Solutions } from '../sections/Solutions';
import { StatsSection } from '../sections/StatsSection';
import { LiveMarketPreview } from '../sections/LiveMarketPreview';
import { FinalCTA } from '../sections/FinalCTA';
import { useMediaQuery } from '../hooks/useEnvironment';

export function Landing() {
  const isMobile = useMediaQuery('(max-width: 820px)');

  return (
    <>
      <Story />
      {isMobile && <DashboardStage standalone />}
      <Solutions />
      <StatsSection />
      <LiveMarketPreview />
      <FinalCTA />
    </>
  );
}
