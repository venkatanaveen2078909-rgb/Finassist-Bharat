import {
  Landmark,
  CreditCard,
  PiggyBank,
  TrendingUp,
  Home,
  Car,
  ShieldCheck,
  Wallet,
} from "lucide-react";

const bankingCategories = [
  {
    id: 1,
    title: "Savings",
    description: "Manage savings accounts and deposits.",
    icon: PiggyBank,
    color: "from-cyan-500 to-blue-500",
  },
  {
    id: 2,
    title: "Credit Cards",
    description: "Card offers, rewards and billing.",
    icon: CreditCard,
    color: "from-purple-500 to-pink-500",
  },
  {
    id: 3,
    title: "Home Loans",
    description: "EMI, eligibility and home financing.",
    icon: Home,
    color: "from-orange-500 to-red-500",
  },
  {
    id: 4,
    title: "Vehicle Loans",
    description: "Finance your dream vehicle.",
    icon: Car,
    color: "from-green-500 to-emerald-500",
  },
  {
    id: 5,
    title: "Investments",
    description: "Grow your wealth wisely.",
    icon: TrendingUp,
    color: "from-indigo-500 to-blue-500",
  },
  {
    id: 6,
    title: "Fixed Deposits",
    description: "Safe and secure investment plans.",
    icon: Landmark,
    color: "from-yellow-500 to-orange-500",
  },
  {
    id: 7,
    title: "Insurance",
    description: "Protect what matters most.",
    icon: ShieldCheck,
    color: "from-emerald-500 to-teal-500",
  },
  {
    id: 8,
    title: "Financial Planning",
    description: "Plan your future confidently.",
    icon: Wallet,
    color: "from-pink-500 to-rose-500",
  },
];

export default bankingCategories;