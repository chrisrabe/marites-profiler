import type { NextPage } from "next";
import SEO from "components/common/SEO";
import Profiler from "modules/Profiler";

const ProfilerPage: NextPage = () => {
  return (
    <div>
      <SEO
        title="Marites News"
        description="News for all Marites people. Demo site for the Tigergraph hackathon challenge."
      />
      <main>
        <Profiler />
      </main>
    </div>
  );
};

export default ProfilerPage;
