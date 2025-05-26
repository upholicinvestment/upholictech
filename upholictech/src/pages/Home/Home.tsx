import Navbar from '../../../src/components/layout/Navbar/Navbar';
import ChartMapping from '../ChartMapping/ChartMapping';
import PriceScroll from '../PriceScroll/PriceScroll';

const Home = () => {
  return (
    <>
      <Navbar />

      {/* Fixed PriceScroll */}
      <div className="fixed top-16 left-0 w-full z-10">
        <PriceScroll />
      </div>
      
      {/* Rest of the page */}
      <div className="pt-40">
        <ChartMapping />
      </div>
    </>
  );
};

export default Home;
