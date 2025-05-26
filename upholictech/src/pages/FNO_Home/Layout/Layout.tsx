import Navbar from "../../../components/layout/Navbar/Navbar"
import PriceScroll from "../../PriceScroll/PriceScroll"
import FNO_stock from "../FNO_Stock/FNO_stock"

const Layout = () => {
    return (
        <>
            <Navbar />

            <div className="fixed top-16 left-0 w-full z-10">
                <PriceScroll />
            </div>

            {/* Adjusted pt-40 to a smaller value that fits your needs */}
            <div className="pt-[147px]">  {/* or use pt-[72px] if you need precise control */}
                <FNO_stock/>
            </div>
        </>
    )
}

export default Layout