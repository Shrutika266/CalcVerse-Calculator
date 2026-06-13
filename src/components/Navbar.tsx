import { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Calculator, 
  Coins, 
  Percent, 
  Scale, 
  CalendarRange, 
  Scissors, 
  Activity, 
  Cpu, 
  Layers, 
  Zap, 
  Thermometer, 
  Clock, 
  HardDrive, 
  Square,
  Search,
  BookOpen,
  Droplet,
  LifeBuoy,
  FileText,
  User,
  ExternalLink,
  DollarSign,
  TrendingUp,
  Columns,
  PiggyBank,
  BarChart3,
  LineChart as LineChartIcon,
  ScatterChart,
} from 'lucide-react';
import { ActiveTab } from '../types';

interface NavbarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  prevTab?: ActiveTab | null;
}

interface HubItem {
  id: ActiveTab;
  title: string;
  desc: string;
  category: 'core' | 'finance' | 'health' | 'units';
  icon: any;
  color: string;
}

export default function Navbar({ activeTab, setActiveTab, prevTab }: NavbarProps) {
  const [search, setSearch] = useState('');

  const hubItems: HubItem[] = [
    {
      id: 'conv_curr',
      title: 'Currency Converter',
      desc: 'Live exchange rates & regional state compare',
      category: 'finance',
      icon: Coins,
      color: 'from-emerald-400 to-teal-600',
    },
    {
      id: 'calc_gst',
      title: 'GST Tax Calculator',
      desc: 'CGST, SGST breakdown & tax toggles',
      category: 'finance',
      icon: DollarSign,
      color: 'from-cyan-500 to-blue-600',
    },
    {
      id: 'calc_loan',
      title: 'Loan EMI Calculator',
      desc: 'Annual interest rates & monthly schedules',
      category: 'finance',
      icon: TrendingUp,
      color: 'from-blue-600 to-indigo-700',
    },
    {
      id: 'calc_percentage',
      title: 'Percentage Calculator',
      desc: 'X% of Y, percentage change & ratios',
      category: 'finance',
      icon: Percent,
      color: 'from-orange-400 to-red-600',
    },
    {
      id: 'calc_compound',
      title: 'Compound Interest',
      desc: 'Future value & earned interest calculator',
      category: 'finance',
      icon: TrendingUp,
      color: 'from-cyan-500 to-blue-600',
    },
    {
      id: 'calc_investment',
      title: 'Investment Calculator',
      desc: 'Monthly contributions & total returns',
      category: 'finance',
      icon: PiggyBank,
      color: 'from-pink-500 to-rose-600',
    },
    {
      id: 'calc_sip',
      title: 'SIP Calculator',
      desc: 'Systematic investment plan analyzer',
      category: 'finance',
      icon: BarChart3,
      color: 'from-green-500 to-emerald-600',
    },
    {
      id: 'calc_graph',
      title: 'Graph Plotter',
      desc: 'Visualize mathematical functions',
      category: 'units',
      icon: LineChartIcon,
      color: 'from-indigo-500 to-purple-600',
    },
    {
      id: 'calc_scientific_graph',
      title: 'Scientific Graph',
      desc: 'Plot scientific functions & CSV data',
      category: 'units',
      icon: ScatterChart,
      color: 'from-purple-500 to-pink-600',
    },
    {
      id: 'calc_academic',
      title: 'Academic Calculator',
      desc: 'CGPA, SGPA, SGPI and Percentage Conversion with Semester Performance Analysis',
      category: 'finance',
      icon: BookOpen,
      color: 'from-sky-500 to-indigo-600',
    },
    {
      id: 'calc_water_intake',
      title: 'Water Intake Calculator',
      desc: 'Daily hydration calculator based on weight, activity level and climate conditions',
      category: 'health',
      icon: Droplet,
      color: 'from-cyan-500 to-blue-600',
    },
    {
      id: 'conv_discount',
      title: 'Discount & Savings',
      desc: 'Retail discount percentages & tax additions',
      category: 'finance',
      icon: Scissors,
      color: 'from-red-400 to-pink-600',
    },
    {
      id: 'conv_bmi',
      title: 'BMI Health Metrics',
      desc: 'Body Mass calculation with diagnostic indicator',
      category: 'health',
      icon: Activity,
      color: 'from-pink-500 to-rose-600',
    },
    {
      id: 'conv_age',
      title: 'Smart Age Metric',
      desc: 'Lifetimes counts & exact birthday countdown',
      category: 'health',
      icon: User,
      color: 'from-fuchsia-400 to-violet-600',
    },
    {
      id: 'conv_date',
      title: 'Date Duration',
      desc: 'Exact duration gaps between two dates',
      category: 'health',
      icon: CalendarRange,
      color: 'from-yellow-500 to-amber-600',
    },
    {
      id: 'conv_num',
      title: 'Numeral Bases',
      desc: 'Decimal, binary, octal & hex formats',
      category: 'units',
      icon: Cpu,
      color: 'from-orange-500 to-amber-600',
    },
    {
      id: 'conv_area',
      title: 'Land Area Converter',
      desc: 'Sovereign yards, standard acres & hectares',
      category: 'units',
      icon: Square,
      color: 'from-teal-400 to-emerald-600',
    },
    {
      id: 'conv_length',
      title: 'Length/Distance',
      desc: 'Centimeters, meters, yards & miles',
      category: 'units',
      icon: Layers,
      color: 'from-sky-400 to-indigo-500',
    },
    {
      id: 'conv_mass',
      title: 'Mass & Weight',
      desc: 'Kilograms, imperial stones & carats',
      category: 'units',
      icon: Scale,
      color: 'from-amber-400 to-orange-500',
    },
    {
      id: 'conv_data',
      title: 'Data Storage',
      desc: 'Kilobytes, binary gigabytes & petabytes',
      category: 'units',
      icon: HardDrive,
      color: 'from-indigo-400 to-purple-600',
    },
    {
      id: 'conv_speed',
      title: 'Velocity Speed',
      desc: 'Kilometers/hour, cosmic light & standard mph',
      category: 'units',
      icon: Zap,
      color: 'from-orange-400 to-yellow-600',
    },
    {
      id: 'conv_temp',
      title: 'Temperature Formula',
      desc: 'Fahrenheit, Kelvin & Réaumur formula-scales',
      category: 'units',
      icon: Thermometer,
      color: 'from-red-400 to-orange-600',
    },
    {
      id: 'conv_time',
      title: 'Time Intervals',
      desc: 'Seconds, years & sub-picoseconds spans',
      category: 'units',
      icon: Clock,
      color: 'from-violet-500 to-indigo-600',
    },
    {
      id: 'conv_volume',
      title: 'Volume Capacity',
      desc: 'Liters, cubic inches, yards & ounces',
      category: 'units',
      icon: Layers,
      color: 'from-emerald-500 to-emerald-700',
    },
  ];

  const filteredItems = hubItems.filter((item) => {
    const term = search.toLowerCase();
    return (
      item.title.toLowerCase().includes(term) ||
      item.desc.toLowerCase().includes(term) ||
      item.category.toLowerCase().includes(term)
    );
  });

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-6" id="nav-hub-section">
      {activeTab === 'home' ? (
        <div className="space-y-8">
          
          {/* Main search and welcome hero block */}
          <div className="relative overflow-hidden bg-gradient-to-r from-slate-900 via-indigo-950 to-indigo-900 text-white rounded-3xl p-8 border border-indigo-500/10 shadow-xl">
            {/* Ambient glows */}
            <div className="absolute top-1/2 -translate-y-1/2 -right-12 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute top-0 left-1/4 w-60 h-60 bg-pink-500/5 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 max-w-2xl">
              <span className="bg-indigo-500/20 text-indigo-300 font-semibold text-xs tracking-wider uppercase px-3.5 py-1.5 rounded-full border border-indigo-400/10 inline-block mb-3">
                All-Inclusive Computing Deck
              </span>
              <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-3">
                Select your tool
              </h1>
              <p className="text-sm text-slate-300 leading-relaxed mb-6">
                Unified suite containing Standard, Scientific Math engine, GST, EMI Loan metrics, health indices, date difference, and binary numerical system converters.
              </p>

              {/* Dynamic search input */}
              <div className="relative max-w-md">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search 24 converters or calculators..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-white/10 dark:bg-black/20 text-white placeholder-slate-400 font-medium border border-white/10 focus:bg-white focus:text-slate-900 focus:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm outline-none"
                  id="tool-search-input"
                />
              </div>
            </div>
          </div>

          {/* Render Categories Cards Hub */}
          <div>
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold text-slate-800 dark:text-white text-base uppercase tracking-wider">
                Browse Suite Tab
              </h3>
              <span className="text-xs text-slate-500 font-medium">
                {filteredItems.length} options found
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredItems.map((item) => {
                const IconComponent = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className="flex text-left p-5 bg-white hover:bg-slate-100 dark:bg-[#0b132b] dark:hover:bg-[#121c3d] border border-slate-200 dark:border-blue-900/20 rounded-3xl transition-all hover:-translate-y-1 shadow-sm hover:shadow-md cursor-pointer group items-center space-x-4 h-full"
                    id={`hub-item-${item.id}`}
                  >
                    <div className={`p-4 rounded-2xl bg-gradient-to-br ${item.color} text-white shadow-md shadow-indigo-500/5`}>
                      <IconComponent className="w-6 h-6 shrink-0" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-[10px] text-indigo-600 dark:text-cyan-400 font-bold uppercase tracking-wider block mb-0.5">
                        {item.category}
                      </span>
                      <h4 className="font-extrabold text-slate-900 dark:text-white text-sm group-hover:text-indigo-600 dark:group-hover:text-cyan-300 transition-colors truncate">
                        {item.title}
                      </h4>
                      <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5 line-clamp-1 leading-normal font-medium">
                        {item.desc}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

        </div>
      ) : (
        /* Top Navigation back/links on active panels */
        <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800 mb-4 select-none">
          <button
            onClick={() => prevTab ? setActiveTab(prevTab) : setActiveTab('home')}
            className="flex items-center space-x-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 cursor-pointer"
            id="back-to-prev-link"
          >
            <span>←</span>
            <span>Back</span>
          </button>
          
          <div className="text-xs font-medium text-slate-400 dark:text-slate-500">
            Active view range
          </div>
        </div>
      )}
    </div>
  );
}
