import type { NextPage } from "next";
import SEO from "components/common/SEO";
import GeneralNews from "modules/GeneralNews";

const Home: NextPage = () => {
  return (
    <div>
      <SEO
        title="Marites News"
        description="News for all Marites people. Demo site for the Tigergraph hackathon challenge."
      />
      <main>
        <GeneralNews />
      </main>
    </div>
  );
};

export default Home;
