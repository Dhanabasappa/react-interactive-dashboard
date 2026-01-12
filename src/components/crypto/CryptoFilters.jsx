import { useMemo, useState, useCallback,useEffect } from "react";
import { motion } from "framer-motion";
import { Search, Filter } from "lucide-react";
import { debounce } from "../../utils/performance";

const categories = ["All","DeFi","AI","MetaVerse","Gaming","StableCoin"];
const sortOption = ["Market Cap ↓",
  "Market Cap ↑",
  "Price ↓",
  "Price ↑",
  "24h Change ↓",
  "24h Change ↑",];

  const CryptoFilters = ({data,setFiltered}) => {
    const [search,setSearch] = useState("");
    const [category,setCategory] = useState("All");
    const [sortValue,setSortValue] = useState("Market Cap ↓");

    // Memoize the filter function
    const applyFilters = useCallback(() => {
        let result = [...data];
        //search by name or symbol
        if(search){
            result = result.filter((coin) => 
                coin.name.toLowerCase().includes(search.toLowerCase()) || 
                coin.symbol.toLowerCase().includes(search.toLowerCase())
            );
        }
        //category filter if api supports category field
        if(category !== "All"){
            result = result.filter((coin) => coin.categories?.includes(category.toLowerCase()));
        }

        //sorting
        if(sortValue === "Market Cap ↓"){
            result = result.sort((a,b) => (b.market_cap || 0) - (a.market_cap || 0));
        }else if(sortValue === "Market Cap ↑"){
            result = result.sort((a,b) => (a.market_cap || 0) - (b.market_cap || 0));
        }else if(sortValue === "Price ↓"){
            result = result.sort((a,b) => b.current_price - a.current_price);
        }else if(sortValue === "Price ↑"){
            result = result.sort((a,b) => a.current_price - b.current_price);
        }else if(sortValue === "24h Change ↓"){
            result = result.sort((a,b) => (b.price_change_percentage_24h || 0) - (a.price_change_percentage_24h || 0));
        }else if(sortValue === "24h Change ↑"){
            result = result.sort((a,b) => (a.price_change_percentage_24h || 0) - (b.price_change_percentage_24h || 0));
        }

        setFiltered(result);
    },[data,search,category,sortValue,setFiltered]);

    // Create debounced version of applyFilters
    // eslint-disable-next-line react-hooks/exhaustive-deps
    const debouncedApplyFilters = useCallback(
        debounce(() => {
        applyFilters();
        }, 300),
        [applyFilters]
    );

    // Apply filters when dependencies change
    useEffect(() => {
        if (search) {
        // Use debounced version for search
        debouncedApplyFilters();
        } else {
        // Apply immediately for non-search filters
        applyFilters();
        }
    }, [search, category, sortValue, data, applyFilters, debouncedApplyFilters]);

    return(
        <motion.div 
            initial={{opacity:0,scale:0.95}} 
            animate={{opacity:1,scale:1}} 
            transition={{duration:0.4}}
            className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900 text-gray-900 dark:text-white p-6 rounded-xl border border-blue-200 dark:border-gray-700 shadow-lg flex flex-col gap-4 mb-6"
        >
            {/* Header */}
            <div className="flex items-center gap-2 mb-2">
                <Filter className="w-5 h-5 text-blue-600" />
                <h3 className="text-lg font-bold">Filters & Search</h3>
            </div>

            {/* Search */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input 
                    type="text" 
                    placeholder="Search by name or symbol (e.g., Bitcoin, BTC)..." 
                    value={search} 
                    onChange={(e) => { setSearch(e.target.value); debouncedApplyFilters();}} 
                    className="w-full pl-10 pr-4 py-2 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                />
                {search && (
                    <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-gray-400">
                        Filtering...
                    </span>
                )}
            </div>
            
            {/* Category filters tags */}
            <div>
                <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2">Category</p>
                <div className="flex gap-2 flex-wrap">
                    {categories.map((cat) => (
                        <motion.button 
                            key={cat} 
                            onClick={() => {setCategory(cat); applyFilters();}}
                            whileHover={{scale:1.05}}
                            whileTap={{scale:0.95}}
                            className={`px-4 py-2 rounded-full font-medium transition ${
                                category === cat 
                                    ? "bg-blue-600 text-white shadow-lg" 
                                    : "bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:border-blue-500"
                            }`}
                        >
                            {cat}
                        </motion.button>
                    ))}
                </div>
            </div>

            {/* Sort dropdown */}
            <div>
                <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2">Sort By</p>
                <select 
                    value={sortValue} 
                    onChange={(e) => {setSortValue(e.target.value); applyFilters();}}
                    className="w-full px-4 py-2 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                >
                    {sortOption.map((item) => (
                        <option key={item}>{item}</option>
                    ))}
                </select>
            </div>
        </motion.div>
    );
  };

  export default CryptoFilters;